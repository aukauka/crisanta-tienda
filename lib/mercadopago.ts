import "server-only";
import type { Orden } from "@/lib/stock";

// Mercado Pago Checkout Pro.
// Si no está cargada la clave MP_ACCESS_TOKEN, la tienda usa un pago simulado.
const TOKEN = process.env.MP_ACCESS_TOKEN;
export const pagoReal = Boolean(TOKEN);

export function urlDelSitio(req?: Request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Crea el link de pago de Mercado Pago y devuelve la dirección a la que hay que ir. */
export async function crearPreferencia(orden: Orden, sitio: string, minutos: number): Promise<string> {
  const vence = new Date(Date.now() + minutos * 60_000).toISOString();
  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orden.id,
    },
    body: JSON.stringify({
      items: orden.items.map((i) => ({
        id: i.sku,
        title: `${i.nombre} (${i.talle})`,
        quantity: i.cantidad,
        unit_price: i.precio,
        currency_id: "ARS",
      })),
      payer: { name: orden.cliente.nombre, email: orden.cliente.email },
      external_reference: orden.id,
      back_urls: {
        success: `${sitio}/compra/${orden.id}`,
        pending: `${sitio}/compra/${orden.id}`,
        failure: `${sitio}/compra/${orden.id}`,
      },
      auto_return: "approved",
      notification_url: `${sitio}/api/mercadopago/aviso`,
      statement_descriptor: "CRISANTA",
      expires: true,
      expiration_date_to: vence,
    }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(`Mercado Pago: ${datos?.message ?? res.status}`);
  // Con claves de prueba, Mercado Pago devuelve sandbox_init_point.
  return TOKEN!.startsWith("TEST-") ? datos.sandbox_init_point ?? datos.init_point : datos.init_point;
}

/** Consulta a Mercado Pago el estado real de un pago (no confiamos en lo que llega del navegador). */
export async function consultarPago(id: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const p = await res.json();
  return { estado: p.status as string, orden: p.external_reference as string | null };
}
