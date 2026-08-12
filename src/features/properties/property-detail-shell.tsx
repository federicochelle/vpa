import { DataPoint } from "@/components/ui/data-point";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Property } from "@/types/property";

interface PropertyDetailShellProps {
  property: Property;
}

export function PropertyDetailShell({ property }: PropertyDetailShellProps) {
  return (
    <div className="shell section-gap pt-0">
      <div className="grid gap-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="panel flex min-h-[420px] items-center justify-center border-dashed bg-surface-strong px-6 text-center text-sm text-muted">
            Galeria preparada para la propiedad: {property.slug}
          </div>
          <div className="panel p-6 sm:p-8">
            <SectionHeading
              eyebrow="Detalle de propiedad"
              title={property.title}
              description="Este bloque queda reservado para informacion principal y llamada a la accion."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <DataPoint
                label="Precio"
                value={
                  property.currency && property.price
                    ? `${property.currency} ${property.price}`
                    : undefined
                }
              />
              <DataPoint
                label="Ubicacion"
                value={
                  [property.neighborhood, property.city, property.department]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
              <DataPoint
                label="Dormitorios"
                value={property.bedrooms != null ? String(property.bedrooms) : undefined}
              />
              <DataPoint
                label="Banos"
                value={property.bathrooms != null ? String(property.bathrooms) : undefined}
              />
              <DataPoint
                label="Garages"
                value={property.garages != null ? String(property.garages) : undefined}
              />
              <DataPoint
                label="Superficies"
                value={
                  [
                    property.builtArea ? `${property.builtArea} m2 cubiertos` : null,
                    property.totalArea ? `${property.totalArea} m2 totales` : null,
                  ]
                    .filter(Boolean)
                    .join(" / ") || null
                }
              />
            </div>
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <div className="panel p-6 sm:p-8">
              <h2 className="text-2xl font-display text-primary-strong">Descripcion</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {property.description ??
                  "Espacio preparado para descripcion, caracteristicas destacadas y atributos complementarios."}
              </p>
            </div>
            <div className="panel p-6 sm:p-8">
              <h2 className="text-2xl font-display text-primary-strong">Ubicacion y mapa</h2>
              <div className="mt-6 flex min-h-60 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-strong px-6 text-center text-sm text-muted">
                Area lista para integrar ubicacion o mapa en una fase posterior.
              </div>
            </div>
            <EmptyState
              title="Propiedades similares"
              description="La seccion queda reservada para recomendaciones relacionadas cuando existan datos reales."
            />
          </div>
          <div className="panel p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Formulario de consulta</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              La interfaz de contacto queda separada y lista para conectarse con futuros flujos de consultas.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
