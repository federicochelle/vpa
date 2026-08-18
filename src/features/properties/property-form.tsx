"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderCircle, Star, Trash2 } from "lucide-react";
import type { Feature } from "@/types/feature";
import type { Property, PropertyImage } from "@/types/property";
import { FormField } from "@/components/ui/form-field";
import { FeaturesPicker } from "@/features/features/features-picker";
import {
  ImagesPicker,
  type PendingImage,
} from "@/features/images/images-picker";
import {
  currencyOptions,
  operationTypeOptions,
  propertyTypeOptions,
} from "@/features/properties/property-options";
import { PriceInput } from "@/features/properties/price-input";

interface PropertyFormProps {
  allFeatures: Feature[];
  selectedFeatureIds?: string[];
  property?: Property | null;
  propertyImages?: PropertyImage[];
  submitLabel: string;
  className?: string;
  readOnly?: boolean;
}

interface PersistedPropertyImageItemProps {
  image: PropertyImage;
  onDelete: (imageId: string) => Promise<void>;
  onSetCover: (imageId: string) => Promise<void>;
  deleting: boolean;
  updatingCover: boolean;
  readOnly?: boolean;
}

interface FormToggleProps {
  defaultChecked?: boolean;
  disabled?: boolean;
  description: string;
  label: string;
  name: string;
}

type PropertySubmitState = "idle" | "saving" | "uploading";
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

function FormToggle({
  defaultChecked = false,
  disabled = false,
  description,
  label,
  name,
}: FormToggleProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border bg-white/70 px-4 py-4">
      <input
        className="mt-1 h-4 w-4 accent-primary"
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        type="checkbox"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-sm leading-6 text-muted">{description}</span>
      </span>
    </label>
  );
}

