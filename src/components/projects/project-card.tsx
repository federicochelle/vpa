import Image from "next/image";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import { formatProjectDeliveryDate } from "@/features/projects/project-delivery-date";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getLocalizedProjectName } from "@/i18n/public/content";
import { getConstructionStatusLabel } from "@/i18n/public/formatters";
import { getPublicMessage } from "@/i18n/public/messages";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  className?: string;
  variant?: "default" | "compact";
}

export async function ProjectCard({
  project,
  className = "",
  variant = "default",
}: ProjectCardProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);
  const name = getLocalizedProjectName(project, locale);
  const isCompact = variant === "compact";
  const deliveryDate = formatProjectDeliveryDate(project.estimatedDeliveryDate, locale);
  const deliveryLabel = deliveryDate ??
    (project.constructionStatus === "immediate_occupancy"
      ? getConstructionStatusLabel("immediate_occupancy", locale)
      : null);

  return (
    <article
      className={`flex h-full overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] ${
        isCompact ? "flex-col md:flex-row" : "flex-col"
      } ${className}`.trim()}
    >
      <div
        className={`relative overflow-hidden bg-surface-muted ${
          isCompact
            ? "aspect-[4/3] md:h-auto md:min-h-36 md:w-60 md:flex-none md:aspect-auto"
            : "aspect-[4/3]"
        }`}
      >
        {project.image ? (
          <Image
            alt={name}
            className="object-cover object-center"
            fill
            sizes={
              isCompact
                ? "(min-width: 768px) 15rem, 100vw"
                : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            }
            src={project.image}
          />
        ) : (
          <div className="h-full w-full brand-media-fallback" />
        )}
        <span className="absolute right-3 top-3 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {project.constructionStatus
            ? getConstructionStatusLabel(project.constructionStatus, locale)
            : t("project.projectBadge")}
          </span>
      </div>
      <div
        className={`flex flex-1 flex-col ${
          isCompact ? "px-4 pb-3 pt-3" : "px-5 pb-6 pt-5"
        }`}
      >
        <div className={isCompact ? "space-y-3" : "space-y-5"}>
          <h3
            className={`overflow-hidden font-display leading-[1.2] text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] ${
              isCompact
                ? "text-base [-webkit-line-clamp:2]"
                : "h-[4.5rem] text-xl [-webkit-line-clamp:3]"
            }`}
          >
            {name}
          </h3>
          <div className="type-body-compact flex items-center gap-2 text-muted">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {project.neighborhood ?? t("project.pendingZone")}
            </span>
          </div>
        </div>
        <div
          className={`type-body-compact mt-auto grid gap-3 text-muted ${
            isCompact ? "pt-3" : "pt-6"
          }`}
        >
          {deliveryLabel ? (
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              {deliveryLabel}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {project.featured
              ? t("project.featured")
              : project.isInvestmentOpportunity
                ? t("project.investmentOpportunity")
                : t("project.available")}
          </div>
        </div>
      </div>
    </article>
  );
}
