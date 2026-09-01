import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { SectionHeading } from "@/components/ui/section-heading";
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

function parseNeighborhoodFilter(value: string | undefined) {
  const normalizedValue = normalizeFilterValue(value?.split("/").at(-1));
  return normalizedValue || null;
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

export default async function RentalsPage({ searchParams }: RentalsPageProps) {
  const params = await searchParams;
  const properties = await listPublishedPropertiesByOperation("rent");
  const selectedType = isPropertyType(params.tipo) ? params.tipo : null;
  const selectedNeighborhood = parseNeighborhoodFilter(params.zona);
  const filteredProperties = properties.filter((property) => {
    const matchesType = selectedType ? property.propertyType === selectedType : true;
    const matchesZone = selectedNeighborhood
      ? normalizeFilterValue(property.neighborhood) === selectedNeighborhood
      : true;

    return matchesType && matchesZone;
  });

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <SectionHeading
          title="ALQUILERES"
          description=""
          titleAs="h1"
        />

        {filteredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/alquileres/${property.slug}`}>
                <PropertyCard property={property} />
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
