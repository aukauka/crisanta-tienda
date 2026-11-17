"use client";

import Link from "next/link";
import { useState } from "react";
import { LineasCarrito, useCarrito } from "@/components/Carrito";
import { pesos } from "@/lib/util";

export default function Finalizar() {
  const { lineas, total } = useCarrito();
  const [entrega, setEntrega] = useState<"retiro" | "envio">("envio");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function pagar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineas.map((l) => ({ slug: l.slug, talle: l.talle, cantidad: l.cantidad })),
          cliente: {
            nombre: f.get("nombre"),
            email: f.get("email"),
            telefono: f.get("telefono"),
            entrega,
            direccion: f.get("direccion") ?? "",
          },
        }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "Algo salió mal");
      window.location.href = datos.url;
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  }

  if (!lineas.length) {
    return (
      <div className="caja-centro">
        <h1>Tu carrito está vacío</h1>
        <p>Sumá algo desde la tienda para seguir.</p>
        <p style={{ marginTop: 28 }}>
          <Link href="/tienda" className="boton">Ir a la tienda</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <div className="cabeza-pagina">
        <h1>Finalizar compra</h1>
      </div>
      <div className="pago" style={{ paddingTop: 0 }}>
        <form onSubmit={pagar}>
          <span className="etiqueta">Tus datos</span>
          <div style={{ height: 14 }} />
          <div className="campo">
            <label htmlFor="nombre">Nombre y apellido</label>
            <input id="nombre" name="nombre" required autoComplete="name" />
          </div>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="campo">
            <label htmlFor="telefono">Teléfono / WhatsApp</label>
            <input id="telefono" name="telefono" type="tel" required autoComplete="tel" />
          </div>

          <span className="etiqueta">Entrega</span>
          <div style={{ height: 14 }} />
          <div className="opciones">
            <button type="button" className={`opcion ${entrega === "envio" ? "elegido" : ""}`} onClick={() => setEntrega("envio")}>
              Envío a domicilio
              <small>Te escribimos para coordinar el costo</small>
            </button>
            <button type="button" className={`opcion ${entrega === "retiro" ? "elegido" : ""}`} onClick={() => setEntrega("retiro")}>
              Retiro
              <small>Sin costo, coordinamos por WhatsApp</small>
            </button>
          </div>
          {entrega === "envio" && (
            <div className="campo">
              <label htmlFor="direccion">Dirección, localidad y código postal</label>
              <textarea id="direccion" name="direccion" required autoComplete="street-address" />
            </div>
          )}

          {error && <p className="error">{error}</p>}
          <button className="boton ancho" disabled={enviando} style={{ marginTop: 10 }}>
            {enviando ? "Un momento…" : `Pagar ${pesos(total)} con Mercado Pago`}
          </button>
          <p className="etiqueta" style={{ marginTop: 14, textTransform: "none", letterSpacing: 0 }}>
            Te llevamos a Mercado Pago para pagar de forma segura. Guardamos tus prendas mientras pagás.
          </p>
        </form>

        <div className="resumen">
          <h2>Resumen</h2>
          <LineasCarrito editable={false} />
          <div className="fila-total" style={{ marginTop: 18 }}>
            <span>Total</span>
            <strong>{pesos(total)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
