"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types/database";
import {
  ChefHat, Sparkles, ShoppingCart, Dumbbell, Flower2,
  Car, Map, Wine, Baby, Waves, HelpCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "chef-hat": ChefHat, sparkles: Sparkles, "shopping-cart": ShoppingCart,
  dumbbell: Dumbbell, "flower-2": Flower2, car: Car, map: Map,
  wine: Wine, baby: Baby, waves: Waves,
};

interface Props {
  categories: ServiceCategory[];
  services: Service[];
  locale: string;
  token: string;
}

function priceLabel(price: number, unit: string, locale: string) {
  const fmt = price.toLocaleString(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  if (unit === "per_hour") return `${fmt}/hr`;
  if (unit === "per_session") return `${fmt}/session`;
  if (unit === "flat") return fmt;
  return fmt;
}

// Pick the right language from a multilingual JSONB object, falling back to English
function pick(obj: Record<string, string>, locale: string): string {
  return obj[locale] ?? obj.en ?? "";
}

export default function ServicesGrid({ categories, services, locale, token }: Props) {
  const t  = useTranslations("guest.home");
  const currentLocale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? services.filter((s) => s.category_id === activeCategory)
    : services;

  return (
    <div>
      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
            !activeCategory
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
          )}
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              activeCategory === cat.id
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
            )}
          >
            {pick(cat.name as Record<string, string>, currentLocale)}
          </button>
        ))}
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <p className="text-stone-400 text-sm text-center py-12">—</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((svc) => {
            const catIcon = categories.find((c) => c.id === svc.category_id)?.icon ?? "";
            const Icon    = ICON_MAP[catIcon] ?? HelpCircle;
            const name    = pick(svc.name as Record<string, string>, currentLocale);
            const desc    = svc.description
              ? pick(svc.description as Record<string, string>, currentLocale)
              : null;

            return (
              <Link
                key={svc.id}
                href={`/${locale}/stay/${token}/book/${svc.id}`}
                className="group bg-white border border-stone-200 rounded-2xl p-4 hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                  <Icon className="h-5 w-5 text-amber-700" />
                </div>
                <p className="font-medium text-stone-800 text-sm leading-tight mb-0.5">{name}</p>
                {desc && (
                  <p className="text-xs text-stone-400 leading-tight mb-2 line-clamp-2">{desc}</p>
                )}
                <p className="text-xs font-semibold text-amber-700">
                  {priceLabel(svc.base_price, svc.price_unit, locale)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
