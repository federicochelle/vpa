const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function hasSupabaseServiceRoleEnv() {
  return hasSupabaseEnv() && Boolean(supabaseServiceRoleKey);
}

export function getSupabaseServiceRoleEnv() {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}
