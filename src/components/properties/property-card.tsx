import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="panel overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(39,39,39,0.08)]">
      <div className="grid gap-6 p-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex min-h-44 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-strong px-4 text-center text-sm text-muted">
          {property.image ? "Imagen disponible" : "Espacio reservado para imagen"}
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="status-pill">
              {property.operationType}
            </p>
            <h3 className="text-xl font-semibold text-foreground">{property.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{property.neighborhood ?? "Ubicacion pendiente"}</span>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-muted sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              {property.bedrooms ?? "-"} dorm.
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-primary" />
              {property.bathrooms ?? "-"} banos
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
          <div className="text-sm font-semibold text-primary-strong">
            {property.currency && property.price ? `${property.currency} ${property.price}` : "Precio pendiente"}
          </div>
        </div>
      </div>
    </article>
  );
}
