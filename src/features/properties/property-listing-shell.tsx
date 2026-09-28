import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { PropertyCard } from "@/components/properties/property-card";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import type { Property } from "@/types/property";

interface PropertyListingShellProps {
  properties: Property[];
  eyebrow?: string;
  title?: string;
  description?: string;
  detailBasePath?: string;
}

export async function PropertyListingShell({
  properties,
  eyebrow,
  title,
  description,
  detailBasePath = "/comprar",
}: PropertyListingShellProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <div className="shell section-gap pt-0">
      <div className="grid gap-8">
        <section className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow={eyebrow ?? t("property.listingEyebrow")}
            title={title ?? t("property.listingTitle")}
            description={description ?? t("property.listingDescription")}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {[
              t("search.operation"),
              t("search.propertyType"),
              t("search.zone"),
              t("property.bedrooms"),
              t("common.price"),
            ].map((item) => (
              <div
                key={item}
                className="type-body-compact rounded-2xl border border-border bg-white/70 px-4 py-3 text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-strong">
                {t("common.results")}
              </h2>
              <p className="type-body-compact text-muted">
                {properties.length > 0
                  ? t("common.publishedCount").replace("{count}", String(properties.length))
                  : t("common.noResultsLoaded")}
              </p>
            </div>
            {properties.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {properties.map((property) => (
                  <Link key={property.id} href={`${detailBasePath}/${property.slug}`}>
                    <PropertyCard property={property} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("property.gridEmpty")}
                description={t("property.gridReady")}
              />
            )}
          </div>
          <aside className="panel p-6">
            <h3 className="text-lg font-semibold text-primary-strong">
              {t("common.pagination")}
            </h3>
            <p className="type-body-compact mt-3 text-muted">
              {t("property.paginationReserved")}
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
