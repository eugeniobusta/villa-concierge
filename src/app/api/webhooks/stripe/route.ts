// Stripe calls this URL when a payment event happens.
// This is the server-to-server communication that makes payments reliable —
// it fires even if the user closed the tab after paying.

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmedEmail } from "@/lib/emails";
import { NextRequest, NextResponse } from "next/server";

// Stripe requires the raw request body (not parsed JSON) to verify the signature.
// Next.js parses it by default, so we read it as text and re-verify.
export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    // constructEvent throws if the signature doesn't match — prevents fake webhooks
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const db = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const intent    = event.data.object;
    const bookingId = intent.metadata?.booking_id;

    if (bookingId) {
      await db
        .from("bookings")
        .update({ stripe_payment_status: "paid", status: "confirmed" })
        .eq("id", bookingId);

      // Fetch data needed for the confirmation email
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
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const bookingId = intent.metadata?.booking_id;

    if (bookingId) {
      await db
        .from("bookings")
        .update({ stripe_payment_status: "failed" })
        .eq("id", bookingId);
    }
  }

  // Always return 200 — if you return an error Stripe retries the webhook
  return NextResponse.json({ received: true });
}
