import { Children } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteNewsButton } from "@/features/news/delete-news-button";
import { deleteNewsAction } from "@/features/news/news.actions";
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
  const hasVisibleChildren = Children.toArray(children).length > 0;

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
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
              {["Titulo", "Estado", "Fecha", "Acciones"].map((column) => (
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
            {news.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-sm text-muted" colSpan={4}>
                  No hay noticias cargadas todavia.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-5">
                    <Link
                      className="font-medium text-foreground transition-colors hover:text-primary-strong"
                      href={`/admin/noticias/${item.id}/editar`}
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    <span className={item.published ? "status-pill" : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700"}>
                      {item.published ? "Publicada" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {formatAdminDate(item.publishedAt ?? item.updatedAt ?? item.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Link
                        aria-label="Editar"
                        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
                        href={`/admin/noticias/${item.id}/editar`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 stroke-[2.2]" />
                        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          Editar
                        </span>
                      </Link>
                      <form action={deleteNewsAction}>
                        <input name="id" type="hidden" value={item.id} />
                        <DeleteNewsButton label="Eliminar" />
                      </form>
                    </div>
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
