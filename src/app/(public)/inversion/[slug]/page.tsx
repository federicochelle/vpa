import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { cache } from "react";
import { ProjectDetailShell } from "@/features/projects/project-detail-shell";
import { listPublishedProjectImages } from "@/features/projects/project-images.data";
import { getPublishedProjectBySlug } from "@/features/projects/projects.data";
import { normalizeLocationPart } from "@/features/properties/property-location";
import {
  createNotFoundSeoMetadata,
  createSeoMetadata,
  resolveContentSeoImage,
} from "@/lib/seo";
import { PROJECT_CONSTRUCTION_STATUS_LABELS } from "@/types/project";

interface InvestmentDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getProjectBySlug = cache(getPublishedProjectBySlug);

export async function generateMetadata({ params }: InvestmentDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return createNotFoundSeoMetadata("Proyecto no encontrado");
  }

  const imagesResult = await listPublishedProjectImages(project.id);
  const image = resolveContentSeoImage(
    imagesResult.ok ? imagesResult.data : [],
    project.name,
  );

  return createSeoMetadata({
    title: project.name,
    description: project.description,
    path: `/inversion/${project.slug}`,
    image,
  });
}

export default async function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const headerLocation = normalizeLocationPart(project.neighborhood);

  const status = project.constructionStatus
    ? PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus]
    : null;
  const hasHeaderDetails = Boolean(headerLocation || status);

  return (
    <>
      <section className="shell pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="-mx-4 sm:mx-0">
          <div className="panel overflow-hidden !rounded-none">
            <div className="flex flex-col gap-6 brand-panel-header px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12">
              <div className="min-w-0 space-y-4">
                <h1 className="detail-hero-title text-foreground">
                  {project.name}
                </h1>
                {hasHeaderDetails ? (
                  <div className="flex items-start justify-between gap-4 lg:hidden">
                    {headerLocation ? (
                      <div className="flex min-w-0 items-center gap-3 text-primary-strong">
                        <MapPin className="h-5 w-5 flex-none text-primary" />
                        <span className="min-w-0 truncate text-lg font-medium whitespace-nowrap sm:text-xl">
                          {headerLocation}
                        </span>
                      </div>
                    ) : null}
                    {status ? (
                      <p className="inline-flex shrink-0 whitespace-nowrap bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        {status}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {headerLocation ? (
                  <div className="hidden items-start justify-between gap-4 lg:flex lg:justify-start">
                    <div className="flex min-w-0 items-center gap-3 text-primary-strong">
                      <MapPin className="h-5 w-5 flex-none text-primary" />
                      <span className="min-w-0 text-xl font-medium break-words [overflow-wrap:anywhere]">
                        {headerLocation}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
              {status ? (
                <div className="hidden text-right lg:block">
                  <p className="type-body-compact inline-flex bg-primary px-3 py-1 font-semibold uppercase tracking-[0.14em] text-white">
                    {status}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <ProjectDetailShell project={project} />
    </>
  );
}
