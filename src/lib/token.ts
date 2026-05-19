// Characters chosen to avoid visually ambiguous pairs: 0/O, 1/I/L
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Generates a random 8-character access token like "MX9KP2AB".
// Cryptographically this isn't a secret key — it's a short access code.
// The security comes from: (a) keeping the URL private, (b) RLS enforcing
// that tokens only work within their check_in/check_out window.
export function generateAccessToken(): string {
  return Array.from({ length: 8 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}
