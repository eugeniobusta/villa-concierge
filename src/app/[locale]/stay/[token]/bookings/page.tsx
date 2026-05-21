import { getTranslations } from "next-intl/server";
import { getActiveSession, formatDate } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaymentIntentAction } from "@/actions/payments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CancelBookingButton } from "@/components/guest/CancelBookingButton";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

function cancelledBadge(cancelledBy: string | null) {
  if (cancelledBy === "provider") {
    return {
      cls:  "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400",
      label: "Declined by provider",
      note:  "The provider was unable to accommodate this request. You have not been charged.",
    };
  }
  return {
    cls:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    label: "Cancelled by you",
    note:  "You cancelled this booking.",
  };
}

export default async function MyBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, token } = await params;
  const { error: pageError } = await searchParams;
  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations("guest.bookings"),
  ]);
  if (!session) notFound();

  const db = createAdminClient();

  const { data: bookings } = await db
    .from("bookings")
    .select("*")
    .eq("guest_session_id", session.id)
    .order("booking_date", { ascending: true });

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
      serviceName: svc ? (svc.name as Record<string, string>)[locale] ?? (svc.name as Record<string, string>).en : "Service",
      providerName: prov?.name ?? "",
    };
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/${locale}/stay/${token}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{session.guest_name}</p>
      </div>

      {pageError && (
        <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          {pageError}
        </div>
      )}

      {!bookings?.length ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-3">{t("empty")}</p>
          <Link href={`/${locale}/stay/${token}`} className="text-sm text-primary hover:underline font-medium">
            {t("browse")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const { serviceName, providerName } = lookupNames(b.provider_service_id);

            return (
              <div
                key={b.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-warm-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{serviceName}</p>
                    {providerName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("with", { name: providerName })}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(b.booking_date, { locale })}
                      {b.start_time && ` · ${b.start_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {b.status === "cancelled" ? (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cancelledBadge(b.cancelled_by).cls}`}>
                        {cancelledBadge(b.cancelled_by).label}
                      </span>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status as BookingStatus]}`}>
                        {t(`status.${b.status as BookingStatus}`)}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-foreground mt-2">
                      €{b.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {b.special_requests && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    &ldquo;{b.special_requests}&rdquo;
                  </p>
                )}

                {/* Cancellation context note */}
                {b.status === "cancelled" && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    {cancelledBadge(b.cancelled_by).note}
                  </p>
                )}

                {/* Awaiting provider confirmation */}
                {b.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                      {t("pendingNote")}
                    </p>
                    <CancelBookingButton bookingId={b.id} token={token} locale={locale} />
                  </div>
                )}

                {/* Provider accepted — guest can now pay */}
                {b.status === "confirmed" && b.stripe_payment_status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-3">
                      {t("acceptedNote")}
                    </p>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <CancelBookingButton bookingId={b.id} token={token} locale={locale} />
                      <form action={createPaymentIntentAction} className="flex-shrink-0">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="booking_id" value={b.id} />
                        <button
                          type="submit"
                          className="flex items-center gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-5 rounded-xl transition-colors shadow-warm-sm"
                        >
                          {t("payToConfirm", { amount: b.total_amount.toFixed(2) })}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Already paid — just allow cancel before start */}
                {b.status === "confirmed" && b.stripe_payment_status === "paid" && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <CancelBookingButton bookingId={b.id} token={token} locale={locale} />
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
