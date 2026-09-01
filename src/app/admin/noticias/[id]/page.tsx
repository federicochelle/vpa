import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { AdminRecordShell } from "@/components/admin/admin-record-shell";
import { Notice } from "@/components/ui/notice";
import { DeleteNewsButton } from "@/features/news/delete-news-button";
import { deleteNewsAction } from "@/features/news/news.actions";
import { getAdminNewsById } from "@/features/news/news.data";
import { NewsReadOnlyDetails } from "@/features/news/news-read-only-details";

interface AdminNewsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminNewsDetailPage({ params }: AdminNewsDetailPageProps) {
  const { id } = await params;
  const result = await getAdminNewsById(id);

  if (!result.ok && result.error) {
    return <AdminRecordShell title="Detalle de noticia"><Notice message={`Supabase devolvio un error al cargar la noticia: ${result.error.message}`} tone="error" /></AdminRecordShell>;
  }

  if (!result.data) {
    notFound();
  }

  return (
    <AdminRecordShell
      actions={<><Link className="admin-button-secondary text-primary-strong" href="/admin/noticias">Volver al listado</Link><Link aria-label="Editar" className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong" href={`/admin/noticias/${id}/editar`} title="Editar"><Pencil className="h-4 w-4 stroke-[2.2]" /></Link><form action={deleteNewsAction}><input name="id" type="hidden" value={id} /><DeleteNewsButton label="Eliminar noticia" /></form></>}
      title={result.data.title}
    >
      <NewsReadOnlyDetails news={result.data} />
    </AdminRecordShell>
  );
}
