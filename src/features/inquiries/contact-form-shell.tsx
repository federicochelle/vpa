"use client";

import { useRef, useState } from "react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { FormField } from "@/components/ui/form-field";
import { getClientInquiryAttribution } from "@/features/inquiries/inquiry-attribution";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { PublicInquiryPayload } from "@/types/inquiry";

function getCurrentOriginPath() {
  if (typeof window === "undefined") {
    return "/contacto";
  }

  return window.location.pathname || "/contacto";
}

export function ContactFormShell() {
  const { locale, t } = usePublicLocale();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <form
      className="panel p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();

        if (submitState === "submitting") {
          return;
        }

        setSubmitState("submitting");
        setFeedbackMessage(null);

        const formData = new FormData(event.currentTarget);
        const attribution = getClientInquiryAttribution();
        const payload: PublicInquiryPayload = {
          kind: "general",
          intent: "contact",
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          message: String(formData.get("message") ?? ""),
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
          setShowSuccessModal(true);
        } catch (error) {
          console.error("Error submitting contact inquiry", error);
          setSubmitState("error");
          setFeedbackMessage(t("inquiry.error"));
        }
      }}
      ref={formRef}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField htmlFor="name" label={t("contact.name")}>
          <input
            className="input-base bg-white/70"
            id="name"
            name="name"
            placeholder={t("contact.name")}
            required
            type="text"
          />
        </FormField>
        <FormField htmlFor="email" label={t("contact.email")}>
          <input
            className="input-base bg-white/70"
            id="email"
            name="email"
            placeholder={t("contact.email")}
            required
            type="email"
          />
        </FormField>
        <FormField htmlFor="phone" label={t("inquiry.phone")}>
          <input
            className="input-base bg-white/70"
            id="phone"
            name="phone"
            placeholder={t("inquiry.phone")}
            type="tel"
          />
        </FormField>
        <div className="hidden sm:block" />
        <div className="sm:col-span-2">
          <FormField htmlFor="message" label={t("inquiry.message")}>
            <textarea
              className="input-base min-h-40 bg-white/70"
              id="message"
              name="message"
              placeholder={t("inquiry.message")}
              required
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="button-primary"
          disabled={submitState === "submitting"}
          type="submit"
        >
          {submitState === "submitting" ? t("inquiry.submitting") : t("contact.send")}
        </button>
      </div>
      {feedbackMessage ? (
        <p className="type-body-compact mt-4 text-muted">
          {feedbackMessage}
        </p>
      ) : null}
      {showSuccessModal ? (
        <AdminFeedbackModal
          message={t("advisory.successMessage")}
          onClose={() => setShowSuccessModal(false)}
          title={t("advisory.successTitle")}
          variant="success"
        />
      ) : null}
    </form>
  );
}
