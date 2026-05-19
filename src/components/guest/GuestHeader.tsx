import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import type { GuestSession } from "@/types/database";
import { formatDate } from "@/lib/guest-session";

interface Props {
  session: GuestSession;
  locale: string;
  token: string;
}

export default async function GuestHeader({ session, locale, token }: Props) {
  const t    = await getTranslations("guest.header");
  const base = `/${locale}/stay/${token}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-5">
        {/* Main nav */}
        <div className="h-14 flex items-center justify-between">
          <Link href={base} className="flex items-center gap-2.5 group">
            <SanchamarLogo variant="full" height={24} />
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href={`${base}/bookings`}
              className="px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-150 whitespace-nowrap max-w-[90px] sm:max-w-none overflow-hidden text-ellipsis"
            >
              {t("myBookings")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Stay info bar */}
        <div className="h-9 flex items-center gap-2 border-t border-border/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{session.guest_name}</span>
            <span className="mx-1.5 opacity-30">·</span>
            <span>{formatDate(session.check_in)} – {formatDate(session.check_out)}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