async function uploadProcessedFileToCloudflare(propertyId: string, image: PendingImage) {
  const directUploadResponse = await fetch(
    `/api/admin/properties/${propertyId}/images/direct-upload`,
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

async function persistPropertyImage(
  propertyId: string,
  payload: { publicId: string; sortOrder: number; isCover: boolean },
) {
  const response = await fetch(`/api/admin/properties/${propertyId}/images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        image?: PropertyImage;
        message?: string;
      }
    | null;

  if (!response.ok || !body?.image) {
    throw new Error(body?.message ?? "No se pudo guardar la imagen de la propiedad.");
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

function PersistedPropertyImageItem({
  image,
  onDelete,
  onSetCover,
  deleting,
  updatingCover,
  readOnly = false,
}: PersistedPropertyImageItemProps) {
  return (
    <article className="group overflow-hidden border border-border bg-white">
      <div className="relative aspect-[4/3] bg-surface-muted">
        <Image
          alt={`Imagen de propiedad ${image.id}`}
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
    </article>
  );
}

export function PropertyForm({
  allFeatures,
  property,
  propertyImages = [],
  selectedFeatureIds = [],
  submitLabel,
  className = "panel p-6 sm:p-8",
  readOnly = false,
}: PropertyFormProps) {
  const router = useRouter();
  const existingPropertyId = property?.id ?? null;
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [persistedImages, setPersistedImages] = useState<PropertyImage[]>(propertyImages);
  const [submitState, setSubmitState] = useState<PropertySubmitState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);
  const [coverUpdatingImageId, setCoverUpdatingImageId] = useState<string | null>(null);

  async function handleDeletePersistedImage(imageId: string) {
    if (readOnly) {
      return;
    }

    if (!existingPropertyId) {
      return;
    }

    setDeletingImageIds((current) => [...current, imageId]);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/admin/properties/${existingPropertyId}/images/${imageId}`,
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

    if (!existingPropertyId) {
      return;
    }

    setCoverUpdatingImageId(imageId);
    setFormError(null);

    try {
      const response = await fetch(
        `/api/admin/properties/${existingPropertyId}/images/${imageId}`,
        {
          method: "PATCH",
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            coverImage?: PropertyImage;
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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(existingPropertyId);

    try {
      setSubmitState("saving");

      const propertyResponse = await fetch(
        isEditing && existingPropertyId
          ? `/api/admin/properties/${existingPropertyId}`
          : "/api/admin/properties",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        },
      );

      const propertyPayload = (await propertyResponse.json().catch(() => null)) as
        | {
            property?: Property;
            message?: string;
          }
        | null;

      if (!propertyResponse.ok || !propertyPayload?.property) {
        throw new Error(
          propertyPayload?.message ??
            (isEditing
              ? "No se pudo actualizar la propiedad."
              : "No se pudo crear la propiedad."),
        );
      }

      const nextProperty = propertyPayload.property;
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
              nextProperty.id,
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
            const persistedImage = await persistPropertyImage(nextProperty.id, {
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
                `/admin/propiedades/${nextProperty.id}/editar?error=${encodeURIComponent(
                  "La propiedad se creo, pero una o mas imagenes fallaron. Puedes reintentar desde la edicion.",
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
        if (isEditing) {
          router.push(
            "/admin/propiedades?updated=Propiedad%20actualizada%20correctamente.",
          );
        } else {
          router.push(
            `/admin/propiedades/${nextProperty.id}/editar?success=${encodeURIComponent(
              "Propiedad creada correctamente.",
            )}`,
          );
        }
        router.refresh();
      });
    } catch (error) {
      setSubmitState("idle");
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar la propiedad.",
      );
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {existingPropertyId ? <input name="id" type="hidden" value={existingPropertyId} /> : null}

      {formError ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/6 px-4 py-4 text-sm text-primary-strong">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-3">
          <FormField htmlFor="title" label="Título">
            <input
              className="input-base"
              defaultValue={property?.title ?? ""}
              disabled={readOnly}
              id="title"
              name="title"
              required
              type="text"
            />
          </FormField>
        </div>
        <div className="xl:col-span-3 grid gap-6 sm:grid-cols-2">
          <FormField htmlFor="operationType" label="Operación">
            <select
              className="input-base"
              defaultValue={property?.operationType ?? "sale"}
              disabled={readOnly}
              id="operationType"
              name="operationType"
            >
              {operationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField htmlFor="propertyType" label="Tipo de propiedad">
            <select
              className="input-base"
              defaultValue={property?.propertyType ?? "apartment"}
              disabled={readOnly}
              id="propertyType"
              name="propertyType"
            >
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="xl:col-span-3">
          <FormField htmlFor="price" label="Precio">
            <div className="flex overflow-hidden rounded-2xl border border-border bg-white transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/8">
              <PriceInput defaultValue={property?.price ?? null} disabled={readOnly} />
              <select
                className="w-24 border-0 border-l border-border bg-surface-strong px-3 py-3 text-sm font-semibold text-foreground outline-none"
                defaultValue={property?.currency ?? "UYU"}
                disabled={readOnly}
                id="currency"
                name="currency"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </FormField>
        </div>
        <div className="xl:col-span-3">
          <FormField htmlFor="expenses" label="Gastos comunes">
            <div className="overflow-hidden rounded-2xl border border-border bg-white transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/8">
              <PriceInput
                defaultValue={property?.expenses ?? null}
                disabled={readOnly}
                id="expenses"
                name="expenses"
              />
            </div>
          </FormField>
        </div>
        <div className="md:col-span-2 xl:col-span-6">
          <div className="border-t border-border" />
        </div>
        <div>
          <FormField htmlFor="bedrooms" label="Dormitorios">
            <input
              className="input-base"
              defaultValue={property?.bedrooms ?? ""}
              disabled={readOnly}
              id="bedrooms"
              name="bedrooms"
              type="number"
            />
          </FormField>
        </div>
        <FormField htmlFor="bathrooms" label="Baños">
          <input
            className="input-base"
            defaultValue={property?.bathrooms ?? ""}
            disabled={readOnly}
            id="bathrooms"
            name="bathrooms"
            type="number"
          />
        </FormField>
        <FormField htmlFor="garages" label="Garages">
          <input
            className="input-base"
            defaultValue={property?.garages ?? ""}
            disabled={readOnly}
            id="garages"
            name="garages"
            type="number"
          />
        </FormField>
        <FormField htmlFor="builtArea" label="Área construida">
          <input
            className="input-base"
            defaultValue={property?.builtArea ?? ""}
            disabled={readOnly}
            id="builtArea"
            name="builtArea"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="totalArea" label="Área total">
          <input
            className="input-base"
            defaultValue={property?.totalArea ?? ""}
            disabled={readOnly}
            id="totalArea"
            name="totalArea"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="constructionYear" label="Año de construcción">
          <input
            className="input-base"
            defaultValue={property?.constructionYear ?? ""}
            disabled={readOnly}
            id="constructionYear"
            name="constructionYear"
            type="number"
          />
        </FormField>
        <div className="md:col-span-2 xl:col-span-6">
          <div className="border-t border-border" />
        </div>
        <div className="xl:col-span-4">
          <FormField htmlFor="address" label="Dirección">
            <input
              className="input-base"
              defaultValue={property?.address ?? ""}
              disabled={readOnly}
              id="address"
              name="address"
              type="text"
            />
          </FormField>
        </div>
        <div className="xl:col-span-2">
          <FormField htmlFor="neighborhood" label="Barrio">
            <input
              className="input-base"
              defaultValue={property?.neighborhood ?? ""}
              disabled={readOnly}
              id="neighborhood"
              name="neighborhood"
              type="text"
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6">
        <FormField htmlFor="description" label="Descripción">
          <textarea
            className="input-base min-h-40"
            defaultValue={property?.description ?? ""}
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
          {persistedImages.length > 0 ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-primary-strong">
                  Galería de imágenes
                </h3>
                {readOnly ? null : (
                  <p className="text-xs leading-6 text-muted">
                    Estas imágenes ya están persistidas en Cloudflare y Supabase.
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {persistedImages
                  .slice()
                  .sort((left, right) => left.sortOrder - right.sortOrder)
                  .map((image) => (
                    <PersistedPropertyImageItem
                      deleting={deletingImageIds.includes(image.id)}
                      image={image}
                      key={image.id}
                      onDelete={handleDeletePersistedImage}
                      onSetCover={handleSetCoverImage}
                      readOnly={readOnly}
                      updatingCover={coverUpdatingImageId === image.id}
                    />
                  ))}
              </div>
            </div>
          ) : null}

          {readOnly ? null : (
            <ImagesPicker
              disabled={submitState !== "idle"}
              label="Galeria de imagenes"
              onChange={setPendingImages}
              value={pendingImages}
            />
          )}
        </div>
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
                Guardando propiedad...
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
