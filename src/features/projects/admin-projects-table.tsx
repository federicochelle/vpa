"use client";

import { Children, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownAZ } from "lucide-react";
import type { ReactNode } from "react";
import { AdminHeroToggle } from "@/features/home-hero/admin-hero-toggle";
import { AdminSectionOrderSelect } from "@/features/section-order/admin-section-order-select";
import { PROJECT_CONSTRUCTION_STATUS_LABELS, type Project } from "@/types/project";

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
  const [sortByName, setSortByName] = useState(false);
  const visibleProjects = useMemo(
    () =>
      sortByName
        ? [...projects].sort((left, right) =>
            left.name.localeCompare(right.name, "es-UY", { sensitivity: "base" }),
          )
        : projects,
    [projects, sortByName],
  );

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
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
              <th className="admin-table-head px-6 py-4 text-left">
                <span className="inline-flex items-center gap-2">
                  Proyecto
                  <button
                    aria-pressed={sortByName}
                    className={`inline-flex size-8 items-center justify-center rounded-full border transition-colors ${
                      sortByName
                        ? "border-primary/30 bg-primary/10 text-primary-strong"
                        : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary-strong"
                    }`}
                    onClick={() => setSortByName((current) => !current)}
                    title={sortByName ? "Volver al orden manual" : "Ordenar alfabéticamente"}
                    type="button"
                  >
                    <ArrowDownAZ className="h-4 w-4" />
                  </button>
                </span>
              </th>
              {["Estado", "Zona", "Orden", "Home"].map((column) => (
                <th
                  key={column}
                  className="admin-table-head px-6 py-4 text-left"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleProjects.length === 0 ? (
              <tr>
                <td className="admin-note px-6 py-10" colSpan={5}>
                  No hay proyectos visibles para esta sesión.
                </td>
              </tr>
            ) : (
              visibleProjects.map((project) => (
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
                  <td className="admin-note px-6 py-5">
                    <span className="admin-status-pill">
                      {project.constructionStatus
                        ? PROJECT_CONSTRUCTION_STATUS_LABELS[project.constructionStatus]
                        : "Sin estado"}
                    </span>
                  </td>
                  <td className="admin-note px-6 py-5">
                    {project.neighborhood ?? "Sin zona"}
                  </td>
                  <td className="admin-note px-6 py-5">
                    <AdminSectionOrderSelect
                      entityId={project.id}
                      entityType="project"
                      key={`${project.id}:${project.sectionOrder ?? "none"}`}
                      label={project.name}
                      sectionOrder={project.sectionOrder}
                    />
                  </td>
                  <td className="admin-note px-6 py-5">
                    <AdminHeroToggle
                      entityId={project.id}
                      entityType="project"
                      isInHero={project.heroOrder !== null}
                      isPublished={project.published}
                      label={project.name}
                    />
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
