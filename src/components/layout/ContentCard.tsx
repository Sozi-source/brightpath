interface ContentCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ContentCard({
  title,
  subtitle,
  icon: Icon,
  headerRight,
  children,
  className = "",
  noPadding = false,
}: ContentCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}
    >
      {(title || Icon || headerRight) && (
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="h-4 w-4 text-blue-700 shrink-0" />}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>

          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "p-5 sm:p-6"}>{children}</div>
    </div>
  );
}
