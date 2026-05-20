import { createAdminClient } from "@/lib/supabase/admin";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import ServiceActiveToggle from "@/components/admin/ServiceActiveToggle";

function fmt(price: number) {
  return `€${price.toFixed(2)}`;
}

const UNIT_LABELS: Record<string, string> = {
  per_hour:    "/ hr",
  per_session: "/ session",
  flat:        "flat",
  per_item:    "/ item",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const db = createAdminClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    db.from("service_categories").select("*").order("sort_order"),
    db.from("services").select("*").order("sort_order"),
  ]);

  const cats = categories ?? [];
  const svcs = services  ?? [];

  const byCategory = cats.map((cat) => ({
    cat,
    services: svcs.filter((s) => s.category_id === cat.id),
  }));

  const uncategorised = svcs.filter(
    (s) => !cats.find((c) => c.id === s.category_id)
  );

  const totalActive = svcs.filter((s) => s.is_active).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {svcs.length} total · {totalActive} active
          </p>
        </div>
        <Link
          href={`/${locale}/admin/services/new`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-warm-sm"
        >
          <Plus className="h-4 w-4" /> Add service
        </Link>
      </div>

      {/* Grouped by category */}
      <div className="space-y-6">
        {byCategory.map(({ cat, services: catSvcs }) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {(cat.name as Record<string, string>).en}
              </p>
              <div className="h-px flex-1 bg-border" />
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                cat.is_active
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {cat.is_active ? "Category active" : "Category inactive"}
              </span>
            </div>

            {catSvcs.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 pl-1 italic">No services in this category.</p>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-warm-sm">
                {catSvcs.map((svc, i) => (
                  <div
                    key={svc.id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      i < catSvcs.length - 1 ? "border-b border-border/50" : ""
                    } ${!svc.is_active ? "opacity-50" : ""}`}
                  >
                    {/* Toggle */}
                    <ServiceActiveToggle serviceId={svc.id} initial={svc.is_active ?? true} />

                    {/* Name & price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(svc.name as Record<string, string>).en}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmt(svc.base_price)}{" "}
                        <span className="text-muted-foreground/60">
                          {UNIT_LABELS[svc.price_unit] ?? svc.price_unit}
                        </span>
                        {svc.requires_scheduling && (
                          <span className="ml-2 text-muted-foreground/50">· scheduled</span>
                        )}
                      </p>
                    </div>

                    {/* Sort order */}
                    <span className="text-xs text-muted-foreground/40 hidden sm:block w-6 text-center">
                      #{svc.sort_order}
                    </span>

                    {/* Edit */}
                    <Link
                      href={`/${locale}/admin/services/${svc.id}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Services with missing/unknown category */}
        {uncategorised.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Uncategorised
            </p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-warm-sm">
              {uncategorised.map((svc, i) => (
                <div
                  key={svc.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < uncategorised.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <ServiceActiveToggle serviceId={svc.id} initial={svc.is_active ?? true} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {(svc.name as Record<string, string>).en}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/admin/services/${svc.id}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
