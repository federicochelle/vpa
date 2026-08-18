import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  buildPropertyInput,
  toStringArray,
} from "@/features/properties/properties.form";
import { updateProperty } from "@/features/properties/properties.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const featureIds = toStringArray(formData.getAll("featureIds"));
  const result = await updateProperty(id, buildPropertyInput(formData), featureIds);

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo actualizar la propiedad.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${id}/editar`);
  revalidatePath("/comprar");
  revalidatePath("/alquileres");

  if (result.data.slug) {
    revalidatePath(`/comprar/${result.data.slug}`);
    revalidatePath(`/alquileres/${result.data.slug}`);
  }

  return Response.json({
    message: "Propiedad actualizada correctamente.",
    property: result.data,
  });
}
