import type {
  Currency,
  KitchenType,
  OperationType,
  PropertyDisposition,
  PropertyOrientation,
  PropertyType,
} from "@/types/property";
import type { ConstructionStatus, ProjectUnitStatus } from "@/types/project";
import type { PublicLocale } from "@/i18n/public/config";

const localeCode: Record<PublicLocale, string> = {
  es: "es-UY",
  en: "en-US",
};

const enumLabels = {
  operation: {
    sale: { es: "Venta", en: "Sale" },
    rent: { es: "Alquiler", en: "Rent" },
  },
  propertyType: {
    apartment: { es: "Apartamento", en: "Apartment" },
    house: { es: "Casa", en: "House" },
    land: { es: "Terreno", en: "Land" },
    office: { es: "Oficina", en: "Office" },
    "commercial-space": { es: "Local comercial", en: "Commercial space" },
    other: { es: "Otro", en: "Other" },
  },
  kitchen: {
    integrated: { es: "Cocina integrada", en: "Open-plan kitchen" },
    independent: { es: "Cocina independiente", en: "Separate kitchen" },
  },
  disposition: {
    front: { es: "Frente", en: "Front-facing" },
    back: { es: "Contrafrente", en: "Rear-facing" },
    lateral: { es: "Lateral", en: "Side-facing" },
    interior: { es: "Interior", en: "Interior" },
  },
  orientation: {
    north: { es: "Norte", en: "North" },
    south: { es: "Sur", en: "South" },
    east: { es: "Este", en: "East" },
    west: { es: "Oeste", en: "West" },
    northeast: { es: "Noreste", en: "Northeast" },
    northwest: { es: "Noroeste", en: "Northwest" },
    southeast: { es: "Sureste", en: "Southeast" },
    southwest: { es: "Suroeste", en: "Southwest" },
  },
  construction: {
    presale: { es: "En pozo", en: "Pre-construction" },
    construction: { es: "Construcción", en: "Under construction" },
    immediate_occupancy: { es: "Ocupación inmediata", en: "Immediate occupancy" },
  },
  unitStatus: {
    available: { es: "Disponible", en: "Available" },
    reserved: { es: "Reservada", en: "Reserved" },
    sold: { es: "Vendida", en: "Sold" },
  },
} as const;

function getEnumLabel<T extends Record<string, Record<PublicLocale, string>>>(
  labels: T,
  value: keyof T,
  locale: PublicLocale,
) {
  return labels[value][locale];
}

export function formatPublicCurrency(
  value: number,
  currency: Currency,
  locale: PublicLocale,
) {
  return new Intl.NumberFormat(localeCode[locale], {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatPublicDate(value: Date | string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeCode[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getOperationLabel(value: OperationType, locale: PublicLocale) {
  return getEnumLabel(enumLabels.operation, value, locale);
}

export function getPropertyTypeLabel(value: PropertyType, locale: PublicLocale) {
  return getEnumLabel(enumLabels.propertyType, value, locale);
}

export function getKitchenTypeLabel(value: KitchenType, locale: PublicLocale) {
  return getEnumLabel(enumLabels.kitchen, value, locale);
}

export function getDispositionLabel(value: PropertyDisposition, locale: PublicLocale) {
  return getEnumLabel(enumLabels.disposition, value, locale);
}

export function getOrientationLabel(value: PropertyOrientation, locale: PublicLocale) {
  return getEnumLabel(enumLabels.orientation, value, locale);
}

export function getConstructionStatusLabel(value: ConstructionStatus, locale: PublicLocale) {
  return getEnumLabel(enumLabels.construction, value, locale);
}

export function getProjectUnitStatusLabel(value: ProjectUnitStatus, locale: PublicLocale) {
  return getEnumLabel(enumLabels.unitStatus, value, locale);
}

