"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, RefreshCcw, X } from "lucide-react";
import { startTransition, useEffect, useId, useMemo, useRef, useState } from "react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { FormField } from "@/components/ui/form-field";
import {
  IMAGE_INPUT_ACCEPT,
  prepareImageUploadFile,
} from "@/lib/images";
import type { PendingImage } from "@/features/images/images-picker";
import type { ProjectAdvisor } from "@/types/project";

interface ProjectAdvisorFormProps {
  advisor?: ProjectAdvisor | null;
  submitLabel: string;
}

type AdvisorSubmitState = "idle" | "saving" | "uploading";

async function createAdvisorImageDirectUpload() {
  const response = await fetch("/api/admin/project-advisors/image/direct-upload", {
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        imageId?: string;
        imageUrl?: string;
        message?: string;
        uploadURL?: string;
      }
    | null;

  if (!response.ok || !payload?.imageId || !payload.imageUrl || !payload.uploadURL) {
    throw new Error(payload?.message ?? "No se pudo obtener la URL temporal de Cloudflare.");
  }

  return {
    imageId: payload.imageId,
    imageUrl: payload.imageUrl,
    uploadURL: payload.uploadURL,
  };
}

async function uploadAdvisorImage(image: PendingImage) {
  if (!image.file) {
    throw new Error("No encontramos el archivo procesado para subir.");
  }

  const directUpload = await createAdvisorImageDirectUpload();
  const uploadFormData = new FormData();
  uploadFormData.set("file", image.file);

  const uploadResponse = await fetch(directUpload.uploadURL, {
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

  return directUpload;
}

function createPendingImageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `advisor-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

export function ProjectAdvisorForm({
  advisor,
  submitLabel,
}: ProjectAdvisorFormProps) {
  const router = useRouter();
  const existingAdvisorId = advisor?.id ?? null;
  const imageInputId = useId();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [submitState, setSubmitState] = useState<AdvisorSubmitState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const activePendingImage = useMemo(
    () => (pendingImages.length > 0 ? pendingImages[pendingImages.length - 1] : null),
    [pendingImages],
  );
  const previewImageUrl = activePendingImage?.previewUrl ?? (removePhoto ? null : advisor?.photoUrl ?? null);
  const hasPendingImageError = activePendingImage?.status === "error" && activePendingImage.error;

  useEffect(() => {
    return () => {
      for (const image of pendingImages) {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      }
    };
  }, [pendingImages]);

  function replacePendingImages(nextImages: PendingImage[]) {
    setPendingImages((currentImages) => {
      for (const image of currentImages) {
        if (image.previewUrl && !nextImages.some((nextImage) => nextImage.previewUrl === image.previewUrl)) {
          URL.revokeObjectURL(image.previewUrl);
        }
      }

      return nextImages;
    });
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const nextFile = input.files?.[0];

    if (!nextFile) {
      return;
    }

    setFormError(null);
    setFeedbackError(null);
    setRemovePhoto(false);
    const pendingImageId = createPendingImageId();

    replacePendingImages([
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

      replacePendingImages([
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
      replacePendingImages([
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
      input.value = "";
    }
  }

  function handleRemovePhoto() {
    replacePendingImages([]);
    setRemovePhoto(true);
    setFormError(null);
    setFeedbackError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFeedbackError(null);

    if (activePendingImage) {
      const statusError = toStatusErrorMessage(activePendingImage);

      if (statusError && activePendingImage.status !== "ready") {
        setFormError(statusError);
        return;
      }
    }

    const formData = new FormData(event.currentTarget);
    const isEditing = Boolean(existingAdvisorId);

    try {
      let nextPhotoUrl = removePhoto ? "" : advisor?.photoUrl ?? "";
      let photoPublicId = "";

      if (activePendingImage?.status === "ready" && activePendingImage.file) {
        setSubmitState("uploading");
        const uploadResult = await uploadAdvisorImage(activePendingImage);
        nextPhotoUrl = uploadResult.imageUrl;
        photoPublicId = uploadResult.imageId;
      }

      formData.set("photoUrl", nextPhotoUrl);
      formData.set("photoPublicId", photoPublicId);
      setSubmitState("saving");

      const response = await fetch(
        isEditing && existingAdvisorId
          ? `/api/admin/project-advisors/${existingAdvisorId}`
          : "/api/admin/project-advisors",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            advisor?: ProjectAdvisor;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.advisor) {
        throw new Error(
          payload?.message ??
            (isEditing ? "No se pudo actualizar el asesor." : "No se pudo crear el asesor."),
        );
      }

      setSubmitState("idle");
      replacePendingImages([]);
      startTransition(() => {
        router.push(
          isEditing
            ? "/admin/asesores?updated=Asesor%20actualizado%20correctamente."
            : "/admin/asesores?created=Asesor%20creado%20correctamente.",
        );
        router.refresh();
      });
    } catch (error) {
      setSubmitState("idle");
      setFeedbackError(
        error instanceof Error ? error.message : "No se pudo guardar el asesor.",
      );
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <AdminFeedbackModal
        message={
          submitState === "saving"
            ? "Estamos guardando el asesor."
            : "Estamos subiendo la foto del asesor."
        }
        open={submitState !== "idle"}
        title={submitState === "saving" ? "Guardando asesor" : "Subiendo foto"}
        variant="loading"
      />
      {feedbackError ? (
        <AdminFeedbackModal
          message={feedbackError}
          onClose={() => {
            setFeedbackError(null);
          }}
          title="No pudimos guardar el asesor"
          variant="error"
        />
      ) : null}

      {formError ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/6 px-4 py-4 type-body-compact text-primary-strong">
          {formError}
        </div>
      ) : null}

      <input name="active" type="hidden" value="on" />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <span className="admin-field-label">Foto del asesor</span>
          <div className="max-w-64 overflow-hidden border border-border bg-white">
            <div className="relative aspect-square bg-surface-muted">
              {previewImageUrl ? (
                <>
                  <Image
                    alt={advisor?.name ?? "Preview de asesor"}
                    className="object-cover"
                    fill
                    sizes="16rem"
                    src={previewImageUrl}
                    unoptimized
                  />
                  <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex size-9 items-center justify-center border border-white/30 bg-white/92 text-foreground shadow-sm transition-colors hover:bg-white"
                      disabled={submitState !== "idle"}
                      onClick={() => {
                        imageInputRef.current?.click();
                      }}
                      title="Reemplazar"
                      type="button"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                    <button
                      className="inline-flex size-9 items-center justify-center border border-white/30 bg-white/92 text-foreground shadow-sm transition-colors hover:bg-white"
                      disabled={submitState !== "idle"}
                      onClick={handleRemovePhoto}
                      title="Quitar"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
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

        <div className="grid gap-6">
          <FormField htmlFor="name" label="Nombre">
            <input
              className="admin-input-base"
              defaultValue={advisor?.name ?? ""}
              id="name"
              name="name"
              required
              type="text"
            />
          </FormField>

          <FormField htmlFor="phone" label="Teléfono">
            <input
              className="admin-input-base"
              defaultValue={advisor?.phone ?? ""}
              id="phone"
              name="phone"
              type="tel"
            />
          </FormField>

          <input name="whatsapp" type="hidden" value="" />

          <FormField htmlFor="email" label="Email">
            <input
              className="admin-input-base"
              defaultValue={advisor?.email ?? ""}
              id="email"
              name="email"
              type="email"
            />
          </FormField>
        </div>
      </div>

      <input name="isDefault" type="hidden" value={advisor?.isDefault ? "on" : ""} />

      <div className="flex justify-end border-t border-border pt-6">
        <button
          className="admin-button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitState !== "idle"}
          type="submit"
        >
          {submitState === "saving" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Guardando asesor...
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
