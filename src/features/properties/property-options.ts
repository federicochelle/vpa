import type { Currency, OperationType, Property, PropertyType } from "@/types/property";

export const operationTypeOptions: Array<{ value: OperationType; label: string }> = [
  { value: "sale", label: "Venta" },
  { value: "rent", label: "Alquiler" },
];

export const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "land", label: "Terreno" },
  { value: "office", label: "Oficina" },
  { value: "commercial-space", label: "Local comercial" },
  { value: "other", label: "Otro" },
];

export const propertyStatusOptions: Array<{
  value: NonNullable<Property["status"]>;
  label: string;
}> = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "archived", label: "Archivada" },
];

export const currencyOptions: Array<{ value: Currency; label: string; flag: string }> = [
  { value: "USD", label: "USD", flag: "🇺🇸" },
  { value: "UYU", label: "UYU", flag: "🇺🇾" },
  { value: "EUR", label: "EUR", flag: "🇪🇺" },
];
