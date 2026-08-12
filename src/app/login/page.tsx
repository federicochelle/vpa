import Link from "next/link";
import { Notice } from "@/components/ui/notice";
import { LoginForm } from "@/features/auth/login-form";
import { redirectIfAuthenticatedAdmin } from "@/lib/supabase/auth";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticatedAdmin();
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Acceso administrativo</p>
          <h1 className="font-display text-4xl leading-tight text-foreground">
            Ingresar al panel
          </h1>
          <p className="text-sm leading-7 text-muted">
            Acceso restringido a usuarios con rol <strong>admin</strong> o{" "}
            <strong>editor</strong>.
          </p>
        </div>
        {params.error ? <Notice message={params.error} tone="error" /> : null}
        <LoginForm />
        <div className="text-center text-sm text-muted">
          <Link className="transition-colors hover:text-primary-strong" href="/">
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
