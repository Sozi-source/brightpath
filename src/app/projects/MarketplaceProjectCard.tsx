import Image from "next/image";
import Link from "next/link";
import { Download, Eye, Star, FileText, CheckCircle2, BookOpen } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import { BuyButton } from "@/components/BuyButton";
import { AmazonPrice } from "@/components/ui/AmazonPrice";

export function MarketplaceProjectCard({
  project,
  viewerId,
  rating,
  className = "w-[280px] shrink-0",
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

  return (
    <article className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Top Signature Two-Tone Stripe: Signature Blue (60%) + Kenyan Gold (40%) */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-amber-400" />

      {/* Card Header / Manuscript Cover View - 3/4 Portrait Ratio to Maximize Cover Visibility */}
      <Link
        href={`/projects/${project.id}`}
        className="block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        aria-label={`View ${cleanTitle}`}
      >
        {project.cover_path ? (
          <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
            <Image
              src={`/api/projects/${project.id}/cover`}
              alt={`${cleanTitle} cover`}
              fill
              unoptimized
              sizes="280px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : isBusinessPlan ? (
          /* Institutional KNEC Business Plan Manuscript Dossier Presentation */
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 text-white flex flex-col justify-between select-none">
            {/* Subtle background security pattern */}
            <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

            {/* Top Cover Bar */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-300">KNEC SERIES</span>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 border border-amber-400/30">
                {levelLabel}
              </span>
            </div>

            {/* Center Cover Monogram & Folio Title */}
            <div className="relative z-10 my-auto text-center px-2 py-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 mb-2 shadow-xs backdrop-blur-xs">
                <FileText className="h-5 w-5 text-amber-300" />
              </div>
              <div className="text-xs font-semibold tracking-tight text-white line-clamp-3 leading-snug">
                {cleanTitle}
              </div>
              <div className="text-[9px] text-slate-300 font-mono mt-1 uppercase tracking-wider">
                Assessment Project Dossier
              </div>
            </div>

            {/* Bottom Cover Specs Bar */}
            <div className="relative z-10 flex items-center justify-between text-[9px] text-slate-300 border-t border-white/10 pt-2">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" /> 47 KNEC Sections
              </span>
              <div className="flex items-center gap-1 font-mono text-[8.5px] text-slate-300">
                <span className="rounded bg-white/10 px-1.5 py-0.5 border border-white/10">PDF</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 border border-white/10">DOCX</span>
              </div>
            </div>
          </div>
        ) : (
          /* General Institutional Learning Material Cover */
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100 p-4 text-slate-900 flex flex-col items-center justify-center gap-2 text-center border-b border-slate-200/80">
            <span className="rounded-xl bg-blue-100 p-2.5 text-blue-700 shadow-2xs">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {getMaterialTypeLabel(project.material_type)}
            </span>
          </div>
        )}

        {project.preview_path && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/60 backdrop-blur-xs px-2 py-1 text-[10px] font-semibold text-white shadow-xs">
            <Eye className="h-3 w-3" /> Preview
          </span>
        )}
      </Link>

      {/* Card Body - Tiny, Clean Text Beneath 3/4 Image */}
      <div className="p-2.5 flex flex-col flex-1 justify-between font-sans">
        <div>
          {/* Metadata Row: Category & Metrics */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="inline-flex items-center text-[9px] font-semibold uppercase tracking-wider text-[#007185] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100/80 truncate max-w-[140px]">
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
