import React from "react";

export type StatCardColor = "indigo" | "emerald" | "rose" | "amber" | "blue" | "purple";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: StatCardColor;
  className?: string;
  subtext?: string;
}

const colorVariants: Record<
  StatCardColor,
  { stripe: string; number: string; iconBg: string; iconColor: string }
> = {
  indigo: {
    stripe: "bg-indigo-500",
    number: "text-indigo-600",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  emerald: {
    stripe: "bg-emerald-500",
    number: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  rose: {
    stripe: "bg-rose-500",
    number: "text-rose-600",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  amber: {
    stripe: "bg-amber-500",
    number: "text-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  blue: {
    stripe: "bg-blue-600",
    number: "text-blue-700",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
  },
  purple: {
    stripe: "bg-purple-600",
    number: "text-purple-700",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "indigo",
  className = "",
  subtext,
}: StatCardProps) {
  const styles = colorVariants[color] || colorVariants.indigo;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden flex items-center justify-between transition-all hover:shadow-sm ${className}`}
    >
      {/* Top Accent Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${styles.stripe}`} />

      <div className="space-y-1">
        <div className={`text-3xl font-semibold tracking-tight ${styles.number}`}>
          {value}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        {subtext && (
          <div className="text-[11px] font-medium text-slate-400">
            {subtext}
          </div>
        )}
      </div>

      <div className={`p-3.5 rounded-xl ${styles.iconBg} ${styles.iconColor} shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
