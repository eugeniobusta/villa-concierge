import { getActiveSession, formatDate } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaymentIntentAction } from "@/actions/payments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-50 text-yellow-700",
  confirmed:   "bg-emerald-50 text-emerald-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed:   "bg-stone-100 text-stone-500",
  cancelled:   "bg-red-50 text-red-500",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:     "Pending",
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

export default async function MyBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, token } = await params;
  const { error: pageError } = await searchParams;
  const session = await getActiveSession(token);
  if (!session) notFound();

  const db = createAdminClient();

  const { data: bookings } = await db
    .from("bookings")
    .select("*")
    .eq("guest_session_id", session.id)
    .order("booking_date", { ascending: true });

  // Resolve service + provider names with flat queries
  const psIds = [...new Set((bookings ?? []).map((b) => b.provider_service_id))];
  const { data: psRows } = psIds.length
    ? await db.from("provider_services").select("id, service_id, provider_id").in("id", psIds)
    : { data: [] };

  const serviceIds = [...new Set((psRows ?? []).map((p) => p.service_id))];
  const providerIds2 = [...new Set((psRows ?? []).map((p) => p.provider_id))];

  const [{ data: serviceRows }, { data: providerRows }] = await Promise.all([
    serviceIds.length
      ? db.from("services").select("id, name").in("id", serviceIds)
      : { data: [] },
    providerIds2.length
      ? db.from("providers").select("id, name").in("id", providerIds2)
      : { data: [] },
  ]);

  function lookupNames(providerServiceId: string) {
    const ps = (psRows ?? []).find((p) => p.id === providerServiceId);
    const svc = ps ? (serviceRows ?? []).find((s) => s.id === ps.service_id) : null;
    const prov = ps ? (providerRows ?? []).find((p) => p.id === ps.provider_id) : null;
    return {
      serviceName: svc ? (svc.name as Record<string, string>).en : "Service",
      providerName: prov?.name ?? "",
    };
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/${locale}/stay/${token}`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">My Bookings</h1>
        <p className="text-stone-400 text-sm mt-1">{session.guest_name}</p>
      </div>

      {pageError && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {pageError}
        </div>
      )}

      {!bookings?.length ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-stone-400 mb-3">No bookings yet.</p>
          <Link
            href={`/${locale}/stay/${token}`}
            className="text-sm text-amber-600 hover:underline font-medium"
          >
            Browse services →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const { serviceName, providerName } = lookupNames(b.provider_service_id);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-stone-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-800">{serviceName}</p>
                    {providerName && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        with {providerName}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">
                      {formatDate(b.booking_date)}
                      {b.start_time && ` · ${b.start_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_STYLES[b.status as BookingStatus]
                      }`}
                    >
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <p className="text-sm font-semibold text-stone-700 mt-2">
                      €{b.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {b.special_requests && (
                  <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
                    &ldquo;{b.special_requests}&rdquo;
                  </p>
                )}

                {/* Pay now button — only for pending, unpaid bookings */}
                {b.status === "pending" && b.stripe_payment_status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <form action={createPaymentIntentAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="token" value={token} />
                      <input type="hidden" name="booking_id" value={b.id} />
                      <button
                        type="submit"
                        className="w-full text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl transition-colors"
                      >
                        Pay €{b.total_amount.toFixed(2)} to confirm
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
