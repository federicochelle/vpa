import {
  buildCloudflareImageUrl,
  createCloudflareDirectUploadUrl,
} from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const directUpload = await createCloudflareDirectUploadUrl({
      entity: "project_advisor",
    });

    return Response.json({
      ...directUpload,
      imageUrl: buildCloudflareImageUrl(directUpload.imageId),
    });
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
