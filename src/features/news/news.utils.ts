export function formatNewsDate(value: string | null) {
  if (!value) {
    return "Fecha pendiente";
  }

  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
