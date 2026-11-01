"use client";

import { ChevronLeft, ChevronRight, Quote, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { reviews, type Review } from "@/data/reviews";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import { shuffle } from "@/lib/shuffle";

// Por encima de este largo el texto se recorta a 6 renglones y aparece "Ver más".
const LONG_REVIEW_LENGTH = 220;
const SCROLL_EDGE_TOLERANCE = 4;

// El orden se sortea una sola vez por carga de página, y solo en el cliente:
// el snapshot del servidor (e hidratación) es null, así que no hay mismatch.
let clientOrder: readonly Review[] | null = null;

function getClientOrder() {
  clientOrder ??= shuffle(reviews);
  return clientOrder;
}

function getServerOrder() {
  return null;
}

function subscribeToNothing() {
  return () => {};
}

function ReviewDialog({ onClose, review }: { onClose: () => void; review: Review }) {
  const { t } = usePublicLocale();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="modal-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm motion-reduce:animate-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <figure className="modal-panel-in relative flex max-h-[min(760px,calc(100vh-3rem))] w-full max-w-2xl flex-col overflow-hidden border border-border bg-white shadow-[0_24px_70px_rgba(39,39,39,0.2)] motion-reduce:animate-none">
        <div className="flex items-start justify-between gap-6 border-b border-border px-5 py-5 sm:px-7">
          <div className="space-y-2">
            <p className="eyebrow">{t("reviews.dialogLabel")}</p>
            <h2 className="heading-feature line-clamp-none text-foreground" id={titleId}>
              {review.name}
            </h2>
          </div>
          <button
            aria-label={t("common.close")}
            className="inline-flex h-10 w-10 flex-none items-center justify-center border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
          <Quote aria-hidden="true" className="mb-4 h-9 w-9 text-primary" strokeWidth={1.5} />
          <blockquote className="text-base leading-7 text-foreground" lang="es">
            {review.text}
          </blockquote>
        </div>
      </figure>
    </div>
  );
}

export function ReviewsSection() {
  const { t } = usePublicLocale();
  // Hasta que corre el sorteo en el cliente se renderiza el orden de los datos, con las
  // tarjetas invisibles pero ocupando su alto final (sin salto de layout).
  const shuffled = useSyncExternalStore(subscribeToNothing, getClientOrder, getServerOrder);
  const items = shuffled ?? reviews;
  const isReady = shuffled !== null;
  const [openReview, setOpenReview] = useState<Review | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    setCanScrollPrev(container.scrollLeft > SCROLL_EDGE_TOLERANCE);
    setCanScrollNext(
      container.scrollLeft + container.clientWidth < container.scrollWidth - SCROLL_EDGE_TOLERANCE,
    );
  }, []);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(container);

    return () => observer.disconnect();
  }, [updateScrollState]);

  const scrollByPage = (direction: -1 | 1) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    // Una "página" = lo visible (1 tarjeta en móvil, 3 en desktop) + un gap de 1.5rem.
    const gap = parseFloat(getComputedStyle(container.firstElementChild as Element).columnGap) || 24;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    container.scrollBy({
      left: direction * (container.clientWidth + gap),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const closeDialog = useCallback(() => {
    setOpenReview(null);
    triggerRef.current?.focus();
  }, []);

  const controlClassName =
    "inline-flex h-12 w-12 items-center justify-center border border-primary/15 bg-primary text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary";

  return (
    <section className="bg-surface-muted py-16 sm:py-20">
      <div className="shell space-y-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="center" title={t("home.reviewsTitle")} />
        </div>

        <div
          aria-label={t("reviews.carouselLabel")}
          aria-roledescription="carousel"
          className={`transition-opacity duration-300 motion-reduce:transition-none ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
          role="region"
        >
          <div
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={updateScrollState}
            ref={scrollRef}
          >
            <div className="flex snap-x snap-mandatory gap-6">
              {items.map((review) => {
                const isLong = review.text.length > LONG_REVIEW_LENGTH;

                return (
                  <figure
                    className="flex min-w-0 flex-none basis-full snap-start flex-col border border-border bg-surface p-6 lg:basis-[calc((100%-3rem)/3)] sm:p-8"
                    key={review.id}
                  >
                    <Quote aria-hidden="true" className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    {/* Alto fijo de 6 renglones (6 x 1.5rem): todas las tarjetas miden lo mismo. */}
                    <blockquote className="mt-4 flex h-36 items-center" lang="es">
                      <p
                        className={`text-[0.95rem] leading-6 text-foreground ${
                          isLong ? "line-clamp-6" : ""
                        }`}
                      >
                        {review.text}
                      </p>
                    </blockquote>
                    <div className="mt-3 h-6">
                      {isLong ? (
                        <button
                          className="type-button inline-flex items-center border-b border-primary/30 leading-5 text-primary-strong transition-colors hover:border-primary hover:text-primary"
                          onClick={(event) => {
                            triggerRef.current = event.currentTarget;
                            setOpenReview(review);
                          }}
                          type="button"
                        >
                          {t("reviews.readMore")}
                        </button>
                      ) : null}
                    </div>
                    <figcaption className="mt-4 border-t border-border pt-4 font-semibold text-foreground">
                      {review.name}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              aria-label={t("reviews.previous")}
              className={controlClassName}
              disabled={!canScrollPrev}
              onClick={() => scrollByPage(-1)}
              type="button"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              aria-label={t("reviews.next")}
              className={controlClassName}
              disabled={!canScrollNext}
              onClick={() => scrollByPage(1)}
              type="button"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {openReview ? <ReviewDialog onClose={closeDialog} review={openReview} /> : null}
    </section>
  );
}
