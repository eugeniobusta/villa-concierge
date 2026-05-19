"use client";

// All interactivity lives here: selecting provider, date, time, duration.
// The server page passed in pre-fetched data as props — we don't fetch anything.

import { useActionState, useState } from "react";
import { createBookingAction } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/guest-session";
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
  stayDates: string[];      // ["2026-06-20", "2026-06-21", ...]
  locale: string;
  token: string;
}

export default function BookingForm({
  serviceName,
  basePrice,
  priceUnit,
  minDuration,
  maxDuration,
  providers,
  stayDates,
  locale,
  token,
}: Props) {
  const [state, formAction, isPending] = useActionState(createBookingAction, null);

  const [selectedPsId, setSelectedPsId]   = useState<string | null>(
    providers.length === 1 ? providers[0].providerServiceId : null
  );
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [duration, setDuration]           = useState<number>(minDuration ?? 1);

  const selected = providers.find((p) => p.providerServiceId === selectedPsId);
  const unitPrice = selected?.customPrice ?? basePrice;

  // Slots for the selected provider on the selected date
  const slotsForDate = selected && selectedDate
    ? selected.slots.filter((s) => s.date === selectedDate && !s.is_blocked)
    : [];

  // Dates that have at least one available slot for the selected provider
  const datesWithSlots = selected
    ? stayDates.filter((d) =>
        selected.slots.some((s) => s.date === d && !s.is_blocked)
      )
    : stayDates;

  const isHourly = priceUnit === "per_hour";
  const total = isHourly ? unitPrice * duration : unitPrice;

  const canSubmit =
    selectedPsId &&
    selectedDate &&
    (priceUnit === "flat" || priceUnit === "per_item" || selectedStart);

  function formatTime(t: string) {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="provider_service_id" value={selectedPsId ?? ""} />
      <input type="hidden" name="booking_date" value={selectedDate ?? ""} />
      <input type="hidden" name="start_time" value={selectedStart ?? ""} />
      <input type="hidden" name="duration_hours" value={isHourly ? duration : 0} />

      {/* Step 1: Choose provider (skip if only one) */}
      {providers.length > 1 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-3">Choose Provider</p>
          <div className="grid gap-3">
            {providers.map((p) => (
              <button
                key={p.providerServiceId}
                type="button"
                onClick={() => {
                  setSelectedPsId(p.providerServiceId);
                  setSelectedDate(null);
                  setSelectedStart(null);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                  selectedPsId === p.providerServiceId
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-sm flex-shrink-0">
                  {p.provider.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm">{p.provider.name}</p>
                  {p.provider.bio && (
                    <p className="text-xs text-stone-400 truncate">
                      {(p.provider.bio as Record<string, string>).en}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-amber-700 flex-shrink-0">
                  €{p.customPrice ?? basePrice}
                  {isHourly ? "/hr" : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose date */}
      {selectedPsId && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-3">Choose Date</p>
          {datesWithSlots.length === 0 && priceUnit !== "flat" && priceUnit !== "per_item" ? (
            <p className="text-sm text-stone-400">
              No availability during your stay. Contact your host.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(datesWithSlots.length > 0 ? datesWithSlots : stayDates).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setSelectedDate(d); setSelectedStart(null); }}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-sm transition-all",
                    selectedDate === d
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                  )}
                >
                  {formatDate(d, { weekday: "short", day: "numeric", month: "short" })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Choose time (only if service requires scheduling and has slots) */}
      {selectedDate && slotsForDate.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-3">Choose Time</p>
          <div className="flex flex-wrap gap-2">
            {slotsForDate.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedStart(slot.start_time)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-sm transition-all",
                  selectedStart === slot.start_time
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                )}
              >
                {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Duration (only for hourly services) */}
      {isHourly && selectedDate && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-3">Duration</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              { length: (maxDuration ?? 8) - (minDuration ?? 1) + 1 },
              (_, i) => (minDuration ?? 1) + i
            ).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDuration(h)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-sm transition-all",
                  duration === h
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                )}
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
          <label className="text-sm font-medium text-stone-700 block mb-2">
            Special requests <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Dietary requirements, preferences, anything we should know…"
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* Price summary + submit */}
      {canSubmit && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-stone-800">{serviceName}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {selected?.provider.name}
                {selectedDate && ` · ${formatDate(selectedDate)}`}
                {isHourly && ` · ${duration}h`}
              </p>
            </div>
            <p className="text-xl font-semibold text-stone-900">€{total.toFixed(2)}</p>
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPending ? "Requesting…" : "Request Booking · €" + total.toFixed(2)}
          </Button>
          <p className="text-xs text-stone-400 text-center mt-2">
            Payment will be collected when your booking is confirmed.
          </p>
        </div>
      )}
    </form>
  );
}
