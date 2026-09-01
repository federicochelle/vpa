"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  cancelInquiryMeeting,
  saveInquiryMeeting,
  updateInquiryStatus,
} from "@/features/inquiries/inquiries.data";
import type { Inquiry } from "@/types/inquiry";

function toRequiredString(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function isInquiryStatus(value: string): value is Inquiry["status"] {
  return value === "new" || value === "contacted" || value === "closed";
}

function parseMeetingDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  const value = new Date(`${date}T${time}:00-03:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const statusValue = toRequiredString(formData.get("status"));

  if (!id || !isInquiryStatus(statusValue)) {
    redirect(
      `/admin/consultas/${id}?error=${encodeURIComponent("No se pudo actualizar el estado de la consulta.")}`,
    );
  }

  const result = await updateInquiryStatus(id, statusValue);

  revalidatePath("/admin/consultas");
  revalidatePath(`/admin/consultas/${id}`);

  if (!result.ok) {
    redirect(
      `/admin/consultas/${id}?error=${encodeURIComponent(result.error ?? "No se pudo actualizar el estado de la consulta.")}`,
    );
  }

  redirect(
    `/admin/consultas/${id}?success=${encodeURIComponent("Estado actualizado correctamente.")}`,
  );
}

export async function saveInquiryMeetingAction(input: {
  date: string;
  durationMinutes: number;
  inquiryId: string;
  time: string;
}) {
  await requireAdminSession();

  const inquiryId = input.inquiryId.trim();
  const start = parseMeetingDateTime(input.date, input.time);
  const durationMinutes = Number(input.durationMinutes);

  if (
    !inquiryId ||
    !start ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 15 ||
    durationMinutes > 480
  ) {
    return { ok: false, message: "Ingresá una fecha, hora y duración válidas." };
  }

  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const result = await saveInquiryMeeting(inquiryId, start, end);

  if (!result.ok) {
    return { ok: false, message: result.error ?? "No se pudo guardar la reunión." };
  }

  revalidatePath("/admin/consultas");
  revalidatePath(`/admin/consultas/${inquiryId}`);
  return { ok: true, message: "La reunión fue coordinada correctamente." };
}

export async function cancelInquiryMeetingAction(inquiryId: string) {
  await requireAdminSession();
  const id = inquiryId.trim();

  if (!id) {
    return { ok: false, message: "No se encontró la consulta." };
  }

  const result = await cancelInquiryMeeting(id);

  if (!result.ok) {
    return { ok: false, message: result.error ?? "No se pudo cancelar la reunión." };
  }

  revalidatePath("/admin/consultas");
  revalidatePath(`/admin/consultas/${id}`);
  return { ok: true, message: "La reunión fue cancelada." };
}
