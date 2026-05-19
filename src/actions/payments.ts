"use server";

// A PaymentIntent is Stripe's object representing "I intend to charge X euros".
// Creating one does NOT charge the card — it just reserves the intent.
// The actual charge happens when the guest confirms in the Stripe card form.

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSession } from "@/lib/guest-session";
import { redirect } from "next/navigation";

export async function createPaymentIntentAction(formData: FormData) {
  const locale    = (formData.get("locale") as string) || "en";
  const token     = formData.get("token") as string;
  const bookingId = formData.get("booking_id") as string;

  const errUrl = (msg: string) =>
    `/${locale}/stay/${token}/bookings?error=${encodeURIComponent(msg)}`;

  const session = await getActiveSession(token);
  if (!session) redirect(errUrl("Your stay access has expired."));

  const db = createAdminClient();
  const { data: booking } = await db
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("guest_session_id", session.id)
    .single();

  if (!booking) redirect(errUrl("Booking not found."));
  if (booking.stripe_payment_status === "paid") {
    redirect(`/${locale}/stay/${token}/bookings`);
  }

  // Convert euros to cents — Stripe always works in smallest currency unit
  const amountCents = Math.round(booking.total_amount * 100);

  // Create or reuse an existing PaymentIntent for this booking.
  // If the guest navigates away and comes back, we reuse the same intent
  // rather than creating duplicates.
  let paymentIntentId = booking.stripe_payment_intent_id;
  let clientSecret: string;

  if (paymentIntentId) {
    // Reuse existing intent (guest came back to the payment page)
    const existing = await stripe.paymentIntents.retrieve(paymentIntentId);
    clientSecret = existing.client_secret!;
  } else {
    // Create a new PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: "eur",
      metadata: {
        booking_id:       bookingId,
        guest_session_id: session.id,
        guest_name:       session.guest_name,
      },
    });

    paymentIntentId = intent.id;
    clientSecret    = intent.client_secret!;

    // Save the intent ID to the booking — the webhook will look it up later
    await db
      .from("bookings")
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq("id", bookingId);
  }

  // Redirect to the payment page, passing the client_secret as a search param.
  // The client_secret is safe to put in the URL — it can only be used to
  // complete THIS specific payment, not to read any account data.
  redirect(
    `/${locale}/stay/${token}/pay/${bookingId}?client_secret=${clientSecret}`
  );
}
