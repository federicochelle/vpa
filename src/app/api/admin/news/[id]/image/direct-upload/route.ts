import { createCloudflareDirectUploadUrl } from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminNewsById } from "@/features/news/news.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/news/[id]/image/direct-upload">,
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

  try {
    const directUpload = await createCloudflareDirectUploadUrl({
      entity: "news",
      newsId: id,
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
