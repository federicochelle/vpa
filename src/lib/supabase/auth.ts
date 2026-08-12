import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminRole = ProfileRow["role"];

export interface AdminSession {
  user: {
    id: string;
    email: string | null;
  };
  profile: ProfileRow;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  if (!isAllowedAdminRole(profile.role)) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile,
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function redirectIfAuthenticatedAdmin() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }
}

export async function signOutAdminSession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

function isAllowedAdminRole(role: string): role is AdminRole {
  return role === "admin" || role === "editor";
}
