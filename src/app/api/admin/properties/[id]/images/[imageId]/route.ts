import { revalidatePath } from "next/cache";
import { deleteCloudflareImage } from "@/lib/cloudflare/images";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  assignPropertyCoverFromRemainingImages,
  deletePropertyImageRecord,
  getAdminPropertyImageById,
  setPropertyCoverImage,
} from "@/features/properties/property-images.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id, imageId } = await context.params;
  const imageResult = await getAdminPropertyImageById(id, imageId);

  if (!imageResult.ok) {
    return Response.json(
      {
        message: imageResult.error?.message ?? "No se pudo validar la imagen.",
      },
      { status: 400 },
    );
  }

  if (!imageResult.data) {
    return Response.json({ message: "Imagen no encontrada." }, { status: 404 });
  }

  if (imageResult.data.publicId) {
    try {
      await deleteCloudflareImage(imageResult.data.publicId);
    } catch (error) {
      return Response.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "No se pudo eliminar el asset en Cloudflare.",
        },
        { status: 400 },
      );
    }
  }

  const deleteResult = await deletePropertyImageRecord(id, imageId);

  if (!deleteResult.ok) {
    return Response.json(
      {
        message:
          deleteResult.error?.message ??
          "No se pudo eliminar la imagen de la propiedad.",
      },
      { status: 400 },
    );
  }

  let nextCoverImageId: string | null = null;

  if (deleteResult.deleted?.isCover) {
    const coverResult = await assignPropertyCoverFromRemainingImages(id);

    if (!coverResult.ok) {
      return Response.json(
        {
          message:
            coverResult.error?.message ??
            "La imagen se elimino, pero no se pudo reasignar la portada.",
        },
        { status: 400 },
      );
    }

    nextCoverImageId = coverResult.nextCoverImageId;
  }

  revalidatePath(`/admin/propiedades/${id}/editar`);
  revalidatePath("/admin/propiedades");

  return Response.json({
    deletedImageId: imageId,
    nextCoverImageId,
  });
}

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id, imageId } = await context.params;
  const coverResult = await setPropertyCoverImage(id, imageId);

  if (!coverResult.ok || !coverResult.coverImage) {
    return Response.json(
      {
        message:
          coverResult.error?.message ?? "No se pudo marcar la imagen como portada.",
      },
      { status: 400 },
    );
  }

  revalidatePath(`/admin/propiedades/${id}/editar`);
  revalidatePath("/admin/propiedades");

  return Response.json({
    coverImage: coverResult.coverImage,
  });
}
