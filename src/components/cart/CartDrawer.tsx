"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "./CartProvider";
import { getShortCardTitle, getMaterialTypeLabel } from "@/lib/marketplace";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, clearCart, totalKes } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: items.map((i) => i.id) }),
      });

      if (res.status === 401) {
        setIsOpen(false);
        router.push("/login?message=Please sign in to complete your purchase.");
        return;
      }

      const data = await res.json();
      if (data.access_code) {
        const PaystackPop = (await import("@paystack/inline-js")).default;
        const popup = new PaystackPop();
        popup.resumeTransaction(data.access_code, {
          onSuccess: (trx) => {
            const ref = trx?.reference || data.reference;
            clearCart();
            setIsOpen(false);
            router.push(ref ? `/library?reference=${encodeURIComponent(ref)}` : "/library");
            router.refresh();
            setLoading(false);
          },
          onCancel: () => {
            setLoading(false);
          },
          onError: (err) => {
            setLoading(false);
            alert(err?.message || "Payment failed. Please try again.");
          },
        });
        return;
      }

      if (data.authorization_url) {
        clearCart();
        setIsOpen(false);
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || data.message || "Failed to initialize checkout.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200">
        <div className="flex h-1.5 w-full shrink-0">
          <div className="w-3/5 bg-[#092B68]" />
          <div className="w-2/5 bg-[#F5A000]" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-[#092B68]">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Your Cart</h2>
              <p className="text-[11px] text-slate-500">
                {items.length} {items.length === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-[#F5A000] border border-amber-200">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">Your cart is empty</p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Add study documents from the Resource Store to buy multiple items at once.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#092B68] line-clamp-2">
                      {getShortCardTitle(item.title)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {getMaterialTypeLabel(item.material_type)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      KES {Number(item.price_kes || 0).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Total</span>
              <span className="font-mono text-base font-semibold text-[#092B68]">
                KES {totalKes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCart}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F5A000] hover:bg-[#e09200] text-[#092B68] px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Checkout (KES {totalKes.toLocaleString()})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
