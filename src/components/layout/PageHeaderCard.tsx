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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Signature KEC Two-Tone Institutional Accent Stripe */}
      <div className="w-full h-1.5 flex">
        <div className="bg-blue-600 w-[60%]" />
        <div className="bg-amber-400 w-[40%]" />
      </div>

      <div className={compact ? "space-y-3 p-4" : "space-y-4 p-5 sm:p-7"}>
        {/* Title & Actions Row */}
        <div className={`flex flex-col justify-between sm:flex-row sm:items-center ${compact ? "gap-2" : "gap-4"}`}>
          <div className="space-y-1">
            <h1 className={`${compact ? "text-xl" : "text-xl sm:text-2xl"} font-semibold tracking-tight text-slate-900`}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>

        {/* 2. KEC Interlocking Breadcrumb Ribbon */}
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb ribbon"
            className={`flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-[#e8f1f8] text-xs font-semibold text-slate-700 ${compact ? "p-1" : "p-1.5"}`}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1 || crumb.active;

              return (
                <div key={crumb.label} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}

                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className={`rounded bg-white/80 px-2.5 text-blue-800 shadow-xs transition-colors hover:bg-white ${compact ? "py-0.5" : "py-1"}`}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`rounded px-2.5 ${compact ? "py-0.5" : "py-1"} ${
                        isLast
                          ? "bg-white text-slate-900 font-semibold shadow-xs"
                          : "text-slate-600"
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* 3. Structured Metadata Bar (Matching KEC Metadata Header) */}
        {metadata && metadata.length > 0 && (
          <div className={`flex flex-wrap items-center gap-x-4 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 ${compact ? "p-2" : "gap-y-2 p-3"}`}>
            {metadata.map((item, idx) => (
              <div key={item.label} className="flex items-center gap-1">
                {idx > 0 && <span className="text-slate-300 mr-3 hidden sm:inline">•</span>}
                <span className="font-semibold text-slate-900">{item.label}:</span>
                <span className="text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
