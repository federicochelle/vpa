import Image from "next/image";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import { PROJECT_CONSTRUCTION_STATUS_LABELS, type Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({
  project,
  className = "",
}: ProjectCardProps) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] ${className}`.trim()}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {project.image ? (
          <Image
            alt={project.name}
            className="object-cover object-center"
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            src={project.image}
          />
        ) : (
          <div className="h-full w-full brand-media-fallback" />
        )}
        <span className="absolute right-3 top-3 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {project.constructionStatus
            ? PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus]
            : "PROYECTO"}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <div className="space-y-5">
          <h3 className="h-[4.5rem] overflow-hidden font-display text-xl leading-[1.2] text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {project.name}
          </h3>
          <div className="type-body-compact flex items-center gap-2 text-muted">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {[project.neighborhood, project.city].filter(Boolean).join(", ") ||
                "Ubicación pendiente"}
            </span>
          </div>
        </div>
        <div className="type-body-compact mt-auto grid gap-3 pt-6 text-muted">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            {project.estimatedDeliveryDate ?? "Entrega pendiente"}
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {project.featured
              ? "Proyecto destacado"
              : project.isInvestmentOpportunity
                ? "Oportunidad de inversión"
                : "Proyecto disponible"}
          </div>
        </div>
      </div>
    </article>
  );
}
