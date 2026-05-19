import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, ClipboardList, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/RevenueChart";
import type { DayRevenue } from "@/components/admin/RevenueChart";

async function getStats() {
  const db = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Date range helpers
  const monthStart = today.slice(0, 7) + "-01";
  const last14 = new Date();
  last14.setDate(last14.getDate() - 13);
  const last14Start = last14.toISOString().split("T")[0];

  const [
    { count: totalStays },
    { count: activeStays },
    { count: totalProviders },
    { data: allBookings },
    { data: recentStays },
  ] = await Promise.all([
    db.from("guest_sessions").select("*", { count: "exact", head: true }),
    db
      .from("guest_sessions")
      .select("*", { count: "exact", head: true })
      .lte("check_in", today)
      .gte("check_out", today),
    db.from("providers").select("*", { count: "exact", head: true }).eq("is_active", true),
    db
      .from("bookings")
      .select("booking_date, total_amount, platform_amount, status")
      .gte("booking_date", last14Start)
      .order("booking_date"),
    db
      .from("guest_sessions")
      .select("id, guest_name, check_in, check_out")
      .order("check_in", { ascending: false })
      .limit(5),
  ]);

  // Platform revenue totals
  const nonCancelled = (allBookings ?? []).filter((b) => b.status !== "cancelled");
  const monthRevenue = nonCancelled
    .filter((b) => b.booking_date >= monthStart)
    .reduce((s, b) => s + (b.platform_amount ?? 0), 0);
  const totalRevenue = nonCancelled
    .reduce((s, b) => s + (b.platform_amount ?? 0), 0);

  // Build last-14-days chart data
  const days: DayRevenue[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const dayBookings = nonCancelled.filter((b) => b.booking_date === date);
    return {
      date,
      label,
      revenue: parseFloat(dayBookings.reduce((s, b) => s + (b.platform_amount ?? 0), 0).toFixed(2)),
      bookings: dayBookings.length,
    };
  });

  // Status distribution (all time — not just last 14)
  const { data: statusData } = await db.from("bookings").select("status");
  const statusMap: Record<string, number> = {};
  for (const b of statusData ?? []) {
    statusMap[b.status] = (statusMap[b.status] ?? 0) + 1;
  }
  const statusColors: Record<string, string> = {
    pending:     "oklch(0.8 0.16 80)",
    confirmed:   "oklch(0.65 0.15 155)",
    in_progress: "oklch(0.62 0.15 240)",
    completed:   "oklch(0.55 0.05 60)",
    cancelled:   "oklch(0.60 0.18 25)",
  };
  const statusCounts = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status] ?? "oklch(0.55 0.05 60)",
  }));

  const totalBookings = (statusData ?? []).length;

  return {
    totalStays, activeStays, totalProviders, totalBookings,
    recentStays, days, statusCounts, monthRevenue, totalRevenue,
  };
}

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300" };
  if (today > checkOut) return { label: "Expired",  color: "bg-muted text-muted-foreground" };
  return { label: "Active", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" };
}

function fmt(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const {
    totalStays, activeStays, totalProviders, totalBookings,
    recentStays, days, statusCounts, monthRevenue, totalRevenue,
  } = await getStats();

  const statCards = [
    { title: "Total Stays",   value: totalStays ?? 0,    icon: CalendarDays, sub: "all time" },
    { title: "Active Now",    value: activeStays ?? 0,   icon: TrendingUp,   sub: "guests in house" },
    { title: "Providers",     value: totalProviders ?? 0, icon: Users,       sub: "active" },
    { title: "Bookings",      value: totalBookings ?? 0, icon: ClipboardList, sub: "all time",
      href: `/${locale}/admin/bookings` },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Villa Concierge overview</p>
        </div>
        <Link href={`/${locale}/admin/stays/new`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Stay
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ title, value, icon: Icon, sub, href }) => {
          const inner = (
            <Card className="border-border hover:border-primary/30 transition-colors shadow-warm-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground/40" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </CardContent>
            </Card>
          );
          return href ? (
            <Link key={title} href={href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={title}>{inner}</div>
          );
        })}
      </div>

      {/* Revenue charts */}
      <div className="mb-8">
        <RevenueChart
          dailyData={days}
          statusCounts={statusCounts}
          totalRevenue={totalRevenue}
          monthRevenue={monthRevenue}
        />
      </div>

      {/* Recent stays */}
      <Card className="border-border shadow-warm-sm">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground">Recent Stays</CardTitle>
            <Link href={`/${locale}/admin/stays`} className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {!recentStays?.length ? (
            <p className="text-sm text-muted-foreground">
              No stays yet.{" "}
              <Link href={`/${locale}/admin/stays/new`} className="text-primary hover:underline">
                Create the first one →
              </Link>
            </p>
          ) : (
            <div className="space-y-1">
              {recentStays.map((stay) => {
                const status = stayStatus(stay.check_in, stay.check_out);
                return (
                  <Link
                    key={stay.id}
                    href={`/${locale}/admin/stays/${stay.id}`}
                    className="flex items-center justify-between py-2.5 hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{stay.guest_name}</p>
                      <p className="text-xs text-muted-foreground">{fmt(stay.check_in)} – {fmt(stay.check_out)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
