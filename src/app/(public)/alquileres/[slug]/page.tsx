import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";

interface RentalDetailPageProps {
  params: Promise<{ slug: string }>;
}

function cleanLocationPart(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value
    .replace(/,\s*Cordon\b/gi, "")
    .replace(/,\s*\d{5}\s+Montevideo\b/gi, "")
    .replace(/,\s*Montevideo\b/gi, "")
    .replace(/,\s*Departamento de Montevideo\b/gi, "")
    .trim();
}

export default async function RentalDetailPage({ params }: RentalDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property || property.operationType !== "rent") {
    notFound();
  }

  const location = cleanLocationPart(property.address) || "Ubicación pendiente";
  const price =
    property.currency && property.price
      ? `${property.currency} ${new Intl.NumberFormat("es-UY", {
          maximumFractionDigits: 0,
        }).format(property.price)}`
      : "Precio a consultar";

  return (
    <>
      <section className="shell pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="-mx-4 sm:mx-0">
          <div className="panel overflow-hidden !rounded-none">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-6 sm:px-8 lg:px-12">
              <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                  <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                    {property.title}
                  </h1>
                  <div className="flex items-start justify-between gap-4 text-muted">
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin className="h-4 w-4 flex-none text-primary" />
                      <span className="font-display text-2xl text-primary-strong sm:font-sans sm:text-sm sm:text-muted">
                        {location}
                      </span>
                    </div>
                    <p className="shrink-0 font-display text-2xl text-primary-strong sm:text-3xl">
                      {price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PropertyDetailShell property={property} />
    </>
  );
}
