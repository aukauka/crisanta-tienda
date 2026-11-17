import type { Metadata } from "next";
import { WHATSAPP } from "@/lib/util";

export const metadata: Metadata = { title: "Envíos y cambios" };

// Texto de ejemplo: reemplazar por las condiciones reales de la marca.
export default function Ayuda() {
  return (
    <div className="contenedor" style={{ maxWidth: 760, paddingBottom: 90 }}>
      <div className="cabeza-pagina">
        <h1>Envíos y cambios</h1>
      </div>
      <h2 style={{ fontSize: 15, margin: "10px 0" }}>Envíos</h2>
      <p style={{ color: "var(--gris)" }}>
        Hacemos envíos a todo el país. Después de tu compra te escribimos por WhatsApp para coordinar
        el costo y la forma de envío. También podés retirar sin costo.
      </p>
      <h2 style={{ fontSize: 15, margin: "32px 0 10px" }}>Cambios</h2>
      <p style={{ color: "var(--gris)" }}>
        Tenés 30 días para cambiar talle o prenda, siempre que esté sin uso y con etiqueta.
      </p>
      <p style={{ marginTop: 32 }}>
        <a className="boton" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Consultanos por WhatsApp</a>
      </p>
    </div>
  );
}
