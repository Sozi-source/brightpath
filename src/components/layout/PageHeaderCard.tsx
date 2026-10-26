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
}

export function PageHeaderCard({
  title,
  subtitle,
  breadcrumbs,
  metadata,
  actions,
}: PageHeaderCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Signature KEC Two-Tone Institutional Accent Stripe */}
      <div className="w-full h-1.5 flex">
        <div className="bg-blue-600 w-[60%]" />
        <div className="bg-amber-400 w-[40%]" />
      </div>

      <div className="p-5 sm:p-7 space-y-4">
        {/* Title & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2438] tracking-tight">
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
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#e8f1f8] rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
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
                      className="px-2.5 py-1 rounded bg-white/80 hover:bg-white text-blue-800 shadow-xs transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded ${
                        isLast
                          ? "bg-white text-[#0f2438] font-bold shadow-xs"
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
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex flex-wrap items-center gap-y-2 gap-x-4">
            {metadata.map((item, idx) => (
              <div key={item.label} className="flex items-center gap-1">
                {idx > 0 && <span className="text-slate-300 mr-3 hidden sm:inline">•</span>}
                <span className="font-bold text-slate-900">{item.label}:</span>
                <span className="text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
