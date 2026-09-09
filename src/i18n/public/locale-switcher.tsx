"use client";

import { useTransition } from "react";
import type { PublicLocale } from "@/i18n/public/config";
import { setPublicLocaleAction } from "@/i18n/public/locale.actions";
import { usePublicLocale } from "@/i18n/public/locale-provider";

export function PublicLocaleSwitcher() {
  const { locale, t } = usePublicLocale();
  const [isPending, startTransition] = useTransition();

  function selectLocale(nextLocale: PublicLocale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(async () => {
      await setPublicLocaleAction(nextLocale);
    });
  }

  return (
    <div
      aria-label={t("locale.label")}
      className="inline-flex overflow-hidden rounded-full border border-white/30 text-[10px] font-semibold tracking-[0.12em] text-white"
      role="group"
    >
      <button
        aria-label={t("locale.switchToSpanish")}
        aria-pressed={locale === "es"}
        className={`px-2 py-1 transition-colors ${
          locale === "es" ? "bg-white text-primary" : "hover:bg-white/15"
        }`}
        disabled={isPending}
        onClick={() => selectLocale("es")}
        type="button"
      >
        ES
      </button>
      <button
        aria-label={t("locale.switchToEnglish")}
        aria-pressed={locale === "en"}
        className={`px-2 py-1 transition-colors ${
          locale === "en" ? "bg-white text-primary" : "hover:bg-white/15"
        }`}
        disabled={isPending}
        onClick={() => selectLocale("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
