import { getProviderSession } from "@/lib/provider-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import ProviderBookingActions from "@/components/provider/ProviderBookingActions";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:     "Pending",
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ProviderBookingsPage() {
  const provider = await getProviderSession();
  if (!provider) notFound();

  const db = createAdminClient();

  const { data: psIds } = await db
    .from("provider_services")
    .select("id, service_id")
    .eq("provider_id", provider.id);

  const ids = (psIds ?? []).map((p) => p.id);
  const serviceIdMap = Object.fromEntries((psIds ?? []).map((p) => [p.id, p.service_id]));

  const { data: bookings } = ids.length
    ? await db
        .from("bookings")
        .select("*")
        .in("provider_service_id", ids)
        .order("booking_date", { ascending: false })
    : { data: [] };

  const uniqueServiceIds = [...new Set(Object.values(serviceIdMap))];
  const { data: services } = uniqueServiceIds.length
    ? await db.from("services").select("id, name").in("id", uniqueServiceIds)
    : { data: [] };

  const serviceNames = Object.fromEntries(
    (services ?? []).map((s) => [s.id, (s.name as Record<string, string>).en])
  );

  const csvRows = (bookings ?? []).map((b) => {
    const svcId = serviceIdMap[b.provider_service_id];
    return [
      serviceNames[svcId] ?? "",
      b.booking_date,
      b.start_time ? b.start_time.slice(0, 5) : "",
      b.status,
      b.provider_amount.toFixed(2),
    ];
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bookings?.length ?? 0} total</p>
        </div>
        <ExportCsvButton
          filename={`sanchamar-my-bookings-${today}.csv`}
          headers={["Service", "Date", "Time", "Status", "Your Cut (€)"]}
          rows={csvRows}
          disabled={!bookings?.length}
        />
      </div>

      {!bookings?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(bookings ?? []).map((b) => {
            const svcId  = serviceIdMap[b.provider_service_id];
            const status = b.status as BookingStatus;
            const isPending = status === "pending";
            return (
              <div
                key={b.id}
                className={`bg-card rounded-2xl border p-5 shadow-warm-sm transition-colors ${
                  isPending ? "border-yellow-300 dark:border-yellow-800 bg-yellow-50/40 dark:bg-yellow-950/20" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-foreground">{serviceNames[svcId] ?? "Service"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmt(b.booking_date)}
                      {b.start_time && ` · ${b.start_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      €{b.provider_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Accept / Decline for pending bookings */}
                {isPending && (
                  <div className="mt-4 pt-3 border-t border-yellow-200 dark:border-yellow-800 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      Accept to let the guest pay, or decline if you&apos;re unavailable.
                    </p>
                    <ProviderBookingActions bookingId={b.id} />
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
