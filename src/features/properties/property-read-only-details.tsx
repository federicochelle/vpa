import Image from "next/image";
import { AdminReadOnlyField } from "@/components/admin/admin-read-only-field";
import {
  kitchenTypeOptions,
  operationTypeOptions,
  propertyDispositionOptions,
  propertyOrientationOptions,
  propertyTypeOptions,
} from "@/features/properties/property-options";
import type { Feature } from "@/types/feature";
import type { Property, PropertyImage } from "@/types/property";

interface PropertyReadOnlyDetailsProps {
  features: Feature[];
  images: PropertyImage[];
  property: Property;
  selectedFeatureIds: string[];
}

function optionLabel<T extends string>(
  options: Array<{ label: string; value: T }>,
  value: T | null | undefined,
) {
  return options.find((option) => option.value === value)?.label ?? "—";
}

function formatMoney(value: number | null, currency: Property["currency"]) {
  if (value === null || !currency) {
    return "—";
  }

  return new Intl.NumberFormat("es-UY", {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function formatCommonExpenses(value: number | null | undefined) {
  return formatMoney(value ?? null, "UYU");
}

export function PropertyReadOnlyDetails({
  features,
  images,
  property,
  selectedFeatureIds,
}: PropertyReadOnlyDetailsProps) {
  const selectedFeatures = selectedFeatureIds
    .map((featureId) => features.find((feature) => feature.id === featureId))
    .filter((feature): feature is Feature => Boolean(feature));

  return (
    <div className="min-w-0">
      <div className="min-w-0 grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-3">
          <AdminReadOnlyField label="Título" value={property.title} />
        </div>
        <div className="xl:col-span-3 grid gap-6 sm:grid-cols-2">
          <AdminReadOnlyField
            label="Operación"
            value={optionLabel(operationTypeOptions, property.operationType)}
          />
          <AdminReadOnlyField
            label="Tipo de propiedad"
            value={optionLabel(propertyTypeOptions, property.propertyType)}
          />
        </div>
        <div className="xl:col-span-3">
          <AdminReadOnlyField label="Precio" value={formatMoney(property.price, property.currency)} />
        </div>
        <div className="xl:col-span-3">
          <AdminReadOnlyField label="Gastos comunes" value={formatCommonExpenses(property.expenses)} />
        </div>
        <div className="md:col-span-2 xl:col-span-6"><div className="border-t border-border" /></div>
        <AdminReadOnlyField label="Dormitorios" value={property.bedrooms} />
        <AdminReadOnlyField label="Baños" value={property.bathrooms} />
        <AdminReadOnlyField label="Garages" value={property.garages} />
        <AdminReadOnlyField label="Área total" value={property.totalArea} />
        <AdminReadOnlyField label="Cocina" value={optionLabel(kitchenTypeOptions, property.kitchenType ?? null)} />
        <AdminReadOnlyField label="Disposición" value={optionLabel(propertyDispositionOptions, property.disposition ?? null)} />
        <AdminReadOnlyField label="Orientación" value={optionLabel(propertyOrientationOptions, property.orientation ?? null)} />
        {property.propertyType === "apartment" ? <AdminReadOnlyField label="Piso" value={property.floor ?? ""} /> : null}
        <AdminReadOnlyField label="Año de construcción" value={property.constructionYear ?? null} />
        <div className="md:col-span-2 xl:col-span-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:max-w-xl">
            <AdminReadOnlyField label="Balcón" value={property.hasBalcony ? "Sí" : "No"} />
            <AdminReadOnlyField label="Terraza" value={property.hasTerrace ? "Sí" : "No"} />
          </div>
        </div>
        <div className="md:col-span-2 xl:col-span-6"><div className="border-t border-border" /></div>
        <div className="xl:col-span-4"><AdminReadOnlyField label="Dirección" value={property.address ?? ""} /></div>
        <div className="xl:col-span-2"><AdminReadOnlyField label="Barrio" value={property.neighborhood ?? ""} /></div>
      </div>
      <div className="mt-6">
        <AdminReadOnlyField className="min-h-40" label="Descripción" multiline value={property.description ?? ""} />
      </div>
      <div className="mt-6 pt-6">
        <div className="flex flex-col gap-2">
          <span className="type-body-compact font-medium text-primary-strong">Amenities</span>
          {selectedFeatures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedFeatures.map((feature) => <span className="type-body-compact inline-flex items-center rounded-full border border-primary/12 bg-primary/8 px-3 py-2 font-medium text-primary-strong" key={feature.id}>{feature.name}</span>)}
            </div>
          ) : <p className="type-body-compact text-muted">Sin amenities seleccionados.</p>}
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="type-body-compact font-medium text-primary-strong">Galería de imágenes</h3>
        {images.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.slice().sort((left, right) => left.sortOrder - right.sortOrder).map((image) => (
              <article className="overflow-hidden border border-border bg-white" key={image.id}>
                <div className="relative aspect-[4/3] bg-surface-muted">
                  <Image alt={`Imagen de propiedad ${image.id}`} className="object-cover" fill sizes="(min-width: 1280px) 24rem, (min-width: 640px) 50vw, 100vw" src={image.url} unoptimized />
                  {image.isCover ? <span className="admin-status-pill absolute left-3 top-3">Portada</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="type-body-compact mt-4 text-muted">—</p>}
      </div>
      <div className="mt-6 border-t border-border pt-6">
        <AdminReadOnlyField label="Video YouTube / Instagram" value={property.videoUrl ?? ""} />
      </div>
    </div>
  );
}
