import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell, type SidebarWorkspaceItem } from "@/components/layout/AppShell";
import { ProjectAreaCatalog } from "@/components/studio/ProjectAreaCatalog";
import { StudioAccessGate } from "./StudioAccessGate";
import { hasStudioAccess } from "@/lib/studio/access";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  KNEC Secondary-Data Research Projects
                </div>
                <div className="text-[11px] text-slate-500">
                  Separate builder for proposals and 5-chapter research reports.
                </div>
              </div>
            </div>
            <Link
              href="/studio/research/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <span>New Research Project</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

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
