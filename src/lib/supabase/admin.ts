import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// This client uses the service_role key, which bypasses ALL Row Level Security.
// It can read and write every table regardless of RLS policies.
// NEVER import this file in client components or expose it to the browser.
// Only use it in Server Actions and server-only route handlers.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
