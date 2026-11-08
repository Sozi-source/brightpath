import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { DeleteDraftButton } from "./DeleteDraftButton";
import { ProjectAreaCatalog } from "@/components/studio/ProjectAreaCatalog";
import {
  Plus,
  ArrowRight,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import type { ProjectWorkspace } from "@/types/database";

export const instant = false;

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

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={profile?.course || "KNEC Project Studio"}
    >
      <PageHeaderCard
        title="Project Studio"
        subtitle={workspaces.length === 0 ? "Select a project area to begin." : "Manage and continue your project work."}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: profile?.full_name || user.email || "Student" },
          { label: "Admission No", value: profile?.admission_number || "Unset" },
          { label: "Institution", value: institutionName },
        ]}
        actions={
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bp-btn-primary text-xs sm:text-sm shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </Link>
        }
      />

      <div className="space-y-6">
        {/* If candidate has existing projects, list them prominently */}
        {workspaces.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Active Projects</h2>
              <span className="text-xs text-slate-500 font-medium">{workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}</span>
            </div>

            <div className="divide-y divide-slate-200 bp-card overflow-hidden">
              {workspaces.map((ws) => {
                const typeLabel =
                  ws.workspace_type === "trade_fabrication"
                    ? "Trade Fabrication"
                    : ws.workspace_type === "research_secondary"
                    ? "Secondary Research"
                    : "Business Plan";

                const sections = ws.workspace_sections;
                const totalSections = sections?.length || 0;
                const completedSections = (sections || []).filter(
                  (s) => s.current_text && s.current_text.trim().length > 30
                ).length;
                const progressPct =
                  totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

                const isApproved = ws.status === "approved" || ws.status === "submitted";
                const isPending = ws.status === "proposal_pending";

                return (
                  <div key={ws.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{ws.title || "Untitled project"}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${isApproved ? "border-emerald-200 bg-emerald-50 text-emerald-800" : isPending ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                          {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                          {isApproved ? "Approved" : isPending ? "Awaiting review" : "In progress"}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-600">{typeLabel} · {ws.course} · {ws.level === "craft" ? "Certificate" : "Diploma"}</p>
                      <p className="text-[11px] text-slate-500">{completedSections} of {totalSections} sections drafted · {progressPct}%</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <DeleteDraftButton workspaceId={ws.id} title={ws.title} compact />
                      <Link href={`/studio/${ws.id}`} className="inline-flex items-center gap-1.5 bp-btn-primary px-3 py-2 text-xs">
                        <span>Continue</span><ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Areas Catalog Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                {workspaces.length === 0 ? "Select Your Project Area" : "Explore Project Areas (35 Available)"}
              </h2>
              <p className="text-xs text-slate-500">
                {workspaces.length === 0
                  ? "Select one of the 35 KNEC curriculum venture areas to initialize your project."
                  : "Browse or start an additional business venture or research track."}
              </p>
            </div>
          </div>

          <ProjectAreaCatalog
            candidateName={profile?.full_name || user.email || "Candidate"}
            admissionNumber={profile?.admission_number || ""}
            course={profile?.course || "Diploma in Human Nutrition and Dietetics"}
            level={profile?.level || "diploma"}
            currentWorkspacesCount={workspaces.length}
          />
        </div>
      </div>
    </AppShell>
  );
}
