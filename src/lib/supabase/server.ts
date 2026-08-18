import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseEnv, getSupabaseServiceRoleEnv } from "@/lib/supabase/env";

export async function createSupabaseServerComponentClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Components can read cookies but cannot persist them.
        // Auth cookie writes are handled only from Server Actions.
      },
    },
  });
}

export async function createSupabaseServerActionClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export const createSupabaseServerClient = createSupabaseServerComponentClient;

export function createSupabaseServiceRoleClient() {
  const { supabaseServiceRoleKey, supabaseUrl } = getSupabaseServiceRoleEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
