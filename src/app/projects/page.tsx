import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { Layers, Briefcase, Download, FileText } from "lucide-react";
import type { Project, UserProfile } from "@/types/database";
import { MarketplaceProjectCard } from "./MarketplaceProjectCard";
import { getWorkspaceSections } from "@/lib/studio/templates";

export const instant = false;

export default async function ProjectsPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

  const [{ data: projectsData }, { data: ratingStats }] = await Promise.all([
    supabase.from("projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.from("marketplace_project_rating_stats")
      .select("project_id, rating_average, review_count"),
  ]);

  const projects: Project[] = (projectsData as unknown as Project[]) || [];
  const { data: approvedPlans } = profile?.role === "admin"
    ? await supabase.from("project_workspaces")
        .select("id, title, course, level, student:student_id(full_name, admission_number)")
        .eq("workspace_type", "business_plan")
        .eq("final_project_status", "approved")
        .order("updated_at", { ascending: false })
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

  const isTrainerOrAdmin = profile?.role === "trainer" || profile?.role === "admin";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="TVET Projects Marketplace"
    >
      <PageHeaderCard
        title="Projects Marketplace"
        subtitle="Business plans and technical projects"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects Marketplace", active: true },
        ]}
        metadata={[
          { label: "Available", value: `${projects.length} Projects` },
          { label: "Format", value: "Digital downloads" },
        ]}
        actions={
          isTrainerOrAdmin ? (
            <Link
              href="/trainer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-indigo-900 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-indigo-600" />
              <span>Publisher</span>
            </Link>
          ) : (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              <span>My Library</span>
            </Link>
          )
        }
      />

      {profile?.role === "admin" && (
        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-600 to-amber-400" />
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 p-2 text-blue-700"><FileText className="h-4 w-4" /></span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Approved Student Plans</h2>
                  <p className="text-xs text-slate-600">Complete plans ready to download</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600">{approvedPlans?.length || 0} Final approved</span>
            </div>
            {approvedPlans?.length ? (
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {approvedPlans.map((plan) => {
                  const student = plan.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
                  const ready = readyPlanIds.has(plan.id);
                  const listingId = listingByWorkspace.get(plan.id);
                  return (
                    <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{plan.title || "Business Plan"}</p>
                        <p className="text-xs text-slate-600">{student?.full_name || "Student"}{student?.admission_number ? ` · ${student.admission_number}` : ""} · {plan.course || "Business Plan"} · {ready ? "Ready to download" : "Approved · sections incomplete"}</p>
                      </div>
                      {ready && listingId ? <div className="flex gap-2">
                        <Link href={`/api/download?projectId=${encodeURIComponent(listingId)}&format=pdf`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> PDF</Link>
                        <Link href={`/api/download?projectId=${encodeURIComponent(listingId)}&format=docx`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Word</Link>
                      </div> : ready ? <span className="text-xs text-amber-800">Marketplace listing is being prepared</span> : null}
                    </div>
                  );
                })}
              </div>
            ) : <p className="rounded-lg border border-dashed border-slate-200 py-5 text-center text-xs text-slate-600">No finally approved student plans are in review yet.</p>}
          </div>
        </section>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
          <Layers className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-semibold text-slate-900">No projects available yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Published capstones and business plans will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = ratingStats?.find((row) => row.project_id === project.id);
            return <MarketplaceProjectCard
              key={project.id}
              project={project}
              viewerId={user?.id}
              rating={stats ? { rating_average: Number(stats.rating_average), review_count: Number(stats.review_count) } : undefined}
            />;
          })}
        </div>
      )}
    </AppShell>
  );
}
