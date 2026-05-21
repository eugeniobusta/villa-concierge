import { getProviderSession } from "@/lib/provider-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import ProviderBookingActions from "@/components/provider/ProviderBookingActions";
import { User, Clock, MessageSquare } from "lucide-react";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:     "Awaiting your response",
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

function fmtLong(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime(t: string) { return t.slice(0, 5); }

export default async function ProviderBookingsPage() {
  const provider = await getProviderSession();
  if (!provider) notFound();

  const db = createAdminClient();

  // 1 — Which provider_services belong to this provider?
  const { data: psRows } = await db
    .from("provider_services")
    .select("id, service_id")
    .eq("provider_id", provider.id);

  const ids          = (psRows ?? []).map((p) => p.id);
  const serviceIdMap = Object.fromEntries((psRows ?? []).map((p) => [p.id, p.service_id]));

  // 2 — Fetch all bookings for those provider_services
  const { data: bookings } = ids.length
    ? await db
        .from("bookings")
        .select("*")
        .in("provider_service_id", ids)
        .order("booking_date", { ascending: false })
    : { data: [] };

  // 3 — Flat lookups in parallel
  const uniqueServiceIds  = [...new Set(Object.values(serviceIdMap))];
  const sessionIds        = [...new Set((bookings ?? []).map((b) => b.guest_session_id))];

  const [{ data: serviceRows }, { data: sessionRows }] = await Promise.all([
    uniqueServiceIds.length
      ? db.from("services").select("id, name").in("id", uniqueServiceIds)
      : { data: [] },
    sessionIds.length
      ? db.from("guest_sessions")
          .select("id, guest_name, guest_email, check_in, check_out")
          .in("id", sessionIds)
      : { data: [] },
  ]);

  const serviceNames = Object.fromEntries(
    (serviceRows ?? []).map((s) => [s.id, (s.name as Record<string, string>).en])
  );
  const sessionMap = Object.fromEntries(
    (sessionRows ?? []).map((s) => [s.id, s])
  );

  // 4 — CSV (include guest name and requests)
  const today   = new Date().toISOString().split("T")[0];
  const csvRows = (bookings ?? []).map((b) => {
    const svcId  = serviceIdMap[b.provider_service_id];
    const guest  = sessionMap[b.guest_session_id];
    return [
      guest?.guest_name ?? "",
      serviceNames[svcId] ?? "",
      b.booking_date,
      b.start_time ? fmtTime(b.start_time) : "",
      b.end_time   ? fmtTime(b.end_time)   : "",
      b.status,
      b.provider_amount.toFixed(2),
      b.special_requests ?? "",
    ];
  });

  const pendingCount = (bookings ?? []).filter((b) => b.status === "pending").length;

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bookings?.length ?? 0} total
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-700 dark:text-yellow-400 font-medium">
                · {pendingCount} awaiting your response
              </span>
            )}
          </p>
        </div>
        <ExportCsvButton
          filename={`sanchamar-my-bookings-${today}.csv`}
          headers={["Guest", "Service", "Date", "Start", "End", "Status", "Your Cut (€)", "Requests"]}
          rows={csvRows}
          disabled={!bookings?.length}
        />
      </div>

      {/* Booking cards */}
      {!bookings?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(bookings ?? []).map((b) => {
            const svcId    = serviceIdMap[b.provider_service_id];
            const status   = b.status as BookingStatus;
            const guest    = sessionMap[b.guest_session_id];
            const isPending = status === "pending";

            return (
              <div
                key={b.id}
                className={`rounded-2xl border shadow-warm-sm overflow-hidden transition-colors ${
                  isPending
                    ? "border-yellow-300 dark:border-yellow-800"
                    : status === "cancelled"
                    ? "border-border opacity-60"
                    : "border-border"
                }`}
              >
                {/* ── Coloured top strip for pending ── */}
                {isPending && (
                  <div className="bg-yellow-400/20 dark:bg-yellow-900/30 px-5 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                      New request — please respond
                    </p>
                  </div>
                )}

                <div className="bg-card p-5">
                  {/* ── Row 1: service + status + amount ── */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <p className="font-semibold text-foreground text-base leading-tight">
                      {serviceNames[svcId] ?? "Service"}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      <p className="text-sm font-semibold text-primary">
                        €{b.provider_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* ── Info rows ── */}
                  <div className="space-y-2">
                    {/* Guest */}
                    {guest && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground">{guest.guest_name}</span>
                        {guest.guest_email && (
                          <a
                            href={`mailto:${guest.guest_email}`}
                            className="text-xs text-primary hover:underline ml-1"
                          >
                            {guest.guest_email}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Booking date + time */}
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {fmtLong(b.booking_date)}
                        {b.start_time && (
                          <>
                            {" · "}
                            <span className="font-medium text-foreground">
                              {fmtTime(b.start_time)}
                              {b.end_time && ` – ${fmtTime(b.end_time)}`}
                            </span>
                          </>
                        )}
                        {b.quantity > 1 && (
                          <span className="ml-2 text-xs">× {b.quantity}</span>
                        )}
                      </span>
                    </div>

                    {/* Special requests */}
                    {b.special_requests && (
                      <div className="flex items-start gap-2.5 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground italic">
                          &ldquo;{b.special_requests}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Accept / Decline ── */}
                  {isPending && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        Accept to let the guest pay, or decline if you&apos;re unavailable.
                      </p>
                      <ProviderBookingActions bookingId={b.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
