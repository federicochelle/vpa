import type { ReactNode } from "react";

interface AdminTableShellProps {
  columns: string[];
  emptyTitle: string;
  emptyDescription: string;
  actions?: ReactNode;
}

export function AdminTableShell({
  columns,
  emptyTitle,
  emptyDescription,
  actions,
}: AdminTableShellProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{emptyTitle}</h2>
          <p className="mt-1 text-sm text-muted">{emptyDescription}</p>
        </div>
        {actions}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-10 text-sm text-muted" colSpan={columns.length}>
                Sin registros todavia. La tabla queda lista para conectarse a una fuente de datos real.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
