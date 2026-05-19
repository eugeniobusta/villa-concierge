import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProvidersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const db = createAdminClient();

  const [{ data: providers }, { data: providerServices }] = await Promise.all([
    db.from("providers").select("*").order("name"),
    db.from("provider_services").select("provider_id").eq("is_available", true),
  ]);

  const serviceCount = (providerServices ?? []).reduce<Record<string, number>>((acc, ps) => {
    acc[ps.provider_id] = (acc[ps.provider_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Providers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your trusted service people</p>
        </div>
        <Link href={`/${locale}/admin/providers/new`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Provider
          </Button>
        </Link>
      </div>

      {!providers?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4">No providers yet.</p>
          <Link href={`/${locale}/admin/providers/new`}>
            <Button variant="outline" size="sm">Add your first provider →</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-warm-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Services</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{p.name}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{p.email ?? "—"}</td>
                  <td className="px-5 py-4 text-foreground">{Math.round(p.commission_rate * 100)}%</td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                    {serviceCount[p.id] ?? 0} service{(serviceCount[p.id] ?? 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.is_active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/${locale}/admin/providers/${p.id}`} className="text-xs text-primary hover:underline font-medium">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
