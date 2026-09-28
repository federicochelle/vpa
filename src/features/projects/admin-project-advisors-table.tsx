"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { ProjectAdvisor } from "@/types/project";

interface AdminProjectAdvisorsTableProps {
  actions?: ReactNode;
  advisors: ProjectAdvisor[];
  children?: ReactNode;
  title?: string;
}

export function AdminProjectAdvisorsTable({
  actions,
  advisors,
  children,
  title = "Listado de asesores",
}: AdminProjectAdvisorsTableProps) {
  const router = useRouter();

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
      {children ? (
        <div className="space-y-6 border-b border-border p-6 sm:p-8">{children}</div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {["Foto", "Nombre", "Teléfono", "Email", "Acciones"].map(
                (column) => (
                  <th key={column} className="admin-table-head px-6 py-4 text-left">
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {advisors.length === 0 ? (
              <tr>
                <td className="admin-note px-6 py-10" colSpan={5}>
                  Todavía no hay asesores cargados.
                </td>
              </tr>
            ) : (
              advisors.map((advisor) => (
                <tr
                  className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                  key={advisor.id}
                  onClick={() => {
                    router.push(`/admin/asesores/${advisor.id}/editar`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/asesores/${advisor.id}/editar`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-6 py-5">
                    <div className="relative h-12 w-12 overflow-hidden border border-primary/15 bg-primary/6">
                      {advisor.photoUrl ? (
                        <Image
                          alt={advisor.name}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={advisor.photoUrl}
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-base text-primary-strong">
                          {advisor.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-medium text-foreground">{advisor.name}</p>
                  </td>
                  <td className="admin-note px-6 py-5">{advisor.phone || "-"}</td>
                  <td className="admin-note px-6 py-5">{advisor.email || "-"}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        aria-label={`Editar asesor ${advisor.name}`}
                        className="inline-flex size-10 items-center justify-center border border-border bg-white text-muted transition-colors hover:border-primary/30 hover:text-primary-strong"
                        href={`/admin/asesores/${advisor.id}/editar`}
                        onClick={(event) => event.stopPropagation()}
                        title="Editar asesor"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
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
