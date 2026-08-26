"use client";

import { Children, startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyHeroOrderAction } from "@/features/properties/properties.actions";
import type { Property } from "@/types/property";
import type { ReactNode } from "react";

interface AdminPropertiesTableProps {
  actions?: ReactNode;
  children?: ReactNode;
  properties: Property[];
  title?: string;
}

export function AdminPropertiesTable({
  actions,
  children,
  properties,
  title = "Listado de propiedades",
}: AdminPropertiesTableProps) {
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
              {["Propiedad", "Operación", "Ubicación", "Inicio"].map(
                (column) => (
                  <th
                    key={column}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-sm text-muted" colSpan={4}>
                  No hay propiedades visibles para esta sesion.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr
                  className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                  key={property.id}
                  onClick={() => {
                    router.push(`/admin/propiedades/${property.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/propiedades/${property.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-6 py-5">
                    <p className="font-medium text-foreground">{property.title}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    <span
                      className={
                        property.operationType === "rent"
                          ? "inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700"
                          : "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700"
                      }
                    >
                      {translateOperationType(property.operationType)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {[property.neighborhood, property.city]
                      .filter(Boolean)
                      .join(", ") || "Sin ubicacion"}
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    <HeroOrderSelect property={property} />
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

function HeroOrderSelect({ property }: { property: Property }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(property.heroOrder?.toString() ?? "");
  const [isPending, setIsPending] = useState(false);
  const isUnpublishedWithoutHero = !property.published && property.heroOrder === null;

  useEffect(() => {
    setValue(property.heroOrder?.toString() ?? "");
  }, [property.heroOrder]);

  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      <select
        aria-label={`Posición hero de ${property.title}`}
        className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending || isUnpublishedWithoutHero}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          setIsPending(true);

          startTransition(async () => {
            try {
              await updatePropertyHeroOrderAction(
                property.id,
                nextValue === "" ? null : (Number(nextValue) as 1 | 2 | 3),
              );
              router.refresh();
            } catch {
              setValue(property.heroOrder?.toString() ?? "");
            } finally {
              setIsPending(false);
            }
          });
        }}
        value={value}
      >
        <option value="">—</option>
        {[1, 2, 3].map((option) => {
          const disabled =
            !property.published && property.heroOrder !== option && property.heroOrder !== null;

          return (
            <option disabled={disabled} key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
      {!property.published ? <span className="text-xs text-muted">No publicada</span> : null}
    </div>
  );
}

function translateOperationType(operationType: Property["operationType"]) {
  switch (operationType) {
    case "sale":
      return "Venta";
    case "rent":
      return "Alquiler";
    default:
      return operationType ?? "Sin operación";
  }
}
