import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { FileText, Briefcase, Download, Search, Layers } from "lucide-react";
import type { Project, UserProfile } from "@/types/database";
import { MarketplaceProjectCard } from "./MarketplaceProjectCard";
import { MARKETPLACE_MATERIAL_TYPES, getMaterialTypeLabel } from "@/lib/marketplace";
import { getWorkspaceSections } from "@/lib/studio/templates";

export const instant = false;

type ProjectsPageProps = {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; page?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await connection();
  const filters = await searchParams;
  const query = (filters.q || "").trim().toLowerCase();
  const selectedCategory = filters.category || "";
  const selectedType = filters.type || "";
  const selectedTypeLabel = selectedType === "study_resources" ? "Study resources" : getMaterialTypeLabel(selectedType);
  const sort = filters.sort || "newest";
  const pageSize = 12;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data as UserProfile | null;
  }

  const [{ data: projectsData }, { data: ratingStats }] = await Promise.all([
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("marketplace_project_rating_stats").select("project_id, rating_average, review_count"),
  ]);
  const projects: Project[] = (projectsData as unknown as Project[]) || [];
  const ratingByProject = new Map((ratingStats || []).map((row) => [row.project_id, {
    rating_average: Number(row.rating_average), review_count: Number(row.review_count),
  }]));

  let visibleProjects = projects.filter((project) => {
    const matchesText = !query || [project.title, project.description, project.category, getMaterialTypeLabel(project.material_type)]
      .some((value) => value?.toLowerCase().includes(query));
    const matchesCategory = !selectedCategory || (project.category || "General") === selectedCategory;
    const matchesType = !selectedType
      || (selectedType === "study_resources" && ["study_guide", "reference_book", "other"].includes(project.material_type || ""))
      || project.material_type === selectedType;
    return matchesText && matchesCategory && matchesType;
  });
  visibleProjects = [...visibleProjects].sort((a, b) => {
    if (sort === "downloads") return Number(b.download_count || 0) - Number(a.download_count || 0);
    if (sort === "rating") return (ratingByProject.get(b.id)?.rating_average || 0) - (ratingByProject.get(a.id)?.rating_average || 0);
    if (sort === "price_low") return Number(a.price_kes) - Number(b.price_kes);
    if (sort === "price_high") return Number(b.price_kes) - Number(a.price_kes);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const resultCount = visibleProjects.length;
  const pageCount = Math.max(1, Math.ceil(resultCount / pageSize));
  const pageNumber = Math.min(pageCount, Math.max(1, Number.parseInt(filters.page || "1", 10) || 1));
  const pageProjects = visibleProjects.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const isPublisher = profile?.role === "trainer" || profile?.role === "admin";

  const { data: approvedPlans } = profile?.role === "admin"
    ? await supabase.from("project_workspaces")
        .select("id, title, course, level, student:student_id(full_name, admission_number)")
        .eq("workspace_type", "business_plan").eq("final_project_status", "approved").order("updated_at", { ascending: false })
    : { data: [] };
  const planIds = (approvedPlans || []).map((plan) => plan.id);
  const { data: planSections } = planIds.length
    ? await supabase.from("workspace_sections").select("workspace_id, section_key, current_text").in("workspace_id", planIds)
    : { data: [] };
  const { data: planListings } = planIds.length
    ? await supabase.from("projects").select("id, file_path").in("file_path", planIds.map((id) => `workspace-export:${id}`))
    : { data: [] };
  const listingByWorkspace = new Map((planListings || []).map((listing) => [listing.file_path.replace("workspace-export:", ""), listing.id]));
  const sectionsByPlan = new Map<string, Map<string, string>>();
  for (const section of planSections || []) {
    if (!sectionsByPlan.has(section.workspace_id)) sectionsByPlan.set(section.workspace_id, new Map());
    sectionsByPlan.get(section.workspace_id)!.set(section.section_key, section.current_text || "");
  }
  const readyPlanIds = new Set((approvedPlans || []).filter((plan) => {
    const sections = sectionsByPlan.get(plan.id);
    return getWorkspaceSections("business_plan", plan.level).every((definition) =>
      (sections?.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length >= (definition.minWords || 30)
    );
  }).map((plan) => plan.id));

  function filterHref(next: { q?: string; category?: string; type?: string; sort?: string; page?: string }) {
    const params = new URLSearchParams();
    const q = next.q ?? filters.q;
    const category = next.category ?? filters.category;
    const type = next.type ?? filters.type;
    const nextSort = next.sort ?? filters.sort;
    const page = next.page ?? "1";
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (nextSort) params.set("sort", nextSort);
    if (page !== "1") params.set("page", page);
    return `/projects${params.size ? `?${params.toString()}` : ""}`;
  }

  const browseCategories = [
    { value: "", label: "All materials", types: null as string[] | null },
    { value: "lecture_notes", label: "Lecture notes", types: ["lecture_notes"] },
    { value: "past_paper", label: "Past papers", types: ["past_paper"] },
    { value: "study_resources", label: "Study resources", types: ["study_guide", "reference_book", "other"] },
    { value: "business_plan", label: "Business plans", types: ["business_plan"] },
    { value: "technical_project", label: "Technical projects", types: ["technical_project"] },
    { value: "research_project", label: "Research projects", types: ["research_project"] },
  ];
  const sidebarCategories = browseCategories.map((category) => ({
    label: category.label,
    href: filterHref({ type: category.value, category: "" }),
    count: projects.filter((project) => !category.types || category.types.includes(project.material_type || "")).length,
    active: selectedType === category.value,
  }));

  return (
    <AppShell user={user} profile={profile} activeContextTitle="Learning Resource Marketplace" marketplaceCategories={sidebarCategories}>
      <PageHeaderCard
        title="Resource Marketplace"
        subtitle="Study materials, notes, and projects"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Marketplace", active: true }]}
        metadata={[
          { label: "Available", value: `${resultCount} Materials` },
          { label: "Formats", value: `${MARKETPLACE_MATERIAL_TYPES.length} Types` },
        ]}
        actions={isPublisher ? (
          <Link href="/trainer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-900 shadow-xs hover:bg-slate-50"><Briefcase className="h-4 w-4 text-indigo-600" /> Publisher</Link>
        ) : (
          <Link href="/library" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"><Download className="h-4 w-4 text-indigo-600" /> My Library</Link>
        )}
      />

      {profile?.role === "admin" && (
        <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-600 to-amber-400" />
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><FileText className="h-4 w-4" /></span><div><h2 className="text-sm font-semibold text-slate-900">Approved Student Plans</h2><p className="text-xs text-slate-600">Final review downloads</p></div></div>
              <span className="text-xs font-semibold text-slate-600">{approvedPlans?.length || 0} Approved</span>
            </div>
            {approvedPlans?.length ? <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {approvedPlans.map((plan) => {
                const student = plan.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
                const listingId = listingByWorkspace.get(plan.id);
                return <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div><p className="text-sm font-semibold text-slate-900">{plan.title || "Business Plan"}</p><p className="text-xs text-slate-600">{student?.full_name || "Student"}{student?.admission_number ? ` · ${student.admission_number}` : ""} · {plan.course || "Business Plan"} · {readyPlanIds.has(plan.id) ? "Ready" : "Incomplete"}</p></div>
                  {listingId && readyPlanIds.has(plan.id) && <div className="flex gap-2"><Link href={`/api/download?projectId=${encodeURIComponent(listingId)}&format=pdf`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> PDF</Link><Link href={`/api/download?projectId=${encodeURIComponent(listingId)}&format=docx`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Word</Link></div>}
                </div>;
              })}
            </div> : <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-xs text-slate-600">No final approvals yet.</p>}
          </div>
        </section>
      )}

      <section>
          <form action="/projects" className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row">
            <label htmlFor="marketplace-search" className="sr-only">Search learning materials</label>
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input id="marketplace-search" name="q" defaultValue={filters.q || ""} placeholder="Search notes, projects, or subjects" className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            {selectedType && <input type="hidden" name="type" value={selectedType} />}
            <button className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700">Search</button>
          </form>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-base font-semibold tracking-tight text-slate-900">{selectedType ? selectedTypeLabel : selectedCategory || "Explore materials"}</h2><p className="text-xs text-slate-600">{resultCount} results</p></div>
            <form action="/projects" className="flex items-center gap-2">
              {filters.q && <input type="hidden" name="q" value={filters.q} />}{selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}{selectedType && <input type="hidden" name="type" value={selectedType} />}
              <label htmlFor="marketplace-sort" className="text-xs font-medium text-slate-700">Sort</label>
              <select id="marketplace-sort" name="sort" defaultValue={sort} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800"><option value="newest">Latest</option><option value="rating">Top rated</option><option value="downloads">Most downloaded</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option></select>
              <button className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">Apply</button>
            </form>
          </div>
          {visibleProjects.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {pageProjects.map((project) => <MarketplaceProjectCard key={project.id} project={project} viewerId={user?.id} rating={ratingByProject.get(project.id)} />)}
          </div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center"><Layers className="mx-auto mb-3 h-9 w-9 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">No matching materials</h3><p className="mt-1 text-xs text-slate-600">Try a different search or subject.</p><Link href="/projects" className="mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Clear filters</Link></div>}
          {resultCount > pageSize && <nav aria-label="Marketplace pages" className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"><span className="text-xs text-slate-600">Page {pageNumber} of {pageCount}</span><div className="flex gap-2">{pageNumber > 1 && <Link href={filterHref({ page: String(pageNumber - 1) })} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Previous</Link>}{pageNumber < pageCount && <Link href={filterHref({ page: String(pageNumber + 1) })} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Next</Link>}</div></nav>}
      </section>
    </AppShell>
  );
}
