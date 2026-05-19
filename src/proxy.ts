import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16: the proxy file replaces middleware.ts
// Named export "proxy" is the new convention
export const proxy = createMiddleware(routing);

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
