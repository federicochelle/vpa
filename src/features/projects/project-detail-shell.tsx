import { DataPoint } from "@/components/ui/data-point";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

interface ProjectDetailShellProps {
  slug: string;
}

export function ProjectDetailShell({ slug }: ProjectDetailShellProps) {
  return (
    <div className="shell section-gap pt-0">
      <div className="grid gap-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="panel flex min-h-[420px] items-center justify-center border-dashed bg-surface-strong px-6 text-center text-sm text-muted">
            Galeria preparada para el proyecto: {slug}
          </div>
          <div className="panel p-6 sm:p-8">
            <SectionHeading
              eyebrow="Detalle de proyecto"
              title="Arquitectura lista para nombre, descripcion y datos clave"
              description="Este lateral queda preparado para developer, ubicacion, estado de obra y entrega estimada."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <DataPoint label="Desarrollador" />
              <DataPoint label="Ubicacion" />
              <DataPoint label="Estado de obra" />
              <DataPoint label="Entrega estimada" />
              <DataPoint label="Precio inicial" />
              <DataPoint label="Caracteristicas" />
            </div>
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <div className="panel p-6 sm:p-8">
              <h2 className="text-2xl font-display text-primary-strong">Descripcion y caracteristicas</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Espacio listo para contenido editorial, amenities, avances y atributos del desarrollo.
              </p>
            </div>
            <EmptyState
              title="Unidades del proyecto"
              description="La futura tabla de unidades podra usar el tipo `ProjectUnit` sin inventar unidades en esta etapa."
            />
          </div>
          <div className="panel p-6 sm:p-8">
            <h2 className="text-2xl font-display text-primary-strong">Consulta</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Area preparada para un formulario o CTA vinculado especificamente al proyecto.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
