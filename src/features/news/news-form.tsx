"use client";

import { startTransition, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, LoaderCircle, RefreshCcw } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import {
  IMAGE_INPUT_ACCEPT,
  prepareImageUploadFile,
} from "@/lib/images";
import type { PendingImage } from "@/features/images/images-picker";
import type { News } from "@/types/news";

interface NewsFormProps {
  news?: News | null;
  submitLabel: string;
  className?: string;
}

type NewsSubmitState = "idle" | "saving" | "uploading";

async function uploadProcessedFileToCloudflare(newsId: string, image: PendingImage) {
  const directUploadResponse = await fetch(`/api/admin/news/${newsId}/image/direct-upload`, {
    method: "POST",
  });

  const directUploadPayload = (await directUploadResponse.json().catch(() => null)) as
    | {
        uploadURL?: string;
        imageId?: string;
        message?: string;
      }
    | null;

  if (!directUploadResponse.ok || !directUploadPayload?.uploadURL || !directUploadPayload.imageId) {
    throw new Error(
      directUploadPayload?.message ?? "No se pudo obtener la URL temporal de Cloudflare.",
    );
  }

  if (!image.file) {
    throw new Error("No encontramos el archivo procesado para subir.");
  }

  const uploadFormData = new FormData();
  uploadFormData.set("file", image.file);

  const uploadResponse = await fetch(directUploadPayload.uploadURL, {
    method: "POST",
    body: uploadFormData,
  });

  const uploadPayload = (await uploadResponse.json().catch(() => null)) as
    | {
        success?: boolean;
        errors?: Array<{ message?: string }>;
        messages?: Array<{ message?: string }>;
      }
    | null;

  if (!uploadResponse.ok || uploadPayload?.success === false) {
    throw new Error(
      uploadPayload?.errors?.[0]?.message ??
        uploadPayload?.messages?.[0]?.message ??
        "Cloudflare rechazo el upload de la imagen.",
    );
  }

  return {
    imageId: directUploadPayload.imageId,
  };
}

