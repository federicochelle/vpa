import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Propiedad"
        title={property.title}
        description="La composicion contempla galeria, datos principales, descripcion, mapa, formulario y propiedades similares."
      />
      <PropertyDetailShell property={property} />
    </>
  );
}
