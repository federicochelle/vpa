import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildNewsInput } from "@/features/news/news.form";
import { updateNews } from "@/features/news/news.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/news/[id]">,
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const result = await updateNews(id, buildNewsInput(formData));

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo actualizar la noticia.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/noticias");
  revalidatePath(`/admin/noticias/${id}/editar`);

  return Response.json({
    message: "Noticia actualizada correctamente.",
    news: result.data,
  });
}
