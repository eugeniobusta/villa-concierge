"use client";

// Stripe's card form must live in the browser — it renders an iframe
// that communicates directly with Stripe servers. Card details NEVER
// touch your server. That's how PCI compliance works.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

// NEXT_PUBLIC_ vars are the only env vars safe to use in client components.
// Never import from @/lib/stripe here — that file uses STRIPE_SECRET_KEY
// which is undefined in the browser and would crash on import.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Props {
  clientSecret: string;
  bookingId: string;
  locale: string;
  token: string;
  returnUrl: string;
}

// Inner component — must be inside <Elements> to use useStripe/useElements
function CheckoutForm({ returnUrl }: { returnUrl: string }) {
  const stripe   = useStripe();
  const elements = useElements();
  const t        = useTranslations("guest.payment");
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // confirmPayment sends the card details directly to Stripe (not your server).
    // On success, Stripe redirects to returnUrl with ?payment_intent=... appended.
    // On failure, it returns an error object — we show it inline.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // confirmPayment only returns here if there's an error.
    // On success the browser navigates to returnUrl automatically.
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* PaymentElement renders Stripe's hosted card input — supports cards,
          Apple Pay, Google Pay automatically depending on the browser */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <PaymentElement />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? t("processing") : t("payNow")}
      </Button>

      <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1">
        <span>🔒</span> {t("secured")}
      </p>
    </form>
  );
}

// Outer component — provides the Stripe context with the client_secret
export default function StripePaymentForm({ clientSecret, returnUrl }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary:    "#b45309", // amber-700 to match the app
            borderRadius:    "12px",
            fontFamily:      "var(--font-sans)",
          },
        },
      }}
    >
      <CheckoutForm returnUrl={returnUrl} />
    </Elements>
  );
}
