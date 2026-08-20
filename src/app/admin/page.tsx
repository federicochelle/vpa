import Link from "next/link";
import { Notice } from "@/components/ui/notice";
import { formatInquiryStatus, listAdminInquiries } from "@/features/inquiries/inquiries.data";

function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "Fecha pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const inquiriesResult = await listAdminInquiries();

  const latestInquiries = inquiriesResult.ok ? inquiriesResult.data.slice(0, 5) : [];

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
        <div className="space-y-4">
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Bienvenida al panel administrativo
          </h1>
        </div>
      </div>

      <div className="space-y-10 p-6 sm:p-8">
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Últimas consultas
            </h2>
          </div>

          {!inquiriesResult.ok ? (
            <Notice message={inquiriesResult.error ?? "No se pudieron cargar las consultas."} tone="error" />
          ) : latestInquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-strong px-6 py-10 text-center text-sm text-muted">
              Todavía no hay consultas registradas.
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_140px] gap-4 border-b border-border bg-surface-strong px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:grid">
                <span>Nombre</span>
                <span>Relacionado</span>
                <span>Fecha</span>
                <span>Estado</span>
              </div>

              <div className="divide-y divide-border">
                {latestInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    className="block bg-white px-5 py-4 transition-colors hover:bg-surface-strong"
                    href={`/admin/consultas/${inquiry.id}`}
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_140px] lg:items-center lg:gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
                          Nombre
                        </p>
                        <p className="text-sm font-semibold text-foreground">{inquiry.name}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
                          Relacionado
                        </p>
                        <p className="text-sm text-muted">
                          {inquiry.relatedTitle ?? "Consulta general"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
                          Fecha
                        </p>
                        <p className="text-sm text-muted">{formatAdminDate(inquiry.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
                          Estado
                        </p>
                        <span className="inline-flex rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-strong">
                          {formatInquiryStatus(inquiry.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex justify-end">
                <Link
                  className="inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
                  href="/admin/consultas"
                >
                  Ver todas las consultas
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
