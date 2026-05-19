"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createBookingAction } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/guest-session";
import { Loader2 } from "lucide-react";
import type { Provider, AvailabilitySlot } from "@/types/database";

interface ProviderWithSlots {
  providerServiceId: string;
  provider: Provider;
  customPrice: number | null;
  slots: AvailabilitySlot[];
}

interface Props {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  priceUnit: string;
  minDuration: number | null;
  maxDuration: number | null;
  providers: ProviderWithSlots[];
  stayDates: string[];
  locale: string;
  token: string;
}

export default function BookingForm({
  serviceName, basePrice, priceUnit, minDuration, maxDuration,
  providers, stayDates, locale, token,
}: Props) {
  const t   = useTranslations("guest.booking");
  const currentLocale = useLocale();

  const [state, formAction, isPending] = useActionState(createBookingAction, null);
  const [selectedPsId, setSelectedPsId]   = useState<string | null>(
    providers.length === 1 ? providers[0].providerServiceId : null
  );
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [duration, setDuration]           = useState<number>(minDuration ?? 1);

  const selected       = providers.find((p) => p.providerServiceId === selectedPsId);
  const unitPrice      = selected?.customPrice ?? basePrice;
  const slotsForDate   = selected && selectedDate
    ? selected.slots.filter((s) => s.date === selectedDate && !s.is_blocked)
    : [];
  const datesWithSlots = selected
    ? stayDates.filter((d) => selected.slots.some((s) => s.date === d && !s.is_blocked))
    : stayDates;

  const isHourly = priceUnit === "per_hour";
  const total    = isHourly ? unitPrice * duration : unitPrice;

  const canSubmit = selectedPsId && selectedDate &&
    (priceUnit === "flat" || priceUnit === "per_item" || selectedStart);

  function fmtTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
  }

  function pickBio(bio: Record<string, string> | null) {
    if (!bio) return null;
    return bio[currentLocale] ?? bio.en ?? null;
  }

  const dateButtonClass = (active: boolean) => cn(
    "px-3 py-2 rounded-xl border text-sm transition-all",
    active
      ? "bg-foreground text-background border-foreground"
      : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="provider_service_id" value={selectedPsId ?? ""} />
      <input type="hidden" name="booking_date" value={selectedDate ?? ""} />
      <input type="hidden" name="start_time" value={selectedStart ?? ""} />
      <input type="hidden" name="duration_hours" value={isHourly ? duration : 0} />

      {/* Step 1: Provider */}
      {providers.length > 1 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("chooseProvider")}</p>
          <div className="grid gap-3">
            {providers.map((p) => (
              <button
                key={p.providerServiceId}
                type="button"
                onClick={() => { setSelectedPsId(p.providerServiceId); setSelectedDate(null); setSelectedStart(null); }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                  selectedPsId === p.providerServiceId
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm flex-shrink-0">
                  {p.provider.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{p.provider.name}</p>
                  {p.provider.bio && (
                    <p className="text-xs text-muted-foreground truncate">
                      {pickBio(p.provider.bio as Record<string, string>)}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-primary flex-shrink-0">
                  €{p.customPrice ?? basePrice}{isHourly ? "/hr" : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date */}
      {selectedPsId && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("chooseDate")}</p>
          {datesWithSlots.length === 0 && priceUnit !== "flat" && priceUnit !== "per_item" ? (
            <p className="text-sm text-muted-foreground">{t("noAvailability")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(datesWithSlots.length > 0 ? datesWithSlots : stayDates).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setSelectedDate(d); setSelectedStart(null); }}
                  className={dateButtonClass(selectedDate === d)}
                >
                  {formatDate(d, { locale })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Time */}
      {selectedDate && slotsForDate.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("chooseTime")}</p>
          <div className="flex flex-wrap gap-2">
            {slotsForDate.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedStart(slot.start_time)}
                className={dateButtonClass(selectedStart === slot.start_time)}
              >
                {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Duration */}
      {isHourly && selectedDate && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("duration")}</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              { length: (maxDuration ?? 8) - (minDuration ?? 1) + 1 },
              (_, i) => (minDuration ?? 1) + i
            ).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDuration(h)}
                className={dateButtonClass(duration === h)}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Notes */}
      {selectedDate && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {t("notes")} <span className="font-normal text-muted-foreground">({t("optional")})</span>
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder={t("notesPlaceholder")}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent resize-none transition-colors"
          />
        </div>
      )}

      {/* Summary + Submit */}
      {canSubmit && (
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/15">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">{serviceName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected?.provider.name}
                {selectedDate && ` · ${formatDate(selectedDate, { locale })}`}
                {isHourly && ` · ${duration}h`}
              </p>
            </div>
            <p className="text-xl font-semibold text-foreground">€{total.toFixed(2)}</p>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-3">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>…</span>
              </span>
            ) : (
              t("requestBooking", { amount: total.toFixed(2) })
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">{t("paymentNote")}</p>
        </div>
      )}
    </form>
  );
}
