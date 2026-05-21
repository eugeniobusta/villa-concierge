import { getTranslations } from "next-intl/server";
import { getActiveSession } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import ServicesGrid from "@/components/guest/ServicesGrid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ClipboardList, MessageSquareHeart } from "lucide-react";

export default async function GuestHomePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;

  const [session, t, tB] = await Promise.all([
    getActiveSession(token),
    getTranslations("guest.home"),
    getTranslations("guest.bookings"),
  ]);
  if (!session) notFound();

  const db = createAdminClient();
  const [{ data: categories }, { data: services }, { count: bookingCount }, { data: availablePs }, { data: activeProviders }] = await Promise.all([
    db.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
    db.from("services").select("*").eq("is_active", true).order("sort_order"),
    db
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("guest_session_id", session.id)
      .neq("status", "cancelled"),
    db.from("provider_services").select("service_id, provider_id").eq("is_available", true),
    db.from("providers").select("id").eq("is_active", true),
  ]);

  const activeProviderSet  = new Set((activeProviders ?? []).map((p) => p.id));
  const coveredServiceIds  = new Set(
    (availablePs ?? [])
      .filter((ps) => activeProviderSet.has(ps.provider_id))
      .map((ps) => ps.service_id)
  );

  return (
    <div>
      {/* Welcome message from host */}
      {session.welcome_message && (
        <div className="bg-primary/6 border border-primary/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareHeart className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Message from your host
            </p>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {session.welcome_message}
          </p>
        </div>
      )}

      {/* My Bookings banner — always visible, highlighted if active bookings exist */}
      <Link
        data-tour="my-bookings-banner"
        href={`/${locale}/stay/${token}/bookings`}
        className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-8 transition-all group border ${
          bookingCount && bookingCount > 0
            ? "bg-primary/8 hover:bg-primary/12 border-primary/25"
            : "bg-card hover:bg-secondary border-border hover:border-primary/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            bookingCount && bookingCount > 0 ? "bg-primary/15" : "bg-muted"
          }`}>
            <ClipboardList className={`h-4 w-4 ${bookingCount && bookingCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${bookingCount && bookingCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
              {tB("title")}
            </p>
            {bookingCount && bookingCount > 0 ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("activeCount", { count: bookingCount })}
              </p>
            ) : null}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
          bookingCount && bookingCount > 0 ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        }`}>
          {t("viewMyBookings")}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div data-tour="services-grid">
        <ServicesGrid
          categories={categories ?? []}
          services={services ?? []}
          coveredServiceIds={coveredServiceIds}
          locale={locale}
          token={token}
        />
      </div>
    </div>
  );
}
