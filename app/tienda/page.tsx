import Link from "next/link";
import type { Metadata } from "next";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { CATEGORIAS, productos, skuDe } from "@/lib/productos";
import { almacen } from "@/lib/stock";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tienda" };

export default async function Tienda({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const stock = await almacen.leerStock();
  const lista = categoria ? productos.filter((p) => p.categoria === categoria) : productos;

  return (
    <div className="contenedor">
      <div className="cabeza-pagina">
        <span className="etiqueta">{lista.length} productos</span>
        <h1 style={{ marginTop: 8 }}>{categoria ?? "Tienda"}</h1>
      </div>
      <div className="filtros">
        <Link href="/tienda" className={!categoria ? "activo" : ""}>Todo</Link>
        {CATEGORIAS.map((c) => (
          <Link key={c} href={`/tienda?categoria=${c}`} className={categoria === c ? "activo" : ""}>{c}</Link>
        ))}
      </div>
      <div className="grilla" style={{ marginBottom: 90 }}>
        {lista.map((p) => (
          <TarjetaProducto
            key={p.slug}
            p={p}
            disponible={p.talles.reduce((s, t) => s + (stock[skuDe(p.slug, t)] ?? 0), 0)}
          />
        ))}
      </div>
    </div>
  );
}
