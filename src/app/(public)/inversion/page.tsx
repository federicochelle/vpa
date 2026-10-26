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

        <p className="type-body max-w-3xl text-foreground">
          {t("investmentPage.reportPrefix")}
          <a
            className="group inline-flex items-baseline gap-1.5 font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary-strong hover:decoration-primary-strong focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/8"
            href="/informes/analisis-rentabilidad-uruguay.pdf"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0 translate-y-[3px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </svg>
            <span>{t("investmentPage.reportLink")}</span>
            <span className="sr-only">{t("investorResidency.reportNewTab")}</span>
          </a>
          {t("investmentPage.reportSuffix")}
        </p>

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
