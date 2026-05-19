"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useState } from "react";

const labels: Record<string, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
};

const names: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-xs"
      >
        <Globe className="h-3.5 w-3.5" />
        {labels[locale]}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg py-1 min-w-[130px] z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                loc === locale
                  ? "text-amber-700 font-medium"
                  : "text-stone-600"
              }`}
            >
              {names[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
