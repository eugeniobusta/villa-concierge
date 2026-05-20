import { createAdminClient } from "@/lib/supabase/admin";
import ServiceForm from "@/components/admin/ServiceForm";
import type { ServiceCategory } from "@/types/database";

export default async function NewServicePage() {
  const db = createAdminClient();
  const { data } = await db
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return <ServiceForm categories={(data ?? []) as ServiceCategory[]} />;
}
