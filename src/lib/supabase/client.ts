import { createBrowserClient } from "@supabase/ssr";

// Use this client in Client Components ("use client" files) — the login
// flow, dashboard, wallet, etc. all run in the browser and should import
// from here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}