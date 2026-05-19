"use client";

import { usePathname } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";
import { LayoutDashboard, CalendarDays, Users, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SanchamarLogo } from "@/components/SanchamarLogo";

const navItems = [
  { label: "Dashboard",   href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Guest Stays", href: "/admin/stays",     icon: CalendarDays },
  { label: "Providers",   href: "/admin/providers", icon: Users },
  { label: "Bookings",    href: "/admin/bookings",  icon: ClipboardList },
];

interface Props {
  locale: string;
  userEmail: string;
}

export default function AdminSidebar({ locale, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/70">
        <SanchamarLogo variant="mark" height={28} />
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight tracking-tight">Sanchamar</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Admin Portal</p>
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
          <p className="text-[11px] text-muted-foreground truncate flex-1 mr-2">{userEmail}</p>
          <ThemeToggle />
        </div>
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirect_to" value={`/${locale}/admin/login`} />
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
