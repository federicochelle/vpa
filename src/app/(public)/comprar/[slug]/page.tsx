import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";

interface BuyDetailPageProps {
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

export default async function BuyDetailPage({ params }: BuyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property || property.operationType !== "sale") {
    notFound();
  }

  const mobileLocation =
    cleanLocationPart(property.neighborhood) ||
    cleanLocationPart(property.address) ||
    "Ubicación pendiente";
  const desktopLocation = cleanLocationPart(property.address) || "Ubicación pendiente";
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
                <div className="min-w-0 flex-1 space-y-4">
                  <h1 className="detail-hero-title text-foreground">
                    {property.title}
                  </h1>
                  <div className="flex items-start justify-between gap-4 lg:hidden">
                    <div className="flex min-w-0 items-center gap-2 text-base text-primary-strong">
                      <MapPin className="h-4 w-4 flex-none text-primary" />
                      <span className="truncate whitespace-nowrap">{mobileLocation}</span>
                    </div>
                    <p className="detail-hero-price shrink-0 text-right text-primary-strong">
                      {price}
                    </p>
                  </div>
                  <div className="hidden items-start justify-between gap-4 text-muted lg:flex">
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin className="h-4 w-4 flex-none text-primary" />
                      <span>{desktopLocation}</span>
                    </div>
                    <p className="detail-hero-price shrink-0 text-right text-primary-strong">
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
