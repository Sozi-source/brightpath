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

export function PageHeaderCard({ title, subtitle, breadcrumbs, metadata, actions, compact = false }: PageHeaderCardProps) {
  return (
    <section className="bp-card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#087f8c] via-[#0e9ba5] to-[#d9a441]" />
      <div className={compact ? "space-y-3 p-4" : "space-y-4 p-4 sm:p-5 lg:p-6"}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 space-y-1.5">
            <div className="bp-eyebrow">TVET Hub · Workspace</div>
            <h1 className={`${compact ? "text-xl" : "text-2xl sm:text-[1.75rem]"} font-semibold leading-tight text-slate-950`}>{title}</h1>
            {subtitle && <p className="max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>

        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1 || crumb.active;
              return (
                <div key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="rounded-md px-1.5 py-1 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-teal-800">{crumb.label}</Link>
                  ) : (
                    <span aria-current="page" className={`rounded-md px-1.5 py-1 ${isLast ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-500"}`}>{crumb.label}</span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
            {metadata.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5 text-xs">
                <span className="text-slate-400">{item.label}</span>
                <span className="font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
