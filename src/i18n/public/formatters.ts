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
  de: "de-DE",
  es: "es-UY",
  en: "en-US",
};

const enumLabels = {
  operation: {
    sale: { de: "Kauf", es: "Venta", en: "Sale" },
    rent: { de: "Miete", es: "Alquiler", en: "Rent" },
  },
  propertyType: {
    apartment: { de: "Wohnung", es: "Apartamento", en: "Apartment" },
    house: { de: "Haus", es: "Casa", en: "House" },
    land: { de: "Grundstück", es: "Terreno", en: "Land" },
    office: { de: "Büro", es: "Oficina", en: "Office" },
    "commercial-space": { de: "Gewerbefläche", es: "Local comercial", en: "Commercial space" },
    "business-key": { de: "Geschäftsübernahme", es: "Llave de comercio", en: "Business key" },
    other: { de: "Sonstige", es: "Otro", en: "Other" },
  },
  kitchen: {
    integrated: { de: "Offene Küche", es: "Cocina integrada", en: "Open-plan kitchen" },
    independent: { de: "Separate Küche", es: "Cocina independiente", en: "Separate kitchen" },
  },
  disposition: {
    front: { de: "Zur Straße", es: "Frente", en: "Front-facing" },
    back: { de: "Rückwärtig", es: "Contrafrente", en: "Rear-facing" },
    lateral: { de: "Seitlich", es: "Lateral", en: "Side-facing" },
    interior: { de: "Interior", es: "Interior", en: "Interior" },
  },
  orientation: {
    north: { de: "Norden", es: "Norte", en: "North" },
    south: { de: "Süden", es: "Sur", en: "South" },
    east: { de: "Osten", es: "Este", en: "East" },
    west: { de: "Westen", es: "Oeste", en: "West" },
    northeast: { de: "Nordosten", es: "Noreste", en: "Northeast" },
    northwest: { de: "Nordwesten", es: "Noroeste", en: "Northwest" },
    southeast: { de: "Südosten", es: "Sureste", en: "Southeast" },
    southwest: { de: "Südwesten", es: "Suroeste", en: "Southwest" },
  },
  construction: {
    presale: { de: "Vorverkauf", es: "Pozo", en: "Presale" },
    construction: { de: "Im Bau", es: "Construcción", en: "Under construction" },
    ready_delivery: { de: "Kurz vor Übergabe", es: "Pronta Entrega", en: "Near delivery" },
    immediate_occupancy: { de: "Sofortige Übergabe", es: "Entrega Inmediata", en: "Immediate delivery" },
  },
  unitStatus: {
    available: { de: "Verfügbar", es: "Disponible", en: "Available" },
    reserved: { de: "Reserviert", es: "Reservada", en: "Reserved" },
    sold: { de: "Verkauft", es: "Vendida", en: "Sold" },
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

export function formatPublicNumber(value: number, locale: PublicLocale) {
  return new Intl.NumberFormat(localeCode[locale], {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPublicPropertyMoney(
  value: number | null | undefined,
  currency: Currency | string | null | undefined,
  locale: PublicLocale,
) {
  const normalizedCurrency = currency?.trim();

  if (value === null || value === undefined || !normalizedCurrency) {
    return null;
  }

  return `${normalizedCurrency} ${formatPublicNumber(value, locale)}`;
}

export function formatPublicCommonExpenses(
  value: number | null | undefined,
  locale: PublicLocale,
) {
  if (value === null || value === undefined) {
    return null;
  }

  return `$ ${formatPublicNumber(value, locale)}`;
}

export function formatPublicDate(value: Date | string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeCode[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPublicMonthYear(value: Date | string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeCode[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
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

export function getOperationBadgeLabel(value: OperationType, locale: PublicLocale) {
  return value === "rent"
    ? locale === "es"
      ? "ALQUILER"
      : locale === "de"
        ? "MIETE"
        : "RENT"
    : locale === "es"
      ? "VENTA"
      : locale === "de"
        ? "KAUF"
        : "SALE";
}
