import Image from "next/image";
import Link from "next/link";
import { Download, Eye, Star, FileText, BookOpen, CheckCircle2 } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel, getExactBusinessTitle } from "@/lib/marketplace";
import { BuyButton } from "@/components/BuyButton";
import { AmazonPrice } from "@/components/ui/AmazonPrice";
import { getCanvasPalette } from "@/lib/canvasTheme";

export function MarketplaceProjectCard({
  project,
  viewerId,
  rating,
  colorIndex,
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

  const isBusinessPlan =
    project.material_type === "business_plan" ||
    (project.category || "").toLowerCase().includes("business") ||
    project.file_path.startsWith("workspace-export:");

  const levelMatch = project.title.match(/\((Diploma|Craft Certificate|Certificate|Higher Diploma)\)/i);
  const levelLabel = levelMatch
    ? levelMatch[1]
    : project.title.toLowerCase().includes("craft") || project.title.toLowerCase().includes("certificate")
    ? "Craft Certificate"
    : "Diploma";

  const exactTitle = getExactBusinessTitle(project.title);
  const palette = getCanvasPalette(project.title || project.id, colorIndex);
  const formatLabel = project.file_path.startsWith("workspace-export:")
    ? "PDF + Word"
    : project.file_path.split(".").pop()?.toUpperCase() || "PDF";

  return (
    <article
      className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white shadow-xs ${palette.hoverBorder} hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Unified Single Top Accent Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${palette.bgGradient}`} />

      <div className="flex flex-1 flex-col p-3.5">
        {/* Top Row: Category Badge + Rating / Downloads */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider truncate max-w-[140px] ${palette.badgeBg}`}
          >
            {isBusinessPlan ? "Business Plan" : project.category || getMaterialTypeLabel(project.material_type)}
          </span>

          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 shrink-0">
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-slate-900">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                {average.toFixed(1)}
                <span className="text-[9.5px] text-slate-400 font-normal">({reviewCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Main Card Content: Optional Cover Thumbnail or Crisp Tinted Icon + Single Title */}
        <Link
          href={`/projects/${project.id}`}
          className="group/link flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c] rounded-lg"
        >
          {project.cover_path ? (
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
              <Image
                src={`/api/projects/${project.id}/cover`}
                alt={`${exactTitle} cover`}
                fill
                unoptimized
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${palette.badgeBg} transition-transform duration-200 group-hover:scale-105`}
            >
              {isBusinessPlan ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold leading-snug text-slate-900 group-hover/link:text-[#087f8c] line-clamp-2 transition-colors min-h-[36px]">
              {exactTitle}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500 truncate">
              {isBusinessPlan ? `${levelLabel} · KNEC Series` : `${getMaterialTypeLabel(project.material_type)} · ${formatLabel}`}
            </p>
          </div>
        </Link>

        {/* Secondary Metadata Strip */}
        <div className="mt-3 flex items-center justify-between gap-2 text-[10.5px] text-slate-500">
          <span className="inline-flex items-center gap-1 font-mono">
            <Download className="h-3 w-3 text-slate-400" />
            {Number(project.download_count || 0).toLocaleString()} downloads
          </span>
          <div className="flex items-center gap-2">
            {project.preview_path && (
              <Link
                href={`/projects/${project.id}#preview`}
                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#087f8c] transition-colors"
              >
                <Eye className="h-3 w-3" />
                Preview
              </Link>
            )}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-slate-600">
              {formatLabel}
            </span>
          </div>
        </div>

        {/* Unified Card Footer: Price + Action */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 leading-none mb-0.5">
              Price
            </span>
            <AmazonPrice amount={project.price_kes} size="sm" />
          </div>

          <BuyButton
            projectId={project.id}
            isOwner={viewerId === project.trainer_id}
            className="px-2.5 py-1 text-[11px] h-7"
          />
        </div>
      </div>
    </article>
  );
}
