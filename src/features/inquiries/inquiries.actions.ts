"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import { updateInquiryStatus } from "@/features/inquiries/inquiries.data";
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
