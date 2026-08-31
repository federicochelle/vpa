import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { listAllFeatures } from "@/features/features/features.data";
import { ProjectForm } from "@/features/projects/project-form";
import { listAdminProjectImages } from "@/features/projects/project-images.data";
import {
  getAdminProjectById,
  getProjectFeatureIds,
} from "@/features/projects/projects.data";

interface AdminEditProjectPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminEditProjectPage({
  params,
  searchParams,
}: AdminEditProjectPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [result, featuresResult, selectedFeatureIds, projectImagesResult] = await Promise.all([
    getAdminProjectById(id),
    listAllFeatures(),
    getProjectFeatureIds(id),
    listAdminProjectImages(id),
  ]);

  if (!result.ok && result.error) {
    return (
      <>
        <PageIntro
          eyebrow="Admin proyectos"
          title="Editar proyecto"
          description="La lectura de este registro devolvió un error desde Supabase."
          actions={
            <Link
              className="admin-button-secondary text-primary-strong"
              href="/admin/proyectos"
            >
              Volver al listado
            </Link>
          }
        />
        <Notice
          message={`Supabase devolvió un error al cargar el proyecto: ${result.error.message}`}
          tone="error"
        />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
          <div className="space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {result.data.name}
            </h4>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          {query.error ? <Notice message={query.error} tone="error" /> : null}
          <ProjectForm
            allFeatures={featuresResult.data}
            className="space-y-0"
            project={result.data}
            projectImages={projectImagesResult.ok ? projectImagesResult.data : []}
            selectedFeatureIds={selectedFeatureIds}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>
    </div>
  );
}
