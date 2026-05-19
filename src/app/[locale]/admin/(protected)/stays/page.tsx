import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300" };
  if (today > checkOut) return { label: "Expired",  cls: "bg-muted text-muted-foreground" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" };
}

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function StaysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const db = createAdminClient();
  const { data: stays } = await db
    .from("guest_sessions")
    .select("id, guest_name, guest_email, check_in, check_out, access_token")
    .order("check_in", { ascending: false });

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Guest Stays</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stays?.length ?? 0} total stays</p>
        </div>
        <Link href={`/${locale}/admin/stays/new`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Stay
          </Button>
        </Link>
      </div>

      {!stays?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4">No stays yet.</p>
          <Link href={`/${locale}/admin/stays/new`}>
            <Button variant="outline" size="sm">Create your first stay →</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-warm-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Token</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stays.map((stay) => {
                const status = stayStatus(stay.check_in, stay.check_out);
                return (
                  <tr key={stay.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{stay.guest_name}</p>
                      {stay.guest_email && (
                        <p className="text-xs text-muted-foreground">{stay.guest_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {fmt(stay.check_in)} – {fmt(stay.check_out)}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                        {stay.access_token}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/${locale}/admin/stays/${stay.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View →
                      </Link>
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
