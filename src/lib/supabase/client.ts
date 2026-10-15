import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });
}
