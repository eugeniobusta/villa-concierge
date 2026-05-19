"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSession } from "@/lib/guest-session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type ActionState = { error: string } | null;

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale           = (formData.get("locale") as string) || "en";
  const token            = formData.get("token") as string;
  const providerServiceId = formData.get("provider_service_id") as string;
  const bookingDate      = formData.get("booking_date") as string;
  const startTime        = formData.get("start_time") as string;
  const durationHours    = parseFloat((formData.get("duration_hours") as string) || "0");
  const notes            = (formData.get("notes") as string)?.trim() || null;

  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations({ locale, namespace: "guest.booking" }),
  ]);
  if (!session) return { error: "Your stay access has expired." };

  if (!providerServiceId || !bookingDate) {
    return { error: "Please select a service, provider, date and time." };
  }

  const db = createAdminClient();

  const { data: ps } = await db
    .from("provider_services")
    .select("*")
    .eq("id", providerServiceId)
    .single();

  if (!ps) return { error: "Service no longer available." };

  // Duplicate booking prevention: check if any active booking exists for this service + session
  const { data: allPsForService } = await db
    .from("provider_services")
    .select("id")
    .eq("service_id", ps.service_id);

  const allPsIds = (allPsForService ?? []).map((p) => p.id);

  const { data: existingBookings } = await db
    .from("bookings")
    .select("id")
    .eq("guest_session_id", session.id)
    .in("provider_service_id", allPsIds)
    .neq("status", "cancelled");

  if (existingBookings && existingBookings.length > 0) {
    return { error: t("duplicate") };
  }

  const [{ data: service }, { data: provider }] = await Promise.all([
    db.from("services").select("base_price, price_unit").eq("id", ps.service_id).single(),
    db.from("providers").select("commission_rate").eq("id", ps.provider_id).single(),
  ]);

  if (!service || !provider) return { error: "Service data unavailable." };

  const unitPrice = ps.custom_price ?? service.base_price;

  let totalAmount: number;
  let endTime: string | null = null;

  if (service.price_unit === "per_hour" && durationHours > 0) {
    totalAmount = unitPrice * durationHours;
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      const endH = h + Math.floor(durationHours);
      const endM = m + Math.round((durationHours % 1) * 60);
      endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    }
  } else {
    totalAmount = unitPrice;
  }

  const commissionRate = provider.commission_rate ?? 0.85;
  const providerAmount = parseFloat((totalAmount * commissionRate).toFixed(2));
  const platformAmount = parseFloat((totalAmount - providerAmount).toFixed(2));

  const { error } = await db.from("bookings").insert({
    guest_session_id:      session.id,
    provider_service_id:   providerServiceId,
    booking_date:          bookingDate,
    start_time:            startTime || null,
    end_time:              endTime,
    special_requests:      notes,
    status:                "pending",
    total_amount:          totalAmount,
    provider_amount:       providerAmount,
    platform_amount:       platformAmount,
    stripe_payment_status: "pending",
  });

  if (error) return { error: error.message };

  redirect(`/${locale}/stay/${token}/bookings`);
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const bookingId = formData.get("booking_id") as string;
  const token     = formData.get("token") as string;
  const locale    = (formData.get("locale") as string) || "en";

  const session = await getActiveSession(token);
  if (!session) return;

  const db = createAdminClient();

  // Only cancel if booking belongs to this session and hasn't started/completed
  await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("guest_session_id", session.id)
    .in("status", ["pending", "confirmed"]);

  redirect(`/${locale}/stay/${token}/bookings`);
}
