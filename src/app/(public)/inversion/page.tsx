import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublishedProjects } from "@/features/projects/projects.data";
import {
  buildRelatedProjectResults,
  parseZoneFilter,
} from "@/features/search/related-results";

interface InvestmentPageProps {
  searchParams: Promise<{
    zona?: string;
  }>;
}

export default async function InvestmentPage({ searchParams }: InvestmentPageProps) {
  const params = await searchParams;
  const projects = await listPublishedProjects();
  const selectedZone = parseZoneFilter(params.zona);
  const { exactResults, suggestedResults } = buildRelatedProjectResults({
    projects,
    selectedZone,
  });
  const hasAnyResults = exactResults.length > 0 || suggestedResults.length > 0;

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <SectionHeading
          title="INVERSIONES"
          description=""
          titleAs="h1"
        />

        {hasAnyResults ? (
          <>
            {exactResults.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {exactResults.map((project) => (
                  <Link key={project.id} href={`/inversion/${project.slug}`}>
                    <ProjectCard project={project} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="type-body text-muted">No encontramos coincidencias exactas.</p>
            )}
            {suggestedResults.length > 0 ? (
              <section className="space-y-6">
                <h2 className="text-xl font-display text-primary-strong">
                  También te puede interesar
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {suggestedResults.map((project) => (
                    <Link key={project.id} href={`/inversion/${project.slug}`}>
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
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
