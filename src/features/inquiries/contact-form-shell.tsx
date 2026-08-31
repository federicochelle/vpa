import { FormField } from "@/components/ui/form-field";

export function ContactFormShell() {
  return (
    <form className="panel p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField htmlFor="name" label="Nombre">
          <input
            className="input-base bg-white/70"
            id="name"
            name="name"
            placeholder="Nombre"
            type="text"
          />
        </FormField>
        <FormField htmlFor="email" label="Email">
          <input
            className="input-base bg-white/70"
            id="email"
            name="email"
            placeholder="Email"
            type="email"
          />
        </FormField>
        <FormField htmlFor="phone" label="Telefono">
          <input
            className="input-base bg-white/70"
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
              className="input-base min-h-40 bg-white/70"
              id="message"
              name="message"
              placeholder="Mensaje"
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="button-primary"
          type="submit"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}
