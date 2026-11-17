import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/components/Carrito";
import { Encabezado, Pie } from "@/components/Estructura";

const titulos = Jost({ subsets: ["latin"], variable: "--fuente-titulos", weight: ["400", "500"] });
const texto = Inter({ subsets: ["latin"], variable: "--fuente-texto" });

export const metadata: Metadata = {
  title: { default: "Crisanta · Tienda oficial", template: "%s · Crisanta" },
  description: "Tienda online oficial de Crisanta. Remeras, buzos, pantalones y camperas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${titulos.variable} ${texto.variable}`}>
      <body>
        <CarritoProvider>
          <Encabezado />
          <main>{children}</main>
          <Pie />
        </CarritoProvider>
      </body>
    </html>
  );
}
