"use client";

import { useState, useTransition } from "react";
import { addSlotAction, deleteSlotAction } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface Props {
  slots: Slot[];
  dates: string[]; // next 21 days
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "short",
  });
}

function fmtTime(t: string) { return t.slice(0, 5); }

function isToday(d: string) {
  return d === new Date().toISOString().split("T")[0];
}

export default function AvailabilityManager({ slots, dates }: Props) {
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [startTime,  setStartTime]  = useState("09:00");
  const [endTime,    setEndTime]    = useState("17:00");
  const [error,      setError]      = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();

  const slotsByDate = dates.reduce<Record<string, Slot[]>>((acc, date) => {
    acc[date] = slots.filter((s) => s.date === date);
    return acc;
  }, {});

  async function handleAdd(date: string) {
    setError(null);
    const fd = new FormData();
    fd.append("date", date);
    fd.append("start_time", startTime);
    fd.append("end_time", endTime);

    startTransition(async () => {
      const result = await addSlotAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setAddingDate(null);
        setStartTime("09:00");
        setEndTime("17:00");
      }
    });
  }

  async function handleDelete(slotId: string) {
    startTransition(async () => { await deleteSlotAction(slotId); });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      {dates.map((date) => {
        const daySlots = slotsByDate[date] ?? [];
        const isAdding = addingDate === date;
        const today    = isToday(date);

        return (
          <div
            key={date}
            className={cn(
              "bg-card rounded-2xl border p-4 transition-colors",
              today ? "border-primary/30 bg-primary/3" : "border-border"
            )}
          >
            {/* Date header */}
            <div className="flex items-center justify-between mb-3">
              <p className={cn(
                "text-sm font-medium",
                today ? "text-primary" : "text-foreground"
              )}>
                {fmtDate(date)}
                {today && (
                  <span className="ml-2 text-xs font-normal text-primary/70">Today</span>
                )}
              </p>
              {!isAdding && (
                <button
                  onClick={() => { setAddingDate(date); setError(null); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add slot
                </button>
              )}
            </div>

            {/* Existing slots */}
            {daySlots.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-xl px-3 py-1.5 text-xs font-medium"
                  >
                    {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                    <button
                      onClick={() => handleDelete(slot.id)}
                      disabled={isPending}
                      className="text-primary/50 hover:text-destructive transition-colors ml-1 disabled:opacity-40"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {daySlots.length === 0 && !isAdding && (
              <p className="text-xs text-muted-foreground/40 mb-2">No availability set</p>
            )}

            {/* Add slot form */}
            {isAdding && (
              <div className="bg-muted/40 rounded-xl p-3 space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">From</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Until</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleAdd(date)}
                    disabled={isPending}
                    className="text-xs"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                      </span>
                    ) : "Save slot"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAddingDate(null); setError(null); }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
