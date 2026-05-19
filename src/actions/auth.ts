"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type LoginState = { error: string } | { redirect: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const locale   = (formData.get("locale") as string) || "en";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Return redirect URL — client navigates via window.location.href to ensure
  // the session cookie from signInWithPassword is present in the next request.
  return { redirect: `/${locale}/admin/dashboard` };
}

export async function logoutAction(formData: FormData) {
  const locale      = (formData.get("locale") as string) || "en";
  const redirectTo  = (formData.get("redirect_to") as string) || `/${locale}/admin/login`;
  const supabase    = await createClient();
  await supabase.auth.signOut();
  redirect(redirectTo);
}

// NOTE: providerLoginAction returns { redirect: url } instead of calling redirect()
// because on Vercel production the Set-Cookie headers from signInWithPassword don't
// flush reliably before a server-side redirect() throws. Returning the URL and
// letting the client navigate via window.location.href forces a full page reload
// which guarantees the session cookie is present in the next request.
type ProviderLoginState = { error: string } | { redirect: string } | null;

export async function providerLoginAction(
  _prev: ProviderLoginState,
  formData: FormData
): Promise<ProviderLoginState> {
  const email    = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const locale   = (formData.get("locale") as string) || "en";

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  return { redirect: `/${locale}/provider/dashboard` };
}
