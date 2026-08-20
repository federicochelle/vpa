import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/auth";
import { buildNewsInput } from "@/features/news/news.form";
import { createNews } from "@/features/news/news.data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const result = await createNews(buildNewsInput(formData));

  if (!result.ok || !result.data) {
    return Response.json(
      {
        message: result.error?.message ?? "No se pudo crear la noticia.",
      },
      { status: 400 },
    );
  }

  revalidatePath("/admin/noticias");

  return Response.json({
    message: "Noticia creada correctamente.",
    news: result.data,
  });
}
