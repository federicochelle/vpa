"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

interface HomeCarouselProps {
  children: ReactNode;
}

export function HomeCarousel({ children }: HomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: "left" | "right") => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.82, 320);

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative lg:px-12">
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden lg:block">
        <button
          aria-label="Ver anteriores"
          className="pointer-events-auto absolute left-0 top-1/2 inline-flex h-14 w-14 -translate-x-full -translate-y-1/2 items-center justify-center border border-primary/15 bg-primary text-white shadow-[0_12px_24px_rgba(39,39,39,0.18)] transition-colors hover:bg-primary-strong"
          onClick={() => scrollByCards("left")}
          type="button"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          aria-label="Ver siguientes"
          className="pointer-events-auto absolute right-0 top-1/2 inline-flex h-14 w-14 translate-x-full -translate-y-1/2 items-center justify-center border border-primary/15 bg-primary text-white shadow-[0_12px_24px_rgba(39,39,39,0.18)] transition-colors hover:bg-primary-strong"
          onClick={() => scrollByCards("right")}
          type="button"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        <div className="flex snap-x snap-mandatory gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
