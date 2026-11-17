import Link from "next/link";
import { CATEGORIAS } from "@/lib/productos";
import { INSTAGRAM, WHATSAPP } from "@/lib/util";
import { BotonCarrito } from "./Carrito";
import { CruzCrisanta, LogoCrisanta, PalabraCrisanta } from "./Logo";

export function Encabezado() {
  return (
    <>
      <div className="aviso">Envíos a todo el país · Pagá con Mercado Pago</div>
      <header className="encabezado">
        <div className="contenedor">
          <nav className="nav">
            <Link href="/tienda">Tienda</Link>
            <Link href="/tienda?categoria=Buzos">Buzos</Link>
            <Link href="/tienda?categoria=Remeras">Remeras</Link>
          </nav>
          <Link href="/" className="marca" aria-label="Crisanta, inicio">
            <CruzCrisanta className="cruz" />
            <PalabraCrisanta className="palabra" />
          </Link>
          <div className="acciones">
            <BotonCarrito />
          </div>
        </div>
        <div className="menu-movil">
          <Link href="/tienda">Todo</Link>
          {CATEGORIAS.map((c) => (
            <Link key={c} href={`/tienda?categoria=${c}`}>{c}</Link>
          ))}
        </div>
      </header>
    </>
  );
}

export function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="columnas">
          <div>
            <LogoCrisanta className="logo" />
          </div>
          <div>
            <h3>Tienda</h3>
            {CATEGORIAS.map((c) => (
              <Link key={c} href={`/tienda?categoria=${c}`}>{c}</Link>
            ))}
          </div>
          <div>
            <h3>Ayuda</h3>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <Link href="/ayuda">Envíos y cambios</Link>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Quiero info para comprar por mayor")}`} target="_blank" rel="noreferrer">Ventas por mayor</a>
          </div>
          <div>
            <h3>Seguinos</h3>
            <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="legal">
          <span>© {new Date().getFullYear()} Crisanta. Todos los derechos reservados.</span>
          <span>Pagos procesados por Mercado Pago</span>
        </div>
      </div>
    </footer>
  );
}
