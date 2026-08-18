"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { propertyTypeOptions } from "@/features/properties/property-options";

const searchOperationOptions = [
  { value: "sale", label: "Venta" },
  { value: "rent", label: "Alquiler" },
  { value: "investment", label: "Inversión" },
] as const;

export function SearchSection() {
  const router = useRouter();
  const [operation, setOperation] = useState<(typeof searchOperationOptions)[number]["value"]>("sale");
  const [propertyType, setPropertyType] = useState("");
  const [zone, setZone] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (propertyType) {
      params.set("tipo", propertyType);
    }
    if (zone.trim()) {
      params.set("zona", zone.trim());
    }

    const basePath =
      operation === "rent" ? "/alquileres" : operation === "investment" ? "/inversion" : "/comprar";
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <section className="shell relative z-10 -mt-16 pb-12 sm:-mt-20 sm:pb-14 lg:-mt-24 lg:pb-16">
      <div className="border border-border bg-surface p-6 shadow-[0_14px_40px_rgba(39,39,39,0.05)] sm:p-8">
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Tipo de propiedad
            <select
              className="input-base"
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
              name="tipo"
            >
              <option value="">Todos</option>
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Operación
            <select
              className="input-base"
              value={operation}
              onChange={(event) =>
                setOperation(event.target.value as (typeof searchOperationOptions)[number]["value"])
              }
              name="operacion"
            >
              {searchOperationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Zona
            <input
              className="input-base"
              type="text"
              name="zona"
              placeholder="Ej: Carrasco, Pocitos o Centro"
              value={zone}
              onChange={(event) => setZone(event.target.value)}
            />
          </label>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong xl:self-end"
            type="submit"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
}
