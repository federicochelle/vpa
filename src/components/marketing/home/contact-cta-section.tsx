import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

export function ContactCtaSection() {
  return (
    <section className="shell section-gap">
      <div className="panel overflow-hidden bg-[linear-gradient(135deg,rgba(40,75,99,0.98),rgba(23,48,66,0.96))] px-6 py-10 text-white sm:px-8">
        <SectionHeading
          eyebrow="Contacto"
          title="Canal listo para recibir consultas desde la web publica"
          description="El formulario ya existe como interfaz visual para conectar luego envio, persistencia o integraciones."
        />
        <div className="mt-8">
          <Link
            className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-strong transition-transform hover:-translate-y-0.5"
            href="/contacto"
          >
            Abrir formulario
          </Link>
        </div>
      </div>
    </section>
  );
}
