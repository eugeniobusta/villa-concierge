import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import type { ServiceCategory } from "@/types/database";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  const [{ data: svc }, { data: cats }] = await Promise.all([
    db.from("services").select("*").eq("id", id).single(),
    db.from("service_categories").select("*").order("sort_order"),
  ]);

  if (!svc) notFound();

  const initial = {
    id:                  svc.id,
    name:                svc.name as Record<string, string>,
    description:         svc.description as Record<string, string> | null,
    category_id:         svc.category_id,
    base_price:          svc.base_price,
    price_unit:          svc.price_unit,
    min_duration_hours:  svc.min_duration_hours,
    max_duration_hours:  svc.max_duration_hours,
    requires_scheduling: svc.requires_scheduling ?? true,
    sort_order:          svc.sort_order ?? 0,
  };

  return (
    <ServiceForm
      categories={(cats ?? []) as ServiceCategory[]}
      initial={initial}
    />
  );
}
