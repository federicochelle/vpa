import { PageIntro } from "@/components/layout/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";

const advisoryBlocks = [
  "Presentacion personal",
  "Fotografia",
  "Trayectoria o experiencia",
  "Asesoramiento inmobiliario",
  "Acompanamiento en compras",
  "Acompanamiento en inversiones",
  "Metodologia de trabajo",
  "CTA para contactar",
] as const;

export default function AdvisoryPage() {
  return (
    <>
      <PageIntro
        eyebrow="Asesoramiento"
        title="Pagina editorial para presentacion profesional"
        description="Este espacio reemplaza una pagina de nosotros y organiza la futura presentacion personal junto con el servicio de asesoramiento."
      />
      <div className="shell section-gap pt-0">
        <div className="panel p-6 sm:p-8">
          <SectionHeading
            eyebrow="Estructura"
            title="Bloques preparados para contenido institucional real"
            description="No se agrega biografia, nombres ni textos comerciales inventados. Solo queda definida la composicion."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {advisoryBlocks.map((block) => (
              <div
                key={block}
                className="rounded-3xl border border-border bg-white/70 px-5 py-6 text-sm font-medium text-primary-strong"
              >
                {block}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
