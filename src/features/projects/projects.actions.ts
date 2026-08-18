"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  buildProjectInput,
  toProjectErrorMessage,
  toStringArray,
} from "@/features/projects/projects.form";
import {
  createProject,
  deleteProject,
  updateProject,
  type SupabaseActionError,
} from "@/features/projects/projects.data";

function toRequiredString(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function toErrorMessage(error: SupabaseActionError | null, fallback: string) {
  if (!error) {
    return fallback;
  }

  return error.message;
}
export async function createProjectAction(formData: FormData) {
  await requireAdminSession();
  const featureIds = toStringArray(formData.getAll("featureIds"));
  const result = await createProject(buildProjectInput(formData), featureIds);

  if (!result.ok || !result.data) {
    const message = result.error?.message;
    redirect(
      message
        ? `/admin/proyectos/nuevo?error=${encodeURIComponent(message)}`
        : "/admin/proyectos/nuevo",
    );
  }

  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");
  redirect(
    `/admin/proyectos?created=${encodeURIComponent("Proyecto creado correctamente.")}`,
  );
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const featureIds = toStringArray(formData.getAll("featureIds"));
  const result = await updateProject(id, buildProjectInput(formData), featureIds);

  if (!result.ok || !result.data) {
    redirect(
      `/admin/proyectos/${id}/editar?error=${encodeURIComponent(
        toProjectErrorMessage(result.error, "No se pudo actualizar el proyecto."),
      )}`,
    );
  }

  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");
  if (result.data.slug) {
    revalidatePath(`/inversion/${result.data.slug}`);
  }
  redirect(
    `/admin/proyectos?updated=${encodeURIComponent("Proyecto actualizado correctamente.")}`,
  );
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminSession();
  const id = toRequiredString(formData.get("id"));
  const confirmation = toRequiredString(formData.get("confirmation"));

  if (confirmation !== "confirmed") {
    redirect(
      `/admin/proyectos?error=${encodeURIComponent("Debes confirmar la eliminación del proyecto.")}`,
    );
  }

  const result = await deleteProject(id);
  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");

  if (!result.ok) {
    redirect(
      `/admin/proyectos?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo eliminar el proyecto."),
      )}`,
    );
  }

  redirect(
    `/admin/proyectos?success=${encodeURIComponent("Proyecto eliminado.")}`,
  );
}
