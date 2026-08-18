import Link from "next/link";

export function HeroSection() {
  return (
    <section className="shell section-gap">
      <div className="panel grid overflow-hidden lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6 px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          <span className="eyebrow fade-up">Base de lanzamiento</span>
          <h1 className="fade-up font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Plataforma lista para crecer con propiedades, proyectos e inversiones.
          </h1>
          <p className="fade-up max-w-2xl text-base leading-8 text-muted">
            La estructura publica y administrativa ya queda preparada para conectar
            catalogo, consultas y configuracion sin depender todavia de backend o servicios externos.
          </p>
          <div className="fade-up flex flex-wrap gap-3">
            <Link className="button-primary" href="/comprar">
              Explorar estructura
            </Link>
            <Link className="button-secondary" href="/admin">
              Ver panel
            </Link>
          </div>
        </div>
        <div className="grid-pattern relative min-h-80 border-t border-border bg-[radial-gradient(circle_at_top_right,rgba(200,16,46,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,247,245,0.98))] lg:min-h-full lg:border-t-0 lg:border-l">
          <div className="absolute inset-6 rounded-[32px] border border-white/70 bg-white/55 backdrop-blur-sm" />
          <div className="absolute inset-x-12 top-14 rounded-[28px] border border-border bg-white px-6 py-5 shadow-[0_16px_36px_rgba(39,39,39,0.06)]">
            <p className="text-sm font-semibold text-foreground">Rutas iniciales</p>
            <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
              <span>/</span>
              <span>/alquileres</span>
              <span>/comprar</span>
              <span>/inversion</span>
              <span>/asesoramiento</span>
              <span>/admin</span>
            </div>
          </div>
          <div className="absolute bottom-10 left-8 right-8 rounded-[28px] border border-border bg-white/95 p-6">
            <p className="text-sm font-semibold text-primary-strong">Objetivo de esta fase</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Dejar una base limpia, escalable y sin contenido inventado para continuar el desarrollo real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
