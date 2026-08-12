import { FormField } from "@/components/ui/form-field";

export function ContactFormShell() {
  return (
    <form className="panel p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField htmlFor="name" label="Nombre">
          <input
            className="rounded-2xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary"
            id="name"
            name="name"
            placeholder="Nombre"
            type="text"
          />
        </FormField>
        <FormField htmlFor="email" label="Email">
          <input
            className="rounded-2xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary"
            id="email"
            name="email"
            placeholder="Email"
            type="email"
          />
        </FormField>
        <FormField htmlFor="phone" label="Telefono">
          <input
            className="rounded-2xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary"
            id="phone"
            name="phone"
            placeholder="Telefono"
            type="tel"
          />
        </FormField>
        <div className="hidden sm:block" />
        <div className="sm:col-span-2">
          <FormField htmlFor="message" label="Mensaje">
            <textarea
              className="min-h-40 rounded-2xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary"
              id="message"
              name="message"
              placeholder="Mensaje"
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
          type="submit"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}
