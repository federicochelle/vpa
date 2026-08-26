import Link from "next/link";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
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

function formatConstructionStatus(status: string | null) {
  if (!status) {
    return "Estado pendiente";
  }

  switch (status) {
    case "planned":
      return "Planificado";
    case "under_construction":
      return "En construcción";
    case "finished":
      return "Finalizado";
    default:
      return status;
  }
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
              <Link
                key={project.id}
                href={`/inversion/${project.slug}`}
                className="overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
              >
                <div
                  className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                  style={project.image ? { backgroundImage: `url(${project.image})` } : undefined}
                />
                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl text-foreground">
                      {project.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        {[project.neighborhood, project.city].filter(Boolean).join(", ") ||
                          "Ubicación pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      {project.estimatedDeliveryDate ?? "Entrega pendiente"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {project.isInvestmentOpportunity
                        ? "Oportunidad de inversión"
                        : project.featured
                          ? "Proyecto destacado"
                          : "Proyecto disponible"}
                    </div>
                  </div>
                </div>
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
