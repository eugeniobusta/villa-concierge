import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import LandingInteractive from "@/components/landing/LandingInteractive";
import {
  ChefHat, Dumbbell, ShoppingCart, Flower2, Car, Wine, Sun,
} from "lucide-react";

/* ── Hero floating icons (right-side cloud, desktop only) ─── */
const HERO_FLOATERS = [
  { Icon: ChefHat,      rot:  4, x: 12, y:  8, dur: 5.5, delay: 0.0, bg: "bg-amber-100   dark:bg-amber-950/80",   fg: "text-amber-600   dark:text-amber-400"   },
  { Icon: Flower2,      rot: -6, x: 52, y: 22, dur: 7.2, delay: 1.1, bg: "bg-rose-100    dark:bg-rose-950/80",    fg: "text-rose-600    dark:text-rose-400"     },
  { Icon: ShoppingCart, rot:  2, x: 18, y: 52, dur: 6.0, delay: 0.7, bg: "bg-emerald-100 dark:bg-emerald-950/80", fg: "text-emerald-600 dark:text-emerald-400"  },
  { Icon: Wine,         rot: -4, x: 72, y: 12, dur: 8.0, delay: 0.4, bg: "bg-red-100     dark:bg-red-950/80",     fg: "text-red-600     dark:text-red-400"      },
  { Icon: Car,          rot:  3, x: 78, y: 50, dur: 5.2, delay: 2.0, bg: "bg-slate-100   dark:bg-slate-900",      fg: "text-slate-600   dark:text-slate-400"    },
  { Icon: Dumbbell,     rot: -5, x: 38, y: 80, dur: 6.8, delay: 3.0, bg: "bg-violet-100  dark:bg-violet-950/80",  fg: "text-violet-600  dark:text-violet-400"   },
];

export default async function LandingPage() {
  const t  = await getTranslations("landing");
  const ts = await getTranslations("services");

  const services = (
    ["chef","cleaning","groceries","yoga","massage","transfer","tours","wine","childcare","laundry"] as const
  ).map((key) => ({
    key,
    label:       ts(`${key}.label`),
    description: ts(`${key}.description`),
  }));

  const headline = t("headline");
  const commaIdx = headline.lastIndexOf(",");
  const beforeComma = commaIdx >= 0 ? headline.slice(0, commaIdx) : headline;
  const afterComma  = commaIdx >= 0 ? headline.slice(commaIdx + 1) : "";

  return (
    <div className="min-h-screen bg-background">

      {/* ══ Header ══ */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground tracking-tight text-sm">
              Villa Concierge
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-background dark:from-amber-950/25 dark:via-orange-950/8 dark:to-background" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-amber-100/25 dark:bg-amber-900/10 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-100/20 dark:bg-orange-900/8 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-6xl mx-auto px-5 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: Text ── */}
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary tracking-wide uppercase">
                  {t("badge")}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground tracking-tight leading-[1.06] mb-6">
                {beforeComma},
                <br />
                <span className="text-gradient">{afterComma}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                {t("subtext")}
              </p>

              {/* Host notice */}
              <div className="inline-flex items-start gap-3 bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-5 py-4 shadow-warm-sm max-w-md">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sun className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("notice")}
                </p>
              </div>
            </div>

            {/* ── Right: Floating icons cloud (desktop only) ── */}
            <div className="relative h-[460px] hidden lg:block">
              {HERO_FLOATERS.map(({ Icon, rot, x, y, dur, delay, bg, fg }, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top:  `${y}%`,
                    // CSS custom property drives rotation so keyframe stays clean
                    ["--r" as string]: `${rot}deg`,
                    animation: `lp-hero-float ${dur}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center shadow-warm border border-white/20 dark:border-white/5`}>
                    <Icon className={`h-7 w-7 ${fg}`} />
                  </div>
                </div>
              ))}

              {/* Central glow orb */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-current animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ Interactive sections (client component) ══ */}
      <LandingInteractive services={services} />

      {/* ══ Footer ══ */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            Villa Concierge Malaga · Private platform
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground/60">Live</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
