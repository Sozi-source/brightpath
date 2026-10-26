import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: bypasses RLS. Use in server actions, webhooks, and authenticated server pages after verifying auth.getUser().
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Returns the service-role Supabase client when SUPABASE_SERVICE_ROLE_KEY is available,
 * avoiding PostgreSQL RLS recursion (error 54001) on server actions and pages that
 * have already verified user identity via `supabase.auth.getUser()`.
 */
export function getServerDbClient<T extends SupabaseClient>(fallbackClient: T): SupabaseClient {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  return fallbackClient;
}

