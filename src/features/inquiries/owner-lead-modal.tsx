"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { getClientInquiryAttribution } from "@/features/inquiries/inquiry-attribution";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { PublicInquiryPayload } from "@/types/inquiry";

function getCurrentOriginPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname || "/";
}

interface OwnerLeadModalProps {
  onClose: () => void;
  open: boolean;
}

export function OwnerLeadModal({ onClose, open }: OwnerLeadModalProps) {
  const { locale, t } = usePublicLocale();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const closeModal = useCallback(() => {
    setSubmitState("idle");
    setFeedbackMessage(null);
    formRef.current?.reset();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, open]);

  if (!open) {
    return showSuccessModal ? (
      <AdminFeedbackModal
        message={t("advisory.successMessage")}
        onClose={() => setShowSuccessModal(false)}
        title={t("advisory.successTitle")}
        variant="success"
      />
    ) : null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="modal-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm motion-reduce:animate-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
      role="dialog"
    >
      <div className="modal-panel-in relative flex max-h-[min(720px,calc(100vh-3rem))] w-full max-w-xl flex-col overflow-hidden border border-border bg-white shadow-[0_24px_70px_rgba(39,39,39,0.2)] motion-reduce:animate-none">
        <div className="flex items-start justify-between gap-6 border-b border-border px-5 py-5 sm:px-7">
          <div className="space-y-2">
            <h2
              className="font-display text-[1.25rem] leading-tight text-foreground sm:text-[1.5rem]"
              id={titleId}
            >
              {t("ownerLead.title")}
            </h2>
            <p className="type-body-compact max-w-lg text-muted">
              {t("ownerLead.description")}
            </p>
          </div>
          <button
            aria-label={t("common.close")}
            className="inline-flex h-10 w-10 flex-none items-center justify-center border border-border bg-white text-foreground transition-colors hover:border-primary/30 hover:text-primary-strong"
            onClick={closeModal}
            ref={closeButtonRef}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();

              if (submitState === "submitting") {
                return;
              }

              setSubmitState("submitting");
              setFeedbackMessage(null);

              const formData = new FormData(event.currentTarget);
              const name = String(formData.get("fullName") ?? "");
              const phone = String(formData.get("phone") ?? "");
              const propertyType = String(formData.get("propertyType") ?? "");
              const zone = String(formData.get("zone") ?? "");
              const attribution = getClientInquiryAttribution();
              const payload: PublicInquiryPayload = {
                kind: "general",
                intent: "sell",
                name,
                email: "propietarios@vpa.com.uy",
                phone,
                message: [
                  "Formulario propietarios",
                  `Tipo de propiedad: ${propertyType}`,
                  `Zona: ${zone}`,
                ].join("\n"),
                source: attribution.source ?? "public_web",
                medium: attribution.medium,
                campaign: attribution.campaign,
                referrer: attribution.referrer,
                landingPage: attribution.landingPage,
                originPath: getCurrentOriginPath(),
              };

              try {
                const response = await fetch("/api/inquiries", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                });
                const body = (await response.json().catch(() => null)) as
                  | { message?: string }
                  | null;

                if (!response.ok) {
                  setSubmitState("error");
                  setFeedbackMessage(
                    locale !== "es" ? t("inquiry.error") : body?.message ?? t("inquiry.error"),
                  );
                  return;
                }

                formRef.current?.reset();
                setSubmitState("idle");
                setFeedbackMessage(null);
                onClose();
                setShowSuccessModal(true);
              } catch (error) {
                console.error("Error submitting owner lead", error);
                setSubmitState("error");
                setFeedbackMessage(t("inquiry.error"));
              }
            }}
            ref={formRef}
          >
            <div className="space-y-2">
              <label
                className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                htmlFor="owner-fullName"
              >
                {t("inquiry.fullName")}
              </label>
              <input
                className="input-base w-full"
                id="owner-fullName"
                name="fullName"
                placeholder={t("inquiry.fullNamePlaceholder")}
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label
                className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                htmlFor="owner-phone"
              >
                {t("ownerLead.whatsapp")}
              </label>
              <input
                className="input-base w-full"
                id="owner-phone"
                name="phone"
                placeholder={t("inquiry.phonePlaceholder")}
                required
                type="tel"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="owner-propertyType"
                >
                  {t("ownerLead.propertyType")}
                </label>
                <select
                  className="input-base w-full"
                  id="owner-propertyType"
                  name="propertyType"
                  required
                >
                  <option value="">{t("ownerLead.selectPlaceholder")}</option>
                  <option value={t("ownerLead.house")}>{t("ownerLead.house")}</option>
                  <option value={t("ownerLead.apartment")}>{t("ownerLead.apartment")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="owner-zone"
                >
                  {t("ownerLead.zone")}
                </label>
                <input
                  className="input-base w-full"
                  id="owner-zone"
                  name="zone"
                  placeholder={t("ownerLead.zonePlaceholder")}
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                className="button-primary inline-flex w-full items-center justify-center"
                disabled={submitState === "submitting"}
                type="submit"
              >
                {submitState === "submitting"
                  ? t("inquiry.submitting")
                  : t("ownerLead.submit")}
              </button>
            </div>

            {feedbackMessage ? (
              <p
                className={`type-body-compact ${
                  submitState === "success" ? "text-primary-strong" : "text-muted"
                }`}
              >
                {feedbackMessage}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
