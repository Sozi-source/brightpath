import React from "react";

interface AmazonPriceProps {
  amount: number | string;
  originalAmount?: number | string | null;
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
  originalAmount,
  currency = "KES",
  size = "md",
  className = "",
}: AmazonPriceProps) {
  const num = Number(amount) || 0;
  const formattedWhole = num.toLocaleString();
  const origNum =
    originalAmount !== null && originalAmount !== undefined && originalAmount !== ""
      ? Number(originalAmount)
      : 0;
  const hasDiscount = Number.isFinite(origNum) && origNum > num;
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-sans text-[#0f1111] leading-none select-none ${styles.container} ${className}`}
      aria-label={
        hasDiscount
          ? `${currency} ${formattedWhole}, reduced from ${currency} ${origNum.toLocaleString()}`
          : `${currency} ${formattedWhole}`
      }
    >
      <span className="inline-flex items-baseline whitespace-nowrap">
        <span className={`relative text-slate-600 font-medium tracking-tight uppercase mr-1 ${styles.symbol}`}>
          {currency}
        </span>
        <span className={`tracking-tight text-[#0f1111] font-sans tabular-nums ${styles.whole}`}>
          {formattedWhole}
        </span>
      </span>
      {hasDiscount && (
        <span className="text-[11px] font-medium text-slate-500 line-through decoration-slate-400 whitespace-nowrap tabular-nums">
          {currency} {origNum.toLocaleString()}
        </span>
      )}
    </span>
  );
}
