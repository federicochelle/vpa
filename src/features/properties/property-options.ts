import type {
  Currency,
  KitchenType,
  OperationType,
  Property,
  PropertyDisposition,
  PropertyOrientation,
  PropertyType,
} from "@/types/property";

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
  { value: "business-key", label: "Llave de comercio" },
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

export const kitchenTypeOptions: Array<{ value: KitchenType; label: string }> = [
  { value: "integrated", label: "Cocina integrada" },
  { value: "independent", label: "Cocina independiente" },
];

export const propertyDispositionOptions: Array<{
  value: PropertyDisposition;
  label: string;
}> = [
  { value: "front", label: "Frente" },
  { value: "back", label: "Contrafrente" },
  { value: "lateral", label: "Lateral" },
  { value: "interior", label: "Interior" },
];

export const propertyOrientationOptions: Array<{
  value: PropertyOrientation;
  label: string;
}> = [
  { value: "north", label: "Norte" },
  { value: "south", label: "Sur" },
  { value: "east", label: "Este" },
  { value: "west", label: "Oeste" },
  { value: "northeast", label: "Noreste" },
  { value: "northwest", label: "Noroeste" },
  { value: "southeast", label: "Sureste" },
  { value: "southwest", label: "Suroeste" },
];
