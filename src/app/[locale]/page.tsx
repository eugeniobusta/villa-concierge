import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import LandingInteractive from "@/components/landing/LandingInteractive";
import { GuestAccessCard } from "@/components/landing/GuestCodeInput";
import {
  ChefHat, Dumbbell, ShoppingCart, Flower2, Car, Wine, Map, Sparkles,
  Baby, Waves, Utensils,
} from "lucide-react";

/*
  Floater positions: x is offset from left=48%, so actual left% = x+48.
  Keep x in 0–42 so icons stay within the right half and don't clip at 100%.
  y is top % within the section — keep under 72 so icons clear the skyline.
*/
const HERO_FLOATERS = [
  { Icon: ChefHat,      rot:  4, x:  4, y:  4, dur: 5.5, delay: 0.0, fg: "text-amber-300"   },
  { Icon: Wine,         rot: -4, x: 24, y:  2, dur: 8.0, delay: 0.4, fg: "text-red-300"     },
  { Icon: Sparkles,     rot: -3, x: 40, y:  8, dur: 6.2, delay: 2.5, fg: "text-sky-300"     },
  { Icon: Flower2,      rot: -6, x: 14, y: 20, dur: 7.2, delay: 1.1, fg: "text-rose-300"    },
  { Icon: Map,          rot:  5, x: 36, y: 24, dur: 7.5, delay: 1.5, fg: "text-orange-300"  },
  { Icon: ShoppingCart, rot:  2, x:  6, y: 42, dur: 6.0, delay: 0.7, fg: "text-emerald-300" },
  { Icon: Dumbbell,     rot: -5, x: 28, y: 40, dur: 6.8, delay: 3.0, fg: "text-violet-300"  },
  { Icon: Car,          rot:  3, x: 40, y: 54, dur: 5.2, delay: 2.0, fg: "text-slate-300"   },
  { Icon: Utensils,     rot:  6, x: 18, y: 58, dur: 5.8, delay: 0.9, fg: "text-yellow-300"  },
  { Icon: Baby,         rot: -4, x: 10, y: 68, dur: 7.0, delay: 1.8, fg: "text-pink-300"    },
  { Icon: Waves,        rot:  2, x: 32, y: 66, dur: 6.5, delay: 3.2, fg: "text-teal-300"    },
];

/* Pre-computed star positions — only shown in dark mode via CSS */
const STARS = [
  [8,4,1,5.2,0.5],[15,12,2,3.8,0.8],[23,7,1,7.1,0.4],[31,3,1,4.5,0.3],[42,9,2,6.3,0.6],
  [54,5,1,5.8,1.0],[63,11,1,3.4,0.2],[71,6,2,7.8,0.9],[82,3,1,4.2,0.7],[90,8,1,6.0,0.5],
  [6,18,1,5.5,1.2],[18,22,2,4.0,0.6],[29,16,1,7.4,0.4],[48,19,1,3.7,0.8],[57,14,2,5.9,0.3],
  [69,20,1,6.6,1.5],[78,13,1,4.8,0.6],[88,17,2,3.2,0.9],[96,7,1,7.0,0.5],[4,32,1,5.4,1.1],
  [22,35,1,4.6,0.7],[45,38,2,6.1,0.3],[65,24,1,5.3,0.8],[80,27,1,7.2,0.4],[93,22,2,4.4,1.3],
];

