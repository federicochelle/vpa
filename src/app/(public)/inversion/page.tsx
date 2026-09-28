import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublishedProjects } from "@/features/projects/projects.data";
import {
  buildRelatedProjectResults,
  parseZoneFilter,
} from "@/features/search/related-results";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Proyectos de inversión",
  description:
    "Proyectos de inversión y desarrollos publicados en Uruguay para evaluar oportunidades con asesoramiento personalizado.",
  path: "/inversion",
});

interface InvestmentPageProps {
  searchParams: Promise<{
    zona?: string;
  }>;
}

export default async function InvestmentPage({ searchParams }: InvestmentPageProps) {
  const params = await searchParams;
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
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
          title={t("home.investments")}
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
              <p className="type-body text-muted">{t("common.noExactMatches")}</p>
            )}
            {suggestedResults.length > 0 ? (
              <section className="space-y-6">
                <h2 className="text-xl font-display text-primary-strong">
                  {t("common.youMayAlsoLike")}
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
            title={t("project.noProjects")}
            description={t("project.noFilteredProjects")}
          />
        )}
      </div>
    </section>
  );
}
