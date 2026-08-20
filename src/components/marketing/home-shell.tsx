import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import { HomeCarousel } from "@/components/marketing/home-carousel";
import { HomeHeroCarousel } from "@/components/marketing/home-hero-carousel";
import { SearchSection } from "@/components/marketing/home/search-section";
import { PropertyCard } from "@/components/properties/property-card";
import { NewsCard } from "@/features/news/news-card";
import { NewsListItem } from "@/features/news/news-list-item";
import { listPublishedNews } from "@/features/news/news.data";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import { listPublishedProjects } from "@/features/projects/projects.data";
import propiedadHeroImage from "../../../propiedad.jpg";
import proyectoHeroImage from "../../../proyecto.jpg";
import virginiaImage from "../../../virginia.jpeg";

function EmptyCarouselCard({ message }: { message: string }) {
  return (
    <article className="min-w-[280px] flex-none snap-start border border-border bg-surface p-6 text-sm text-muted sm:min-w-[340px] lg:min-w-[380px]">
      {message}
    </article>
  );
}

function buildLocationOptions(
  ...locationGroups: Array<Array<{ city: string | null; neighborhood: string | null }>>
) {
  return Array.from(
    new Map(
      locationGroups
        .flat()
        .map(({ city, neighborhood }) => {
          const normalizedCity = city?.trim() || null;
          const normalizedNeighborhood = neighborhood?.trim() || null;

          if (!normalizedCity && !normalizedNeighborhood) {
            return null;
          }

          const label =
            normalizedCity && normalizedNeighborhood
              ? `${normalizedCity} / ${normalizedNeighborhood}`
              : normalizedCity ?? normalizedNeighborhood ?? "";

          return [
            label.toLocaleLowerCase("es-UY"),
            {
              label,
              city: normalizedCity,
              neighborhood: normalizedNeighborhood,
            },
          ] as const;
        })
        .filter((entry): entry is readonly [string, { label: string; city: string | null; neighborhood: string | null }] => Boolean(entry)),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label, "es-UY"));
}

export async function HomeShell() {
  const [rentProperties, saleProperties, investmentProjects, recentNews] = await Promise.all([
    listPublishedPropertiesByOperation("rent"),
    listPublishedPropertiesByOperation("sale"),
    listPublishedProjects(),
    listPublishedNews({ limit: 3 }),
  ]);
  const heroSlides = [
    { src: proyectoHeroImage, alt: "Proyecto destacado" },
    { src: propiedadHeroImage, alt: "Propiedad destacada" },
    { src: proyectoHeroImage, alt: "Proyecto destacado" },
  ];
  const locationOptions = buildLocationOptions(
    rentProperties.map((property) => ({
      city: property.city,
      neighborhood: property.neighborhood,
    })),
    saleProperties.map((property) => ({
      city: property.city,
      neighborhood: property.neighborhood,
    })),
    investmentProjects.map((project) => ({
      city: project.city,
      neighborhood: project.neighborhood,
    })),
  );

  return (
    <>
      <HomeHeroCarousel slides={heroSlides} />

      <SearchSection locationOptions={locationOptions} />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Alquileres
              </p>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Propiedades en alquiler
              </h2>
            </div>
            <Link
              href="/alquileres"
              className="hidden items-center justify-center bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
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
                    <PropertyCard className="w-full" property={property} variant="tile" />
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/alquileres"
                  className="inline-flex w-full items-center justify-center bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
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
                      <PropertyCard property={property} variant="tile" />
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
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Comprar
              </p>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Propiedades en venta
              </h2>
            </div>
            <Link
              href="/comprar"
              className="hidden items-center justify-center bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
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
                    <PropertyCard className="w-full" property={property} variant="tile" />
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/comprar"
                  className="inline-flex w-full items-center justify-center bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
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
                      <PropertyCard property={property} variant="tile" />
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
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Invertir
              </p>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Conocé nuestros proyectos de inversión
              </h2>
            </div>
            <Link
              href="/inversion"
              className="hidden items-center justify-center bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
            >
              Ver más
            </Link>
          </div>

          {investmentProjects.length > 0 ? (
            <>
              <div className="grid gap-6 sm:hidden">
                {investmentProjects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/inversion/${project.slug}`}
                    className="block overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
                  >
                    <div
                      className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                      style={project.image ? { backgroundImage: `url(${project.image})` } : undefined}
                    />
                    <div className="space-y-5 p-5">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl text-foreground">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>
                            {[project.neighborhood, project.city].filter(Boolean).join(", ") ||
                              "Ubicación pendiente"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-primary" />
                          {project.estimatedDeliveryDate ?? "Entrega pendiente"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          {project.isInvestmentOpportunity
                            ? "Oportunidad de inversión"
                            : project.featured
                              ? "Proyecto destacado"
                              : "Proyecto disponible"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <Link
                  href="/inversion"
                  className="inline-flex w-full items-center justify-center bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
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
                      className="basis-[280px] flex-none snap-start overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] sm:basis-[340px] lg:basis-[calc((100%-3rem)/3)]"
                    >
                      <div
                        className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                        style={project.image ? { backgroundImage: `url(${project.image})` } : undefined}
                      />
                      <div className="space-y-5 p-5">
                        <div className="space-y-2">
                          <h3 className="font-display text-2xl text-foreground">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>
                              {[project.neighborhood, project.city].filter(Boolean).join(", ") ||
                                "Ubicación pendiente"}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-muted">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-primary" />
                            {project.estimatedDeliveryDate ?? "Entrega pendiente"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {project.isInvestmentOpportunity
                              ? "Oportunidad de inversión"
                              : project.featured
                                ? "Proyecto destacado"
                                : "Proyecto disponible"}
                          </div>
                        </div>
                      </div>
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
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                  Asesoramiento
                </p>
                <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                  Acompañamiento cercano para cada decisión
                </h2>
              </div>

              <div className="space-y-5 text-base leading-8 text-muted">
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
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Noticias
              </p>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Noticias e interés
              </h2>
            </div>
            <Link
              className="hidden items-center justify-center bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong sm:inline-flex"
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
                  className="inline-flex w-full items-center justify-center bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary-strong"
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
                <p className="mx-auto max-w-lg text-sm leading-6 text-muted">
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
