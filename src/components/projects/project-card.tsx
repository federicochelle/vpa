import { CalendarClock, MapPin, Wallet } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="panel overflow-hidden">
      <div className="space-y-6 p-6">
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-strong px-4 text-center text-sm text-muted">
          {project.image ? "Imagen disponible" : "Espacio reservado para imagen"}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {project.constructionStatus ?? "Estado pendiente"}
            </p>
            <h3 className="text-xl font-semibold text-primary-strong">{project.name}</h3>
          </div>
          <div className="grid gap-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {project.neighborhood ?? "Ubicacion pendiente"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              {project.estimatedDeliveryDate ?? "Entrega pendiente"}
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {project.currency && project.startingPrice
                ? `Desde ${project.currency} ${project.startingPrice}`
                : "Precio inicial pendiente"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
