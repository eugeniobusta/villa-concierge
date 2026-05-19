import { getTranslations } from "next-intl/server";
import { getActiveSession, getStayDates } from "@/lib/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import BookingForm from "@/components/guest/BookingForm";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Provider, AvailabilitySlot } from "@/types/database";

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ locale: string; token: string; serviceId: string }>;
}) {
  const { locale, token, serviceId } = await params;

  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations("guest.booking"),
  ]);
  if (!session) notFound();

  const db = createAdminClient();
  const stayDates = getStayDates(session.check_in, session.check_out);

  const [{ data: service }, { data: providerServices }] = await Promise.all([
    db.from("services").select("*").eq("id", serviceId).single(),
    db
      .from("provider_services")
      .select("id, custom_price, provider_id")
      .eq("service_id", serviceId)
      .eq("is_available", true),
  ]);

  if (!service) notFound();

  const providerIds = (providerServices ?? []).map((ps) => ps.provider_id);

  const [{ data: providerRows }, { data: slots }] = await Promise.all([
    providerIds.length
      ? db.from("providers").select("*").in("id", providerIds).eq("is_active", true)
      : { data: [] as Provider[] },
    providerIds.length
      ? db
          .from("availability_slots")
          .select("*")
          .in("provider_id", providerIds)
          .in("date", stayDates)
          .eq("is_blocked", false)
          .order("start_time")
      : { data: [] as AvailabilitySlot[] },
  ]);

  const providers = (providerServices ?? [])
    .map((ps) => {
      const provider = (providerRows ?? []).find((p) => p.id === ps.provider_id);
      if (!provider) return null;
      return {
        providerServiceId: ps.id,
        provider,
        customPrice: ps.custom_price,
        slots: (slots ?? []).filter((s) => s.provider_id === provider.id),
      };
    })
    .filter(Boolean) as {
      providerServiceId: string;
      provider: Provider;
      customPrice: number | null;
      slots: AvailabilitySlot[];
    }[];

  const name = (service.name as Record<string, string>)[locale] ?? (service.name as Record<string, string>).en;
  const desc = service.description
    ? ((service.description as Record<string, string>)[locale] ?? (service.description as Record<string, string>).en)
    : null;

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/${locale}/stay/${token}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">{name}</h1>
        {desc && <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>}
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">
            {t("noProviders")}
            <br />
            {t("contactHost")}
          </p>
        </div>
      ) : (
        <BookingForm
          serviceId={serviceId}
          serviceName={name}
          basePrice={service.base_price}
          priceUnit={service.price_unit}
          minDuration={service.min_duration_hours}
          maxDuration={service.max_duration_hours}
          providers={providers}
          stayDates={stayDates}
          locale={locale}
          token={token}
        />
      )}
    </div>
  );
}
