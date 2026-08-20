import { revalidatePath } from "next/cache";
import {
  buildCloudflareImageUrl,
  deleteCloudflareImage,
} from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  getAdminNewsById,
  updateNewsImage,
} from "@/features/news/news.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PersistNewsImageRequest {
  publicId?: string;
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/news/[id]/image">,
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const newsResult = await getAdminNewsById(id);

  if (!newsResult.ok) {
    return Response.json(
      {
        message: newsResult.error?.message ?? "No se pudo validar la noticia.",
      },
      { status: 400 },
    );
  }

  if (!newsResult.data) {
    return Response.json({ message: "Noticia no encontrada." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as PersistNewsImageRequest | null;
  const publicId = body?.publicId?.trim() ?? "";

  if (!publicId) {
    return Response.json(
      {
        message: "Faltan datos para persistir la imagen de la noticia.",
      },
      { status: 400 },
    );
  }

  const imageUrl = buildCloudflareImageUrl(publicId);
  const updateResult = await updateNewsImage(id, {
    imagePublicId: publicId,
    imageUrl,
  });

  if (!updateResult.ok || !updateResult.data) {
    try {
      await deleteCloudflareImage(publicId);
    } catch (cleanupError) {
      console.error("Error cleaning Cloudflare image after news update failure", cleanupError);
    }

    return Response.json(
      {
        message:
          updateResult.error?.message ??
          "No se pudo guardar la imagen de la noticia en Supabase.",
      },
      { status: 400 },
    );
  }

  const previousPublicId = newsResult.data.imagePublicId;

  if (previousPublicId && previousPublicId !== publicId) {
    try {
      await deleteCloudflareImage(previousPublicId);
    } catch (cleanupError) {
      console.error("Error cleaning replaced Cloudflare image for news", cleanupError);
    }
  }

  revalidatePath("/admin/noticias");
  revalidatePath(`/admin/noticias/${id}/editar`);

  return Response.json({
    news: updateResult.data,
  });
}
