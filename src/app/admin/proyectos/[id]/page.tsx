import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { Notice } from "@/components/ui/notice";
import { listAllFeatures } from "@/features/features/features.data";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ProjectReadOnlyDetails } from "@/features/projects/project-read-only-details";
import { listAdminProjectImages } from "@/features/projects/project-images.data";
import { deleteProjectAction } from "@/features/projects/projects.actions";
import {
  getAdminProjectById,
  getProjectFeatureIds,
} from "@/features/projects/projects.data";

interface AdminProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({
  params,
}: AdminProjectDetailPageProps) {
  const { id } = await params;
  const [result, featuresResult, selectedFeatureIds, projectImagesResult] = await Promise.all([
    getAdminProjectById(id),
    listAllFeatures(),
    getProjectFeatureIds(id),
    listAdminProjectImages(id),
  ]);

  if (!result.ok && result.error) {
    return (
      <AdminRecordShell
        actions={
          <Link
            className="admin-button-secondary text-primary-strong"
            href="/admin/proyectos"
          >
            Volver al listado
          </Link>
        }
        title="Detalle del proyecto"
      >
        <Notice
          message={`Supabase devolvió un error al cargar el proyecto: ${result.error.message}`}
          tone="error"
        />
      </AdminRecordShell>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div>
      <AdminRecordShell
        actions={
          <>
            <Link
              className="admin-button-secondary text-primary-strong"
              href="/admin/proyectos"
            >
              Volver al listado
            </Link>
            <Link
              aria-label="Editar"
              className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
              href={`/admin/proyectos/${id}/editar`}
              title="Editar"
            >
              <Pencil className="h-4 w-4 stroke-[2.2]" />
              <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Editar
              </span>
            </Link>
            <form action={deleteProjectAction}>
              <input name="id" type="hidden" value={id} />
              <input name="confirmation" type="hidden" value="confirmed" />
              <DeleteProjectButton label="Eliminar" />
            </form>
          </>
        }
        title={result.data.name}
      >
        <ProjectReadOnlyDetails
          features={featuresResult.data}
          images={projectImagesResult.ok ? projectImagesResult.data : []}
          project={result.data}
          selectedFeatureIds={selectedFeatureIds}
        />
      </AdminRecordShell>
    </div>
  );
}
