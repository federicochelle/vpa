export const PUBLIC_LOCALES = ["es", "en", "de"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

export const DEFAULT_PUBLIC_LOCALE: PublicLocale = "es";
export const PUBLIC_LOCALE_COOKIE = "vpa_public_locale";

export function isPublicLocale(value: string | undefined): value is PublicLocale {
  return PUBLIC_LOCALES.includes(value as PublicLocale);
}
