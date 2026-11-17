import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Clave del panel /admin. Se define en Vercel como ADMIN_CLAVE.
// Mientras no esté cargada, la clave de prueba es "crisanta-prueba".
export const CLAVE_ADMIN = process.env.ADMIN_CLAVE ?? "crisanta-prueba";
export const usaClaveDePrueba = !process.env.ADMIN_CLAVE;

const COOKIE = "crisanta_admin";
const firma = () => createHmac("sha256", CLAVE_ADMIN).update("admin-ok").digest("hex");

export function claveCorrecta(intento: string) {
  const a = Buffer.from(intento);
  const b = Buffer.from(CLAVE_ADMIN);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function abrirSesion() {
  (await cookies()).set(COOKIE, firma(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function esAdmin() {
  return (await cookies()).get(COOKIE)?.value === firma();
}

/** Para el bot de WhatsApp u otros sistemas: encabezado "Authorization: Bearer <STOCK_API_CLAVE>". */
export function claveApiValida(req: Request) {
  const clave = process.env.STOCK_API_CLAVE;
  if (!clave) return false;
  const enviada = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(enviada);
  const b = Buffer.from(clave);
  return a.length === b.length && timingSafeEqual(a, b);
}
