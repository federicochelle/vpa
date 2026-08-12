import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { getAdminPropertyById } from "@/features/properties/properties.data";
import { PropertyForm } from "@/features/properties/property-form";
import { updatePropertyAction } from "@/features/properties/properties.actions";

interface AdminEditPropertyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function AdminEditPropertyPage({
  params,
  searchParams,
}: AdminEditPropertyPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getAdminPropertyById(id);

  if (!result.ok && result.error) {
    return (
      <>
        <PageIntro
          eyebrow="Admin propiedades"
          title="Editar propiedad"
          description="La lectura de este registro devolvio un error desde Supabase."
          actions={
            <Link
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-strong"
              href="/admin/propiedades"
            >
              Volver al listado
            </Link>
          }
        />
        <Notice
          message={`Supabase devolvio un error al cargar la propiedad: ${result.error.message}`}
          tone="error"
        />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Admin propiedades"
        title={`Editar: ${result.data.title}`}
        description="Edicion real conectada a Supabase. Sin auth, las escrituras pueden ser rechazadas por RLS."
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
        {query.success ? <Notice message={query.success} tone="success" /> : null}
        {query.error ? <Notice message={query.error} tone="error" /> : null}
        <PropertyForm
          action={updatePropertyAction}
          property={result.data}
          submitLabel="Guardar cambios"
        />
      </div>
    </>
  );
}
