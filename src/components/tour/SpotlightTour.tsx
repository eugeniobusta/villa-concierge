"use client";

/**
 * SpotlightTour — a lightweight guided tour engine.
 *
 * How it works:
 *  • An SVG overlay darkens the entire screen.
 *  • A "mask hole" in the SVG reveals the target element in full colour.
 *  • The target element gets a temporary z-index boost so it sits above the overlay.
 *  • A tooltip card anchors above or below the spotlight.
 *  • State persists in localStorage so the tour only shows once per device.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { SanchamarLogo } from "@/components/SanchamarLogo";

/* ── Types ──────────────────────────────────────────────────────── */

export interface TourStep {
  /** data-tour="..." attribute on the element to spotlight.
   *  Omit for a full-screen welcome card (no spotlight). */
  target?: string;
  title:  string;
  body:   string;
}

interface Props {
  steps:      TourStep[];
  storageKey: string;  // localStorage key — tour shows until this is set
  name?:      string;  // person's name for the welcome step
}

/* ── Component ──────────────────────────────────────────────────── */

export function SpotlightTour({ steps, storageKey, name }: Props) {
  const [visible,  setVisible]  = useState(false);
  const [step,     setStep]     = useState(0);
  const [spotRect, setSpotRect] = useState<DOMRect | null>(null);
  const prevElRef = useRef<HTMLElement | null>(null);
  const tickRef   = useRef<number>(0);

  /* Show tour if not seen before */
  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      const id = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(id);
    }
  }, [storageKey]);

  /* ── Highlight the target element for the current step ── */
  const highlight = useCallback((target?: string) => {
    // Restore previous element
    if (prevElRef.current) {
      prevElRef.current.style.position = "";
      prevElRef.current.style.zIndex   = "";
      prevElRef.current = null;
    }
    setSpotRect(null);
    if (!target) return;

    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) return;

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Lift element above overlay
    el.style.position = "relative";
    el.style.zIndex   = "9999";
    prevElRef.current = el;

    // Update rect after scroll settles
    window.clearTimeout(tickRef.current);
    tickRef.current = window.setTimeout(() => {
      if (prevElRef.current) setSpotRect(prevElRef.current.getBoundingClientRect());
    }, 380);
  }, []);

  /* When step changes, re-highlight */
  useEffect(() => {
    if (visible) highlight(steps[step]?.target);
  }, [visible, step]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Keep spotlight in sync on scroll/resize */
  useEffect(() => {
    if (!visible || !steps[step]?.target) return;
    const sync = () => {
      if (prevElRef.current) setSpotRect(prevElRef.current.getBoundingClientRect());
    };
    window.addEventListener("scroll",  sync, { passive: true });
    window.addEventListener("resize",  sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [visible, step, steps]);

  /* ── Advance / finish ── */
  function advance() {
    if (step < steps.length - 1) setStep(s => s + 1);
    else                         finish();
  }

  function finish() {
    if (prevElRef.current) {
      prevElRef.current.style.position = "";
      prevElRef.current.style.zIndex   = "";
    }
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  }

  if (!visible) return null;

  /* ── Geometry ── */
  const cur      = steps[step];
  const isLast   = step === steps.length - 1;
  const isWelcome = !cur.target;
  const PAD       = 14;

  // Tooltip placement: below spotlight if target is in top half, else above
  let tipStyle: React.CSSProperties = {};
  if (spotRect) {
    const aboveHalf = spotRect.top < window.innerHeight * 0.55;
    const tipLeft   = Math.max(12,
      Math.min(spotRect.left, window.innerWidth - 288 - 12)
    );
    tipStyle = aboveHalf
      ? { top:    spotRect.bottom + PAD + 8,  left: tipLeft }
      : { bottom: window.innerHeight - spotRect.top + PAD + 8, left: tipLeft };
  }

  // Progress dots
  const Dots = () => (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === step ? 18 : 6,
            height:     6,
            background: i === step ? "var(--primary)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ── Overlay layer ── */}
      <div
        className="fixed inset-0 z-[9998] cursor-pointer"
        onClick={advance}
      >
        {spotRect ? (
          /* SVG with mask hole over the target element */
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: "block" }}
          >
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotRect.left - PAD}
                  y={spotRect.top  - PAD}
                  width={spotRect.width  + PAD * 2}
                  height={spotRect.height + PAD * 2}
                  rx="14"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%" height="100%"
              fill="rgba(0,0,0,0.82)"
              mask="url(#tour-mask)"
            />
          </svg>
        ) : (
          /* Full dark backdrop for welcome step */
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        )}
      </div>

      {/* ── Spotlight gold ring ── */}
      {spotRect && (
        <div
          className="fixed pointer-events-none z-[9999] rounded-2xl transition-all duration-300"
          style={{
            left:      spotRect.left  - PAD,
            top:       spotRect.top   - PAD,
            width:     spotRect.width  + PAD * 2,
            height:    spotRect.height + PAD * 2,
            boxShadow: "0 0 0 2.5px rgba(196,148,10,0.9), 0 0 24px rgba(196,148,10,0.35)",
          }}
        />
      )}

      {/* ── Welcome card (no spotlight) ── */}
      {isWelcome && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6 pointer-events-none">
          <div
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-xs text-center shadow-warm-lg pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <SanchamarLogo variant="mark" height={56} />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-1.5">
              {name ? `Welcome, ${name}!` : cur.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {cur.body}
            </p>

            <div className="flex justify-center mb-5">
              <Dots />
            </div>

            <button
              onClick={advance}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Show me how →
            </button>
            <button
              onClick={finish}
              className="mt-3 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>
      )}

      {/* ── Spotlight tooltip card ── */}
      {!isWelcome && spotRect && (
        <div
          className="fixed z-[10000] w-72 pointer-events-auto"
          style={tipStyle}
          onClick={e => e.stopPropagation()}
        >
          {/* Arrow pointing toward element */}
          {(() => {
            const aboveHalf = spotRect.top < window.innerHeight * 0.55;
            return aboveHalf ? (
              /* Arrow up (tooltip is below element) */
              <div
                className="mb-[-1px] ml-5"
                style={{
                  width: 0, height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid var(--border)",
                }}
              />
            ) : (
              /* Arrow down (tooltip is above element) */
              <div
                className="mt-[-1px] ml-5"
                style={{
                  order: 1,
                  width: 0, height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid var(--border)",
                }}
              />
            );
          })()}

          <div className="bg-card border border-border rounded-2xl p-4 shadow-warm-lg">
            <p className="font-semibold text-foreground text-sm mb-1">{cur.title}</p>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">{cur.body}</p>

            <div className="flex items-center justify-between">
              <Dots />
              <div className="flex items-center gap-2">
                <button
                  onClick={finish}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={advance}
                  className="flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all"
                >
                  {isLast ? "Got it" : "Next"}
                  {!isLast && <ChevronRight className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
