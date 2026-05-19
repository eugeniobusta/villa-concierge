"use client";

/**
 * SpotlightTour — guided tour engine.
 *
 * Design principles:
 *  1. Tooltip is ALWAYS at the bottom of the screen — never cut off on any device.
 *  2. A full-screen click-catcher at the top of the z-stack intercepts ALL clicks
 *     so elements behind the overlay can never be accidentally activated.
 *  3. We never manipulate z-index of target elements — the SVG mask creates the
 *     visual hole without needing to lift elements out of the stacking context.
 *  4. Scroll is fully automatic — user only needs to tap "Next".
 *  5. Cleanup is deterministic — one setVisible(false) removes everything.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { SanchamarLogo } from "@/components/SanchamarLogo";

export interface TourStep {
  /** data-tour="value" attribute on the element to spotlight (omit = welcome card) */
  target?: string;
  title:   string;
  body:    string;
}

interface Props {
  steps:      TourStep[];
  storageKey: string;
  name?:      string;
}

/* How many px to reserve at the bottom for the tooltip card */
const TOOLTIP_RESERVE = 180;
/* Gap between header and element when we auto-scroll */
const HEADER_CLEARANCE = 72;

export function SpotlightTour({ steps, storageKey, name }: Props) {
  const [visible,  setVisible]  = useState(false);
  const [step,     setStep]     = useState(0);
  const [hole, setHole] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const scrollTimer = useRef<number>(0);
  const syncTimer   = useRef<number>(0);

  /* ── Mount: show once ── */
  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      const t = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [storageKey]);

  /* ── Scroll + measure target element ── */
  const positionSpotlight = useCallback((target?: string) => {
    setHole(null);
    if (!target) return;

    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) return;

    // Measure current position
    const rect = el.getBoundingClientRect();
    const vh   = window.innerHeight;

    // Desired: element sits just below the sticky header, leaving bottom for tooltip
    const idealTop   = HEADER_CLEARANCE;
    const maxAllowedBottom = vh - TOOLTIP_RESERVE - 16;

    // Calculate how much to scroll
    let scrollDelta = 0;
    if (rect.top < idealTop) {
      // Element is above target position — scroll up
      scrollDelta = rect.top - idealTop;
    } else if (rect.bottom > maxAllowedBottom) {
      // Element bottom would overlap tooltip — scroll down just enough
      scrollDelta = rect.bottom - maxAllowedBottom;
    }
    // No scroll needed if element already in the safe zone

    if (Math.abs(scrollDelta) > 10) {
      window.scrollBy({ top: scrollDelta, behavior: "smooth" });
    }

    // Measure after scroll animation completes (600 ms is generous for mobile)
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      setHole({ x: r.left, y: r.top, w: r.width, h: r.height });
    }, 620);
  }, []);

  /* Trigger positioning whenever step or visibility changes */
  useEffect(() => {
    if (visible) positionSpotlight(steps[step]?.target);
    return () => {
      window.clearTimeout(scrollTimer.current);
      window.clearTimeout(syncTimer.current);
    };
  }, [visible, step]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Keep spotlight in sync during any residual scroll / resize */
  useEffect(() => {
    if (!visible || !steps[step]?.target) return;
    const sync = () => {
      const el = document.querySelector(`[data-tour="${steps[step].target}"]`) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setHole({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
    };
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [visible, step, steps]);

  /* ── Navigation ── */
  function advance() {
    if (step < steps.length - 1) {
      setHole(null); // clear hole immediately — smoother transition
      setStep(s => s + 1);
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem(storageKey, "1");
    setHole(null);
    setVisible(false);
  }

  if (!visible) return null;

  const cur      = steps[step];
  const isLast   = step === steps.length - 1;
  const isWelcome = !cur.target;
  const PAD       = 12;

  /* Progress dots */
  function Dots() {
    return (
      <div className="flex items-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === step ? 18 : 6,
              height:     6,
              background: i === step ? "var(--primary)" : "var(--muted-foreground)",
              opacity:    i === step ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── 1. Visual overlay (SVG with mask hole) — NO pointer events ── */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg width="100%" height="100%" style={{ display: "block", position: "absolute", inset: 0 }}>
          <defs>
            <mask id="sanchamar-tour-mask">
              {/* White = show overlay; Black = cut out = reveal element */}
              <rect width="100%" height="100%" fill="white" />
              {hole && (
                <rect
                  x={hole.x - PAD}
                  y={hole.y - PAD}
                  width={hole.w + PAD * 2}
                  height={hole.h + PAD * 2}
                  rx="14"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%" height="100%"
            fill={isWelcome ? "rgba(0,0,0,0.80)" : "rgba(0,0,0,0.76)"}
            mask="url(#sanchamar-tour-mask)"
          />
        </svg>
      </div>

      {/* ── 2. Gold ring around spotlight ── */}
      {hole && (
        <div
          className="fixed pointer-events-none rounded-2xl"
          style={{
            zIndex:    9999,
            left:      hole.x - PAD,
            top:       hole.y - PAD,
            width:     hole.w + PAD * 2,
            height:    hole.h + PAD * 2,
            boxShadow: "0 0 0 2.5px rgba(196,148,10,0.95), 0 0 28px rgba(196,148,10,0.35)",
            transition: "all 0.35s cubic-bezier(0.34,1.1,0.64,1)",
          }}
        />
      )}

      {/* ── 3. Click catcher — intercepts ALL taps/clicks, advances tour ── */}
      {/*    This sits ABOVE the overlay and target elements, so nothing      */}
      {/*    behind it can be accidentally activated during the tour.          */}
      <div
        className="fixed inset-0 cursor-pointer"
        style={{ zIndex: 10000 }}
        onClick={advance}
        aria-hidden="true"
      />

      {/* ── 4a. Welcome card (step 0) — centered modal ── */}
      {isWelcome && (
        <div
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{ zIndex: 10001, pointerEvents: "none" }}
        >
          <div
            className="bg-card border border-border rounded-3xl p-7 w-full max-w-xs text-center shadow-warm-lg"
            style={{ pointerEvents: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <SanchamarLogo variant="mark" height={52} />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {name ? `Welcome, ${name}!` : cur.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {cur.body}
            </p>
            <div className="flex justify-center mb-5"><Dots /></div>
            <button
              onClick={(e) => { e.stopPropagation(); advance(); }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Show me how →
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); finish(); }}
              className="mt-3 block mx-auto text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>
      )}

      {/* ── 4b. Spotlight tooltip — ALWAYS pinned to bottom of screen ── */}
      {/*    Safe on every phone because it never depends on element position. */}
      {!isWelcome && (
        <div
          className="fixed left-3 right-3"
          style={{ zIndex: 10001, bottom: 24, pointerEvents: "auto" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-card border border-border rounded-2xl px-4 py-4 shadow-warm-lg">
            {/* Step label */}
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
              Step {step} of {steps.length - 1}
            </p>
            <p className="font-bold text-foreground text-sm mb-1">{cur.title}</p>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">{cur.body}</p>
            <div className="flex items-center justify-between">
              <Dots />
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); finish(); }}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); advance(); }}
                  className="flex items-center gap-1.5 text-sm font-bold bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all shadow-warm-sm"
                >
                  {isLast ? "Got it ✓" : "Next"}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
