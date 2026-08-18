import Link from "next/link";
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedPropertiesByOperation } from "@/features/properties/properties.data";

function formatPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio a consultar";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function BuyPage() {
  const properties = await listPublishedPropertiesByOperation("sale");

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="shell space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Comprar
          </p>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            Propiedades en venta
          </h1>
        </div>

        {properties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/comprar/${property.slug}`}
                className="overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]"
              >
                <div
                  className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(200,16,46,0.14),rgba(255,255,255,0.42)),linear-gradient(180deg,#d8d1c8,#efeae3)] bg-cover bg-center"
                  style={property.image ? { backgroundImage: `url(${property.image})` } : undefined}
                />
                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl text-foreground">
                      {property.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{property.neighborhood ?? "Ubicación pendiente"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-primary" />
                      {property.bedrooms ?? "-"} dorm.
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-primary" />
                      {property.bathrooms ?? "-"} baños
                    </div>
                    <div className="flex items-center gap-2">
                      <CarFront className="h-4 w-4 text-primary" />
                      {property.garages ?? "-"} garages
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      {property.builtArea ?? "-"} m2
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-primary-strong">
                    {formatPropertyPrice(property.price, property.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay propiedades en venta publicadas"
            description="Esta grilla ya quedó preparada para mostrar propiedades reales."
          />
        )}
      </div>
    </section>
  );
}
