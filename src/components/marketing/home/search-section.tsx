import { Search } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

export function SearchSection() {
  return (
    <section className="shell section-gap pt-0">
      <div className="panel p-6 sm:p-8">
        <SectionHeading
          eyebrow="Buscador"
          title="Estructura preparada para futuras busquedas y filtros"
          description="Este bloque ya reserva el espacio para conectar criterios de operacion, tipo, ubicacion, rango de precio y superficie."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {["Operacion", "Tipo", "Ubicacion", "Rango de precio"].map((field) => (
              <div
                key={field}
                className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted"
              >
                {field}
              </div>
            ))}
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            type="button"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}
