// Server component — fetches stats directly from Supabase.
// No API route needed: the function runs on the server and returns JSX.

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, ClipboardList, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getStats() {
  const db = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalStays },
    { count: activeStays },
    { count: totalProviders },
    { count: totalBookings },
    { data: recentStays },
  ] = await Promise.all([
    db.from("guest_sessions").select("*", { count: "exact", head: true }),
    db
      .from("guest_sessions")
      .select("*", { count: "exact", head: true })
      .lte("check_in", today)
      .gte("check_out", today),
    db.from("providers").select("*", { count: "exact", head: true }).eq("is_active", true),
    db.from("bookings").select("*", { count: "exact", head: true }),
    db
      .from("guest_sessions")
      .select("id, guest_name, check_in, check_out")
      .order("check_in", { ascending: false })
      .limit(5),
  ]);

  return { totalStays, activeStays, totalProviders, totalBookings, recentStays };
}

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", color: "bg-blue-50 text-blue-700" };
  if (today > checkOut) return { label: "Expired",  color: "bg-stone-100 text-stone-500" };
  return { label: "Active", color: "bg-emerald-50 text-emerald-700" };
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
  const { totalStays, activeStays, totalProviders, totalBookings, recentStays } =
    await getStats();

  const statCards = [
    { title: "Total Stays",    value: totalStays ?? 0,    icon: CalendarDays, sub: "all time" },
    { title: "Active Now",     value: activeStays ?? 0,   icon: TrendingUp,   sub: "guests in house" },
    { title: "Providers",      value: totalProviders ?? 0, icon: Users,       sub: "active" },
    { title: "Bookings",       value: totalBookings ?? 0, icon: ClipboardList, sub: "all time" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">Villa Concierge overview</p>
        </div>
        <Link href={`/${locale}/admin/stays/new`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Stay
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ title, value, icon: Icon, sub }) => (
          <Card key={title} className="border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-stone-500">{title}</CardTitle>
              <Icon className="h-4 w-4 text-stone-300" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-semibold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent stays */}
      <Card className="border-stone-200">
        <CardHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-stone-700">Recent Stays</CardTitle>
            <Link href={`/${locale}/admin/stays`} className="text-xs text-amber-600 hover:underline">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {!recentStays?.length ? (
            <p className="text-sm text-stone-400">No stays yet. <Link href={`/${locale}/admin/stays/new`} className="text-amber-600 hover:underline">Create the first one →</Link></p>
          ) : (
            <div className="space-y-2">
              {recentStays.map((stay) => {
                const status = stayStatus(stay.check_in, stay.check_out);
                return (
                  <Link
                    key={stay.id}
                    href={`/${locale}/admin/stays/${stay.id}`}
                    className="flex items-center justify-between py-2 hover:bg-stone-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-800">{stay.guest_name}</p>
                      <p className="text-xs text-stone-400">{fmt(stay.check_in)} – {fmt(stay.check_out)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
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
