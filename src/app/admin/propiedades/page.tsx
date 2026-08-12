import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { AdminPropertiesTable } from "@/features/properties/admin-properties-table";
import { listAdminProperties } from "@/features/properties/properties.data";

interface AdminPropertiesPageProps {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function AdminPropertiesPage({
  searchParams,
}: AdminPropertiesPageProps) {
  const params = await searchParams;
  const result = await listAdminProperties();

  return (
    <>
      <PageIntro
        eyebrow="Admin propiedades"
        title="Gestion real de propiedades"
        description="Listado conectado a Supabase. Sin autenticacion, las escrituras pueden quedar bloqueadas por RLS."
        actions={
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            href="/admin/propiedades/nueva"
          >
            Nueva propiedad
          </Link>
        }
      />
      <div className="space-y-6">
        {params.success ? <Notice message={params.success} tone="success" /> : null}
        {params.error ? <Notice message={params.error} tone="error" /> : null}
        {!result.ok && result.error ? (
          <Notice
            message={`Supabase devolvio un error al listar propiedades: ${result.error.message}`}
            tone="error"
          />
        ) : null}
        <AdminPropertiesTable properties={result.data} />
      </div>
    </>
  );
}
