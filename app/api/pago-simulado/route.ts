import { NextResponse } from "next/server";
import { almacen } from "@/lib/stock";
import { pagoReal } from "@/lib/mercadopago";

// Solo existe mientras no esté conectado Mercado Pago.
export async function POST(req: Request) {
  if (pagoReal) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  const { id, resultado } = await req.json();
  const estado = await almacen.cerrarOrden(String(id), resultado === "aprobar" ? "pagada" : "cancelada", "SIMULADO");
  if (!estado) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  return NextResponse.json({ estado });
}
