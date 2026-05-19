import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import LandingInteractive from "@/components/landing/LandingInteractive";
import {
  ChefHat, Dumbbell, ShoppingCart, Flower2, Car, Wine,
} from "lucide-react";

/* ── Hero floating service icons ─── */
const HERO_FLOATERS = [
  { Icon: ChefHat,      rot:  4, x: 8,  y: 10, dur: 5.5, delay: 0.0, bg: "bg-white/15", fg: "text-amber-300" },
  { Icon: Flower2,      rot: -6, x: 50, y: 25, dur: 7.2, delay: 1.1, bg: "bg-white/12", fg: "text-rose-300"  },
  { Icon: ShoppingCart, rot:  2, x: 14, y: 58, dur: 6.0, delay: 0.7, bg: "bg-white/12", fg: "text-emerald-300" },
  { Icon: Wine,         rot: -4, x: 72, y: 8,  dur: 8.0, delay: 0.4, bg: "bg-white/12", fg: "text-red-300"   },
  { Icon: Car,          rot:  3, x: 78, y: 52, dur: 5.2, delay: 2.0, bg: "bg-white/10", fg: "text-slate-300" },
  { Icon: Dumbbell,     rot: -5, x: 34, y: 80, dur: 6.8, delay: 3.0, bg: "bg-white/12", fg: "text-violet-300" },
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
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <SanchamarLogo variant="full" height={26} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══ Hero ══ */}
      {/*
        Background is set via inline style so it ALWAYS renders regardless of
        Tailwind's z-index stacking. We layer:
          1. Dark navy→golden gradient (sky)
          2. SVG Malaga silhouette
          3. Soft gradient fade to page background at bottom
          4. Content
      */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          minHeight: "82vh",
          background: "linear-gradient(175deg, #0b1628 0%, #122040 30%, #1e3060 55%, #7a4e0a 78%, #c4940a 90%, #d4a017 100%)",
        }}
      >
        {/* ── Stars (tiny white dots scattered in sky) ── */}
        {[
          [8,4],[15,12],[23,7],[31,3],[42,9],[54,5],[63,11],[71,6],[82,3],[90,8],
          [6,18],[18,22],[29,16],[48,19],[57,14],[69,20],[78,13],[88,17],[96,7],
          [12,28],[35,25],[50,30],[65,24],[80,27],[93,22],[4,32],[22,35],[45,38],
        ].map(([x, y], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: i % 7 === 0 ? 2 : 1,
              height: i % 7 === 0 ? 2 : 1,
              left: `${x}%`, top: `${y}%`,
              opacity: 0.5 + (i % 4) * 0.12,
              animationDuration: `${2 + (i % 3)}s`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}

        {/* ── Malaga skyline SVG ── */}
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle horizon atmospheric glow */}
          <ellipse cx="720" cy="330" rx="800" ry="80" fill="#c4940a" opacity="0.22"/>
          <ellipse cx="720" cy="360" rx="600" ry="50" fill="#e8b820" opacity="0.12"/>

          {/* ── Gibralfaro Hill ── */}
          <path d="M0 260 Q80 150 180 145 Q230 142 280 160 L320 280 L0 280 Z"
            fill="#0c1929" />

          {/* ── Alcazaba fortress ── */}
          {/* Main walls */}
          <path d="M55 255 L55 200 L220 200 L220 255 Z" fill="#0e1e35"/>
          {/* Crenellations */}
          {[60,76,92,108,124,140,156,172,188,204].map((x, i) => (
            <rect key={i} x={x} y={188} width="10" height="16" rx="1" fill="#0e1e35"/>
          ))}
          {/* Main tower */}
          <rect x="110" y="155" width="38" height="50" rx="2" fill="#0c1929"/>
          <path d="M108 155 Q129 132 150 155 Z" fill="#0c1929"/>
          {/* Tower window */}
          <rect x="122" y="168" width="12" height="16" rx="2" fill="#c4940a" opacity="0.5"/>
          {/* Rampart */}
          <path d="M50 255 L50 230 L80 230 L80 255" fill="#0e1e35"/>
          <path d="M190 255 L190 230 L220 230 L220 255" fill="#0e1e35"/>

          {/* ── Hillside white buildings (Malaga old town) ── */}
          {/* Cascading buildings up the hill */}
          <rect x="250" y="215" width="28" height="65" rx="2" fill="#0f1e36"/>
          <rect x="272" y="205" width="24" height="75" rx="2" fill="#0e1c33"/>
          <rect x="290" y="220" width="32" height="60" rx="2" fill="#0f2038"/>
          <rect x="315" y="210" width="22" height="70" rx="2" fill="#0e1c33"/>
          <rect x="332" y="225" width="30" height="55" rx="2" fill="#101f35"/>
          <rect x="357" y="215" width="25" height="65" rx="2" fill="#0f1e36"/>
          <rect x="376" y="230" width="28" height="50" rx="2" fill="#0e1c33"/>

          {/* ── Malaga Cathedral ── */}
          {/* Nave */}
          <rect x="480" y="185" width="140" height="145" rx="3" fill="#0d1b32"/>
          {/* Façade details - arched windows */}
          <path d="M510 220 Q523 205 536 220 L536 245 L510 245 Z" fill="#c4940a" opacity="0.3"/>
          <path d="M544 220 Q557 205 570 220 L570 245 L544 245 Z" fill="#c4940a" opacity="0.3"/>
          <path d="M578 220 Q591 205 604 220 L604 245 L578 245 Z" fill="#c4940a" opacity="0.3"/>
          {/* Rose window */}
          <circle cx="552" cy="268" r="20" fill="none" stroke="#c4940a" strokeWidth="1.5" opacity="0.5"/>
          <circle cx="552" cy="268" r="12" fill="none" stroke="#c4940a" strokeWidth="1" opacity="0.35"/>
          {/* Left tower (complete) */}
          <rect x="476" y="130" width="46" height="60" rx="2" fill="#0c1929"/>
          <path d="M474 130 L499 100 L524 130 Z" fill="#0c1929"/>
          {/* Right tower (shorter — historically unfinished) */}
          <rect x="618" y="155" width="46" height="38" rx="2" fill="#0c1929"/>
          {/* Tower lights / gold glow */}
          <rect x="490" y="145" width="18" height="24" rx="2" fill="#c4940a" opacity="0.35"/>
          <rect x="630" y="168" width="18" height="16" rx="2" fill="#c4940a" opacity="0.3"/>

          {/* ── Buildings east of Cathedral ── */}
          {[700,725,750,778,803,828,854,880,906,932,958,984,1010].map((x, i) => (
            <rect
              key={i}
              x={x} y={230 + (i % 4) * 12}
              width={18 + (i % 5) * 5}
              height={100 - (i % 4) * 12}
              rx="1"
              fill={i % 3 === 0 ? "#0e1c33" : "#0f1e36"}
            />
          ))}

          {/* ── Paseo del Parque palm trees ── */}
          {[420,500,580,660,740,830,920,1010,1100,1190].map((x, i) => (
            <g key={i}>
              <rect x={x - 2} y={285 + (i%2)*6} width="5" height={50-(i%2)*6} rx="2" fill="#0a1525"/>
              {/* Palm fronds */}
              <path
                d={`M${x+1} ${283+(i%2)*6}
                  Q${x-20} ${265+(i%2)*6} ${x-28} ${260+(i%2)*6}
                  M${x+1} ${283+(i%2)*6}
                  Q${x+20} ${265+(i%2)*6} ${x+28} ${260+(i%2)*6}
                  M${x+1} ${283+(i%2)*6}
                  Q${x} ${258+(i%2)*6} ${x-2} ${252+(i%2)*6}
                  M${x+1} ${283+(i%2)*6}
                  Q${x-12} ${272+(i%2)*6} ${x-20} ${272+(i%2)*6}
                  M${x+1} ${283+(i%2)*6}
                  Q${x+12} ${272+(i%2)*6} ${x+20} ${272+(i%2)*6}`}
                stroke="#0a1525" strokeWidth="2.5" strokeLinecap="round"/>
            </g>
          ))}

          {/* ── Port / Muelle Uno area ── */}
          <rect x="1100" y="220" width="70" height="140" rx="2" fill="#0e1c33"/>
          <rect x="1164" y="240" width="55" height="120" rx="2" fill="#0d1b32"/>
          <rect x="1212" y="210" width="90" height="150" rx="2" fill="#0e1c33"/>
          <rect x="1296" y="245" width="65" height="115" rx="2" fill="#0d1a30"/>
          <rect x="1355" y="225" width="85" height="135" rx="2" fill="#0e1c33"/>
          {/* Port crane */}
          <path d="M1370 200 L1374 100 L1440 95 L1440 200 Z" fill="#091422"/>
          <line x1="1374" y1="100" x2="1374" y2="200" stroke="#091422" strokeWidth="5"/>
          <line x1="1374" y1="100" x2="1440" y2="95" stroke="#091422" strokeWidth="2.5"/>
          {[1395,1412,1428].map((x, i) => (
            <line key={i} x1={x} y1="95" x2={x} y2="200" stroke="#091422" strokeWidth="1.5" opacity="0.7"/>
          ))}

          {/* ── Sea ── */}
          <rect x="0" y="330" width="1440" height="90" fill="#061018"/>
          {/* Sea shimmer reflections */}
          <path d="M0 340 Q180 334 360 341 Q540 348 720 338 Q900 328 1080 340 Q1260 352 1440 342"
            stroke="#c4940a" strokeWidth="1.5" opacity="0.18" fill="none"/>
          <path d="M0 352 Q200 346 400 354 Q600 362 800 350 Q1000 338 1200 352 Q1380 364 1440 355"
            stroke="#c4940a" strokeWidth="1" opacity="0.1" fill="none"/>
          <path d="M0 364 Q240 358 480 366 Q720 374 960 362 Q1200 350 1440 362"
            stroke="#e8b820" strokeWidth="0.8" opacity="0.08" fill="none"/>

          {/* ── Quay promenade ── */}
          <rect x="0" y="326" width="1440" height="10" fill="#08121f"/>

          {/* ── Lighthouse glow ── */}
          <circle cx="1200" cy="218" r="4" fill="#e8b820" opacity="0.9"/>
          <circle cx="1200" cy="218" r="12" fill="#c4940a" opacity="0.25"/>
        </svg>

        {/* ── Fade to page background at bottom ── */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                <span className="text-xs font-medium text-white/90 tracking-wide uppercase">
                  {t("badge")}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.06] mb-5">
                <span className="text-white drop-shadow-sm">{before},</span>
                <br />
                <span
                  className="font-bold"
                  style={{
                    background: "linear-gradient(135deg, #f0c040 0%, #c4940a 50%, #e8b820 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >{after}</span>
              </h1>

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 max-w-md">
                {t("subtext")}
              </p>

              {/* Notice card */}
              <div className="inline-flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3.5 max-w-sm">
                <SanchamarLogo variant="mark" height={18} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70 leading-relaxed">
                  {t("notice")}
                </p>
              </div>
            </div>

            {/* Right: Floating icons */}
            <div className="relative h-[380px] hidden lg:block">
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
                  <div className={`w-14 h-14 rounded-2xl ${bg} backdrop-blur-md flex items-center justify-center border border-white/20`}>
                    <Icon className={`h-6 w-6 ${fg}`} />
                  </div>
                </div>
              ))}
              {/* Central glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-1">
          <div className="w-5 h-7 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-current animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ Interactive sections ══ */}
      <LandingInteractive services={services} />

      {/* ══ Footer ══ */}
      <footer className="border-t border-border py-6 bg-muted/20">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SanchamarLogo variant="mark" height={22} />
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
