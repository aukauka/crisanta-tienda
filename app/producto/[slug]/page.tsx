import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productoPorSlug, skuDe } from "@/lib/productos";
import { almacen } from "@/lib/stock";
import { pesos } from "@/lib/util";
import { ElegirTalle } from "./ElegirTalle";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productoPorSlug((await params).slug);
  return { title: p?.nombre ?? "Producto" };
}

export default async function PaginaProducto({ params }: Props) {
  const p = productoPorSlug((await params).slug);
  if (!p) notFound();
  const stock = await almacen.leerStock();
  const porTalle = Object.fromEntries(p.talles.map((t) => [t, stock[skuDe(p.slug, t)] ?? 0]));

  return (
    <div className="contenedor">
      <div className="ficha">
        <div className="fotos">
          {p.imagenes.map((src, i) => (
            <img key={src} src={src} alt={`${p.nombre}, foto ${i + 1}`} />
          ))}
        </div>
        <div className="info">
          <span className="etiqueta">{p.categoria}</span>
          <h1>{p.nombre}</h1>
          <div className="precio">{pesos(p.precio)}</div>
          <p className="descripcion">{p.descripcion}</p>
          <ElegirTalle
            producto={{ slug: p.slug, nombre: p.nombre, precio: p.precio, imagen: p.imagenes[0], talles: p.talles }}
            stock={porTalle}
          />
          <div style={{ marginTop: 32 }}>
            <span className="etiqueta">Detalles</span>
            <ul>
              {p.detalles.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
