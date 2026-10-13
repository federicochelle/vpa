"use client";

import Image from "next/image";
import { MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { getClientInquiryAttribution } from "@/features/inquiries/inquiry-attribution";
import { usePublicLocale } from "@/i18n/public/locale-provider";
import type { PublicInquiryPayload } from "@/types/inquiry";
import type { ProjectAdvisor } from "@/types/project";

interface PublicInquirySidebarProps {
  entityId?: string;
  initialMessage: string;
  kind: "property" | "project" | "general";
  originPath: string;
  relatedTitle: string;
  advisor?: ProjectAdvisor | null;
}

export function PublicInquirySidebar({
  entityId,
  initialMessage,
  kind,
  originPath,
  relatedTitle,
  advisor,
}: PublicInquirySidebarProps) {
  const { locale, t } = usePublicLocale();
  const phoneHref = advisor?.phone ? `tel:${advisor.phone.replace(/\s/g, "")}` : null;
  const whatsappHref = advisor?.whatsapp
    ? `https://wa.me/${advisor.whatsapp.replace(/\D/g, "")}`
    : null;
  const [formData, setFormData] = useState(() => ({
    fullName: "",
    phone: "",
    email: "",
    message: initialMessage,
  }));
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  function resetForm() {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      message: initialMessage,
    });
  }

  return (
    <div className="panel w-full max-w-full min-w-0 !rounded-none p-6 sm:p-8">
      {advisor ? (
        <div className="flex items-start gap-4 pb-2">
          <div className="relative h-16 w-16 flex-none overflow-hidden border border-primary/15 bg-primary/6">
            {advisor.photoUrl ? (
              <Image
                src={advisor.photoUrl}
                alt={advisor.name}
                fill
                className="object-cover object-center"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/8 font-display text-xl text-primary-strong">
                {advisor.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xl font-display leading-tight text-primary-strong sm:text-[1.35rem]">
              {advisor.name}
            </h5>
            <div className="mt-3 flex flex-col items-start gap-2">
              {phoneHref ? (
                <a
                  className="type-body-compact inline-flex items-center gap-2 text-muted transition-colors hover:text-primary-strong"
                  href={phoneHref}
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{advisor.phone}</span>
                </a>
              ) : null}
              {whatsappHref ? (
                <a
                  className="type-body-compact inline-flex items-center gap-2 text-muted transition-colors hover:text-primary-strong"
                  href={whatsappHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span>{advisor.whatsapp}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitState === "submitting") {
            return;
          }

          setSubmitState("submitting");
          setFeedbackMessage(null);

          const attribution = getClientInquiryAttribution();
          const payload: PublicInquiryPayload = {
            kind,
            intent: "general",
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            source: attribution.source ?? "public_web",
            medium: attribution.medium,
            campaign: attribution.campaign,
            referrer: attribution.referrer,
            landingPage: attribution.landingPage,
            propertyId: kind === "property" ? entityId : undefined,
            projectId: kind === "project" ? entityId : undefined,
            relatedTitle,
            originPath,
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

            resetForm();
            setSubmitState("idle");
            setFeedbackMessage(null);
            setShowSuccessModal(true);
          } catch (error) {
            console.error("Error submitting public inquiry", error);
            setSubmitState("error");
            setFeedbackMessage(t("inquiry.error"));
          }
        }}
      >
        <div className="space-y-2">
          <label
            className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="fullName"
          >
            {t("inquiry.fullName")}
          </label>
          <input
            className="input-base w-full"
            id="fullName"
            name="fullName"
            required
            onChange={(event) =>
              setFormData((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder={t("inquiry.fullNamePlaceholder")}
            type="text"
            value={formData.fullName}
          />
        </div>

        <div className="space-y-2">
          <label
            className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="phone"
          >
            {t("inquiry.phone")}
          </label>
          <input
            className="input-base w-full"
            id="phone"
            name="phone"
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder={t("inquiry.phonePlaceholder")}
            type="tel"
            value={formData.phone}
          />
        </div>

        <div className="space-y-2">
          <label
            className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="input-base w-full"
            id="email"
            name="email"
            required
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="tu@email.com"
            type="email"
            value={formData.email}
          />
        </div>

        <div className="space-y-2">
          <label
            className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="message"
          >
            {t("inquiry.message")}
          </label>
          <textarea
            className="input-base min-h-40 w-full"
            id="message"
            name="message"
            required
            onChange={(event) =>
              setFormData((current) => ({ ...current, message: event.target.value }))
            }
            value={formData.message}
          />
        </div>

        <button
          className="button-primary inline-flex w-full items-center justify-center gap-2"
          disabled={submitState === "submitting"}
          type="submit"
        >
          <Send className="h-4 w-4" />
          {submitState === "submitting" ? t("inquiry.submitting") : t("inquiry.submit")}
        </button>

        {feedbackMessage ? (
          <p className="type-body-compact text-muted">
            {feedbackMessage}
          </p>
        ) : null}
      </form>
      {showSuccessModal ? (
        <AdminFeedbackModal
          message={t("advisory.successMessage")}
          onClose={() => setShowSuccessModal(false)}
          title={t("advisory.successTitle")}
          variant="success"
        />
      ) : null}
    </div>
  );
}
