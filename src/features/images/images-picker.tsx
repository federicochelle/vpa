"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import {
  assertSupportedImageFile,
  IMAGE_INPUT_ACCEPT,
  prepareImageUploadFile,
  type PrepareImageUploadResult,
} from "@/lib/images";

type PendingImageStatus = "processing" | "ready" | "uploading" | "error";

export interface PendingImage {
  id: string;
  file: File | null;
  originalFileName: string;
  previewUrl: string | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  size: number | null;
  status: PendingImageStatus;
  error: string | null;
}

interface ImagesPickerProps {
  label?: string;
  helperText?: string;
  value?: PendingImage[];
  onChange?: (images: PendingImage[]) => void;
  disabled?: boolean;
}

function createPendingImageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `pending-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No pudimos procesar la imagen.";
}

function logImagesPickerStep(label: string, payload?: Record<string, unknown>) {
  console.log(`[IMAGES_PICKER] ${label}`, payload ?? {});
}

function toPendingImage(
  id: string,
  originalFile: File,
  result: PrepareImageUploadResult,
  previewUrl: string,
): PendingImage {
  return {
    id,
    file: result.file,
    originalFileName: originalFile.name,
    previewUrl,
    width: result.outputDimensions.width,
    height: result.outputDimensions.height,
    mimeType: result.file.type,
    size: result.file.size,
    status: "ready",
    error: null,
  };
}

export function ImagesPicker({
  label = "Galeria de imagenes",
  helperText,
  value,
  onChange,
  disabled = false,
}: ImagesPickerProps) {
  const inputId = useId();
  const [internalImages, setInternalImages] = useState<PendingImage[]>([]);
  const mountedRef = useRef(true);
  const removedIdsRef = useRef(new Set<string>());
  const previewUrlsRef = useRef(new Map<string, string>());
  const imagesRef = useRef<PendingImage[]>(value ?? internalImages);
  const images = value ?? internalImages;
  imagesRef.current = images;

  useEffect(() => {
    mountedRef.current = true;
    logImagesPickerStep("lifecycle:setup");
    const previewUrls = previewUrlsRef.current;

    return () => {
      logImagesPickerStep("lifecycle:cleanup");
      mountedRef.current = false;

      for (const previewUrl of previewUrls.values()) {
        URL.revokeObjectURL(previewUrl);
      }

      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    const currentIds = new Set(images.map((image) => image.id));

    for (const [id, previewUrl] of previewUrlsRef.current.entries()) {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(id);
      }
    }
  }, [images]);

  function updateImages(nextImages: PendingImage[] | ((currentImages: PendingImage[]) => PendingImage[])) {
    const currentImages = imagesRef.current;
    const resolvedImages =
      typeof nextImages === "function" ? nextImages(currentImages) : nextImages;

    imagesRef.current = resolvedImages;

    if (value === undefined) {
      setInternalImages(resolvedImages);
    }

    onChange?.(resolvedImages);
  }

  function storePreviewUrl(id: string, previewUrl: string) {
    const previousUrl = previewUrlsRef.current.get(id);

    if (previousUrl && previousUrl !== previewUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    previewUrlsRef.current.set(id, previewUrl);
  }

  function revokePreviewUrl(id: string) {
    const previewUrl = previewUrlsRef.current.get(id);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(id);
    }
  }

  async function processSelectedFile(file: File, id: string) {
    const traceId = `picker:${id}:${file.name}`;
    console.time(traceId);
    logImagesPickerStep("process:start", {
      id,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    try {
      assertSupportedImageFile(file);
      logImagesPickerStep("process:validated", { id, fileName: file.name });
      const result = await prepareImageUploadFile(file);
      logImagesPickerStep("process:prepared", {
        id,
        fileName: file.name,
        outputWidth: result.outputDimensions.width,
        outputHeight: result.outputDimensions.height,
        optimizedSize: result.optimizedSize,
        wasOptimized: result.wasOptimized,
      });
      const previewUrl = URL.createObjectURL(result.file);
      logImagesPickerStep("process:preview-url-created", {
        id,
        fileName: file.name,
        previewUrl,
      });

      const wasRemoved = removedIdsRef.current.has(id);
      const stillExists = imagesRef.current.some((image) => image.id === id);

      if (wasRemoved || !stillExists) {
        logImagesPickerStep("process:aborted-before-ready", {
          id,
          mounted: mountedRef.current,
          wasRemoved,
          stillExists,
        });
        URL.revokeObjectURL(previewUrl);
        console.timeEnd(traceId);
        return;
      }

      storePreviewUrl(id, previewUrl);

      updateImages((currentImages) =>
        currentImages.map((image) =>
          image.id === id ? toPendingImage(id, file, result, previewUrl) : image,
        ),
      );
      logImagesPickerStep("process:state-ready", { id, fileName: file.name });
      console.timeEnd(traceId);
    } catch (error) {
      logImagesPickerStep("process:error", {
        id,
        fileName: file.name,
        message: toErrorMessage(error),
      });
      const wasRemoved = removedIdsRef.current.has(id);
      const stillExists = imagesRef.current.some((image) => image.id === id);

      if (wasRemoved || !stillExists) {
        console.timeEnd(traceId);
        return;
      }

      updateImages((currentImages) =>
        currentImages.map((image) =>
          image.id === id
            ? {
                ...image,
                status: "error",
                error: toErrorMessage(error),
              }
            : image,
        ),
      );
      logImagesPickerStep("process:state-error", { id, fileName: file.name });
      console.timeEnd(traceId);
    }
  }

  async function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    logImagesPickerStep("input:change", {
      count: selectedFiles.length,
      fileNames: selectedFiles.map((file) => file.name),
    });

    if (selectedFiles.length === 0) {
      return;
    }

    const pendingImages = selectedFiles.map((file) => ({
      id: createPendingImageId(),
      file: null,
      originalFileName: file.name,
      previewUrl: null,
      width: null,
      height: null,
      mimeType: null,
      size: null,
      status: "processing" as const,
      error: null,
    }));

    for (const pendingImage of pendingImages) {
      removedIdsRef.current.delete(pendingImage.id);
    }

    updateImages((currentImages) => [...currentImages, ...pendingImages]);
    logImagesPickerStep("input:placeholders-added", {
      ids: pendingImages.map((image) => image.id),
    });
    event.target.value = "";

    await Promise.all(
      pendingImages.map((pendingImage, index) =>
        processSelectedFile(selectedFiles[index], pendingImage.id),
      ),
    );
  }

  function handleRemoveImage(id: string) {
    removedIdsRef.current.add(id);
    revokePreviewUrl(id);
    updateImages((currentImages) => currentImages.filter((image) => image.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-primary-strong">{label}</h3>
            <p className="max-w-2xl text-xs leading-6 text-muted">{helperText}</p>
          </div>
          <label
            className="button-secondary inline-flex cursor-pointer items-center gap-2"
            htmlFor={inputId}
          >
            <ImagePlus className="h-4 w-4" />
            Seleccionar imagenes
          </label>
        </div>
        <input
          accept={IMAGE_INPUT_ACCEPT}
          className="sr-only"
          disabled={disabled}
          id={inputId}
          multiple
          onChange={handleInputChange}
          type="file"
        />
      </div>

      {images.length === 0 ? (
        <div className="panel border-dashed px-5 py-8 text-sm text-muted">
          Selecciona una o varias imagenes para ver la galeria procesada antes de guardar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden border border-border bg-white"
            >
              <div className="relative aspect-[4/3] bg-surface-muted">
                {image.previewUrl ? (
                  <Image
                    alt={image.file?.name ?? image.originalFileName}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 24rem, (min-width: 640px) 50vw, 100vw"
                    src={image.previewUrl}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    {image.status === "processing" ? (
                      <LoaderCircle className="h-6 w-6 animate-spin" />
                    ) : image.status === "uploading" ? (
                      <LoaderCircle className="h-6 w-6 animate-spin" />
                    ) : (
                      <AlertCircle className="h-6 w-6" />
                    )}
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <button
                    aria-label={`Eliminar ${image.file?.name ?? image.originalFileName}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition hover:bg-white"
                    onClick={() => handleRemoveImage(image.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {image.error ? (
                <div className="px-4 py-4">
                  <div className="border border-primary/20 bg-primary/6 px-3 py-3 text-xs leading-6 text-primary-strong">
                    {image.error}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
