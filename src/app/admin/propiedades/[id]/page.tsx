import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { listAllFeatures } from "@/features/features/features.data";
import { DeletePropertyButton } from "@/features/properties/delete-property-button";
import { listAdminPropertyImages } from "@/features/properties/property-images.data";
import { PropertyForm } from "@/features/properties/property-form";
import { deletePropertyAction } from "@/features/properties/properties.actions";
import {
  getAdminPropertyById,
  getPropertyFeatureIds,
} from "@/features/properties/properties.data";

interface AdminPropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

function ActionTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
}

export default async function AdminPropertyDetailPage({
  params,
}: AdminPropertyDetailPageProps) {
  const { id } = await params;
  const [result, featuresResult, selectedFeatureIds, propertyImagesResult] =
    await Promise.all([
      getAdminPropertyById(id),
      listAllFeatures(),
      getPropertyFeatureIds(id),
      listAdminPropertyImages(id),
    ]);

  if (!result.ok && result.error) {
    return (
      <div className="panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-4">
              <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                Detalle de la propiedad
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-strong"
                href="/admin/propiedades"
              >
                Volver al listado
              </Link>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <Notice
            message={`Supabase devolvio un error al cargar la propiedad: ${result.error.message}`}
            tone="error"
          />
        </div>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-4">
              <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                {result.data.title}
              </h4>
            </div>
            <div className="flex shrink-0 flex-wrap items-start gap-3">
              <Link
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-strong"
                href="/admin/propiedades"
              >
                Volver al listado
              </Link>
              <Link
                aria-label="Editar"
                className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
                href={`/admin/propiedades/${id}/editar`}
                title="Editar"
              >
                <Pencil className="h-4 w-4 stroke-[2.2]" />
                <ActionTooltip label="Editar" />
              </Link>
              <form action={deletePropertyAction}>
                <input name="id" type="hidden" value={id} />
                <DeletePropertyButton label="Eliminar" />
              </form>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <PropertyForm
            allFeatures={featuresResult.data}
            className="space-y-0"
            property={result.data}
            propertyImages={propertyImagesResult.ok ? propertyImagesResult.data : []}
            readOnly
            selectedFeatureIds={selectedFeatureIds}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>
    </div>
  );
}
