import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { listAllFeatures } from "@/features/features/features.data";
import { listAdminPropertyImages } from "@/features/properties/property-images.data";
import {
  getAdminPropertyById,
  getPropertyFeatureIds,
} from "@/features/properties/properties.data";
import { PropertyForm } from "@/features/properties/property-form";
import { listAdminProjects } from "@/features/projects/projects.data";

interface AdminEditPropertyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function AdminEditPropertyPage({
  params,
  searchParams,
}: AdminEditPropertyPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [
    result,
    featuresResult,
    selectedFeatureIds,
    propertyImagesResult,
    projectsResult,
  ] = await Promise.all([
    getAdminPropertyById(id),
    listAllFeatures(),
    getPropertyFeatureIds(id),
    listAdminPropertyImages(id),
    listAdminProjects(),
  ]);

  if (!result.ok && result.error) {
    return (
      <>
        <PageIntro
          eyebrow="Admin propiedades"
          title="Editar propiedad"
          description="La lectura de este registro devolvio un error desde Supabase."
          actions={
            <Link
              className="admin-button-secondary text-primary-strong"
              href="/admin/propiedades"
            >
              Volver al listado
            </Link>
          }
        />
        <Notice
          message={`Supabase devolvio un error al cargar la propiedad: ${result.error.message}`}
          tone="error"
        />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      {query.success ? (
        <AdminFeedbackModal message={query.success} title="Propiedad creada" variant="success" />
      ) : null}
      {query.error ? (
        <AdminFeedbackModal message={query.error} title="No pudimos guardar la propiedad" variant="error" />
      ) : null}
      <div>
        <div className="panel admin-form-panel overflow-hidden">
          <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
            <div className="space-y-4">
              <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                  {result.data.title}
                </h4>
            </div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <PropertyForm
              allFeatures={featuresResult.data}
              allProjects={projectsResult.data}
              className="space-y-0"
              property={result.data}
              propertyImages={propertyImagesResult.ok ? propertyImagesResult.data : []}
              selectedFeatureIds={selectedFeatureIds}
              submitLabel="Guardar cambios"
            />
          </div>
        </div>
      </div>
    </>
  );
}
