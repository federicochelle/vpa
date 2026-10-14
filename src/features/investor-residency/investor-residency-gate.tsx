"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePublicLocale } from "@/i18n/public/locale-provider";

const INVESTOR_RESIDENCY_STORAGE_KEY = "vpa:investor-residency:session";
const VALID_RESIDENCY_VALUES = ["resident", "non_resident"] as const;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type InvestorResidencyValue = (typeof VALID_RESIDENCY_VALUES)[number];
type GateState = "checking" | "selection" | "complete";

function isInvestorResidencyValue(value: string | null): value is InvestorResidencyValue {
  return VALID_RESIDENCY_VALUES.includes(value as InvestorResidencyValue);
}

function readStoredInvestorResidency() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(INVESTOR_RESIDENCY_STORAGE_KEY);
    return isInvestorResidencyValue(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredInvestorResidency(value: InvestorResidencyValue) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(INVESTOR_RESIDENCY_STORAGE_KEY, value);
  } catch {
    // The gate should not crash when storage is blocked or unavailable.
  }
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.offsetParent !== null,
  );
}

export function InvestorResidencyGate() {
  const { t } = usePublicLocale();
  const titleId = useId();
  const descriptionId = useId();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstActionRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [gateState, setGateState] = useState<GateState>("checking");
  const isOpen = gateState === "selection";

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedResidency = readStoredInvestorResidency();
      setGateState(storedResidency ? "complete" : "selection");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const bodyOverflow = document.body.style.overflow;
    const bodyOverscrollBehavior = document.body.style.overscrollBehavior;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.body.style.overscrollBehavior = bodyOverscrollBehavior;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      firstActionRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [gateState, isOpen]);

  function completeGate(value: InvestorResidencyValue) {
    writeStoredInvestorResidency(value);
    setGateState("complete");

    window.requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    const focusableElements = getFocusableElements(modal);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  if (!isOpen) {
    return null;
  }

  const title = t("investorResidency.title");
  const description = t("investorResidency.description");

  return (
    <div
      className="modal-backdrop-in fixed inset-0 z-[100] flex h-dvh items-center justify-center bg-black/44 px-4 py-4 backdrop-blur-sm motion-reduce:animate-none sm:px-6 sm:py-8"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-panel-in flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden border border-border bg-white shadow-[0_24px_70px_rgba(39,39,39,0.22)] motion-reduce:animate-none sm:max-h-[min(680px,calc(100dvh-4rem))]"
        ref={modalRef}
        role="dialog"
      >
        <div className="border-b border-border px-5 py-5 sm:px-7 sm:py-6">
          <h2
            className="font-display text-center text-[1.25rem] leading-tight text-foreground sm:text-[1.5rem]"
            id={titleId}
          >
            {title}
          </h2>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <p className="type-body whitespace-pre-line text-center text-foreground" id={descriptionId}>
            {description}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              className="button-primary inline-flex min-h-12 w-full items-center justify-center text-center uppercase tracking-[0.14em]"
              onClick={() => completeGate("resident")}
              ref={firstActionRef}
              type="button"
            >
              {t("investorResidency.resident")}
            </button>
            <button
              className="button-secondary inline-flex min-h-12 w-full items-center justify-center text-center uppercase tracking-[0.14em]"
              onClick={() => {
                completeGate("non_resident");
                window.open(
                  "/asesoramiento/no-residentes",
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              type="button"
            >
              {t("investorResidency.nonResident")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
