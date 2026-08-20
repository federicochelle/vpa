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
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
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

  return (
    <section
      className="relative h-[74vh] min-h-[560px] w-full overflow-hidden sm:h-[72vh] sm:min-h-[540px] lg:h-[78vh]"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={`${slide.alt}-${index}`} className="relative h-full w-full flex-none overflow-hidden">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />

      {slides.length > 1 ? (
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
