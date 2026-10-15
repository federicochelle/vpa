import Image from "next/image";
import Link from "next/link";
import {
  BadgeDollarSign,
  ChartNoAxesCombined,
  CircleCheck,
  CreditCard,
  Filter,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HomeCarousel } from "@/components/marketing/home-carousel";
import { HomeHeroCarousel } from "@/components/marketing/home-hero-carousel";
import { SearchSection } from "@/components/marketing/home/search-section";
import { listHomeHeroSlides } from "@/features/home-hero/home-hero.data";
import { AdvisoryContactCtaSection } from "@/components/marketing/home/advisory-contact-cta-section";
import { PropertyCard } from "@/components/properties/property-card";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsCard } from "@/features/news/news-card";
import { NewsListItem } from "@/features/news/news-list-item";
import { listPublishedNews } from "@/features/news/news.data";
import { propertyTypeOptions as basePropertyTypeOptions } from "@/features/properties/property-options";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import { listPublishedProjects } from "@/features/projects/projects.data";
import type { Property, PropertyType } from "@/types/property";
import type { Project } from "@/types/project";
import propiedadHeroImage from "../../../propiedad.jpg";
import proyectoHeroImage from "../../../proyecto.jpg";
import virginiaImage from "../../../virginia.jpeg";
import { getPublicMessage } from "@/i18n/public/messages";
import { getPublicLocale } from "@/i18n/public/locale.server";

const investmentProcessSteps: Array<{
  labelKey: Parameters<typeof getPublicMessage>[1];
  Icon: LucideIcon;
}> = [
  { labelKey: "home.investmentStepGoal", Icon: Target },
  { labelKey: "home.investmentStepBudget", Icon: BadgeDollarSign },
  { labelKey: "home.investmentStepSelection", Icon: Filter },
  { labelKey: "home.investmentStepMarketValue", Icon: ChartNoAxesCombined },
  { labelKey: "home.investmentStepProfitability", Icon: TrendingUp },
  { labelKey: "home.investmentStepFinancing", Icon: CreditCard },
  { labelKey: "home.investmentStepDecision", Icon: CircleCheck },
];

function EmptyCarouselCard({ message }: { message: string }) {
  return (
    <article className="type-body-compact min-w-[280px] flex-none snap-start border border-border bg-surface p-6 text-muted sm:min-w-[340px] lg:min-w-[380px]">
      {message}
    </article>
  );
}

type SearchOperation = "sale" | "rent" | "investment";

function addUniqueOperation(operations: SearchOperation[], operation: SearchOperation) {
  if (!operations.includes(operation)) {
    operations.push(operation);
  }
}

function getLocationLabel(input: {
  city?: string | null;
  department?: string | null;
  neighborhood?: string | null;
}) {
  return input.neighborhood?.trim() || input.city?.trim() || input.department?.trim() || "";
}

function buildHomeLocationOptions(input: {
  investmentProjects: Project[];
  rentProperties: Property[];
  saleProperties: Property[];
}) {
  const optionsByLabel = new Map<
    string,
    {
      label: string;
      neighborhood: string | null;
      operations: SearchOperation[];
    }
  >();

  const addLocation = (
    item: Pick<Property | Project, "city" | "department" | "neighborhood">,
    operation: SearchOperation,
  ) => {
    const label = getLocationLabel(item);

    if (!label) {
      return;
    }

    const key = label.toLocaleLowerCase("es-UY");
    const existing = optionsByLabel.get(key);

    if (existing) {
      addUniqueOperation(existing.operations, operation);
      return;
    }

    optionsByLabel.set(key, {
      label,
      neighborhood: item.neighborhood,
      operations: [operation],
    });
  };

  input.saleProperties.forEach((property) => addLocation(property, "sale"));
  input.rentProperties.forEach((property) => addLocation(property, "rent"));
  input.investmentProjects.forEach((project) => addLocation(project, "investment"));

  return [...optionsByLabel.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "es-UY"),
  );
}

function buildHomePropertyTypeOptions(input: {
  rentProperties: Property[];
  saleProperties: Property[];
}) {
  const operationsByType = new Map<PropertyType, Array<"sale" | "rent">>();

  const addPropertyType = (property: Property) => {
    const operations = operationsByType.get(property.propertyType) ?? [];
    addUniqueOperation(operations, property.operationType);
    operationsByType.set(property.propertyType, operations);
  };

  input.saleProperties.forEach(addPropertyType);
  input.rentProperties.forEach(addPropertyType);

  return basePropertyTypeOptions
    .map((option) => ({
      ...option,
      operations: operationsByType.get(option.value) ?? [],
    }))
    .filter((option) => option.operations.length > 0);
}

