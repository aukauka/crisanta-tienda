"use client";

import { useActionState, useEffect, useRef } from "react";
import { ajustarStock, entrar, type RespuestaAjuste } from "./acciones";

export function FormEntrar() {
  const [estado, accion, enviando] = useActionState(entrar, null);
  return (
    <form action={accion} style={{ maxWidth: 360, margin: "0 auto", textAlign: "left" }}>
      <div className="campo">
        <label htmlFor="clave">Clave</label>
        <input id="clave" name="clave" type="password" required autoFocus />
      </div>
      {estado?.error && <p className="error">{estado.error}</p>}
      <button className="boton ancho" disabled={enviando}>Entrar</button>
    </form>
  );
}

type Opcion = { sku: string; texto: string; cantidad: number };

export function FormMovimiento({ opciones }: { opciones: Opcion[] }) {
  const [estado, accion, enviando] = useActionState<RespuestaAjuste, FormData>(ajustarStock, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado]);

  return (
    <form ref={ref} action={accion} className="tarjeta-mayorista">
      <div className="campo" style={{ margin: 0 }}>
        <label htmlFor="tipo">¿Qué pasó?</label>
        <select id="tipo" name="tipo" defaultValue="mayorista">
          <option value="mayorista">Vendí por mayor (resta)</option>
          <option value="ingreso">Entró mercadería nueva (suma)</option>
          <option value="resta">Corrección: falta mercadería (resta)</option>
        </select>
      </div>
      <div className="campo" style={{ margin: 0 }}>
        <label htmlFor="sku">Producto y talle</label>
        <select id="sku" name="sku" required defaultValue="">
          <option value="" disabled>Elegí…</option>
          {opciones.map((o) => (
            <option key={o.sku} value={o.sku}>
              {o.texto} (hay {o.cantidad})
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10 }}>
        <div className="campo" style={{ margin: 0 }}>
          <label htmlFor="cantidad">Cantidad</label>
          <input id="cantidad" name="cantidad" type="number" min={1} defaultValue={1} required />
        </div>
        <div className="campo" style={{ margin: 0 }}>
          <label htmlFor="nota">Nota (opcional)</label>
          <input id="nota" name="nota" placeholder="Ej: Local de Juan, Rosario" />
        </div>
      </div>
      {estado?.error && <p className="error" style={{ margin: 0 }}>{estado.error}</p>}
      {estado?.ok && <p className="ok" style={{ margin: 0 }}>{estado.ok}</p>}
      <button className="boton" disabled={enviando}>{enviando ? "Guardando…" : "Guardar"}</button>
    </form>
  );
}
