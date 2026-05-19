// The middleware redirects / → /en automatically.
// This page is a fallback in case middleware is bypassed.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
