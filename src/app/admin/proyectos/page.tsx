import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { PageIntro } from "@/components/layout/page-intro";

export default function AdminProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Admin proyectos"
        title="Gestion preparada para desarrollos inmobiliarios"
        description="La pagina deja lista la estructura para nuevo proyecto, listado, estado, ubicacion, entrega, publicacion y acciones."
        actions={
          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            type="button"
          >
            Nuevo proyecto
          </button>
        }
      />
      <AdminTableShell
        columns={["Proyecto", "Estado", "Ubicacion", "Entrega", "Publicacion", "Acciones"]}
        emptyDescription="Listado preparado para la administracion de proyectos."
        emptyTitle="Listado de proyectos"
      />
    </>
  );
}
