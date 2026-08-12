import { PageIntro } from "@/components/layout/page-intro";
import { FormField } from "@/components/ui/form-field";

const fields = [
  { id: "businessName", label: "Nombre del negocio", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "phone", label: "Telefono", type: "tel" },
  { id: "whatsapp", label: "WhatsApp", type: "tel" },
  { id: "address", label: "Direccion", type: "text" },
  { id: "instagram", label: "Instagram", type: "text" },
  { id: "facebook", label: "Facebook", type: "text" },
] as const;

export default function AdminSettingsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Configuracion"
        title="Formulario base para datos del negocio"
        description="La configuracion visual queda preparada sin valores iniciales ni persistencia."
      />
      <form className="panel p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((field) => (
            <FormField key={field.id} htmlFor={field.id} label={field.label}>
              <input
                className="rounded-2xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary"
                id={field.id}
                name={field.id}
                type={field.type}
              />
            </FormField>
          ))}
        </div>
        <div className="mt-6">
          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Guardar
          </button>
        </div>
      </form>
    </>
  );
}
