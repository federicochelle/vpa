import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";
import { buildPropertyHeaderLocation } from "@/features/properties/property-location";

interface BuyDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatPropertyMoney(
  value: number | null | undefined,
  currency: string | null | undefined,
  fallback: string,
) {
  if (value === null || value === undefined || !currency) {
    return fallback;
  }

  return `${currency} ${new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatCommonExpenses(value: number) {
  const amount = new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value);

  return `$ ${amount}`;
}

export default async function BuyDetailPage({ params }: BuyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property || property.operationType !== "sale") {
    notFound();
  }

  const mobileLocation = buildPropertyHeaderLocation(property) || "Ubicación pendiente";
  const desktopLocation = buildPropertyHeaderLocation(property) || "Ubicación pendiente";
  const price = formatPropertyMoney(property.price, property.currency, "Precio a consultar");
  const expenses =
    property.expenses === null || property.expenses === undefined
      ? null
      : formatCommonExpenses(property.expenses);

  return (
    <>
      <section className="shell w-full max-w-full min-w-0 pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="w-full max-w-full min-w-0">
          <div className="panel w-full max-w-full min-w-0 overflow-hidden !rounded-none">
            <div className="brand-panel-header px-6 py-6 sm:px-8 lg:px-12">
              <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <h1 className="detail-hero-title text-foreground">
                    {property.title}
                  </h1>
                  <div className="flex items-start justify-between gap-4 lg:hidden">
                    <div className="flex min-w-0 items-center gap-3 text-primary-strong">
                      <MapPin className="h-5 w-5 flex-none text-primary" />
                      <span className="min-w-0 truncate text-lg font-medium whitespace-nowrap sm:text-xl">
                        {mobileLocation}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="detail-hero-price text-primary-strong">{price}</p>
                      {expenses ? (
                        <p className="mt-1 text-sm font-medium text-muted">
                          Gastos comunes: {expenses}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="hidden items-start justify-between gap-4 text-muted lg:flex">
                    <div className="flex min-w-0 items-center gap-3 text-primary-strong">
                      <MapPin className="h-5 w-5 flex-none text-primary" />
                      <span className="min-w-0 text-xl font-medium break-words [overflow-wrap:anywhere]">
                        {desktopLocation}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="detail-hero-price text-primary-strong">{price}</p>
                      {expenses ? (
                        <p className="mt-1 text-sm font-medium text-muted">
                          Gastos comunes: {expenses}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PropertyDetailShell property={property} />
    </>
  );
}
