import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";
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

export async function ProjectListingShell({
  investmentOnly = false,
  projects,
  detailBasePath = "/inversion",
  eyebrow,
  title,
  description,
}: ProjectListingShellProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <div className="shell section-gap pt-0">
      <div className="panel p-6 sm:p-8">
        <SectionHeading
          eyebrow={eyebrow ?? (investmentOnly ? t("home.investments") : t("project.projectBadge"))}
          title={
            title ??
            (investmentOnly
              ? t("project.investmentPreparedTitle")
              : t("project.allPreparedTitle"))
          }
          description={
            description ??
            (investmentOnly
              ? t("project.investmentPreparedDescription")
              : t("project.allPreparedDescription"))
          }
        />
        <div className="mt-8">
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link href={`${detailBasePath}/${project.slug}`} key={project.id}>
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                investmentOnly
                  ? t("project.noOpportunitiesLoaded")
                  : t("project.noProjectsLoaded")
              }
              description={t("project.gridReady")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
