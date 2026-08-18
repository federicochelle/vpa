import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

export function HomeInvestmentsSection() {
  return (
    <section className="shell section-gap">
      <div className="panel grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <SectionHeading
          eyebrow="Inversiones"
          title="Canal preparado para proyectos marcados como oportunidad de inversion"
          description="La pagina de inversiones reutilizara los proyectos cuyo indicador sea `isInvestmentOpportunity === true`."
        />
        <div className="flex justify-start lg:justify-end">
          <Link
            className="rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-semibold text-primary-strong transition-colors hover:bg-surface-strong"
            href="/inversion"
          >
            Ver estructura
          </Link>
        </div>
      </div>
    </section>
  );
}