async function persistNewsImage(newsId: string, publicId: string) {
  const response = await fetch(`/api/admin/news/${newsId}/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicId }),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        news?: News;
        message?: string;
      }
    | null;

  if (!response.ok || !body?.news) {
    throw new Error(body?.message ?? "No se pudo guardar la imagen de la noticia.");
  }

  return body.news;
}

function toStatusErrorMessage(image: PendingImage) {
  if (image.status === "processing") {
    return "Espera a que termine el procesamiento de la foto antes de guardar.";
  }

  if (image.status === "error") {
    return image.error ?? "La foto seleccionada no pudo procesarse.";
  }

  if (image.status === "uploading") {
    return "La foto ya se esta subiendo. Intenta nuevamente en unos segundos.";
  }

  return null;
}

function createPendingImageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `news-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NewsForm({
  news,
  submitLabel,
  className = "space-y-0",
}: NewsFormProps) {
  const router = useRouter();
  const existingNewsId = news?.id ?? null;
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [persistedNews, setPersistedNews] = useState<News | null>(news ?? null);
  const [submitState, setSubmitState] = useState<NewsSubmitState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const imageInputId = useId();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const activePendingImage = useMemo(
    () => (pendingImages.length > 0 ? pendingImages[pendingImages.length - 1] : null),
    [pendingImages],
  );

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    setFormError(null);
    const pendingImageId = createPendingImageId();

    setPendingImages([
      {
        id: pendingImageId,
        file: null,
        originalFileName: nextFile.name,
        previewUrl: null,
        width: null,
        height: null,
        mimeType: null,
        size: null,
        status: "processing",
        error: null,
      },
    ]);

    try {
      const prepared = await prepareImageUploadFile(nextFile);
      const previewUrl = URL.createObjectURL(prepared.file);

      setPendingImages([
        {
          id: pendingImageId,
          file: prepared.file,
          originalFileName: nextFile.name,
          previewUrl,
          width: prepared.outputDimensions.width,
          height: prepared.outputDimensions.height,
          mimeType: prepared.file.type,
          size: prepared.file.size,
          status: "ready",
          error: null,
        },
      ]);
    } catch (error) {
      setPendingImages([
        {
          id: pendingImageId,
          file: null,
          originalFileName: nextFile.name,
          previewUrl: null,
          width: null,
          height: null,
          mimeType: null,
          size: null,
          status: "error",
          error:
            error instanceof Error ? error.message : "No pudimos procesar la imagen.",
        },
      ]);
    } finally {
      event.currentTarget.value = "";
    }
  }

  const previewImageUrl = activePendingImage?.previewUrl ?? persistedNews?.imageUrl ?? null;
  const hasPendingImageError = activePendingImage?.status === "error" && activePendingImage.error;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    let nextNewsId: string | null = existingNewsId;

    if (activePendingImage) {
      const statusError = toStatusErrorMessage(activePendingImage);

      if (statusError && activePendingImage.status !== "ready") {
        setFormError(statusError);
        return;
      }
    }

    const formData = new FormData(event.currentTarget);
    const isEditing = Boolean(existingNewsId);

    try {
      setSubmitState("saving");

      const response = await fetch(
        isEditing && existingNewsId ? `/api/admin/news/${existingNewsId}` : "/api/admin/news",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            news?: News;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.news) {
        throw new Error(
          payload?.message ??
            (isEditing
              ? "No se pudo actualizar la noticia."
              : "No se pudo crear la noticia."),
        );
      }

      let nextNews = payload.news;
      nextNewsId = nextNews.id;
      setPersistedNews(nextNews);

      if (activePendingImage?.status === "ready" && activePendingImage.file) {
        setSubmitState("uploading");
        const uploadResult = await uploadProcessedFileToCloudflare(nextNews.id, activePendingImage);
        nextNews = await persistNewsImage(nextNews.id, uploadResult.imageId);
        setPersistedNews(nextNews);
        setPendingImages([]);
      }

      setSubmitState("idle");
      startTransition(() => {
        router.push(
          isEditing
            ? "/admin/noticias?updated=Noticia%20actualizada%20correctamente."
            : "/admin/noticias?created=Noticia%20creada%20correctamente.",
        );
        router.refresh();
      });
    } catch (error) {
      setSubmitState("idle");

      if (!existingNewsId && nextNewsId) {
        startTransition(() => {
          router.push(
            `/admin/noticias/${nextNewsId}/editar?error=${encodeURIComponent(
              error instanceof Error
                ? error.message
                : "La noticia se creo, pero la imagen no pudo completarse.",
            )}`,
          );
          router.refresh();
        });
        return;
      }

      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar la noticia.",
      );
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {existingNewsId ? <input name="id" type="hidden" value={existingNewsId} /> : null}

      {formError ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/6 px-4 py-4 type-body-compact text-primary-strong">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-6">
        <div className="flex flex-col gap-5 xl:col-span-3">
          <FormField htmlFor="title" label="Titulo">
            <input
              className="admin-input-base"
              defaultValue={persistedNews?.title ?? ""}
              id="title"
              name="title"
              required
              type="text"
            />
          </FormField>

          <FormField htmlFor="excerpt" label="Bajada">
            <textarea
              className="admin-input-base min-h-32"
              defaultValue={persistedNews?.excerpt ?? ""}
              id="excerpt"
              name="excerpt"
              rows={5}
            />
          </FormField>
        </div>
        <div className="space-y-3 xl:col-span-3">
          <div className="overflow-hidden border border-border bg-white">
            <div className="relative aspect-[4/3] bg-surface-muted">
              {previewImageUrl ? (
                <>
                  <Image
                    alt={persistedNews?.title ?? "Preview de noticia"}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 30rem, (min-width: 640px) 50vw, 100vw"
                    src={previewImageUrl}
                    unoptimized
                  />
                  <button
                    className="admin-button-secondary absolute bottom-4 right-4 inline-flex items-center gap-2 border-white/30 bg-white/92 px-4 py-2 text-foreground shadow-sm hover:bg-white"
                    disabled={submitState !== "idle"}
                    onClick={() => {
                      imageInputRef.current?.click();
                    }}
                    type="button"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reemplazar imagen
                  </button>
                </>
              ) : (
                <button
                  className="type-button flex h-full w-full items-center justify-center gap-2 px-6 text-center text-foreground transition-colors hover:text-primary-strong"
                  disabled={submitState !== "idle"}
                  onClick={() => {
                    imageInputRef.current?.click();
                  }}
                  type="button"
                >
                  <ImagePlus className="h-4 w-4" />
                  Seleccionar imagen
                </button>
              )}
            </div>
            <input
              accept={IMAGE_INPUT_ACCEPT}
              className="sr-only"
              disabled={submitState !== "idle"}
              id={imageInputId}
              onChange={handleImageChange}
              ref={imageInputRef}
              type="file"
            />
          </div>
          {activePendingImage?.status === "processing" ? (
            <p className="type-body-compact text-muted">Procesando imagen...</p>
          ) : null}
          {hasPendingImageError ? (
            <p className="type-body-compact text-primary-strong">{activePendingImage.error}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <FormField htmlFor="content" label="Contenido">
          <textarea
            className="admin-input-base min-h-72"
            defaultValue={persistedNews?.content ?? ""}
            id="content"
            name="content"
            required
          />
        </FormField>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="admin-button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitState !== "idle"}
          type="submit"
        >
          {submitState === "saving" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Guardando noticia...
            </>
          ) : submitState === "uploading" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Subiendo foto...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
