"use server";

// Server Actions for guest_sessions (stays).
// We use the admin client (service_role) because guest_sessions is
// protected by RLS — only service_role can write to it.

import { createAdminClient } from "@/lib/supabase/admin";
import { generateAccessToken } from "@/lib/token";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionState = { error: string } | null;

export async function createStayAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const guest_name = (formData.get("guest_name") as string)?.trim();
  const guest_email = (formData.get("guest_email") as string)?.trim() || null;
  const check_in = formData.get("check_in") as string;
  const check_out = formData.get("check_out") as string;
  const notes           = (formData.get("notes") as string)?.trim() || null;
  const welcome_message = (formData.get("welcome_message") as string)?.trim() || null;

  if (!guest_name || !check_in || !check_out) {
    return { error: "Guest name, check-in and check-out are required." };
  }
  if (check_out <= check_in) {
    return { error: "Check-out must be after check-in." };
  }

  // Generate tokens until we find a unique one (collision is extremely rare)
  const supabase = createAdminClient();
  let access_token = generateAccessToken();
  let attempts = 0;
  while (attempts < 5) {
    const { data } = await supabase
      .from("guest_sessions")
      .select("id")
      .eq("access_token", access_token)
      .single();
    if (!data) break;
    access_token = generateAccessToken();
    attempts++;
  }

  const { data: stay, error } = await supabase
    .from("guest_sessions")
    .insert({ guest_name, guest_email, check_in, check_out, notes, welcome_message, access_token })
    .select("id")
    .single();

  if (error || !stay) {
    return { error: error?.message ?? "Failed to create stay." };
  }

  redirect(`/${locale}/admin/stays/${stay.id}`);
}

export async function updateWelcomeMessageAction(
  stayId: string,
  message: string
): Promise<{ error?: string } | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("guest_sessions")
    .update({ welcome_message: message.trim() || null })
    .eq("id", stayId);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/admin/stays/[id]", "page");
  return null;
}

export async function deleteStayAction(id: string, locale: string) {
  const supabase = createAdminClient();
  await supabase.from("guest_sessions").delete().eq("id", id);
  revalidatePath(`/${locale}/admin/stays`);
  redirect(`/${locale}/admin/stays`);
}
