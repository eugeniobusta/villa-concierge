"use client";

// useTheme from next-themes reads from localStorage and respects system preference.
// The mounted guard prevents a hydration mismatch — the server doesn't know the
// user's preference, so we render a placeholder until the client is ready.

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  // resolvedTheme correctly resolves "system" to the actual OS preference
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-secondary",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
