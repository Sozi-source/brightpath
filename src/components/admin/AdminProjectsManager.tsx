"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  FileText,
  Camera,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Project, ContentStatus } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import { AdminProductEditModal } from "./AdminProductEditModal";
import { updateProjectStatus } from "@/app/admin/actions";
import { AmazonPrice } from "@/components/ui/AmazonPrice";

interface AdminProjectsManagerProps {
  projects: Project[];
  commissionPercent: number;
}

export function AdminProjectsManager({
  projects,
  commissionPercent,
}: AdminProjectsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "published") return project.status === "published";
    if (statusFilter === "pending_review") return project.status === "pending_review";
    if (statusFilter === "draft") return project.status === "draft" || project.status === "rejected";
    return true;
  });

  const publishedCount = projects.filter((p) => p.status === "published").length;
  const pendingCount = projects.filter((p) => p.status === "pending_review").length;
  const draftCount = projects.filter((p) => p.status === "draft" || p.status === "rejected").length;

  const handleOpenSetup = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Products ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "published"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending_review")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "pending_review"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "draft"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Draft/Inactive ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, subject, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Catalog Table */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Layers className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">No marketplace products match your criteria</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Try adjusting your search terms or status filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-2.5 px-3 w-14 text-center">Cover</th>
                <th className="py-2.5 px-3">Title & Material</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Setup Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const isWorkspaceExport = p.file_path.startsWith("workspace-export:");
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Cover Thumbnail with Camera Overlay */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleOpenSetup(p)}
                        className="group/thumb relative h-12 w-10 rounded-md border border-slate-200 overflow-hidden bg-slate-900 shadow-xs block focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Click to change cover photo or setup product"
                      >
                        {p.cover_path ? (
                          <Image
                            src={`/api/projects/${p.id}/cover?t=${p.created_at}`}
                            alt={p.title}
                            fill
                            unoptimized
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-1 text-white">
                            <FileText className="h-3.5 w-3.5 text-amber-300 mb-0.5" />
                            <span className="text-[7px] font-mono text-slate-300 uppercase">KNEC</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    </td>

                    {/* Title & Format */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleOpenSetup(p)}>
                          {p.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-medium border border-indigo-100">
                          {getMaterialTypeLabel(p.material_type)}
                        </span>
                        {isWorkspaceExport && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-medium border border-emerald-100">
                            KNEC 47 Sections
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {p.category || "General"}
                    </td>

                    {/* Author */}
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.profiles?.full_name || "Institutional"}
                    </td>

                    {/* Price - Amazon E-Commerce Price */}
                    <td className="py-2.5 px-3">
                      <AmazonPrice amount={p.price_kes || 0} size="sm" />
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : p.status === "pending_review"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : p.status === "draft"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {p.status === "published" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                        {p.status === "pending_review" && <Clock className="h-3 w-3 text-amber-600" />}
                        {p.status}
                      </span>
                    </td>

                    {/* Setup Controls & Quick Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary Setup & Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenSetup(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
                          title="Open product setup to change cover, adjust price, and edit metadata"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span>Setup & Edit</span>
                        </button>

                        {/* Quick View Public Listing */}
                        <Link
                          href={`/projects/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                          title="View live marketplace listing"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        {/* Quick Workspace Export Downloads */}
                        {isWorkspaceExport && (
                          <>
                            <Link
                              href={`/api/download?projectId=${encodeURIComponent(p.id)}&format=pdf`}
                              className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Link>
                          </>
                        )}

                        {/* Quick One-Click Status Toggles */}
                        {p.status !== "published" && (
                          <form action={updateProjectStatus} className="inline-block">
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="status" value="published" />
                            <button
                              type="submit"
                              className="px-2 py-1 rounded text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                              title="Publish listing"
                            >
                              Publish
                            </button>
                          </form>
                        )}
                        {p.status === "published" && (
                          <form action={updateProjectStatus} className="inline-block">
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="status" value="draft" />
                            <button
                              type="submit"
                              className="px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              title="Unpublish (move to draft)"
                            >
                              Unpublish
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Edit / Setup Modal */}
      {selectedProject && (
        <AdminProductEditModal
          project={selectedProject}
          commissionPercent={commissionPercent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
