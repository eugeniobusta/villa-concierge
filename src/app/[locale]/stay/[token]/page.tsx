// Server component: fetches all data, renders the client ServicesGrid.
// React.cache() in getActiveSession() means no duplicate DB calls even
// though the layout already called it.

import { getTranslations } from "next-intl/server";
import { getActiveSession } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import ServicesGrid from "@/components/guest/ServicesGrid";
import { notFound } from "next/navigation";

export default async function GuestHomePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;

  // Second call — returns cached result, no extra DB hit
  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations("guest.home"),
  ]);
  if (!session) notFound();

  const db = createAdminClient();
  const [{ data: categories }, { data: services }] = await Promise.all([
    db
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">{t("title")}</h1>
        <p className="text-stone-400 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <ServicesGrid
        categories={categories ?? []}
        services={services ?? []}
        locale={locale}
        token={token}
      />
    </div>
  );
}
