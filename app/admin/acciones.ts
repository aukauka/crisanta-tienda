"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { abrirSesion, cerrarSesion, claveCorrecta, esAdmin } from "@/lib/admin";
import { buscarSku } from "@/lib/productos";
import { almacen, type Origen } from "@/lib/stock";

export async function entrar(_: unknown, form: FormData) {
  if (!claveCorrecta(String(form.get("clave") ?? ""))) return { error: "Clave incorrecta" };
  await abrirSesion();
  redirect("/admin");
}

export async function salir() {
  await cerrarSesion();
  redirect("/admin");
}

export type RespuestaAjuste = { ok?: string; error?: string } | null;

export async function ajustarStock(_: RespuestaAjuste, form: FormData): Promise<RespuestaAjuste> {
  if (!(await esAdmin())) return { error: "Tu sesión venció, volvé a entrar" };
  const sku = String(form.get("sku") ?? "");
  const tipo = String(form.get("tipo") ?? "");
  const cantidad = Math.trunc(Number(form.get("cantidad")));
  const nota = String(form.get("nota") ?? "").slice(0, 200);
  const item = buscarSku(sku);
  if (!item) return { error: "Elegí un producto y talle" };
  if (!(cantidad > 0)) return { error: "Poné una cantidad mayor a cero" };

  const tipos: Record<string, { signo: number; origen: Origen; texto: string }> = {
    mayorista: { signo: -1, origen: "mayorista", texto: "Venta por mayor" },
    ingreso: { signo: 1, origen: "ajuste", texto: "Ingreso de mercadería" },
    resta: { signo: -1, origen: "ajuste", texto: "Corrección (resta)" },
  };
  const t = tipos[tipo];
  if (!t) return { error: "Elegí qué tipo de movimiento es" };

  const r = await almacen.ajustar(sku, t.signo * cantidad, t.origen, nota ? `${t.texto}: ${nota}` : t.texto);
  revalidatePath("/admin");
  if (!r.ok) return { error: r.error };
  return { ok: `Listo. ${item.producto.nombre} talle ${item.talle} ahora tiene ${r.cantidad}.` };
}
