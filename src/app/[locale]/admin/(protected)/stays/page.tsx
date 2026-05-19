import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", cls: "bg-blue-50 text-blue-700" };
  if (today > checkOut) return { label: "Expired",  cls: "bg-stone-100 text-stone-500" };
  return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
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
          <h1 className="text-2xl font-semibold text-stone-900">Guest Stays</h1>
          <p className="text-sm text-stone-400 mt-0.5">{stays?.length ?? 0} total stays</p>
        </div>
        <Link href={`/${locale}/admin/stays/new`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Stay
          </Button>
        </Link>
      </div>

      {!stays?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-stone-400 mb-4">No stays yet.</p>
          <Link href={`/${locale}/admin/stays/new`}>
            <Button variant="outline" size="sm">Create your first stay →</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Guest</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Dates</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Token</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {stays.map((stay) => {
                const status = stayStatus(stay.check_in, stay.check_out);
                return (
                  <tr key={stay.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">{stay.guest_name}</p>
                      {stay.guest_email && (
                        <p className="text-xs text-stone-400">{stay.guest_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {fmt(stay.check_in)} – {fmt(stay.check_out)}
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-600">
                        {stay.access_token}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/${locale}/admin/stays/${stay.id}`}
                        className="text-xs text-amber-600 hover:underline font-medium"
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
