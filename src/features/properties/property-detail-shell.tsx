import { Bath, BedDouble, CarFront, Ruler } from "lucide-react";
import { PublicImageGallery } from "@/components/gallery/public-image-gallery";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { listPublishedPropertyImages } from "@/features/properties/property-images.data";
import type { Property } from "@/types/property";

interface PropertyDetailShellProps {
  property: Property;
}

export async function PropertyDetailShell({ property }: PropertyDetailShellProps) {
  const imagesResult = await listPublishedPropertyImages(property.id);
  const images = imagesResult.ok ? imagesResult.data : [];

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-4">
          <PublicImageGallery
            emptyLabel={`Galeria preparada para la propiedad: ${property.slug}`}
            images={images}
          />
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Información principal</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <div className="flex items-center gap-3 text-sm text-foreground">
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
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Descripcion</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {property.description ??
                "Espacio preparado para descripcion, caracteristicas destacadas y atributos complementarios."}
            </p>
          </div>
          <div className="panel !rounded-none p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Ubicacion y mapa</h2>
            <div className="mt-6 flex min-h-60 items-center justify-center rounded-none border border-dashed border-border bg-surface-strong px-6 text-center text-sm text-muted">
              Area lista para integrar ubicacion o mapa en una fase posterior.
            </div>
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
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
