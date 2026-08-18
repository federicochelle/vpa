import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Project } from "@/types/project";
import Link from "next/link";

interface ProjectListingShellProps {
  investmentOnly?: boolean;
  projects: Project[];
  detailBasePath?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function ProjectListingShell({
  investmentOnly = false,
  projects,
  detailBasePath = "/inversion",
  eyebrow,
  title,
  description,
}: ProjectListingShellProps) {
  return (
    <div className="shell section-gap pt-0">
      <div className="panel p-6 sm:p-8">
        <SectionHeading
          eyebrow={eyebrow ?? (investmentOnly ? "Inversion" : "Proyectos")}
          title={
            title ??
            (investmentOnly
              ? "Vista preparada para mostrar oportunidades de inversion"
              : "Listado preparado para todos los proyectos")
          }
          description={
            description ??
            (investmentOnly
              ? "Este espacio filtra proyectos publicados marcados como oportunidad de inversion."
              : "La pagina renderiza proyectos publicados reutilizando ProjectCard.")
          }
        />
        <div className="mt-8">
          {projects.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {projects.map((project) => (
                <Link href={`${detailBasePath}/${project.slug}`} key={project.id}>
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={investmentOnly ? "Sin oportunidades cargadas" : "Sin proyectos cargados"}
              description="La grilla queda lista para reutilizar componentes y conectarse a una fuente de datos real."
            />
          )}
        </div>
      </div>
    </div>
  );
}
