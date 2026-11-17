// Modo de prueba: el stock vive en la memoria del servidor.
// Sirve para mirar la tienda funcionando, pero se reinicia solo cada tanto.
// Para uso real hay que conectar Supabase (ver README).
import { todosLosSkus } from "@/lib/productos";
import type { AlmacenStock, Movimiento, Orden, Origen } from "./tipos";

type Estado = {
  stock: Map<string, number>;
  ordenes: Map<string, Orden>;
  movimientos: Movimiento[];
  siguienteId: number;
};

const g = globalThis as unknown as { __crisantaPrueba?: Estado };

function estado(): Estado {
  if (!g.__crisantaPrueba) {
    const stock = new Map<string, number>();
    for (const { sku, producto, talle } of todosLosSkus()) {
      stock.set(sku, producto.stockInicial[talle] ?? 0);
    }
    g.__crisantaPrueba = { stock, ordenes: new Map(), movimientos: [], siguienteId: 1 };
  }
  return g.__crisantaPrueba;
}

function registrar(e: Estado, sku: string, cambio: number, origen: Origen, motivo: string, ordenId?: string) {
  e.movimientos.unshift({
    id: e.siguienteId++,
    sku,
    cambio,
    cantidadFinal: e.stock.get(sku) ?? 0,
    origen,
    motivo,
    ordenId: ordenId ?? null,
    creado: new Date().toISOString(),
  });
  e.movimientos.length = Math.min(e.movimientos.length, 500);
}

export const almacenPrueba: AlmacenStock = {
  nombre: "prueba",

  async leerStock() {
    return Object.fromEntries(estado().stock);
  },

  async reservarOrden(orden) {
    const e = estado();
    const sinStock = orden.items
      .filter((i) => (e.stock.get(i.sku) ?? 0) < i.cantidad)
      .map((i) => i.sku);
    if (sinStock.length) return { ok: false, sinStock };
    for (const i of orden.items) {
      e.stock.set(i.sku, (e.stock.get(i.sku) ?? 0) - i.cantidad);
      registrar(e, i.sku, -i.cantidad, "web", "Compra web (reservado)", orden.id);
    }
    e.ordenes.set(orden.id, { ...orden, estado: "pendiente", creado: new Date().toISOString() });
    return { ok: true };
  },

  async cerrarOrden(id, nuevoEstado, pagoId) {
    const e = estado();
    const o = e.ordenes.get(id);
    if (!o) return null;
    if (o.estado !== "pendiente") return o.estado;
    if (nuevoEstado !== "pagada") {
      for (const i of o.items) {
        e.stock.set(i.sku, (e.stock.get(i.sku) ?? 0) + i.cantidad);
        registrar(e, i.sku, i.cantidad, "web", "Se devolvió: el pago no se completó", id);
      }
    }
    o.estado = nuevoEstado;
    o.pagoId = pagoId ?? o.pagoId ?? null;
    return o.estado;
  },

  async leerOrden(id) {
    return estado().ordenes.get(id) ?? null;
  },

  async listarOrdenes(limite) {
    return [...estado().ordenes.values()].reverse().slice(0, limite);
  },

  async ajustar(sku, cambio, origen, motivo) {
    const e = estado();
    if (!e.stock.has(sku)) return { ok: false, error: "Ese producto/talle no existe" };
    const nuevo = (e.stock.get(sku) ?? 0) + cambio;
    if (nuevo < 0) return { ok: false, error: `No alcanza el stock (hay ${e.stock.get(sku)})` };
    e.stock.set(sku, nuevo);
    registrar(e, sku, cambio, origen, motivo);
    return { ok: true, cantidad: nuevo };
  },

  async listarMovimientos(limite) {
    return estado().movimientos.slice(0, limite);
  },

  async liberarVencidas(minutos) {
    const e = estado();
    const limite = Date.now() - minutos * 60_000;
    for (const o of e.ordenes.values()) {
      if (o.estado === "pendiente" && new Date(o.creado).getTime() < limite) {
        await this.cerrarOrden(o.id, "vencida");
      }
    }
  },
};
