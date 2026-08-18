import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  buildPropertyInput,
  toStringArray,
} from "@/features/properties/properties.form";
import { createProperty } from "@/features/properties/properties.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const featureIds = toStringArray(formData.getAll("featureIds"));
  const result = await createProperty(buildPropertyInput(formData), featureIds);

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo crear la propiedad.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/propiedades");
  revalidatePath("/comprar");
  revalidatePath("/alquileres");

  return Response.json({
    message: "Propiedad creada correctamente.",
    property: result.data,
  });
}
