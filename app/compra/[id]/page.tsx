import Link from "next/link";
import { notFound } from "next/navigation";
import { CruzCrisanta } from "@/components/Logo";
import { almacen } from "@/lib/stock";
import { consultarPago, pagoReal } from "@/lib/mercadopago";
import { pesos, WHATSAPP } from "@/lib/util";
import { VaciarCarrito } from "./VaciarCarrito";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_id?: string }>;
};

export default async function Compra({ params, searchParams }: Props) {
  const { id } = await params;
  const { payment_id } = await searchParams;
  let orden = await almacen.leerOrden(id);
  if (!orden) notFound();

  // Si volvemos de Mercado Pago antes de que llegue su aviso, consultamos nosotros.
  if (pagoReal && orden.estado === "pendiente" && payment_id) {
    const pago = await consultarPago(payment_id);
    if (pago?.orden === id) {
      if (pago.estado === "approved") await almacen.cerrarOrden(id, "pagada", payment_id);
      else if (["rejected", "cancelled"].includes(pago.estado)) await almacen.cerrarOrden(id, "cancelada", payment_id);
      orden = (await almacen.leerOrden(id))!;
    }
  }

  const textos = {
    pagada: ["¡Gracias por tu compra!", "Recibimos tu pago. Te vamos a escribir por WhatsApp para coordinar la entrega."],
    pendiente: ["Estamos esperando el pago", "Apenas Mercado Pago nos confirme, te avisamos. Si ya pagaste, no hace falta hacer nada más."],
    cancelada: ["El pago no se completó", "No se hizo ningún cobro. Podés volver a intentarlo cuando quieras."],
    vencida: ["La reserva venció", "Pasó el tiempo para pagar y liberamos las prendas. Podés volver a intentarlo."],
  } as const;
  const [titulo, texto] = textos[orden.estado];

  return (
    <div className="caja-centro">
      {orden.estado === "pagada" && <VaciarCarrito />}
      <CruzCrisanta className="cruz" />
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <div className="resumen" style={{ textAlign: "left", marginTop: 32, position: "static" }}>
        <span className="etiqueta">Orden {orden.id}</span>
        {orden.items.map((i) => (
          <div key={i.sku} className="fila-total" style={{ marginTop: 10, fontSize: 14 }}>
            <span>
              {i.cantidad} × {i.nombre} ({i.talle})
            </span>
            <span>{pesos(i.precio * i.cantidad)}</span>
          </div>
        ))}
        <div className="fila-total" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--linea)" }}>
          <span>Total</span>
          <strong>{pesos(orden.total)}</strong>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
        {orden.estado === "pagada" ? (
          <a className="boton" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Hice la compra ${orden.id}`)}`} target="_blank" rel="noreferrer">
            Escribinos por WhatsApp
          </a>
        ) : orden.estado !== "pendiente" ? (
          <Link href="/finalizar" className="boton">Volver a intentar</Link>
        ) : null}
        <Link href="/tienda" className="boton borde">Seguir mirando</Link>
      </div>
    </div>
  );
}
