import type { Metadata } from "next";
import { CruzCrisanta } from "@/components/Logo";
import { esAdmin, usaClaveDePrueba } from "@/lib/admin";
import { pagoReal } from "@/lib/mercadopago";
import { buscarSku, todosLosSkus } from "@/lib/productos";
import { almacen, MINUTOS_RESERVA } from "@/lib/stock";
import { fechaCorta, pesos } from "@/lib/util";
import { salir } from "./acciones";
import { FormEntrar, FormMovimiento } from "./Formularios";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

const ORIGEN: Record<string, string> = {
  web: "Tienda web",
  mayorista: "Mayorista",
  ajuste: "Ajuste",
  whatsapp: "WhatsApp",
};

export default async function Admin() {
  if (!(await esAdmin())) {
    return (
      <div className="caja-centro">
        <CruzCrisanta className="cruz" />
        <h1>Panel de stock</h1>
        <p style={{ marginBottom: 28 }}>Ingresá la clave para administrar el stock.</p>
        <FormEntrar />
        {usaClaveDePrueba && (
          <p className="etiqueta" style={{ marginTop: 20, textTransform: "none", letterSpacing: 0 }}>
            Versión de prueba: la clave es <strong>crisanta-prueba</strong>
          </p>
        )}
      </div>
    );
  }

  await almacen.liberarVencidas(MINUTOS_RESERVA);
  const [stock, movimientos, ordenes] = await Promise.all([
    almacen.leerStock(),
    almacen.listarMovimientos(40),
    almacen.listarOrdenes(20),
  ]);
  const filas = todosLosSkus().map((f) => ({ ...f, cantidad: stock[f.sku] ?? 0 }));
  const opciones = filas.map((f) => ({ sku: f.sku, texto: `${f.producto.nombre} · ${f.talle}`, cantidad: f.cantidad }));
  const nombreSku = (sku: string) => {
    const s = buscarSku(sku);
    return s ? `${s.producto.nombre} · ${s.talle}` : sku;
  };

  return (
    <div className="contenedor admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <h1>Panel de stock</h1>
        <form action={salir}>
          <button className="mini borde">Salir</button>
        </form>
      </div>

      {(almacen.nombre === "prueba" || !pagoReal || usaClaveDePrueba) && (
        <div className="admin-aviso">
          <strong>Versión de prueba.</strong>{" "}
          {almacen.nombre === "prueba" && "El stock se guarda solo en memoria y puede volver a los valores iniciales. "}
          {!pagoReal && "Los pagos son simulados (no se cobra nada). "}
          {usaClaveDePrueba && "La clave del panel es la de prueba. "}
          Para pasar a modo real hay que seguir la guía.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30, alignItems: "start" }}>
        <div>
          <h2 style={{ marginTop: 32 }}>Registrar un movimiento</h2>
          <p style={{ color: "var(--gris)", fontSize: 14, marginTop: -6 }}>
            Cada venta por mayor se descuenta acá, así la tienda nunca vende algo que ya no hay.
            Las ventas de la web se descuentan solas.
          </p>
          <FormMovimiento opciones={opciones} />
        </div>
        <div>
          <h2 style={{ marginTop: 32 }}>Stock actual</h2>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Talle</th>
                  <th className="num">Hay</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.sku}>
                    <td>{f.producto.nombre}</td>
                    <td>{f.talle}</td>
                    <td className="num">
                      {f.cantidad === 0 ? <span className="pastilla cero">0</span> : f.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2>Últimas compras web</h2>
      {ordenes.length === 0 ? (
        <p style={{ color: "var(--gris)" }}>Todavía no hay compras.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Entrega</th>
                <th className="num">Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id}>
                  <td>{fechaCorta(o.creado)}</td>
                  <td>{o.id}</td>
                  <td>
                    {o.cliente.nombre}
                    <br />
                    <small style={{ color: "var(--gris)" }}>{o.cliente.telefono} · {o.cliente.email}</small>
                  </td>
                  <td>{o.items.map((i) => `${i.cantidad}× ${i.nombre} (${i.talle})`).join(", ")}</td>
                  <td>{o.cliente.entrega === "envio" ? `Envío: ${o.cliente.direccion}` : "Retiro"}</td>
                  <td className="num">{pesos(o.total)}</td>
                  <td><span className={`pastilla ${o.estado}`}>{o.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Historial de movimientos</h2>
      {movimientos.length === 0 ? (
        <p style={{ color: "var(--gris)" }}>Todavía no hay movimientos.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th className="num">Cambio</th>
                <th className="num">Quedó</th>
                <th>Origen</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{fechaCorta(m.creado)}</td>
                  <td>{nombreSku(m.sku)}</td>
                  <td className="num">{m.cambio > 0 ? `+${m.cambio}` : m.cambio}</td>
                  <td className="num">{m.cantidadFinal}</td>
                  <td>{ORIGEN[m.origen] ?? m.origen}</td>
                  <td>{m.motivo}{m.ordenId ? ` (${m.ordenId})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
