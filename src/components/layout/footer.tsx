import Link from "next/link";
import { publicNavigation } from "@/lib/navigation";
import { siteName } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="shell flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="font-display text-2xl text-foreground">{siteName}</p>
          <p className="max-w-md text-sm leading-6 text-muted">
            Estructura base preparada para continuar el desarrollo de propiedades,
            proyectos, inversiones, asesoramiento y contacto.
          </p>
        </div>
        <nav className="grid gap-3 text-sm text-muted sm:grid-cols-2 md:grid-cols-3">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              className="transition-colors hover:text-primary-strong"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
