import type { Property } from "@/types/property";

export function normalizeLocationPart(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function buildPropertyAddressLabel(property: Pick<
  Property,
  "address" | "neighborhood" | "city" | "department"
>) {
  return normalizeLocationPart(property.address);
}

export function buildPropertyHeaderLocation(property: Pick<
  Property,
  "address" | "neighborhood" | "city" | "department"
>) {
  return (
    normalizeLocationPart(property.neighborhood) ??
    null
  );
}
