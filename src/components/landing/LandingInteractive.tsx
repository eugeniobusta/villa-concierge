"use client";

import { useRef, useState, useCallback } from "react";
import {
  ChefHat, Sparkles, ShoppingCart, Dumbbell, Flower2,
  Car, Map, Wine, Baby, Waves, ArrowRight,
} from "lucide-react";

/* ─── types ─────────────────────────────────────────────── */
export interface ServiceData {
  key:         string;
  label:       string;
  description: string;
}

interface Props {
  services: ServiceData[];
}

/* ─── icon config ────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  chef: ChefHat, cleaning: Sparkles, groceries: ShoppingCart,
  yoga: Dumbbell, massage: Flower2, transfer: Car,
  tours: Map, wine: Wine, childcare: Baby, laundry: Waves,
};

// Unique CSS animation per icon — reflects each service's character
const ICON_ANIM: Record<string, string> = {
  chef:      "lp-wiggle 2.8s ease-in-out infinite",
  cleaning:  "lp-spin 9s linear infinite",
  groceries: "lp-roll 3s ease-in-out infinite",
  yoga:      "lp-lift 2.2s ease-in-out infinite",
  massage:   "lp-bloom 4.5s ease-in-out infinite",
  transfer:  "lp-drive 3.5s ease-in-out infinite",
  tours:     "lp-compass 14s linear infinite",
  wine:      "lp-sway 3.2s ease-in-out infinite",
  childcare: "lp-bounce 1.8s ease-in-out infinite",
  laundry:   "lp-wave 2.8s ease-in-out infinite",
};

const ICON_COLOR: Record<string, string> = {
  chef:      "bg-amber-100   text-amber-700   dark:bg-amber-950/80   dark:text-amber-400",
  cleaning:  "bg-sky-100     text-sky-700     dark:bg-sky-950/80     dark:text-sky-400",
  groceries: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400",
  yoga:      "bg-violet-100  text-violet-700  dark:bg-violet-950/80  dark:text-violet-400",
  massage:   "bg-rose-100    text-rose-700    dark:bg-rose-950/80    dark:text-rose-400",
  transfer:  "bg-slate-100   text-slate-700   dark:bg-slate-900      dark:text-slate-400",
  tours:     "bg-orange-100  text-orange-700  dark:bg-orange-950/80  dark:text-orange-400",
  wine:      "bg-red-100     text-red-700     dark:bg-red-950/80     dark:text-red-400",
  childcare: "bg-yellow-100  text-yellow-700  dark:bg-yellow-950/80  dark:text-yellow-400",
  laundry:   "bg-teal-100    text-teal-700    dark:bg-teal-950/80    dark:text-teal-400",
};

/* ─── 3-D tilt card ──────────────────────────────────────── */
function TiltCard({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<React.CSSProperties>({});

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    setTilt({
      transform: `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(8px)`,
      transition: "transform 0.08s ease",
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({
      transform: "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      transition: "transform 0.55s cubic-bezier(.34,1.56,.64,1)",
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        ...tilt,
        willChange: "transform",
        animation: `lp-fade-up 0.55s ease both ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Marquee row ────────────────────────────────────────── */
function MarqueeRow({
  services,
  reverse,
  speed,
}: {
  services: ServiceData[];
  reverse: boolean;
  speed: number;
}) {
  // Duplicate so the seam is invisible
  const items = [...services, ...services, ...services];

  return (
    <div className="overflow-hidden py-3 select-none">
      <div
        className="flex gap-5 w-max"
        style={{
          animation: `${reverse ? "lp-marquee-rev" : "lp-marquee"} ${speed}s linear infinite`,
        }}
      >
        {items.map((svc, i) => {
          const Icon = ICON_MAP[svc.key] ?? ChefHat;
          return (
            <div
              key={`${svc.key}-${i}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-background/60 border border-border/60 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {svc.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────── */
export default function LandingInteractive({ services }: Props) {
  return (
    <>
      {/* ── Marquee band ── */}
      <section className="py-2 border-y border-border bg-muted/30 overflow-hidden">
        <MarqueeRow services={services} reverse={false} speed={28} />
        <MarqueeRow services={services} reverse={true}  speed={22} />
      </section>

      {/* ── Services grid ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.18em]">
            Available Services
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {services.map((svc, i) => {
            const Icon  = ICON_MAP[svc.key] ?? ChefHat;
            const color = ICON_COLOR[svc.key] ?? "bg-muted text-muted-foreground";
            const anim  = ICON_ANIM[svc.key];

            return (
              <TiltCard
                key={svc.key}
                delay={i * 0.05}
                className="group relative bg-card border border-border rounded-2xl p-5 shadow-warm-sm
                           hover:shadow-warm hover:border-primary/35 cursor-default overflow-hidden"
              >
                {/* Hover glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                {/* Animated icon */}
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon
                    className="h-5 w-5"
                    style={{ animation: anim }}
                  />
                </div>

                {/* Text */}
                <p className="relative font-semibold text-foreground text-sm leading-tight mb-1">
                  {svc.label}
                </p>
                <p className="relative text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {svc.description}
                </p>

                {/* Hover arrow */}
                <ArrowRight
                  className="absolute bottom-4 right-4 h-3.5 w-3.5 text-primary
                             opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                             transition-all duration-200"
                />
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            Simple for everyone
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {[
            {
              step: "01",
              icon: "🔑",
              title: "Host sets up the stay",
              desc: "Enter guest name and dates. A unique, time-limited access link is generated instantly.",
            },
            {
              step: "02",
              icon: "📱",
              title: "Guest opens their link",
              desc: "No app, no account. Guests see every available service and can book directly from their phone.",
            },
            {
              step: "03",
              icon: "✅",
              title: "Book, pay & relax",
              desc: "Secure Stripe checkout in seconds. Everything is arranged — the guest just shows up.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative text-center md:text-left">
              {/* Step number bubble */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 border border-primary/20 mb-5 relative">
                <span className="text-2xl">{icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
