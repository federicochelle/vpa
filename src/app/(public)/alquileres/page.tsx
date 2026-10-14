import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import {
  buildRelatedPropertyResults,
  parseZoneFilter,
} from "@/features/search/related-results";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import { createSeoMetadata } from "@/lib/seo";
import type { PropertyType } from "@/types/property";

export const metadata = createSeoMetadata({
  title: "Propiedades en alquiler",
  description:
    "Propiedades en alquiler en Uruguay con opciones publicadas y acompañamiento para encontrar la alternativa adecuada.",
  path: "/alquileres",
});

interface RentalsPageProps {
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
    "business-key",
    "other",
  ].includes(value ?? "");
}

export default async function RentalsPage({ searchParams }: RentalsPageProps) {
  const params = await searchParams;
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const properties = await listPublishedPropertiesByOperation("rent");
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
          title={t("home.rentals")}
          description=""
          titleAs="h1"
        />

        {hasAnyResults ? (
          <>
            {exactResults.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {exactResults.map((property) => (
                  <Link key={property.id} href={`/alquileres/${property.slug}`}>
                    <PropertyCard property={property} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="type-body text-muted">{t("common.noExactMatches")}</p>
            )}
            {suggestedResults.length > 0 ? (
              <section className="space-y-6">
                <h2 className="text-xl font-display text-primary-strong">
                  {t("common.youMayAlsoLike")}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {suggestedResults.map((property) => (
                    <Link key={property.id} href={`/alquileres/${property.slug}`}>
                      <PropertyCard property={property} />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={t("property.noRentals")}
            description={t("property.noFilteredProperties")}
          />
        )}
      </div>
    </section>
  );
}
