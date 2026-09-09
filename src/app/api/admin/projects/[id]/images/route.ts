import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildCloudflareImageUrl, deleteCloudflareImage } from "@/lib/cloudflare/images";
import { createProjectImage, listAdminProjectImages } from "@/features/projects/project-images.data";
import { getAdminProjectById } from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PersistProjectImageRequest {
  publicId?: string;
  sortOrder?: number;
  isCover?: boolean;
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/projects/[id]/images">,
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

  const body = (await request.json().catch(() => null)) as PersistProjectImageRequest | null;
  const publicId = body?.publicId?.trim() ?? "";
  const sortOrder = typeof body?.sortOrder === "number" ? body.sortOrder : null;
  const requestedCover = body?.isCover === true;

  if (!publicId || sortOrder === null || sortOrder < 0) {
    return Response.json(
      {
        message: "Faltan datos para persistir la imagen del proyecto.",
      },
      { status: 400 },
    );
  }

  const existingImagesResult = await listAdminProjectImages(id);

  if (!existingImagesResult.ok) {
    try {
      await deleteCloudflareImage(publicId);
    } catch (cleanupError) {
      console.error("Error cleaning Cloudflare image after listing failure", cleanupError);
    }

    return Response.json(
      {
        message:
          existingImagesResult.error?.message ??
          "No se pudo leer la galeria actual del proyecto.",
      },
      { status: 400 },
    );
  }

  const hasCover = existingImagesResult.data.some((image) => image.isCover);
  const imageUrl = buildCloudflareImageUrl(publicId);
  const createResult = await createProjectImage({
    projectId: id,
    publicId,
    url: imageUrl,
    sortOrder,
    isCover: requestedCover || (!hasCover && existingImagesResult.data.length === 0),
    altText: null,
  });

  if (!createResult.ok || !createResult.data) {
    try {
      await deleteCloudflareImage(publicId);
    } catch (cleanupError) {
      console.error("Error cleaning Cloudflare image after Supabase insert failure", cleanupError);
    }

    return Response.json(
      {
        message:
          createResult.error?.message ??
          "No se pudo guardar la imagen del proyecto en Supabase.",
      },
      { status: 400 },
    );
  }

  revalidatePath(`/admin/proyectos/${id}/editar`);
  revalidatePath("/admin/proyectos");

  return Response.json({
    image: createResult.data,
  });
}
