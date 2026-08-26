import { Bath, BedDouble, CarFront, Ruler } from "lucide-react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { PublicLocationMap } from "@/components/maps/public-location-map";
import { FeatureChipList } from "@/components/ui/feature-chip-list";
import { listPublishedPropertyImages } from "@/features/properties/property-images.data";
import { parseYouTubeUrl } from "@/lib/youtube";
import type { Property } from "@/types/property";

interface PropertyDetailShellProps {
  property: Property;
}

export async function PropertyDetailShell({ property }: PropertyDetailShellProps) {
  const imagesResult = await listPublishedPropertyImages(property.id);
  const images = imagesResult.ok ? imagesResult.data : [];
  const features = property.features ?? [];
  const parsedVideo = property.videoUrl ? parseYouTubeUrl(property.videoUrl) : null;
  const videoEmbedUrl = parsedVideo
    ? `${parsedVideo.embedUrl}?controls=0&modestbranding=1&rel=0&playsinline=1`
    : null;
  const mobileFullBleedClassName = "-mx-4 sm:mx-0";

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-4">
          <div className={mobileFullBleedClassName}>
            <PublicImageGallery
              emptyLabel={`Galeria preparada para la propiedad: ${property.slug}`}
              images={images}
              operationType={property.operationType}
            />
          </div>
          {parsedVideo ? (
            <div className={mobileFullBleedClassName}>
              <div className="panel !rounded-none p-6 sm:p-8">
                <h2 className="text-xl font-display text-primary-strong">Video</h2>
                <div className="mt-6 -mx-6 overflow-hidden border-y border-border bg-surface-muted sm:mx-0 sm:border">
                  <div className="aspect-video">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={videoEmbedUrl ?? undefined}
                      title={`Video de YouTube de ${property.title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Información principal</h2>
              <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <BedDouble className="h-4 w-4 flex-none text-primary" />
                  <span>{property.bedrooms ?? "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Bath className="h-4 w-4 flex-none text-primary" />
                  <span>{property.bathrooms ?? "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <CarFront className="h-4 w-4 flex-none text-primary" />
                  <span>{property.garages ?? "-"}</span>
                </div>
                <div className="col-span-3 flex items-center gap-3 text-sm text-foreground sm:col-span-1">
                  <Ruler className="h-4 w-4 flex-none text-primary" />
                  <span>
                    {[
                      property.builtArea ? `${property.builtArea} m2` : null,
                      property.totalArea ? `${property.totalArea} m2` : null,
                    ]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Descripción</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {property.description ??
                  "Espacio preparado para descripcion, caracteristicas destacadas y atributos complementarios."}
              </p>
              {features.length > 0 ? (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-medium text-primary-strong">Amenities</h3>
                  <FeatureChipList features={features} />
                </div>
              ) : null}
            </div>
          </div>
          <div className={mobileFullBleedClassName}>
            <div className="panel !rounded-none p-6 sm:p-8">
              <h2 className="text-xl font-display text-primary-strong">Ubicación</h2>
              <PublicLocationMap
                address={property.address}
                fallbackLabel="Area lista para integrar ubicacion o mapa en una fase posterior."
                title={`Mapa de ubicación de ${property.title}`}
              />
            </div>
          </div>
        </div>
        <aside className={`${mobileFullBleedClassName} lg:sticky lg:top-24 lg:self-start`}>
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
