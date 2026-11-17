"use client";

import { useState } from "react";

export function BotonesSimulados({ id }: { id: string }) {
  const [enviando, setEnviando] = useState(false);
  async function elegir(resultado: "aprobar" | "rechazar") {
    setEnviando(true);
    await fetch("/api/pago-simulado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resultado }),
    });
    window.location.href = `/compra/${id}`;
  }
  return (
    <div style={{ display: "grid", gap: 10, marginTop: 30 }}>
      <button className="boton" disabled={enviando} onClick={() => elegir("aprobar")}>Pago aprobado</button>
      <button className="boton borde" disabled={enviando} onClick={() => elegir("rechazar")}>Pago rechazado</button>
    </div>
  );
}
