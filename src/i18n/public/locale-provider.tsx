"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { PublicLocale } from "@/i18n/public/config";
import {
  getPublicMessage,
  publicMessages,
  type PublicMessageKey,
  type PublicMessages,
} from "@/i18n/public/messages";

interface PublicLocaleContextValue {
  locale: PublicLocale;
  messages: PublicMessages;
  t: (key: PublicMessageKey) => string;
}

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null);

export function PublicLocaleProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: PublicLocale;
}) {
  const messages = publicMessages[locale];

  return (
    <PublicLocaleContext.Provider
      value={{
        locale,
        messages,
        t: (key) => getPublicMessage(locale, key),
      }}
    >
      {children}
    </PublicLocaleContext.Provider>
  );
}

export function usePublicLocale() {
  const context = useContext(PublicLocaleContext);

  if (!context) {
    throw new Error("usePublicLocale must be used inside PublicLocaleProvider.");
  }

  return context;
}

