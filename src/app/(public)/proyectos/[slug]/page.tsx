import { permanentRedirect } from "next/navigation";

interface LegacyProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyProjectDetailPage({
  params,
}: LegacyProjectDetailPageProps) {
  const { slug } = await params;
  permanentRedirect(`/inversion/${slug}`);
}
