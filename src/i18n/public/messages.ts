import type { PublicLocale } from "@/i18n/public/config";

export const publicMessages = {
  es: {
    "nav.rent": "ALQUILAR",
    "nav.buy": "COMPRAR",
    "nav.invest": "INVERTIR",
    "nav.advisory": "ASESORAMIENTO",
    "nav.news": "NOTICIAS",
    "nav.openMenu": "Abrir menú",
    "nav.closeMenu": "Cerrar menú",
    "locale.label": "Idioma",
    "locale.switchToSpanish": "Cambiar a español",
    "locale.switchToEnglish": "Cambiar a inglés",
    "home.rentals": "ALQUILERES",
    "home.sales": "VENTAS",
    "home.investments": "INVERSIONES",
    "common.viewMore": "Ver más",
  },
  en: {
    "nav.rent": "RENT",
    "nav.buy": "BUY",
    "nav.invest": "INVEST",
    "nav.advisory": "ADVISORY",
    "nav.news": "NEWS",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",
    "locale.label": "Language",
    "locale.switchToSpanish": "Switch to Spanish",
    "locale.switchToEnglish": "Switch to English",
    "home.rentals": "RENTALS",
    "home.sales": "SALES",
    "home.investments": "INVESTMENTS",
    "common.viewMore": "View more",
  },
} as const;

export type PublicMessageKey = keyof (typeof publicMessages)["es"];
export type PublicMessages = (typeof publicMessages)[PublicLocale];

export function getPublicMessage(locale: PublicLocale, key: PublicMessageKey) {
  return publicMessages[locale][key];
}

