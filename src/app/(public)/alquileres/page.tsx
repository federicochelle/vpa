import Link from "next/link";
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import type { PropertyType } from "@/types/property";

interface RentalsPageProps {
  searchParams: Promise<{
    tipo?: string;
    zona?: string;
  }>;
}

function normalizeFilterValue(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("es-UY") ?? "";
}

function parseLocationFilter(value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  const [cityPart, neighborhoodPart] = normalizedValue.split("/").map((part) => part?.trim() || "");

  if (cityPart && neighborhoodPart) {
    return {
      city: normalizeFilterValue(cityPart),
      neighborhood: normalizeFilterValue(neighborhoodPart),
    };
  }

  return {
    city: normalizeFilterValue(normalizedValue),
    neighborhood: normalizeFilterValue(normalizedValue),
  };
}

function isPropertyType(value: string | undefined): value is PropertyType {
  return [
    "apartment",
    "house",
    "land",
    "office",
    "commercial-space",
    "other",
  ].includes(value ?? "");
}

function formatPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio a consultar";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function RentalsPage({ searchParams }: RentalsPageProps) {
  const params = await searchParams;
  const properties = await listPublishedPropertiesByOperation("rent");
  const selectedType = isPropertyType(params.tipo) ? params.tipo : null;
  const selectedLocation = parseLocationFilter(params.zona);
  const filteredProperties = properties.filter((property) => {
    const matchesType = selectedType ? property.propertyType === selectedType : true;
    const matchesZone = selectedLocation
      ? normalizeFilterValue(property.city) === selectedLocation.city ||
        normalizeFilterValue(property.neighborhood) === selectedLocation.neighborhood
      : true;

    return matchesType && matchesZone;
  });

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Alquileres
          </p>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            Propiedades en alquiler
          </h1>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/alquileres/${property.slug}`}
                className="overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
              >
                <div
                  className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                  style={property.image ? { backgroundImage: `url(${property.image})` } : undefined}
                />
                <div className="space-y-5 p-5">
                  <h2 className="font-display text-2xl text-foreground">
                    {property.title}
                  </h2>

                  <div className="grid grid-cols-2 gap-3 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-primary" />
                      {property.bedrooms ?? "-"} dorm.
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-primary" />
                      {property.bathrooms ?? "-"} baños
                    </div>
                    <div className="flex items-center gap-2">
                      <CarFront className="h-4 w-4 text-primary" />
                      {property.garages ?? "-"} garages
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      {property.builtArea ?? "-"} m2
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted">
                      <MapPin className="h-4 w-4 flex-none text-primary" />
                      <span className="truncate">
                        {property.neighborhood ?? "Ubicación pendiente"}
                      </span>
                    </div>
                    <p className="shrink-0 text-right text-lg font-semibold text-primary-strong">
                      {formatPropertyPrice(property.price, property.currency)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay alquileres publicados"
            description="No encontramos propiedades publicadas con los filtros seleccionados."
          />
        )}
      </div>
    </section>
  );
}
