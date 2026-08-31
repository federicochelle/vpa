import type { Property } from "@/types/property";

function normalizeLocationPart(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function buildPropertyLocationLabel(property: Pick<
  Property,
  "address" | "neighborhood" | "city" | "department"
>) {
  const parts = [
    normalizeLocationPart(property.address),
    normalizeLocationPart(property.neighborhood),
    normalizeLocationPart(property.city),
    normalizeLocationPart(property.department),
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  return parts.join(", ");
}

export function buildPropertyHeaderLocation(property: Pick<
  Property,
  "address" | "neighborhood" | "city" | "department"
>) {
  return (
    normalizeLocationPart(property.neighborhood) ??
    normalizeLocationPart(property.address) ??
    normalizeLocationPart(property.city) ??
    normalizeLocationPart(property.department) ??
    null
  );
}
