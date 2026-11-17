"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  projectId: string;
  title: string;
  priceKes: number;
  materialType?: string | null;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  projectId,
  title,
  priceKes,
  materialType,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, isInCart, setIsOpen } = useCart();
  const added = isInCart(projectId);

  if (disabled) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (added) {
          setIsOpen(true);
        } else {
          addItem({ id: projectId, title, price_kes: priceKes, material_type: materialType });
        }
      }}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
        added
          ? "border-amber-300 bg-amber-50 text-[#092B68] hover:bg-amber-100"
          : "border-slate-300 bg-white text-slate-700 hover:border-[#F5A000] hover:bg-amber-50/60 hover:text-[#092B68]"
      } ${className}`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#F5A000]" />
          <span>In Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
