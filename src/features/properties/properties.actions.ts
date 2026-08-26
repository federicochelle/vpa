"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  createProperty,
  deleteProperty,
  setPropertyHeroOrder,
  setPropertyPublished,
  updateProperty,
  type PropertyHeroOrder,
  type SupabaseActionError,
} from "@/features/properties/properties.data";
import {
  buildPropertyInput,
  toPropertyErrorMessage as toErrorMessageFromForm,
  toStringArray as toStringArrayFromForm,
} from "@/features/properties/properties.form";

function toErrorMessage(error: SupabaseActionError | null, fallback: string) {
  return toErrorMessageFromForm(error, fallback);
}

export async function createPropertyAction(formData: FormData) {
  await requireAdminSession();
  const featureIds = toStringArrayFromForm(formData.getAll("featureIds"));
  const result = await createProperty(buildPropertyInput(formData), featureIds);

  if (!result.ok || !result.data) {
    const message = result.error?.message;
    redirect(
      message
        ? `/admin/propiedades/nueva?error=${encodeURIComponent(message)}`
        : "/admin/propiedades/nueva",
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");
  redirect(
    `/admin/propiedades?created=${encodeURIComponent("Propiedad creada correctamente.")}`,
  );
}

export async function updatePropertyAction(formData: FormData) {
  await requireAdminSession();
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")).trim() : "";
  const featureIds = toStringArrayFromForm(formData.getAll("featureIds"));
  const result = await updateProperty(id, buildPropertyInput(formData), featureIds);

  if (!result.ok || !result.data) {
    redirect(
      `/admin/propiedades/${id}/editar?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo actualizar la propiedad."),
      )}`,
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");
  if (result.data.slug) {
    revalidatePath(`/comprar/${result.data.slug}`);
    revalidatePath(`/alquileres/${result.data.slug}`);
  }
  redirect(
    `/admin/propiedades?updated=${encodeURIComponent("Propiedad actualizada correctamente.")}`,
  );
}

export async function deletePropertyAction(formData: FormData) {
  await requireAdminSession();
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")).trim() : "";
  const result = await deleteProperty(id);

  revalidatePath("/admin/propiedades");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");

  if (!result.ok) {
    redirect(
      `/admin/propiedades?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo eliminar la propiedad."),
      )}`,
    );
  }

  redirect(
    `/admin/propiedades?success=${encodeURIComponent("Propiedad eliminada.")}`,
  );
}

export async function togglePropertyPublishedAction(formData: FormData) {
  await requireAdminSession();
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")).trim() : "";
  const published =
    (typeof formData.get("published") === "string"
      ? String(formData.get("published")).trim()
      : "") === "true";
  const result = await setPropertyPublished(id, published);

  revalidatePath("/admin/propiedades");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");

  if (!result.ok || !result.data) {
    redirect(
      `/admin/propiedades?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo cambiar la publicacion."),
      )}`,
    );
  }

  revalidatePath(`/comprar/${result.data.slug}`);
  revalidatePath(`/alquileres/${result.data.slug}`);
  redirect(
    `/admin/propiedades?success=${encodeURIComponent(
      published ? "Propiedad publicada." : "Propiedad despublicada.",
    )}`,
  );
}

export async function updatePropertyHeroOrderAction(
  propertyId: string,
  heroOrder: PropertyHeroOrder,
) {
  await requireAdminSession();

  const result = await setPropertyHeroOrder(propertyId, heroOrder);

  revalidatePath("/admin/propiedades");

  if (!result.ok) {
    throw new Error(
      toErrorMessage(result.error, "No se pudo actualizar la posición del hero."),
    );
  }
}
