import Link from "next/link";
import { Plus } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { SuccessModal } from "@/components/ui/success-modal";
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
      {params.created ? <SuccessModal message={params.created} title="Proyecto creado" /> : null}
      {params.updated ? (
        <SuccessModal
          message={params.updated}
          title="Proyecto actualizado"
        />
      ) : null}
      <AdminProjectsTable
        actions={
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-strong"
            href="/admin/proyectos/nuevo"
          >
            <Plus className="h-4 w-4 stroke-[2.4] text-white" />
            <span className="text-white">Nuevo proyecto</span>
          </Link>
        }
        projects={result.data}
      >
        {params.success ? <Notice message={params.success} tone="success" /> : null}
        {params.error ? <Notice message={params.error} tone="error" /> : null}
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
