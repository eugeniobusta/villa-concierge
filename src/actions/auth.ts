"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type LoginState = { error: string } | null;

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

  // createClient() from server.ts uses @supabase/ssr which sets httpOnly
  // cookies automatically — no client-side JS needed at all.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Auth succeeded — the protected layout checks ADMIN_EMAIL on every request.
  redirect(`/${locale}/admin/dashboard`);
}

export async function logoutAction(formData: FormData) {
  const locale = (formData.get("locale") as string) || "en";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}
