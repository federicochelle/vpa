const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ParsedPublicInquiryInput {
  kind: "property" | "project" | "general";
  intent:
    | "general"
    | "advisory"
    | "contact"
    | "sell"
    | "valuation"
    | "investment"
    | "professional_report"
    | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  landingPage: string | null;
  propertyId: string | null;
  projectId: string | null;
  relatedTitle: string | null;
  originPath: string;
}

export interface InquiryValidationResult {
  ok: boolean;
  data?: ParsedPublicInquiryInput;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableString(value: unknown, maxLength: number) {
  const trimmed = toTrimmedString(value);
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidInquiryIntent(
  value: string,
): value is NonNullable<ParsedPublicInquiryInput["intent"]> {
  return (
    value === "general" ||
    value === "advisory" ||
    value === "contact" ||
    value === "sell" ||
    value === "valuation" ||
    value === "investment" ||
    value === "professional_report"
  );
}

function isDirectGeneralInquiryIntent(
  intent: ParsedPublicInquiryInput["intent"],
) {
  return (
    intent === "advisory" ||
    intent === "contact" ||
    intent === "sell" ||
    intent === "valuation" ||
    intent === "investment" ||
    intent === "professional_report"
  );
}

export function validatePublicInquiryPayload(
  payload: unknown,
): InquiryValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, error: "La solicitud no tiene un formato válido." };
  }

  const kind = payload.kind;
  const intentRaw = toTrimmedString(payload.intent);
  const name = toTrimmedString(payload.name);
  const email = toTrimmedString(payload.email).toLowerCase();
  const phoneRaw = toTrimmedString(payload.phone);
  const message = toTrimmedString(payload.message);
  const source = toNullableString(payload.source, 120);
  const medium = toNullableString(payload.medium, 120);
  const campaign = toNullableString(payload.campaign, 120);
  const referrer = toNullableString(payload.referrer, 1000);
  const landingPage = toNullableString(payload.landingPage, 1000);
  const propertyId = toTrimmedString(payload.propertyId);
  const projectId = toTrimmedString(payload.projectId);
  const relatedTitle = toTrimmedString(payload.relatedTitle);
  const originPath = toTrimmedString(payload.originPath);

  if (kind !== "property" && kind !== "project" && kind !== "general") {
    return { ok: false, error: "El tipo de consulta no es válido." };
  }

  if (intentRaw && !isValidInquiryIntent(intentRaw)) {
    return { ok: false, error: "La intención de la consulta no es válida." };
  }
  const intent = intentRaw && isValidInquiryIntent(intentRaw) ? intentRaw : null;

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "Ingresá un nombre válido." };
  }

  if (!isValidEmail(email) || email.length > 160) {
    return { ok: false, error: "Ingresá un email válido." };
  }

  if (phoneRaw.length > 40) {
    return { ok: false, error: "El teléfono es demasiado largo." };
  }

  if (message.length < 10 || message.length > 2000) {
    return { ok: false, error: "El mensaje debe tener entre 10 y 2000 caracteres." };
  }

  if (
    !isDirectGeneralInquiryIntent(intent) &&
    (relatedTitle.length < 2 || relatedTitle.length > 200)
  ) {
    return { ok: false, error: "El origen de la consulta no es válido." };
  }

  if (!originPath.startsWith("/") || originPath.startsWith("//") || originPath.includes("://")) {
    return { ok: false, error: "La ruta de origen no es válida." };
  }

  if (kind === "property") {
    if (!UUID_PATTERN.test(propertyId) || projectId) {
      return { ok: false, error: "La propiedad relacionada no es válida." };
    }
  }

  if (kind === "project") {
    if (!UUID_PATTERN.test(projectId) || propertyId) {
      return { ok: false, error: "El proyecto relacionado no es válido." };
    }
  }

  if (kind === "general") {
    if (propertyId || projectId) {
      return { ok: false, error: "La consulta general no puede tener una entidad relacionada." };
    }
  }

  return {
    ok: true,
    data: {
      kind,
      intent,
      name,
      email,
      phone: phoneRaw || null,
      message,
      source,
      medium,
      campaign,
      referrer,
      landingPage,
      propertyId: propertyId || null,
      projectId: projectId || null,
      relatedTitle: relatedTitle || null,
      originPath,
    },
  };
}
