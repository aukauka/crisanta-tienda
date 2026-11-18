"use client";

import { useState } from "react";
import { useCarrito } from "@/components/Carrito";
import { ConsultarAlternativa } from "@/components/ConsultarAlternativa";

type Props = {
  producto: { slug: string; nombre: string; precio: number; imagen: string; talles: string[] };
  stock: Record<string, number>;
};

export function ElegirTalle({ producto, stock }: Props) {
  const { agregar, lineas } = useCarrito();
  const unico = producto.talles.length === 1 ? producto.talles[0] : null;
  const [talle, setTalle] = useState<string | null>(unico && stock[unico] > 0 ? unico : null);
  const [cantidad, setCantidad] = useState(1);

  const enCarrito = talle
    ? lineas.find((l) => l.slug === producto.slug && l.talle === talle)?.cantidad ?? 0
    : 0;
  const quedan = talle ? stock[talle] - enCarrito : 0;
  const todoAgotado = producto.talles.every((t) => stock[t] === 0);

  const tallesAgotados = producto.talles.filter((t) => stock[t] === 0);
  const sinElElegido = talle !== null && quedan <= 0;

  let nota = "";
  if (todoAgotado) nota = "Sin stock por ahora.";
  else if (!talle) nota = "Elegí un talle.";
  else if (quedan <= 0) nota = "Ya tenés en el carrito todas las unidades disponibles.";
  else if (quedan <= 3) nota = `¡Quedan ${quedan}!`;

  return (
    <div>
      <span className="etiqueta">Talle</span>
      <div className="talles">
        {producto.talles.map((t) => (
          <button
            key={t}
            className={`talle ${talle === t ? "elegido" : ""}`}
            disabled={stock[t] === 0}
            onClick={() => {
              setTalle(t);
              setCantidad(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={`nota-stock ${talle && quedan <= 3 ? "pocas" : ""}`}>{nota}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="cantidad">
          <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Restar">−</button>
          <span>{cantidad}</span>
          <button onClick={() => setCantidad((c) => Math.min(Math.max(quedan, 1), c + 1))} aria-label="Sumar">+</button>
        </div>
        <button
          className="boton"
          style={{ flex: 1 }}
          disabled={!talle || quedan < cantidad}
          onClick={() =>
            talle &&
            agregar({
              slug: producto.slug,
              talle,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen: producto.imagen,
              cantidad,
            })
          }
        >
          {todoAgotado ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
      {todoAgotado ? (
        <ConsultarAlternativa
          titulo="Este producto se agotó"
          mensaje={`Hola Marcelo! Quería comprar ${producto.nombre} pero está agotado. ¿Tenés otra opción parecida?`}
        />
      ) : sinElElegido ? (
        <ConsultarAlternativa
          titulo="¿Necesitás más unidades?"
          mensaje={`Hola Marcelo! Quería más unidades de ${producto.nombre} talle ${talle}. ¿Tenés otra opción?`}
        />
      ) : tallesAgotados.length > 0 ? (
        <ConsultarAlternativa
          titulo="¿No está tu talle?"
          mensaje={`Hola Marcelo! Me interesa ${producto.nombre} pero no hay mi talle (${tallesAgotados.join(", ")}). ¿Tenés otra opción?`}
        />
      ) : null}
    </div>
  );
}
