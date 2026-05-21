"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionState = { error: string } | null;

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!(user && adminEmails.includes(user.email?.toLowerCase() ?? ""));
}

export async function createProviderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const bio_en = (formData.get("bio_en") as string)?.trim() || null;
  const commission_str = formData.get("commission_rate") as string;
  const serviceIds = formData.getAll("service_ids") as string[];

  if (!await verifyAdmin()) return { error: "Unauthorized." };
  if (!name) return { error: "Provider name is required." };

  const commission_rate = parseFloat(commission_str) / 100;
  if (isNaN(commission_rate) || commission_rate <= 0 || commission_rate > 1) {
    return { error: "Commission rate must be between 1 and 100." };
  }

  const supabase = createAdminClient();

  const bio = bio_en ? { en: bio_en, es: bio_en, fr: bio_en, de: bio_en, it: bio_en } : null;

  const { data: provider, error } = await supabase
    .from("providers")
    .insert({ name, email, phone, bio, commission_rate })
    .select("id")
    .single();

  if (error || !provider) {
    return { error: error?.message ?? "Failed to create provider." };
  }

  // Link the provider to their selected services
  if (serviceIds.length > 0) {
    const links = serviceIds.map((service_id) => ({
      provider_id: provider.id,
      service_id,
    }));
    await supabase.from("provider_services").insert(links);
  }

  redirect(`/${locale}/admin/providers/${provider.id}`);
}

export async function updateProviderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const bio_en = (formData.get("bio_en") as string)?.trim() || null;
  const commission_str = formData.get("commission_rate") as string;
  const serviceIds = formData.getAll("service_ids") as string[];
  const is_active = formData.get("is_active") === "true";

  if (!await verifyAdmin()) return { error: "Unauthorized." };
  if (!name) return { error: "Provider name is required." };

  const commission_rate = parseFloat(commission_str) / 100;
  if (isNaN(commission_rate) || commission_rate <= 0 || commission_rate > 1) {
    return { error: "Commission rate must be between 1 and 100." };
  }

  const supabase = createAdminClient();
  const bio = bio_en ? { en: bio_en, es: bio_en, fr: bio_en, de: bio_en, it: bio_en } : null;

  const { error } = await supabase
    .from("providers")
    .update({ name, email, phone, bio, commission_rate, is_active })
    .eq("id", id);

  if (error) return { error: error.message };

  // Replace service links: delete all, re-insert selected
  await supabase.from("provider_services").delete().eq("provider_id", id);
  if (serviceIds.length > 0) {
    await supabase.from("provider_services").insert(
      serviceIds.map((service_id) => ({ provider_id: id, service_id }))
    );
  }

  revalidatePath(`/${locale}/admin/providers`);
  redirect(`/${locale}/admin/providers/${id}`);
}

export async function toggleProviderAction(id: string, isActive: boolean, locale: string) {
  if (!await verifyAdmin()) return;
  const supabase = createAdminClient();
  await supabase.from("providers").update({ is_active: !isActive }).eq("id", id);
  revalidatePath(`/${locale}/admin/providers`);
}
