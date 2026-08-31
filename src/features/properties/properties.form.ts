import type {
  PropertyMutationInput,
  SupabaseActionError,
} from "@/features/properties/properties.data";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import type {
  KitchenType,
  PropertyDisposition,
  PropertyOrientation,
  PropertyType,
} from "@/types/property";

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

function toNullableEnumString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toEnumValue<T extends string>(
  value: FormDataEntryValue | null,
  allowedValues: readonly T[],
  fieldLabel: string,
): T | null {
  const normalizedValue = toNullableEnumString(value);

  if (!normalizedValue) {
    return null;
  }

  if (!allowedValues.includes(normalizedValue as T)) {
    throw new Error(`El campo ${fieldLabel} tiene un valor inválido.`);
  }

  return normalizedValue as T;
}

const kitchenTypeValues = ["integrated", "independent"] as const satisfies readonly KitchenType[];
const dispositionValues =
  ["front", "back", "lateral", "interior"] as const satisfies readonly PropertyDisposition[];
const orientationValues = [
  "north",
  "south",
  "east",
  "west",
  "northeast",
  "northwest",
  "southeast",
  "southwest",
] as const satisfies readonly PropertyOrientation[];

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
  const propertyType = toRequiredString(
    formData.get("propertyType"),
    "other",
  ) as PropertyType;
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
    propertyType,
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
    totalArea: toNullableNumber(formData.get("totalArea")),
    kitchenType: toEnumValue(formData.get("kitchenType"), kitchenTypeValues, "cocina"),
    hasBalcony: toBoolean(formData.get("hasBalcony")),
    hasTerrace: toBoolean(formData.get("hasTerrace")),
    disposition: toEnumValue(
      formData.get("disposition"),
      dispositionValues,
      "disposición",
    ),
    orientation: toEnumValue(
      formData.get("orientation"),
      orientationValues,
      "orientación",
    ),
    floor:
      propertyType === "apartment"
        ? toNullableString(formData.get("floor"))
        : null,
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
