import Image from "next/image";
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

function PropertyOperationBadge({ operationType }: { operationType: Property["operationType"] }) {
  return (
    <span className="absolute right-3 top-3 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
      {operationType === "rent" ? "ALQUILER" : "VENTA"}
    </span>
  );
}

function formatPropertyPrice(price: number | null, currency: string | null) {
  if (!price || !currency) {
    return "Precio pendiente";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({
  property,
  className = "",
}: PropertyCardProps) {
  return (
    <article
      className={`overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] ${className}`.trim()}
    >
      <div className="relative">
        <PropertyOperationBadge operationType={property.operationType} />
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {property.image ? (
            <Image
              alt={property.title}
              className="object-cover object-center"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              src={property.image}
            />
          ) : (
            <div className="h-full w-full brand-media-fallback" />
          )}
        </div>
      </div>
      <div className="space-y-5 p-5">
        <h3 className="max-h-[3.6em] overflow-hidden break-words font-display text-xl leading-[1.2] text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {property.title}
        </h3>
        <div className="type-body-compact grid grid-cols-4 gap-3 text-muted">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <BedDouble className="h-5 w-5 flex-none text-primary" />
            {property.bedrooms ?? "-"}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Bath className="h-5 w-5 flex-none text-primary" />
            {property.bathrooms ?? "-"}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <CarFront className="h-5 w-5 flex-none text-primary" />
            {property.garages ?? "-"}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Ruler className="h-5 w-5 flex-none text-primary" />
            {property.builtArea ? `${property.builtArea} m2` : "-"}
          </div>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="type-body-compact flex min-w-0 items-center gap-2 text-muted">
            <MapPin className="h-4 w-4 flex-none text-primary" />
            <span className="truncate">{property.neighborhood ?? "Ubicación pendiente"}</span>
          </div>
          <p className="shrink-0 text-right text-lg font-semibold text-primary-strong">
            {formatPropertyPrice(property.price, property.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
