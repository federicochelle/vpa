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
      ) : null}
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
