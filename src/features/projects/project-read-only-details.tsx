import Image from "next/image";
import { AdminReadOnlyField } from "@/components/admin/admin-read-only-field";
import { PROJECT_CONSTRUCTION_STATUS_LABELS } from "@/types/project";
import type { Feature } from "@/types/feature";
import type { Project, ProjectImage } from "@/types/project";

interface ProjectReadOnlyDetailsProps {
  features: Feature[];
  images: ProjectImage[];
  project: Project;
  selectedFeatureIds: string[];
}

export function ProjectReadOnlyDetails({ features, images, project, selectedFeatureIds }: ProjectReadOnlyDetailsProps) {
  const selectedFeatures = selectedFeatureIds.map((id) => features.find((feature) => feature.id === id)).filter((feature): feature is Feature => Boolean(feature));

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-3"><AdminReadOnlyField label="Nombre" plain value={project.name} /></div>
        <div className="xl:col-span-3"><AdminReadOnlyField label="Desarrollador" plain value={project.developerName ?? ""} /></div>
        <div className="xl:col-span-6 grid gap-6 md:grid-cols-2">
          <AdminReadOnlyField label="Estado de proyecto" plain value={project.constructionStatus ? PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus] : ""} />
          <AdminReadOnlyField label="Fecha estimada de entrega" plain value={project.estimatedDeliveryDate ?? ""} />
        </div>
        <div className="md:col-span-2 xl:col-span-6"><div className="border-t border-border" /></div>
        <div className="xl:col-span-4"><AdminReadOnlyField label="Dirección" plain value={project.address ?? ""} /></div>
        <div className="xl:col-span-2"><AdminReadOnlyField label="Barrio" plain value={project.neighborhood ?? ""} /></div>
      </div>
      <div className="mt-6 border-t border-border pt-6"><AdminReadOnlyField className="min-h-40" label="Descripción" multiline plain value={project.description ?? ""} /></div>
      <div className="mt-6 pt-6"><div className="flex flex-col gap-2"><span className="type-body-compact font-medium text-primary-strong">Amenities</span>{selectedFeatures.length > 0 ? <div className="flex flex-wrap gap-2">{selectedFeatures.map((feature) => <span className="type-body-compact inline-flex items-center rounded-full border border-primary/12 bg-primary/8 px-3 py-2 font-medium text-primary-strong" key={feature.id}>{feature.name}</span>)}</div> : <p className="type-body-compact text-muted">Sin amenities seleccionados.</p>}</div></div>
      <div className="mt-6 border-t border-border pt-6"><h3 className="type-body-compact font-medium text-primary-strong">Galería de imágenes</h3>{images.length > 0 ? <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.slice().sort((left, right) => left.sortOrder - right.sortOrder).map((image) => <article className="overflow-hidden border border-border bg-white" key={image.id}><div className="relative aspect-[4/3] bg-surface-muted"><Image alt={`Imagen de proyecto ${image.id}`} className="object-cover" fill sizes="(min-width: 1280px) 24rem, (min-width: 640px) 50vw, 100vw" src={image.url} unoptimized />{image.isCover ? <span className="admin-status-pill absolute left-3 top-3">Portada</span> : null}</div></article>)}</div> : <p className="type-body-compact mt-4 text-muted">—</p>}</div>
      <div className="mt-6 border-t border-border pt-6"><AdminReadOnlyField label="Video YouTube / Instagram" plain value={project.videoUrl ?? ""} /></div>
    </div>
  );
}
