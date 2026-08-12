import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { createPropertyAction } from "@/features/properties/properties.actions";
import { PropertyForm } from "@/features/properties/property-form";

interface AdminNewPropertyPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminNewPropertyPage({
  searchParams,
}: AdminNewPropertyPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageIntro
        eyebrow="Admin propiedades"
        title="Nueva propiedad"
        description="Formulario real conectado a Supabase. Si RLS bloquea la escritura sin auth, vas a ver el error devuelto por Supabase."
        actions={
          <Link
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-strong"
            href="/admin/propiedades"
          >
            Volver al listado
          </Link>
        }
      />
      <div className="space-y-6">
        {params.error ? <Notice message={params.error} tone="error" /> : null}
        <PropertyForm action={createPropertyAction} submitLabel="Crear propiedad" />
      </div>
    </>
  );
}
