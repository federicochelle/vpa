"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { usePublicLocale } from "@/i18n/public/locale-provider";

export interface HomeHeroCarouselSlide {
  src: StaticImageData | string;
  alt: string;
  entityId?: string;
  entityType?: "property" | "project";
  heroOrder?: 1 | 2 | 3;
  title?: string;
  price?: string;
  href?: string;
  locationLabel?: string | null;
}

interface HomeHeroCarouselProps {
  slides: HomeHeroCarouselSlide[];
}

const AUTOPLAY_DELAY = 8000;
const SWIPE_THRESHOLD = 50;
function normalizeSlideIndex(index: number, totalSlides: number) {
  if (totalSlides <= 1) {
    return 0;
  }

  if (index <= 0) {
    return totalSlides;
  }

  if (index > totalSlides) {
    return ((index - 1) % totalSlides) + 1;
  }

  return index;
}

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const { t } = usePublicLocale();
  const [currentSlide, setCurrentSlide] = useState(slides.length > 1 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(slides.length > 1);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const totalSlides = slides.length;
  const loopedSlides =
    totalSlides > 1 ? [slides[totalSlides - 1], ...slides, slides[0]] : slides;
  const activeSlideIndex =
    totalSlides <= 1 ? 0 : normalizeSlideIndex(currentSlide, totalSlides) - 1;
  const activeSlide = slides[activeSlideIndex] ?? slides[0];
  const activeSlideLabel =
    activeSlide?.entityType === "property"
      ? t("home.featuredProperty")
      : t("home.featuredProject");
  const heroMessage = t("home.heroMessage");

  const renderSlideContent = (slide: HomeHeroCarouselSlide, index: number) => (
    <>
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        priority={index <= 1}
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/14" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-black/14" />
    </>
  );

  useEffect(() => {
    if (totalSlides <= 1 || !isDocumentVisible) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setCurrentSlide((current) => current + 1);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(intervalId);
  }, [isDocumentVisible, totalSlides]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsDocumentVisible(isVisible);

      if (!isVisible) {
        return;
      }

      setIsTransitionEnabled(false);
      setCurrentSlide((current) => normalizeSlideIndex(current, totalSlides));
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [totalSlides]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (totalSlides <= 1) {
        setCurrentSlide(0);
        setIsTransitionEnabled(false);
        return;
      }

      setCurrentSlide(1);
      setIsTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    if (isTransitionEnabled) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isTransitionEnabled, totalSlides]);

  const goToPrevious = () => {
    if (totalSlides <= 1) {
      return;
    }

    setIsTransitionEnabled(true);
    setCurrentSlide((current) => current - 1);
  };

  const goToNext = () => {
    if (totalSlides <= 1) {
      return;
    }

    setIsTransitionEnabled(true);
    setCurrentSlide((current) => current + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null) {
      return;
    }

    touchDeltaXRef.current = (event.touches[0]?.clientX ?? 0) - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) {
      return;
    }

    if (touchDeltaXRef.current <= -SWIPE_THRESHOLD) {
      goToNext();
    } else if (touchDeltaXRef.current >= SWIPE_THRESHOLD) {
      goToPrevious();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const handleTransitionEnd = () => {
    if (totalSlides <= 1) {
      return;
    }

    if (currentSlide >= totalSlides + 1) {
      setIsTransitionEnabled(false);
      setCurrentSlide(1);
      return;
    }

    if (currentSlide <= 0) {
      setIsTransitionEnabled(false);
      setCurrentSlide(totalSlides);
    }
  };

  return (
    <section
      className="relative h-[74vh] min-h-[560px] w-full max-w-full min-w-0 overflow-hidden sm:h-[72vh] sm:min-h-[540px] lg:h-[78vh]"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className={`flex h-full min-w-0 ease-out ${isTransitionEnabled ? "transition-transform duration-500" : ""}`}
        onTransitionEnd={handleTransitionEnd}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {loopedSlides.map((slide, index) => (
          <div key={`${slide.alt}-${index}`} className="relative h-full w-full max-w-full min-w-0 flex-none overflow-hidden">
            <div className="absolute inset-0">
              {renderSlideContent(slide, index)}
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 text-center sm:px-8">
        <div className="w-full max-w-[min(88vw,820px)] pt-8 sm:pt-0">
          <h1
            aria-label={heroMessage}
            className="mx-auto max-w-[11ch] font-display text-[clamp(1.85rem,8vw,2.55rem)] uppercase leading-[0.98] text-white [text-shadow:0_5px_24px_rgba(0,0,0,0.44)] sm:max-w-[18ch] sm:text-[clamp(2.5rem,4.4vw,3.95rem)] sm:leading-[0.96]"
          >
            {heroMessage.split(" ").map((word) => (
              <span aria-hidden="true" className="block sm:hidden" key={word}>
                {word}
              </span>
            ))}
            <span aria-hidden="true" className="hidden sm:block">{heroMessage}</span>
          </h1>
          {activeSlide?.title ? (
            activeSlide.href ? (
              <Link
                aria-label={`${t("common.viewMore")}: ${activeSlide.title}`}
                className="pointer-events-auto mt-8 inline-flex max-w-full items-center justify-center border border-white/32 bg-black/42 px-5 py-2.5 font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(0,0,0,0.28)] backdrop-blur-[2px] transition-colors hover:border-primary/60 hover:bg-primary/88 sm:mt-10 sm:px-6 sm:py-3"
                href={activeSlide.href}
              >
                <span className="truncate text-[0.76rem] leading-5 sm:text-[0.82rem]">
                  {activeSlide.title} · {activeSlideLabel}
                </span>
              </Link>
            ) : (
              <p className="mx-auto mt-8 inline-flex max-w-full items-center justify-center border border-white/32 bg-black/42 px-5 py-2.5 font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(0,0,0,0.28)] backdrop-blur-[2px] sm:mt-10 sm:px-6 sm:py-3">
                <span className="truncate text-[0.76rem] leading-5 sm:text-[0.82rem]">
                  {activeSlide.title} · {activeSlideLabel}
                </span>
              </p>
            )
          ) : null}
        </div>
      </div>

      {totalSlides > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between md:flex">
          <button
            aria-label={t("common.previousSlide")}
            className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-strong"
            onClick={goToPrevious}
            type="button"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            aria-label={t("common.nextSlide")}
            className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-strong"
            onClick={goToNext}
            type="button"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
