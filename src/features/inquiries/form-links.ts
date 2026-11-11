import type { AdvisoryContactOrigin } from "@/features/inquiries/advisory-contact-modal";
import type { InquiryIntent } from "@/types/inquiry";

/** Parámetro de URL que abre un formulario en modal: `?form=<slug>`. */
export const FORM_PARAM = "form";

/**
 * Mapa centralizado slug → modal. Para sumar un link nuevo: agregar una entrada acá
 * (con el `host` que ya monta ese modal) y listo.
 *
 * - `navbar`: OwnerLeadModal, montado en el navbar (vive en todas las páginas públicas).
 * - `home-cta`: AdvisoryContactModal de la sección de CTAs de la home (`origin`).
 * - `advisory-services`: AdvisoryContactModal de las tarjetas de /asesoramiento (`intent`).
 *
 * `path` es la página donde vive el modal; se usa para armar la URL compartible.
 */
export const FORM_LINKS = {
  vender: { host: "navbar", path: "/" },
  asesoramiento: { host: "home-cta", origin: "advisory", path: "/" },
  conversemos: { host: "home-cta", origin: "conversation", path: "/" },
  invertir: { host: "home-cta", origin: "investment", path: "/" },
  tasacion: { host: "advisory-services", intent: "valuation", path: "/asesoramiento" },
  // Alias de `vender`: el formulario de venta es el OwnerLeadModal (la tarjeta de
  // /asesoramiento lo abre también). Se mantiene el slug para no romper links ya compartidos.
  "venta-asesorada": { host: "navbar", path: "/asesoramiento" },
  consultoria: { host: "advisory-services", intent: "investment", path: "/asesoramiento" },
  informes: {
    host: "advisory-services",
    intent: "professional_report",
    path: "/asesoramiento",
  },
} as const satisfies Record<string, FormLink>;

type FormLink =
  | { host: "navbar"; path: string }
  | { host: "home-cta"; origin: AdvisoryContactOrigin; path: string }
  | { host: "advisory-services"; intent: InquiryIntent; path: string };

export type FormSlug = keyof typeof FORM_LINKS;
export type FormLinkHost = FormLink["host"];
export type FormLinkOf<H extends FormLinkHost> = Extract<FormLink, { host: H }>;

/** Devuelve la config del slug, o `null` si no existe (slug desconocido = no hacer nada). */
export function getFormLink(slug: string | null): FormLink | null {
  if (!slug || !Object.prototype.hasOwnProperty.call(FORM_LINKS, slug)) {
    return null;
  }

  return FORM_LINKS[slug as FormSlug];
}
