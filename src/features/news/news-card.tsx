import Image from "next/image";
import Link from "next/link";
import type { News } from "@/types/news";
import { formatNewsDate } from "@/features/news/news.utils";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";

interface NewsCardProps {
  news: News;
}

export async function NewsCard({ news }: NewsCardProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <Link
      className="block overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
      href={`/noticias/${news.slug}`}
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {news.imageUrl ? (
            <Image
              alt={news.title}
              className="object-cover object-center"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              src={news.imageUrl}
            />
          ) : (
            <div className="h-full w-full brand-media-fallback" />
          )}
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-3">
            <h2 className="font-display text-[1.35rem] leading-tight text-primary transition-colors hover:text-primary-strong">
              {news.title}
            </h2>
            <p className="font-display text-[10px] font-medium normal-case tracking-[0.16em] text-foreground">
              {formatNewsDate(news.publishedAt ?? news.createdAt, locale) ?? t("news.pendingDate")}
            </p>
            <p className="type-body text-muted">
              {news.excerpt ?? t("news.defaultExcerpt")}
            </p>
          </div>
          <span className="type-body-compact font-display inline-flex items-center font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary-strong">
            {t("news.readMore")}
          </span>
        </div>
      </article>
    </Link>
  );
}
