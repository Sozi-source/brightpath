import Image from "next/image";
import Link from "next/link";
import { Download, Eye, Star, MoreVertical } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import { BuyButton } from "@/components/BuyButton";
import { AmazonPrice } from "@/components/ui/AmazonPrice";
import { getCanvasPalette } from "@/lib/canvasTheme";

export function MarketplaceProjectCard({
  project,
  viewerId,
  rating,
  className = "w-[224px] sm:w-[232px] shrink-0",
}: {
  project: Project;
  viewerId?: string;
  rating?: { rating_average: number; review_count: number };
  className?: string;
}) {
  const reviewCount = Number(rating?.review_count || 0);
  const average = Number(rating?.rating_average || 0);

  const isBusinessPlan =
    project.material_type === "business_plan" ||
    (project.category || "").toLowerCase().includes("business") ||
    project.file_path.startsWith("workspace-export:");

  // Extract academic level
  const levelMatch = project.title.match(/\((Diploma|Craft Certificate|Certificate|Higher Diploma)\)/i);
  const levelLabel = levelMatch
    ? levelMatch[1]
    : project.title.toLowerCase().includes("craft") || project.title.toLowerCase().includes("certificate")
    ? "Craft Certificate"
    : "Diploma";

  // Clean title for display by stripping repetitive trailing template labels
  const cleanTitle = project.title
    .replace(/\s*—\s*Complete KNEC Business Plan.*$/i, "")
    .replace(/\s*\(Craft Certificate\)|\s*\(Diploma\)/gi, "")
    .trim();

  // Extract clean business/venture name from title (e.g. "Business Plan for MetabolicCare Dietary Clinic..." -> "MetabolicCare Dietary Clinic...")
  const businessName = cleanTitle
    .replace(/^business\s+plan\s+(for|on|of|:|-)?\s*/i, "")
    .trim() || cleanTitle;

  const palette = getCanvasPalette(project.id || project.title);

  return (
    <article className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white shadow-xs ${palette.hoverBorder} hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Top Signature Two-Tone Stripe: Signature Teal Blue (65%) + Kenyan Gold (35%) */}
      <div className="h-1 w-full bg-gradient-to-r from-[#087f8c] via-teal-500 to-amber-400" />

      {/* Card Header / Manuscript Cover View - Canvas Style Header */}
      <Link
        href={`/projects/${project.id}`}
        className="block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c]"
        aria-label={`View ${cleanTitle}`}
      >
        {project.cover_path ? (
          <div className="relative h-[200px] sm:h-[215px] w-full overflow-hidden bg-slate-100">
            <Image
              src={`/api/projects/${project.id}/cover`}
              alt={`${cleanTitle} cover`}
              fill
              unoptimized
              sizes="(max-width: 640px) 220px, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : isBusinessPlan ? (
          /* Institutional Universal Business Plan Dossier - Canvas Dynamic Jewel Tone Cover */
          <div className={`relative h-[200px] sm:h-[215px] w-full overflow-hidden bg-gradient-to-br ${palette.bgGradient} p-3.5 text-white flex flex-col justify-between select-none shadow-inner`}>
            {/* Ambient luminous radial highlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

            {/* Crisp Inner Inset Border */}
            <div className="absolute inset-2 rounded border border-white/20 pointer-events-none" />

            {/* Top Bar on Cover: Business Plan Label + Canvas Floating 3-Dot Action Button */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-white/90 drop-shadow-xs border-b border-white/30 pb-0.5">
                BUSINESS PLAN
              </span>

              <span className={`h-6 w-6 rounded-full ${palette.circleMenuBg} flex items-center justify-center shadow-xs text-white border border-white/20`}>
                <MoreVertical className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Center: Business Name (High Contrast Brilliant White) */}
            <div className="relative z-10 my-auto text-center px-2 py-1">
              <p className="text-[13.5px] sm:text-[14px] font-bold tracking-tight !text-white line-clamp-3 leading-snug drop-shadow-sm font-sans">
                {businessName}
              </p>
              {levelLabel && (
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[8.5px] font-semibold tracking-wider uppercase !text-white border border-white/30 shadow-2xs">
                  {levelLabel}
                </span>
              )}
            </div>

            {/* Bottom: Minimalist Hairline Specs */}
            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono !text-white/80 px-1 border-t border-white/20 pt-1 font-semibold">
              <span className="tracking-wider uppercase">KNEC Series</span>
              <span className="tracking-widest uppercase">Verified</span>
            </div>
          </div>
        ) : (
          /* General Institutional Learning Material Cover - Canvas Theme */
          <div className={`relative h-[200px] sm:h-[215px] w-full overflow-hidden bg-gradient-to-br ${palette.bgGradient} p-3.5 text-white flex flex-col justify-between select-none shadow-inner`}>
            <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
            <div className="absolute inset-2 rounded border border-white/20 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-white/90 drop-shadow-xs border-b border-white/30 pb-0.5">
                {getMaterialTypeLabel(project.material_type).toUpperCase()}
              </span>

              <span className={`h-6 w-6 rounded-full ${palette.circleMenuBg} flex items-center justify-center shadow-xs text-white border border-white/20`}>
                <MoreVertical className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="relative z-10 my-auto text-center px-2 py-1">
              <p className="text-[13.5px] font-bold tracking-tight !text-white line-clamp-3 leading-snug drop-shadow-sm font-sans">
                {cleanTitle}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono !text-white/80 px-1 border-t border-white/20 pt-1 font-semibold">
              <span className="tracking-wider uppercase">Learning Resource</span>
              <span className="tracking-widest uppercase">PDF</span>
            </div>
          </div>
        )}

        {project.preview_path && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/60 backdrop-blur-xs px-2 py-1 text-[10px] font-semibold text-white shadow-xs">
            <Eye className="h-3 w-3" /> Preview
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-2.5 flex flex-col flex-1 justify-between font-sans">
        <div>
          {/* Metadata Row: Category & Metrics */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span
              style={{ color: palette.accentHex }}
              className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/80 truncate max-w-[140px]"
            >
              {isBusinessPlan ? "Business Plan" : project.category || getMaterialTypeLabel(project.material_type)}
            </span>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 shrink-0">
              {reviewCount > 0 ? (
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#0f1111]">
                  <Star className="h-2.5 w-2.5 fill-[#ffa41c] text-[#de7921]" />
                  {average.toFixed(1)}
                  <span className="text-[9px] text-[#007185] font-normal hover:underline ml-0.5">
                    ({reviewCount})
                  </span>
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200/60">
                  New
                </span>
              )}
              <span className="inline-flex items-center gap-0.5 text-[#565959]">
                <Download className="h-2.5 w-2.5 text-slate-400" />
                {Number(project.download_count || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tiny Title - 2 lines, Amazon E-Commerce Font Styling */}
          <Link href={`/projects/${project.id}`}>
            <h3 className="text-[11.5px] font-medium leading-[1.35] text-[#0f1111] group-hover:text-[#c7511f] line-clamp-2 transition-colors min-h-[31px]">
              {cleanTitle}
            </h3>
          </Link>
        </div>

        {/* Card Footer: Amazon Price + Compact Buy Button */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] font-medium uppercase tracking-wider text-[#565959] leading-none mb-0.5">Price</span>
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
