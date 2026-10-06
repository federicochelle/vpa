"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatusInlineAction } from "@/features/inquiries/inquiries.actions";
import type { Inquiry } from "@/types/inquiry";

interface AdminInquiriesTableProps {
  inquiries: Inquiry[];
}

const INQUIRY_STATUS_OPTIONS: Array<{ label: string; value: Inquiry["status"] }> = [
  { label: "Nueva", value: "new" },
  { label: "Contactada", value: "contacted" },
  { label: "Cerrada", value: "closed" },
];

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

function getRelatedEntityLabel(inquiry: Inquiry) {
  if (inquiry.kind === "property" && !inquiry.propertyId) {
    return "Propiedad eliminada";
  }

  return inquiry.relatedTitle || "-";
}

function InquiryStatusSelect({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: Inquiry["status"];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      action={updateInquiryStatusInlineAction}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      ref={formRef}
    >
      <input name="id" type="hidden" value={inquiryId} />
      <select
        aria-label="Estado de consulta"
        className="admin-input-base h-10 min-w-[150px] rounded-none px-3 py-2 text-sm"
        defaultValue={status}
        name="status"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {INQUIRY_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}

export function AdminInquiriesTable({
  inquiries,
}: AdminInquiriesTableProps) {
  const router = useRouter();

  if (inquiries.length === 0) {
    return (
      <section className="panel overflow-hidden">
        <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
          <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
            Listado de consultas
          </h4>
        </div>
        <div className="px-6 py-10 sm:px-8 lg:px-12">
          <p className="admin-copy text-muted">
            Todavía no ingresaron consultas desde la web pública.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
        <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
          Listado de consultas
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted/70">
            <tr>
              {["Fecha", "Nombre", "Telefono", "Propiedad/Proyecto", "Estado"].map(
                (column) => (
                  <th
                    key={column}
                    className="admin-table-head px-6 py-4 text-left"
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
                <td className="admin-note px-6 py-4">
                  {formatInquiryDate(inquiry.createdAt)}
                </td>
                <td className="type-body-compact px-6 py-4 font-medium text-foreground">
                  {inquiry.name}
                </td>
                <td className="admin-note px-6 py-4">
                  {inquiry.phone || "-"}
                </td>
                <td className="admin-note px-6 py-4">
                  {getRelatedEntityLabel(inquiry)}
                </td>
                <td className="admin-note px-6 py-4">
                  <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
