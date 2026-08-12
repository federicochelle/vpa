import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export function FeaturedPropertiesSection() {
  return (
    <section className="shell section-gap">
      <SectionHeading
        eyebrow="Propiedades destacadas"
        title="Seccion lista para destacar oportunidades"
        description="La grilla y las tarjetas se agregaran cuando exista una fuente de datos real para las propiedades publicadas."
      />
      <div className="mt-8">
        <EmptyState
          title="Sin propiedades destacadas cargadas"
          description="La composicion ya queda preparada para renderizar cards destacadas sin depender de datos mockeados."
        />
      </div>
    </section>
  );
}
