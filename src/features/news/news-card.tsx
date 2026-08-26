import Link from "next/link";
import type { News } from "@/types/news";
import { formatNewsDate } from "@/features/news/news.utils";

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      className="block overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
      href={`/noticias/${news.slug}`}
    >
      <article>
        <div
          className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
          style={news.imageUrl ? { backgroundImage: `url(${news.imageUrl})` } : undefined}
        />
        <div className="space-y-4 p-5">
          <div className="space-y-3">
            <h2 className="font-display text-2xl leading-tight text-primary transition-colors hover:text-primary-strong">
              {news.title}
            </h2>
            <p className="font-display text-[10px] font-medium normal-case tracking-[0.16em] text-foreground">
              {formatNewsDate(news.publishedAt ?? news.createdAt)}
            </p>
            <p className="text-sm leading-7 text-muted">
              {news.excerpt ?? "Esta noticia ya está disponible para leer completa."}
            </p>
          </div>
          <span className="font-display inline-flex items-center text-sm font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary-strong">
            Leer más
          </span>
        </div>
      </article>
    </Link>
  );
}
