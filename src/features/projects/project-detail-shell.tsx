import {
  Building2,
  CalendarClock,
  Hammer,
  MapPin,
} from "lucide-react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { PublicLocationMap } from "@/components/maps/public-location-map";
import { listPublishedProjectImages } from "@/features/projects/project-images.data";
import { normalizeLocationPart } from "@/features/properties/property-location";
import { parseVideoUrl } from "@/lib/youtube";
import { PROJECT_CONSTRUCTION_STATUS_LABELS, type Project } from "@/types/project";

interface ProjectDetailShellProps {
  project: Project;
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
  const parsedVideo = project.videoUrl ? parseVideoUrl(project.videoUrl) : null;
  const videoEmbedUrl = parsedVideo
    ? parsedVideo.provider === "youtube"
      ? `${parsedVideo.embedUrl}?controls=0&modestbranding=1&rel=0&playsinline=1`
      : parsedVideo.embedUrl
    : null;
  const mobileFullBleedClassName = "-mx-4 sm:mx-0";
  const addressLabel = normalizeLocationPart(project.address);
  const isInstagramVideo = parsedVideo?.provider === "instagram";

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-4">
          <div className={mobileFullBleedClassName}>
            <PublicImageGallery
              badgeLabel={project.isInvestmentOpportunity ? "INVERSION" : "PROYECTO"}
              emptyLabel={`Galeria preparada para el proyecto: ${project.slug}`}
              images={images}
            />
          </div>
          {parsedVideo ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Video</h2>
                <div
                  className={`mt-6 overflow-hidden bg-surface-muted ${
                    isInstagramVideo
                      ? "mx-auto w-full max-w-[380px] border border-border"
                      : "-mx-6 border-y border-border sm:mx-0 sm:border"
                  }`}
                >
                  <div
                    className={`${parsedVideo.aspectClassName} ${
                      isInstagramVideo ? "max-h-[680px]" : ""
                    }`}
                  >
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={videoEmbedUrl ?? undefined}
                      title={`${parsedVideo.title} de ${project.name}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Información principal</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="type-body-compact flex items-center gap-3 text-foreground">
                  <Building2 className="h-4 w-4 flex-none text-primary" />
                  <span>{project.developerName ?? "-"}</span>
                </div>
                <div className="type-body-compact flex items-center gap-3 text-foreground">
                  <Hammer className="h-4 w-4 flex-none text-primary" />
                  <span>
                    {project.constructionStatus
                      ? PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus]
                      : "-"}
                  </span>
                </div>
                <div className="type-body-compact flex items-center gap-3 text-foreground">
                  <CalendarClock className="h-4 w-4 flex-none text-primary" />
                  <span>{formatDeliveryDate(project.estimatedDeliveryDate)}</span>
                </div>
                <div className="type-body-compact flex items-center gap-3 text-foreground">
                  <MapPin className="h-4 w-4 flex-none text-primary" />
                  <span>{[project.neighborhood, project.city].filter(Boolean).join(", ") || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Descripción</h2>
              <p className="type-body mt-4 text-muted">
                {project.description ??
                  "Espacio listo para contenido editorial, amenities, avances y atributos del desarrollo."}
              </p>
            </div>
          </div>
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Amenities</h2>
              <p className="type-body mt-4 text-muted">
                La sección queda preparada para mostrar amenities, servicios y diferenciales del desarrollo cuando estén cargados.
              </p>
            </div>
          </div>
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Ubicación</h2>
              <PublicLocationMap
                address={project.address}
                fallbackLabel="Ubicación pendiente."
                latitude={project.latitude}
                locationLabel={addressLabel}
                longitude={project.longitude}
                title={`Mapa de ubicación de ${project.name}`}
              />
            </div>
          </div>
        </div>
        <aside className={`${mobileFullBleedClassName} lg:sticky lg:top-24 lg:self-start`}>
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
