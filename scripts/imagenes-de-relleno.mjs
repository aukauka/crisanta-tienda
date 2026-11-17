// Genera las imágenes de relleno de /public/productos.
// Cuando haya fotos reales, se reemplazan y este archivo se puede borrar.
import { readFileSync, writeFileSync } from "node:fs";

const logo = readFileSync("public/logo-crisanta.svg", "utf8");
const cruz = [...logo.matchAll(/<path [^>]*\/>/g)].slice(0, 14).map((m) => m[0]).join("");

const productos = {
  "remera-cruz-oversize": ["Remera", "#d9d3c9", "#2b2a28"],
  "remera-basica-logo": ["Remera", "#e6e1d8", "#3a3936"],
  "buzo-hoodie-cruz": ["Buzo", "#c9c2b6", "#1f1f1e"],
  "buzo-crewneck": ["Buzo", "#d4cdc1", "#4a4640"],
  "pantalon-cargo": ["Pantalón", "#c2bba9", "#33342e"],
  "jogger-frisa": ["Pantalón", "#d0cbc3", "#2e2d2b"],
  "campera-puffer": ["Campera", "#bfb8ad", "#191919"],
  "gorra-bordada": ["Accesorio", "#dcd6cc", "#353330"],
};

function svg(fondo, tinta, rotulo, i) {
  const [bg, fg] = i === 1 ? [fondo, tinta] : [tinta, fondo];
  const colores = cruz
    .replaceAll("#ffffff", bg)
    .replaceAll("#000000", fg)
    .replaceAll("#ff00ff", "none");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
<rect width="800" height="1000" fill="${bg}"/>
<g opacity="0.22" transform="translate(400 470) scale(1.9) translate(-170 -147)">${colores}</g>
<text x="400" y="900" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="6" fill="${fg}" opacity="0.55">${rotulo.toUpperCase()} · FOTO PRÓXIMAMENTE</text>
</svg>`;
}

for (const [slug, [rotulo, fondo, tinta]] of Object.entries(productos)) {
  for (const i of [1, 2]) writeFileSync(`public/productos/${slug}-${i}.svg`, svg(fondo, tinta, rotulo, i));
}
console.log("Listo");
