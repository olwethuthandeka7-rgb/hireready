import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

// Supabase client for code that runs in the browser
// (for example, a login form or a button click).
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}