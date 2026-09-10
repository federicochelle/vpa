import Image from "next/image";
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  className?: string;
  variant?: "default" | "compact";
}

function PropertyOperationBadge({ operationType }: { operationType: Property["operationType"] }) {
  return (
    <span className="absolute right-3 top-3 z-10 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
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
  variant = "default",
}: PropertyCardProps) {
  const hasGarage = typeof property.garages === "number" && property.garages > 0;
  const isCompact = variant === "compact";

  return (
    <article
      className={`flex h-full overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)] ${
        isCompact ? "flex-col md:flex-row" : "flex-col"
      } ${className}`.trim()}
    >
      <div className={`relative ${isCompact ? "md:w-60 md:flex-none" : ""}`}>
        <PropertyOperationBadge operationType={property.operationType} />
        <div
          className={`relative overflow-hidden bg-surface-muted ${
            isCompact ? "aspect-[4/3] md:h-full md:min-h-36 md:aspect-auto" : "aspect-[4/3]"
          }`}
        >
          {property.image ? (
            <Image
              alt={property.title}
              className="object-cover object-center"
              fill
              sizes={
                isCompact
                  ? "(min-width: 768px) 15rem, 100vw"
                  : "(min-width: 768px) 50vw, 100vw"
              }
              src={property.image}
            />
          ) : (
            <div className="h-full w-full brand-media-fallback" />
          )}
        </div>
      </div>
      <div
        className={`flex flex-1 flex-col ${
          isCompact ? "px-4 pb-3 pt-3" : "px-5 pb-6 pt-5"
        }`}
      >
        <h3
          className={`overflow-hidden break-words font-display leading-[1.2] text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] ${
            isCompact
              ? "text-base [-webkit-line-clamp:2]"
              : "h-[4.5rem] text-xl [-webkit-line-clamp:3]"
          }`}
        >
          {property.title}
        </h3>
        <div
          className={`type-body-compact grid gap-3 text-muted ${
            isCompact ? "mt-3 gap-2" : "mt-5"
          } ${
            hasGarage ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <BedDouble className="h-5 w-5 flex-none text-primary" />
            {property.bedrooms ?? "-"}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Bath className="h-5 w-5 flex-none text-primary" />
            {property.bathrooms ?? "-"}
          </div>
          {hasGarage ? (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CarFront className="h-5 w-5 flex-none text-primary" />
              {property.garages}
            </div>
          ) : null}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Ruler className="h-5 w-5 flex-none text-primary" />
            {property.totalArea ? `${property.totalArea} m2` : "-"}
          </div>
        </div>
        <div
          className={`mt-auto flex items-end justify-between gap-4 ${
            isCompact ? "pt-3" : "pt-6"
          }`}
        >
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
