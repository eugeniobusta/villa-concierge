"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getProviderSession } from "@/lib/provider-session";
import { revalidatePath } from "next/cache";

type SlotResult = { error: string } | null;

export async function addSlotAction(formData: FormData): Promise<SlotResult> {
  const provider = await getProviderSession();
  if (!provider) return { error: "Not authenticated as a provider." };

  const date      = formData.get("date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime   = formData.get("end_time") as string;

  if (!date || !startTime || !endTime) {
    return { error: "Date, start time and end time are required." };
  }
  if (endTime <= startTime) {
    return { error: "End time must be after start time." };
  }

  const { error } = await createAdminClient()
    .from("availability_slots")
    .insert({
      provider_id: provider.id,
      date,
      start_time:  startTime,
      end_time:    endTime,
      is_blocked:  false,
    });

  if (error) return { error: error.message };

  revalidatePath("/provider/availability");
  return null;
}

export async function deleteSlotAction(slotId: string): Promise<void> {
  const provider = await getProviderSession();
  if (!provider) return;

  // Verify the slot belongs to this provider before deleting
  await createAdminClient()
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("provider_id", provider.id); // security: can only delete own slots

  revalidatePath("/provider/availability");
}

type LinkState = { error: string } | { success: string } | null;

export async function linkProviderAccountAction(
  _prev: LinkState,
  formData: FormData
): Promise<LinkState> {
  const providerId    = formData.get("provider_id") as string;
  const providerEmail = (formData.get("provider_email") as string)?.trim().toLowerCase();

  if (!providerEmail) return { error: "Email is required." };

  const db = createAdminClient();

  // auth.admin.listUsers() requires the service_role key — only works server-side
  const { data: { users }, error } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (error) return { error: error.message };

  const match = users.find((u) => u.email?.toLowerCase() === providerEmail);
  if (!match) {
    return { error: `No Supabase account found for "${providerEmail}". Create one in Supabase Dashboard → Authentication → Users first.` };
  }

  await db.from("providers").update({ user_id: match.id }).eq("id", providerId);

  revalidatePath("/admin/providers");
  return { success: `Linked to ${match.email}` };
}
