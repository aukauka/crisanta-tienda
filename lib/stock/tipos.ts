// Tipos compartidos por las dos formas de guardar el stock
// (modo de prueba en memoria, o base de datos Supabase).

export type Origen = "web" | "mayorista" | "ajuste" | "whatsapp";

export type ItemOrden = {
  sku: string;
  nombre: string;
  talle: string;
  cantidad: number;
  precio: number;
};

export type Cliente = {
  nombre: string;
  email: string;
  telefono: string;
  entrega: "retiro" | "envio";
  direccion?: string;
};

export type EstadoOrden = "pendiente" | "pagada" | "cancelada" | "vencida";

export type Orden = {
  id: string;
  estado: EstadoOrden;
  cliente: Cliente;
  items: ItemOrden[];
  total: number;
  creado: string;
  pagoId?: string | null;
};

export type Movimiento = {
  id: number;
  sku: string;
  cambio: number;
  cantidadFinal: number;
  origen: Origen;
  motivo: string;
  ordenId?: string | null;
  creado: string;
};

export type ResultadoReserva = { ok: true } | { ok: false; sinStock: string[] };
export type ResultadoAjuste = { ok: true; cantidad: number } | { ok: false; error: string };

export interface AlmacenStock {
  nombre: "prueba" | "supabase";
  leerStock(): Promise<Record<string, number>>;
  /** Descuenta todo el carrito de una sola vez. Si falta algo, no descuenta nada. */
  reservarOrden(orden: Omit<Orden, "estado" | "creado">): Promise<ResultadoReserva>;
  /** Pasa una orden pendiente a pagada, o la cancela y devuelve el stock. */
  cerrarOrden(id: string, estado: Exclude<EstadoOrden, "pendiente">, pagoId?: string): Promise<EstadoOrden | null>;
  leerOrden(id: string): Promise<Orden | null>;
  listarOrdenes(limite: number): Promise<Orden[]>;
  /** Suma o resta stock a mano (venta por mayor, ajuste, bot de WhatsApp). */
  ajustar(sku: string, cambio: number, origen: Origen, motivo: string): Promise<ResultadoAjuste>;
  listarMovimientos(limite: number): Promise<Movimiento[]>;
  /** Libera el stock de órdenes que no se pagaron a tiempo. */
  liberarVencidas(minutos: number): Promise<void>;
}
