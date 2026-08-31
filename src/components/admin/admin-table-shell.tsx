import type { ReactNode } from "react";

interface AdminTableShellProps {
  actions?: ReactNode;
  columns: string[];
  title?: string;
}

export function AdminTableShell({
  actions,
  columns,
  title,
}: AdminTableShellProps) {
  return (
    <section className="panel overflow-hidden">
      {title ? (
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
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="admin-table-head px-6 py-4 text-left"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="admin-note px-6 py-10" colSpan={columns.length}>
                Sin registros todavia. La tabla queda lista para conectarse a una fuente de datos real.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
