import { getAdminSession } from "@/lib/supabase/auth";
import { createCloudflareDirectUploadUrl } from "@/lib/cloudflare/images";
import { getAdminPropertyById } from "@/features/properties/properties.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const propertyResult = await getAdminPropertyById(id);

  if (!propertyResult.ok) {
    return Response.json(
      {
        message: propertyResult.error?.message ?? "No se pudo validar la propiedad.",
      },
      { status: 400 },
    );
  }

  if (!propertyResult.data) {
    return Response.json({ message: "Propiedad no encontrada." }, { status: 404 });
  }

  try {
    const directUpload = await createCloudflareDirectUploadUrl({
      entity: "property",
      propertyId: id,
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
