import { getAdminSession } from "@/lib/supabase/auth";
import { createCloudflareDirectUploadUrl } from "@/lib/cloudflare/images";
import { getAdminProjectById } from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/projects/[id]/images/direct-upload">,
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const projectResult = await getAdminProjectById(id);

  if (!projectResult.ok) {
    return Response.json(
      {
        message: projectResult.error?.message ?? "No se pudo validar el proyecto.",
      },
      { status: 400 },
    );
  }

  if (!projectResult.data) {
    return Response.json({ message: "Proyecto no encontrado." }, { status: 404 });
  }

  try {
    const directUpload = await createCloudflareDirectUploadUrl({
      entity: "project",
      projectId: id,
    });

    return Response.json(directUpload);
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo generar la URL de upload temporal.",
      },
      { status: 400 },
    );
  }
}
