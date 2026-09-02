import { Bath, BedDouble, CarFront, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { PublicLocationMap } from "@/components/maps/public-location-map";
import { FeatureChipList } from "@/components/ui/feature-chip-list";
import { listPublishedPropertyImages } from "@/features/properties/property-images.data";
import { buildPropertyAddressLabel } from "@/features/properties/property-location";
import { parseVideoUrl } from "@/lib/youtube";
import type { Property } from "@/types/property";

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

function getKitchenLabel(value: Property["kitchenType"]) {
  if (value === "integrated") {
    return "Integrada";
  }

  if (value === "independent") {
    return "Independiente";
  }

  return null;
}

function getDispositionLabel(value: Property["disposition"]) {
  if (value === "front") {
    return "Frente";
  }

  if (value === "back") {
    return "Contrafrente";
  }

  if (value === "lateral") {
    return "Lateral";
  }

  if (value === "interior") {
    return "Interior";
  }

  return null;
}

function getOrientationLabel(value: Property["orientation"]) {
  if (value === "north") {
    return "Norte";
  }

  if (value === "south") {
    return "Sur";
  }

  if (value === "east") {
    return "Este";
  }

  if (value === "west") {
    return "Oeste";
  }

  if (value === "northeast") {
    return "Noreste";
  }

  if (value === "northwest") {
    return "Noroeste";
  }

  if (value === "southeast") {
    return "Sureste";
  }

  if (value === "southwest") {
    return "Suroeste";
  }

  return null;
}

export async function PropertyDetailShell({ property }: PropertyDetailShellProps) {
  const imagesResult = await listPublishedPropertyImages(property.id);
  const images = imagesResult.ok ? imagesResult.data : [];
  const features = property.features ?? [];
  const parsedVideo = property.videoUrl ? parseVideoUrl(property.videoUrl) : null;
  const videoEmbedUrl = parsedVideo
    ? parsedVideo.provider === "youtube"
      ? `${parsedVideo.embedUrl}?controls=0&modestbranding=1&rel=0&playsinline=1`
      : parsedVideo.embedUrl
    : null;
  const mobileSectionClassName = "w-full max-w-full min-w-0";
  const addressLabel = buildPropertyAddressLabel(property);
  const facts: PropertyFact[] = [
    {
      icon: BedDouble,
      key: "bedrooms",
      label: "Dormitorios",
      value: property.bedrooms != null ? String(property.bedrooms) : "-",
    },
    {
      icon: Bath,
      key: "bathrooms",
      label: "Baños",
      value: property.bathrooms != null ? String(property.bathrooms) : "-",
    },
    {
      icon: CarFront,
      key: "garages",
      label: "Garajes",
      value: property.garages != null ? String(property.garages) : "-",
    },
    {
      icon: Ruler,
      key: "totalArea",
      label: "Área total",
      value: property.totalArea != null ? `${property.totalArea} m2` : "-",
    },
  ];
  const kitchenLabel = getKitchenLabel(property.kitchenType);
  const dispositionLabel = getDispositionLabel(property.disposition);
  const orientationLabel = getOrientationLabel(property.orientation);

  if (kitchenLabel) {
    facts.push({
      icon: KitchenIcon,
      key: "kitchenType",
      label: "Cocina",
      value: kitchenLabel,
    });
  }

  if (property.hasBalcony) {
    facts.push({
      icon: BalconyIcon,
      key: "hasBalcony",
      label: "Balcón",
      value: "Sí",
    });
  }

  if (property.hasTerrace) {
    facts.push({
      icon: TerraceIcon,
      key: "hasTerrace",
      label: "Terraza",
      value: "Sí",
    });
  }

  if (dispositionLabel) {
    facts.push({
      icon: DispositionIcon,
      key: "disposition",
      label: "Disposición",
      value: dispositionLabel,
    });
  }

  if (orientationLabel) {
    facts.push({
      icon: OrientationIcon,
      key: "orientation",
      label: "Orientación",
      value: orientationLabel,
    });
  }

  if (property.propertyType === "apartment" && property.floor?.trim()) {
    facts.push({
      icon: FloorIcon,
      key: "floor",
      label: "Piso",
      value: property.floor.trim(),
    });
  }

  return (
    <div className="shell section-gap w-full max-w-full min-w-0 !pt-4">
      <section className="grid w-full max-w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <div className={mobileSectionClassName}>
            <PublicImageGallery
              emptyLabel={`Galeria preparada para la propiedad: ${property.slug}`}
              images={images}
              operationType={property.operationType}
            />
          </div>
          {parsedVideo ? (
            <div className={mobileSectionClassName}>
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
                      title={`${parsedVideo.title} de ${property.title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={mobileSectionClassName}>
            <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Información principal</h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className={mobileSectionClassName}>
            <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Descripción</h2>
              <p className="type-body mt-4 whitespace-pre-wrap break-words text-muted [overflow-wrap:anywhere]">
                {property.description ??
                  "Espacio preparado para descripcion, caracteristicas destacadas y atributos complementarios."}
              </p>
              {features.length > 0 ? (
                <div className="mt-8 space-y-4">
                  <h3 className="type-body-compact font-medium text-primary-strong">Amenities</h3>
                  <FeatureChipList features={features} />
                </div>
              ) : null}
            </div>
          </div>
          <div className={mobileSectionClassName}>
            <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Ubicación</h2>
              <PublicLocationMap
                address={property.address}
                fallbackLabel="Ubicación pendiente."
                latitude={property.latitude}
                locationLabel={addressLabel}
                longitude={property.longitude}
                title={`Mapa de ubicación de ${property.title}`}
              />
            </div>
          </div>
        </div>
        <aside className={`${mobileSectionClassName} lg:sticky lg:top-24 lg:self-start`}>
          <PublicInquirySidebar
            entityId={property.id}
            initialMessage={`Hola, estoy interesado/a en ${property.title}. Quisiera recibir más información.`}
            kind="property"
            originPath={
              property.operationType === "rent"
                ? `/alquileres/${property.slug}`
                : `/comprar/${property.slug}`
            }
            relatedTitle={property.title}
          />
        </aside>
      </section>
    </div>
  );
}
