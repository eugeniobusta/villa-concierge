"use client";

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
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  clientSecret: string;
  bookingId:    string;
  locale:       string;
  token:        string;
  returnUrl:    string;
  /** authorize = hold card, charge only on provider accept (default) */
  mode?:  "authorize" | "charge";
  total?: number;
}

function CheckoutForm({
  returnUrl,
  mode = "authorize",
  total,
}: {
  returnUrl: string;
  mode?: "authorize" | "charge";
  total?: number;
}) {
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

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
  }

  const buttonLabel = loading
    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{t("processing")}</span>
    : mode === "authorize"
      ? `Authorize ${total !== undefined ? `€${total.toFixed(2)}` : ""}`
      : t("payNow");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "authorize" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          Your card will be <span className="font-semibold text-foreground">held but not charged</span> until
          the provider confirms your request. If declined, the hold is released immediately.
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-5 shadow-warm-sm">
        <PaymentElement />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {buttonLabel}
      </Button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <span>🔒</span> {t("secured")}
      </p>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, returnUrl, mode, total }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#b45309",
            borderRadius: "12px",
            fontFamily:   "var(--font-sans)",
          },
        },
      }}
    >
      <CheckoutForm returnUrl={returnUrl} mode={mode} total={total} />
    </Elements>
  );
}
