"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { PublicLocale } from "@/i18n/public/config";
import { setPublicLocaleAction } from "@/i18n/public/locale.actions";
import { usePublicLocale } from "@/i18n/public/locale-provider";

const localeOptions: Array<{
  code: string;
  label: string;
  locale: PublicLocale;
  switchLabelKey: "locale.switchToEnglish" | "locale.switchToGerman" | "locale.switchToSpanish";
}> = [
  {
    code: "ES",
    label: "Español",
    locale: "es",
    switchLabelKey: "locale.switchToSpanish",
  },
  {
    code: "EN",
    label: "English",
    locale: "en",
    switchLabelKey: "locale.switchToEnglish",
  },
  {
    code: "DE",
    label: "Deutsch",
    locale: "de",
    switchLabelKey: "locale.switchToGerman",
  },
];

function FlagIcon({ locale, size = "default" }: { locale: PublicLocale; size?: "default" | "small" }) {
  const className = size === "small" ? "h-5 w-5" : "h-6 w-6";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${className} items-center justify-center overflow-hidden rounded-full border border-white/45 bg-white shadow-sm ring-1 ring-black/10`}
    >
      <svg className="h-full w-full" focusable="false" viewBox="0 0 36 36">
        {locale === "es" ? (
          <>
            <rect fill="#aa151b" height="36" width="36" />
            <rect fill="#f1bf00" height="18" width="36" y="9" />
          </>
        ) : null}
        {locale === "en" ? (
          <>
            <rect fill="#012169" height="36" width="36" />
            <path d="M0 0 36 36M36 0 0 36" stroke="#fff" strokeWidth="7" />
            <path d="M0 0 36 36M36 0 0 36" stroke="#c8102e" strokeWidth="3.5" />
            <path d="M18 0v36M0 18h36" stroke="#fff" strokeWidth="12" />
            <path d="M18 0v36M0 18h36" stroke="#c8102e" strokeWidth="7" />
          </>
        ) : null}
        {locale === "de" ? (
          <>
            <rect fill="#000" height="12" width="36" />
            <rect fill="#dd0000" height="12" width="36" y="12" />
            <rect fill="#ffce00" height="12" width="36" y="24" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

export function PublicLocaleSwitcher() {
  const { locale, t } = usePublicLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeOption = localeOptions.find((option) => option.locale === locale) ?? localeOptions[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function selectLocale(nextLocale: PublicLocale) {
    setIsOpen(false);

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
      className="relative inline-flex text-white"
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("locale.label")}
        className="inline-flex min-h-9 items-center gap-1.5 border border-white/35 bg-black/10 px-2 py-1.5 text-white shadow-sm transition-colors duration-200 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <FlagIcon locale={activeOption.locale} />
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={1.8}
        />
      </button>
      {isOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-36 border border-primary/15 bg-white py-1 text-primary-strong shadow-lg"
          role="listbox"
        >
          {localeOptions.map((option) => {
            const isActive = option.locale === locale;

            return (
              <button
                aria-label={t(option.switchLabelKey)}
                aria-selected={isActive}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-primary-strong hover:bg-surface-muted"
                }`}
                disabled={isPending}
                key={option.locale}
                onClick={() => selectLocale(option.locale)}
                role="option"
                type="button"
              >
                <FlagIcon locale={option.locale} size="small" />
                <span>{option.label}</span>
                {isActive ? (
                  <span className="ml-auto text-[10px] font-semibold tracking-[0.12em]">
                    {option.code}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
