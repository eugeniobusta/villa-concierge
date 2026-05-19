import { getProviderSession } from "@/lib/provider-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, TrendingUp, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default async function ProviderDashboardPage() {
  const provider = await getProviderSession();
  if (!provider) notFound();

  const db    = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const { data: psIds } = await db
    .from("provider_services")
    .select("id")
    .eq("provider_id", provider.id);

  const ids = (psIds ?? []).map((p) => p.id);

  const [{ data: allBookings }, { data: upcoming }] = await Promise.all([
    ids.length
      ? db.from("bookings").select("total_amount, provider_amount, status, booking_date, provider_service_id")
          .in("provider_service_id", ids).gte("booking_date", monthStart)
      : { data: [] },
    ids.length
      ? db.from("bookings").select("*").in("provider_service_id", ids)
          .gte("booking_date", today).order("booking_date").limit(5)
      : { data: [] },
  ]);

  const confirmedBookings = (allBookings ?? []).filter((b) => b.status !== "cancelled");
  const monthRevenue = confirmedBookings.reduce((sum, b) => sum + (b.provider_amount ?? 0), 0);

  const upcomingPsIds = [...new Set((upcoming ?? []).map((b) => b.provider_service_id))];
  const { data: upcomingPs } = upcomingPsIds.length
    ? await db.from("provider_services").select("id, service_id").in("id", upcomingPsIds)
    : { data: [] };
  const upcomingSvcIds = [...new Set((upcomingPs ?? []).map((p) => p.service_id))];
  const { data: upcomingSvcs } = upcomingSvcIds.length
    ? await db.from("services").select("id, name").in("id", upcomingSvcIds)
    : { data: [] };
  const psToSvc  = Object.fromEntries((upcomingPs ?? []).map((p) => [p.id, p.service_id]));
  const svcNames = Object.fromEntries((upcomingSvcs ?? []).map((s) => [s.id, (s.name as Record<string, string>).en]));

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {provider.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s coming up</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { title: "Bookings this month", value: confirmedBookings.length, icon: ClipboardList, sub: "confirmed" },
          { title: "Your earnings",        value: `€${monthRevenue.toFixed(0)}`, icon: TrendingUp, sub: "this month" },
          { title: "Commission rate",      value: `${Math.round(provider.commission_rate * 100)}%`, icon: CalendarDays, sub: "of each booking" },
        ].map(({ title, value, icon: Icon, sub }) => (
          <Card key={title} className="border-border shadow-warm-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming bookings */}
      <Card className="border-border shadow-warm-sm">
        <CardHeader className="px-6 pt-5 pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {!upcoming?.length ? (
            <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
          ) : (
            <div className="space-y-1">
              {(upcoming ?? []).map((b) => {
                const serviceName = svcNames[psToSvc[b.provider_service_id]] ?? "Service";
                return (
                  <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmt(b.booking_date)}{b.start_time && ` · ${b.start_time.slice(0, 5)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status as BookingStatus]}`}>
                        {b.status.replace("_", " ")}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">€{b.provider_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
