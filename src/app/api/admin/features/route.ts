import { getAdminSession } from "@/lib/supabase/auth";
import { createOrGetFeature } from "@/features/features/features.data";
import { validateFeatureName } from "@/features/features/features.form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { name?: unknown }
    | null;
  const validation = validateFeatureName(payload?.name);

  if (!validation.ok) {
    return Response.json({ message: validation.message }, { status: 400 });
  }

  const result = await createOrGetFeature(validation.value);

  if (!result.ok || !result.data) {
    return Response.json(
      { message: result.error?.message ?? "No se pudo crear el amenity." },
      { status: 400 },
    );
  }

  return Response.json(
    {
      created: result.created,
      feature: result.data,
    },
    { status: result.created ? 201 : 200 },
  );
}
