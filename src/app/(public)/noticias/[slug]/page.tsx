import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { formatNewsDate } from "@/features/news/news.utils";
import { getPublishedNewsBySlug } from "@/features/news/news.data";
import {
  buildAbsoluteUrl,
  createNotFoundSeoMetadata,
  createSeoMetadata,
  getFallbackSeoImage,
} from "@/lib/seo";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getNewsBySlug = cache(getPublishedNewsBySlug);

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return createNotFoundSeoMetadata("Noticia no encontrada");
  }

  const image = news.imageUrl
    ? {
        url: buildAbsoluteUrl(news.imageUrl),
        alt: news.title,
      }
    : getFallbackSeoImage(news.title);

  return createSeoMetadata({
    title: news.title,
    description: news.excerpt ?? news.content,
    path: `/noticias/${news.slug}`,
    image,
    type: "article",
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="-mx-4 space-y-4 sm:mx-0">
          <div className="panel overflow-hidden !rounded-none">
            <div className="space-y-5 brand-panel-header px-6 py-6 sm:px-8 lg:px-12">
              <h1 className="max-w-4xl font-display text-[1.75rem] leading-tight text-foreground sm:text-4xl">
                {news.title}
              </h1>
              {news.excerpt ? (
                <p className="section-copy max-w-3xl">
                  {news.excerpt}
                </p>
              ) : null}
              <p className="type-body-compact uppercase tracking-[0.16em] text-muted">
                {formatNewsDate(news.publishedAt ?? news.createdAt)}
              </p>
            </div>
          </div>

          <div
            className="aspect-[16/9] overflow-hidden border-y border-border brand-media-fallback bg-cover bg-center sm:border"
            style={news.imageUrl ? { backgroundImage: `url(${news.imageUrl})` } : undefined}
          />

          <div className="panel !rounded-none px-6 py-8 sm:px-8 lg:px-12">
            <article>
              <div className="section-copy max-w-3xl space-y-6">
                {(news.content ?? "")
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${news.id}-paragraph-${index}`}>{paragraph}</p>
                  ))}
              </div>
            </article>
          </div>
        </div>
        <aside className="-mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-auto lg:sticky lg:top-24 lg:self-start">
          <PublicInquirySidebar
            initialMessage={`Hola, leí la noticia "${news.title}" y quisiera recibir más información.`}
            kind="general"
            originPath={`/noticias/${news.slug}`}
            relatedTitle={news.title}
          />
        </aside>
      </section>
    </div>
  );
}
