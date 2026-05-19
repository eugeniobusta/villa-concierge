import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ChefHat, Dumbbell, ShoppingCart, Sparkles, Car, Map,
  Flower2, Wine, Baby, Waves, Sun,
} from "lucide-react";

// Service icons and colors — labels come from translations
const SERVICE_ICONS = [
  { key: "chef",      icon: ChefHat,       color: "bg-amber-50 text-amber-700" },
  { key: "cleaning",  icon: Sparkles,      color: "bg-sky-50 text-sky-700" },
  { key: "groceries", icon: ShoppingCart,  color: "bg-emerald-50 text-emerald-700" },
  { key: "yoga",      icon: Dumbbell,      color: "bg-violet-50 text-violet-700" },
  { key: "massage",   icon: Flower2,       color: "bg-pink-50 text-pink-700" },
  { key: "transfer",  icon: Car,           color: "bg-slate-50 text-slate-700" },
  { key: "tours",     icon: Map,           color: "bg-orange-50 text-orange-700" },
  { key: "wine",      icon: Wine,          color: "bg-rose-50 text-rose-700" },
  { key: "childcare", icon: Baby,          color: "bg-yellow-50 text-yellow-700" },
  { key: "laundry",   icon: Waves,         color: "bg-teal-50 text-teal-700" },
];

export default async function LandingPage() {
  // getTranslations reads the locale automatically from the request context
  const t = await getTranslations("landing");
  const ts = await getTranslations("services"); // service names from messages

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Sun className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-semibold text-stone-800 tracking-wide text-sm">
              Villa Concierge
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/60 to-stone-100" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <Badge
            variant="secondary"
            className="mb-5 bg-amber-100 text-amber-800 border-amber-200 text-xs tracking-wider uppercase"
          >
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 mb-5 tracking-tight leading-tight">
            {t("headline")}
          </h1>
          <p className="text-stone-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            {t("subtext")}
          </p>
          <Separator className="max-w-xs mx-auto mb-8 bg-stone-200" />
          <p className="text-sm text-stone-400">{t("notice")}</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest text-center mb-8">
          {t("servicesLabel")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SERVICE_ICONS.map(({ key, icon: Icon, color }) => (
            <Card key={key} className="border-stone-200 bg-white hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-medium text-stone-800 text-sm leading-tight">
                  {ts(`${key}.label`)}
                </p>
                <p className="text-xs text-stone-400 mt-1 leading-tight">
                  {ts(`${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 text-center">
        <p className="text-xs text-stone-300">Private platform · Villa Concierge Malaga</p>
      </footer>
    </div>
  );
}
