"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types/database";
import {
  ChefHat, Sparkles, ShoppingCart, Dumbbell, Flower2,
  Car, Map, Wine, Baby, Waves, HelpCircle, ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "chef-hat": ChefHat, sparkles: Sparkles, "shopping-cart": ShoppingCart,
  dumbbell: Dumbbell, "flower-2": Flower2, car: Car, map: Map,
  wine: Wine, baby: Baby, waves: Waves,
};

const ICON_COLORS: Record<string, string> = {
  "chef-hat":      "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400",
  sparkles:        "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-400",
  "shopping-cart": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400",
  dumbbell:        "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-400",
  "flower-2":      "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400",
  car:             "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
  map:             "bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-400",
  wine:            "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400",
  baby:            "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/70 dark:text-yellow-400",
  waves:           "bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-400",
};

interface Props {
  categories: ServiceCategory[];
  services: Service[];
  locale: string;
  token: string;
}

function formatPrice(price: number, unit: string): string {
  const fmt = `€${price % 1 === 0 ? price : price.toFixed(0)}`;
  if (unit === "per_hour")    return `from ${fmt}/hr`;
  if (unit === "per_session") return `from ${fmt}`;
  if (unit === "flat")        return `${fmt} flat fee`;
  return fmt;
}

function pick(obj: Record<string, string>, locale: string): string {
  return obj[locale] ?? obj.en ?? "";
}

export default function ServicesGrid({ categories, services, locale, token }: Props) {
  const t    = useTranslations("guest.home");
  const l    = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? services.filter((s) => s.category_id === activeCategory)
    : services;

  return (
    <div>
      {/* Category filter — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
            !activeCategory
              ? "bg-foreground text-background border-foreground shadow-warm-sm"
              : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
          )}
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground shadow-warm-sm"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {pick(cat.name as Record<string, string>, l)}
          </button>
        ))}
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-sm">No services in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((svc) => {
            const catIcon  = categories.find((c) => c.id === svc.category_id)?.icon ?? "";
            const Icon     = ICON_MAP[catIcon] ?? HelpCircle;
            const iconColor = ICON_COLORS[catIcon] ?? "bg-muted text-muted-foreground";
            const name     = pick(svc.name as Record<string, string>, l);
            const desc     = svc.description
              ? pick(svc.description as Record<string, string>, l)
              : null;

            return (
              <Link
                key={svc.id}
                href={`/${locale}/stay/${token}/book/${svc.id}`}
                className="group relative bg-card border border-border rounded-2xl p-5 card-hover shadow-warm-sm hover:shadow-warm hover:border-primary/30 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl" />

                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <p className="relative font-semibold text-foreground text-sm leading-tight mb-1">
                  {name}
                </p>
                {desc && (
                  <p className="relative text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {desc}
                  </p>
                )}
                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-semibold text-primary">
                    {formatPrice(svc.base_price, svc.price_unit)}
                  </p>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-primary transition-all duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
