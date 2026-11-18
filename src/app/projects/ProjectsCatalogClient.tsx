"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Layers, Search } from "lucide-react";
import type { Project } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import { MarketplaceProjectCard } from "./MarketplaceProjectCard";

export type RatingStat = {
  rating_average: number;
  review_count: number;
};

export type BrowseCategory = {
  value: string;
  label: string;
  types: string[] | null;
  count: number;
};

type ProjectsCatalogClientProps = {
  projects: Project[];
  ratingEntries: [string, RatingStat][];
  browseCategories: BrowseCategory[];
  viewerId?: string;
  isPublisher: boolean;
  initialQuery: string;
  initialCategory: string;
  initialType: string;
  initialSort: string;
  initialPage: number;
};

const PAGE_SIZE = 12;

export function ProjectsCatalogClient({
  projects,
  ratingEntries,
  browseCategories,
  viewerId,
  isPublisher,
  initialQuery,
  initialCategory,
  initialType,
  initialSort,
  initialPage,
}: ProjectsCatalogClientProps) {
  const searchParams = useSearchParams();

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Sync state when URL searchParams change via external Links (e.g. AppShell sidebar)
  useEffect(() => {
    const nextQ = searchParams.get("q") || "";
    const nextCategory = searchParams.get("category") || "";
    const nextType = searchParams.get("type") || "";
    const nextSort = searchParams.get("sort") || "newest";
    const nextPage = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    setQueryInput(nextQ);
    setSelectedCategory(nextCategory);
    setSelectedType(nextType);
    setSort(nextSort);
    setPage(nextPage);
  }, [searchParams]);

  const ratingByProject = useMemo(() => new Map(ratingEntries), [ratingEntries]);

  function syncUrl(next: {
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const qVal = (next.q ?? queryInput).trim();
    const catVal = next.category ?? selectedCategory;
    const typeVal = next.type ?? selectedType;
    const sortVal = next.sort ?? sort;
    const pageVal = next.page ?? page;

    if (qVal) params.set("q", qVal);
    if (catVal) params.set("category", catVal);
    if (typeVal) params.set("type", typeVal);
    if (sortVal && sortVal !== "newest") params.set("sort", sortVal);
    if (pageVal > 1) params.set("page", String(pageVal));

    const nextUrl = `/projects${params.size ? `?${params.toString()}` : ""}`;
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", nextUrl);
    }
  }

  function applyFilters(next: {
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    page?: number;
  }) {
    const nextQ = next.q ?? queryInput;
    const nextCategory = next.category ?? selectedCategory;
    const nextType = next.type ?? selectedType;
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? 1;

    setQueryInput(nextQ);
    setSelectedCategory(nextCategory);
    setSelectedType(nextType);
    setSort(nextSort);
    setPage(nextPage);
    syncUrl({
      q: nextQ,
      category: nextCategory,
      type: nextType,
      sort: nextSort,
      page: nextPage,
    });
  }

  const normalizedQuery = queryInput.trim().toLowerCase();
  const selectedTypeLabel =
    selectedType === "study_resources" ? "Study resources" : getMaterialTypeLabel(selectedType);

  const visibleProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesText =
        !normalizedQuery ||
        [project.title, project.description, project.category, getMaterialTypeLabel(project.material_type)]
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesCategory =
        !selectedCategory || (project.category || "General") === selectedCategory;
      const matchesType =
        !selectedType ||
        (selectedType === "study_resources" &&
          ["study_guide", "reference_book", "other"].includes(project.material_type || "")) ||
        project.material_type === selectedType;
      return matchesText && matchesCategory && matchesType;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "downloads") return Number(b.download_count || 0) - Number(a.download_count || 0);
      if (sort === "rating") {
        return (ratingByProject.get(b.id)?.rating_average || 0) - (ratingByProject.get(a.id)?.rating_average || 0);
      }
      if (sort === "price_low") return Number(a.price_kes) - Number(b.price_kes);
      if (sort === "price_high") return Number(b.price_kes) - Number(a.price_kes);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [projects, normalizedQuery, selectedCategory, selectedType, sort, ratingByProject]);

  const resultCount = visibleProjects.length;
  const pageCount = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const pageNumber = Math.min(pageCount, Math.max(1, page));
  const pageProjects = visibleProjects.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
  const showShelves = !normalizedQuery && !selectedType && !selectedCategory;

  return (
    <section className="min-w-0 w-full overflow-x-hidden">
      {/* Enterprise Catalog Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
            Resource Store
          </h1>
          <p className="text-xs text-slate-600">
            Verified business plans, research projects, notes, and past papers.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-700 tabular-nums">
          {visibleProjects.length} {visibleProjects.length === 1 ? "resource" : "resources"}
        </span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters({ q: queryInput, page: 1 });
        }}
        className="mb-3 flex flex-col gap-2 bp-card p-3 sm:flex-row"
      >
        <label htmlFor="marketplace-search" className="sr-only">
          Search learning materials
        </label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="marketplace-search"
            name="q"
            value={queryInput}
            onChange={(event) => applyFilters({ q: event.target.value, page: 1 })}
            placeholder="Search materials, subjects, or authors"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#092B68] focus:outline-none focus:ring-2 focus:ring-[#092B68]/15"
          />
        </div>
        <label htmlFor="marketplace-sort" className="sr-only">
          Sort materials
        </label>
        <select
          id="marketplace-sort"
          name="sort"
          value={sort}
          onChange={(event) => applyFilters({ sort: event.target.value, page: 1 })}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800"
        >
          <option value="newest">Latest</option>
          <option value="rating">Top rated</option>
          <option value="downloads">Most downloaded</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
        </select>
        <button type="submit" className="h-10 bp-btn-primary px-5 text-sm cursor-pointer whitespace-nowrap">
          Search
        </button>
        {isPublisher && (
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Layers className="h-4 w-4 text-[#092B68]" />
            Admin
          </Link>
        )}
      </form>

      {/* Quick-Filter Category Pills */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {browseCategories
          .filter((cat) => cat.label === "All materials" || cat.count > 0)
          .map((cat) => {
            const isActive = selectedType === cat.value;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => applyFilters({ type: cat.value, category: "", page: 1 })}
                aria-pressed={isActive}
                className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#092B68] text-white shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isActive ? "text-blue-200" : "text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
      </div>

      {showShelves ? (
        visibleProjects.length ? (
          <div className="space-y-8">
            {browseCategories
              .filter((category) => category.value)
              .map((category) => {
                const shelfProjects = visibleProjects.filter((project) =>
                  category.types?.includes(project.material_type || "")
                );
                if (!shelfProjects.length) return null;
                return (
                  <section key={category.value} aria-labelledby={`shelf-${category.value}`} className="min-w-0 w-full">
                    <div className="mb-3.5 flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h2 id={`shelf-${category.value}`} className="text-base font-semibold tracking-tight text-slate-900">
                          {category.label}
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          {shelfProjects.length} curriculum materials available
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyFilters({ type: category.value, category: "", page: 1 })}
                        className="cursor-pointer text-xs font-semibold text-[#092B68] hover:underline transition-colors"
                      >
                        See all <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <div className="grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-4 xl:gap-5">
                      {shelfProjects.map((project, index) => (
                        <MarketplaceProjectCard
                          key={project.id}
                          project={project}
                          viewerId={viewerId}
                          rating={ratingByProject.get(project.id)}
                          colorIndex={index}
                          className="w-full min-w-0"
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        ) : (
          <div className="bp-card border-dashed px-4 py-16 text-center">
            <Layers className="mx-auto mb-3 h-9 w-9 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Marketplace is ready</h3>
            <p className="mt-1 text-xs text-slate-600">Published learning materials will appear here.</p>
          </div>
        )
      ) : (
        <>
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                {selectedType ? selectedTypeLabel : selectedCategory || "Search results"}
              </h2>
              <p className="text-xs text-slate-500">{resultCount} materials found</p>
            </div>
            <button
              type="button"
              onClick={() => applyFilters({ q: "", category: "", type: "", sort: "newest", page: 1 })}
              className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Browse all
            </button>
          </div>
          {visibleProjects.length ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-4 xl:gap-5">
              {pageProjects.map((project, index) => (
                <MarketplaceProjectCard
                  key={project.id}
                  project={project}
                  viewerId={viewerId}
                  rating={ratingByProject.get(project.id)}
                  colorIndex={index}
                  className="w-full min-w-0"
                />
              ))}
            </div>
          ) : (
            <div className="bp-card border-dashed px-4 py-16 text-center">
              <Layers className="mx-auto mb-3 h-9 w-9 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">No matching materials</h3>
              <p className="mt-1 text-xs text-slate-600">
                Try another search or browse a different category.
              </p>
              <button
                type="button"
                onClick={() => applyFilters({ q: "", category: "", type: "", sort: "newest", page: 1 })}
                className="mt-4 inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          )}
          {resultCount > PAGE_SIZE && (
            <nav aria-label="Marketplace pages" className="mt-5 flex items-center justify-between bp-card p-3">
              <span className="text-xs text-slate-600">
                Page {pageNumber} of {pageCount}
              </span>
              <div className="flex gap-2">
                {pageNumber > 1 && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ page: pageNumber - 1 })}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                )}
                {pageNumber < pageCount && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ page: pageNumber + 1 })}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
