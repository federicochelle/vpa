import {
  Building2,
  CalendarClock,
  Hammer,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { PublicLocationMap } from "@/components/maps/public-location-map";
import { FeatureChipList } from "@/components/ui/feature-chip-list";
import { listAllFeatures } from "@/features/features/features.data";
import { listPublishedProjectImages } from "@/features/projects/project-images.data";
import { getProjectFeatureIds } from "@/features/projects/projects.data";
import { normalizeLocationPart } from "@/features/properties/property-location";
import { parseVideoUrl } from "@/lib/youtube";
import { PROJECT_CONSTRUCTION_STATUS_LABELS, type Project } from "@/types/project";

interface ProjectDetailShellProps {
  project: Project;
}

interface ProjectFact {
  icon: LucideIcon;
  key: string;
  value: string;
}

function formatDeliveryDate(value: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat("es-UY", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export async function ProjectDetailShell({ project }: ProjectDetailShellProps) {
  const [imagesResult, featuresResult, selectedFeatureIds] = await Promise.all([
    listPublishedProjectImages(project.id),
    listAllFeatures(),
    getProjectFeatureIds(project.id),
  ]);
  const images = imagesResult.ok ? imagesResult.data : [];
  const selectedFeatureIdSet = new Set(selectedFeatureIds);
  const features = featuresResult.ok
    ? featuresResult.data.filter(
        (feature) => selectedFeatureIdSet.has(feature.id) && feature.name.trim().length > 0,
      )
    : [];
  const parsedVideo = project.videoUrl ? parseVideoUrl(project.videoUrl) : null;
  const videoEmbedUrl = parsedVideo
    ? parsedVideo.provider === "youtube"
      ? `${parsedVideo.embedUrl}?controls=0&modestbranding=1&rel=0&playsinline=1`
      : parsedVideo.embedUrl
    : null;
  const mobileFullBleedClassName = "-mx-4 min-w-0 sm:mx-0";
  const developerName = normalizeLocationPart(project.developerName);
  const deliveryDate = formatDeliveryDate(project.estimatedDeliveryDate);
  const projectLocation = [
    normalizeLocationPart(project.neighborhood),
    normalizeLocationPart(project.city),
  ]
    .filter((part): part is string => Boolean(part))
    .join(", ") || null;
  const description = project.description?.trim() || null;
  const facts: ProjectFact[] = [];

  if (developerName) {
    facts.push({ icon: Building2, key: "developer", value: developerName });
  }

  if (project.constructionStatus) {
    facts.push({
      icon: Hammer,
      key: "constructionStatus",
      value: PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus],
    });
  }

  if (deliveryDate) {
    facts.push({ icon: CalendarClock, key: "deliveryDate", value: deliveryDate });
  }

  if (projectLocation) {
    facts.push({ icon: MapPin, key: "location", value: projectLocation });
  }

  return (
    <div className="shell section-gap w-full max-w-full min-w-0 !pt-4">
      <section className="grid w-full max-w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {images.length > 0 ? (
            <div className={mobileFullBleedClassName}>
              <PublicImageGallery
                badgeLabel={project.isInvestmentOpportunity ? "INVERSION" : "PROYECTO"}
                emptyLabel=""
                images={images}
              />
            </div>
          ) : null}
          {parsedVideo ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Video</h2>
                <div
                  className="mt-6 w-full max-w-full min-w-0 overflow-hidden border border-border bg-surface-muted"
                >
                  <div
                    className={`w-full max-w-full min-w-0 ${parsedVideo.aspectClassName}`}
                  >
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full max-w-full border-0"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={videoEmbedUrl ?? undefined}
                      title={`${parsedVideo.title} de ${project.name}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {facts.length > 0 ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Información principal</h2>
                <div className="mt-8 grid w-full max-w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">
                  {facts.map((fact) => {
                    const Icon = fact.icon;

                    return (
                      <div
                        className="type-body-compact flex min-w-0 items-center gap-3 text-foreground"
                        key={fact.key}
                      >
                        <Icon className="h-4 w-4 flex-none text-primary" />
                        <span>{fact.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          {description ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Descripción</h2>
                <p className="type-body mt-4 whitespace-pre-wrap break-words text-muted [overflow-wrap:anywhere]">
                  {description}
                </p>
              </div>
            </div>
          ) : null}
          {features.length > 0 ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Amenities</h2>
                <div className="mt-4">
                  <FeatureChipList features={features} />
                </div>
              </div>
            </div>
          ) : null}
          <div className={mobileFullBleedClassName}>
            <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Ubicación</h2>
              <PublicLocationMap
                fallbackLabel="No se pudo mostrar el mapa."
                latitude={project.latitude}
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
