import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, CalendarClock, CarFront, MapPin, Ruler, Sparkles } from "lucide-react";
import { HomeCarousel } from "@/components/marketing/home-carousel";
import { SearchSection } from "@/components/marketing/home/search-section";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";
import { listPublishedProjects } from "@/features/projects/projects.data";
import propiedadHeroImage from "../../../propiedad.jpg";
import proyectoHeroImage from "../../../proyecto.jpg";
import virginiaImage from "../../../virginia.jpeg";

function formatPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio a consultar";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function EmptyCarouselCard({ message }: { message: string }) {
  return (
    <article className="min-w-[280px] flex-none snap-start border border-border bg-surface p-6 text-sm text-muted sm:min-w-[340px] lg:min-w-[380px]">
      {message}
    </article>
  );
}

export async function HomeShell() {
  const [rentProperties, saleProperties, investmentProjects] = await Promise.all([
    listPublishedPropertiesByOperation("rent"),
    listPublishedPropertiesByOperation("sale"),
    listPublishedProjects(),
  ]);
  const heroSlides = [
    { src: propiedadHeroImage, alt: "Propiedad destacada" },
    { src: proyectoHeroImage, alt: "Proyecto destacado" },
  ];

  return (
    <>
      <section className="relative h-[66vh] min-h-[460px] w-full overflow-hidden sm:h-[72vh] sm:min-h-[540px] lg:h-[78vh]">
        <div className="hero-track flex h-full w-[300%]">
          {[...heroSlides, heroSlides[0]].map((slide, index) => (
            <div
              key={`${slide.alt}-${index}`}
              className="hero-slide relative h-full flex-[0_0_33.3333%]"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
      </section>

      <SearchSection />

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
              className="inline-flex items-center justify-center border border-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Ver más
            </Link>
          </div>

          <HomeCarousel>
            {rentProperties.length > 0
              ? rentProperties.slice(0, 6).map((property) => (
                  <Link
                    key={property.id}
                    href={`/alquileres/${property.slug}`}
                    className="basis-[280px] flex-none snap-start overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] sm:basis-[340px] lg:basis-[380px]"
                  >
                    <div
                      className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                      style={property.image ? { backgroundImage: `url(${property.image})` } : undefined}
                    />
                    <div className="space-y-5 p-5">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl text-foreground">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{property.neighborhood ?? "Ubicación pendiente"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-primary" />
                          {property.bedrooms ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-primary" />
                          {property.bathrooms ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <CarFront className="h-4 w-4 text-primary" />
                          {property.garages ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          {property.builtArea ?? "-"}
                        </div>
                      </div>

                      <p className="text-lg font-semibold text-primary-strong">
                        {formatPropertyPrice(property.price, property.currency)}
                      </p>
                    </div>
                  </Link>
                ))
              : <EmptyCarouselCard message="Todavía no hay alquileres publicados." />}
          </HomeCarousel>
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
              className="inline-flex items-center justify-center border border-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Ver más
            </Link>
          </div>

          <HomeCarousel>
            {saleProperties.length > 0
              ? saleProperties.slice(0, 6).map((property) => (
                  <Link
                    key={property.id}
                    href={`/comprar/${property.slug}`}
                    className="basis-[280px] flex-none snap-start overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] sm:basis-[340px] lg:basis-[380px]"
                  >
                    <div
                      className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                      style={property.image ? { backgroundImage: `url(${property.image})` } : undefined}
                    />
                    <div className="space-y-5 p-5">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl text-foreground">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{property.neighborhood ?? "Ubicación pendiente"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-primary" />
                          {property.bedrooms ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-primary" />
                          {property.bathrooms ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <CarFront className="h-4 w-4 text-primary" />
                          {property.garages ?? "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          {property.builtArea ?? "-"}
                        </div>
                      </div>

                      <p className="text-lg font-semibold text-primary-strong">
                        {formatPropertyPrice(property.price, property.currency)}
                      </p>
                    </div>
                  </Link>
                ))
              : <EmptyCarouselCard message="Todavía no hay propiedades en venta publicadas." />}
          </HomeCarousel>
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
              className="inline-flex items-center justify-center border border-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Ver más
            </Link>
          </div>

          <HomeCarousel>
            {investmentProjects.length > 0
              ? investmentProjects.slice(0, 6).map((project) => (
                  <Link
                    key={project.id}
                    href={`/inversion/${project.slug}`}
                    className="basis-[280px] flex-none snap-start overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] sm:basis-[340px] lg:basis-[380px]"
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
                ))
              : <EmptyCarouselCard message="Todavía no hay proyectos de inversión publicados." />}
          </HomeCarousel>
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

            <div className="space-y-6">
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
    </>
  );
}
