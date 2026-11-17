import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel, getShortCardTitle } from "@/lib/marketplace";
import { BuyButton } from "@/components/BuyButton";
import { AmazonPrice } from "@/components/ui/AmazonPrice";

const MATERIAL_THEMES: Record<
  string,
  { bar: string; badge: string; hoverBorder: string; hoverTitle: string }
> = {
  business_plan: {
    bar: "bg-[#087f8c]",
    badge: "bg-teal-50 text-[#087f8c] border-teal-200/70",
    hoverBorder: "hover:border-[#087f8c]/50",
    hoverTitle: "group-hover:text-[#087f8c]",
  },
  lecture_notes: {
    bar: "bg-indigo-600",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    hoverBorder: "hover:border-indigo-300",
    hoverTitle: "group-hover:text-indigo-700",
  },
  past_paper: {
    bar: "bg-amber-600",
    badge: "bg-amber-50 text-amber-800 border-amber-200/70",
    hoverBorder: "hover:border-amber-300",
    hoverTitle: "group-hover:text-amber-700",
  },
  study_guide: {
    bar: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    hoverBorder: "hover:border-emerald-300",
    hoverTitle: "group-hover:text-emerald-700",
  },
  reference_book: {
    bar: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    hoverBorder: "hover:border-emerald-300",
    hoverTitle: "group-hover:text-emerald-700",
  },
  technical_project: {
    bar: "bg-sky-600",
    badge: "bg-sky-50 text-sky-700 border-sky-200/70",
    hoverBorder: "hover:border-sky-300",
    hoverTitle: "group-hover:text-sky-700",
  },
  research_project: {
    bar: "bg-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-200/70",
    hoverBorder: "hover:border-violet-300",
    hoverTitle: "group-hover:text-violet-700",
  },
};

const DEFAULT_THEME = {
  bar: "bg-slate-700",
  badge: "bg-slate-100 text-slate-700 border-slate-200",
  hoverBorder: "hover:border-slate-300",
  hoverTitle: "group-hover:text-slate-900",
};

export function MarketplaceProjectCard({
  project,
  viewerId,
  rating,
  className = "w-full min-w-0",
}: {
  project: Project;
  viewerId?: string;
  rating?: { rating_average: number; review_count: number };
  colorIndex?: number;
  className?: string;
}) {
  const reviewCount = Number(rating?.review_count || 0);
  const average = Number(rating?.rating_average || 0);

  const isResearchProject = project.material_type === "research_project";
  const isBusinessPlan =
    !isResearchProject &&
    (project.material_type === "business_plan" ||
      (project.category || "").toLowerCase().includes("business") ||
      project.file_path.startsWith("workspace-export:"));

  const theme = isBusinessPlan
    ? MATERIAL_THEMES.business_plan
    : MATERIAL_THEMES[project.material_type] || DEFAULT_THEME;

  const badgeLabel = isBusinessPlan
    ? "Business Plan"
    : getMaterialTypeLabel(project.material_type);

  const formatLabel = project.file_path.startsWith("workspace-export:")
    ? "Word (.docx)"
    : project.file_path.split(".").pop()?.toUpperCase() || "Digital";

  const subtitleLabel = isBusinessPlan
    ? project.category && project.category !== "Business Plan"
      ? project.category
      : "KNEC 5-Chapter Dossier"
    : isResearchProject
    ? "Research Project"
    : project.category || "Curriculum Resource";

  const cardTitle = getShortCardTitle(project.title);

  const currentPrice = Number(project.price_kes) || 0;
  const origPrice = Number(project.original_price_kes) || 0;
  const discountPct =
    origPrice > currentPrice && origPrice > 0
      ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
      : 0;

  return (
    <article
      className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-xs ${theme.hoverBorder} hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Semantic Category Top Strip */}
      <div className={`h-0.5 w-full ${theme.bar}`} />

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        {/* Zone 1: Header (Category Pill + Rating or Format) */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-tight truncate ${theme.badge}`}
            >
              {badgeLabel}
            </span>

            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 shrink-0 tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                {average.toFixed(1)}
              </span>
            ) : (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-slate-600 shrink-0">
                {formatLabel}
              </span>
            )}
          </div>

          {/* Zone 2: Body (Cover + Title + Scannable Metadata) */}
          <Link
            href={`/projects/${project.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c] rounded"
          >
            {project.cover_path && (
              <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                <Image
                  src={`/api/projects/${project.id}/cover`}
                  alt={`${cardTitle} cover`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <h3
              title={project.title}
              className={`text-[12.5px] sm:text-[13px] font-semibold leading-snug tracking-tight text-[#0f294a] ${theme.hoverTitle} line-clamp-2 transition-colors min-h-[36px]`}
            >
              {cardTitle}
            </h3>
            <p className="mt-1.5 text-xs font-medium text-slate-600 truncate">
              {subtitleLabel}
              {reviewCount > 0 ? ` · ${formatLabel}` : " · Instant Download"}
            </p>
          </Link>
        </div>

        {/* Zone 3: Footer (Pricing + Single Clear CTA) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <AmazonPrice
              amount={project.price_kes}
              originalAmount={project.original_price_kes}
              size="sm"
            />
            {discountPct > 0 && (
              <span className="rounded border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 tabular-nums">
                -{discountPct}%
              </span>
            )}
          </div>
          <BuyButton
            projectId={project.id}
            isOwner={viewerId === project.trainer_id}
            className="px-3 py-1.5 text-xs h-8"
          />
        </div>
      </div>
    </article>
  );
}
