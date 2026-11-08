import React from "react";

interface AmazonPriceProps {
  amount: number | string;
  currency?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const SIZE_STYLES = {
  xs: {
    container: "text-xs",
    symbol: "text-[9px] -top-0.5",
    whole: "text-xs font-semibold",
  },
  sm: {
    container: "text-sm",
    symbol: "text-[10px] -top-0.5",
    whole: "text-sm font-semibold",
  },
  md: {
    container: "text-base",
    symbol: "text-[11px] -top-1",
    whole: "text-base font-semibold",
  },
  lg: {
    container: "text-xl",
    symbol: "text-xs -top-1.5",
    whole: "text-xl font-semibold",
  },
  xl: {
    container: "text-2xl",
    symbol: "text-xs -top-2",
    whole: "text-2xl font-semibold",
  },
  "2xl": {
    container: "text-3xl",
    symbol: "text-sm -top-2.5",
    whole: "text-3xl font-semibold",
  },
};

export function AmazonPrice({
  amount,
  currency = "KES",
  size = "md",
  className = "",
}: AmazonPriceProps) {
  const num = Number(amount) || 0;
  const formattedWhole = num.toLocaleString();
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <span
      className={`inline-flex items-baseline font-sans text-[#0f1111] leading-none select-none ${styles.container} ${className}`}
      aria-label={`${currency} ${formattedWhole}`}
    >
      <span className={`relative text-slate-600 font-medium tracking-tight uppercase mr-1 ${styles.symbol}`}>
        {currency}
      </span>
      <span className={`tracking-tight text-[#0f1111] font-sans ${styles.whole}`}>
        {formattedWhole}
      </span>
    </span>
  );
}
