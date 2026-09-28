import { formatPublicMonthYear } from "@/i18n/public/formatters";
import type { PublicLocale } from "@/i18n/public/config";

const DELIVERY_MONTH_PATTERN = /^(\d{4})-(\d{2})(?:-\d{2})?$/;

function parseDeliveryMonth(value: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const match = DELIVERY_MONTH_PATTERN.exec(trimmed);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  return { monthIndex, year };
}

export function formatProjectDeliveryDate(value: string | null, locale: PublicLocale = "es") {
  const parsed = parseDeliveryMonth(value);

  if (!parsed) {
    return value?.trim() || null;
  }

  return formatPublicMonthYear(
    new Date(Date.UTC(parsed.year, parsed.monthIndex, 1)),
    locale,
  );
}

export function toProjectDeliveryMonthInputValue(value: string | null) {
  const parsed = parseDeliveryMonth(value);

  if (!parsed) {
    return value?.trim() || "";
  }

  return `${parsed.year}-${String(parsed.monthIndex + 1).padStart(2, "0")}`;
}

export function toProjectDeliveryDateValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = parseDeliveryMonth(trimmed);

  if (!parsed) {
    return trimmed;
  }

  return `${parsed.year}-${String(parsed.monthIndex + 1).padStart(2, "0")}-01`;
}
