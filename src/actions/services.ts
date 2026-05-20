"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PriceUnit } from "@/types/database";

type ActionState = { error: string } | null;

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return user && adminEmails.includes(user.email?.toLowerCase() ?? "");
}

function extractFields(formData: FormData) {
  const nameEn = (formData.get("name_en") as string)?.trim();
  const name = {
    en: nameEn,
    es: (formData.get("name_es") as string)?.trim() || nameEn,
    fr: (formData.get("name_fr") as string)?.trim() || nameEn,
    de: (formData.get("name_de") as string)?.trim() || nameEn,
    it: (formData.get("name_it") as string)?.trim() || nameEn,
  };
  const descEn = (formData.get("desc_en") as string)?.trim() || null;
  const description = descEn ? {
    en: descEn,
    es: (formData.get("desc_es") as string)?.trim() || descEn,
    fr: (formData.get("desc_fr") as string)?.trim() || descEn,
    de: (formData.get("desc_de") as string)?.trim() || descEn,
    it: (formData.get("desc_it") as string)?.trim() || descEn,
  } : null;
  const priceUnit = formData.get("price_unit") as string;
  const minH = formData.get("min_duration_hours") as string;
  const maxH = formData.get("max_duration_hours") as string;
  return {
    name,
    nameEn,
    description,
    category_id:         formData.get("category_id") as string,
    base_price:          parseFloat(formData.get("base_price") as string),
    price_unit:          priceUnit as PriceUnit,
    min_duration_hours:  priceUnit === "per_hour" && minH ? parseFloat(minH) : null,
    max_duration_hours:  priceUnit === "per_hour" && maxH ? parseFloat(maxH) : null,
    requires_scheduling: formData.get("requires_scheduling") === "on",
    sort_order:          parseInt((formData.get("sort_order") as string) || "0"),
  };
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!await verifyAdmin()) return { error: "Unauthorized" };

  const locale  = (formData.get("locale") as string) || "en";
  const fields  = extractFields(formData);
  if (!fields.nameEn)         return { error: "English name is required." };
  if (!fields.category_id)    return { error: "Please select a category." };
  if (isNaN(fields.base_price)) return { error: "Enter a valid price." };

  const db   = createAdminClient();
  const slug = slugify(fields.nameEn);

  const { error } = await db.from("services").insert({
    slug,
    name:               fields.name,
    description:        fields.description,
    category_id:        fields.category_id,
    base_price:         fields.base_price,
    price_unit:         fields.price_unit,
    min_duration_hours: fields.min_duration_hours,
    max_duration_hours: fields.max_duration_hours,
    requires_scheduling: fields.requires_scheduling,
    sort_order:         fields.sort_order,
    is_active:          true,
  });

  if (error) {
    if (error.code === "23505") return { error: "A service with that name already exists." };
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin/services", "page");
  redirect(`/${locale}/admin/services`);
}

export async function updateServiceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!await verifyAdmin()) return { error: "Unauthorized" };

  const locale    = (formData.get("locale") as string) || "en";
  const serviceId = formData.get("service_id") as string;
  const fields    = extractFields(formData);
  if (!fields.nameEn) return { error: "English name is required." };

  const db = createAdminClient();
  const { error } = await db.from("services").update({
    name:               fields.name,
    description:        fields.description,
    category_id:        fields.category_id,
    base_price:         fields.base_price,
    price_unit:         fields.price_unit,
    min_duration_hours: fields.min_duration_hours,
    max_duration_hours: fields.max_duration_hours,
    requires_scheduling: fields.requires_scheduling,
    sort_order:         fields.sort_order,
  }).eq("id", serviceId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/admin/services", "page");
  redirect(`/${locale}/admin/services`);
}

export async function toggleServiceActiveAction(
  serviceId: string,
  isActive: boolean
): Promise<{ error?: string } | null> {
  if (!await verifyAdmin()) return { error: "Unauthorized" };
  const db = createAdminClient();
  const { error } = await db
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/admin/services", "page");
  return null;
}
