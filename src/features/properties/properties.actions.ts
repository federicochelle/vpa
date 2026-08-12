"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  createProperty,
  deleteProperty,
  setPropertyPublished,
  updateProperty,
  type PropertyMutationInput,
  type SupabaseActionError,
} from "@/features/properties/properties.data";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toRequiredString(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function toNullableNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toErrorMessage(error: SupabaseActionError | null, fallback: string) {
  if (!error) {
    return fallback;
  }

  return error.message;
}

function buildPropertyInput(formData: FormData): PropertyMutationInput {
  const title = toRequiredString(formData.get("title"));
  const slug = slugify(toRequiredString(formData.get("slug")) || title);
  const published = toBoolean(formData.get("published"));
  const rawStatus = toRequiredString(formData.get("status"), "draft");
  const status =
    published && rawStatus === "draft"
      ? "published"
      : (rawStatus as PropertyMutationInput["status"]);

  return {
    title,
    slug,
    operationType: toRequiredString(formData.get("operationType"), "sale") as PropertyMutationInput["operationType"],
    propertyType: toRequiredString(formData.get("propertyType"), "other"),
    status,
    published,
    featured: toBoolean(formData.get("featured")),
    price: toNullableNumber(formData.get("price")),
    currency: (toNullableString(formData.get("currency")) as PropertyMutationInput["currency"]) ?? null,
    bedrooms: toNullableNumber(formData.get("bedrooms")),
    bathrooms: toNullableNumber(formData.get("bathrooms")),
    garages: toNullableNumber(formData.get("garages")),
    builtArea: toNullableNumber(formData.get("builtArea")),
    totalArea: toNullableNumber(formData.get("totalArea")),
    landArea: toNullableNumber(formData.get("landArea")),
    description: toNullableString(formData.get("description")),
    address: toNullableString(formData.get("address")),
    neighborhood: toNullableString(formData.get("neighborhood")),
    city: toNullableString(formData.get("city")),
    department: toNullableString(formData.get("department")),
    latitude: toNullableNumber(formData.get("latitude")),
    longitude: toNullableNumber(formData.get("longitude")),
    expenses: toNullableNumber(formData.get("expenses")),
    constructionYear: toNullableNumber(formData.get("constructionYear")),
    investmentOpportunity: toBoolean(formData.get("investmentOpportunity")),
  };
}

export async function createPropertyAction(formData: FormData) {
  await requireAdminSession();
  const result = await createProperty(buildPropertyInput(formData));

  if (!result.ok || !result.data) {
    redirect(
      `/admin/propiedades/nueva?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo crear la propiedad."),
      )}`,
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");
  redirect(
    `/admin/propiedades/${result.data.id}/editar?success=${encodeURIComponent(
      "Propiedad creada.",
    )}`,
  );
}

export async function updatePropertyAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const result = await updateProperty(id, buildPropertyInput(formData));

  if (!result.ok || !result.data) {
    redirect(
      `/admin/propiedades/${id}/editar?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo actualizar la propiedad."),
      )}`,
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${id}/editar`);
  revalidatePath("/propiedades");
  if (result.data.slug) {
    revalidatePath(`/propiedades/${result.data.slug}`);
  }
  redirect(
    `/admin/propiedades/${id}/editar?success=${encodeURIComponent(
      "Propiedad actualizada.",
    )}`,
  );
}

export async function deletePropertyAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const result = await deleteProperty(id);

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");

  if (!result.ok) {
    redirect(
      `/admin/propiedades?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo eliminar la propiedad."),
      )}`,
    );
  }

  redirect(
    `/admin/propiedades?success=${encodeURIComponent("Propiedad eliminada.")}`,
  );
}

export async function togglePropertyPublishedAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const published = toRequiredString(formData.get("published")) === "true";
  const result = await setPropertyPublished(id, published);

  revalidatePath("/admin/propiedades");
  revalidatePath("/propiedades");

  if (!result.ok || !result.data) {
    redirect(
      `/admin/propiedades?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo cambiar la publicacion."),
      )}`,
    );
  }

  revalidatePath(`/propiedades/${result.data.slug}`);
  redirect(
    `/admin/propiedades?success=${encodeURIComponent(
      published ? "Propiedad publicada." : "Propiedad despublicada.",
    )}`,
  );
}
