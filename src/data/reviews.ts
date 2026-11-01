// Testimonios reales de clientes. Se muestran siempre en español (no se traducen).
// Pensado para migrar luego a Supabase: mantener la forma { id, name, text }.
export interface Review {
  id: string;
  name: string;
  text: string;
}

export const reviews: readonly Review[] = [
  {
    id: "raul",
    name: "Raúl",
    text: "Hablar de VPA es hablar de Virginia. Es una excelente anfitriona que te acompaña desde la primera consulta, con paciencia y dedicación, aclarando dudas y orientándote entre los distintos desarrollos y propuestas que maneja. Su acompañamiento continúa con la reserva, la documentación necesaria y el cierre de la operación. Una excelente persona y una inmobiliaria que brinda confianza.",
  },
  {
    id: "jesus",
    name: "Jesús",
    text: "Excelente servicio al que me une años. Gran profesionalidad en todo lo que refiere a esta actividad. Muy conforme.",
  },
  {
    id: "federico",
    name: "Federico",
    text: "Mi experiencia con VPA, Virginia Pintos fue excelente. Compré un departamento en Montevideo a través de ellos y posteriormente también confié en la inmobiliaria para ponerlo en alquiler. Viviendo fuera del Uruguay fue fundamental para mí contar con alguien de confianza que pudiera gestionar todo de manera eficiente y darme tranquilidad durante el proceso. Todo se desarrolló de manera rápida, ágil y profesional.",
  },
  {
    id: "sabina",
    name: "Sabina",
    text: "Tengo tres propiedades en Montevideo compradas con el asesoramiento y asistencia de VPA, las cuales están administradas por VPA. Recomiendo su servicio por el trato amable para con sus clientes y destaco la eficiencia y disposición a resolver problemas que pudieran suscitarse. La empresa cumple con todos los requisitos que uno espera de una buena administración, así como de su profesionalidad en el momento de asesorarnos en la compra.",
  },
  {
    id: "patricia",
    name: "Patricia",
    text: "Muy eficientes, siempre resuelven todos los problemas.",
  },
  {
    id: "enrique",
    name: "Enrique",
    text: "Conozco a la Sra. Virginia Pintos de VPA Propiedades desde el año 2011, donde me asesoró y orientó de manera excelente para comprar una propiedad desde el pozo en Montevideo, la cual cuida y administra el alquiler desde que me fue entregada. Es una persona confiable, honesta y responsable, muy profesional. Es para recomendar.",
  },
];
