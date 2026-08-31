import Link from "next/link";
import { Plus } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { SuccessModal } from "@/components/ui/success-modal";
import { AdminPropertiesTable } from "@/features/properties/admin-properties-table";
import { listAdminProperties } from "@/features/properties/properties.data";

interface AdminPropertiesPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
    success?: string;
    updated?: string;
  }>;
}

export default async function AdminPropertiesPage({
  searchParams,
}: AdminPropertiesPageProps) {
  const params = await searchParams;
  const result = await listAdminProperties();

  return (
    <>
      {params.created ? <SuccessModal message={params.created} /> : null}
      {params.updated ? (
        <SuccessModal
          message={params.updated}
          title="Propiedad actualizada"
        />
      ) : null}
      <AdminPropertiesTable
        actions={
          <Link
            className="admin-button-primary inline-flex items-center gap-2 font-bold"
            href="/admin/propiedades/nueva"
          >
            <Plus className="h-4 w-4 stroke-[2.4] text-white" />
            <span className="text-white">Nueva propiedad</span>
          </Link>
        }
        properties={result.data}
      >
        {params.success ? <Notice message={params.success} tone="success" /> : null}
        {params.error ? <Notice message={params.error} tone="error" /> : null}
        {!result.ok && result.error ? (
          <Notice
            message={`Supabase devolvio un error al listar propiedades: ${result.error.message}`}
            tone="error"
          />
        ) : null}
      </AdminPropertiesTable>
    </>
  );
}
