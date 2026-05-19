import { getProviderSession } from "@/lib/provider-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{bookings?.length ?? 0} total</p>
      </div>

      {!bookings?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-warm-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Your cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(bookings ?? []).map((b) => {
                const svcId = serviceIdMap[b.provider_service_id];
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {serviceNames[svcId] ?? "Service"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {fmt(b.booking_date)}
                      {b.start_time && <span className="ml-1 text-muted-foreground/60">· {b.start_time.slice(0, 5)}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status as BookingStatus]}`}>
                        {STATUS_LABELS[b.status as BookingStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">
                      €{b.provider_amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
