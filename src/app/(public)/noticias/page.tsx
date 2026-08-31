import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedNewsPage } from "@/features/news/news.data";
import { NewsListItem } from "@/features/news/news-list-item";

interface NewsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

function parsePage(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildNewsPageHref(page: number) {
  return page <= 1 ? "/noticias?page=1" : `/noticias?page=${page}`;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const result = await listPublishedNewsPage({
    page: requestedPage,
    pageSize: 5,
  });
  const news = result.data;

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="shell space-y-10">
        <div className="space-y-3">
          <p className="type-body-compact font-semibold uppercase tracking-[0.28em] text-primary">
            Noticias
          </p>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            Actualidad y contenido de interés
          </h1>
        </div>

        {news.length > 0 ? (
          <>
            <div className="-mx-4 w-[calc(100%+2rem)] space-y-4 sm:mx-0 sm:w-auto sm:space-y-10">
              {news.map((item) => (
                <NewsListItem key={item.id} news={item} />
              ))}
            </div>

            {result.totalPages > 1 ? (
              <nav
                aria-label="Paginacion de noticias"
                className="flex flex-wrap items-center justify-center gap-3 pt-2"
              >
                {result.page > 1 ? (
                  <a
                    className="button-secondary inline-flex min-w-24 items-center justify-center px-4 py-2"
                    href={buildNewsPageHref(result.page - 1)}
                  >
                    Anterior
                  </a>
                ) : (
                  <span className="type-button inline-flex min-w-24 items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-muted">
                    Anterior
                  </span>
                )}

                {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((page) => (
                  <a
                    key={page}
                    aria-current={page === result.page ? "page" : undefined}
                    className={`type-button inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                      page === result.page
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-foreground hover:border-primary/20 hover:text-primary-strong"
                    }`}
                    href={buildNewsPageHref(page)}
                  >
                    {page}
                  </a>
                ))}

                {result.page < result.totalPages ? (
                  <a
                    className="button-secondary inline-flex min-w-24 items-center justify-center px-4 py-2"
                    href={buildNewsPageHref(result.page + 1)}
                  >
                    Siguiente
                  </a>
                ) : (
                  <span className="type-button inline-flex min-w-24 items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-muted">
                    Siguiente
                  </span>
                )}
              </nav>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Todavía no hay noticias publicadas"
            description="La sección quedó lista para mostrar las novedades cuando se publiquen desde el panel admin."
          />
        )}
      </div>
    </section>
  );
}
