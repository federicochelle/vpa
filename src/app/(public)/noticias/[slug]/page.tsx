import { notFound } from "next/navigation";
import { PublicInquirySidebar } from "@/components/inquiries/public-inquiry-sidebar";
import { formatNewsDate } from "@/features/news/news.utils";
import { getPublishedNewsBySlug } from "@/features/news/news.data";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getPublishedNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  return (
    <div className="shell section-gap !pt-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-4">
          <div className="panel overflow-hidden !rounded-none">
            <div className="space-y-5 bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-6 sm:px-8 lg:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Noticias
              </p>
              <h1 className="max-w-4xl font-display text-3xl leading-tight text-foreground sm:text-4xl">
                {news.title}
              </h1>
              {news.excerpt ? (
                <p className="max-w-3xl text-base leading-7 text-muted">
                  {news.excerpt}
                </p>
              ) : null}
              <p className="text-sm uppercase tracking-[0.16em] text-muted">
                {formatNewsDate(news.publishedAt ?? news.createdAt)}
              </p>
            </div>
          </div>

          <div
            className="aspect-[16/9] overflow-hidden border border-border bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
            style={news.imageUrl ? { backgroundImage: `url(${news.imageUrl})` } : undefined}
          />

          <div className="panel !rounded-none px-6 py-8 sm:px-8 lg:px-12">
            <article>
              <div className="max-w-3xl space-y-6 text-base leading-8 text-muted">
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
        <aside className="lg:sticky lg:top-24 lg:self-start">
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
