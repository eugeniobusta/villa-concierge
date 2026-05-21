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

  const db = createAdminClient();

  // Reject if an existing slot overlaps this new one
  const { count } = await db
    .from("availability_slots")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("date", date)
    .eq("is_blocked", false)
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if ((count ?? 0) > 0) {
    return { error: "That time range overlaps an existing slot on this day." };
  }

  const { error } = await db
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

export async function bulkAddSlotsAction(
  dates: string[],
  startTime: string,
  endTime: string
): Promise<{ error: string } | { skipped: string[] } | null> {
  const provider = await getProviderSession();
  if (!provider) return { error: "Not authenticated as a provider." };
  if (!dates.length) return { error: "Select at least one day." };
  if (!startTime || !endTime) return { error: "Start and end time are required." };
  if (endTime <= startTime) return { error: "End time must be after start time." };

  const db = createAdminClient();

  // Check each date for overlapping slots
  // Two intervals overlap when: existing.start < newEnd AND existing.end > newStart
  const overlapChecks = await Promise.all(
    dates.map(async (date) => {
      const { count } = await db
        .from("availability_slots")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", provider.id)
        .eq("date", date)
        .eq("is_blocked", false)
        .lt("start_time", endTime)
        .gt("end_time", startTime);
      return { date, conflict: (count ?? 0) > 0 };
    })
  );

  const clearDates   = overlapChecks.filter((r) => !r.conflict).map((r) => r.date);
  const skippedDates = overlapChecks.filter((r) =>  r.conflict).map((r) => r.date);

  if (clearDates.length === 0) {
    return { error: "All selected days already have an overlapping slot. Remove the existing slot first." };
  }

  const rows = clearDates.map((date) => ({
    provider_id: provider.id,
    date,
    start_time:  startTime,
    end_time:    endTime,
    is_blocked:  false,
  }));

  const { error } = await db.from("availability_slots").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/provider/availability");
  return skippedDates.length > 0 ? { skipped: skippedDates } : null;
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
