import { getActiveSession } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import StripePaymentForm from "@/components/guest/StripePaymentForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string; bookingId: string }>;
  searchParams: Promise<{ client_secret?: string }>;
}) {
  const { locale, token, bookingId } = await params;
  const { client_secret } = await searchParams;

  const session = await getActiveSession(token);
  if (!session) notFound();

  if (!client_secret) {
    // No client_secret means the user navigated here directly — redirect back
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-stone-400">Invalid payment session.</p>
        <Link href={`/${locale}/stay/${token}/bookings`} className="text-amber-600 text-sm hover:underline mt-2 block">
          View my bookings →
        </Link>
      </div>
    );
  }

  const db = createAdminClient();
  const { data: booking } = await db
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) notFound();

  // Fetch service name for the summary
  const { data: ps } = await db
    .from("provider_services")
    .select("service_id, provider_id")
    .eq("id", booking.provider_service_id)
    .single();

  const [{ data: service }, { data: provider }] = await Promise.all([
    ps ? db.from("services").select("name").eq("id", ps.service_id).single() : { data: null },
    ps ? db.from("providers").select("name").eq("id", ps.provider_id).single() : { data: null },
  ]);

  const serviceName = service ? (service.name as Record<string, string>).en : "Service";
  const providerName = provider?.name ?? "";

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/${locale}/stay/${token}/bookings`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">Complete Payment</h1>
        <p className="text-stone-400 text-sm">
          {serviceName}{providerName && ` · ${providerName}`}
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-stone-800">{serviceName}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {booking.booking_date}
              {booking.start_time && ` · ${booking.start_time.slice(0, 5)}`}
            </p>
          </div>
          <p className="text-xl font-semibold text-stone-900">
            €{booking.total_amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stripe card form — rendered client-side */}
      <StripePaymentForm
        clientSecret={client_secret}
        bookingId={bookingId}
        locale={locale}
        token={token}
        returnUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/${locale}/stay/${token}/bookings`}
      />
    </div>
  );
}
