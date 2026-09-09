import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import {
  DEFAULT_PUBLIC_LOCALE,
  isPublicLocale,
  PUBLIC_LOCALE_COOKIE,
} from "@/i18n/public/config";

export const getPublicLocale = cache(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(PUBLIC_LOCALE_COOKIE)?.value;

  return isPublicLocale(locale) ? locale : DEFAULT_PUBLIC_LOCALE;
});

