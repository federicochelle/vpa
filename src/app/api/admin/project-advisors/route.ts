import { revalidatePath } from "next/cache";
import { deleteCloudflareImage } from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildProjectAdvisorInput } from "@/features/projects/project-advisors.form";
import { createProjectAdvisor } from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getUploadedPhotoPublicId(formData: FormData) {
  const value = formData.get("photoPublicId");
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const photoPublicId = getUploadedPhotoPublicId(formData);
  const result = await createProjectAdvisor(buildProjectAdvisorInput(formData));

  if (!result.ok || !result.data) {
    if (photoPublicId) {
      try {
        await deleteCloudflareImage(photoPublicId);
      } catch (cleanupError) {
        console.error("Error cleaning advisor image after create failure", cleanupError);
      }
    }

    return Response.json(
      {
        message: result.error?.message ?? "No se pudo crear el asesor.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/asesores");
  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");

  return Response.json({
    advisor: result.data,
    message: "Asesor creado correctamente.",
  });
}
