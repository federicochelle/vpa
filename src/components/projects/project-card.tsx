import Image from "next/image";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import type { Project } from "@/types/project";

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
      className={`overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] ${className}`.trim()}
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
      </div>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h3 className="overflow-hidden font-display text-xl leading-tight text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
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
        <div className="type-body-compact grid gap-3 text-muted">
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
