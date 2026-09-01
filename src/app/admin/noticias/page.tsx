import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { AdminNewsTable } from "@/features/news/admin-news-table";
import { listAdminNews } from "@/features/news/news.data";

interface AdminNewsPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
    success?: string;
    updated?: string;
  }>;
}

export default async function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const params = await searchParams;
  const result = await listAdminNews();

  return (
    <>
      {params.created ? (
        <AdminFeedbackModal message={params.created} title="Noticia creada" variant="success" />
      ) : null}
      {params.updated ? (
        <AdminFeedbackModal message={params.updated} title="Noticia actualizada" variant="success" />
      ) : null}
      {params.success ? (
        <AdminFeedbackModal message={params.success} title="Operación completada" variant="success" />
      ) : null}
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos completar la acción" variant="error" />
      ) : null}
      <AdminNewsTable
        actions={
          <Link
            className="admin-button-primary inline-flex items-center gap-2 font-bold"
            href="/admin/noticias/nueva"
          >
            <Plus className="h-4 w-4 stroke-[2.4] text-white" />
            <span className="text-white">Nueva noticia</span>
          </Link>
        }
        news={result.data}
      >
        {!result.ok && result.error ? (
          <Notice
            message={`Supabase devolvio un error al listar noticias: ${result.error.message}`}
            tone="error"
          />
        ) : null}
      </AdminNewsTable>
    </>
  );
}
