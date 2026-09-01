import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Notice } from "@/components/ui/notice";
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
      {params.created ? (
        <AdminFeedbackModal message={params.created} title="Propiedad creada" variant="success" />
      ) : null}
      {params.updated ? (
        <AdminFeedbackModal message={params.updated} title="Propiedad actualizada" variant="success" />
      ) : null}
      {params.success ? (
        <AdminFeedbackModal message={params.success} title="Operación completada" variant="success" />
      ) : null}
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos completar la acción" variant="error" />
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
