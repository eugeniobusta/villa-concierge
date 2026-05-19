"use client";

import { usePathname } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";
import { CalendarDays, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";

const navItems = [
  { label: "Dashboard",    href: "/provider/dashboard",    icon: LayoutDashboard, tour: undefined           },
  { label: "Availability", href: "/provider/availability", icon: CalendarDays,    tour: "availability-nav"  },
  { label: "Bookings",     href: "/provider/bookings",     icon: ClipboardList,   tour: "bookings-nav"      },
];

interface Props {
  locale: string;
  providerName: string;
}

export default function ProviderSidebar({ locale, providerName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-14 md:w-56 flex-shrink-0 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-200">

      {/* Brand */}
      <div className="flex items-center justify-center md:justify-start gap-2.5 px-2 md:px-5 py-4 md:py-5 border-b border-border/70">
        <SanchamarLogo variant="mark" height={28} className="flex-shrink-0" />
        <div className="hidden md:block">
          <p className="text-xs font-semibold text-foreground leading-tight tracking-tight">Sanchamar</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Provider Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 md:px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon, tour }) => {
          const isActive = pathname.startsWith(href.replace(`/${locale}`, ""));
          return (
            <Link
              key={href}
              href={`/${locale}${href}`}
              title={label}
              {...(tour ? { "data-tour": tour } : {})}
              className={cn(
                "flex items-center justify-center md:justify-start gap-2.5 px-2 md:px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-1.5 md:px-3 py-4 border-t border-border/70 space-y-1">
        <div className="hidden md:flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] text-muted-foreground truncate flex-1 mr-2">{providerName}</p>
          <ThemeToggle />
        </div>
        <div className="flex justify-center md:hidden mb-2">
          <ThemeToggle />
        </div>
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirect_to" value={`/${locale}/provider/login`} />
          <button
            type="submit"
            title="Sign out"
            className="flex items-center justify-center md:justify-start gap-2.5 w-full px-2 md:px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:block">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
