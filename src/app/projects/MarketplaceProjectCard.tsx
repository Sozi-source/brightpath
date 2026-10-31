import { BookOpen, Download, ShieldCheck, Star } from "lucide-react";
import type { Project } from "@/types/database";
import { BuyButton } from "@/components/BuyButton";

export function MarketplaceProjectCard({
  project,
  viewerId,
  rating,
}: {
  project: Project;
  viewerId?: string;
  rating?: { rating_average: number; review_count: number };
}) {
  const reviewCount = Number(rating?.review_count || 0);
  const average = Number(rating?.rating_average || 0);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-colors hover:border-indigo-300">
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-indigo-600 to-amber-400" />
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-800">
              {project.category || "Project"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Published
            </span>
          </div>
          <h2 className="text-base font-semibold leading-snug tracking-tight text-slate-900">{project.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{project.profiles?.full_name || "BrightPath Publisher"}</p>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
            {project.description || "Complete project documentation and supporting files."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{Number(project.download_count || 0).toLocaleString()} downloads</span>
            {reviewCount ? (
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />{average.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
            ) : (
              <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />No reviews</span>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Price</span>
            <span className="font-mono text-lg font-semibold tracking-tight text-indigo-700">KES {Number(project.price_kes).toLocaleString()}</span>
          </div>
          <BuyButton projectId={project.id} isOwner={viewerId === project.trainer_id} />
        </div>
      </div>
    </article>
  );
}
