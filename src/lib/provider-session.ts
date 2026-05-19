import { cache } from "react";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import type { Provider } from "@/types/database";

// Cached per-request: layout validates, then every child page calls this
// for free — same DB result, no duplicate queries.
export const getProviderSession = cache(async (): Promise<Provider | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await createAdminClient()
    .from("providers")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return data ?? null;
});
