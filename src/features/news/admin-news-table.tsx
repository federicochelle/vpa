"use client";

import { Children } from "react";
import { useRouter } from "next/navigation";
import type { News } from "@/types/news";
import type { ReactNode } from "react";

interface AdminNewsTableProps {
  actions?: ReactNode;
  children?: ReactNode;
  news: News[];
  title?: string;
}

function formatAdminDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminNewsTable({
  actions,
  children,
  news,
  title = "Listado de noticias",
}: AdminNewsTableProps) {
  const router = useRouter();
  const hasVisibleChildren = Children.toArray(children).length > 0;

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
              {["Titulo", "Estado", "Fecha"].map((column) => (
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
            {news.length === 0 ? (
              <tr>
                <td className="admin-note px-6 py-10" colSpan={3}>
                  No hay noticias cargadas todavia.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr
                  className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                  key={item.id}
                  onClick={() => {
                    router.push(`/admin/noticias/${item.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/noticias/${item.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-6 py-5">
                    <p className="font-medium text-foreground">{item.title}</p>
                  </td>
                  <td className="admin-note px-6 py-5">
                    <span className={item.published ? "admin-status-pill" : "type-meta inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-amber-700"}>
                      {item.published ? "Publicada" : "Borrador"}
                    </span>
                  </td>
                  <td className="admin-note px-6 py-5">
                    {formatAdminDate(item.publishedAt ?? item.updatedAt ?? item.createdAt)}
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
