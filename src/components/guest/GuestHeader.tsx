import { Sun } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { GuestSession } from "@/types/database";
import { formatDate } from "@/lib/guest-session";

interface Props {
  session: GuestSession;
  locale: string;
  token: string;
}

export default function GuestHeader({ session, locale, token }: Props) {
  const base = `/${locale}/stay/${token}`;

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between">
          <Link href={base} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Sun className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="font-semibold text-stone-800 text-sm tracking-wide">
              Villa Concierge
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`${base}/bookings`}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
            >
              My Bookings
            </Link>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Welcome bar */}
        <div className="py-2 border-t border-stone-100 flex items-center gap-2">
          <p className="text-xs text-stone-500">
            Welcome, <span className="font-medium text-stone-700">{session.guest_name}</span>
            <span className="mx-2 text-stone-200">·</span>
            <span>{formatDate(session.check_in)} – {formatDate(session.check_out)}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
