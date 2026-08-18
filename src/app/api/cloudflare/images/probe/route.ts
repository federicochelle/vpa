import { probeCloudflareImagesConnection } from "@/lib/cloudflare/images";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await probeCloudflareImagesConnection();

  return Response.json(result, {
    status: result.ok ? 200 : result.status ?? 500,
  });
}
