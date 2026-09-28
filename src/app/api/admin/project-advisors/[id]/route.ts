import { revalidatePath } from "next/cache";
import {
  deleteCloudflareImage,
  getCloudflareImageIdFromUrl,
} from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildProjectAdvisorInput } from "@/features/projects/project-advisors.form";
import {
  getAdminProjectAdvisorById,
  updateProjectAdvisor,
} from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getUploadedPhotoPublicId(formData: FormData) {
  const value = formData.get("photoPublicId");
  return typeof value === "string" ? value.trim() : "";
}

async function deleteCloudflareImageFromUrl(url: string | null) {
  const imageId = getCloudflareImageIdFromUrl(url);

  if (!imageId) {
    return;
  }

  await deleteCloudflareImage(imageId);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const existingResult = await getAdminProjectAdvisorById(id);

  if (!existingResult.ok) {
    return Response.json(
      {
        message: existingResult.error?.message ?? "No se pudo validar el asesor.",
      },
      { status: 400 },
    );
  }

  if (!existingResult.data) {
    return Response.json({ message: "Asesor no encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const photoPublicId = getUploadedPhotoPublicId(formData);
  const previousPhotoUrl = existingResult.data.photoUrl;
  const result = await updateProjectAdvisor(id, buildProjectAdvisorInput(formData));

  if (!result.ok || !result.data) {
    if (photoPublicId) {
      try {
        await deleteCloudflareImage(photoPublicId);
      } catch (cleanupError) {
        console.error("Error cleaning advisor image after update failure", cleanupError);
      }
    }

    return Response.json(
      {
        message: result.error?.message ?? "No se pudo actualizar el asesor.",
      },
      { status: 400 },
    );
  }

  if (previousPhotoUrl && previousPhotoUrl !== result.data.photoUrl) {
    try {
      await deleteCloudflareImageFromUrl(previousPhotoUrl);
    } catch (cleanupError) {
      console.error("Error cleaning replaced advisor image", cleanupError);
    }
  }

  revalidatePath("/admin/asesores");
  revalidatePath(`/admin/asesores/${id}/editar`);
  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");

  return Response.json({
    advisor: result.data,
    message: "Asesor actualizado correctamente.",
  });
}
