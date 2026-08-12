import { PageIntro } from "@/components/layout/page-intro";
import { listPublishedProperties } from "@/features/properties/properties.data";
import { PropertyListingShell } from "@/features/properties/property-listing-shell";

export default async function PropertiesPage() {
  const properties = await listPublishedProperties();

  return (
    <>
      <PageIntro
        eyebrow="Propiedades"
        title="Base de catalogo inmobiliario"
        description="Ruta preparada para encabezado, filtros, resultados, grilla de propiedades y paginacion."
      />
      <PropertyListingShell properties={properties} />
    </>
  );
}
