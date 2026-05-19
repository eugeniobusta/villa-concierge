"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { en: "EN", es: "ES", fr: "FR", de: "DE", it: "IT" };
const FLAGS:  Record<string, string> = { en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹" };
const NAMES:  Record<string, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano",
};

export default function LanguageSwitcher() {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
          "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <span className="text-base leading-none">{FLAGS[locale]}</span>
        {LABELS[locale]}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-warm-lg py-1.5 min-w-[140px] z-50">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center gap-2.5",
                  loc === locale
                    ? "text-primary font-medium bg-primary/5"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <span className="text-base leading-none">{FLAGS[loc]}</span>
                {NAMES[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
