import { notFound, redirect } from "next/navigation";
import { almacen } from "@/lib/stock";
import { pagoReal } from "@/lib/mercadopago";
import { pesos } from "@/lib/util";
import { BotonesSimulados } from "./BotonesSimulados";

export const dynamic = "force-dynamic";

// Pantalla que reemplaza a Mercado Pago mientras no estén cargadas las claves.
export default async function PagoSimulado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (pagoReal) redirect(`/compra/${id}`);
  const orden = await almacen.leerOrden(id);
  if (!orden) notFound();
  if (orden.estado !== "pendiente") redirect(`/compra/${id}`);

  return (
    <div className="caja-centro">
      <span className="etiqueta">Modo de prueba</span>
      <h1>Simulador de pago</h1>
      <p>
        Esta pantalla reemplaza a Mercado Pago hasta que se conecte la cuenta real.
        Elegí qué pasa con el pago de <strong>{pesos(orden.total)}</strong>.
      </p>
      <BotonesSimulados id={id} />
    </div>
  );
}
