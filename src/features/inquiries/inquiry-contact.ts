import type { Inquiry } from "@/types/inquiry";

export const OWNER_LEAD_TECHNICAL_EMAIL = "propietarios@vpa.com.uy";

type InquiryContactFields = Pick<Inquiry, "email" | "intent" | "kind" | "message">;

export function isOwnerLeadTechnicalEmail(inquiry: InquiryContactFields) {
  return (
    inquiry.email.trim().toLowerCase() === OWNER_LEAD_TECHNICAL_EMAIL &&
    inquiry.kind === "general" &&
    inquiry.intent === "sell" &&
    inquiry.message.trim().startsWith("Formulario propietarios")
  );
}

export function getRealInquiryContactEmail(inquiry: InquiryContactFields) {
  if (isOwnerLeadTechnicalEmail(inquiry)) {
    return null;
  }

  const email = inquiry.email.trim();
  return email || null;
}
