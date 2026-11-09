import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface MetadataItem {
  label: string;
  value: string;
}

interface PageHeaderCardProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  metadata?: MetadataItem[];
  actions?: React.ReactNode;
  compact?: boolean;
}

export function PageHeaderCard({
  title,
  subtitle,
  breadcrumbs,
  metadata,
  actions,
  compact = false,
}: PageHeaderCardProps) {
  return (
    <header className={`space-y-3 pb-4 border-b border-slate-200/80 ${compact ? "mb-4" : "mb-6"}`}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1 || crumb.active;
            return (
              <div key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="font-medium text-slate-500 transition-colors hover:text-[#087f8c]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className={`font-semibold ${isLast ? "text-[#087f8c]" : "text-slate-600"}`}
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className={`${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"} font-bold tracking-tight text-slate-900`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {metadata && metadata.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px]">
          {metadata.map((item) => (
            <div
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2 py-0.5 text-slate-600"
            >
              <span className="text-slate-400 font-medium">{item.label}:</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