/* Helper: SVG label with stroke outline for readability on any bg */
function SkyLabel({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      fontSize="8"
      fontFamily="Georgia,serif"
      fontStyle="italic"
      style={{
        fill: "var(--sv-label)",
        stroke: "var(--sv-label-stroke)",
        strokeWidth: 3,
        paintOrder: "stroke fill",
        strokeLinejoin: "round",
      } as React.CSSProperties}
    >{children}</text>
  );
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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

      {/* ══ Header — dark in dark mode to blend with hero ══ */}
      <header className="sticky top-0 z-50 border-b border-border/60 dark:border-white/8
        bg-background/90 dark:bg-[#0a1525]/94 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <SanchamarLogo variant="full" height={36} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section
        className="relative overflow-hidden flex flex-col"
        style={{ minHeight: "88vh", background: "var(--hero-gradient)" }}
      >
        {/* ── Stars (dark mode only) ── */}
        {STARS.map(([x, y, size, dur, delay], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white pointer-events-none opacity-0 dark:opacity-100"
            style={{
              width: size, height: size,
              left: `${x}%`, top: `${y}%`,
              ["--so" as string]: 0.4 + (i % 5) * 0.12,
              animation: `lp-star-drift ${dur}s ease-in-out infinite alternate`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}

        {/* ── Floating service icons (desktop) ── */}
        {HERO_FLOATERS.map(({ Icon, rot, x, y, dur, delay, fg }, i) => (
          <div
            key={i}
            className="absolute hidden lg:flex"
            style={{
              left: `${x + 48}%`, top: `${y + 3}%`,
              ["--r" as string]: `${rot}deg`,
              animation: `lp-hero-float ${dur}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/12 backdrop-blur-md flex items-center justify-center border border-white/18 shadow-warm">
              <Icon className={`h-7 w-7 ${fg}`} />
            </div>
          </div>
        ))}

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              {/* Left */}
              <div>
                {/* Brand */}
                <div className="flex items-center gap-3 mb-7">
                  <SanchamarLogo variant="mark" height={64} />
                  <div>
                    <p className="text-white font-bold text-2xl leading-tight tracking-tight">Sanchamar</p>
                    <p className="text-white/55 text-xs mt-0.5">Gestión de activos inmobiliarios</p>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.06] mb-4">
                  <span className="text-white drop-shadow-sm">{before},</span>
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg,#f5d060 0%,#c4940a 50%,#f0b830 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{after}</span>
                </h1>

                <p className="text-base text-white/65 leading-relaxed mb-7 max-w-md">
                  {t("subtext")}
                </p>

                {/* Guest access card */}
                <GuestAccessCard />
              </div>

              {/* Right: empty for floaters on desktop */}
              <div className="hidden lg:block h-72" />
            </div>
          </div>
        </div>

        {/* ── Malaga Skyline ── */}
        <div className="relative flex-shrink-0">
          <svg
            viewBox="0 0 1440 340"
            preserveAspectRatio="xMidYMax slice"
            className="w-full block"
            style={{ height: "clamp(180px, 28vw, 340px)", marginBottom: -2 }}
            aria-hidden="true"
          >
            {/* Horizon glow */}
            <ellipse cx="720" cy="268" rx="820" ry="68" fill="var(--sv-glow)" opacity="0.22"/>
            <ellipse cx="720" cy="295" rx="600" ry="42" fill="var(--sv-glow)" opacity="0.10"/>

            {/* ── Clouds (light mode only) ── */}
            <g className="lp-cloud-a dark:hidden" opacity="0.55">
              <ellipse cx="180" cy="52" rx="56" ry="20" fill="white"/>
              <ellipse cx="215" cy="48" rx="40" ry="16" fill="white"/>
              <ellipse cx="148" cy="55" rx="35" ry="14" fill="white"/>
            </g>
            <g className="lp-cloud-b dark:hidden" opacity="0.45">
              <ellipse cx="680" cy="38" rx="65" ry="22" fill="white"/>
              <ellipse cx="718" cy="34" rx="48" ry="18" fill="white"/>
              <ellipse cx="648" cy="42" rx="42" ry="16" fill="white"/>
            </g>
            <g className="lp-cloud-c dark:hidden" opacity="0.38">
              <ellipse cx="1100" cy="58" rx="50" ry="18" fill="white"/>
              <ellipse cx="1130" cy="54" rx="36" ry="14" fill="white"/>
              <ellipse cx="1075" cy="62" rx="32" ry="12" fill="white"/>
            </g>

            {/* ── Gibralfaro hill ── */}
            <path d="M0 215 Q85 118 195 112 Q248 108 300 130 L345 228 L0 228 Z" fill="var(--sv-b2)"/>

            {/* ── Alcazaba ── */}
            <path d="M55 208 L55 168 L228 168 L228 208 Z" fill="var(--sv-b1)"/>
            {[62,78,94,110,126,142,158,174,190,206].map((x, i) => (
              <rect key={i} x={x} y={157} width="11" height="14" rx="1" fill="var(--sv-b1)"/>
            ))}
            <rect x="110" y="122" width="42" height="48" rx="2" fill="var(--sv-b2)"/>
            <path d="M108 122 Q131 100 154 122 Z" fill="var(--sv-b2)"/>
            <rect x="123" y="136" width="14" height="16" rx="2" fill="var(--sv-glow)" opacity="0.55"/>
            {/* Labels — placed in lower building zone, always visible at any viewport width */}
            <SkyLabel x={131} y={176}>Alcazaba</SkyLabel>
            <SkyLabel x={62} y={156}>Monte Gibralfaro</SkyLabel>

            {/* ── Old town buildings ── */}
            {[[255,178,28,56],[278,168,25,68],[298,182,32,51],[325,175,22,60],[345,188,30,46],[368,178,26,55],[388,195,28,40]].map(([x,y,w,h],i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="1" fill={i%2===0?"var(--sv-b1)":"var(--sv-b2)"}/>
            ))}

            {/* ── Cathedral ── */}
            <rect x="476" y="150" width="148" height="118" rx="3" fill="var(--sv-b1)"/>
            {[504,540,576].map((x,i) => (
              <path key={i} d={`M${x} 183 Q${x+16} 168 ${x+32} 183 L${x+32} 208 L${x} 208 Z`}
                fill="var(--sv-glow)" opacity="0.28"/>
            ))}
            <circle cx="550" cy="232" r="18" fill="none" stroke="var(--sv-glow)" strokeWidth="1.5" opacity="0.45"/>
            {/* Left tower */}
            <rect x="472" y="96" width="48" height="58" rx="2" fill="var(--sv-b2)"/>
            <path d="M470 96 L496 70 L522 96 Z" fill="var(--sv-b2)"/>
            <rect x="484" y="112" width="20" height="22" rx="2" fill="var(--sv-glow)" opacity="0.35"/>
            {/* Right tower (unfinished) */}
            <rect x="616" y="120" width="48" height="36" rx="2" fill="var(--sv-b2)"/>
            <rect x="628" y="132" width="20" height="14" rx="2" fill="var(--sv-glow)" opacity="0.28"/>
            {/* Cathedral label — inside nave, always visible */}
            <SkyLabel x={550} y={168}>Catedral de Málaga</SkyLabel>

            {/* ── Buildings east ── */}
            {[695,720,748,773,800,826,854,880,908,935,962,990,1018,1046].map((x, i) => (
              <rect key={i} x={x} y={192+(i%4)*9} width={16+(i%5)*4} height={76-(i%4)*9} rx="1"
                fill={i%3===0?"var(--sv-b1)":"var(--sv-b2)"}/>
            ))}

            {/* ── Paseo palms ── */}
            {[400,490,572,650,735,820,910,1005,1100,1190].map((x, i) => (
              <g key={i}>
                <rect x={x-2} y={246+(i%2)*5} width="5" height={42-(i%2)*5} rx="2" fill="var(--sv-palm)"/>
                <path
                  d={`M${x+1} ${244+(i%2)*5}
                    Q${x-20} ${228+(i%2)*5} ${x-27} ${224+(i%2)*5}
                    M${x+1} ${244+(i%2)*5}
                    Q${x+20} ${228+(i%2)*5} ${x+27} ${224+(i%2)*5}
                    M${x+1} ${244+(i%2)*5}
                    Q${x}   ${222+(i%2)*5} ${x-2} ${218+(i%2)*5}
                    M${x+1} ${244+(i%2)*5}
                    Q${x-12} ${234+(i%2)*5} ${x-20} ${234+(i%2)*5}
                    M${x+1} ${244+(i%2)*5}
                    Q${x+12} ${234+(i%2)*5} ${x+20} ${234+(i%2)*5}`}
                  stroke="var(--sv-palm)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>
            ))}
            {/* Paseo label — clearly above palms */}
            <SkyLabel x={720} y={205}>Paseo del Parque</SkyLabel>

            {/* ── Port / Muelle Uno ── */}
            <rect x="1095" y="185" width="70" height="120" rx="2" fill="var(--sv-b1)"/>
            <rect x="1160" y="205" width="55" height="100" rx="2" fill="var(--sv-b2)"/>
            <rect x="1208" y="175" width="92" height="130" rx="2" fill="var(--sv-b1)"/>
            <rect x="1294" y="210" width="66" height="95" rx="2" fill="var(--sv-b2)"/>
            <rect x="1352" y="190" width="88" height="115" rx="2" fill="var(--sv-b1)"/>
            {/* Crane */}
            <path d="M1368 170 L1372 75 L1440 70 L1440 170 Z" fill="var(--sv-b3)"/>
            <line x1="1372" y1="75" x2="1372" y2="170" stroke="var(--sv-b3)" strokeWidth="5"/>
            <line x1="1372" y1="75" x2="1440" y2="70"  stroke="var(--sv-b3)" strokeWidth="2.5"/>
            {[1394,1412,1430].map((x,i) => (
              <line key={i} x1={x} y1="70" x2={x} y2="170" stroke="var(--sv-b3)" strokeWidth="1.5" opacity="0.7"/>
            ))}
            {/* Lighthouse */}
            <circle cx="1195" cy="183" r="4" fill="var(--sv-glow)" opacity="0.95"/>
            <circle cx="1195" cy="183" r="10" fill="var(--sv-glow)" opacity="0.22"/>
            {/* Muelle Uno label — above port buildings, always visible */}
            <SkyLabel x={1220} y={190}>Muelle Uno · Puerto</SkyLabel>

            {/* ── Sea ── */}
            <rect x="0" y="278" width="1440" height="62" fill="var(--sv-sea)"/>
            <path d="M0 288 Q240 282 480 289 Q720 296 960 286 Q1200 276 1440 288"
              stroke="var(--sv-glow)" strokeWidth="1.5" opacity="0.18" fill="none"/>
            <path d="M0 300 Q300 294 600 302 Q900 310 1200 298 Q1380 290 1440 298"
              stroke="var(--sv-glow)" strokeWidth="1" opacity="0.10" fill="none"/>

            {/* ── Quay ── */}
            <rect x="0" y="274" width="1440" height="9" fill="var(--sv-quay)"/>
          </svg>
        </div>
      </section>

      {/* ══ Transition: sea → page background ══ */}
      <div className="h-12 bg-gradient-to-b from-[var(--sv-sea)] via-primary/6 to-background -mt-px" />

      {/* ══ Interactive sections ══ */}
      <LandingInteractive services={services} locale={locale} />

      {/* ══ Footer ══ */}
      <footer className="border-t border-border py-5 bg-muted/20">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SanchamarLogo variant="mark" height={28} />
            <div>
              <p className="text-xs text-muted-foreground/70">Sanchamar · Private Concierge Malaga</p>
              <p className="text-[10px] text-muted-foreground/40">Gestión de activos inmobiliarios</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground/60">Live</p>
          </div>
        </div>
      </footer>

      {/* ══ Footer links ══ */}
      <div className="py-3 text-center border-t border-border/30">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href={`/${locale}/privacy`}
            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/20 text-xs">·</span>
          <Link href={`/${locale}/terms`}
            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors">
            Terms of Service
          </Link>
          <span className="text-muted-foreground/20 text-xs">·</span>
          <Link href={`/${locale}/admin/login`}
            className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors">
            Admin Portal ↗
          </Link>
          <span className="text-muted-foreground/20 text-xs">·</span>
          <Link href={`/${locale}/provider/login`}
            className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors">
            Provider Portal ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
