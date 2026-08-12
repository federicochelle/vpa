"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAdminSession } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const email = toRequiredString(formData.get("email"));
  const password = toRequiredString(formData.get("password"));
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("No se pudo obtener la sesion autenticada.")}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError) {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent(
        [
          "Supabase profile read error",
          `message=${profileError.message}`,
          `code=${profileError.code ?? ""}`,
          `details=${profileError.details ?? ""}`,
          `hint=${profileError.hint ?? ""}`,
        ].join(" | "),
      )}`,
    );
  }

  if (!profile) {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent("No existe un profile para este usuario.")}`,
    );
  }

  if (profile.role !== "admin" && profile.role !== "editor") {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent(
        "La cuenta no tiene permisos de administracion.",
      )}`,
    );
  }

  redirect("/admin");
}

export async function logoutAction() {
  await signOutAdminSession();
  redirect("/login");
}
