"use client";

import { useRouter } from "next/navigation";
import type { Inquiry } from "@/types/inquiry";

interface AdminInquiriesTableProps {
  inquiries: Inquiry[];
}

function formatInquiryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function AdminInquiriesTable({
  inquiries,
}: AdminInquiriesTableProps) {
  const router = useRouter();

  if (inquiries.length === 0) {
    return (
      <section className="panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Listado de consultas
          </h1>
        </div>
        <div className="px-6 py-10 sm:px-8 lg:px-12">
          <p className="text-sm leading-7 text-muted">
            Todavía no ingresaron consultas desde la web pública.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Listado de consultas
        </h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {["Fecha", "Nombre", "Telefono", "Propiedad/Proyecto"].map(
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
          <tbody className="divide-y divide-border bg-white">
            {inquiries.map((inquiry) => (
              <tr
                className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                key={inquiry.id}
                onClick={() => {
                  router.push(`/admin/consultas/${inquiry.id}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/admin/consultas/${inquiry.id}`);
                  }
                }}
                tabIndex={0}
              >
                <td className="px-6 py-4 text-sm text-muted">
                  {formatInquiryDate(inquiry.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {inquiry.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted">
                  {inquiry.phone || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-muted">
                  {inquiry.relatedTitle || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
