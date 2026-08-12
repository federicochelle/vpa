import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

interface ProjectListingShellProps {
  investmentOnly?: boolean;
}

export function ProjectListingShell({ investmentOnly = false }: ProjectListingShellProps) {
  return (
    <div className="shell section-gap pt-0">
      <div className="panel p-6 sm:p-8">
        <SectionHeading
          eyebrow={investmentOnly ? "Inversiones" : "Proyectos"}
          title={
            investmentOnly
              ? "Vista preparada para mostrar oportunidades de inversion"
              : "Listado preparado para todos los proyectos"
          }
          description={
            investmentOnly
              ? "Este espacio filtrara en el futuro los proyectos con `isInvestmentOpportunity === true`."
              : "La pagina podra renderizar proyectos activos, en pozo o finalizados usando `ProjectCard`."
          }
        />
        <div className="mt-8">
          <EmptyState
            title={investmentOnly ? "Sin oportunidades cargadas" : "Sin proyectos cargados"}
            description="La grilla queda lista para reutilizar componentes y conectarse a una fuente de datos real."
          />
        </div>
      </div>
    </div>
  );
}
