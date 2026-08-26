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
    <div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.09),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,247,245,0.96))] px-6 py-10 sm:px-8 lg:px-12">
          <div className="space-y-4">
            <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Configuración general
            </h4>
          </div>
        </div>

        <form className="space-y-8 p-6 sm:p-8">
          <div>
            <div className="grid gap-6 md:grid-cols-2">
              {fields.map((field) => (
                <FormField key={field.id} htmlFor={field.id} label={field.label}>
                  <input
                    className="rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-primary"
                    id={field.id}
                    name={field.id}
                    type={field.type}
                  />
                </FormField>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <button
              className="inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
              type="submit"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
