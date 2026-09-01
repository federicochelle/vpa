import type { ProjectMutationInput, SupabaseActionError } from "@/features/projects/projects.data";
import { normalizeVideoUrl } from "@/lib/youtube";

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

  const normalized = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

export function toStringArray(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
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

export function toProjectErrorMessage(
  error: SupabaseActionError | null,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }

  return error.message;
}

export function buildProjectInput(formData: FormData): ProjectMutationInput {
  const name = toRequiredString(formData.get("name"));
  const slug = slugify(name);
  const rawVideoUrl = toRequiredString(formData.get("videoUrl"));
  const normalizedVideoUrl =
    rawVideoUrl.length > 0 ? normalizeVideoUrl(rawVideoUrl) : null;

  if (rawVideoUrl.length > 0 && !normalizedVideoUrl) {
    throw new Error("Ingresa una URL válida de YouTube o Instagram para el proyecto.");
  }

  return {
    name,
    slug,
    description: toNullableString(formData.get("description")),
    videoUrl: normalizedVideoUrl,
    developerName: toNullableString(formData.get("developerName")),
    constructionStatus: toRequiredString(
      formData.get("constructionStatus"),
      "presale",
    ) as ProjectMutationInput["constructionStatus"],
    estimatedDeliveryDate: toNullableString(formData.get("estimatedDeliveryDate")),
    address: toNullableString(formData.get("address")),
    neighborhood: toNullableString(formData.get("neighborhood")),
    city: toNullableString(formData.get("city")),
    department: toNullableString(formData.get("department")),
    latitude: toNullableNumber(formData.get("latitude")),
    longitude: toNullableNumber(formData.get("longitude")),
    published: true,
    featured: toBoolean(formData.get("featured")),
    isInvestmentOpportunity: toBoolean(formData.get("isInvestmentOpportunity")),
  };
}
