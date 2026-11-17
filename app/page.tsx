import Link from "next/link";
import { CruzCrisanta } from "@/components/Logo";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { CATEGORIAS, productos, skuDe } from "@/lib/productos";
import { almacen } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const stock = await almacen.leerStock();
  const disponible = (slug: string, talles: string[]) =>
    talles.reduce((s, t) => s + (stock[skuDe(slug, t)] ?? 0), 0);
  const destacados = productos.filter((p) => p.destacado);

  return (
    <>
      <section className="portada">
        <div className="contenedor">
          <div>
            <span className="etiqueta">Nueva temporada</span>
            <h1>Hecho para durar</h1>
            <p>Prendas con identidad propia, confeccionadas con los mismos materiales que nos acompañan hace años.</p>
            <Link href="/tienda" className="boton claro">Ver la tienda</Link>
          </div>
          <CruzCrisanta className="cruz-grande" />
        </div>
      </section>

      <div className="franja">
        <span>Envíos a todo el país</span>
        <span>Cambios sin vueltas</span>
        <span>Pagá con Mercado Pago</span>
      </div>

      <section className="seccion">
        <div className="contenedor">
          <div className="seccion-cabeza">
            <h2>Destacados</h2>
            <Link href="/tienda">Ver todo</Link>
          </div>
          <div className="grilla">
            {destacados.map((p) => (
              <TarjetaProducto key={p.slug} p={p} disponible={disponible(p.slug, p.talles)} />
            ))}
          </div>
        </div>
      </section>

      <section className="historia">
        <div>
          <span className="etiqueta">La marca</span>
          <h2 style={{ marginTop: 14 }}>Crisanta</h2>
          <p>
            Años vistiendo a locales de todo el país. Ahora, por primera vez, las mismas prendas que
            llegan a los comercios se pueden comprar directo, desde acá.
          </p>
          <p style={{ marginTop: 28 }}>
            <Link href="/tienda" className="boton borde">Conocer la colección</Link>
          </p>
        </div>
        <div className="centro">
          <CruzCrisanta className="cruz" />
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="seccion-cabeza">
            <h2>Categorías</h2>
          </div>
          <div className="categorias">
            {CATEGORIAS.map((c) => (
              <Link key={c} href={`/tienda?categoria=${c}`}>{c}</Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
