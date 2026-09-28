import type { PublicLocale } from "@/i18n/public/config";
import type { Feature } from "@/types/feature";
import type { Project } from "@/types/project";
import type { Property } from "@/types/property";

type LocalizedPropertyFields = Pick<
  Property,
  | "description"
  | "descriptionDe"
  | "descriptionEn"
  | "title"
  | "titleDe"
  | "titleEn"
>;

type LocalizedProjectFields = Pick<
  Project,
  | "description"
  | "descriptionDe"
  | "descriptionEn"
  | "name"
  | "nameDe"
  | "nameEn"
>;

type LocalizedFeatureFields = Pick<Feature, "name" | "nameDe" | "nameEn">;

function hasLocalizedValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function resolveLocalizedText(
  fallback: string | null | undefined,
  localized: string | null | undefined,
) {
  return hasLocalizedValue(localized) ? localized : fallback;
}

export function getLocalizedPropertyTitle(
  property: LocalizedPropertyFields,
  locale: PublicLocale,
) {
  if (locale === "en") {
    return resolveLocalizedText(property.title, property.titleEn) ?? "";
  }

  if (locale === "de") {
    return resolveLocalizedText(property.title, property.titleDe) ?? "";
  }

  return property.title;
}

export function getLocalizedPropertyDescription(
  property: LocalizedPropertyFields,
  locale: PublicLocale,
) {
  if (locale === "en") {
    return resolveLocalizedText(property.description, property.descriptionEn) ?? null;
  }

  if (locale === "de") {
    return resolveLocalizedText(property.description, property.descriptionDe) ?? null;
  }

  return property.description;
}

export function getLocalizedProjectName(
  project: LocalizedProjectFields,
  locale: PublicLocale,
) {
  if (locale === "en") {
    return resolveLocalizedText(project.name, project.nameEn) ?? "";
  }

  if (locale === "de") {
    return resolveLocalizedText(project.name, project.nameDe) ?? "";
  }

  return project.name;
}

export function getLocalizedProjectDescription(
  project: LocalizedProjectFields,
  locale: PublicLocale,
) {
  if (locale === "en") {
    return resolveLocalizedText(project.description, project.descriptionEn) ?? null;
  }

  if (locale === "de") {
    return resolveLocalizedText(project.description, project.descriptionDe) ?? null;
  }

  return project.description;
}

export function getLocalizedFeatureName(
  feature: LocalizedFeatureFields,
  locale: PublicLocale,
) {
  if (locale === "en") {
    return resolveLocalizedText(feature.name, feature.nameEn) ?? "";
  }

  if (locale === "de") {
    return resolveLocalizedText(feature.name, feature.nameDe) ?? "";
  }

  return feature.name;
}
