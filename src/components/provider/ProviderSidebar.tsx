"use client";

import { usePathname } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";
import { CalendarDays, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border/70">
        <p className="text-xs font-semibold text-foreground leading-tight tracking-tight">Villa Concierge</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Provider Portal</p>
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
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/70 space-y-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] text-muted-foreground truncate flex-1 mr-2">{providerName}</p>
          <ThemeToggle />
        </div>
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirect_to" value={`/${locale}/provider/login`} />
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
