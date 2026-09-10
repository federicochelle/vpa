import Image from "next/image";
import Link from "next/link";
import { HomeCarousel } from "@/components/marketing/home-carousel";
import { HomeHeroCarousel } from "@/components/marketing/home-hero-carousel";
import { listHomeHeroSlides } from "@/features/home-hero/home-hero.data";
import { SearchSection } from "@/components/marketing/home/search-section";
import { PropertyCard } from "@/components/properties/property-card";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsCard } from "@/features/news/news-card";
import { NewsListItem } from "@/features/news/news-list-item";
import { listPublishedNews } from "@/features/news/news.data";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import { propertyTypeOptions } from "@/features/properties/property-options";
import { listPublishedProjects } from "@/features/projects/projects.data";
import propiedadHeroImage from "../../../propiedad.jpg";
import proyectoHeroImage from "../../../proyecto.jpg";
import virginiaImage from "../../../virginia.jpeg";
import { getPublicMessage } from "@/i18n/public/messages";
import { getPublicLocale } from "@/i18n/public/locale.server";

function EmptyCarouselCard({ message }: { message: string }) {
  return (
    <article className="type-body-compact min-w-[280px] flex-none snap-start border border-border bg-surface p-6 text-muted sm:min-w-[340px] lg:min-w-[380px]">
      {message}
    </article>
  );
}

function buildNeighborhoodOptions(
  ...locationGroups: Array<
    Array<{
      neighborhood: string | null;
      operation: "sale" | "rent" | "investment";
    }>
  >
) {
  const optionsMap = new Map<
    string,
    {
      label: string;
      neighborhood: string | null;
      operations: Array<"sale" | "rent" | "investment">;
    }
  >();

  for (const item of locationGroups.flat()) {
    const normalizedNeighborhood = item.neighborhood?.trim() || null;

    if (!normalizedNeighborhood) {
      continue;
    }

    const key = normalizedNeighborhood.toLocaleLowerCase("es-UY");
    const existing = optionsMap.get(key);

    if (existing) {
      if (!existing.operations.includes(item.operation)) {
        existing.operations.push(item.operation);
      }
      continue;
    }

    optionsMap.set(key, {
      label: normalizedNeighborhood,
      neighborhood: normalizedNeighborhood,
      operations: [item.operation],
    });
  }

  return Array.from(optionsMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es-UY"),
  );
}

function buildPropertyTypeOptions(
  ...propertyGroups: Array<
    Array<{
      propertyType: string;
      operation: "sale" | "rent";
    }>
  >
) {
  const optionsMap = new Map<
    string,
    {
      label: string;
      operations: Array<"sale" | "rent">;
      value: (typeof propertyTypeOptions)[number]["value"];
    }
  >();

  for (const item of propertyGroups.flat()) {
    const option = propertyTypeOptions.find((type) => type.value === item.propertyType);

    if (!option) {
      continue;
    }

    const existing = optionsMap.get(option.value);

    if (existing) {
      if (!existing.operations.includes(item.operation)) {
        existing.operations.push(item.operation);
      }
      continue;
    }

    optionsMap.set(option.value, {
      label: option.label,
      operations: [item.operation],
      value: option.value,
    });
  }

  return Array.from(optionsMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es-UY"),
  );
}

export async function HomeShell() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const [heroSlidesFromCms, rentProperties, saleProperties, investmentProjects, recentNews] =
    await Promise.all([
      listHomeHeroSlides(),
      listPublishedPropertiesByOperation("rent"),
      listPublishedPropertiesByOperation("sale"),
      listPublishedProjects(),
      listPublishedNews({ limit: 3 }),
    ]);
  const heroSlides =
    heroSlidesFromCms.length > 0
      ? heroSlidesFromCms
      : [
          { src: proyectoHeroImage, alt: "Proyecto destacado" },
          { src: propiedadHeroImage, alt: "Propiedad destacada" },
          { src: proyectoHeroImage, alt: "Proyecto destacado" },
        ];
  const locationOptions = buildNeighborhoodOptions(
    rentProperties.map((property) => ({
      neighborhood: property.neighborhood ?? null,
      operation: "rent" as const,
    })),
    saleProperties.map((property) => ({
      neighborhood: property.neighborhood ?? null,
      operation: "sale" as const,
    })),
    investmentProjects.map((project) => ({
      neighborhood: project.neighborhood ?? null,
      operation: "investment" as const,
    })),
  );
  const searchPropertyTypeOptions = buildPropertyTypeOptions(
    rentProperties.map((property) => ({
      operation: "rent" as const,
      propertyType: property.propertyType,
    })),
    saleProperties.map((property) => ({
      operation: "sale" as const,
      propertyType: property.propertyType,
    })),
  );

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip">
      <HomeHeroCarousel slides={heroSlides} />

      <SearchSection
        locationOptions={locationOptions}
        propertyTypeOptions={searchPropertyTypeOptions}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.rentals")} titleClassName="home-section-title" />
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
            <EmptyCarouselCard message="Todavía no hay alquileres publicados." />
          )}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.sales")} titleClassName="home-section-title" />
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
            <EmptyCarouselCard message="Todavía no hay propiedades en venta publicadas." />
          )}
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.investments")} titleClassName="home-section-title" />
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
            <EmptyCarouselCard message="Todavía no hay proyectos de inversión publicados." />
          )}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell w-full max-w-full min-w-0">
          <div className="grid w-full max-w-full min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
            <div className="relative w-full max-w-full min-w-0 min-h-[360px] overflow-hidden border border-border bg-surface-muted sm:min-h-[460px]">
              <Image
                src={virginiaImage}
                alt="Asesoramiento inmobiliario"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="w-full max-w-full min-w-0 space-y-6 text-center sm:text-left">
              <div className="space-y-3">
                <h2 className="section-title home-section-title w-full max-w-full min-w-0">
                  Acompañamiento cercano para cada decisión
                </h2>
              </div>

              <div className="section-copy w-full max-w-full min-w-0 space-y-5">
                <p>
                  En Virginia Pintos entendemos que cada búsqueda tiene un ritmo,
                  una historia y una necesidad distinta. Por eso trabajamos con
                  una mirada personalizada, ayudándote a ordenar opciones,
                  evaluar oportunidades y avanzar con información clara en cada paso.
                </p>
                <p>
                  Ya sea para alquilar, comprar o invertir, nuestro objetivo es
                  que tomes decisiones con tranquilidad, respaldo y una estrategia
                  pensada para vos.
                </p>
              </div>

              <p className="font-display text-2xl text-foreground">
                Virginia Pintos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <h2 className="section-title home-section-title w-full max-w-full min-w-0">
                Noticias e interés
              </h2>
            </div>
            <Link
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
              href="/noticias"
            >
              Ver todas
            </Link>
          </div>

          {recentNews.length > 0 ? (
            <>
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
                  Ver todas
                </Link>
              </div>

              <div className="hidden gap-8 sm:grid">
                {recentNews.slice(0, 3).map((item) => (
                  <NewsListItem key={item.id} news={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="panel flex min-h-56 flex-col items-center justify-center gap-4 border-dashed px-6 py-10 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-strong">
                  Todavía no hay noticias publicadas
                </h3>
                <p className="type-body-compact mx-auto max-w-lg text-muted">
                  Esta sección quedará poblada automáticamente cuando se publiquen noticias desde el panel admin.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
