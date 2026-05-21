"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getActiveSession } from "@/lib/guest-session";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BookingStatus } from "@/types/database";
import {
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
} from "@/lib/emails";
import { getProviderSession } from "@/lib/provider-session";
import { stripe } from "@/lib/stripe";

type BookingCreated = { clientSecret: string; bookingId: string; total: number };
type ActionState = { error: string } | BookingCreated | null;

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
  const notes            = ((formData.get("notes") as string)?.trim() || null)?.slice(0, 1000) ?? null;

  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations({ locale, namespace: "guest.booking" }),
  ]);
  if (!session) return { error: "Your stay access has expired." };

  if (!providerServiceId || !bookingDate) {
    return { error: "Please select a service, provider, date and time." };
  }

  const todayServer = new Date().toISOString().split("T")[0];
  if (bookingDate < todayServer) {
    return { error: "Booking date cannot be in the past." };
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
    db.from("services").select("base_price, price_unit, name").eq("id", ps.service_id).single(),
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

  const { data: newBooking, error } = await db.from("bookings").insert({
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
  }).select("id").single();

  if (error || !newBooking) return { error: error?.message ?? "Failed to create booking." };

  // Create a manual-capture PaymentIntent — card is authorized now, charged only on accept
  const intent = await stripe.paymentIntents.create({
    amount:         Math.round(totalAmount * 100),
    currency:       "eur",
    capture_method: "manual",   // ← hold, don't charge
    metadata: {
      booking_id:       newBooking.id,
      guest_session_id: session.id,
      guest_name:       session.guest_name,
    },
  });

  await db
    .from("bookings")
    .update({ stripe_payment_intent_id: intent.id })
    .eq("id", newBooking.id);

  // Emails are sent from the Stripe webhook once the card is actually authorized
  // (payment_intent.amount_capturable_updated), so we know the booking is real.

  return {
    clientSecret: intent.client_secret!,
    bookingId:    newBooking.id,
    total:        totalAmount,
  };
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
    .update({ status: "cancelled", cancelled_by: "guest" })
    .eq("id", bookingId)
    .eq("guest_session_id", session.id)
    .in("status", ["pending", "confirmed"]);

  redirect(`/${locale}/stay/${token}/bookings`);
}

const VALID_STATUSES: BookingStatus[] = [
  "pending", "confirmed", "in_progress", "completed", "cancelled",
];

export async function updateBookingStatusAction(
  bookingId: string,
  newStatus: BookingStatus
): Promise<{ error?: string } | null> {
  // Verify the caller is a logged-in admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    return { error: "Unauthorized" };
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    return { error: "Invalid status value." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("bookings")
    .update({
      status: newStatus,
      ...(newStatus === "cancelled" ? { cancelled_by: "admin" } : {}),
    })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  // When admin manually confirms, notify the guest
  if (newStatus === "confirmed") {
    const { data: booking } = await db
      .from("bookings")
      .select("guest_session_id, provider_service_id, booking_date, start_time, total_amount")
      .eq("id", bookingId)
      .single();

    if (booking) {
      const [{ data: session }, { data: ps }] = await Promise.all([
        db.from("guest_sessions").select("guest_name, guest_email, access_token").eq("id", booking.guest_session_id).single(),
        db.from("provider_services").select("service_id").eq("id", booking.provider_service_id).single(),
      ]);

      if (session?.guest_email && ps) {
        const { data: service } = await db
          .from("services")
          .select("name")
          .eq("id", ps.service_id)
          .single();

        const serviceName = service ? (service.name as Record<string, string>).en : "Service";

        await sendBookingConfirmedEmail({
          guestName:   session.guest_name,
          guestEmail:  session.guest_email,
          serviceName,
          bookingDate: booking.booking_date,
          startTime:   booking.start_time,
          totalAmount: booking.total_amount,
          accessToken: session.access_token,
        });
      }
    }
  }

  revalidatePath("/[locale]/admin/bookings", "page");
  return null;
}

// ── Shared helper: fetch booking details needed for provider emails ──────────
async function getBookingEmailData(bookingId: string) {
  const db = createAdminClient();
  const { data: booking } = await db
    .from("bookings")
    .select("guest_session_id, provider_service_id, booking_date, start_time, total_amount")
    .eq("id", bookingId)
    .single();
  if (!booking) return null;

  const [{ data: session }, { data: ps }] = await Promise.all([
    db.from("guest_sessions").select("guest_name, guest_email, access_token").eq("id", booking.guest_session_id).single(),
    db.from("provider_services").select("service_id").eq("id", booking.provider_service_id).single(),
  ]);
  if (!session?.guest_email || !ps) return null;

  const { data: service } = await db.from("services").select("name").eq("id", ps.service_id).single();
  const serviceName = service ? (service.name as Record<string, string>).en : "Service";

  return {
    guestName:   session.guest_name,
    guestEmail:  session.guest_email,
    serviceName,
    bookingDate: booking.booking_date,
    startTime:   booking.start_time,
    totalAmount: booking.total_amount,
    accessToken: session.access_token,
  };
}

export async function providerAcceptBookingAction(bookingId: string): Promise<void> {
  const provider = await getProviderSession();
  if (!provider) return;

  const db = createAdminClient();

  // Verify this booking belongs to this provider and is still pending
  const { data: booking } = await db
    .from("bookings")
    .select("id, status, provider_service_id, stripe_payment_intent_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.status !== "pending") return;

  const { data: ps } = await db
    .from("provider_services")
    .select("provider_id")
    .eq("id", booking.provider_service_id)
    .eq("provider_id", provider.id)
    .single();

  if (!ps) return;

  await db.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);

  // Capture the authorized hold — guest's card is charged now
  if (booking.stripe_payment_intent_id) {
    try {
      await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
      // The payment_intent.succeeded webhook fires next and sets stripe_payment_status: "paid"
      // + sends the booking confirmed email to the guest
    } catch (err) {
      // Capture failed (expired auth, card issue): revert status so admin is aware
      await db.from("bookings").update({ status: "pending" }).eq("id", bookingId);
      console.error("[stripe] Capture failed — booking reverted to pending:", bookingId, err);
    }
  }

  revalidatePath("/[locale]/provider/bookings", "page");
}

export async function providerDeclineBookingAction(bookingId: string): Promise<void> {
  const provider = await getProviderSession();
  if (!provider) return;

  const db = createAdminClient();

  const { data: booking } = await db
    .from("bookings")
    .select("id, status, provider_service_id, stripe_payment_intent_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.status !== "pending") return;

  const { data: ps } = await db
    .from("provider_services")
    .select("provider_id")
    .eq("id", booking.provider_service_id)
    .eq("provider_id", provider.id)
    .single();

  if (!ps) return;

  await db.from("bookings").update({ status: "cancelled", cancelled_by: "provider" }).eq("id", bookingId);

  // Release the card hold — guest is never charged
  if (booking.stripe_payment_intent_id) {
    try {
      await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
    } catch (err) {
      console.error("[stripe] Cancel failed for booking", bookingId, err);
    }
  }

  revalidatePath("/[locale]/provider/bookings", "page");

  const emailData = await getBookingEmailData(bookingId);
  if (emailData) await sendBookingDeclinedEmail(emailData);
}
