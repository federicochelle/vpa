"use client";

import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import type { PublicInquiryPayload } from "@/types/inquiry";
import virginiaImage from "../../../virginia.jpeg";

interface PublicInquirySidebarProps {
  entityId: string;
  initialMessage: string;
  kind: "property" | "project";
  originPath: string;
  relatedTitle: string;
}

const advisor = {
  name: "Virginia Pintos",
  phoneLabel: "+598 99 000 000",
  phoneHref: "https://wa.me/59899000000",
};

export function PublicInquirySidebar({
  entityId,
  initialMessage,
  kind,
  originPath,
  relatedTitle,
}: PublicInquirySidebarProps) {
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

  function resetForm() {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      message: initialMessage,
    });
  }

  return (
    <div className="panel !rounded-none p-6 sm:p-8 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="flex items-start gap-4 pb-2">
        <div className="relative h-16 w-16 flex-none overflow-hidden border border-primary/15 bg-primary/6">
          <Image
            src={virginiaImage}
            alt={advisor.name}
            fill
            className="object-cover object-center"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-display text-primary-strong">{advisor.name}</h2>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary-strong"
            href={advisor.phoneHref}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>{advisor.phoneLabel}</span>
          </a>
        </div>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitState === "submitting") {
            return;
          }

          setSubmitState("submitting");
          setFeedbackMessage(null);

          const payload: PublicInquiryPayload = {
            kind,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
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
                body?.message ?? "No se pudo enviar la consulta en este momento.",
              );
              return;
            }

            resetForm();
            setSubmitState("success");
            setFeedbackMessage(
              body?.message ?? "Consulta enviada correctamente.",
            );
          } catch (error) {
            console.error("Error submitting public inquiry", error);
            setSubmitState("error");
            setFeedbackMessage(
              "No se pudo enviar la consulta en este momento.",
            );
          }
        }}
      >
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="fullName"
          >
            Nombre completo
          </label>
          <input
            className="w-full border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            id="fullName"
            name="fullName"
            required
            onChange={(event) =>
              setFormData((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder="Tu nombre y apellido"
            type="text"
            value={formData.fullName}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="phone"
          >
            Telefono
          </label>
          <input
            className="w-full border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            id="phone"
            name="phone"
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="Tu telefono o WhatsApp"
            type="tel"
            value={formData.phone}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
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
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
            htmlFor="message"
          >
            Mensaje
          </label>
          <textarea
            className="min-h-40 w-full border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
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
          className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
          disabled={submitState === "submitting"}
          type="submit"
        >
          <Phone className="h-4 w-4" />
          {submitState === "submitting" ? "Enviando..." : "Enviar mensaje"}
        </button>

        {feedbackMessage ? (
          <p
            className={`text-sm ${
              submitState === "success" ? "text-primary-strong" : "text-muted"
            }`}
          >
            {feedbackMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
