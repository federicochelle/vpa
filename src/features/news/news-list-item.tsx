import Image from "next/image";
import Link from "next/link";
import type { News } from "@/types/news";
import { formatNewsDate } from "@/features/news/news.utils";
import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";

interface NewsListItemProps {
  news: News;
}

export async function NewsListItem({ news }: NewsListItemProps) {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <Link
      className="group block overflow-hidden bg-white ring-1 ring-black/4 transition-transform duration-200 hover:-translate-y-0.5"
      href={`/noticias/${news.slug}`}
    >
      <article className="grid md:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] md:items-stretch">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {news.imageUrl ? (
            <Image
              alt={news.title}
              className="object-cover object-center"
              fill
              sizes="(min-width: 768px) 38vw, 100vw"
              src={news.imageUrl}
            />
          ) : (
            <div className="h-full w-full brand-media-fallback" />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center space-y-4 px-5 py-5 sm:px-6 sm:py-6 md:px-8">
          <div className="space-y-2">
            <p className="font-display text-[10px] font-medium normal-case tracking-[0.16em] text-foreground">
              {formatNewsDate(news.publishedAt ?? news.createdAt, locale) ?? t("news.pendingDate")}
            </p>
            <h2 className="font-display text-[1.35rem] leading-tight text-primary transition-colors group-hover:text-primary-strong sm:text-[1.7rem]">
              {news.title}
            </h2>
          </div>
          <p className="type-body max-w-3xl text-muted">
            {news.excerpt ?? t("news.defaultExcerpt")}
          </p>
          <span className="type-body-compact font-display inline-flex items-center font-semibold uppercase tracking-[0.14em] text-primary transition-colors group-hover:text-primary-strong">
            {t("news.readMore")}
          </span>
        </div>
      </article>
    </Link>
  );
}
