"use client";

import { usePathname } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";
import { CalendarDays, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",    href: "/provider/dashboard",    icon: LayoutDashboard },
  { label: "Availability", href: "/provider/availability", icon: CalendarDays },
  { label: "Bookings",     href: "/provider/bookings",     icon: ClipboardList },
];

interface Props {
  locale: string;
  providerName: string;
}

export default function ProviderSidebar({ locale, providerName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-stone-200 bg-white h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-stone-100">
        <p className="text-xs font-semibold text-stone-800 leading-tight">Villa Concierge</p>
        <p className="text-[10px] text-stone-400 mt-0.5">Provider Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href.replace(`/${locale}`, ""));
          return (
            <Link
              key={href}
              href={`/${locale}${href}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sky-50 text-sky-800 font-medium"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-stone-100">
        <p className="text-[11px] text-stone-400 px-3 mb-2 truncate">{providerName}</p>
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirect_to" value={`/${locale}/provider/login`} />
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
