import Image from "next/image";
import Link from "next/link";
import { HomeCarousel } from "@/components/marketing/home-carousel";
import { HomeHeroCarousel } from "@/components/marketing/home-hero-carousel";
import { SearchSection } from "@/components/marketing/home/search-section";
import { PropertyCard } from "@/components/properties/property-card";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsCard } from "@/features/news/news-card";
import { NewsListItem } from "@/features/news/news-list-item";
import { listPublishedNews } from "@/features/news/news.data";
import {
  listHeroProperties,
  listPublishedPropertiesByOperation,
} from "@/features/properties/properties.data";
import { listPublishedProjects } from "@/features/projects/projects.data";
import propiedadHeroImage from "../../../propiedad.jpg";
import proyectoHeroImage from "../../../proyecto.jpg";
import virginiaImage from "../../../virginia.jpeg";

function EmptyCarouselCard({ message }: { message: string }) {
  return (
    <article className="type-body-compact min-w-[280px] flex-none snap-start border border-border bg-surface p-6 text-muted sm:min-w-[340px] lg:min-w-[380px]">
      {message}
    </article>
  );
}

function formatLocationLabel(city: string | null, neighborhood: string | null) {
  const normalizedCity = city?.trim() || null;
  const normalizedNeighborhood = neighborhood?.trim() || null;
  const normalizedNeighborhoodKey = normalizeLocationPart(normalizedNeighborhood);

  const montevideoNeighborhoods = new Set([
    "buceo",
    "centro",
    "ciudad vieja",
    "cordon",
  ]);

  if (normalizedNeighborhood) {
    if (normalizeLocationPart(normalizedCity) === "atlantida") {
      return `Canelones / ${normalizedNeighborhood === "Atlantida" ? "Atlántida" : normalizedNeighborhood}`;
    }

    if (
      normalizeLocationPart(normalizedCity) === "montevideo" ||
      montevideoNeighborhoods.has(normalizedNeighborhoodKey)
    ) {
      return `Montevideo / ${normalizedNeighborhood}`;
    }

    if (normalizedCity) {
      return `${normalizedCity ?? "Montevideo"} / ${normalizedNeighborhood}`;
    }
  }

  return normalizedCity ?? normalizedNeighborhood ?? "";
}

function normalizeLocationPart(value: string | null) {
  return value?.trim().toLocaleLowerCase("es-UY") ?? "";
}

function formatHeroPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio a consultar";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function getHeroPropertyHref(slug: string, operationType: "sale" | "rent") {
  return operationType === "sale" ? `/comprar/${slug}` : `/alquileres/${slug}`;
}

function buildLocationOptions(
  ...locationGroups: Array<
    Array<{
      city: string | null;
      department: string | null;
      neighborhood: string | null;
      operation: "sale" | "rent" | "investment";
    }>
  >
) {
  const optionsMap = new Map<
    string,
    {
      label: string;
      city: string | null;
      department: string | null;
      neighborhood: string | null;
      operations: Array<"sale" | "rent" | "investment">;
    }
  >();

  for (const item of locationGroups.flat()) {
    const normalizedCity = item.city?.trim() || null;
    const normalizedDepartment = item.department?.trim() || null;
    const normalizedNeighborhood = item.neighborhood?.trim() || null;

    if (!normalizedCity && !normalizedNeighborhood) {
      continue;
    }

    const label = formatLocationLabel(normalizedCity, normalizedNeighborhood);
    const key = label.toLocaleLowerCase("es-UY");
    const existing = optionsMap.get(key);

    if (existing) {
      existing.department = existing.department ?? normalizedDepartment;
      if (!existing.operations.includes(item.operation)) {
        existing.operations.push(item.operation);
      }
      continue;
    }

    optionsMap.set(key, {
      label,
      city: normalizedCity,
      department: normalizedDepartment,
      neighborhood: normalizedNeighborhood,
      operations: [item.operation],
    });
  }

  return Array.from(optionsMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es-UY"),
  );
}

export async function HomeShell() {
  const [heroProperties, rentProperties, saleProperties, investmentProjects, recentNews] =
    await Promise.all([
      listHeroProperties(),
      listPublishedPropertiesByOperation("rent"),
      listPublishedPropertiesByOperation("sale"),
      listPublishedProjects(),
      listPublishedNews({ limit: 3 }),
    ]);
  const heroPropertySlides = heroProperties
    .filter((property) => property.image)
    .map((property) => ({
      src: property.image!,
      alt: property.title,
      title: property.title,
      price: formatHeroPropertyPrice(property.price, property.currency),
      href: getHeroPropertyHref(property.slug, property.operationType),
    }));
  const heroSlides =
    heroPropertySlides.length > 0
      ? heroPropertySlides
      : [
          { src: proyectoHeroImage, alt: "Proyecto destacado" },
          { src: propiedadHeroImage, alt: "Propiedad destacada" },
          { src: proyectoHeroImage, alt: "Proyecto destacado" },
        ];
  const locationOptions = buildLocationOptions(
    rentProperties.map((property) => ({
      city: property.city ?? null,
      department: property.department ?? null,
      neighborhood: property.neighborhood ?? null,
      operation: "rent" as const,
    })),
    saleProperties.map((property) => ({
      city: property.city ?? null,
      department: property.department ?? null,
      neighborhood: property.neighborhood ?? null,
      operation: "sale" as const,
    })),
    investmentProjects.map((project) => ({
      city: project.city ?? null,
      department: project.department ?? null,
      neighborhood: project.neighborhood ?? null,
      operation: "investment" as const,
    })),
  );

  return (
    <>
      <HomeHeroCarousel slides={heroSlides} />

      <SearchSection locationOptions={locationOptions} />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title="ALQUILERES" />
            <Link
              href="/alquileres"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              Ver más
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
                  Ver más
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
            <SectionHeading title="VENTAS" />
            <Link
              href="/comprar"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              Ver más
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
                  Ver más
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
            <SectionHeading title="INVERSIONES" />
            <Link
              href="/inversion"
              className="type-button font-display hidden items-center justify-center bg-primary px-5 py-2 uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              Ver más
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
                  Ver más
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
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
            <div className="relative min-h-[360px] overflow-hidden border border-border bg-surface-muted sm:min-h-[460px]">
              <Image
                src={virginiaImage}
                alt="Asesoramiento inmobiliario"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="space-y-6 text-center sm:text-left">
              <div className="space-y-3">
                <h2 className="section-title">
                  Acompañamiento cercano para cada decisión
                </h2>
              </div>

              <div className="space-y-5 section-copy max-w-none">
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
              <h2 className="section-title">
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
    </>
  );
}
