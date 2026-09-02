"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";

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
  const [currentSlide, setCurrentSlide] = useState(slides.length > 1 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(slides.length > 1);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const totalSlides = slides.length;
  const loopedSlides =
    totalSlides > 1 ? [slides[totalSlides - 1], ...slides, slides[0]] : slides;

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
      <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/34 to-black/24" />
      {(slide.title || slide.price) ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center sm:px-8">
          {slide.href ? (
            <Link
              aria-label={slide.title ? `Ver ${slide.title}` : slide.alt}
              className="pointer-events-auto block w-full max-w-[min(92vw,720px)] rounded-[24px] border border-white/14 bg-black/46 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:py-7"
              href={slide.href}
            >
              <div className="space-y-3 sm:space-y-4">
                {slide.title ? (
                  <h1 className="mx-auto max-w-[18ch] font-display text-[clamp(1.15rem,2.2vw,2rem)] uppercase leading-[1.02] tracking-[0.08em] text-white">
                    {slide.title}
                  </h1>
                ) : null}
                {slide.price ? (
                  <p className="font-display text-[1.7rem] leading-none tracking-[0.04em] text-white sm:text-[2.4rem] lg:text-[2.95rem]">
                    {slide.price}
                  </p>
                ) : null}
              </div>
            </Link>
          ) : (
            <div className="w-full max-w-[min(92vw,720px)] rounded-[24px] border border-white/14 bg-black/46 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:py-7">
              <div className="space-y-3 sm:space-y-4">
                {slide.title ? (
                  <h1 className="mx-auto max-w-[18ch] font-display text-[clamp(1.15rem,2.2vw,2rem)] uppercase leading-[1.02] tracking-[0.08em] text-white">
                    {slide.title}
                  </h1>
                ) : null}
                {slide.price ? (
                  <p className="font-display text-[1.7rem] leading-none tracking-[0.04em] text-white sm:text-[2.4rem] lg:text-[2.95rem]">
                    {slide.price}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : null}
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
    if (totalSlides <= 1) {
      setCurrentSlide(0);
      setIsTransitionEnabled(false);
      return;
    }

    setCurrentSlide(1);
    setIsTransitionEnabled(true);
  }, [totalSlides]);

  useEffect(() => {
    if (isTransitionEnabled || totalSlides <= 1) {
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

      {totalSlides > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between md:flex">
          <button
            aria-label="Slide anterior"
            className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-strong"
            onClick={goToPrevious}
            type="button"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            aria-label="Slide siguiente"
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
