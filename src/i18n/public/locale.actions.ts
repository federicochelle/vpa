"use server";

import { cookies } from "next/headers";
import {
  isPublicLocale,
  PUBLIC_LOCALE_COOKIE,
  type PublicLocale,
} from "@/i18n/public/config";

export async function setPublicLocaleAction(locale: PublicLocale) {
  if (!isPublicLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(PUBLIC_LOCALE_COOKIE, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}

