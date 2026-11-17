"use client";

import { useEffect } from "react";
import { useCarrito } from "@/components/Carrito";

export function VaciarCarrito() {
  const { vaciar } = useCarrito();
  useEffect(() => {
    vaciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
