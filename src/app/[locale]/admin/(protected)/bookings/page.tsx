import { createAdminClient } from "@/lib/supabase/admin";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";
import type { BookingStatus } from "@/types/database";

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // locale is available if needed for localized links
  await params;
  const db = createAdminClient();

  const { data: bookings } = await db
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: false });

  // Flat queries for related data
  const sessionIds = [...new Set((bookings ?? []).map((b) => b.guest_session_id))];
  const psIds      = [...new Set((bookings ?? []).map((b) => b.provider_service_id))];

  const [{ data: sessions }, { data: psRows }] = await Promise.all([
    sessionIds.length
      ? db.from("guest_sessions").select("id, guest_name").in("id", sessionIds)
      : { data: [] },
    psIds.length
      ? db.from("provider_services").select("id, service_id, provider_id").in("id", psIds)
      : { data: [] },
  ]);

  const serviceIds  = [...new Set((psRows ?? []).map((p) => p.service_id))];
  const providerIds = [...new Set((psRows ?? []).map((p) => p.provider_id))];

  const [{ data: services }, { data: providers }] = await Promise.all([
    serviceIds.length
      ? db.from("services").select("id, name").in("id", serviceIds)
      : { data: [] },
    providerIds.length
      ? db.from("providers").select("id, name").in("id", providerIds)
      : { data: [] },
  ]);

  const sessionMap  = Object.fromEntries((sessions ?? []).map((s) => [s.id, s.guest_name]));
  const psToService = Object.fromEntries((psRows ?? []).map((p) => [p.id, p.service_id]));
  const psToProvider = Object.fromEntries((psRows ?? []).map((p) => [p.id, p.provider_id]));
  const svcNames    = Object.fromEntries((services ?? []).map((s) => [s.id, (s.name as Record<string, string>).en]));
  const provNames   = Object.fromEntries((providers ?? []).map((p) => [p.id, p.name]));

  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.platform_amount, 0);

  const csvRows = (bookings ?? []).map((b) => {
    const svcId  = psToService[b.provider_service_id];
    const provId = psToProvider[b.provider_service_id];
    return [
      sessionMap[b.guest_session_id] ?? "",
      svcNames[svcId] ?? "",
      provNames[provId] ?? "",
      b.booking_date,
      b.start_time ? b.start_time.slice(0, 5) : "",
      b.status,
      b.total_amount.toFixed(2),
      b.platform_amount.toFixed(2),
    ];
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bookings?.length ?? 0} total · €{totalRevenue.toFixed(2)} platform revenue
          </p>
        </div>
        <ExportCsvButton
          filename={`sanchamar-bookings-${today}.csv`}
          headers={["Guest", "Service", "Provider", "Date", "Time", "Status", "Total (€)", "Platform Cut (€)"]}
          rows={csvRows}
          disabled={!bookings?.length}
        />
      </div>

      {!bookings?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto shadow-warm-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Provider</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Our cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(bookings ?? []).map((b) => {
                const svcId  = psToService[b.provider_service_id];
                const provId = psToProvider[b.provider_service_id];
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {sessionMap[b.guest_session_id] ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {svcNames[svcId] ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                      {provNames[provId] ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {fmt(b.booking_date)}
                      {b.start_time && (
                        <span className="ml-1 text-muted-foreground/60">· {b.start_time.slice(0, 5)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <BookingStatusSelect
                        bookingId={b.id}
                        initialStatus={b.status as BookingStatus}
                      />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">
                      €{b.total_amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-primary hidden lg:table-cell">
                      €{b.platform_amount.toFixed(2)}
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
