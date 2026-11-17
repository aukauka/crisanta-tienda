import "server-only";
import { almacenPrueba } from "./prueba";
import { almacenSupabase } from "./supabase";

export * from "./tipos";

/** Si están cargadas las claves de Supabase, usa la base real. Si no, el modo de prueba. */
export const almacen =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? almacenSupabase : almacenPrueba;

/** Minutos que se guarda el stock de una compra web mientras la persona paga. */
export const MINUTOS_RESERVA = 30;
