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

const colorVariants: Record<StatCardColor, { iconBg: string; iconColor: string; accent: string }> = {
  indigo: { iconBg: "bg-teal-50", iconColor: "text-teal-700", accent: "bg-teal-600" },
  emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-700", accent: "bg-emerald-600" },
  rose: { iconBg: "bg-rose-50", iconColor: "text-rose-700", accent: "bg-rose-600" },
  amber: { iconBg: "bg-amber-50", iconColor: "text-amber-700", accent: "bg-amber-500" },
  blue: { iconBg: "bg-sky-50", iconColor: "text-sky-700", accent: "bg-sky-600" },
  purple: { iconBg: "bg-violet-50", iconColor: "text-violet-700", accent: "bg-violet-600" },
};

export function StatCard({ label, value, icon: Icon, color = "indigo", className = "", subtext }: StatCardProps) {
  const styles = colorVariants[color] || colorVariants.indigo;
  return (
    <article className={`bp-card bp-card-interactive relative flex min-w-0 items-center justify-between gap-3 overflow-hidden p-4 sm:p-5 ${className}`}>
      <div className={`absolute inset-y-4 left-0 w-[3px] rounded-r-full ${styles.accent}`} />
      <div className="min-w-0 pl-1">
        <div className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500 sm:text-[11px]">{label}</div>
        <div className="mt-1.5 break-words text-2xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-[1.8rem]">{value}</div>
        {subtext && <div className="mt-1 truncate text-[11px] font-medium text-slate-500">{subtext}</div>}
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${styles.iconBg} ${styles.iconColor}`}>
        <Icon className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />
      </div>
    </article>
  );
}
