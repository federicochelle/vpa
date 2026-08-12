import { PageIntro } from "@/components/layout/page-intro";
import { ProjectListingShell } from "@/features/projects/project-listing-shell";

export default function InvestmentsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Inversiones"
        title="Canal dedicado a oportunidades de inversion"
        description="Estructura preparada para reutilizar proyectos marcados como oportunidad de inversion."
      />
      <ProjectListingShell investmentOnly />
    </>
  );
}
