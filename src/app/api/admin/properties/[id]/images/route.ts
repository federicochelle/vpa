import { revalidatePath } from "next/cache";
import {
  buildCloudflareImageUrl,
  deleteCloudflareImage,
} from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  createPropertyImage,
  listAdminPropertyImages,
} from "@/features/properties/property-images.data";
import { getAdminPropertyById } from "@/features/properties/properties.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PersistPropertyImageRequest {
  publicId?: string;
  sortOrder?: number;
  isCover?: boolean;
}

export async function POST(
  request: Request,
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

  const body = (await request.json().catch(() => null)) as PersistPropertyImageRequest | null;
  const publicId = body?.publicId?.trim() ?? "";
  const sortOrder = typeof body?.sortOrder === "number" ? body.sortOrder : null;
  const requestedCover = body?.isCover === true;

  if (!publicId || sortOrder === null || sortOrder < 0) {
    return Response.json(
      {
        message: "Faltan datos para persistir la imagen de la propiedad.",
      },
      { status: 400 },
    );
  }

  const existingImagesResult = await listAdminPropertyImages(id);

  if (!existingImagesResult.ok) {
    try {
      await deleteCloudflareImage(publicId);
    } catch (cleanupError) {
      console.error(
        "Error cleaning Cloudflare image after property listing failure",
        cleanupError,
      );
    }

    return Response.json(
      {
        message:
          existingImagesResult.error?.message ??
          "No se pudo leer la galeria actual de la propiedad.",
      },
      { status: 400 },
    );
  }

  const hasCover = existingImagesResult.data.some((image) => image.isCover);
  const imageUrl = buildCloudflareImageUrl(publicId);
  const createResult = await createPropertyImage({
    propertyId: id,
    publicId,
    url: imageUrl,
    sortOrder,
    isCover: !hasCover && (requestedCover || existingImagesResult.data.length === 0),
    altText: null,
  });

  if (!createResult.ok || !createResult.data) {
    try {
      await deleteCloudflareImage(publicId);
    } catch (cleanupError) {
      console.error(
        "Error cleaning Cloudflare image after property Supabase insert failure",
        cleanupError,
      );
    }

    return Response.json(
      {
        message:
          createResult.error?.message ??
          "No se pudo guardar la imagen de la propiedad en Supabase.",
      },
      { status: 400 },
    );
  }

  revalidatePath(`/admin/propiedades/${id}/editar`);
  revalidatePath("/admin/propiedades");

  return Response.json({
    image: createResult.data,
  });
}
