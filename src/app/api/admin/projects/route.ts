import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildProjectInput, toStringArray } from "@/features/projects/projects.form";
import { createProject } from "@/features/projects/projects.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const featureIds = toStringArray(formData.getAll("featureIds"));
  const result = await createProject(buildProjectInput(formData), featureIds);

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo crear el proyecto.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/proyectos");
  revalidatePath("/inversion");

  return Response.json({
    message: "Proyecto creado correctamente.",
    project: result.data,
  });
}
