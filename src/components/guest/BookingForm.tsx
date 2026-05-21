"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createBookingAction } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/guest-session";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Provider, AvailabilitySlot } from "@/types/database";
import StripePaymentForm from "@/components/guest/StripePaymentForm";

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

  // Client-side date/time guards — evaluated at render time on the guest's device
  const today       = new Date().toISOString().split("T")[0];
  const nowMinutes  = new Date().getHours() * 60 + new Date().getMinutes();

  function isPastDate(d: string) { return d < today; }
  function isPastSlot(startTime: string) {
    if (selectedDate !== today) return false;
    const [h, m] = startTime.split(":").map(Number);
    return h * 60 + m <= nowMinutes; // grey out if start time ≤ now
  }

  const selected       = providers.find((p) => p.providerServiceId === selectedPsId);
  const unitPrice      = selected?.customPrice ?? basePrice;
  const slotsForDate   = selected && selectedDate
    ? selected.slots.filter((s) => s.date === selectedDate && !s.is_blocked)
    : [];
  const datesWithSlots = selected
    ? stayDates.filter((d) => selected.slots.some((s) => s.date === d && !s.is_blocked))
    : stayDates;

  const isHourly = priceUnit === "per_hour";

  // For per_hour: use the slot as an available window; guest picks their start time within it
  const hourlyWindow = isHourly && slotsForDate.length > 0 ? slotsForDate[0] : null;

  function toMins(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  function fromMins(mins: number) {
    return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  }

  const winStartStr  = hourlyWindow ? hourlyWindow.start_time.slice(0, 5) : "09:00";
  const winEndStr    = hourlyWindow ? hourlyWindow.end_time.slice(0, 5)   : "17:00";
  const winStartMins = hourlyWindow ? toMins(winStartStr) : 0;
  const winEndMins   = hourlyWindow ? toMins(winEndStr)   : 0;

  // Latest valid start time = window end − duration
  const maxStartMins = winEndMins - duration * 60;
  const maxStartStr  = hourlyWindow ? fromMins(Math.max(winStartMins, maxStartMins)) : winEndStr;

  // Auto-calculated end for the booking
  const bookingEndStr = selectedStart
    ? fromMins(toMins(selectedStart) + duration * 60)
    : null;

  // How many hours can be booked from the chosen start (cap at service max)
  const availableFromStart = selectedStart
    ? Math.floor((winEndMins - toMins(selectedStart)) / 60)
    : Math.floor((winEndMins - winStartMins) / 60);
  const effectiveMaxDuration = Math.min(
    maxDuration ?? availableFromStart,
    availableFromStart
  );

  const total = isHourly ? unitPrice * duration : unitPrice;

  const effectiveStart = selectedStart ?? (isHourly && hourlyWindow ? winStartStr : null);
  const canSubmit = selectedPsId && selectedDate &&
    (priceUnit === "flat" || priceUnit === "per_item" || effectiveStart);

  function fmtTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
  }

  function pickBio(bio: Record<string, string> | null) {
    if (!bio) return null;
    return bio[currentLocale] ?? bio.en ?? null;
  }

  // ── Payment step ────────────────────────────────────────────────────────────
  // When the server action succeeds it returns { clientSecret, bookingId, total }
  // instead of redirecting. We switch to the inline Stripe card form.
  if (state && "clientSecret" in state) {
    const returnUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}/stay/${token}/bookings`;
    return (
      <div className="space-y-6">
        {/* Summary — read-only recap of what they're paying for */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium text-foreground">{serviceName}</p>
            <p className="text-xl font-semibold text-foreground">€{state.total.toFixed(2)}</p>
          </div>
          {selected && (
            <p className="text-xs text-muted-foreground">
              {selected.provider.name}
              {selectedDate && ` · ${formatDate(selectedDate, { locale })}`}
              {isHourly && effectiveStart && bookingEndStr
                ? ` · ${fmtTime(effectiveStart + ":00")} – ${fmtTime(bookingEndStr + ":00")}`
                : isHourly ? ` · ${duration}h` : ""}
            </p>
          )}
        </div>

        <StripePaymentForm
          clientSecret={state.clientSecret}
          bookingId={state.bookingId}
          locale={locale}
          token={token}
          returnUrl={returnUrl}
          mode="authorize"
          total={state.total}
        />

        {/* Back — cancels the intent client-side by navigating away */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const dateButtonClass = (active: boolean, disabled = false) => cn(
    "px-3 py-2 rounded-xl border text-sm transition-all",
    disabled
      ? "opacity-35 line-through cursor-not-allowed border-border text-muted-foreground"
      : active
        ? "bg-foreground text-background border-foreground"
        : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="provider_service_id" value={selectedPsId ?? ""} />
      <input type="hidden" name="booking_date" value={selectedDate ?? ""} />
      <input type="hidden" name="start_time" value={effectiveStart ?? ""} />
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
              {(datesWithSlots.length > 0 ? datesWithSlots : stayDates).map((d) => {
                const past = isPastDate(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { if (!past) { setSelectedDate(d); setSelectedStart(null); } }}
                    disabled={past}
                    className={dateButtonClass(selectedDate === d, past)}
                  >
                    {formatDate(d, { locale })}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Time */}
      {selectedDate && (
        <div>
          {isHourly ? (
            /* ── Hourly: free start-time picker within provider's window ── */
            hourlyWindow ? (
              <div className="space-y-4">
                {/* Available window hint */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 bg-muted/60 border border-border px-3 py-1.5 rounded-full">
                    {t("availableWindow") || "Provider available"}
                    {": "}
                    <span className="font-semibold text-foreground">
                      {fmtTime(hourlyWindow.start_time)} – {fmtTime(hourlyWindow.end_time)}
                    </span>
                  </span>
                </div>

                {/* Start time picker */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">{t("chooseTime")}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Start time</label>
                      <input
                        type="time"
                        value={selectedStart ?? winStartStr}
                        min={selectedDate === today ? (nowMinutes > winStartMins ? fromMins(nowMinutes + 1) : winStartStr) : winStartStr}
                        max={maxStartStr}
                        onChange={(e) => {
                          setSelectedStart(e.target.value);
                          // If current duration now exceeds the window, shrink it
                          const newMaxDur = Math.floor((winEndMins - toMins(e.target.value)) / 60);
                          if (duration > newMaxDur) setDuration(Math.max(minDuration ?? 1, newMaxDur));
                        }}
                        className="border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>

                    {bookingEndStr && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Ends at</p>
                        <p className="text-sm font-semibold text-foreground bg-muted/50 rounded-xl px-3 py-2.5 border border-border">
                          {fmtTime(bookingEndStr + ":00")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              selectedDate && <p className="text-sm text-muted-foreground">{t("noAvailability")}</p>
            )
          ) : (
            /* ── Non-hourly: pick a provider-defined slot ── */
            slotsForDate.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-foreground mb-3">{t("chooseTime")}</p>
                <div className="flex flex-wrap gap-2">
                  {slotsForDate.map((slot) => {
                    const past = isPastSlot(slot.start_time);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => { if (!past) setSelectedStart(slot.start_time); }}
                        disabled={past}
                        className={dateButtonClass(selectedStart === slot.start_time, past)}
                      >
                        {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Step 4: Duration (per_hour only) */}
      {isHourly && selectedDate && (selectedStart ?? winStartStr) && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("duration")}</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              { length: Math.max(0, effectiveMaxDuration - (minDuration ?? 1) + 1) },
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
                {isHourly && effectiveStart && bookingEndStr
                  ? ` · ${fmtTime(effectiveStart + ":00")} – ${fmtTime(bookingEndStr + ":00")} (${duration}h)`
                  : isHourly ? ` · ${duration}h` : ""}
              </p>
            </div>
            <p className="text-xl font-semibold text-foreground">€{total.toFixed(2)}</p>
          </div>

          {state && "error" in state && (
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
                <span>Setting up payment…</span>
              </span>
            ) : (
              `Continue to payment — €${total.toFixed(2)}`
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Your card will be held but not charged until the provider confirms.
          </p>
        </div>
      )}
    </form>
  );
}
