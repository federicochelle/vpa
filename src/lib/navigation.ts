export const publicNavigation = [
  { href: "/alquileres", messageKey: "nav.rent" },
  { href: "/comprar", messageKey: "nav.buy" },
  { href: "/inversion", messageKey: "nav.invest" },
  { href: "/asesoramiento", messageKey: "nav.advisory" },
] as const;

export const adminNavigation = [
  { href: "/admin/propiedades", label: "Propiedades" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/noticias", label: "Noticias" },
  { href: "/admin/consultas", label: "Consultas" },
] as const;
