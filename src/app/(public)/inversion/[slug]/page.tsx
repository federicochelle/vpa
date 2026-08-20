import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { ProjectDetailShell } from "@/features/projects/project-detail-shell";
import { getPublishedProjectBySlug } from "@/features/projects/projects.data";

interface InvestmentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const location =
    [project.neighborhood, project.city, project.department]
      .filter(Boolean)
      .join(", ") || "Ubicación pendiente";

  const status =
    project.constructionStatus === "planned"
      ? "Planificado"
      : project.constructionStatus === "under_construction"
        ? "En construcción"
        : project.constructionStatus === "finished"
          ? "Finalizado"
          : "Proyecto";

  return (
    <>
      <section className="shell pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="-mx-4 sm:mx-0">
          <div className="panel overflow-hidden !rounded-none">
            <div className="flex flex-col gap-6 bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12">
              <div className="min-w-0 space-y-4">
                <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                  {project.name}
                </h1>
                <div className="flex items-start justify-between gap-4 text-sm text-muted lg:justify-start">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 flex-none text-primary" />
                    <span>{location}</span>
                  </div>
                  <p className="shrink-0 font-display text-2xl text-primary-strong sm:text-3xl lg:hidden">
                    {status}
                  </p>
                </div>
              </div>
              <div className="hidden text-right lg:block">
                <p className="font-display text-3xl text-primary-strong">
                  {status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProjectDetailShell project={project} />
    </>
  );
}
