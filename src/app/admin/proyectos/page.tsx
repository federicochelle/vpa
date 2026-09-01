import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { AdminProjectsTable } from "@/features/projects/admin-projects-table";
import { listAdminProjects } from "@/features/projects/projects.data";

interface AdminProjectsPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
    success?: string;
    updated?: string;
  }>;
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const params = await searchParams;
  const result = await listAdminProjects();

  return (
    <>
      {params.created ? (
        <AdminFeedbackModal message={params.created} title="Proyecto creado" variant="success" />
      ) : null}
      {params.updated ? (
        <AdminFeedbackModal message={params.updated} title="Proyecto actualizado" variant="success" />
      ) : null}
      {params.success ? (
        <AdminFeedbackModal message={params.success} title="Operación completada" variant="success" />
      ) : null}
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos completar la acción" variant="error" />
      ) : null}
      <AdminProjectsTable
        actions={
          <Link
            className="admin-button-primary inline-flex items-center gap-2 font-bold"
            href="/admin/proyectos/nuevo"
          >
            <Plus className="h-4 w-4 stroke-[2.4] text-white" />
            <span className="text-white">Nuevo proyecto</span>
          </Link>
        }
        projects={result.data}
      >
        {!result.ok && result.error ? (
          <Notice
            message={`Supabase devolvió un error al listar proyectos: ${result.error.message}`}
            tone="error"
          />
        ) : null}
      </AdminProjectsTable>
    </>
  );
}
