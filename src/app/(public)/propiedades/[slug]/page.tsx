import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";

interface LegacyPropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyPropertyDetailPage({
  params,
}: LegacyPropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  permanentRedirect(
    property.operationType === "rent"
      ? `/alquileres/${property.slug}`
      : `/comprar/${property.slug}`,
  );
}
