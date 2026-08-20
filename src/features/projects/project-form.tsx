"use client";

import { startTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { GooglePlacesAddressInput } from "@/components/admin/google-places-address-input";
import { YouTubeVideoField } from "@/components/admin/youtube-video-field";
import { FormField } from "@/components/ui/form-field";
import { FeaturesPicker } from "@/features/features/features-picker";
import {
  ImagesPicker,
  type PendingImage,
} from "@/features/images/images-picker";
import type { Feature } from "@/types/feature";
import type { Project, ProjectImage } from "@/types/project";
import { parseYouTubeUrl } from "@/lib/youtube";

interface ProjectFormProps {
  allFeatures: Feature[];
  selectedFeatureIds?: string[];
  project?: Project | null;
  projectImages?: ProjectImage[];
  submitLabel: string;
  className?: string;
  readOnly?: boolean;
}

interface PersistedProjectImageItemProps {
  image: ProjectImage;
  onDelete: (imageId: string) => Promise<void>;
  onSetCover: (imageId: string) => Promise<void>;
  deleting: boolean;
  updatingCover: boolean;
  readOnly?: boolean;
}

type ProjectSubmitState = "idle" | "saving" | "uploading";
type UploadTaskResult =
  | {
      ok: true;
      pendingImageId: string;
      publicId: string;
      sortOrder: number;
    }
  | {
      ok: false;
      pendingImageId: string;
      publicId: null;
      sortOrder: number;
      error: string;
    };

const MAX_PARALLEL_UPLOADS = 3;

async function uploadProcessedFileToCloudflare(projectId: string, image: PendingImage) {
  const directUploadResponse = await fetch(
    `/api/admin/projects/${projectId}/images/direct-upload`,
    {
      method: "POST",
    },
  );

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

  const uploadFormData = new FormData();

  if (!image.file) {
    throw new Error("No encontramos el archivo procesado para subir.");
  }

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

async function persistProjectImage(
  projectId: string,
  payload: { publicId: string; sortOrder: number; isCover: boolean },
) {
  const response = await fetch(`/api/admin/projects/${projectId}/images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        image?: ProjectImage;
        message?: string;
      }
    | null;

  if (!response.ok || !body?.image) {
    throw new Error(body?.message ?? "No se pudo guardar la imagen del proyecto.");
  }

  return body.image;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
) {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );

  return results;
}

function PersistedProjectImageItem({
  image,
  onDelete,
  onSetCover,
  deleting,
  updatingCover,
  readOnly = false,
}: PersistedProjectImageItemProps) {
  return (
    <article className="group overflow-hidden border border-border bg-white">
      <div className="relative aspect-[4/3] bg-surface-muted">
        <Image
          alt={`Imagen de proyecto ${image.id}`}
          className="object-cover"
          fill
          sizes="(min-width: 1280px) 24rem, (min-width: 640px) 50vw, 100vw"
          src={image.url}
          unoptimized
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[11px]">
          {image.isCover ? <span className="status-pill">Portada</span> : null}
        </div>
        {readOnly ? null : (
          <div className="absolute right-3 top-3 z-10 flex items-start gap-2">
            <button
              aria-label={image.isCover ? "Imagen de portada" : "Marcar como portada"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deleting || updatingCover}
              onClick={() => {
                if (!image.isCover) {
                  void onSetCover(image.id);
                }
              }}
              title={image.isCover ? "Imagen de portada" : "Marcar como portada"}
              type="button"
            >
              {updatingCover ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Star
                  className={
                    image.isCover
                      ? "h-4 w-4 fill-current text-primary"
                      : "h-4 w-4 text-foreground"
                  }
                />
              )}
            </button>
            <button
              aria-label="Eliminar imagen guardada"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:opacity-0 md:group-hover:opacity-100"
              disabled={deleting || updatingCover}
              onClick={() => {
                void onDelete(image.id);
              }}
              type="button"
            >
              {deleting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
      {readOnly ? null : (
        <div className="space-y-2 px-4 py-4">
          <p className="text-sm font-semibold text-foreground">Imagen guardada</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span>{image.publicId ?? "Sin public_id"}</span>
          </div>
        </div>
      )}
    </article>
  );
}

export function ProjectForm({
  allFeatures,
  project,
  projectImages = [],
  selectedFeatureIds = [],
  submitLabel,
  className = "panel p-6 sm:p-8",
  readOnly = false,
}: ProjectFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const existingProjectId = project?.id ?? null;
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [persistedImages, setPersistedImages] = useState<ProjectImage[]>(projectImages);
  const [submitState, setSubmitState] = useState<ProjectSubmitState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);
  const [coverUpdatingImageId, setCoverUpdatingImageId] = useState<string | null>(null);
  const galleryInputId = "project-gallery-input";

  async function handleDeletePersistedImage(imageId: string) {
    if (readOnly) {
      return;
    }

    if (!existingProjectId) {
      return;
    }

    setDeletingImageIds((current) => [...current, imageId]);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${existingProjectId}/images/${imageId}`,
        {
          method: "DELETE",
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            deletedImageId?: string;
            nextCoverImageId?: string | null;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.deletedImageId) {
        throw new Error(payload?.message ?? "No se pudo eliminar la imagen guardada.");
      }

      setPersistedImages((currentImages) => {
        const remainingImages = currentImages.filter(
          (image) => image.id !== payload.deletedImageId,
        );

        if (!payload.nextCoverImageId) {
          return remainingImages;
        }

        return remainingImages.map((image) => ({
          ...image,
          isCover: image.id === payload.nextCoverImageId,
        }));
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen guardada.",
      );
    } finally {
      setDeletingImageIds((current) => current.filter((id) => id !== imageId));
    }
  }

  async function handleSetCoverImage(imageId: string) {
    if (readOnly) {
      return;
    }

    if (!existingProjectId) {
      return;
    }

    setCoverUpdatingImageId(imageId);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${existingProjectId}/images/${imageId}`,
        {
          method: "PATCH",
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            coverImage?: ProjectImage;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.coverImage) {
        throw new Error(payload?.message ?? "No se pudo actualizar la portada.");
      }

      setPersistedImages((currentImages) =>
        currentImages.map((image) => ({
          ...image,
          isCover: image.id === payload.coverImage?.id,
        })),
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo actualizar la portada.",
      );
    } finally {
      setCoverUpdatingImageId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (readOnly) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setFormError(null);
    if (videoUrl.trim().length > 0 && !parseYouTubeUrl(videoUrl)) {
      setFormError("Ingresa una URL válida de YouTube para el proyecto.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(existingProjectId);

    try {
      setSubmitState("saving");

      const projectResponse = await fetch(
        isEditing && existingProjectId
          ? `/api/admin/projects/${existingProjectId}`
          : "/api/admin/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        },
      );

      const projectPayload = (await projectResponse.json().catch(() => null)) as
        | {
            project?: Project;
            message?: string;
          }
        | null;

      if (!projectResponse.ok || !projectPayload?.project) {
        throw new Error(
          projectPayload?.message ??
            (isEditing
              ? "No se pudo actualizar el proyecto."
              : "No se pudo crear el proyecto."),
        );
      }

      const nextProject = projectPayload.project;
      const readyImages = pendingImages.filter(
        (image) => image.status === "ready" && image.file,
      );

      if (readyImages.length > 0) {
        setSubmitState("uploading");

        const baseSortOrder =
          persistedImages.length > 0
            ? Math.max(...persistedImages.map((image) => image.sortOrder)) + 1
            : 0;
        const uploads = readyImages.map((image, index) => async (): Promise<UploadTaskResult> => {
          const assignedSortOrder = baseSortOrder + index;

          setPendingImages((currentImages) =>
            currentImages.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    status: "uploading",
                    error: null,
                  }
                : currentImage,
            ),
          );

          try {
            const uploadResult = await uploadProcessedFileToCloudflare(
              nextProject.id,
              image,
            );

            return {
              ok: true as const,
              pendingImageId: image.id,
              publicId: uploadResult.imageId,
              sortOrder: assignedSortOrder,
            };
          } catch (error) {
            return {
              ok: false as const,
              pendingImageId: image.id,
              publicId: null,
              sortOrder: assignedSortOrder,
              error:
                error instanceof Error
                  ? error.message
                  : "No se pudo subir la imagen.",
            };
          }
        });

        const uploadResults = await runWithConcurrency(uploads, MAX_PARALLEL_UPLOADS);
        let hasCover = persistedImages.some((image) => image.isCover);
        let failedImagesCount = 0;

        for (const uploadResult of uploadResults.sort(
          (left, right) => left.sortOrder - right.sortOrder,
        )) {
          if (!uploadResult.ok) {
            failedImagesCount += 1;
            setPendingImages((currentImages) =>
              currentImages.map((currentImage) =>
                currentImage.id === uploadResult.pendingImageId
                  ? {
                      ...currentImage,
                      status: "error",
                      error: uploadResult.error ?? "No se pudo subir la imagen.",
                    }
                  : currentImage,
              ),
            );
            continue;
          }

          if (!uploadResult.publicId) {
            failedImagesCount += 1;
            setPendingImages((currentImages) =>
              currentImages.map((currentImage) =>
                currentImage.id === uploadResult.pendingImageId
                  ? {
                      ...currentImage,
                      status: "error",
                      error: "Cloudflare no devolvio un identificador valido.",
                    }
                  : currentImage,
              ),
            );
            continue;
          }

          try {
            const persistedImage = await persistProjectImage(nextProject.id, {
              publicId: uploadResult.publicId,
              sortOrder: uploadResult.sortOrder,
              isCover: !hasCover,
            });

            hasCover = hasCover || persistedImage.isCover;
            setPersistedImages((currentImages) => [...currentImages, persistedImage]);
            setPendingImages((currentImages) =>
              currentImages.filter(
                (currentImage) => currentImage.id !== uploadResult.pendingImageId,
              ),
            );
          } catch (error) {
            failedImagesCount += 1;
            setPendingImages((currentImages) =>
              currentImages.map((currentImage) =>
                currentImage.id === uploadResult.pendingImageId
                  ? {
                      ...currentImage,
                      status: "error",
                      error:
                        error instanceof Error
                          ? error.message
                          : "No se pudo persistir la imagen.",
                    }
                  : currentImage,
              ),
            );
          }
        }

        if (failedImagesCount > 0) {
          setSubmitState("idle");

          if (!isEditing) {
            startTransition(() => {
              router.push(
                `/admin/proyectos/${nextProject.id}/editar?error=${encodeURIComponent(
                  "El proyecto se creo, pero una o mas imagenes fallaron. Puedes reintentar desde la edicion.",
                )}`,
              );
              router.refresh();
            });
            return;
          }

          setFormError(
            "Una o mas imagenes no pudieron completarse. Las imagenes correctas ya quedaron guardadas.",
          );
          startTransition(() => {
            router.refresh();
          });
          return;
        }
      }

      setSubmitState("idle");
      startTransition(() => {
        router.push(
          isEditing
            ? "/admin/proyectos?updated=Proyecto%20actualizado%20correctamente."
            : "/admin/proyectos?created=Proyecto%20creado%20correctamente.",
        );
        router.refresh();
      });
    } catch (error) {
      setSubmitState("idle");
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar el proyecto.",
      );
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit} ref={formRef}>
      {existingProjectId ? <input name="id" type="hidden" value={existingProjectId} /> : null}

      {formError ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/6 px-4 py-4 text-sm text-primary-strong">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-3">
          <FormField htmlFor="name" label="Nombre">
            <input
              className="input-base"
              defaultValue={project?.name ?? ""}
              disabled={readOnly}
              id="name"
              name="name"
              required
              type="text"
            />
          </FormField>
        </div>
        <div className="xl:col-span-3">
          <FormField htmlFor="developerName" label="Desarrollador">
            <input
              className="input-base"
              defaultValue={project?.developerName ?? ""}
              disabled={readOnly}
              id="developerName"
              name="developerName"
              type="text"
            />
          </FormField>
        </div>
        <div className="xl:col-span-6 grid gap-6 md:grid-cols-2">
          <FormField htmlFor="constructionStatus" label="Estado de construcción">
            <select
              className="input-base"
              defaultValue={project?.constructionStatus ?? "planned"}
              disabled={readOnly}
              id="constructionStatus"
              name="constructionStatus"
            >
              <option value="planned">Planificado</option>
              <option value="under_construction">En construcción</option>
              <option value="finished">Finalizado</option>
            </select>
          </FormField>
          <FormField htmlFor="estimatedDeliveryDate" label="Fecha estimada de entrega">
            <input
              className="input-base"
              defaultValue={project?.estimatedDeliveryDate ?? ""}
              disabled={readOnly}
              id="estimatedDeliveryDate"
              name="estimatedDeliveryDate"
              type="date"
            />
          </FormField>
        </div>
        <div className="md:col-span-2 xl:col-span-6">
          <div className="border-t border-border" />
        </div>
        <div className="xl:col-span-4">
          <FormField htmlFor="address" label="Dirección">
            <GooglePlacesAddressInput
              className="input-base"
              defaultValue={project?.address ?? ""}
              disabled={readOnly}
              id="address"
              name="address"
            />
          </FormField>
        </div>
        <div className="xl:col-span-2">
          <FormField htmlFor="neighborhood" label="Barrio">
            <input
              className="input-base"
              defaultValue={project?.neighborhood ?? ""}
              disabled={readOnly}
              id="neighborhood"
              name="neighborhood"
              type="text"
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-6">
        <FormField htmlFor="description" label="Descripción">
          <textarea
            className="input-base min-h-40"
            defaultValue={project?.description ?? ""}
            disabled={readOnly}
            id="description"
            name="description"
          />
        </FormField>
      </div>
      <div className="mt-6 pt-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-primary-strong">Amenities</span>
          {readOnly ? (
            selectedFeatureIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedFeatureIds
                  .map((featureId) => allFeatures.find((feature) => feature.id === featureId))
                  .filter((feature): feature is Feature => Boolean(feature))
                  .map((feature) => (
                    <span
                      className="inline-flex items-center rounded-full border border-primary/12 bg-primary/8 px-3 py-2 text-sm font-medium text-primary-strong"
                      key={feature.id}
                    >
                      {feature.name}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Sin amenities seleccionados.</p>
            )
          ) : (
            <FeaturesPicker
              allFeatures={allFeatures}
              initialSelectedIds={selectedFeatureIds}
            />
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-primary-strong">Galería de imágenes</h3>
            {readOnly ? null : (
              <label
                className="button-secondary inline-flex cursor-pointer items-center gap-2"
                htmlFor={galleryInputId}
              >
                <ImagePlus className="h-4 w-4" />
                Seleccionar imágenes
              </label>
            )}
          </div>
          {persistedImages.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {persistedImages
                  .slice()
                  .sort((left, right) => left.sortOrder - right.sortOrder)
                  .map((image) => (
                    <PersistedProjectImageItem
                      deleting={!readOnly && deletingImageIds.includes(image.id)}
                      image={image}
                      key={image.id}
                      onDelete={handleDeletePersistedImage}
                      onSetCover={handleSetCoverImage}
                      readOnly={readOnly}
                      updatingCover={!readOnly && coverUpdatingImageId === image.id}
                    />
                  ))}
              </div>
            </div>
          ) : null}

          {readOnly ? null : (
            <ImagesPicker
              disabled={submitState !== "idle"}
              hideEmptyState
              inputId={galleryInputId}
              label="Galeria de imagenes"
              onChange={setPendingImages}
              showHeader={false}
              value={pendingImages}
            />
          )}
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-6">
        <YouTubeVideoField
          disabled={submitState !== "idle"}
          idPrefix="project"
          onChange={setVideoUrl}
          readOnly={readOnly}
          value={videoUrl}
        />
      </div>
      {readOnly ? null : (
        <div className="mt-8 flex justify-end">
          <button
            className="button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitState !== "idle"}
            type="submit"
          >
            {submitState === "saving" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Guardando proyecto...
              </>
            ) : submitState === "uploading" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Subiendo imágenes...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      )}
    </form>
  );
}
