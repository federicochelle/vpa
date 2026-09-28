import { formatPublicDate } from "@/i18n/public/formatters";
import type { PublicLocale } from "@/i18n/public/config";

export function formatNewsDate(value: string | null, locale: PublicLocale = "es") {
  if (!value) {
    return null;
  }

  return formatPublicDate(value, locale);
}
