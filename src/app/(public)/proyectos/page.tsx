import { PageIntro } from "@/components/layout/page-intro";
import { ProjectListingShell } from "@/features/projects/project-listing-shell";

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Proyectos"
        title="Estructura base para desarrollos inmobiliarios"
        description="Pagina preparada para renderizar todos los proyectos y reutilizar un card consistente."
      />
      <ProjectListingShell />
    </>
  );
}
