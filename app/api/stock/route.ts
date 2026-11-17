import { NextResponse } from "next/server";
import { claveApiValida } from "@/lib/admin";
import { almacen } from "@/lib/stock";
import { todosLosSkus } from "@/lib/productos";

// Lista de stock para el bot de WhatsApp u otros sistemas.
// Requiere el encabezado "Authorization: Bearer <STOCK_API_CLAVE>".
export async function GET(req: Request) {
  if (!claveApiValida(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const stock = await almacen.leerStock();
  return NextResponse.json({
    stock: todosLosSkus().map(({ sku, producto, talle }) => ({
      sku,
      producto: producto.nombre,
      talle,
      cantidad: stock[sku] ?? 0,
    })),
  });
}
