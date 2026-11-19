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

/** WhatsApp de Marcelo (sin + ni espacios). Se puede cambiar con NEXT_PUBLIC_WHATSAPP (variable de build en Cloudflare). */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "5493516192531";
export const INSTAGRAM = "https://instagram.com/";
