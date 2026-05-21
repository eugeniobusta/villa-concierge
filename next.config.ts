import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  // Prevents clickjacking — blocks the site being embedded in an iframe
  { key: "X-Frame-Options",          value: "DENY" },
  // Stops browsers guessing content types (MIME-sniffing attacks)
  { key: "X-Content-Type-Options",   value: "nosniff" },
  // Downgrades referrer to origin-only on cross-site navigation
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  // Forces HTTPS for 1 year (including subdomains) once the site is live
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Controls which browser features can be used
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
