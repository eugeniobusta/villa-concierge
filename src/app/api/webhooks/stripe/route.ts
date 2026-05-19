// Stripe calls this URL when a payment event happens.
// This is the server-to-server communication that makes payments reliable —
// it fires even if the user closed the tab after paying.

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const intent = event.data.object;
    const bookingId = intent.metadata?.booking_id;

    if (bookingId) {
      await db
        .from("bookings")
        .update({
          stripe_payment_status: "paid",
          status:                "confirmed",
        })
        .eq("id", bookingId);
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
