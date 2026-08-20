import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildProjectInput, toStringArray } from "@/features/projects/projects.form";
import { updateProject } from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/projects/[id]">,
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const featureIds = toStringArray(formData.getAll("featureIds"));
  let result;

  try {
    result = await updateProject(id, buildProjectInput(formData), featureIds);
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "No se pudo actualizar el proyecto.",
      },
      { status: 400 },
    );
  }

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo actualizar el proyecto.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${id}/editar`);
  revalidatePath("/inversion");
  if (result.data.slug) {
    revalidatePath(`/inversion/${result.data.slug}`);
  }

  return Response.json({
    message: "Proyecto actualizado correctamente.",
    project: result.data,
  });
}
