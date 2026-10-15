"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type InviteState = "loading" | "ready" | "success" | "error";

const INVALID_LINK_MESSAGE =
  "Este enlace de invitación no es válido, venció o ya fue utilizado. Solicitá un nuevo enlace al equipo de VPA.";

function cleanInviteUrl() {
  if (typeof window === "undefined" || !window.history.replaceState) {
    return;
  }

  window.history.replaceState({}, document.title, window.location.pathname);
}

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return INVALID_LINK_MESSAGE;
  }

  const normalized = error.message.toLowerCase();
  if (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("used") ||
    normalized.includes("token") ||
    normalized.includes("otp")
  ) {
    return INVALID_LINK_MESSAGE;
  }

  return "No pudimos validar el enlace de invitación. Intentá nuevamente o solicitá un enlace nuevo.";
}

export function InvitePasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [state, setState] = useState<InviteState>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function establishInviteSession() {
      try {
        const url = new URL(window.location.href);
        const tokenHash = url.searchParams.get("token_hash");
        const tokenType = url.searchParams.get("type") as EmailOtpType | null;

        if (
          tokenHash &&
          tokenType &&
          tokenType !== "invite" &&
          tokenType !== "recovery"
        ) {
          throw new Error("Invalid invite type");
        }

        if (tokenHash && (tokenType === "invite" || tokenType === "recovery")) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: tokenType,
          });

          if (error) {
            throw error;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw sessionError ?? new Error("Missing invite session");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("Missing invite user");
        }

        if (cancelled) {
          return;
        }

        setEmail(user.email ?? null);
        setState("ready");
        cleanInviteUrl();
      } catch (error) {
        if (cancelled) {
          return;
        }

        await supabase.auth.signOut().catch(() => undefined);
        setMessage(getAuthErrorMessage(error));
        setState("error");
        cleanInviteUrl();
      }
    }

    void establishInviteSession();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(getAuthErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    setState("success");
    await supabase.auth.signOut().catch(() => undefined);
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-[24px] border border-primary-strong bg-primary p-6 text-white shadow-[0_14px_40px_rgba(39,39,39,0.05)] sm:p-8">
        <div className="space-y-2">
          <p className="type-caption text-white/70">VPA</p>
          <h1 className="type-heading text-white">Crear contraseña</h1>
          <p className="type-body-compact text-white/80">
            {email
              ? `Configurá la contraseña para ${email}.`
              : "Configurá la contraseña de tu cuenta."}
          </p>
        </div>

        {state === "loading" ? (
          <p className="mt-8 rounded-2xl bg-white/10 p-4 text-sm text-white/90">
            Validando tu enlace…
          </p>
        ) : null}

        {state === "error" ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/90">
              {message ?? INVALID_LINK_MESSAGE}
            </p>
            <a className="button-primary inline-flex w-full justify-center" href="/login">
              Ir al login
            </a>
          </div>
        ) : null}

        {state === "ready" ? (
          <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2" htmlFor="invite-password">
              <span className="type-body-compact font-medium text-white">Contraseña</span>
              <input
                autoComplete="new-password"
                className="type-input w-full rounded-2xl border border-white bg-white px-4 py-3 text-foreground outline-none focus:ring-4 focus:ring-white/20"
                id="invite-password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            <label className="flex flex-col gap-2" htmlFor="invite-password-confirmation">
              <span className="type-body-compact font-medium text-white">Confirmar contraseña</span>
              <input
                autoComplete="new-password"
                className="type-input w-full rounded-2xl border border-white bg-white px-4 py-3 text-foreground outline-none focus:ring-4 focus:ring-white/20"
                id="invite-password-confirmation"
                minLength={8}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                type="password"
                value={confirmation}
              />
            </label>
            {message ? <p className="text-sm text-white/90">{message}</p> : null}
            <button
              className="button-primary inline-flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        ) : null}

        {state === "success" ? (
          <p className="mt-8 rounded-2xl bg-white/10 p-4 text-sm text-white/90">
            Contraseña guardada. Redirigiendo al login…
          </p>
        ) : null}
      </section>
    </main>
  );
}
