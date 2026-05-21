"use client";

import { useState, useTransition } from "react";
import { bulkAddSlotsAction, deleteSlotAction } from "@/actions/availability";
import { Trash2, Loader2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface Props {
  slots: Slot[];
  dates: string[]; // next 21 days as YYYY-MM-DD
}

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function fmtTime(t: string) {
  return t.slice(0, 5);
}

// Mon=0 … Sun=6
function weekdayIndex(dateStr: string) {
  return (new Date(dateStr + "T00:00:00").getDay() + 6) % 7;
}

export default function AvailabilityManager({ slots, dates }: Props) {
  const [startTime, setStartTime]       = useState("09:00");
  const [endTime,   setEndTime]         = useState("17:00");
  const [selected,  setSelected]        = useState<Set<string>>(new Set());
  const [error,     setError]           = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  // ── Build week grid ─────────────────────────────────────────────────────────
  const firstDay = dates[0];
  const offset   = weekdayIndex(firstDay); // empty cells before first date
  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...dates,
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = Array.from(
    { length: cells.length / 7 },
    (_, i) => cells.slice(i * 7, i * 7 + 7)
  );

  // ── Slot lookup ─────────────────────────────────────────────────────────────
  const slotsByDate: Record<string, Slot[]> = {};
  for (const d of dates) slotsByDate[d] = [];
  for (const s of slots)  (slotsByDate[s.date] ??= []).push(s);
  const datesWithSlots = dates.filter((d) => slotsByDate[d].length > 0);

  // ── Selection helpers ───────────────────────────────────────────────────────
  function toggle(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  }

  function selectWeekdays() {
    setSelected(new Set(dates.filter((d) => weekdayIndex(d) < 5)));
  }

  function selectAll() { setSelected(new Set(dates)); }
  function clearSel()  { setSelected(new Set()); }

  // ── Bulk add ─────────────────────────────────────────────────────────────────
  function handleAdd() {
    if (!selected.size) return;
    setError(null);
    startTransition(async () => {
      const result = await bulkAddSlotsAction(
        [...selected].sort(),
        startTime,
        endTime,
      );
      if (result?.error) setError(result.error);
      else               setSelected(new Set());
    });
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  function handleDelete(slotId: string) {
    setDeletingId(slotId);
    startTransition(async () => {
      await deleteSlotAction(slotId);
      setDeletingId(null);
    });
  }

  const addLabel = selected.size === 0
    ? "Select days below"
    : `Add ${startTime}–${endTime} to ${selected.size} day${selected.size !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">

      {/* ══ Bulk-add card ══════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-warm-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Add availability
        </p>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">From</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Until</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Quick-select row */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: "Weekdays",  fn: selectWeekdays },
            { label: "All days",  fn: selectAll      },
            { label: "Clear",     fn: clearSel       },
          ].map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={fn}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Week grid */}
        <div className="mb-4 select-none">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DAY_LABELS.map((l) => (
              <p key={l} className="text-center text-[10px] font-semibold text-muted-foreground/50 uppercase">
                {l}
              </p>
            ))}
          </div>

          {/* Date cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
              {week.map((date, di) => {
                if (!date) return <div key={di} />;
                const isSel     = selected.has(date);
                const hasSlot   = (slotsByDate[date]?.length ?? 0) > 0;
                const isToday   = date === firstDay;
                const dayNum    = parseInt(date.split("-")[2]);
                const monthAbbr = new Date(date + "T00:00:00")
                  .toLocaleDateString("en-GB", { month: "short" });
                const showMonth = dayNum === 1;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => toggle(date)}
                    title={fmtDate(date)}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl py-2 text-xs font-medium transition-all",
                      isSel
                        ? "bg-primary text-primary-foreground shadow-warm-sm"
                        : "bg-muted/40 hover:bg-muted text-foreground",
                      isToday && !isSel && "ring-2 ring-primary/60 ring-offset-1 ring-offset-background"
                    )}
                  >
                    <span className="leading-none">{dayNum}</span>
                    {showMonth && (
                      <span className={cn("text-[9px] mt-0.5 leading-none", isSel ? "opacity-70" : "text-muted-foreground/60")}>
                        {monthAbbr}
                      </span>
                    )}
                    {/* Green dot — day already has slots */}
                    {hasSlot && (
                      <span className={cn(
                        "absolute bottom-1 w-1 h-1 rounded-full",
                        isSel ? "bg-white/60" : "bg-emerald-500"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-xl mb-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected.size || isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</>
            : <><CalendarCheck className="h-4 w-4" /> {addLabel}</>
          }
        </button>
      </div>

      {/* ══ Existing slots ════════════════════════════════════════════════════ */}
      {datesWithSlots.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Your schedule
          </p>
          <div className="space-y-2">
            {datesWithSlots.map((date) => (
              <div key={date} className="bg-card rounded-2xl border border-border px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {fmtDate(date)}
                  {date === firstDay && (
                    <span className="ml-2 text-primary/70 font-normal">Today</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slotsByDate[date].map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-xl px-3 py-1.5 text-xs font-medium"
                    >
                      {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={isPending}
                        className="text-primary/40 hover:text-destructive transition-colors ml-0.5 disabled:opacity-30"
                      >
                        {deletingId === slot.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {datesWithSlots.length === 0 && slots.length === 0 && (
        <p className="text-sm text-muted-foreground/50 text-center py-4">
          No availability set yet. Select a time range and days above.
        </p>
      )}
    </div>
  );
}
