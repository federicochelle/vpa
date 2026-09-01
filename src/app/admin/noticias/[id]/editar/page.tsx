import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
import { DeleteNewsButton } from "@/features/news/delete-news-button";
import { deleteNewsAction } from "@/features/news/news.actions";
import { NewsForm } from "@/features/news/news-form";
import { getAdminNewsById } from "@/features/news/news.data";

interface AdminEditNewsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminEditNewsPage({
  params,
  searchParams,
}: AdminEditNewsPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getAdminNewsById(id);

  if (!result.ok && result.error) {
    return (
      <>
        <PageIntro
          actions={
            <Link
              className="admin-button-secondary text-primary-strong"
              href="/admin/noticias"
            >
              Volver al listado
            </Link>
          }
          description="La lectura de este registro devolvio un error desde Supabase."
          eyebrow="Admin noticias"
          title="Editar noticia"
        />
        <Notice
          message={`Supabase devolvio un error al cargar la noticia: ${result.error.message}`}
          tone="error"
        />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      {query.error ? (
        <AdminFeedbackModal message={query.error} title="No pudimos guardar la noticia" variant="error" />
      ) : null}
    <AdminRecordShell
      className="admin-form-panel"
      actions={
          <>
            <Link
              className="admin-button-secondary text-primary-strong"
              href="/admin/noticias"
            >
              Volver al listado
            </Link>
            <form action={deleteNewsAction}>
              <input name="id" type="hidden" value={result.data.id} />
              <DeleteNewsButton label="Eliminar noticia" />
            </form>
          </>
        }
        title={`Editar: ${result.data.title}`}
      >
        <NewsForm news={result.data} submitLabel="Guardar cambios" />
      </AdminRecordShell>
    </>
  );
}
