"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";

interface HomeHeroCarouselSlide {
  src: StaticImageData;
  alt: string;
}

interface HomeHeroCarouselProps {
  slides: HomeHeroCarouselSlide[];
}

const AUTOPLAY_DELAY = 8000;
const SWIPE_THRESHOLD = 50;

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(slides.length > 1 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(slides.length > 1);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const totalSlides = slides.length;
  const loopedSlides =
    totalSlides > 1 ? [slides[totalSlides - 1], ...slides, slides[0]] : slides;

  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setCurrentSlide((current) => current + 1);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(intervalId);
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

    if (currentSlide === totalSlides + 1) {
      setIsTransitionEnabled(false);
      setCurrentSlide(1);
      return;
    }

    if (currentSlide === 0) {
      setIsTransitionEnabled(false);
      setCurrentSlide(totalSlides);
    }
  };

  return (
    <section
      className="relative h-[74vh] min-h-[560px] w-full overflow-hidden sm:h-[72vh] sm:min-h-[540px] lg:h-[78vh]"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className={`flex h-full ease-out ${isTransitionEnabled ? "transition-transform duration-500" : ""}`}
        onTransitionEnd={handleTransitionEnd}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {loopedSlides.map((slide, index) => (
          <div key={`${slide.alt}-${index}`} className="relative h-full w-full flex-none overflow-hidden">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index <= 1}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />

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
