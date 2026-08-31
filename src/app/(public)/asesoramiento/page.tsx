import Image from "next/image";
import virginiaImage from "../../../../virginia.jpeg";
import virginiaSecondaryImage from "../../../../virgina2.jpeg";

export default function AdvisoryPage() {
  return (
    <>
      <section className="bg-surface-strong py-16 sm:py-20">
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
            <div className="relative min-h-[360px] overflow-hidden border border-border bg-surface-muted sm:min-h-[460px]">
              <Image
                src={virginiaImage}
                alt="Asesoramiento inmobiliario"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h1 className="section-title">
                  Experiencia y cercanía
                </h1>
              </div>

              <div className="section-copy max-w-none space-y-5">
                <p>
                  Una sólida trayectoria en el mercado inmobiliario permite acompañar
                  a personas, familias e inversores en decisiones de compra, venta,
                  alquiler e inversión, brindando un asesoramiento cercano y
                  personalizado, basado en el conocimiento del mercado y en entender
                  las necesidades de cada cliente.
                </p>
                <p>
                  La experiencia se complementa con una red de vínculos profesionales
                  y alianzas estratégicas en Uruguay y Argentina, ampliando las
                  oportunidades para quienes buscan invertir, encontrar una propiedad
                  o desarrollar nuevos proyectos en la región.
                </p>
              </div>

              <p className="font-display text-2xl text-foreground">
                Virginia Pintos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-18 sm:py-24">
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:gap-14">
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h2 className="section-title">
                  Un asesoramiento pensado para vos
                </h2>
              </div>

              <div className="section-copy max-w-2xl space-y-6">
                <p>
                  Cada decisión inmobiliaria parte de una necesidad diferente. Ya sea
                  que estés buscando alquilar, comprar o invertir, te acompañamos para
                  entender qué necesitás, evaluar las distintas alternativas y encontrar
                  la opción que mejor se adapte a vos.
                </p>
                <p>
                  Nuestro objetivo es simplificar el proceso, acercarte información
                  clara y ayudarte a tomar cada decisión con confianza, desde la primera
                  búsqueda hasta encontrar la propiedad o inversión indicada.
                </p>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden border border-border bg-surface-muted sm:min-h-[420px]">
              <Image
                src={virginiaSecondaryImage}
                alt="Asesoramiento personalizado"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-strong py-18 sm:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)] lg:items-start lg:gap-14">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="section-title">
                Conversemos
              </h2>
              <p className="section-copy max-w-2xl">
                Si estás pensando en alquilar, comprar o invertir y querés recibir
                asesoramiento personalizado, coordinemos una reunión para conocer qué
                estás buscando.
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="meeting-fullName"
                >
                  Nombre completo
                </label>
                <input
                  className="input-base w-full"
                  id="meeting-fullName"
                  name="fullName"
                  placeholder="Tu nombre y apellido"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="meeting-phone"
                >
                  Telefono
                </label>
                <input
                  className="input-base w-full"
                  id="meeting-phone"
                  name="phone"
                  placeholder="Tu telefono o WhatsApp"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="meeting-email"
                >
                  Email
                </label>
                <input
                  className="input-base w-full"
                  id="meeting-email"
                  name="email"
                  placeholder="tu@email.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="type-meta font-semibold uppercase tracking-[0.16em] text-muted"
                  htmlFor="meeting-message"
                >
                  Mensaje
                </label>
                <textarea
                  className="input-base min-h-40 w-full"
                  id="meeting-message"
                  name="message"
                  placeholder="Contanos qué estás buscando"
                />
              </div>

              <div className="pt-2">
                <button className="button-primary inline-flex w-full items-center justify-center" type="button">
                  Agendar una reunión
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
