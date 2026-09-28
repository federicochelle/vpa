import Link from "next/link";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { ProjectAdvisorForm } from "@/features/projects/project-advisor-form";

interface AdminNewProjectAdvisorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminNewProjectAdvisorPage({
  searchParams,
}: AdminNewProjectAdvisorPageProps) {
  const params = await searchParams;

  return (
    <>
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos crear el asesor" variant="error" />
      ) : null}
      <AdminRecordShell
        actions={
          <Link className="admin-button-secondary text-primary-strong" href="/admin/asesores">
            Volver al listado
          </Link>
        }
        title="Nuevo asesor"
      >
        <ProjectAdvisorForm submitLabel="Crear asesor" />
      </AdminRecordShell>
    </>
  );
}
