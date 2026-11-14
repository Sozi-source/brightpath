import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell, type SidebarWorkspaceItem } from "@/components/layout/AppShell";
import { ProjectAreaCatalog } from "@/components/studio/ProjectAreaCatalog";
import { DeleteDraftButton } from "./DeleteDraftButton";
import { StudioAccessGate } from "./StudioAccessGate";
import { hasStudioAccess } from "@/lib/studio/access";
import { ArrowRight, CheckCircle2, Clock3, FileText } from "lucide-react";
import type { ProjectWorkspace } from "@/types/database";

export default async function StudioDashboardPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/studio");
  }

  const db = getServerDbClient(supabase);

  // Fetch student's profile and active workspaces
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id, institutions(name)")
    .eq("id", user.id)
    .single();

  const { data: workspacesData } = await db
    .from("project_workspaces")
    .select(`
      id,
      student_id,
      supervisor_id,
      institution_id,
      workspace_type,
      level,
      course,
      title,
      problem_area,
      status,
      approved_at,
      submitted_at,
      created_at,
      updated_at,
      supervisor:supervisor_id(full_name),
      institution:institution_id(name, code),
      workspace_sections(id, section_key, phase, status, current_text)
    `)
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false });

  const workspaces: ProjectWorkspace[] = (workspacesData as unknown as ProjectWorkspace[]) || [];

  const rawInst = profile?.institutions as unknown;
  const institutionName =
    (Array.isArray(rawInst)
      ? (rawInst[0] as { name?: string })?.name
      : (rawInst as { name?: string })?.name) || "Independent Candidate";

  const sidebarWorkspaces: SidebarWorkspaceItem[] = workspaces.map((ws) => {
    const typeLabel =
      ws.workspace_type === "trade_fabrication"
        ? "Trade Fabrication"
        : ws.workspace_type === "research_secondary"
        ? "Secondary Research"
        : "Business Plan";

    const sections = ws.workspace_sections || [];
    const totalSections = sections.length;
    const completedSections = sections.filter(
      (s) => s.current_text && s.current_text.trim().length > 30
    ).length;
    const progressPct =
      totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    const status: SidebarWorkspaceItem["status"] =
      ws.status === "approved" || ws.status === "submitted"
        ? "approved"
        : ws.status === "proposal_pending"
        ? "pending"
        : "draft";

    return {
      id: ws.id,
      title: ws.title || "Untitled project",
      typeLabel,
      status,
      completedSections,
      totalSections,
      progressPct,
    };
  });

  const canUseStudio = hasStudioAccess(profile);

  return (
    <AppShell
      user={user}
      profile={profile}
      institutionName={institutionName}
      activeContextTitle={profile?.course || "KNEC Project Studio"}
      studioWorkspaces={canUseStudio ? sidebarWorkspaces : undefined}
    >
      {canUseStudio ? (
        <div className="space-y-5">
          {sidebarWorkspaces.length > 0 && (
            <section aria-label="Active studio drafts" className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#087f8c]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Your Active Studio Projects</h2>
                    <p className="text-[11px] text-slate-500">{sidebarWorkspaces.length} saved workspace{sidebarWorkspaces.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sidebarWorkspaces.map((ws) => {
                  const isApproved = ws.status === "approved";
                  const isPending = ws.status === "pending";
                  return (
                    <div
                      key={ws.id}
                      className="flex flex-col justify-between gap-2.5 rounded-lg border border-slate-200/90 bg-slate-50/50 p-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/studio/${ws.id}`}
                          className="block truncate text-xs font-semibold text-slate-900 hover:text-[#087f8c]"
                          title={ws.title}
                        >
                          {ws.title}
                        </Link>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10.5px]">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700"
                                : isPending
                                ? "bg-amber-50 text-amber-700"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                            {isApproved ? "Approved" : isPending ? "Review" : "Draft"}
                          </span>
                          <span className="font-mono text-slate-500">
                            {ws.completedSections}/{ws.totalSections} ({ws.progressPct}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <Link
                          href={`/studio/${ws.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#087f8c] hover:bg-[#066570] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors"
                        >
                          <span>Continue</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                        <DeleteDraftButton workspaceId={ws.id} title={ws.title} iconOnly />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          <ProjectAreaCatalog
            candidateName={profile?.full_name || user.email || "Candidate"}
            admissionNumber={profile?.admission_number || ""}
            course={profile?.course || "Diploma in Human Nutrition and Dietetics"}
            level={profile?.level || "diploma"}
            currentWorkspacesCount={workspaces.length}
          />
        </div>
      ) : (
        <StudioAccessGate />
      )}
    </AppShell>
  );
}
