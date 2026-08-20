"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { propertyTypeOptions } from "@/features/properties/property-options";

const searchOperationOptions = [
  { value: "sale", label: "Venta" },
  { value: "rent", label: "Alquiler" },
  { value: "investment", label: "Inversión" },
] as const;

interface SearchSectionProps {
  locationOptions: string[];
}

function normalizeLocation(value: string) {
  return value.trim().toLocaleLowerCase("es-UY");
}

export function SearchSection({ locationOptions }: SearchSectionProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<(typeof searchOperationOptions)[number]["value"]>("sale");
  const [propertyType, setPropertyType] = useState("");
  const [zone, setZone] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const filteredLocationOptions = useMemo(() => {
    const normalizedZone = normalizeLocation(zone);

    if (!normalizedZone) {
      return locationOptions;
    }

    return locationOptions.filter((option) =>
      normalizeLocation(option).includes(normalizedZone),
    );
  }, [locationOptions, zone]);

  const hasExactLocationMatch = useMemo(
    () => locationOptions.some((option) => normalizeLocation(option) === normalizeLocation(zone)),
    [locationOptions, zone],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (propertyType) {
      params.set("tipo", propertyType);
    }
    if (zone.trim() && hasExactLocationMatch) {
      const selectedLocation = locationOptions.find(
        (option) => normalizeLocation(option) === normalizeLocation(zone),
      );

      if (selectedLocation) {
        params.set("zona", selectedLocation);
      }
    }

    const basePath =
      operation === "rent" ? "/alquileres" : operation === "investment" ? "/inversion" : "/comprar";
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <section className="relative z-10 -mt-24 pb-12 px-4 md:mt-0 md:shell md:-mt-20 md:px-0 md:pb-14 lg:-mt-24 lg:pb-16">
      <div className="md:hidden">
        <div className="mx-auto max-w-xl overflow-hidden border border-border bg-surface shadow-[0_14px_40px_rgba(39,39,39,0.05)]">
          <div className="bg-white p-5">
            <form className="grid gap-4" onSubmit={handleSubmit}>
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
                <div className="relative w-full">
                  <input
                    autoComplete="off"
                    className="input-base w-full"
                    type="text"
                    name="zona"
                    placeholder="Ej: Carrasco, Pocitos o Centro"
                    value={zone}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsLocationOpen(false);

                        if (!zone.trim()) {
                          return;
                        }

                        const selectedLocation = locationOptions.find(
                          (option) => normalizeLocation(option) === normalizeLocation(zone),
                        );

                        setZone(selectedLocation ?? "");
                      }, 120);
                    }}
                    onChange={(event) => {
                      setZone(event.target.value);
                      setIsLocationOpen(true);
                    }}
                    onFocus={() => setIsLocationOpen(true)}
                  />

                  {isLocationOpen && filteredLocationOptions.length > 0 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-60 overflow-y-auto border border-border bg-white shadow-[0_14px_40px_rgba(39,39,39,0.08)]">
                      {filteredLocationOptions.map((option) => (
                        <button
                          key={option}
                          className="block w-full px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-strong"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setZone(option);
                            setIsLocationOpen(false);
                          }}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
                type="submit"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:mx-auto md:block md:w-full md:max-w-6xl">
        <div className="border border-border bg-surface p-6 shadow-[0_14px_40px_rgba(39,39,39,0.05)] sm:p-8">
          <form
            className="gap-4 md:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            onSubmit={handleSubmit}
          >
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
              <div className="relative w-full">
                <input
                  autoComplete="off"
                  className="input-base w-full"
                  type="text"
                  name="zona"
                  placeholder="Ej: Carrasco, Pocitos o Centro"
                  value={zone}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setIsLocationOpen(false);

                      if (!zone.trim()) {
                        return;
                      }

                      const selectedLocation = locationOptions.find(
                        (option) => normalizeLocation(option) === normalizeLocation(zone),
                      );

                      setZone(selectedLocation ?? "");
                    }, 120);
                  }}
                  onChange={(event) => {
                    setZone(event.target.value);
                    setIsLocationOpen(true);
                  }}
                  onFocus={() => setIsLocationOpen(true)}
                />

                {isLocationOpen && filteredLocationOptions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-60 overflow-y-auto border border-border bg-white shadow-[0_14px_40px_rgba(39,39,39,0.08)]">
                    {filteredLocationOptions.map((option) => (
                      <button
                        key={option}
                        className="block w-full px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-strong"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setZone(option);
                          setIsLocationOpen(false);
                        }}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
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
      </div>
    </section>
  );
}
