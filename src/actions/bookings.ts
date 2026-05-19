"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSession } from "@/lib/guest-session";
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

  // Re-validate the token server-side — never trust the client to have done it
  const session = await getActiveSession(token);
  if (!session) return { error: "Your stay access has expired." };

  if (!providerServiceId || !bookingDate) {
    return { error: "Please select a service, provider, date and time." };
  }

  const db = createAdminClient();

  // Fetch provider_service, then the related service and provider separately.
  // Nested joins (providers(field)) require Relationships in the DB type —
  // we use flat queries instead to keep types simple.
  const { data: ps } = await db
    .from("provider_services")
    .select("*")
    .eq("id", providerServiceId)
    .single();

  if (!ps) return { error: "Service no longer available." };

  const [{ data: service }, { data: provider }] = await Promise.all([
    db.from("services").select("base_price, price_unit").eq("id", ps.service_id).single(),
    db.from("providers").select("commission_rate").eq("id", ps.provider_id).single(),
  ]);

  if (!service || !provider) return { error: "Service data unavailable." };

  const unitPrice = ps.custom_price ?? service.base_price;

  // Calculate total based on price_unit
  let totalAmount: number;
  let endTime: string | null = null;

  if (service.price_unit === "per_hour" && durationHours > 0) {
    totalAmount = unitPrice * durationHours;
    // Compute end_time from start_time + duration
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
    guest_session_id:    session.id,
    provider_service_id: providerServiceId,
    booking_date:        bookingDate,
    start_time:          startTime || null,
    end_time:            endTime,
    special_requests:    notes,
    status:              "pending",
    total_amount:        totalAmount,
    provider_amount:     providerAmount,
    platform_amount:     platformAmount,
    stripe_payment_status: "pending",
  });

  if (error) return { error: error.message };

  redirect(`/${locale}/stay/${token}/bookings`);
}
