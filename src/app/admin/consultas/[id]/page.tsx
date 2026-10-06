import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { Notice } from "@/components/ui/notice";
import { updateInquiryStatusAction } from "@/features/inquiries/inquiries.actions";
import { AdminInquiryMeetingPanel } from "@/features/inquiries/admin-inquiry-meeting-panel";
import { AdminInquiryStatusForm } from "@/features/inquiries/admin-inquiry-status-form";
import { getAdminInquiryById } from "@/features/inquiries/inquiries.data";
import {
  getRealInquiryContactEmail,
  isOwnerLeadTechnicalEmail,
} from "@/features/inquiries/inquiry-contact";
import type { Inquiry, InquiryIntent, InquiryKind } from "@/types/inquiry";

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

function formatInquiryIntent(intent: InquiryIntent | null) {
  switch (intent) {
    case "valuation":
      return "Tasación";
    case "sell":
      return "Venta";
    case "investment":
      return "Consultoría de inversión";
    case "professional_report":
      return "Informe profesional";
    case "advisory":
      return "Asesoramiento";
    case "contact":
      return "Contacto";
    case "general":
    default:
      return null;
  }
}

function hasConcreteRelatedEntity(inquiry: {
  kind: InquiryKind;
  originPath: string | null;
  projectId: string | null;
  projectUnitId: string | null;
  propertyId: string | null;
  relatedTitle: string | null;
}) {
  if (inquiry.kind === "property") {
    return Boolean(inquiry.propertyId) || Boolean(inquiry.relatedTitle);
  }

  if (inquiry.kind === "project") {
    return Boolean(inquiry.projectId) || Boolean(inquiry.relatedTitle);
  }

  if (inquiry.kind === "project_unit") {
    return Boolean(inquiry.projectUnitId) || Boolean(inquiry.relatedTitle);
  }

  return Boolean(inquiry.relatedTitle && inquiry.originPath?.startsWith("/noticias/"));
}

function parseOwnerLeadMessage(message: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage.startsWith("Formulario propietarios")) {
    return null;
  }

  const propertyTypeMatch = trimmedMessage.match(/Tipo de propiedad:\s*(.+?)(?=\s+Zona:|$)/);
  const zoneMatch = trimmedMessage.match(/Zona:\s*(.+)$/);
  const propertyType = propertyTypeMatch?.[1]?.trim() ?? "";
  const zone = zoneMatch?.[1]?.trim() ?? "";

  if (!propertyType || !zone) {
    return null;
  }

  return {
    propertyType,
    zone,
  };
}

