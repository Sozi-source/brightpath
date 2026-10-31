"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
  projectId: string;
  isOwner?: boolean;
}

export function BuyButton({ projectId, isOwner = false }: BuyButtonProps) {
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
      } else if (data.testMode) {
        alert(
          `Order ${data.reference} initiated for KES ${data.amountKes}. Paystack keys not set in .env.local (Test Mode).`
        );
        router.push("/library");
      } else {
        alert(data.error || "Failed to initialize payment.");
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
      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100 text-white px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5" />
          {isOwner ? "Your listing" : "Buy"}
        </>
      )}
    </button>
  );
}
