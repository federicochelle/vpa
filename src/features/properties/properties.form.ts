import type {
  PropertyMutationInput,
  SupabaseActionError,
} from "@/features/properties/properties.data";
import { normalizeYouTubeUrl } from "@/lib/youtube";

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

export function toPropertyErrorMessage(
  error: SupabaseActionError | null,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }

  return error.message;
}

export function buildPropertyInput(formData: FormData): PropertyMutationInput {
  const title = toRequiredString(formData.get("title"));
  const slug = slugify(toRequiredString(formData.get("slug")) || title);
  const rawVideoUrl = toRequiredString(formData.get("videoUrl"));
  const normalizedVideoUrl =
    rawVideoUrl.length > 0 ? normalizeYouTubeUrl(rawVideoUrl) : null;

  if (rawVideoUrl.length > 0 && !normalizedVideoUrl) {
    throw new Error("Ingresa una URL válida de YouTube para la propiedad.");
  }

  return {
    title,
    slug,
    operationType: toRequiredString(
      formData.get("operationType"),
      "sale",
    ) as PropertyMutationInput["operationType"],
    propertyType: toRequiredString(
      formData.get("propertyType"),
      "other",
    ),
    status: "published",
    published: true,
    featured: toBoolean(formData.get("featured")),
    price: toNullableNumber(formData.get("price")),
    currency:
      (toNullableString(formData.get("currency")) as PropertyMutationInput["currency"]) ??
      null,
    bedrooms: toNullableNumber(formData.get("bedrooms")),
    bathrooms: toNullableNumber(formData.get("bathrooms")),
    garages: toNullableNumber(formData.get("garages")),
    builtArea: toNullableNumber(formData.get("builtArea")),
    totalArea: toNullableNumber(formData.get("totalArea")),
    landArea: toNullableNumber(formData.get("landArea")),
    description: toNullableString(formData.get("description")),
    videoUrl: normalizedVideoUrl,
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
