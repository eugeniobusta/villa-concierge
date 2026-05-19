"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { en: "EN", es: "ES", fr: "FR", de: "DE", it: "IT" };
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
        <Globe className="h-3.5 w-3.5" />
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
                  "w-full text-left px-3.5 py-2 text-sm transition-colors",
                  loc === locale
                    ? "text-primary font-medium bg-primary/5"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {NAMES[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
