"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  buildProjectAdvisorInput,
  toProjectAdvisorErrorMessage,
} from "@/features/projects/project-advisors.form";
import {
  createProjectAdvisor,
  setProjectAdvisorActive,
  updateProjectAdvisor,
} from "@/features/projects/projects.data";

function toRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function revalidateProjectAdvisorPaths() {
  revalidatePath("/admin/asesores");
  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");
}

export async function createProjectAdvisorAction(formData: FormData) {
  await requireAdminSession();
  const result = await createProjectAdvisor(buildProjectAdvisorInput(formData));

  if (!result.ok || !result.data) {
    redirect(
      `/admin/asesores/nuevo?error=${encodeURIComponent(
        toProjectAdvisorErrorMessage(result.error, "No se pudo crear el asesor."),
      )}`,
    );
  }

  revalidateProjectAdvisorPaths();
  redirect(`/admin/asesores?created=${encodeURIComponent("Asesor creado correctamente.")}`);
}

export async function updateProjectAdvisorAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const result = await updateProjectAdvisor(id, buildProjectAdvisorInput(formData));

  if (!result.ok || !result.data) {
    redirect(
      `/admin/asesores/${id}/editar?error=${encodeURIComponent(
        toProjectAdvisorErrorMessage(result.error, "No se pudo actualizar el asesor."),
      )}`,
    );
  }

  revalidateProjectAdvisorPaths();
  redirect(`/admin/asesores?updated=${encodeURIComponent("Asesor actualizado correctamente.")}`);
}

export async function toggleProjectAdvisorActiveAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const active = formData.get("active") === "true";
  const result = await setProjectAdvisorActive(id, active);

  if (!result.ok || !result.data) {
    redirect(
      `/admin/asesores?error=${encodeURIComponent(
        toProjectAdvisorErrorMessage(result.error, "No se pudo cambiar el estado del asesor."),
      )}`,
    );
  }

  revalidateProjectAdvisorPaths();
  redirect(
    `/admin/asesores?updated=${encodeURIComponent(
      active ? "Asesor activado correctamente." : "Asesor desactivado correctamente.",
    )}`,
  );
}
