import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import { NotebookLmSettingsCard } from "./NotebookLmSettingsCard";
import {
  Users,
  Clock,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { ProjectWorkspace, UserProfile } from "@/types/database";

export const instant = false;

export default async function SupervisorPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/supervisor");
  }

  const db = getServerDbClient(supabase);

  const { data: profileData } = await db
    .from("profiles")
    .select("*, institutions:institution_id(name, code, ai_mode)")
    .eq("id", user.id)
    .single();

  const profile = profileData as unknown as UserProfile | null;

  if (profile?.role !== "supervisor" && profile?.role !== "admin") {
    redirect("/studio");
  }

  // Fetch all candidate workspaces for faculty moderation
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
      student:student_id(full_name, admission_number, course, level),
      institution:institution_id(name, code)
    `)
    .order("updated_at", { ascending: false });

  const workspaces: ProjectWorkspace[] = (workspacesData as unknown as ProjectWorkspace[]) || [];

  const { data: settingsData } = await db
    .from("platform_settings")
    .select("notebook_research_url, notebook_fabrication_url, notebook_business_url")
    .eq("id", 1)
    .maybeSingle();

  const pendingCount = workspaces.filter((w) => w.status === "proposal_pending").length;
  const approvedCount = workspaces.filter(
    (w) => w.status === "approved" || w.status === "submitted"
  ).length;

  const rawInst = profile?.institutions as unknown;
  const institution = (
    Array.isArray(rawInst)
      ? rawInst[0]
      : rawInst
  ) as { name: string; code: string | null; ai_mode: string } | null;

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Supervisor Moderation Portal"
    >
      <PageHeaderCard
        title="Candidate Supervision"
        subtitle="Candidate proposal oversight"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Supervisor", active: true },
        ]}
        metadata={[
          { label: "Supervisor", value: profile?.full_name || user.email || "Faculty Supervisor" },
          { label: "Institution", value: institution?.name || "Accredited TVET Center" },
          { label: "Assigned", value: `${workspaces.length} Candidates` },
          { label: "Pending", value: `${pendingCount} Proposals` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              {profile?.role === "admin" ? "Admin Oversight" : "Faculty Supervisor"}
            </span>
          </div>
        }
      />

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Candidates"
          value={workspaces.length}
          icon={Users}
          color="indigo"
          subtext="Active workspaces"
        />
        <StatCard
          label="Pending Proposals"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtext="Awaiting review"
        />
        <StatCard
          label="Approved Portfolios"
          value={approvedCount}
          icon={CheckCircle}
          color="emerald"
          subtext="Cleared for drafting"
        />
      </div>

      {/* Shared Google NotebookLM Library Configuration */}
      <NotebookLmSettingsCard
        notebookUrl={
          settingsData?.notebook_research_url ||
          settingsData?.notebook_fabrication_url ||
          settingsData?.notebook_business_url ||
          ""
        }
      />

      {/* Candidate Workspaces Card */}
      <ContentCard
        title="Candidate Roster"
        subtitle="Workspace review queue"
        icon={ShieldCheck}
        headerRight={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {workspaces.length} Candidates
          </span>
        }
      >
        {workspaces.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg space-y-2">
            <GraduationCap className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No candidates linked yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Students will appear here once they select you as their project supervisor during onboarding
              in Project Studio.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((ws) => {
              const typeLabel =
                ws.workspace_type === "trade_fabrication"
                  ? "Trade Fabrication"
                  : ws.workspace_type === "research_secondary"
                  ? "Secondary Research"
                  : "Business Plan";

              return (
                <div
                  key={ws.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                          {ws.student?.full_name || "Unknown Student"}
                        </h3>
                        {ws.student?.admission_number && <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700">{ws.student.admission_number}</span>}
                        <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                          {ws.level === "craft" ? "Certificate" : "Diploma"}
                        </span>
                      </div>

                      <div className="border-l-2 border-indigo-500 pl-3">
                        <p className="text-sm font-semibold leading-snug text-slate-900">
                          {ws.title || ws.problem_area || "Topic under ideation"}
                        </p>
                      </div>

                      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-600">
                        <div className="flex gap-1"><dt className="font-medium text-slate-500">Course</dt><dd className="font-medium text-slate-800">{ws.course}</dd></div>
                        <div className="flex gap-1"><dt className="font-medium text-slate-500">Project</dt><dd className="font-medium text-slate-800">{typeLabel}</dd></div>
                        <div className="flex gap-1"><dt className="font-medium text-slate-500">Updated</dt><dd>{new Date(ws.updated_at).toLocaleDateString()}</dd></div>
                      </dl>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <span className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
                        ws.status === "approved"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : ws.status === "proposal_pending"
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : ws.status === "submitted"
                          ? "border-blue-200 bg-blue-50 text-blue-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}>
                        {ws.status === "proposal_pending" ? "Needs Review" : ws.status === "approved" ? "Approved" : ws.status === "submitted" ? "Final Submitted" : "Ideation"}
                      </span>
                      <Link
                        href={`/supervisor/${ws.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
                      >
                        <span>Review</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </AppShell>
  );
}
