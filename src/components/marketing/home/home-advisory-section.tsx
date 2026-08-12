import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

export function HomeAdvisorySection() {
  return (
    <section className="shell section-gap">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="panel flex min-h-72 items-center justify-center border-dashed bg-surface-strong px-6 text-center text-sm text-muted">
          Espacio preparado para fotografia o retrato institucional
        </div>
        <div className="panel space-y-6 px-6 py-8 sm:px-8">
          <SectionHeading
            eyebrow="Asesoramiento"
            title="Presentacion editorial para el servicio profesional"
            description="La pagina centraliza la presentacion personal, experiencia, metodologia y acompanamiento inmobiliario sin separar una seccion de nosotros."
          />
          <Link
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
            href="/asesoramiento"
          >
            Ver pagina de asesoramiento
          </Link>
        </div>
      </div>
    </section>
  );
}
