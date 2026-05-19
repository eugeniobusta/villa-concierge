import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import LandingInteractive from "@/components/landing/LandingInteractive";
import {
  ChefHat, Dumbbell, ShoppingCart, Flower2, Car, Wine,
} from "lucide-react";

/* ── Hero floating icon cloud (right side, desktop) ─── */
const HERO_FLOATERS = [
  { Icon: ChefHat,      rot:  4, x: 10, y:  8, dur: 5.5, delay: 0.0, bg: "bg-amber-50/90   dark:bg-amber-950/60", fg: "text-amber-600   dark:text-amber-400" },
  { Icon: Flower2,      rot: -6, x: 50, y: 22, dur: 7.2, delay: 1.1, bg: "bg-rose-50/90    dark:bg-rose-950/60",  fg: "text-rose-600    dark:text-rose-400"   },
  { Icon: ShoppingCart, rot:  2, x: 14, y: 54, dur: 6.0, delay: 0.7, bg: "bg-emerald-50/90 dark:bg-emerald-950/60", fg: "text-emerald-600 dark:text-emerald-400" },
  { Icon: Wine,         rot: -4, x: 72, y: 10, dur: 8.0, delay: 0.4, bg: "bg-red-50/90     dark:bg-red-950/60",   fg: "text-red-600     dark:text-red-400"     },
  { Icon: Car,          rot:  3, x: 78, y: 52, dur: 5.2, delay: 2.0, bg: "bg-slate-50/90   dark:bg-slate-900/60", fg: "text-slate-600   dark:text-slate-400"   },
  { Icon: Dumbbell,     rot: -5, x: 36, y: 80, dur: 6.8, delay: 3.0, bg: "bg-violet-50/90  dark:bg-violet-950/60", fg: "text-violet-600  dark:text-violet-400" },
];

