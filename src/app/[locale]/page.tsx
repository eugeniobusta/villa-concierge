import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import {
  ChefHat, Dumbbell, ShoppingCart, Sparkles, Car, Map,
  Flower2, Wine, Baby, Waves, Sun, ArrowRight,
} from "lucide-react";

const SERVICE_ICONS = [
  { key: "chef",      icon: ChefHat,      color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  { key: "cleaning",  icon: Sparkles,     color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
  { key: "groceries", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { key: "yoga",      icon: Dumbbell,     color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  { key: "massage",   icon: Flower2,      color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" },
  { key: "transfer",  icon: Car,          color: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400" },
  { key: "tours",     icon: Map,          color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  { key: "wine",      icon: Wine,         color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  { key: "childcare", icon: Baby,         color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  { key: "laundry",   icon: Waves,        color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400" },
];

export default async function LandingPage() {
  const t  = await getTranslations("landing");
  const ts = await getTranslations("services");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Animated gradient backdrop */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/40 to-background dark:from-amber-950/30 dark:via-orange-950/10 dark:to-background" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-100/30 dark:bg-amber-900/10 blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-100/20 dark:bg-orange-900/10 blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="max-w-6xl mx-auto px-5 py-28 md:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide uppercase">
                {t("badge")}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-semibold text-foreground tracking-tight leading-[1.08] mb-6">
              {t("headline").split(",").map((part, i) => (
                <span key={i}>
                  {i === 0 ? part : (
                    <>
                      ,<br />
                      <span className="text-gradient">{part}</span>
                    </>
                  )}
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
              {t("subtext")}
            </p>

            {/* Notice pill */}
            <div className="inline-flex items-start gap-3 bg-card border border-border rounded-2xl px-5 py-4 shadow-warm-sm max-w-lg">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("notice")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            {t("servicesLabel")}
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {SERVICE_ICONS.map(({ key, icon: Icon, color }) => (
            <div
              key={key}
              className="group bg-card border border-border rounded-2xl p-4 md:p-5 card-hover shadow-warm-sm hover:shadow-warm hover:border-primary/30 cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-foreground text-sm leading-tight mb-0.5">
                {ts(`${key}.label`)}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {ts(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
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
