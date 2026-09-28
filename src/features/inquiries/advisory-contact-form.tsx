"use client";

import { useRef, useState } from "react";
import { getClientInquiryAttribution } from "@/features/inquiries/inquiry-attribution";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { InquiryIntent, PublicInquiryPayload } from "@/types/inquiry";

function getCurrentOriginPath() {
  if (typeof window === "undefined") {
    return "/asesoramiento";
  }

  return window.location.pathname || "/asesoramiento";
}

interface AdvisoryContactFormProps {
  intent?: InquiryIntent;
  onSuccess?: () => void;
  submitLabel?: string;
}

export function AdvisoryContactForm({
  intent = "advisory",
  onSuccess,
  submitLabel,
}: AdvisoryContactFormProps) {
  const { locale, t } = usePublicLocale();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  return (
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
        const attribution = getClientInquiryAttribution();
        const payload: PublicInquiryPayload = {
          kind: "general",
          intent,
          name: String(formData.get("fullName") ?? ""),
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
          onSuccess?.();
        } catch (error) {
          console.error("Error submitting inquiry", error);
          setSubmitState("error");
          setFeedbackMessage(t("inquiry.error"));
        }
      }}
      ref={formRef}
    >
      <div className="space-y-2">
        <label
          className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
          htmlFor="meeting-fullName"
        >
          {t("inquiry.fullName")}
        </label>
        <input
          className="input-base w-full"
          id="meeting-fullName"
          name="fullName"
          placeholder={t("inquiry.fullNamePlaceholder")}
          required
          type="text"
        />
      </div>

      <div className="space-y-2">
        <label
          className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
          htmlFor="meeting-phone"
        >
          {t("inquiry.phone")}
        </label>
        <input
          className="input-base w-full"
          id="meeting-phone"
          name="phone"
          placeholder={t("inquiry.phonePlaceholder")}
          type="tel"
        />
      </div>

      <div className="space-y-2">
        <label
          className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
          htmlFor="meeting-email"
        >
          {t("contact.email")}
        </label>
        <input
          className="input-base w-full"
          id="meeting-email"
          name="email"
          placeholder="tu@email.com"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label
          className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
          htmlFor="meeting-message"
        >
          {t("inquiry.message")}
        </label>
        <textarea
          className="input-base min-h-40 w-full"
          id="meeting-message"
          name="message"
          placeholder={t("advisory.messagePlaceholder")}
          required
        />
      </div>

      <div className="pt-2">
        <button
          className="button-primary inline-flex w-full items-center justify-center"
          disabled={submitState === "submitting"}
          type="submit"
        >
          {submitState === "submitting"
            ? t("inquiry.submitting")
            : submitLabel ?? t("advisory.schedule")}
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
  );
}
