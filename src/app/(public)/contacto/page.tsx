import { PageIntro } from "@/components/layout/page-intro";
import { ContactFormShell } from "@/features/inquiries/contact-form-shell";

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contacto"
        title="Formulario visual listo para futuras consultas"
        description="La pagina queda preparada para nombre, email, telefono, mensaje y boton de envio sin implementar persistencia."
      />
      <div className="shell section-gap pt-0">
        <ContactFormShell />
      </div>
    </>
  );
}
