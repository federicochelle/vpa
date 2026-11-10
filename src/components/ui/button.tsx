import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Botón único del sitio público: rectángulo rojo de marca, texto blanco en
 * mayúsculas con la fuente display, sin bordes redondeados ni sombra.
 * Los estilos viven en `.btn` (globals.css). `className` solo debe aportar
 * layout (ancho, margen, visibilidad responsive), no color ni forma.
 */
type ButtonAsButton = ComponentProps<"button"> & { href?: undefined };
type ButtonAsLink = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { className = "", ...rest } = props;
  const classes = `btn inline-flex items-center justify-center gap-2 ${className}`.trim();

  if ("href" in rest && rest.href !== undefined) {
    return <Link {...(rest as Omit<ButtonAsLink, "className">)} className={classes} />;
  }

  const { type = "button", ...buttonProps } = rest as ComponentProps<"button">;
  return <button {...buttonProps} className={classes} type={type} />;
}

/** Ícono blanco dentro de un cuadrado rojo (mismo lenguaje visual que Button). */
export function IconBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`icon-box ${className}`.trim()}>
      {children}
    </span>
  );
}
