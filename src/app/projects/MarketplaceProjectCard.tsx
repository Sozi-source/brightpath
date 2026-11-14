import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
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

  return (
    <article
      className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white shadow-xs ${palette.hoverBorder} hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Subtle Top Accent Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${palette.bgGradient}`} />

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span
              style={{ color: palette.accentHex }}
              className="text-[11px] font-semibold uppercase tracking-wider truncate"
            >
              {isBusinessPlan ? "Business Plan" : project.category || getMaterialTypeLabel(project.material_type)}
            </span>

            {reviewCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-800 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                {average.toFixed(1)}
              </span>
            )}
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c] rounded"
          >
            {project.cover_path && (
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                <Image
                  src={`/api/projects/${project.id}/cover`}
                  alt={`${exactTitle} cover`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 220px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-[#087f8c] line-clamp-2 transition-colors min-h-[40px]">
              {exactTitle}
            </h3>
            <p className="mt-1 text-xs text-slate-600 truncate">
              {levelLabel}
            </p>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <AmazonPrice
            amount={project.price_kes}
            originalAmount={project.original_price_kes}
            size="sm"
          />
          <BuyButton
            projectId={project.id}
            isOwner={viewerId === project.trainer_id}
            className="px-2.5 py-1.5 text-xs h-8"
          />
        </div>
      </div>
    </article>
  );
}
