import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPublishedPropertyBySlug } from "@/features/properties/properties.data";
import { PropertyDetailShell } from "@/features/properties/property-detail-shell";

interface BuyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuyDetailPage({ params }: BuyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property || property.operationType !== "sale") {
    notFound();
  }

  const location =
    [property.neighborhood, property.city, property.department]
      .filter(Boolean)
      .join(", ") || "Ubicación pendiente";
  const price =
    property.currency && property.price
      ? `${property.currency} ${new Intl.NumberFormat("es-UY", {
          maximumFractionDigits: 0,
        }).format(property.price)}`
      : "Precio a consultar";

  return (
    <>
      <section className="shell pb-0 pt-3 sm:pb-0 sm:pt-4 lg:pb-0 lg:pt-5">
        <div className="panel overflow-hidden !rounded-none">
          <div className="flex flex-col gap-6 bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-6 sm:px-8 lg:px-12">
            <div className="space-y-4">
              <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                {property.title}
              </h1>
              <span className="inline-flex rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-strong">
                Venta
              </span>
              <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{location}</span>
                </div>
                <p className="font-display text-2xl text-primary-strong sm:text-3xl">
                  {price}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PropertyDetailShell property={property} />
    </>
  );
}
