"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { AdvisoryContactForm } from "@/features/inquiries/advisory-contact-form";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { InquiryIntent } from "@/types/inquiry";

export type AdvisoryContactOrigin = "advisory" | "conversation" | "investment";

interface AdvisoryContactModalProps {
  description?: string;
  intent?: InquiryIntent;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  origin?: AdvisoryContactOrigin | null;
  submitLabel?: string;
  title?: string;
}

export function AdvisoryContactModal({
  description,
  intent,
  onClose,
  onSuccess,
  open,
  origin,
  submitLabel,
  title: titleProp,
}: AdvisoryContactModalProps) {
  const { t } = usePublicLocale();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const modalTitles: Record<AdvisoryContactOrigin, string> = {
    advisory: t("advisory.wantAdvice"),
    conversation: t("advisory.conversation"),
    investment: t("advisory.investment"),
  };
  const title = titleProp ?? (origin ? modalTitles[origin] : t("advisory.conversation"));
  const formIntent = intent ?? (origin === "investment" ? "investment" : "advisory");

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="modal-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm motion-reduce:animate-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="modal-panel-in relative flex max-h-[min(760px,calc(100vh-3rem))] w-full max-w-2xl flex-col overflow-hidden border border-border bg-white shadow-[0_24px_70px_rgba(39,39,39,0.2)] motion-reduce:animate-none">
        <div className="flex items-start justify-between gap-6 border-b border-border px-5 py-5 sm:px-7">
          <div className="space-y-2">
            <h2
              className="font-display text-[1.25rem] leading-tight text-foreground sm:text-[1.5rem]"
              id={titleId}
            >
              {title}
            </h2>
            <p className="type-body-compact max-w-lg text-muted">
              {description ?? t("advisory.modalDescription")}
            </p>
          </div>
          <button
            aria-label={t("common.close")}
            className="inline-flex h-10 w-10 flex-none items-center justify-center border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <AdvisoryContactForm
            intent={formIntent}
            key={formIntent}
            onSuccess={onSuccess}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );
}
