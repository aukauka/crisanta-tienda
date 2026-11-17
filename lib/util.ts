export const pesos = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export const fechaCorta = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

/** Número de WhatsApp de la marca (sin + ni espacios). Cambiar por el real. */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000";
export const INSTAGRAM = "https://instagram.com/";
