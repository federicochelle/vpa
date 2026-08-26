import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/types/property";

interface PropertyListingShellProps {
  properties: Property[];
  eyebrow?: string;
  title?: string;
  description?: string;
  detailBasePath?: string;
}

export function PropertyListingShell({
  properties,
  eyebrow = "Propiedades",
  title = "Base de catalogo inmobiliario",
  description = "Ruta preparada para encabezado, filtros, resultados, grilla de propiedades y paginacion.",
  detailBasePath = "/comprar",
}: PropertyListingShellProps) {
  return (
    <div className="shell section-gap pt-0">
      <div className="grid gap-8">
        <section className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {["Operacion", "Tipo", "Barrio", "Dormitorios", "Precio"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-strong">Resultados</h2>
              <p className="text-sm text-muted">
                {properties.length > 0
                  ? `${properties.length} publicadas`
                  : "Sin resultados cargados aun"}
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
                title="La grilla de propiedades esta vacia"
                description="PropertyCard ya queda disponible para renderizar resultados cuando exista una fuente de datos real."
              />
            )}
          </div>
          <aside className="panel p-6">
            <h3 className="text-lg font-semibold text-primary-strong">Paginacion</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Espacio reservado para controles de pagina, conteo de resultados y navegacion futura.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
