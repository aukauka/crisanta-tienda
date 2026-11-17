import { NextResponse } from "next/server";
import { claveApiValida } from "@/lib/admin";
import { almacen, type Origen } from "@/lib/stock";
import { buscarSku } from "@/lib/productos";

// Suma o resta stock desde afuera (por ejemplo, el futuro bot de WhatsApp).
// Ejemplo: { "sku": "buzo-hoodie-cruz__m", "cambio": -3, "motivo": "Venta mayorista a Juan" }
export async function POST(req: Request) {
  if (!claveApiValida(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { sku, cambio, motivo, origen } = await req.json().catch(() => ({}));
  const n = Math.trunc(Number(cambio));
  if (!buscarSku(String(sku)) || !n) {
    return NextResponse.json({ error: "Falta un sku válido o un cambio distinto de cero" }, { status: 400 });
  }
  const permitido: Origen[] = ["mayorista", "ajuste", "whatsapp"];
  const o: Origen = permitido.includes(origen) ? origen : "whatsapp";
  const r = await almacen.ajustar(String(sku), n, o, String(motivo ?? "").slice(0, 200));
  return NextResponse.json(r, { status: r.ok ? 200 : 409 });
}
