"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, X, ArrowRight, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

interface BookingEvent {
  id:           string;
  total_amount: number;
  booking_date: string;
  receivedAt:   Date;
}

interface Props {
  locale: string;
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default function RealtimeBookingWatcher({ locale }: Props) {
  const router = useRouter();
  const [connected,   setConnected]   = useState(false);
  const [events,      setEvents]      = useState<BookingEvent[]>([]);
  const [dismissed,   setDismissed]   = useState<Set<string>>(new Set());
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-booking-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const row = payload.new as { id: string; total_amount: number; booking_date: string };
          const event: BookingEvent = {
            id:           row.id,
            total_amount: row.total_amount,
            booking_date: row.booking_date,
            receivedAt:   new Date(),
          };

          setEvents((prev) => [event, ...prev].slice(0, 5)); // keep last 5
          setDismissed((prev) => { const s = new Set(prev); s.delete(event.id); return s; });

          // Refresh server component data so stat cards + charts update live
          router.refresh();

          // Auto-dismiss notification after 10 s
          timerRef.current[event.id] = setTimeout(() => {
            setDismissed((prev) => new Set([...prev, event.id]));
          }, 10_000);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      Object.values(timerRef.current).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [router]);

  const visible = events.filter((e) => !dismissed.has(e.id));

  function dismiss(id: string) {
    clearTimeout(timerRef.current[id]);
    setDismissed((prev) => new Set([...prev, id]));
  }

  function dismissAll() {
    events.forEach((e) => clearTimeout(timerRef.current[e.id]));
    setDismissed(new Set(events.map((e) => e.id)));
  }

  return (
    <>
      {/* ── Live indicator (top-right of dashboard header) ── */}
      <div
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          connected ? "text-emerald-500" : "text-muted-foreground/50"
        }`}
        title={connected ? "Receiving live updates" : "Connecting…"}
      >
        {connected ? (
          <Wifi className="h-3.5 w-3.5" />
        ) : (
          <WifiOff className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">{connected ? "Live" : "Connecting…"}</span>
      </div>

      {/* ── Notification banners ── */}
      {visible.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
          {visible.length > 1 && (
            <button
              onClick={dismissAll}
              className="self-end text-xs text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              Dismiss all
            </button>
          )}

          {visible.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-primary/30 rounded-2xl p-4 shadow-warm-lg
                         animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">New booking received</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fmtDate(event.booking_date)}
                    <span className="mx-1.5 opacity-40">·</span>
                    <span className="font-medium text-foreground">€{event.total_amount.toFixed(2)}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {timeAgo(event.receivedAt)}
                  </p>
                  <Link
                    href={`/${locale}/admin/bookings`}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    View bookings <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(event.id)}
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar — shows time until auto-dismiss */}
              <div className="mt-3 h-0.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/40 rounded-full"
                  style={{ animation: "rtw-progress 10s linear forwards" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes rtw-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </>
  );
}
