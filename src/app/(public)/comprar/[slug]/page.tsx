import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { cache } from "react";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { listPublishedPropertyImages } from "@/features/properties/property-images.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";
import { buildPropertyHeaderLocation } from "@/features/properties/property-location";
import {
  formatPublicCommonExpenses,
  formatPublicPropertyMoney,
} from "@/features/properties/property-public-format";
import {
  getLocalizedPropertyDescription,
  getLocalizedPropertyTitle,
} from "@/i18n/public/content";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import {
  createNotFoundSeoMetadata,
  createSeoMetadata,
  resolveContentSeoImage,
} from "@/lib/seo";

interface BuyDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getPropertyBySlug = cache(getPublishedPropertyBySlug);

export async function generateMetadata({ params }: BuyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property || property.operationType !== "sale") {
    return createNotFoundSeoMetadata("Propiedad no encontrada");
  }

  const locale = await getPublicLocale();
  const title = getLocalizedPropertyTitle(property, locale);
  const description = getLocalizedPropertyDescription(property, locale);
  const imagesResult = await listPublishedPropertyImages(property.id);
  const image = resolveContentSeoImage(
    imagesResult.ok ? imagesResult.data : [],
    title,
  );

  return createSeoMetadata({
    title,
    description,
    path: `/comprar/${property.slug}`,
    image,
  });
}

export default async function BuyDetailPage({ params }: BuyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property || property.operationType !== "sale") {
    notFound();
  }

  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const title = getLocalizedPropertyTitle(property, locale);
  const headerLocation = buildPropertyHeaderLocation(property);
  const price = formatPublicPropertyMoney(property.price, property.currency, locale);
  const expenses = formatPublicCommonExpenses(property.expenses, locale);
  const hasHeaderDetails = Boolean(headerLocation || price || expenses);

  return (
    <>
      <section className="shell w-full max-w-full min-w-0 pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="-mx-4 min-w-0 sm:mx-0">
          <div className="panel w-full max-w-full min-w-0 overflow-hidden !rounded-none">
            <div className="brand-panel-header px-6 py-6 sm:px-8 lg:px-12">
              <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <h1 className="detail-hero-title text-foreground">
                    {title}
                  </h1>
                  {hasHeaderDetails ? (
                    <div className="flex w-full min-w-0 flex-col items-start gap-3 lg:hidden">
                      {headerLocation ? (
                        <div className="flex w-full min-w-0 items-center gap-3 text-primary-strong">
                          <MapPin className="h-5 w-5 flex-none text-primary" />
                          <span className="min-w-0 truncate text-lg font-medium whitespace-nowrap sm:text-xl">
                            {headerLocation}
                          </span>
                        </div>
                      ) : null}
                      {price || expenses ? (
                        <div className="w-full min-w-0 text-left">
                          {price ? (
                            <p className="detail-hero-price whitespace-nowrap text-primary-strong">{price}</p>
                          ) : null}
                          {expenses ? (
                            <p className="mt-1 text-sm font-medium text-muted">
                              {t("property.commonExpenses")}: {expenses}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {hasHeaderDetails ? (
                    <div className="hidden items-start justify-between gap-4 text-muted lg:flex">
                      {headerLocation ? (
                        <div className="flex min-w-0 items-center gap-3 text-primary-strong">
                          <MapPin className="h-5 w-5 flex-none text-primary" />
                          <span className="min-w-0 text-xl font-medium break-words [overflow-wrap:anywhere]">
                            {headerLocation}
                          </span>
                        </div>
                      ) : null}
                      {price || expenses ? (
                        <div className="ml-auto shrink-0 text-right">
                          {price ? (
                            <p className="detail-hero-price text-primary-strong">{price}</p>
                          ) : null}
                          {expenses ? (
                            <p className="mt-1 text-sm font-medium text-muted">
                              {t("property.commonExpenses")}: {expenses}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
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
