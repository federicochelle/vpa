import { Notice } from "@/components/ui/notice";
import { NewsForm } from "@/features/news/news-form";

interface AdminNewNewsPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminNewNewsPage({
  searchParams,
}: AdminNewNewsPageProps) {
  const params = await searchParams;

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
          <div className="space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Nueva noticia
            </h4>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          {params.error ? <Notice message={params.error} tone="error" /> : null}
          <NewsForm submitLabel="Crear noticia" />
        </div>
      </div>
    </div>
  );
}
