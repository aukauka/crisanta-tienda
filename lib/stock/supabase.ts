// Stock real guardado en Supabase (base de datos gratuita).
// Todas las operaciones que cambian stock pasan por funciones de la base
// (ver supabase/esquema.sql), así dos ventas al mismo tiempo nunca
// pueden dejar el stock en negativo.
import type { AlmacenStock, EstadoOrden, Movimiento, Orden } from "./tipos";

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const CLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function pedir(ruta: string, init: RequestInit = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${ruta}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: CLAVE!,
      Authorization: `Bearer ${CLAVE}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const texto = await res.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!res.ok) {
    const mensaje: string = datos?.message ?? `Error ${res.status}`;
    throw new Error(mensaje);
  }
  return datos;
}

const rpc = (fn: string, args: Record<string, unknown>) =>
  pedir(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });

type FilaOrden = {
  id: string;
  estado: EstadoOrden;
  cliente: Orden["cliente"];
  items: Orden["items"];
  total: number;
  pago_id: string | null;
  creado: string;
};

const aOrden = (f: FilaOrden): Orden => ({
  id: f.id,
  estado: f.estado,
  cliente: f.cliente,
  items: f.items,
  total: f.total,
  pagoId: f.pago_id,
  creado: f.creado,
});

export const almacenSupabase: AlmacenStock = {
  nombre: "supabase",

  async leerStock() {
    const filas: { sku: string; cantidad: number }[] = await pedir("stock?select=sku,cantidad");
    return Object.fromEntries(filas.map((f) => [f.sku, f.cantidad]));
  },

  async reservarOrden(orden) {
    try {
      await rpc("reservar_orden", {
        p_id: orden.id,
        p_cliente: orden.cliente,
        p_items: orden.items,
        p_total: orden.total,
      });
      return { ok: true };
    } catch (e) {
      const m = (e as Error).message;
      if (m.startsWith("SIN_STOCK:")) return { ok: false, sinStock: [m.slice("SIN_STOCK:".length)] };
      throw e;
    }
  },

  async cerrarOrden(id, estado, pagoId) {
    const r = await rpc("cerrar_orden", { p_id: id, p_estado: estado, p_pago: pagoId ?? null });
    return (r as EstadoOrden | null) ?? null;
  },

  async leerOrden(id) {
    const filas: FilaOrden[] = await pedir(`ordenes?id=eq.${encodeURIComponent(id)}&select=*`);
    return filas[0] ? aOrden(filas[0]) : null;
  },

  async listarOrdenes(limite) {
    const filas: FilaOrden[] = await pedir(`ordenes?select=*&order=creado.desc&limit=${limite}`);
    return filas.map(aOrden);
  },

  async ajustar(sku, cambio, origen, motivo) {
    try {
      const cantidad = await rpc("ajustar_stock", {
        p_sku: sku,
        p_cambio: cambio,
        p_origen: origen,
        p_motivo: motivo,
        p_orden: null,
      });
      return { ok: true, cantidad: Number(cantidad) };
    } catch (e) {
      const m = (e as Error).message;
      if (m.startsWith("SIN_STOCK:")) return { ok: false, error: "No alcanza el stock para descontar eso" };
      return { ok: false, error: m };
    }
  },

  async listarMovimientos(limite) {
    const filas: {
      id: number;
      sku: string;
      cambio: number;
      cantidad_final: number;
      origen: Movimiento["origen"];
      motivo: string;
      orden_id: string | null;
      creado: string;
    }[] = await pedir(`movimientos?select=*&order=id.desc&limit=${limite}`);
    return filas.map((f) => ({
      id: f.id,
      sku: f.sku,
      cambio: f.cambio,
      cantidadFinal: f.cantidad_final,
      origen: f.origen,
      motivo: f.motivo,
      ordenId: f.orden_id,
      creado: f.creado,
    }));
  },

  async liberarVencidas(minutos) {
    await rpc("liberar_vencidas", { p_minutos: minutos });
  },
};
