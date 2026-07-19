import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// DANGER: this client uses the service_role key, which bypasses Row Level
// Security entirely. It must NEVER be imported into any "use client" file,
// and SUPABASE_SERVICE_ROLE_KEY must NEVER have the NEXT_PUBLIC_ prefix
// (that prefix is what exposes a variable to the browser bundle).
//
// Only use this inside Route Handlers (app/api/.../route.ts) or Server
// Actions — and always verify the caller is an authenticated admin
// (check admin_users via the regular server client) BEFORE using this.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}