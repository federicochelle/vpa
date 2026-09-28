import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { Notice } from "@/components/ui/notice";
import { ProjectAdvisorForm } from "@/features/projects/project-advisor-form";
import { getAdminProjectAdvisorById } from "@/features/projects/projects.data";

interface AdminEditProjectAdvisorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminEditProjectAdvisorPage({
  params,
  searchParams,
}: AdminEditProjectAdvisorPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getAdminProjectAdvisorById(id);

  if (!result.ok && result.error) {
    return (
      <>
        <AdminRecordShell
          actions={
            <Link className="admin-button-secondary text-primary-strong" href="/admin/asesores">
              Volver al listado
            </Link>
          }
          title="Editar asesor"
        >
          <Notice
            message={`Supabase devolvió un error al cargar el asesor: ${result.error.message}`}
            tone="error"
          />
        </AdminRecordShell>
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      {query.error ? (
        <AdminFeedbackModal message={query.error} title="No pudimos guardar el asesor" variant="error" />
      ) : null}
      <AdminRecordShell
        actions={
          <Link className="admin-button-secondary text-primary-strong" href="/admin/asesores">
            Volver al listado
          </Link>
        }
        title={result.data.name}
      >
        <ProjectAdvisorForm
          advisor={result.data}
          submitLabel="Guardar cambios"
        />
      </AdminRecordShell>
    </>
  );
}
