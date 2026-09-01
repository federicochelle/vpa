import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublishedProjects } from "@/features/projects/projects.data";

interface InvestmentPageProps {
  searchParams: Promise<{
    zona?: string;
  }>;
}

function normalizeFilterValue(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("es-UY") ?? "";
}

function parseNeighborhoodFilter(value: string | undefined) {
  const normalizedValue = normalizeFilterValue(value?.split("/").at(-1));
  return normalizedValue || null;
}

export default async function InvestmentPage({ searchParams }: InvestmentPageProps) {
  const params = await searchParams;
  const projects = await listPublishedProjects();
  const selectedNeighborhood = parseNeighborhoodFilter(params.zona);
  const filteredProjects = projects.filter((project) =>
    selectedNeighborhood
      ? normalizeFilterValue(project.neighborhood) === selectedNeighborhood
      : true,
  );

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <SectionHeading
          title="INVERSIONES"
          description=""
          titleAs="h1"
        />

        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/inversion/${project.slug}`}>
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay proyectos publicados"
            description="No encontramos proyectos publicados con los filtros seleccionados."
          />
        )}
      </div>
    </section>
  );
}
