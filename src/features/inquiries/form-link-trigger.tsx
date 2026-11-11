"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";
import {
  FORM_PARAM,
  getFormLink,
  type FormLinkHost,
  type FormLinkOf,
} from "@/features/inquiries/form-links";

interface FormLinkTriggerProps<H extends FormLinkHost> {
  host: H;
  onOpen: (link: FormLinkOf<H>) => void;
}

function FormLinkTriggerInner<H extends FormLinkHost>({
  host,
  onOpen,
}: FormLinkTriggerProps<H>) {
  const searchParams = useSearchParams();
  const link = getFormLink(searchParams.get(FORM_PARAM));
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onOpenRef.current = onOpen;
  });

  useEffect(() => {
    // Solo abre si el slug es válido y pertenece al modal que monta este host.
    if (link && link.host === host) {
      onOpenRef.current(link as FormLinkOf<H>);
    }
  }, [host, link]);

  return null;
}

/**
 * Abre un modal cuando la URL trae `?form=<slug>`. Va envuelto en <Suspense> para que
 * leer los search params no vuelva dinámica toda la página.
 */
export function FormLinkTrigger<H extends FormLinkHost>(props: FormLinkTriggerProps<H>) {
  return (
    <Suspense fallback={null}>
      <FormLinkTriggerInner {...props} />
    </Suspense>
  );
}

/**
 * Devuelve una función que saca `?form=` de la URL (sin recargar ni scrollear) y conserva
 * el resto de los parámetros (utm_*, etc.) y el hash. No hace nada si no hay `form`.
 */
export function useClearFormParam() {
  const router = useRouter();

  return useCallback(() => {
    const url = new URL(window.location.href);

    if (!url.searchParams.has(FORM_PARAM)) {
      return;
    }

    url.searchParams.delete(FORM_PARAM);
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }, [router]);
}
