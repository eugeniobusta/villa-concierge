import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import LandingInteractive from "@/components/landing/LandingInteractive";
import { GuestCodeInput } from "@/components/landing/GuestCodeInput";
import { ChefHat, Dumbbell, ShoppingCart, Flower2, Car, Wine } from "lucide-react";

/* ── Floating service icons ─── */
const HERO_FLOATERS = [
  { Icon: ChefHat,      rot:  4, x: 8,  y:  8, dur: 5.5, delay: 0.0, fg: "text-amber-300" },
  { Icon: Flower2,      rot: -6, x: 50, y: 22, dur: 7.2, delay: 1.1, fg: "text-rose-300"  },
  { Icon: ShoppingCart, rot:  2, x: 12, y: 55, dur: 6.0, delay: 0.7, fg: "text-emerald-300" },
  { Icon: Wine,         rot: -4, x: 72, y:  8, dur: 8.0, delay: 0.4, fg: "text-red-300"   },
  { Icon: Car,          rot:  3, x: 78, y: 50, dur: 5.2, delay: 2.0, fg: "text-slate-300" },
  { Icon: Dumbbell,     rot: -5, x: 34, y: 78, dur: 6.8, delay: 3.0, fg: "text-violet-300" },
];

/* Pre-computed star positions */
const STARS = [
  [8,4,1,5.2,0.5],[15,12,2,3.8,0.8],[23,7,1,7.1,0.4],[31,3,1,4.5,0.3],[42,9,2,6.3,0.6],
  [54,5,1,5.8,1.0],[63,11,1,3.4,0.2],[71,6,2,7.8,0.9],[82,3,1,4.2,0.7],[90,8,1,6.0,0.5],
  [6,18,1,5.5,1.2],[18,22,2,4.0,0.6],[29,16,1,7.4,0.4],[48,19,1,3.7,0.8],[57,14,2,5.9,0.3],
  [69,20,1,6.6,1.5],[78,13,1,4.8,0.6],[88,17,2,3.2,0.9],[96,7,1,7.0,0.5],[4,32,1,5.4,1.1],
  [22,35,1,4.6,0.7],[45,38,2,6.1,0.3],[65,24,1,5.3,0.8],[80,27,1,7.2,0.4],[93,22,2,4.4,1.3],
];

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

      {/* ══ Header — blends with hero in dark mode ══ */}
      <header className="sticky top-0 z-50 border-b border-border/60 dark:border-white/8
        bg-background/85 dark:bg-[#0b1628]/92 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <SanchamarLogo variant="full" height={26} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section
        className="relative overflow-hidden flex flex-col"
        style={{ minHeight: "90vh", background: "var(--hero-gradient)" }}
      >
        {/* ── Stars (moving, dark mode only) ── */}
        {STARS.map(([x, y, size, dur, delay], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white dark:block hidden pointer-events-none"
            style={{
              width: size, height: size,
              left: `${x}%`, top: `${y}%`,
              ["--so" as string]: 0.4 + (i % 5) * 0.12,
              animation: `lp-star-drift ${dur}s ease-in-out infinite alternate`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}

        {/* ── Floating service icons ── */}
        {HERO_FLOATERS.map(({ Icon, rot, x, y, dur, delay, fg }, i) => (
          <div
            key={i}
            className="absolute hidden lg:flex"
            style={{
              left: `${x + 48}%`, top: `${y + 5}%`,
              ["--r" as string]: `${rot}deg`,
              animation: `lp-hero-float ${dur}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/12 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Icon className={`h-7 w-7 ${fg}`} />
            </div>
          </div>
        ))}

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-6xl mx-auto px-5 py-14 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              {/* Left: Text + code input */}
              <div>
                {/* Sanchamar brand in hero */}
                <div className="flex items-center gap-3 mb-5">
                  <SanchamarLogo variant="mark" height={36} />
                  <div>
                    <p className="text-white font-semibold text-lg leading-tight tracking-tight">Sanchamar</p>
                    <p className="text-white/55 text-xs">Gestión de activos inmobiliarios</p>
                  </div>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                  bg-white/15 border border-white/25 backdrop-blur-sm mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                  <span className="text-xs font-medium text-white/90 tracking-wide uppercase">
                    {t("badge")}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.06] mb-4">
                  <span className="text-white">{before},</span>
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg,#f5d060 0%,#c4940a 50%,#f0b830 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{after}</span>
                </h1>

                <p className="text-base text-white/65 leading-relaxed mb-8 max-w-md">
                  {t("subtext")}
                </p>

                {/* ── Prominent code entry ── */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">🔑</span>
                    </div>
                    <p className="text-white font-semibold text-sm">Access your villa services</p>
                  </div>
                  <p className="text-white/55 text-xs mb-4 leading-relaxed">
                    Enter the access code from your host or scan the QR code at your villa.
                  </p>
                  <GuestCodeInput compact />
                </div>
              </div>

              {/* Right: empty space for floaters on desktop */}
              <div className="hidden lg:block h-80" />
            </div>
          </div>
        </div>

        {/* ── Malaga Skyline SVG ── */}
        <div className="relative">
          <svg
            viewBox="0 0 1440 380"
            preserveAspectRatio="xMidYMax meet"
            className="w-full block"
            style={{ marginBottom: -2 }}
            aria-hidden="true"
          >
            {/* Horizon atmospheric glow */}
            <ellipse cx="720" cy="295" rx="820" ry="75" fill="var(--sv-glow)" opacity="0.22"/>
            <ellipse cx="720" cy="325" rx="600" ry="45" fill="var(--sv-glow)" opacity="0.10"/>

            {/* ── Gibralfaro Hill ── */}
            <path d="M0 235 Q85 130 195 125 Q248 120 300 145 L345 255 L0 255 Z" fill="var(--sv-b2)"/>
            {/* Hill label */}
            <text x="95" y="114" textAnchor="middle" fontSize="8.5" fill="var(--sv-label)" fontFamily="Georgia,serif" fontStyle="italic">Monte Gibralfaro</text>
            <line x1="95" y1="117" x2="95" y2="128" stroke="var(--sv-lbl-line)" strokeWidth="0.8"/>

            {/* ── Alcazaba fortress ── */}
            <path d="M55 230 L55 185 L228 185 L228 230 Z" fill="var(--sv-b1)"/>
            {/* Crenellations */}
            {[62,78,94,110,126,142,158,174,190,206].map((x, i) => (
              <rect key={i} x={x} y={173} width="11" height="16" rx="1" fill="var(--sv-b1)"/>
            ))}
            {/* Main keep */}
            <rect x="110" y="138" width="42" height="52" rx="2" fill="var(--sv-b2)"/>
            <path d="M108 138 Q131 115 154 138 Z" fill="var(--sv-b2)"/>
            {/* Lit window */}
            <rect x="123" y="152" width="14" height="18" rx="2" fill="var(--sv-glow)" opacity="0.6"/>
            {/* Alcazaba label */}
            <text x="140" y="103" textAnchor="middle" fontSize="8.5" fill="var(--sv-label)" fontFamily="Georgia,serif" fontStyle="italic">Alcazaba</text>
            <line x1="140" y1="106" x2="140" y2="136" stroke="var(--sv-lbl-line)" strokeWidth="0.8"/>

            {/* ── Old town buildings ── */}
            {[[255,195,28,60],[278,185,25,72],[298,200,32,55],[325,192,22,65],[345,205,30,50],[368,196,26,60],[388,212,28,43]].map(([x,y,w,h],i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="1" fill={i%2===0?"var(--sv-b1)":"var(--sv-b2)"}/>
            ))}

            {/* ── Malaga Cathedral ── */}
            <rect x="476" y="165" width="148" height="130" rx="3" fill="var(--sv-b1)"/>
            {/* Arched windows */}
            {[504,540,576].map((x,i) => (
              <path key={i} d={`M${x} 200 Q${x+16} 184 ${x+32} 200 L${x+32} 228 L${x} 228 Z`}
                fill="var(--sv-glow)" opacity="0.28"/>
            ))}
            {/* Rose window */}
            <circle cx="550" cy="255" r="20" fill="none" stroke="var(--sv-glow)" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="550" cy="255" r="11" fill="none" stroke="var(--sv-glow)" strokeWidth="1" opacity="0.3"/>
            {/* Left tower (complete) */}
            <rect x="472" y="112" width="48" height="58" rx="2" fill="var(--sv-b2)"/>
            <path d="M470 112 L496 84 L522 112 Z" fill="var(--sv-b2)"/>
            <rect x="484" y="128" width="20" height="26" rx="2" fill="var(--sv-glow)" opacity="0.38"/>
            {/* Right tower (shorter — historically unfinished) */}
            <rect x="616" y="138" width="48" height="36" rx="2" fill="var(--sv-b2)"/>
            <rect x="628" y="150" width="20" height="16" rx="2" fill="var(--sv-glow)" opacity="0.3"/>
            {/* Cathedral label */}
            <text x="550" y="70" textAnchor="middle" fontSize="8.5" fill="var(--sv-label)" fontFamily="Georgia,serif" fontStyle="italic">Catedral de Málaga</text>
            <line x1="550" y1="73" x2="550" y2="82" stroke="var(--sv-lbl-line)" strokeWidth="0.8"/>

            {/* ── Buildings east of Cathedral ── */}
            {[695,720,748,773,800,826,854,880,908,935,962,990,1018,1046].map((x, i) => (
              <rect key={i} x={x} y={210+(i%4)*10} width={16+(i%5)*4} height={85-(i%4)*10} rx="1"
                fill={i%3===0?"var(--sv-b1)":"var(--sv-b2)"}/>
            ))}

            {/* ── Paseo del Parque palms ── */}
            {[400,490,572,650,735,820,910,1005,1100,1190].map((x, i) => (
              <g key={i}>
                <rect x={x-2} y={264+(i%2)*5} width="5" height={48-(i%2)*5} rx="2" fill="var(--sv-palm)"/>
                <path
                  d={`M${x+1} ${262+(i%2)*5}
                    Q${x-22} ${244+(i%2)*5} ${x-30} ${239+(i%2)*5}
                    M${x+1} ${262+(i%2)*5}
                    Q${x+22} ${244+(i%2)*5} ${x+30} ${239+(i%2)*5}
                    M${x+1} ${262+(i%2)*5}
                    Q${x}   ${237+(i%2)*5} ${x-2} ${231+(i%2)*5}
                    M${x+1} ${262+(i%2)*5}
                    Q${x-13} ${252+(i%2)*5} ${x-22} ${252+(i%2)*5}
                    M${x+1} ${262+(i%2)*5}
                    Q${x+13} ${252+(i%2)*5} ${x+22} ${252+(i%2)*5}`}
                  stroke="var(--sv-palm)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>
            ))}
            {/* Paseo label */}
            <text x="720" y="222" textAnchor="middle" fontSize="8.5" fill="var(--sv-label)" fontFamily="Georgia,serif" fontStyle="italic">Paseo del Parque</text>

            {/* ── Port / Muelle Uno ── */}
            <rect x="1095" y="202" width="70" height="133" rx="2" fill="var(--sv-b1)"/>
            <rect x="1160" y="222" width="55" height="113" rx="2" fill="var(--sv-b2)"/>
            <rect x="1208" y="192" width="92" height="143" rx="2" fill="var(--sv-b1)"/>
            <rect x="1294" y="228" width="66" height="107" rx="2" fill="var(--sv-b2)"/>
            <rect x="1352" y="208" width="88" height="127" rx="2" fill="var(--sv-b1)"/>
            {/* Crane */}
            <path d="M1368 186 L1372 88 L1440 82 L1440 186 Z" fill="var(--sv-b3)"/>
            <line x1="1372" y1="88" x2="1372" y2="186" stroke="var(--sv-b3)" strokeWidth="5"/>
            <line x1="1372" y1="88" x2="1440" y2="82"  stroke="var(--sv-b3)" strokeWidth="2.5"/>
            {[1394,1412,1430].map((x,i) => (
              <line key={i} x1={x} y1="82" x2={x} y2="186" stroke="var(--sv-b3)" strokeWidth="1.5" opacity="0.7"/>
            ))}
            {/* Muelle Uno label */}
            <text x="1200" y="68" textAnchor="middle" fontSize="8.5" fill="var(--sv-label)" fontFamily="Georgia,serif" fontStyle="italic">Muelle Uno · Puerto</text>
            <line x1="1200" y1="71" x2="1200" y2="190" stroke="var(--sv-lbl-line)" strokeWidth="0.8"/>

            {/* ── Sea ── */}
            <rect x="0" y="306" width="1440" height="74" fill="var(--sv-sea)"/>
            {/* Reflections */}
            <path d="M0 316 Q240 310 480 317 Q720 324 960 314 Q1200 304 1440 316"
              stroke="var(--sv-glow)" strokeWidth="1.5" opacity="0.18" fill="none"/>
            <path d="M0 328 Q300 322 600 330 Q900 338 1200 326 Q1380 318 1440 326"
              stroke="var(--sv-glow)" strokeWidth="1" opacity="0.10" fill="none"/>
            {/* Lighthouse */}
            <circle cx="1195" cy="200" r="4" fill="var(--sv-glow)" opacity="0.95"/>
            <circle cx="1195" cy="200" r="11" fill="var(--sv-glow)" opacity="0.22"/>

            {/* ── Quay ── */}
            <rect x="0" y="302" width="1440" height="10" fill="var(--sv-quay)"/>
          </svg>
        </div>
      </section>

      {/* ══ Gradient transition: hero → page ══ */}
      <div className="h-16 bg-gradient-to-b from-[var(--sv-sea)] via-primary/8 to-background -mt-px" />

      {/* ══ Interactive sections ══ */}
      <LandingInteractive services={services} locale={locale} />

      {/* ══ Footer ══ */}
      <footer className="border-t border-border py-5 bg-muted/20">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SanchamarLogo variant="mark" height={22} />
            <div>
              <p className="text-xs text-muted-foreground/70">Sanchamar · Private Concierge Malaga</p>
              <p className="text-[10px] text-muted-foreground/40">Gestión de activos inmobiliarios</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground/60">Live</p>
          </div>
        </div>
      </footer>

      {/* ══ Portal access (discreet bottom bar) ══ */}
      <div className="py-3 text-center border-t border-border/30 bg-background">
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/${locale}/admin/login`}
            className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
          >
            Admin Portal ↗
          </Link>
          <span className="text-muted-foreground/20 text-xs">·</span>
          <Link
            href={`/${locale}/provider/login`}
            className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
          >
            Provider Portal ↗
          </Link>
        </div>
      </div>

    </div>
  );
}
