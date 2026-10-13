"use client";

import { Children } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { AdminHeroToggle } from "@/features/home-hero/admin-hero-toggle";
import { AdminPropertyPublishedToggle } from "@/features/properties/admin-property-published-toggle";
import { formatPublicPropertyMoney } from "@/features/properties/property-public-format";
import { AdminSectionOrderSelect } from "@/features/section-order/admin-section-order-select";
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
              <th className="admin-table-head w-[22rem] px-6 py-4 text-left">
                Propiedad
              </th>
              <th className="admin-table-head w-32 px-4 py-4 text-left">
                Precio
              </th>
              {["Operación", "Zona", "ORDEN", "HOME"].map((column) => (
                <th
                  key={column}
                  className="admin-table-head px-6 py-4 text-left"
                >
                  {column}
                </th>
              ))}
              <th className="admin-table-head px-3 py-4 text-left">
                <span className="inline-flex size-6 items-center justify-center" title="Publicada">
                  <Eye aria-hidden="true" className="size-4" />
                  <span className="sr-only">Publicada</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.length === 0 ? (
              <tr>
                <td className="admin-note px-6 py-10" colSpan={7}>
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
                  <td className="max-w-[22rem] px-6 py-5">
                    <p className="truncate font-medium text-foreground" title={property.title}>
                      {property.title}
                    </p>
                  </td>
                  <td className="admin-note whitespace-nowrap px-4 py-5 font-semibold text-foreground">
                    {formatAdminPropertyPrice(property)}
                  </td>
                  <td className="admin-note px-6 py-5">
                    <span
                      className={
                        property.operationType === "rent"
                          ? "type-meta inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-sky-700"
                          : "type-meta inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-emerald-700"
                      }
                    >
                      {translateOperationType(property.operationType)}
                    </span>
                  </td>
                  <td className="admin-note px-6 py-5">
                    {property.neighborhood ?? "Sin zona"}
                  </td>
                  <td className="admin-note px-6 py-5">
                    <AdminSectionOrderSelect
                      entityId={property.id}
                      entityType="property"
                      key={`${property.id}:${property.sectionOrder ?? "none"}`}
                      label={property.title}
                      sectionOrder={property.sectionOrder}
                    />
                  </td>
                  <td className="admin-note px-6 py-5">
                    <AdminHeroToggle
                      entityId={property.id}
                      entityType="property"
                      isInHero={property.heroOrder !== null}
                      isPublished={Boolean(property.published && property.status === "published")}
                      label={property.title}
                    />
                  </td>
                  <td className="admin-note px-3 py-5">
                    <AdminPropertyPublishedToggle
                      isPublished={Boolean(
                        property.published && property.status === "published",
                      )}
                      label={property.title}
                      propertyId={property.id}
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

function formatAdminPropertyPrice(property: Property) {
  return formatPublicPropertyMoney(property.price, property.currency, "es") ?? "Sin precio";
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
