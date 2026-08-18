import {
  Building2,
  CalendarClock,
  CircleDollarSign,
  Hammer,
  MapPin,
} from "lucide-react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { listPublishedProjectImages } from "@/features/projects/project-images.data";
import type { Project } from "@/types/project";

interface ProjectDetailShellProps {
  project: Project;
}

function formatConstructionStatus(status: Project["constructionStatus"]) {
  switch (status) {
    case "planned":
      return "Planificado";
    case "under_construction":
      return "En construcción";
    case "finished":
      return "Finalizado";
    default:
      return "-";
  }
}

function formatDeliveryDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-UY", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export async function ProjectDetailShell({ project }: ProjectDetailShellProps) {
  const imagesResult = await listPublishedProjectImages(project.id);
  const images = imagesResult.ok ? imagesResult.data : [];
  const location =
    [project.address, project.neighborhood, project.city, project.department]
      .filter(Boolean)
      .join(", ") || "Ubicación pendiente";

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-4">
          <PublicImageGallery
            emptyLabel={`Galeria preparada para el proyecto: ${project.slug}`}
            images={images}
          />
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Información principal</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Building2 className="h-4 w-4 flex-none text-primary" />
                <span>{project.developerName ?? "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Hammer className="h-4 w-4 flex-none text-primary" />
                <span>{formatConstructionStatus(project.constructionStatus)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <CalendarClock className="h-4 w-4 flex-none text-primary" />
                <span>{formatDeliveryDate(project.estimatedDeliveryDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <MapPin className="h-4 w-4 flex-none text-primary" />
                <span>{[project.neighborhood, project.city].filter(Boolean).join(", ") || "-"}</span>
              </div>
            </div>
          </div>
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Descripción</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {project.description ??
                "Espacio listo para contenido editorial, amenities, avances y atributos del desarrollo."}
            </p>
          </div>
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Amenities</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              La sección queda preparada para mostrar amenities, servicios y diferenciales del desarrollo cuando estén cargados.
            </p>
          </div>
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Ubicación y mapa</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{location}</p>
            <div className="mt-6 flex min-h-60 items-center justify-center rounded-none border border-dashed border-border bg-surface-strong px-6 text-center text-sm text-muted">
              Area lista para integrar ubicacion o mapa del proyecto en una fase posterior.
            </div>
          </div>
          {project.isInvestmentOpportunity ? (
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-2xl font-display text-primary-strong">Información de inversión</h2>
              <div className="mt-6 flex items-start gap-3 text-sm text-foreground">
                <CircleDollarSign className="h-4 w-4 flex-none text-primary" />
                <p className="leading-7 text-muted">
                  Este proyecto figura como oportunidad de inversión y la vista queda preparada para mostrar métricas, argumentos comerciales y documentación relevante.
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PublicInquirySidebar
            entityId={project.id}
            initialMessage={`Hola, estoy interesado/a en el proyecto ${project.name}. Quisiera recibir más información.`}
            kind="project"
            originPath={`/inversion/${project.slug}`}
            relatedTitle={project.name}
          />
        </aside>
      </section>
    </div>
  );
}
