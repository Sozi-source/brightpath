"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
  projectId: string;
  isOwner?: boolean;
  className?: string;
}

export function BuyButton({ projectId, isOwner = false, className = "" }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (res.status === 401) {
        router.push("/login?message=Please sign in to purchase this project.");
        return;
      }

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || data.message || "Failed to initialize payment.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={loading || isOwner}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] border border-[#fcd200] hover:border-[#f2c200] text-[#0f1111] font-sans px-3.5 py-2 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:opacity-100 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5" />
          {isOwner ? "Your listing" : "Buy now"}
        </>
      )}
    </button>
  );
}
