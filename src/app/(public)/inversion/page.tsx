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

function parseLocationFilter(value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  const [cityPart, neighborhoodPart] = normalizedValue.split("/").map((part) => part?.trim() || "");

  if (cityPart && neighborhoodPart) {
    return {
      city: normalizeFilterValue(cityPart),
      neighborhood: normalizeFilterValue(neighborhoodPart),
    };
  }

  return {
    city: normalizeFilterValue(normalizedValue),
    neighborhood: normalizeFilterValue(normalizedValue),
  };
}

export default async function InvestmentPage({ searchParams }: InvestmentPageProps) {
  const params = await searchParams;
  const projects = await listPublishedProjects();
  const selectedLocation = parseLocationFilter(params.zona);
  const filteredProjects = projects.filter((project) =>
    selectedLocation
      ? normalizeFilterValue(project.city) === selectedLocation.city ||
        normalizeFilterValue(project.neighborhood) === selectedLocation.neighborhood
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
