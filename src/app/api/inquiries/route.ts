import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { createPublicInquiry } from "@/features/inquiries/inquiries.data";
import { validatePublicInquiryPayload } from "@/features/inquiries/inquiries.form";
import { INQUIRY_HONEYPOT_FIELD_NAME } from "@/features/inquiries/inquiry-honeypot-field";

function isHoneypotFilled(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const value = (payload as Record<string, unknown>)[INQUIRY_HONEYPOT_FIELD_NAME];
  return typeof value === "string" && value.trim() !== "";
}

export async function POST(request: Request) {
  try {
    let isBot = false;

    try {
      const verification = await checkBotId({ advancedOptions: { checkLevel: "basic" } });
      isBot = verification.isBot;
    } catch (error) {
      console.error("[inquiries][route] BotID check failed, allowing request", error);
    }

    if (isBot) {
      console.warn("[inquiries][route] bot_blocked");
      return NextResponse.json(
        { message: "No pudimos procesar tu consulta. Intentá de nuevo." },
        { status: 403 },
      );
    }

    const payload = (await request.json().catch(() => null)) as unknown;

    if (isHoneypotFilled(payload)) {
      console.warn("[inquiries][route] honeypot_filled");
      return NextResponse.json(
        { message: "Consulta enviada correctamente." },
        { status: 201 },
      );
    }

    console.info("[inquiries][route] request_received", {
      hasPayload: payload != null,
    });
    const validation = validatePublicInquiryPayload(payload);

    if (!validation.ok || !validation.data) {
      console.error("[inquiries][route] validation_failed", {
        error: validation.error ?? "La solicitud no es válida.",
      });
      return NextResponse.json(
        { message: validation.error ?? "La solicitud no es válida." },
        { status: 400 },
      );
    }

    console.info("[inquiries][route] validation_ok", {
      kind: validation.data.kind,
      originPath: validation.data.originPath,
      hasPhone: Boolean(validation.data.phone),
      propertyId: validation.data.propertyId,
      projectId: validation.data.projectId,
      relatedTitle: validation.data.relatedTitle,
      emailDomain: validation.data.email.split("@")[1] ?? null,
      nameLength: validation.data.name.length,
      messageLength: validation.data.message.length,
    });

    const result = await createPublicInquiry(validation.data);

    if (!result.ok) {
      console.error("[inquiries][route] create_failed", {
        error: result.error,
        message: result.message,
      });
      if (result.error === "invalid_payload") {
        return NextResponse.json({ message: result.message }, { status: 400 });
      }

      if (result.error === "not_found") {
        return NextResponse.json({ message: result.message }, { status: 404 });
      }

      return NextResponse.json(
        { message: "No se pudo enviar la consulta en este momento." },
        { status: 500 },
      );
    }

    console.info("[inquiries][route] create_ok");
    return NextResponse.json(
      { message: "Consulta enviada correctamente." },
      { status: 201 },
    );
  } catch (error) {
    console.error("[inquiries][route] unexpected_error", error);
    return NextResponse.json(
      { message: "No se pudo enviar la consulta en este momento." },
      { status: 500 },
    );
  }
}
