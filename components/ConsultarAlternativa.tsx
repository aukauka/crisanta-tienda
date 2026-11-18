import { WHATSAPP } from "@/lib/util";

// Botón para escribirle a Marcelo por WhatsApp cuando falta un producto o un talle,
// así puede ofrecer otra opción (como hace en las ventas por mayor).
export function ConsultarAlternativa({
  mensaje,
  titulo = "¿No está lo que buscás?",
  texto = "Escribile a Marcelo y te ayuda a encontrar otra opción: otro talle, otro color o algo parecido.",
}: {
  mensaje: string;
  titulo?: string;
  texto?: string;
}) {
  return (
    <div className="alternativa">
      <strong>{titulo}</strong>
      <p>{texto}</p>
      <a
        className="boton borde ancho"
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noreferrer"
      >
        Consultar por WhatsApp
      </a>
    </div>
  );
}
