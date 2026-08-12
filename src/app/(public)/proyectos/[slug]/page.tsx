import { PageIntro } from "@/components/layout/page-intro";
import { ProjectDetailShell } from "@/features/projects/project-detail-shell";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  return (
    <>
      <PageIntro
        eyebrow="Proyecto"
        title="Detalle de proyecto listo para crecer"
        description="La pagina contempla galeria, descripcion, desarrollador, unidades y canal de consulta."
      />
      <ProjectDetailShell slug={slug} />
    </>
  );
}
