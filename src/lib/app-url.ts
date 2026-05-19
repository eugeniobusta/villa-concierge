/**
 * Returns the public base URL of the app.
 *
 * Priority:
 *  1. NEXT_PUBLIC_APP_URL   — manually set in Vercel project settings (most reliable)
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel system var: stable production URL, never
 *                            the hashed preview URL, no authentication wall
 *  3. VERCEL_URL            — current deployment URL (may be a protected preview deployment)
 *  4. http://localhost:3000 — local development fallback
 *
 * Why NOT just VERCEL_URL:
 *   Every git push creates a unique preview URL like
 *   `project-abc123-owner.vercel.app`. Those URLs are behind Vercel's
 *   deployment protection and redirect visitors to a Vercel login page.
 *   VERCEL_PROJECT_PRODUCTION_URL always resolves to the stable production
 *   domain so guest links work correctly.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
