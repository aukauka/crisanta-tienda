import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { productoPorSlug, skuDe } from "@/lib/productos";
import { almacen, MINUTOS_RESERVA, type Cliente, type ItemOrden } from "@/lib/stock";
import { crearPreferencia, pagoReal, urlDelSitio } from "@/lib/mercadopago";

type Pedido = {
  items: { slug: string; talle: string; cantidad: number }[];
  cliente: Cliente;
};

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let pedido: Pedido;
  try {
    pedido = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  // 1. Armamos el carrito con los precios del servidor (no los del navegador).
  const items: ItemOrden[] = [];
  for (const i of pedido.items ?? []) {
    const p = productoPorSlug(i.slug);
    const cantidad = Math.floor(Number(i.cantidad));
    if (!p || !p.talles.includes(i.talle) || !(cantidad > 0) || cantidad > 20) {
      return NextResponse.json({ error: "Hay un producto que ya no está disponible" }, { status: 400 });
    }
    items.push({ sku: skuDe(p.slug, i.talle), nombre: p.nombre, talle: i.talle, cantidad, precio: p.precio });
  }
  if (!items.length) return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });

  const c = pedido.cliente ?? ({} as Cliente);
  const cliente: Cliente = {
    nombre: texto(c.nombre, 120),
    email: texto(c.email, 120),
    telefono: texto(c.telefono, 40),
    entrega: c.entrega === "envio" ? "envio" : "retiro",
    direccion: texto(c.direccion, 300),
  };
  if (!cliente.nombre || !/^\S+@\S+\.\S+$/.test(cliente.email) || !cliente.telefono) {
    return NextResponse.json({ error: "Completá nombre, email y teléfono" }, { status: 400 });
  }
  if (cliente.entrega === "envio" && !cliente.direccion) {
    return NextResponse.json({ error: "Completá la dirección de envío" }, { status: 400 });
  }

  // 2. Reservamos el stock (todo o nada).
  await almacen.liberarVencidas(MINUTOS_RESERVA);
  const id = `CR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const orden = { id, cliente, items, total };
  const r = await almacen.reservarOrden(orden);
  if (!r.ok) {
    return NextResponse.json(
      { error: "Mientras elegías, se agotó algún producto del carrito. Revisá los talles.", sinStock: r.sinStock },
      { status: 409 },
    );
  }

  // 3. Mandamos a pagar.
  const sitio = urlDelSitio(req);
  if (!pagoReal) return NextResponse.json({ url: `/pago-simulado/${id}` });
  try {
    const url = await crearPreferencia({ ...orden, estado: "pendiente", creado: new Date().toISOString() }, sitio, MINUTOS_RESERVA);
    return NextResponse.json({ url });
  } catch (e) {
    await almacen.cerrarOrden(id, "cancelada");
    console.error(e);
    return NextResponse.json({ error: "No pudimos conectar con Mercado Pago. Probá de nuevo en un rato." }, { status: 502 });
  }
}
