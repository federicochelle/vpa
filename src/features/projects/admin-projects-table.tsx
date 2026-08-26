"use client";

import { Children } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Project } from "@/types/project";

interface AdminProjectsTableProps {
  actions?: ReactNode;
  children?: ReactNode;
  projects: Project[];
  title?: string;
}

export function AdminProjectsTable({
  actions,
  children,
  projects,
  title = "Listado de proyectos",
}: AdminProjectsTableProps) {
  const router = useRouter();
  const hasVisibleChildren = Children.toArray(children).length > 0;

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {title}
            </h4>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
      {hasVisibleChildren ? (
        <div className="space-y-6 border-b border-border p-6 sm:p-8">{children}</div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {[
                "Proyecto",
                "Desarrollador",
                "Estado",
                "Ubicación",
              ].map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-sm text-muted" colSpan={4}>
                  No hay proyectos visibles para esta sesión.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                  key={project.id}
                  onClick={() => {
                    router.push(`/admin/proyectos/${project.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/proyectos/${project.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-6 py-5">
                    <p className="font-medium text-foreground">{project.name}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {project.developerName || "Sin desarrollador"}
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    <span className="status-pill">
                      {translateConstructionStatus(project.constructionStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {[project.department, project.city].filter(Boolean).join(" / ") ||
                      "Sin ubicación"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function translateConstructionStatus(status: Project["constructionStatus"]) {
  switch (status) {
    case "planned":
      return "Planificado";
    case "under_construction":
      return "En construcción";
    case "finished":
      return "Finalizado";
    default:
      return "Sin estado";
  }
}
