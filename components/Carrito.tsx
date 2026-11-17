"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { pesos } from "@/lib/util";

export type LineaCarrito = {
  slug: string;
  talle: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
};

type Ctx = {
  lineas: LineaCarrito[];
  unidades: number;
  total: number;
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (l: LineaCarrito) => void;
  cambiar: (slug: string, talle: string, cantidad: number) => void;
  vaciar: () => void;
};

const CarritoCtx = createContext<Ctx | null>(null);
const CLAVE = "crisanta-carrito";

export function useCarrito() {
  const c = useContext(CarritoCtx);
  if (!c) throw new Error("useCarrito fuera de CarritoProvider");
  return c;
}

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) setLineas(JSON.parse(guardado));
    } catch {}
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch {}
  }, [lineas, listo]);

  const agregar = useCallback((l: LineaCarrito) => {
    setLineas((ls) => {
      const i = ls.findIndex((x) => x.slug === l.slug && x.talle === l.talle);
      if (i === -1) return [...ls, l];
      const copia = [...ls];
      copia[i] = { ...copia[i], cantidad: copia[i].cantidad + l.cantidad };
      return copia;
    });
    setAbierto(true);
  }, []);

  const cambiar = useCallback((slug: string, talle: string, cantidad: number) => {
    setLineas((ls) =>
      cantidad <= 0
        ? ls.filter((x) => !(x.slug === slug && x.talle === talle))
        : ls.map((x) => (x.slug === slug && x.talle === talle ? { ...x, cantidad } : x)),
    );
  }, []);

  const valor = useMemo<Ctx>(
    () => ({
      lineas,
      unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
      total: lineas.reduce((s, l) => s + l.cantidad * l.precio, 0),
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      agregar,
      cambiar,
      vaciar: () => {
        try {
          localStorage.removeItem(CLAVE);
        } catch {}
        setLineas([]);
      },
    }),
    [lineas, abierto, agregar, cambiar],
  );

  return (
    <CarritoCtx.Provider value={valor}>
      {children}
      {abierto && <PanelCarrito />}
    </CarritoCtx.Provider>
  );
}

export function LineasCarrito({ editable = true }: { editable?: boolean }) {
  const { lineas, cambiar } = useCarrito();
  return (
    <>
      {lineas.map((l) => (
        <div className="linea-carrito" key={`${l.slug}-${l.talle}`}>
          <img src={l.imagen} alt="" />
          <div>
            <div className="n">{l.nombre}</div>
            <div className="t">Talle {l.talle}</div>
            {editable ? (
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                <div className="cantidad" style={{ height: 34 }}>
                  <button onClick={() => cambiar(l.slug, l.talle, l.cantidad - 1)} aria-label="Restar">−</button>
                  <span>{l.cantidad}</span>
                  <button onClick={() => cambiar(l.slug, l.talle, l.cantidad + 1)} aria-label="Sumar">+</button>
                </div>
                <button className="quitar" onClick={() => cambiar(l.slug, l.talle, 0)}>Quitar</button>
              </div>
            ) : (
              <div className="t">Cantidad: {l.cantidad}</div>
            )}
          </div>
          <div style={{ fontSize: 14 }}>{pesos(l.precio * l.cantidad)}</div>
        </div>
      ))}
    </>
  );
}

function PanelCarrito() {
  const { lineas, total, cerrar } = useCarrito();
  return (
    <>
      <div className="velo" onClick={cerrar} />
      <aside className="panel" role="dialog" aria-label="Carrito">
        <div className="panel-cabeza">
          <h2>Tu carrito</h2>
          <button className="cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
        </div>
        <div className="panel-cuerpo">
          {lineas.length ? <LineasCarrito /> : <p className="vacio">Tu carrito está vacío.</p>}
        </div>
        {lineas.length > 0 && (
          <div className="panel-pie">
            <div className="fila-total">
              <span className="etiqueta">Subtotal</span>
              <strong>{pesos(total)}</strong>
            </div>
            <Link href="/finalizar" className="boton ancho" onClick={cerrar}>Finalizar compra</Link>
            <button className="boton borde ancho" onClick={cerrar}>Seguir comprando</button>
          </div>
        )}
      </aside>
    </>
  );
}

export function BotonCarrito() {
  const { unidades, abrir } = useCarrito();
  return (
    <button className="boton-carrito" onClick={abrir}>
      Carrito <span className="burbuja">{unidades}</span>
    </button>
  );
}
