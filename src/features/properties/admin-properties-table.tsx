import Link from "next/link";
import {
  deletePropertyAction,
  togglePropertyPublishedAction,
} from "@/features/properties/properties.actions";
import type { Property } from "@/types/property";

interface AdminPropertiesTableProps {
  properties: Property[];
}

export function AdminPropertiesTable({
  properties,
}: AdminPropertiesTableProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {["Propiedad", "Estado", "Operacion", "Ubicacion", "Acciones"].map(
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
                <td className="px-6 py-10 text-sm text-muted" colSpan={5}>
                  No hay propiedades visibles para esta sesion.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id}>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-sm text-muted">{property.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    <div className="space-y-1">
                      <p>
                        <span className="status-pill">{property.status ?? "Sin estado"}</span>
                      </p>
                      <p className={property.published ? "text-primary-strong" : ""}>
                        {property.published ? "Publicada" : "No publicada"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {property.operationType}
                  </td>
                  <td className="px-6 py-5 text-sm text-muted">
                    {[property.neighborhood, property.city]
                      .filter(Boolean)
                      .join(", ") || "Sin ubicacion"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
                        href={`/admin/propiedades/${property.id}/editar`}
                      >
                        Editar
                      </Link>
                      <form action={togglePropertyPublishedAction}>
                        <input name="id" type="hidden" value={property.id} />
                        <input
                          name="published"
                          type="hidden"
                          value={property.published ? "false" : "true"}
                        />
                        <button
                          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
                          type="submit"
                        >
                          {property.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>
                      <form action={deletePropertyAction}>
                        <input name="id" type="hidden" value={property.id} />
                        <button
                          className="rounded-full border border-primary/20 bg-primary/6 px-4 py-2 text-sm font-medium text-primary-strong transition-colors hover:bg-primary/10"
                          type="submit"
                        >
                          Eliminar
                        </button>
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