export async function HomeShell() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const legalSupportTitle = t("home.legalSupportTitle");
  const [legalSupportTitleFirstLine, legalSupportTitleSecondLine] =
    legalSupportTitle.split(" con ");
  const [heroSlidesFromCms, rentProperties, saleProperties, investmentProjects, recentNews] =
    await Promise.all([
      listHomeHeroSlides(locale),
      listPublishedPropertiesByOperation("rent"),
      listPublishedPropertiesByOperation("sale"),
      listPublishedProjects(),
      listPublishedNews({ limit: 3 }),
    ]);
  const heroSlides =
    heroSlidesFromCms.length > 0
      ? heroSlidesFromCms
      : [
          { src: proyectoHeroImage, alt: t("home.featuredProject") },
          { src: propiedadHeroImage, alt: t("home.featuredProperty") },
          { src: proyectoHeroImage, alt: t("home.featuredProject") },
        ];
  const locationOptions = buildHomeLocationOptions({
    investmentProjects,
    rentProperties,
    saleProperties,
  });
  const searchPropertyTypeOptions = buildHomePropertyTypeOptions({
    rentProperties,
    saleProperties,
  });

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip">
      <HomeHeroCarousel slides={heroSlides} />
      <SearchSection
        locationOptions={locationOptions}
        propertyTypeOptions={searchPropertyTypeOptions}
      />

      <section className="bg-white pb-16 pt-80 sm:pb-20 sm:pt-32 lg:pt-36">
        <div className="shell w-full max-w-full min-w-0">
          <div className="grid w-full max-w-full min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
            <div className="relative w-full max-w-full min-w-0 min-h-[360px] overflow-hidden border border-border bg-surface-muted sm:min-h-[460px]">
              <Image
                src={virginiaImage}
                alt={t("advisory.heroAlt")}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="w-full max-w-full min-w-0 space-y-6 text-center sm:text-left">
              <div className="space-y-3">
                <h2 className="max-w-[18ch] font-display text-[clamp(1.35rem,5vw,1.75rem)] leading-tight text-foreground sm:text-[1.9rem]">
                  {t("home.strategyTitle")}
                </h2>
              </div>

              <p className="section-copy w-full max-w-full min-w-0">
                {t("home.strategyParagraphOne")}{" "}
                <span className="font-semibold text-foreground">
                  {t("home.strategyParagraphTwo")}
                </span>{" "}
                {t("home.strategyParagraphThree")}
              </p>

              <p className="font-display text-[clamp(0.95rem,3.8vw,1.15rem)] leading-tight text-primary-strong sm:text-[1.25rem]">
                {t("home.strategyClosing")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-4 text-white sm:py-5">
        <div className="shell">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-left">
            <h2 className="max-w-full font-display text-[clamp(1.15rem,4.5vw,1.65rem)] leading-tight sm:max-w-none">
              {legalSupportTitleSecondLine ? (
                <>
                  {legalSupportTitleFirstLine}
                  <span className="sm:block"> con {legalSupportTitleSecondLine}</span>
                </>
              ) : (
                legalSupportTitle
              )}
            </h2>
            <p className="type-body-compact text-white/86 sm:max-w-xl">
              {t("home.legalSupportDescriptionPrefix")}{" "}
              <span className="font-semibold text-white">
                {t("home.legalSupportStudio")}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mx-12">
            <SectionHeading
              title={t("home.rentals")}
              description={t("home.rentalsDescription")}
              align="mobile-center"
              titleClassName="home-section-title"
              descriptionClassName="home-section-subtitle"
            />
            <Link
              href="/alquileres"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              {t("common.viewMore")}
            </Link>
          </div>

          {rentProperties.length > 0 ? (
            <>
              <div className="grid gap-6 sm:hidden">
                {rentProperties.slice(0, 3).map((property) => (
                  <Link
                    key={property.id}
                    href={`/alquileres/${property.slug}`}
                    className="block w-full"
                  >
                    <PropertyCard className="w-full" property={property} />
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/alquileres"
                  className="type-button font-display inline-flex w-full items-center justify-center bg-primary px-5 py-3 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
                >
                  {t("common.viewMore")}
                </Link>
              </div>

              <div className="hidden sm:block">
                <HomeCarousel>
                  {rentProperties.slice(0, 6).map((property) => (
                    <Link
                      key={property.id}
                      href={`/alquileres/${property.slug}`}
                      className="basis-[280px] flex-none snap-start sm:basis-[340px] lg:basis-[calc((100%-3rem)/3)]"
                    >
                      <PropertyCard property={property} />
                    </Link>
                  ))}
                </HomeCarousel>
              </div>
            </>
          ) : (
            <EmptyCarouselCard message={t("home.emptyRentals")} />
          )}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mx-12">
            <SectionHeading
              title={t("home.sales")}
              description={t("home.salesDescription")}
              align="mobile-center"
              titleClassName="home-section-title"
              descriptionClassName="home-section-subtitle"
            />
            <Link
              href="/comprar"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              {t("common.viewMore")}
            </Link>
          </div>

          {saleProperties.length > 0 ? (
            <>
              <div className="grid gap-6 sm:hidden">
                {saleProperties.slice(0, 3).map((property) => (
                  <Link
                    key={property.id}
                    href={`/comprar/${property.slug}`}
                    className="block w-full"
                  >
                    <PropertyCard className="w-full" property={property} />
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/comprar"
                  className="type-button font-display inline-flex w-full items-center justify-center bg-primary px-5 py-3 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
                >
                  {t("common.viewMore")}
                </Link>
              </div>

              <div className="hidden sm:block">
                <HomeCarousel>
                  {saleProperties.slice(0, 6).map((property) => (
                    <Link
                      key={property.id}
                      href={`/comprar/${property.slug}`}
                      className="basis-[280px] flex-none snap-start sm:basis-[340px] lg:basis-[calc((100%-3rem)/3)]"
                    >
                      <PropertyCard property={property} />
                    </Link>
                  ))}
                </HomeCarousel>
              </div>
            </>
          ) : (
            <EmptyCarouselCard message={t("home.emptySales")} />
          )}
        </div>
      </section>

      <section className="bg-background pt-16 pb-8 sm:pt-20 sm:pb-10">
        <div className="shell">
          <div className="space-y-10 pb-12 sm:space-y-12 sm:pb-14">
            <div className="mx-auto max-w-4xl space-y-5 text-center">
              <h3 className="section-title home-section-title text-foreground">
                {t("home.investmentProcessTitle")}
              </h3>
              <p className="type-body mx-auto max-w-2xl text-muted">
                {t("home.investmentProcessDescription")}
              </p>
            </div>

            <ol className="relative grid gap-7 lg:grid-cols-7 lg:gap-0">
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[1.05rem] top-3 w-px bg-primary/24 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[2.15rem] lg:h-px lg:w-auto"
              />
              {investmentProcessSteps.map(({ labelKey, Icon }, index) => (
                <li
                  key={labelKey}
                  className="relative grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 lg:block lg:pr-5"
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-background font-display text-[0.7rem] leading-none text-primary shadow-[0_0_0_8px_var(--background)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col items-center pt-5 text-center lg:pt-6">
                    <Icon
                      aria-hidden="true"
                      className="mb-3 h-9 w-9 text-primary"
                      strokeWidth={1.65}
                    />
                    <span className="block break-words font-display text-[0.8rem] leading-snug text-foreground lg:text-[0.72rem] xl:text-[0.78rem]">
                      {t(labelKey)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mx-12">
            <SectionHeading
              title={t("home.investments")}
              description={t("home.investmentsDescription")}
              align="mobile-center"
              titleClassName="home-section-title"
              descriptionClassName="home-section-subtitle"
            />
            <Link
              href="/inversion"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              {t("common.viewMore")}
            </Link>
          </div>

          {investmentProjects.length > 0 ? (
            <>
              <div className="grid gap-6 sm:hidden">
                {investmentProjects.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/inversion/${project.slug}`}>
                    <ProjectCard className="w-full" project={project} />
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/inversion"
                  className="type-button font-display inline-flex w-full items-center justify-center bg-primary px-5 py-3 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
                >
                  {t("common.viewMore")}
                </Link>
              </div>

              <div className="hidden sm:block">
                <HomeCarousel>
                  {investmentProjects.slice(0, 6).map((project) => (
                    <Link
                      key={project.id}
                      href={`/inversion/${project.slug}`}
                      className="basis-[280px] flex-none snap-start sm:basis-[340px] lg:basis-[calc((100%-3rem)/3)]"
                    >
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </HomeCarousel>
              </div>
            </>
          ) : (
            <EmptyCarouselCard message={t("home.emptyInvestments")} />
          )}
        </div>
      </section>

      <AdvisoryContactCtaSection />

      {recentNews.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="shell space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <h2 className="section-title home-section-title w-full max-w-full min-w-0">
                  {t("news.title")}
                </h2>
              </div>
              <Link
                className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
                href="/noticias"
              >
                {t("news.all")}
              </Link>
            </div>

            <div className="grid gap-6 sm:hidden">
              {recentNews.slice(0, 3).map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>

            <div className="sm:hidden">
              <Link
                className="type-button font-display inline-flex w-full items-center justify-center bg-primary px-5 py-3 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
                href="/noticias"
              >
                {t("news.all")}
              </Link>
            </div>

            <div className="hidden gap-8 sm:grid">
              {recentNews.slice(0, 3).map((item) => (
                <NewsListItem key={item.id} news={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
