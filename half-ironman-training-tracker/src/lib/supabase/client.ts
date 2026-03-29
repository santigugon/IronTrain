import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Don't throw at module-eval time; let pages render and show a friendly error.
    // Throwing here will still surface clearly when a query is attempted.
    throw new Error(
      "Missing Supabase env. Ensure `.env.local` has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart `npm run dev`."
    );
  }

  _client = createClient(url, anonKey);
  return _client;
}
