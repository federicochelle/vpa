import { StatCard } from "@/components/admin/stat-card";
import { PageIntro } from "@/components/layout/page-intro";

export default function AdminDashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow=""
        title="Panel administrativo listo para indicadores reales"
        description="La estructura contempla propiedades, propiedades publicadas, proyectos, consultas nuevas y ultimas consultas."
      />

      <div className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold text-primary-strong">Ultimas consultas</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Este bloque queda listo para una lista o tabla de actividad reciente.
        </p>
      </div>
    </>
  );
}
