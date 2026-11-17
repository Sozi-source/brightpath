"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartDrawer } from "./CartDrawer";

export interface CartItem {
  id: string;
  title: string;
  price_kes: number;
  material_type?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalKes: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tvethub_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setItems(
              parsed.filter(
                (item): item is CartItem =>
                  item && typeof item.id === "string" && typeof item.title === "string"
              )
            );
          }
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }

  function addItem(item: CartItem) {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      const next = [...prev, item];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }

  function clearCart() {
    persist([]);
  }

  const totalKes = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price_kes || 0), 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      clearCart,
      isInCart: (id: string) => items.some((item) => item.id === id),
      totalKes,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, isOpen, totalKes]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
