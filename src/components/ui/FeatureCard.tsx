import React from "react";
import Link from "next/link";
import { BrandIcon, type BrandIconName } from "./BrandIcon";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  brandIcon?: BrandIconName;
  href?: string;
  meta?: string;
  actionLabel?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  brandIcon,
  href,
  meta,
  actionLabel = "Open workspace",
  className = "",
}: FeatureCardProps) {
  const content = (
    <div className={`bp-card bp-card-interactive flex h-full min-w-0 flex-col p-4 sm:p-5 lg:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="bp-icon-tile h-10 w-10 sm:h-11 sm:w-11">
          {brandIcon ? (
            <BrandIcon name={brandIcon} size="sm" />
          ) : Icon ? (
            <Icon className="h-5 w-5" />
          ) : null}
        </span>
        {meta && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{meta}</span>}
      </div>
      <div className="mt-4 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</p>
      </div>
      {href && <div className="mt-auto pt-5 text-xs font-semibold text-teal-700">{actionLabel} <span aria-hidden="true">→</span></div>}
    </div>
  );
  return href ? <Link href={href} className="block h-full rounded-2xl focus-visible:outline-teal-600">{content}</Link> : content;
}
