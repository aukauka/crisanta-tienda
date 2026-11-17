// ─────────────────────────────────────────────────────────────
//  CATÁLOGO DE PRODUCTOS
//  Para agregar, quitar o cambiar un producto, se edita esta lista.
//  - "slug" es el nombre corto que aparece en la dirección web.
//  - "precio" va en pesos, sin puntos.
//  - "imagenes" son archivos dentro de /public/productos.
//    Cuando tengan fotos, se reemplazan por los .jpg reales.
//  - "stockInicial" se usa solo en el modo de prueba. El stock real
//    vive en la base de datos y se maneja desde /admin.
// ─────────────────────────────────────────────────────────────

export type Categoria = "Remeras" | "Buzos" | "Pantalones" | "Camperas" | "Accesorios";

export type Producto = {
  slug: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  descripcion: string;
  detalles: string[];
  talles: string[];
  imagenes: string[];
  destacado?: boolean;
  stockInicial: Record<string, number>;
};

export const CATEGORIAS: Categoria[] = ["Remeras", "Buzos", "Pantalones", "Camperas", "Accesorios"];

export const productos: Producto[] = [
  {
    slug: "remera-cruz-oversize",
    nombre: "Remera Cruz Oversize",
    categoria: "Remeras",
    precio: 32000,
    descripcion: "Remera de calce amplio con la cruz Crisanta estampada en la espalda.",
    detalles: ["Jersey 100% algodón peinado 24/1", "Calce oversize", "Estampa en serigrafía"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/remera-cruz-oversize-1.svg", "/productos/remera-cruz-oversize-2.svg"],
    destacado: true,
    stockInicial: { S: 4, M: 8, L: 6, XL: 2 },
  },
  {
    slug: "remera-basica-logo",
    nombre: "Remera Básica Logo",
    categoria: "Remeras",
    precio: 26000,
    descripcion: "La básica de todos los días, con el logo bordado en el pecho.",
    detalles: ["Jersey 100% algodón", "Calce regular", "Logo bordado"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/remera-basica-logo-1.svg", "/productos/remera-basica-logo-2.svg"],
    stockInicial: { S: 10, M: 12, L: 9, XL: 5 },
  },
  {
    slug: "buzo-hoodie-cruz",
    nombre: "Buzo Hoodie Cruz",
    categoria: "Buzos",
    precio: 68000,
    descripcion: "Buzo con capucha de frisa pesada y cruz bordada.",
    detalles: ["Frisa invisible 100% algodón", "Capucha forrada", "Bolsillo canguro"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/buzo-hoodie-cruz-1.svg", "/productos/buzo-hoodie-cruz-2.svg"],
    destacado: true,
    stockInicial: { S: 3, M: 5, L: 5, XL: 1 },
  },
  {
    slug: "buzo-crewneck",
    nombre: "Buzo Crewneck",
    categoria: "Buzos",
    precio: 59000,
    descripcion: "Buzo cuello redondo, liso, con detalle de marca en la manga.",
    detalles: ["Frisa 80% algodón", "Puños y cintura con rib", "Calce regular"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/buzo-crewneck-1.svg", "/productos/buzo-crewneck-2.svg"],
    stockInicial: { S: 2, M: 6, L: 4, XL: 0 },
  },
  {
    slug: "pantalon-cargo",
    nombre: "Pantalón Cargo",
    categoria: "Pantalones",
    precio: 62000,
    descripcion: "Cargo de gabardina con bolsillos laterales y puño ajustable.",
    detalles: ["Gabardina de algodón con elastano", "Seis bolsillos", "Cintura con cordón"],
    talles: ["38", "40", "42", "44"],
    imagenes: ["/productos/pantalon-cargo-1.svg", "/productos/pantalon-cargo-2.svg"],
    destacado: true,
    stockInicial: { "38": 3, "40": 6, "42": 5, "44": 2 },
  },
  {
    slug: "jogger-frisa",
    nombre: "Jogger Frisa",
    categoria: "Pantalones",
    precio: 48000,
    descripcion: "Jogger cómodo de frisa con logo en la pierna.",
    detalles: ["Frisa 100% algodón", "Puño elastizado", "Bolsillo trasero"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/jogger-frisa-1.svg", "/productos/jogger-frisa-2.svg"],
    stockInicial: { S: 5, M: 7, L: 6, XL: 3 },
  },
  {
    slug: "campera-puffer",
    nombre: "Campera Puffer",
    categoria: "Camperas",
    precio: 115000,
    descripcion: "Campera inflada, liviana y abrigada, con capucha desmontable.",
    detalles: ["Exterior repelente al agua", "Relleno de guata siliconada", "Capucha desmontable"],
    talles: ["S", "M", "L", "XL"],
    imagenes: ["/productos/campera-puffer-1.svg", "/productos/campera-puffer-2.svg"],
    destacado: true,
    stockInicial: { S: 1, M: 3, L: 2, XL: 1 },
  },
  {
    slug: "gorra-bordada",
    nombre: "Gorra Bordada",
    categoria: "Accesorios",
    precio: 24000,
    descripcion: "Gorra de seis paneles con la cruz bordada al frente.",
    detalles: ["Gabardina de algodón", "Cierre regulable", "Bordado en relieve"],
    talles: ["Único"],
    imagenes: ["/productos/gorra-bordada-1.svg", "/productos/gorra-bordada-2.svg"],
    stockInicial: { "Único": 15 },
  },
];

/** Código único de cada combinación producto + talle. Es lo que se usa en el stock. */
export function skuDe(slug: string, talle: string) {
  return `${slug}__${talle}`.toLowerCase();
}

export function productoPorSlug(slug: string) {
  return productos.find((p) => p.slug === slug);
}

export function buscarSku(sku: string) {
  for (const p of productos) {
    for (const t of p.talles) {
      if (skuDe(p.slug, t) === sku) return { producto: p, talle: t };
    }
  }
  return undefined;
}

export function todosLosSkus() {
  return productos.flatMap((p) => p.talles.map((t) => ({ sku: skuDe(p.slug, t), producto: p, talle: t })));
}
