import Image from "next/image";
import Link from "next/link";
import { BookOpen, Download, Eye, Star } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
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
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-colors hover:border-indigo-300">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-600 to-amber-400" />
      <Link href={`/projects/${project.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600" aria-label={`View ${project.title}`}>
        <div className="grid grid-cols-[104px_1fr] gap-4 p-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-amber-50">
            {project.cover_path ? (
              <Image src={`/api/projects/${project.id}/cover`} alt={`${project.title} cover`} fill unoptimized sizes="104px" className="object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-blue-800">
                <BookOpen className="h-7 w-7" />
                <span className="text-[9px] font-semibold uppercase tracking-wide">{getMaterialTypeLabel(project.material_type)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 py-1">
            <span className="inline-flex rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-800">
              {getMaterialTypeLabel(project.material_type)}
            </span>
            <h2 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-indigo-700">{project.title}</h2>
            <p className="mt-1 text-xs text-slate-600">{project.category || "General"}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{project.description || "Digital learning material."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
              {reviewCount ? <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />{average.toFixed(1)} <span className="font-normal text-slate-500">({reviewCount})</span></span> : <span className="text-slate-500">New listing</span>}
              <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{Number(project.download_count || 0).toLocaleString()}</span>
              {project.preview_path && <span className="inline-flex items-center gap-1 text-blue-700"><Eye className="h-3.5 w-3.5" />Sample</span>}
            </div>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
        <span className="font-mono text-base font-semibold tracking-tight text-indigo-700">KES {Number(project.price_kes).toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Eye className="h-3.5 w-3.5" /> Details</Link>
          <BuyButton projectId={project.id} isOwner={viewerId === project.trainer_id} />
        </div>
      </div>
    </article>
  );
}
