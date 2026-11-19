# Tienda online de Crisanta

Sitio propio para vender por menor, con cobro por Mercado Pago y un **stock único** compartido con la venta mayorista.

## Qué hay en el sitio

| Página | Para qué sirve |
| --- | --- |
| `/` | Portada de la marca con productos destacados |
| `/tienda` | Todos los productos, con filtro por categoría |
| `/producto/...` | Ficha de cada producto: fotos, talles, stock disponible |
| `/finalizar` | Datos del cliente y botón para pagar con Mercado Pago |
| `/compra/...` | Confirmación de la compra |
| `/admin` | **Panel de stock** (con clave): ver stock, descontar ventas por mayor, ver compras |

## Cómo funciona el stock

- Hay **una sola cantidad por producto y talle**. La usan la web y el mayorista.
- Cuando alguien compra en la web, el stock se **reserva al momento de ir a pagar**.
  Si no paga en 30 minutos, o el pago falla, las prendas vuelven solas al stock.
- Cuando Marcelo vende por mayor, entra a `/admin`, elige *"Vendí por mayor"*, el producto, el talle y la cantidad. Se descuenta en el acto y la web deja de ofrecer lo que ya no hay.
- Si dos personas compran la última prenda al mismo tiempo, solo una puede: la otra ve un aviso.
- Todo queda anotado en el historial del panel (quién, cuánto, cuándo y de dónde).

## Versión de prueba vs. versión real

Hoy el sitio funciona en **modo de prueba**:

- El stock vive en la memoria del servidor y cada tanto vuelve a los valores iniciales.
- El pago es un **simulador** (no se cobra nada).
- La clave del panel es `crisanta-prueba`.

Para pasar a modo real se cargan estas claves en Cloudflare (**Workers & Pages > crisanta-tienda > Settings > Variables and Secrets**, tipo *Secret* para las secretas). No hace falta tocar código. **Las claves secretas no se mandan por chat**: se pegan directo en Cloudflare.

### 1. Base de datos de stock (gratis, Supabase)
1. Crear una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (plan Free).
2. Ir a **SQL Editor**, pegar todo el contenido de [`supabase/esquema.sql`](supabase/esquema.sql) y apretar **Run**.
3. Ir a **Project Settings > API** y copiar en Cloudflare:
   - `SUPABASE_URL` = *Project URL*
   - `SUPABASE_SERVICE_ROLE_KEY` = la clave *service_role* (es secreta)

### 2. Mercado Pago (Checkout Pro)
1. Entrar a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) y crear una aplicación (tipo *Pagos online*, *Checkout Pro*).
2. Para probar: copiar el **Access Token de prueba** (empieza con `TEST-`) en `MP_ACCESS_TOKEN`.
3. Para cobrar de verdad: reemplazarlo por el **Access Token de producción** (empieza con `APP_USR-`).
4. Cargar `SITE_URL` con la dirección del sitio (por ejemplo `https://crisanta.com.ar`).

### 3. Otros datos
- `ADMIN_CLAVE`: una clave propia para el panel.
- `NEXT_PUBLIC_WHATSAPP`: el número de WhatsApp de la marca (ej. `5493411234567`).

Las claves de Cloudflare se aplican al guardar. La única excepción es `NEXT_PUBLIC_WHATSAPP`, que se carga en **Settings > Build > Variables and secrets** y necesita una nueva publicación (Deployments > *Retry build*, o cualquier cambio en GitHub).

## Cómo cambiar productos y fotos

- Los productos están en [`lib/productos.ts`](lib/productos.ts): nombre, precio, talles, descripción y fotos.
- Las fotos van en `public/productos/`. Hoy hay imágenes de relleno; se reemplazan por `.jpg` reales y se cambia el nombre en la lista.
- Al agregar un producto nuevo, su stock arranca en 0: se carga desde `/admin` con *"Entró mercadería nueva"*.

## Para el futuro bot de WhatsApp

El sitio ya tiene una entrada para que otro sistema lea y cambie el mismo stock. Usa la clave `STOCK_API_CLAVE`.

- Ver stock: `GET /api/stock`
- Cambiar stock: `POST /api/stock/movimiento` con `{ "sku": "buzo-hoodie-cruz__m", "cambio": -3, "motivo": "Venta a Juan", "origen": "whatsapp" }`

Ambas llevan el encabezado `Authorization: Bearer <STOCK_API_CLAVE>`.

## Dónde está publicado

El sitio corre en **Cloudflare Workers, plan gratis** (permite uso comercial, sin tarjeta). Cada cambio en la rama `main` de GitHub se publica solo.

Configuración del proyecto en Cloudflare (Workers & Pages > Create > Import a repository):
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- El nombre del Worker tiene que ser `crisanta-tienda` (igual que en `wrangler.jsonc`).

Límites del plan gratis: 100.000 visitas a páginas por día (las fotos y archivos no cuentan) y 10 ms de procesador por visita. Si algún día se superan, el sitio muestra un error ese rato; **nunca se cobra solo**. El plan pago cuesta USD 5 por mes.

## Para programadores

```bash
npm install
npm run dev     # http://localhost:3000
npm run preview # prueba local con el motor de Cloudflare (http://localhost:8787)
```

Next.js 15 (App Router), sin base de datos obligatoria. El stock pasa por `lib/stock/` (modo prueba en memoria o Supabase vía funciones SQL atómicas). El aviso de pago de Mercado Pago llega a `/api/mercadopago/aviso` y siempre se verifica consultando el pago con el Access Token.
