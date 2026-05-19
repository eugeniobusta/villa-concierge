"use client";

// Client component: needs usePathname() to highlight the active link.
import { usePathname } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";
import { Sun, LayoutDashboard, CalendarDays, Users, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Guest Stays", href: "/admin/stays",     icon: CalendarDays },
  { label: "Providers",  href: "/admin/providers",  icon: Users },
  { label: "Bookings",   href: "/admin/bookings",   icon: ClipboardList },
];

interface Props {
  locale: string;
  userEmail: string;
}

export default function AdminSidebar({ locale, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-stone-200 bg-white h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-stone-100">
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
          <Sun className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-800 leading-tight">Villa Concierge</p>
          <p className="text-[10px] text-stone-400">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const fullHref = `/${locale}${href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-800 font-medium"
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
        <p className="text-[11px] text-stone-400 px-3 mb-2 truncate">{userEmail}</p>
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
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
