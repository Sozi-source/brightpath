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
  indigo: { iconBg: "bg-slate-100", iconColor: "text-[#092B68]", accent: "bg-[#092B68]" },
  emerald: { iconBg: "bg-slate-100", iconColor: "text-[#092B68]", accent: "bg-[#092B68]" },
  rose: { iconBg: "bg-rose-50", iconColor: "text-rose-700", accent: "bg-rose-600" },
  amber: { iconBg: "bg-amber-50", iconColor: "text-amber-700", accent: "bg-[#F5A000]" },
  blue: { iconBg: "bg-slate-100", iconColor: "text-[#092B68]", accent: "bg-[#092B68]" },
  purple: { iconBg: "bg-slate-100", iconColor: "text-[#092B68]", accent: "bg-[#092B68]" },
};

export function StatCard({ label, value, icon: Icon, color = "indigo", className = "", subtext }: StatCardProps) {
  const styles = colorVariants[color] || colorVariants.indigo;
  return (
    <article className={`bp-card bp-card-interactive relative flex min-w-0 items-center justify-between gap-2.5 overflow-hidden p-3 sm:p-4 lg:p-5 2xl:gap-4 2xl:p-6 ${className}`}>
      <div className={`absolute inset-y-3 sm:inset-y-4 left-0 w-[3px] rounded-r-full ${styles.accent}`} />
      <div className="min-w-0 pl-1">
        <div className="text-[10px] font-semibold uppercase tracking-[.08em] text-slate-500 sm:text-[10.5px] 2xl:text-xs">{label}</div>
        <div className="mt-1 break-words text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-2xl xl:text-[1.75rem] 2xl:text-3xl">{value}</div>
        {subtext && <div className="mt-0.5 truncate text-[10.5px] font-medium text-slate-500 2xl:text-xs">{subtext}</div>}
      </div>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 lg:h-11 lg:w-11 2xl:h-12 2xl:w-12 ${styles.iconBg} ${styles.iconColor}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
      </div>
    </article>
  );
}
