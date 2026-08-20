"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteCloudflareImage } from "@/lib/cloudflare/images";
import { requireAdminSession } from "@/lib/supabase/auth";
import {
  deleteNews,
  getAdminNewsById,
  type SupabaseActionError,
} from "@/features/news/news.data";
import { toNewsErrorMessage } from "@/features/news/news.form";

function toErrorMessage(error: SupabaseActionError | null, fallback: string) {
  return toNewsErrorMessage(error, fallback);
}

export async function deleteNewsAction(formData: FormData) {
  await requireAdminSession();
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")).trim() : "";

  const existingNewsResult = await getAdminNewsById(id);

  if (!existingNewsResult.ok) {
    redirect(
      `/admin/noticias?error=${encodeURIComponent(
        toErrorMessage(existingNewsResult.error, "No se pudo validar la noticia."),
      )}`,
    );
  }

  if (!existingNewsResult.data) {
    redirect(
      `/admin/noticias?error=${encodeURIComponent("La noticia que intentas eliminar no existe.")}`,
    );
  }

  if (existingNewsResult.data.imagePublicId) {
    try {
      await deleteCloudflareImage(existingNewsResult.data.imagePublicId);
    } catch (error) {
      redirect(
        `/admin/noticias?error=${encodeURIComponent(
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la imagen asociada en Cloudflare.",
        )}`,
      );
    }
  }

  const result = await deleteNews(id);

  revalidatePath("/admin/noticias");

  if (!result.ok) {
    redirect(
      `/admin/noticias?error=${encodeURIComponent(
        toErrorMessage(result.error, "No se pudo eliminar la noticia."),
      )}`,
    );
  }

  redirect(`/admin/noticias?success=${encodeURIComponent("Noticia eliminada.")}`);
}
