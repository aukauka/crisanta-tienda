import { NextResponse } from "next/server";
import { almacen } from "@/lib/stock";
import { consultarPago, pagoReal } from "@/lib/mercadopago";

// Mercado Pago avisa acá cada vez que cambia un pago.
// No confiamos en el aviso: siempre volvemos a consultar el pago con nuestra clave.
export async function POST(req: Request) {
  if (!pagoReal) return NextResponse.json({ ok: true });
  const url = new URL(req.url);
  let cuerpo: { type?: string; data?: { id?: string | number } } = {};
  try {
    cuerpo = await req.json();
  } catch {}
  const tipo = cuerpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const pagoId = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !pagoId) return NextResponse.json({ ok: true });

  const pago = await consultarPago(pagoId);
  if (!pago?.orden) return NextResponse.json({ ok: true });

  if (pago.estado === "approved") await almacen.cerrarOrden(pago.orden, "pagada", pagoId);
  else if (["rejected", "cancelled", "refunded", "charged_back"].includes(pago.estado))
    await almacen.cerrarOrden(pago.orden, "cancelada", pagoId);

  return NextResponse.json({ ok: true });
}
