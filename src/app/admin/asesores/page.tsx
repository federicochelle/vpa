import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { Notice } from "@/components/ui/notice";
import { AdminProjectAdvisorsTable } from "@/features/projects/admin-project-advisors-table";
import { listAdminProjectAdvisors } from "@/features/projects/projects.data";

interface AdminProjectAdvisorsPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
    updated?: string;
  }>;
}

export default async function AdminProjectAdvisorsPage({
  searchParams,
}: AdminProjectAdvisorsPageProps) {
  const params = await searchParams;
  const result = await listAdminProjectAdvisors();

  return (
    <>
      {params.created ? (
        <AdminFeedbackModal message={params.created} title="Asesor creado" variant="success" />
      ) : null}
      {params.updated ? (
        <AdminFeedbackModal message={params.updated} title="Asesor actualizado" variant="success" />
      ) : null}
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos completar la acción" variant="error" />
      ) : null}

      <AdminProjectAdvisorsTable
        actions={
          <Link className="admin-button-primary inline-flex items-center gap-2 font-bold" href="/admin/asesores/nuevo">
            <Plus className="h-4 w-4 stroke-[2.4] text-white" />
            <span className="text-white">Nuevo asesor</span>
          </Link>
        }
        advisors={result.data}
        title="Asesores"
      >
        {!result.ok && result.error ? (
          <Notice
            message={`Supabase devolvió un error al listar asesores: ${result.error.message}`}
            tone="error"
          />
        ) : null}
      </AdminProjectAdvisorsTable>
    </>
  );
}
