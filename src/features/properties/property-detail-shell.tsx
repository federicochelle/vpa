import { Bath, BedDouble, CarFront, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { PublicLocationMap } from "@/components/maps/public-location-map";
import { ProjectCard } from "@/components/projects/project-card";
import { FeatureChipList } from "@/components/ui/feature-chip-list";
import {
  getPublishedProjectById,
  resolveProjectAdvisorForEntity,
} from "@/features/projects/projects.data";
import { listPublishedPropertyImages } from "@/features/properties/property-images.data";
import {
  getLocalizedPropertyDescription,
  getLocalizedPropertyTitle,
} from "@/i18n/public/content";
import { getPublicLocale } from "@/i18n/public/locale.server";
import {
  getDispositionLabel,
  getKitchenTypeLabel,
  getOperationBadgeLabel,
  getOrientationLabel,
} from "@/i18n/public/formatters";
import { getPublicMessage } from "@/i18n/public/messages";
import { parseVideoUrl } from "@/lib/youtube";
import type { Property } from "@/types/property";
import Link from "next/link";

interface PropertyDetailShellProps {
  property: Property;
}

interface PropertyFact {
  icon: LucideIcon | ComponentType<{ className?: string }>;
  key: string;
  label: string;
  value: string;
}

function KitchenIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M5 10.5h14V19H5zm3-5.5v2.5m8-2.5v2.5M8 14h3m2 0h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BalconyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M5 19h14M7 19v-7m5 7v-7m5 7v-7M5 12h14M9 12V7.5A1.5 1.5 0 0 1 10.5 6H12m3 6V7.5A1.5 1.5 0 0 0 13.5 6H12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TerraceIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M4 17h16M6.5 17V9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5V17M9 12h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function DispositionIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14m0-14 4 4m-4-4-4 4M5 12h14m-14 0 4-4m-4 4 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function OrientationIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m12 8 2.5 5L12 12l-2.5 1L12 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FloorIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M6 19V8l6-3 6 3v11M6 11l6-3 6 3M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export async function PropertyDetailShell({ property }: PropertyDetailShellProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const [imagesResult, associatedProject, advisor] = await Promise.all([
    listPublishedPropertyImages(property.id),
    property.projectId ? getPublishedProjectById(property.projectId) : Promise.resolve(null),
    resolveProjectAdvisorForEntity(property),
  ]);
  const images = imagesResult.ok ? imagesResult.data : [];
  const features = (property.features ?? []).filter(
    (feature) => feature.name.trim().length > 0,
  );
  const parsedVideo = property.videoUrl ? parseVideoUrl(property.videoUrl) : null;
  const title = getLocalizedPropertyTitle(property, locale);
  const videoEmbedUrl = parsedVideo
    ? parsedVideo.provider === "youtube"
      ? `${parsedVideo.embedUrl}?controls=0&modestbranding=1&rel=0&playsinline=1`
      : parsedVideo.embedUrl
    : null;
  const mobileSectionClassName = "-mx-4 min-w-0 sm:mx-0";
  const description = getLocalizedPropertyDescription(property, locale)?.trim() || null;
  const facts: PropertyFact[] = [];

  if (property.bedrooms != null) {
    facts.push({
      icon: BedDouble,
      key: "bedrooms",
      label: t("property.bedrooms"),
      value: String(property.bedrooms),
    });
  }

  if (property.bathrooms != null) {
    facts.push({
      icon: Bath,
      key: "bathrooms",
      label: t("property.bathrooms"),
      value: String(property.bathrooms),
    });
  }

  if (property.garages != null) {
    facts.push({
      icon: CarFront,
      key: "garages",
      label: t("property.garages"),
      value: String(property.garages),
    });
  }

  if (property.totalArea != null) {
    facts.push({
      icon: Ruler,
      key: "totalArea",
      label: t("property.totalArea"),
      value: `${property.totalArea} m2`,
    });
  }
  const kitchenLabel = property.kitchenType
    ? getKitchenTypeLabel(property.kitchenType, locale)
    : null;
  const dispositionLabel = property.disposition
    ? getDispositionLabel(property.disposition, locale)
    : null;
  const orientationLabel = property.orientation
    ? getOrientationLabel(property.orientation, locale)
    : null;

  if (kitchenLabel) {
    facts.push({
      icon: KitchenIcon,
      key: "kitchenType",
      label: t("property.kitchen"),
      value: kitchenLabel,
    });
  }

  if (property.hasBalcony) {
    facts.push({
      icon: BalconyIcon,
      key: "hasBalcony",
      label: t("property.balcony"),
      value: t("common.yes"),
    });
  }

  if (property.hasTerrace) {
    facts.push({
      icon: TerraceIcon,
      key: "hasTerrace",
      label: t("property.terrace"),
      value: t("common.yes"),
    });
  }

  if (dispositionLabel) {
    facts.push({
      icon: DispositionIcon,
      key: "disposition",
      label: t("property.disposition"),
      value: dispositionLabel,
    });
  }

  if (orientationLabel) {
    facts.push({
      icon: OrientationIcon,
      key: "orientation",
      label: t("property.orientation"),
      value: orientationLabel,
    });
  }

  if (property.propertyType === "apartment" && property.floor?.trim()) {
    facts.push({
      icon: FloorIcon,
      key: "floor",
      label: t("property.floor"),
      value: property.floor.trim(),
    });
  }

  return (
    <div className="shell section-gap w-full max-w-full min-w-0 !pt-4">
      <section className="grid w-full max-w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {images.length > 0 ? (
            <div className={mobileSectionClassName}>
              <PublicImageGallery
                badgeLabel={getOperationBadgeLabel(property.operationType, locale)}
                emptyLabel=""
                images={images}
              />
            </div>
          ) : null}
          {parsedVideo ? (
            <div className={mobileSectionClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">{t("common.video")}</h2>
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
                      title={`${parsedVideo.title}: ${title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {facts.length > 0 ? (
            <div className={mobileSectionClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">{t("common.mainInformation")}</h2>
                <div className="mt-8 grid w-full max-w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">
                  {facts.map((fact) => {
                    const Icon = fact.icon;

                    return (
                      <div
                        key={fact.key}
                        className="flex min-w-0 items-center gap-4 rounded-2xl border border-border px-4 py-3 text-foreground"
                      >
                        <Icon className="h-6 w-6 flex-none text-primary" />
                        <div className="min-w-0">
                          <p className="type-micro uppercase tracking-[0.16em] text-muted">
                            {fact.label}
                          </p>
                          <p className="type-body-compact break-words [overflow-wrap:anywhere]">
                            {fact.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          {description || features.length > 0 ? (
            <div className={mobileSectionClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                {description ? (
                  <>
                    <h2 className="text-xl font-display text-primary-strong">{t("common.description")}</h2>
                    <p className="type-body mt-4 whitespace-pre-wrap break-words text-muted [overflow-wrap:anywhere]">
                      {description}
                    </p>
                  </>
                ) : null}
                {features.length > 0 ? (
                  <div className={description ? "mt-8 space-y-4" : "space-y-4"}>
                    <h2 className="text-xl font-display text-primary-strong">{t("common.amenities")}</h2>
                    <FeatureChipList features={features} locale={locale} />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className={mobileSectionClassName}>
            <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">{t("common.location")}</h2>
              <PublicLocationMap
                fallbackLabel={t("common.mapFallback")}
                latitude={property.latitude}
                longitude={property.longitude}
                title={`${t("common.location")}: ${title}`}
              />
            </div>
          </div>
          {associatedProject ? (
            <div className={mobileSectionClassName}>
              <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">
                  {t("property.associatedProject")}
                </h2>
                <div className="mt-6 max-w-2xl">
                  <Link href={`/inversion/${associatedProject.slug}`}>
                    <ProjectCard project={associatedProject} variant="compact" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <aside className={`${mobileSectionClassName} lg:sticky lg:top-24 lg:self-start`}>
          <PublicInquirySidebar
            advisor={advisor}
            entityId={property.id}
            initialMessage={t("inquiry.propertyInitialMessage").replace("{title}", title)}
            kind="property"
            originPath={
              property.operationType === "rent"
                ? `/alquileres/${property.slug}`
                : `/comprar/${property.slug}`
            }
            relatedTitle={title}
          />
        </aside>
      </section>
    </div>
  );
}
