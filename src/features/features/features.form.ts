export interface ValidFeatureName {
  name: string;
  normalizedName: string;
  slug: string;
}

export type FeatureNameValidationResult =
  | { ok: true; value: ValidFeatureName }
  | { ok: false; message: string };

export function normalizeFeatureName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeFeatureNameForComparison(value: string) {
  return normalizeFeatureName(value).toLocaleLowerCase("es-UY");
}

export function buildFeatureSlug(value: string) {
  return normalizeFeatureName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-UY")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateFeatureName(value: unknown): FeatureNameValidationResult {
  if (typeof value !== "string") {
    return { ok: false, message: "Ingresa un nombre para el amenity." };
  }

  const name = normalizeFeatureName(value);

  if (!name) {
    return { ok: false, message: "Ingresa un nombre para el amenity." };
  }

  const slug = buildFeatureSlug(name);

  if (!slug) {
    return {
      ok: false,
      message: "El nombre del amenity debe incluir letras o números.",
    };
  }

  return {
    ok: true,
    value: {
      name,
      normalizedName: normalizeFeatureNameForComparison(name),
      slug,
    },
  };
}