export default async function LandingPage() {
  const t  = await getTranslations("landing");
  const ts = await getTranslations("services");

  const services = (
    ["chef","cleaning","groceries","yoga","massage","transfer","tours","wine","childcare","laundry"] as const
  ).map((key) => ({ key, label: ts(`${key}.label`), description: ts(`${key}.description`) }));

  const headline = t("headline");
  const commaIdx = headline.lastIndexOf(",");
  const before   = commaIdx >= 0 ? headline.slice(0, commaIdx) : headline;
  const after    = commaIdx >= 0 ? headline.slice(commaIdx + 1) : "";

  return (
    <div className="min-h-screen bg-background">

      {/* ══ Header ══ */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <SanchamarLogo variant="full" height={28} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">

        {/* ── Malaga skyline SVG background ── */}
        <div className="absolute inset-0 -z-20">
          {/* Sky gradient: warm Mediterranean dawn */}
          <div className="absolute inset-0 bg-gradient-to-b
            from-[#1a2744] via-[#2d3e6e] to-[#8b6914]
            dark:from-[#0d1525] dark:via-[#1a2540] dark:to-[#3d2e08]
            opacity-90 dark:opacity-95" />

          {/* Stars layer (subtle, dark mode only) */}
          <div className="absolute inset-0 opacity-0 dark:opacity-100">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: i % 5 === 0 ? 2 : 1,
                  height: i % 5 === 0 ? 2 : 1,
                  left: `${(i * 37 + 3) % 98}%`,
                  top:  `${(i * 23 + 5) % 55}%`,
                  opacity: 0.4 + (i % 4) * 0.15,
                  animationDuration: `${2 + (i % 3)}s`,
                  animationDelay: `${(i * 0.3) % 2}s`,
                }}
              />
            ))}
          </div>

          {/* Malaga skyline silhouette SVG */}
          <svg
            viewBox="0 0 1440 480"
            preserveAspectRatio="xMidYMax slice"
            className="absolute bottom-0 left-0 right-0 w-full"
            fill="none"
          >
            {/* Sea / harbour */}
            <rect x="0" y="370" width="1440" height="110" fill="#0d2a52" opacity="0.9"/>
            <rect x="0" y="370" width="1440" height="8" fill="#1a4a8a" opacity="0.6"/>

            {/* Horizon glow */}
            <ellipse cx="720" cy="375" rx="600" ry="60" fill="#c4940a" opacity="0.18"/>

            {/* Cerro de Gibralfaro hill - far left */}
            <path d="M0 300 Q60 180 150 170 Q200 165 250 180 L300 320 L0 320 Z"
              fill="#0f1e38" opacity="0.95"/>

            {/* Alcazaba fortress */}
            <path d="M80 280 L80 230 L92 230 L92 218 L104 218 L104 208 L116 208
                     L116 218 L128 218 L128 208 L140 208 L140 218 L152 218 L152 230
                     L164 230 L164 280 Z" fill="#0a1628" opacity="0.98"/>
            {/* Alcazaba crenellations */}
            {[86,100,114,128,142,156].map((x, i) => (
              <rect key={i} x={x} y={200} width="8" height="14" fill="#0a1628" opacity="0.98"/>
            ))}
            {/* Alcazaba tower */}
            <rect x="96" y="175" width="28" height="55" rx="2" fill="#0c1b30" opacity="0.95"/>
            <path d="M96 175 Q110 158 124 175 Z" fill="#0c1b30" opacity="0.95"/>

            {/* White buildings - left hillside cluster */}
            <rect x="190" y="260" width="35" height="70" rx="2" fill="#0d1e38" opacity="0.9"/>
            <rect x="215" y="245" width="28" height="85" rx="2" fill="#0d1e38" opacity="0.88"/>
            <rect x="235" y="255" width="40" height="75" rx="2" fill="#0c1c36" opacity="0.9"/>
            <rect x="265" y="240" width="22" height="90" rx="2" fill="#0d1e38" opacity="0.88"/>

            {/* Cathedral - Malaga Catedral dome and towers */}
            <rect x="550" y="220" width="120" height="150" rx="3" fill="#0a1628"/>
            {/* Rose window */}
            <circle cx="610" cy="270" r="18" fill="#0e2040" opacity="0.8"/>
            {/* Left tower */}
            <rect x="548" y="160" width="38" height="65" rx="2" fill="#0c1b30"/>
            <path d="M548 160 L567 130 L586 160 Z" fill="#0c1b30"/>
            {/* Right tower (famous unfinished) */}
            <rect x="634" y="185" width="38" height="38" rx="2" fill="#0c1b30"/>
            {/* Cathedral flying buttresses */}
            <path d="M550 280 L510 310 L510 320 L550 305 Z" fill="#0a1628" opacity="0.7"/>
            <path d="M670 280 L710 310 L710 320 L670 305 Z" fill="#0a1628" opacity="0.7"/>

            {/* Dense white building cluster - right of cathedral */}
            {[720,748,772,798,822,846,870,894,918,942,966].map((x, i) => (
              <rect
                key={i} x={x} y={250 + (i % 3) * 18}
                width={20 + (i % 4) * 8}
                height={120 - (i % 3) * 18}
                rx="1" fill="#0c1b30" opacity="0.88 + (i % 3) * 0.03"/>
            ))}

            {/* Paseo del Parque palm trees */}
            {[320,410,490,580,640,750,820,920,1020,1120].map((x, i) => (
              <g key={i}>
                {/* Trunk */}
                <rect x={x - 2} y={310 + (i%2)*8} width="5" height={52 - (i%2)*8} rx="2" fill="#0a1628" opacity="0.9"/>
                {/* Fronds */}
                <path
                  d={`M${x+1},${308+(i%2)*8} Q${x-22},${288+(i%2)*8} ${x-30},${282+(i%2)*8}
                      M${x+1},${308+(i%2)*8} Q${x+22},${288+(i%2)*8} ${x+30},${282+(i%2)*8}
                      M${x+1},${308+(i%2)*8} Q${x},${280+(i%2)*8} ${x-2},${274+(i%2)*8}
                      M${x+1},${308+(i%2)*8} Q${x-14},${296+(i%2)*8} ${x-24},${296+(i%2)*8}
                      M${x+1},${308+(i%2)*8} Q${x+14},${296+(i%2)*8} ${x+24},${296+(i%2)*8}`}
                  stroke="#0a1628" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
              </g>
            ))}

            {/* Right: modern port area buildings */}
            <rect x="1100" y="240" width="60" height="130" rx="2" fill="#0c1b30" opacity="0.9"/>
            <rect x="1150" y="260" width="45" height="110" rx="2" fill="#0a1628" opacity="0.85"/>
            <rect x="1190" y="230" width="80" height="140" rx="2" fill="#0c1b30" opacity="0.9"/>
            <rect x="1265" y="280" width="60" height="90" rx="2"  fill="#0a1628" opacity="0.85"/>
            <rect x="1320" y="250" width="120" height="120" rx="2" fill="#0c1b30" opacity="0.88"/>

            {/* Muelle Uno / port crane silhouette */}
            <path d="M1350 230 L1355 150 L1420 145 L1440 230 Z" fill="#090f1e" opacity="0.9"/>
            <path d="M1355 150 L1355 230" stroke="#090f1e" strokeWidth="4" opacity="0.95"/>
            <path d="M1355 150 L1440 145" stroke="#090f1e" strokeWidth="2" opacity="0.9"/>
            <path d="M1380 145 L1380 230" stroke="#090f1e" strokeWidth="1.5" opacity="0.7"/>
            <path d="M1405 145 L1405 230" stroke="#090f1e" strokeWidth="1.5" opacity="0.7"/>

            {/* Harbour water reflections */}
            <path d="M200 385 Q360 378 520 385 Q680 392 840 383 Q1000 374 1160 382 Q1320 390 1440 380"
              stroke="#1a4a8a" strokeWidth="1.5" opacity="0.5"/>
            <path d="M0 395 Q200 388 400 396 Q600 404 800 392 Q1000 380 1200 393 Q1350 402 1440 395"
              stroke="#1a4a8a" strokeWidth="1" opacity="0.3"/>

            {/* Foreground: quay / promenade */}
            <rect x="0" y="358" width="1440" height="20" fill="#06101e" opacity="0.95"/>
          </svg>
        </div>

        {/* ── Overlay: smooth fade into page background at bottom ── */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent -z-10" />

        {/* ── Golden horizon glow ── */}
        <div className="absolute bottom-28 left-0 right-0 h-32 bg-gradient-to-t from-primary/15 to-transparent -z-10" />

        {/* ── Content ── */}
        <div className="max-w-6xl mx-auto px-5 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text (always on dark sky background now) */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-8 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary tracking-wide uppercase">
                  {t("badge")}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.06] mb-6 text-white">
                {before},
                <br />
                <span className="text-gradient">{after}</span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
                {t("subtext")}
              </p>

              <div className="inline-flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 max-w-md">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <SanchamarLogo variant="mark" height={16} />
                </div>
                <p className="text-sm text-white/75 leading-relaxed">
                  {t("notice")}
                </p>
              </div>
            </div>

            {/* Right: Floating icons */}
            <div className="relative h-[460px] hidden lg:block">
              {HERO_FLOATERS.map(({ Icon, rot, x, y, dur, delay, bg, fg }, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x}%`, top: `${y}%`,
                    ["--r" as string]: `${rot}deg`,
                    animation: `lp-hero-float ${dur}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${bg} backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-warm`}>
                    <Icon className={`h-7 w-7 ${fg}`} />
                  </div>
                </div>
              ))}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-current animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ Interactive sections ══ */}
      <LandingInteractive services={services} />

      {/* ══ Footer ══ */}
      <footer className="border-t border-border py-8 bg-muted/20">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SanchamarLogo variant="mark" height={24} />
            <p className="text-xs text-muted-foreground/70">Sanchamar · Private Concierge Malaga</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground/60">Live</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
