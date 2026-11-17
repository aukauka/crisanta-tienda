import Link from "next/link";
import type { Producto } from "@/lib/productos";
import { pesos } from "@/lib/util";

export function TarjetaProducto({ p, disponible }: { p: Producto; disponible: number }) {
  return (
    <Link href={`/producto/${p.slug}`} className="tarjeta">
      <div className="foto">
        {disponible === 0 ? (
          <span className="sello agotado">Agotado</span>
        ) : disponible <= 3 ? (
          <span className="sello">Últimas unidades</span>
        ) : null}
        {p.imagenes.slice(0, 2).map((src) => (
          <img key={src} src={src} alt={p.nombre} loading="lazy" />
        ))}
      </div>
      <div className="nombre">{p.nombre}</div>
      <div className="precio">{pesos(p.precio)}</div>
    </Link>
  );
}
