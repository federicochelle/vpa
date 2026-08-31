import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { Notice } from "@/components/ui/notice";
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
    <div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
          <div className="space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Editar: {result.data.title}
            </h4>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          {query.error ? <Notice message={query.error} tone="error" /> : null}
          <NewsForm news={result.data} submitLabel="Guardar cambios" />
        </div>
      </div>
    </div>
  );
}
