// Stripe server-to-server webhook — fires even if the guest closed the tab.
// All email notifications and payment status updates happen here, not in
// server actions, so the action can return immediately without side effects.

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingReceivedEmail,
  sendBookingConfirmedEmail,
  sendAdminNewBookingEmail,
} from "@/lib/emails";
import { NextRequest, NextResponse } from "next/server";

// Fetch everything needed to send booking emails — reused across event handlers
async function getEmailData(bookingId: string) {
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

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const db = createAdminClient();

  // ── Idempotency: skip events we've already processed ──────────────────────
  // Stripe retries webhooks on network errors — this prevents duplicate emails
  // and double-captures. We store each processed event.id for 7 days.
  const { error: idempotencyError } = await db
    .from("stripe_webhook_events")
    .insert({ id: event.id });

  if (idempotencyError) {
    // Duplicate key = already processed → silently ack
    if (idempotencyError.code === "23505") {
      return NextResponse.json({ received: true });
    }
    // Any other error: log but continue (better to process twice than miss)
    console.error("[webhook] idempotency check failed:", idempotencyError.message);
  }

  // ── Card was authorized (hold placed, not yet charged) ─────────────────────
  // This fires after the guest successfully completes the card form.
  // We send the "booking received" emails here — not in the server action —
  // so we only notify when the booking is real (card is valid).
  if (event.type === "payment_intent.amount_capturable_updated") {
    const intent    = event.data.object;
    const bookingId = intent.metadata?.booking_id;
    if (bookingId) {
      const data = await getEmailData(bookingId);
      if (data) {
        await Promise.all([
          sendBookingReceivedEmail(data),
          sendAdminNewBookingEmail({
            guestName:   data.guestName,
            serviceName: data.serviceName,
            bookingDate: data.bookingDate,
            startTime:   data.startTime,
            totalAmount: data.totalAmount,
          }),
        ]);
      }
    }
  }

  // ── Payment captured (provider accepted → stripe.capture()) ────────────────
  if (event.type === "payment_intent.succeeded") {
    const intent    = event.data.object;
    const bookingId = intent.metadata?.booking_id;
    if (bookingId) {
      await db
        .from("bookings")
        .update({ stripe_payment_status: "paid" })
        .eq("id", bookingId);

      const data = await getEmailData(bookingId);
      if (data) await sendBookingConfirmedEmail(data);
    }
  }

  // ── Card declined or authorization failed ──────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const intent    = event.data.object;
    const bookingId = intent.metadata?.booking_id;
    if (bookingId) {
      await db
        .from("bookings")
        .update({ stripe_payment_status: "failed" })
        .eq("id", bookingId);
    }
  }

  // ── Intent cancelled (provider declined → stripe.cancel()) ─────────────────
  if (event.type === "payment_intent.canceled") {
    const intent    = event.data.object;
    const bookingId = intent.metadata?.booking_id;
    if (bookingId) {
      await db
        .from("bookings")
        .update({ stripe_payment_status: "failed" })
        .eq("id", bookingId);
    }
  }

  // Always return 200 — errors cause Stripe to retry the webhook
  return NextResponse.json({ received: true });
}
