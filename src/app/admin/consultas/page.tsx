import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { PageIntro } from "@/components/layout/page-intro";

export default function AdminInquiriesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Admin consultas"
        title="Bandeja preparada para seguimiento comercial"
        description="La estructura contempla nombre, propiedad o proyecto, fecha y estado con los estados previstos Nueva, Contactada y Cerrada."
      />
      <AdminTableShell
        columns={["Nombre", "Propiedad/Proyecto", "Fecha", "Estado"]}
        emptyDescription="Sin consultas cargadas. La tabla queda lista para datos reales."
        emptyTitle="Listado de consultas"
      />
    </>
  );
}
