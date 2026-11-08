interface ContentCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  tone?: "default" | "muted";
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
}: ContentCardProps) {
  return (
    <section className={`bp-card overflow-hidden ${className}`} aria-label={title}>
      {(title || Icon || headerRight || subtitle) && (
        <header className={`flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${tone === "muted" ? "bg-slate-50/80" : "bg-white"}`}>
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="bp-icon-tile h-9 w-9">
                <Icon className="h-[18px] w-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold leading-snug text-slate-900">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </header>
      )}
      <div className={noPadding ? "" : "p-4 sm:p-5 lg:p-6"}>{children}</div>
    </section>
  );
}
