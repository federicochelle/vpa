import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { listAllFeatures } from "@/features/features/features.data";
import { listAdminPropertyImages } from "@/features/properties/property-images.data";
import {
  getAdminPropertyById,
  getPropertyFeatureIds,
} from "@/features/properties/properties.data";
import { PropertyForm } from "@/features/properties/property-form";

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
  const [result, featuresResult, selectedFeatureIds, propertyImagesResult] = await Promise.all([
    getAdminPropertyById(id),
    listAllFeatures(),
    getPropertyFeatureIds(id),
    listAdminPropertyImages(id),
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
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-strong"
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
      <div>
        <div className="panel overflow-hidden">
          <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                  {result.data.title}
                </h1>
            </div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            {query.success ? <Notice message={query.success} tone="success" /> : null}
            {query.error ? <Notice message={query.error} tone="error" /> : null}
            <PropertyForm
              allFeatures={featuresResult.data}
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
