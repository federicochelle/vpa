import Image from "next/image";
import { AdminReadOnlyField } from "@/components/admin/admin-read-only-field";
import type { News } from "@/types/news";

export function NewsReadOnlyDetails({ news }: { news: News }) {
  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-6">
        <div className="flex flex-col gap-5 xl:col-span-3">
          <AdminReadOnlyField label="Titulo" value={news.title} />
          <AdminReadOnlyField className="min-h-32" label="Bajada" multiline value={news.excerpt ?? ""} />
        </div>
        <div className="space-y-3 xl:col-span-3">
          <div className="overflow-hidden border border-border bg-white">
            <div className="relative aspect-[4/3] bg-surface-muted">
              {news.imageUrl ? <Image alt={news.title} className="object-cover" fill sizes="(min-width: 1280px) 30rem, (min-width: 640px) 50vw, 100vw" src={news.imageUrl} unoptimized /> : <p className="type-body-compact flex h-full items-center justify-center text-muted">—</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6"><AdminReadOnlyField className="min-h-72" label="Contenido" multiline value={news.content ?? ""} /></div>
    </div>
  );
}
