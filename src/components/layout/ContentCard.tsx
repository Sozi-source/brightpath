interface ContentCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  tone?: "default" | "muted";
  compact?: boolean;
}

export function ContentCard({
  title,
  subtitle,
  icon: Icon,
  headerRight,
  children,
  className = "",
  noPadding = false,
  tone = "default",
  compact = false,
}: ContentCardProps) {
  return (
    <section className={`bp-card overflow-hidden ${className}`} aria-label={title}>
      {(title || Icon || headerRight || subtitle) && (
        <header
          className={`flex flex-col gap-2 border-b border-slate-100 ${
            compact ? "px-3.5 py-2.5" : "px-4 py-4 sm:px-5 2xl:px-6 2xl:py-5"
          } sm:flex-row sm:items-center sm:justify-between ${
            tone === "muted" ? "bg-slate-50/80" : "bg-white"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className={`bp-icon-tile ${compact ? "h-7 w-7 rounded-md" : "h-9 w-9"}`}>
                <Icon className={compact ? "h-3.5 w-3.5" : "h-[18px] w-[18px]"} />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3
                  className={`${
                    compact ? "text-xs font-bold" : "text-sm font-semibold 2xl:text-base"
                  } leading-snug text-slate-900`}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`mt-0.5 ${compact ? "text-[11px]" : "text-xs 2xl:text-sm"} leading-relaxed text-slate-500`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerRight && <div className="w-full min-w-0 sm:w-auto sm:shrink-0">{headerRight}</div>}
        </header>
      )}
      <div className={noPadding ? "" : compact ? "p-3 sm:p-3.5" : "p-4 sm:p-5 lg:p-6 2xl:p-7"}>
        {children}
      </div>
    </section>
  );
}
