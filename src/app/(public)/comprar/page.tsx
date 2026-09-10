import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import {
  buildRelatedPropertyResults,
  parseZoneFilter,
} from "@/features/search/related-results";
import type { PropertyType } from "@/types/property";

interface BuyPageProps {
  searchParams: Promise<{
    tipo?: string;
    zona?: string;
  }>;
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

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const params = await searchParams;
  const properties = await listPublishedPropertiesByOperation("sale");
  const selectedType = isPropertyType(params.tipo) ? params.tipo : null;
  const selectedZone = parseZoneFilter(params.zona);
  const { exactResults, suggestedResults } = buildRelatedPropertyResults({
    properties,
    selectedType,
    selectedZone,
  });
  const hasAnyResults = exactResults.length > 0 || suggestedResults.length > 0;

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <SectionHeading
          title="VENTAS"
          description=""
          titleAs="h1"
        />

        {hasAnyResults ? (
          <>
            {exactResults.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {exactResults.map((property) => (
                  <Link key={property.id} href={`/comprar/${property.slug}`}>
                    <PropertyCard property={property} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="type-body text-muted">No encontramos coincidencias exactas.</p>
            )}
            {suggestedResults.length > 0 ? (
              <section className="space-y-6">
                <h2 className="text-xl font-display text-primary-strong">
                  También te puede interesar
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {suggestedResults.map((property) => (
                    <Link key={property.id} href={`/comprar/${property.slug}`}>
                      <PropertyCard property={property} />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Todavía no hay propiedades en venta publicadas"
            description="No encontramos propiedades publicadas con los filtros seleccionados."
          />
        )}
      </div>
    </section>
  );
}
