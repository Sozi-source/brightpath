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
    <article className="group w-[168px] shrink-0">
      <Link href={`/projects/${project.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" aria-label={`View ${project.title}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-amber-50 shadow-xs transition group-hover:-translate-y-0.5 group-hover:shadow-md">
          {project.cover_path ? (
            <Image src={`/api/projects/${project.id}/cover`} alt={`${project.title} cover`} fill unoptimized sizes="168px" className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4 text-center text-blue-800">
              <BookOpen className="h-9 w-9" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">{getMaterialTypeLabel(project.material_type)}</span>
            </div>
          )}
          {project.preview_path && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-blue-800 shadow-xs"><Eye className="h-3 w-3" />Preview</span>}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-slate-900 group-hover:text-indigo-700">{project.title}</h2>
      </Link>
      <p className="mt-0.5 truncate text-[11px] text-slate-600">{project.category || getMaterialTypeLabel(project.material_type)}</p>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-600">
        {reviewCount ? <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3 w-3 fill-amber-400 text-amber-500" />{average.toFixed(1)} <span className="font-normal text-slate-500">({reviewCount})</span></span> : <span className="text-slate-500">New</span>}
        <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" />{Number(project.download_count || 0).toLocaleString()}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1">
        <span className="font-mono text-xs font-semibold text-indigo-700">KES {Number(project.price_kes).toLocaleString()}</span>
        <BuyButton projectId={project.id} isOwner={viewerId === project.trainer_id} />
      </div>
    </article>
  );
}
