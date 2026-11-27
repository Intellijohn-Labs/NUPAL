"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Empties the cart once (used on the order page after a successful online payment). */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return null;
}
