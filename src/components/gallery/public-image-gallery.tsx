"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface PublicGalleryImage {
  id: string;
  url: string;
  altText?: string | null;
  isCover?: boolean;
}

interface PublicImageGalleryProps {
  emptyLabel: string;
  images: PublicGalleryImage[];
}

const MAX_VISIBLE_THUMBNAILS = 5;

function getInitialIndex(images: PublicGalleryImage[]) {
  const coverIndex = images.findIndex((image) => image.isCover);
  return coverIndex >= 0 ? coverIndex : 0;
}

export function PublicImageGallery({
  emptyLabel,
  images,
}: PublicImageGalleryProps) {
  const orderedImages = useMemo(() => images, [images]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeIndex = useMemo(() => {
    if (selectedImageId) {
      const selectedIndex = orderedImages.findIndex(
        (image) => image.id === selectedImageId,
      );

      if (selectedIndex >= 0) {
        return selectedIndex;
      }
    }

    return getInitialIndex(orderedImages);
  }, [orderedImages, selectedImageId]);

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current === null
            ? current
            : (current - 1 + orderedImages.length) % orderedImages.length,
        );
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current === null ? current : (current + 1) % orderedImages.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, orderedImages.length]);

  if (orderedImages.length === 0) {
    return (
      <div className="panel !rounded-none flex min-h-[420px] items-center justify-center border-dashed bg-surface-strong px-6 text-center text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }

  const activeImage = orderedImages[activeIndex] ?? orderedImages[0];
  const hiddenImagesCount = Math.max(orderedImages.length - MAX_VISIBLE_THUMBNAILS, 0);
  const visibleThumbnails =
    orderedImages.length > MAX_VISIBLE_THUMBNAILS
      ? orderedImages.slice(0, MAX_VISIBLE_THUMBNAILS)
      : orderedImages;

  return (
    <>
      <div className="panel !rounded-none overflow-hidden">
        <button
          className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-strong sm:aspect-[16/10]"
          onClick={() => setLightboxIndex(activeIndex)}
          type="button"
        >
          <Image
            alt={activeImage.altText ?? ""}
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            src={activeImage.url}
          />
        </button>

        <div className="flex gap-2 overflow-x-auto p-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
          {visibleThumbnails.map((image, index) => {
            const isOverflowTile =
              hiddenImagesCount > 0 && index === visibleThumbnails.length - 1;
            const isActive = index === activeIndex;

            return (
              <button
                className={`relative block h-20 min-w-24 overflow-hidden border transition sm:h-24 sm:min-w-0 ${
                  isActive ? "border-primary" : "border-border"
                }`}
                key={image.id}
                onClick={() => {
                  if (isOverflowTile) {
                    setLightboxIndex(index);
                    return;
                  }

                  setSelectedImageId(image.id);
                }}
                type="button"
              >
                <Image
                  alt={image.altText ?? ""}
                  className="object-cover"
                  fill
                  sizes="(min-width: 640px) 20vw, 96px"
                  src={image.url}
                />
                {isOverflowTile ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                    +{hiddenImagesCount}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {lightboxIndex !== null ? (
        <div className="fixed inset-0 z-50 bg-black/85 p-4 sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
            <div className="flex items-center justify-between pb-4 text-white">
              <p className="text-sm text-white/80">
                {lightboxIndex + 1} / {orderedImages.length}
              </p>
              <button
                className="inline-flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
                onClick={() => setLightboxIndex(null)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <div className="relative h-full overflow-hidden bg-black">
                <Image
                  alt={orderedImages[lightboxIndex]?.altText ?? ""}
                  className="object-contain"
                  fill
                  sizes="100vw"
                  src={orderedImages[lightboxIndex].url}
                />
              </div>

              {orderedImages.length > 1 ? (
                <>
                  <button
                    className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + orderedImages.length) % orderedImages.length,
                      )
                    }
                    type="button"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % orderedImages.length)
                    }
                    type="button"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