function formatLeadSource(source: string | null) {
  const trimmedSource = source?.trim();

  if (!trimmedSource || trimmedSource.toLowerCase() === "public_web") {
    return null;
  }

  return trimmedSource
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getGeneralInquiryFormLabel(inquiry: Inquiry) {
  const message = inquiry.message.trim();

  if (message.startsWith("Formulario propietarios")) {
    return "Formulario de propietarios";
  }

  if (inquiry.intent === "contact" || inquiry.originPath === "/contacto") {
    return "Formulario de contacto";
  }

  if (
    inquiry.intent === "advisory" ||
    inquiry.intent === "valuation" ||
    inquiry.intent === "sell" ||
    inquiry.intent === "investment" ||
    inquiry.intent === "professional_report" ||
    inquiry.originPath === "/asesoramiento"
  ) {
    return "Formulario de asesoramiento";
  }

  return "Formulario web";
}

function getInquiryPageOrForm(inquiry: Inquiry) {
  const hasRelatedEntity = hasConcreteRelatedEntity(inquiry);
  const publicOriginPath = isOriginPathPublic(inquiry.originPath) ? inquiry.originPath : null;

  if (hasRelatedEntity) {
    if (inquiry.kind === "property" && !inquiry.propertyId) {
      return { href: null, label: "Propiedad eliminada" };
    }

    if (inquiry.relatedTitle) {
      return {
        href: publicOriginPath,
        label: inquiry.relatedTitle,
      };
    }
  }

  return {
    href: null,
    label: getGeneralInquiryFormLabel(inquiry),
  };
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
      <AdminRecordShell title="Datos de la consulta">
        <Notice message={result.error} tone="error" />
      </AdminRecordShell>
    );
  }

  if (!result.data) {
    notFound();
  }

  const inquiry = result.data;
  const motiveLabel = formatInquiryIntent(inquiry.intent) ?? formatInquiryOrigin(inquiry.kind, inquiry.originPath);
  const pageOrForm = getInquiryPageOrForm(inquiry);
  const contactName = inquiry.name.trim();
  const contactEmail = getRealInquiryContactEmail(inquiry) ?? "";
  const contactPhone = inquiry.phone?.trim() ?? "";
  const phoneLabel = isOwnerLeadTechnicalEmail(inquiry) ? "WhatsApp" : "Teléfono";
  const ownerLeadMessage = parseOwnerLeadMessage(inquiry.message);
  const leadSource = formatLeadSource(inquiry.source);

  return (
    <AdminRecordShell
      actions={
        <AdminInquiryStatusForm
          action={updateInquiryStatusAction}
          inquiryId={inquiry.id}
          status={inquiry.status}
        />
      }
      stackActionsOnMobile
      subtitle={<p className="type-body-compact text-muted">{formatInquiryDate(inquiry.createdAt)}</p>}
      title="Datos de la consulta"
    >
      {query.error ? <Notice message={query.error} tone="error" /> : null}
      {query.success ? <Notice message={query.success} tone="success" /> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="space-y-4 type-body-compact text-foreground">
            {contactName ? (
              <div className="space-y-1">
                <p className="type-meta font-semibold uppercase tracking-[0.16em] text-muted">
                  Nombre
                </p>
                <p>{contactName}</p>
              </div>
            ) : null}
            {contactEmail ? (
              <div className="space-y-1">
                <p className="type-meta font-semibold uppercase tracking-[0.16em] text-muted">
                  Email
                </p>
                <p>{contactEmail}</p>
              </div>
            ) : null}
            {contactPhone ? (
              <div className="space-y-1">
                <p className="type-meta font-semibold uppercase tracking-[0.16em] text-muted">
                  {phoneLabel}
                </p>
                <p>{contactPhone}</p>
              </div>
            ) : null}
          </section>

          <section className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="type-meta font-semibold uppercase tracking-[0.18em] text-muted">
                  Motivo
                </p>
                <p className="type-body-compact text-foreground">
                  {motiveLabel}
                </p>
              </div>

              <div className="space-y-2">
                <p className="type-meta font-semibold uppercase tracking-[0.18em] text-muted">
                  Página / Formulario
                </p>
                {pageOrForm.href ? (
                  <Link
                    className="type-body-compact inline-flex items-center gap-2 font-semibold text-primary-strong transition-colors hover:text-primary"
                    href={pageOrForm.href}
                    target="_blank"
                  >
                    {pageOrForm.label}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <p className="type-body-compact text-foreground">{pageOrForm.label}</p>
                )}
              </div>

              {ownerLeadMessage ? (
                <>
                  <div className="space-y-2">
                    <p className="type-meta font-semibold uppercase tracking-[0.18em] text-muted">
                      Tipo de propiedad
                    </p>
                    <p className="type-body-compact text-foreground">{ownerLeadMessage.propertyType}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="type-meta font-semibold uppercase tracking-[0.18em] text-muted">
                      Zona
                    </p>
                    <p className="type-body-compact text-foreground">{ownerLeadMessage.zone}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="type-meta font-semibold uppercase tracking-[0.18em] text-muted">
                    Mensaje / datos adicionales
                  </p>
                  <p className="type-body text-foreground">{inquiry.message}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:border-l lg:border-border lg:pl-8">
          <section className="space-y-5">
            <div className="space-y-5">
              <AdminInquiryMeetingPanel inquiry={inquiry} />
              {leadSource ? (
                <section className="space-y-5 border-t border-border pt-5">
                  <h2 className="text-2xl font-display text-primary-strong">
                    Origen de la consulta
                  </h2>
                  <div className="space-y-4 type-body-compact text-foreground">
                    <div className="space-y-1">
                      <p className="type-meta font-semibold uppercase tracking-[0.16em] text-muted">
                        Origen
                      </p>
                      <p className="break-words">{leadSource}</p>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </AdminRecordShell>
  );
}
