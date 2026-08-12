export const publicNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/inversiones", label: "Inversiones" },
  { href: "/asesoramiento", label: "Asesoramiento" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const adminNavigation = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/propiedades", label: "Propiedades" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/consultas", label: "Consultas" },
  { href: "/admin/configuracion", label: "Configuracion" },
] as const;
