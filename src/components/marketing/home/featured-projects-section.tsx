import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export function FeaturedProjectsSection() {
  return (
    <section className="shell section-gap">
      <SectionHeading
        eyebrow="Proyectos destacados"
        title="Bloque editorial y comercial listo para futuros desarrollos"
        description="Esta seccion podra reutilizar ProjectCard cuando los proyectos reales esten disponibles."
      />
      <div className="mt-8">
        <EmptyState
          title="Sin proyectos destacados"
          description="La estructura existe para conectar proyectos publicados sin inventar contenido en esta etapa."
        />
      </div>
    </section>
  );
}
