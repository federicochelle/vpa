import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { Notice } from "@/components/ui/notice";
import { updateInquiryStatusAction } from "@/features/inquiries/inquiries.actions";
import { AdminInquiryStatusForm } from "@/features/inquiries/admin-inquiry-status-form";
import { getAdminInquiryById } from "@/features/inquiries/inquiries.data";
import type { InquiryKind } from "@/types/inquiry";

interface AdminInquiryDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

function formatInquiryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function isOriginPathPublic(path: string | null) {
  return typeof path === "string" && path.startsWith("/");
}

function formatInquiryOrigin(kind: InquiryKind, originPath: string | null) {
  if (originPath?.startsWith("/comprar/")) {
    return "Venta";
  }

  if (originPath?.startsWith("/alquileres/")) {
    return "Alquiler";
  }

  if (originPath?.startsWith("/inversion/")) {
    return "Proyecto";
  }

  if (kind === "general") {
    return "Asesoramiento";
  }

  if (kind === "project") {
    return "Proyecto";
  }

  return "Venta";
}

export default async function AdminInquiryDetailPage({
  params,
  searchParams,
}: AdminInquiryDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getAdminInquiryById(id);

  if (!result.ok && result.error) {
    return (
      <AdminRecordShell title="Detalle de consulta">
        <Notice message={result.error} tone="error" />
      </AdminRecordShell>
    );
  }

  if (!result.data) {
    notFound();
  }

  const inquiry = result.data;

  return (
    <AdminRecordShell
      actions={
        <AdminInquiryStatusForm
          action={updateInquiryStatusAction}
          inquiryId={inquiry.id}
          status={inquiry.status}
        />
      }
      subtitle={<p className="text-sm text-muted">{formatInquiryDate(inquiry.createdAt)}</p>}
      title={inquiry.name}
    >
      {query.error ? <Notice message={query.error} tone="error" /> : null}
      {query.success ? <Notice message={query.success} tone="success" /> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Origen
                </p>
                <p className="text-sm text-foreground">
                  {formatInquiryOrigin(inquiry.kind, inquiry.originPath)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Propiedad / Proyecto relacionado
                </p>
                {inquiry.relatedTitle ? (
                  (() => {
                    const publicOriginPath = isOriginPathPublic(inquiry.originPath)
                      ? inquiry.originPath
                      : null;

                    return publicOriginPath ? (
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-strong transition-colors hover:text-primary"
                        href={publicOriginPath}
                        target="_blank"
                      >
                        {inquiry.relatedTitle}
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    ) : (
                      <p className="text-sm text-foreground">{inquiry.relatedTitle}</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-foreground">-</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Mensaje
                </p>
                <p className="text-sm leading-7 text-foreground">{inquiry.message}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:border-l lg:border-border lg:pl-8">
          <section className="space-y-5">
            <div className="space-y-5">
              <h2 className="text-2xl font-display text-primary-strong">Datos de contacto</h2>
              <div className="space-y-4 text-sm text-foreground">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Nombre
                  </p>
                  <p>{inquiry.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Email
                  </p>
                  <p>{inquiry.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Teléfono
                  </p>
                  <p>{inquiry.phone || "-"}</p>
                </div>
              </div>
              <button
                className="w-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
                type="button"
              >
                Coordinar reunion
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminRecordShell>
  );
}
