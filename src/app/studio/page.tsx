import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import { DeleteDraftButton } from "./DeleteDraftButton";
import {
  Plus,
  ArrowRight,
  Layers,
  Hammer,
  LineChart,
  Briefcase,
  UserCheck,
  CheckCircle,
  FileText,
  FolderKanban,
} from "lucide-react";
import type { ProjectWorkspace } from "@/types/database";

export const instant = false;

export default async function StudioDashboardPage() {
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

  const totalCompletedSections = workspaces.reduce((acc, ws) => {
    return (
      acc +
      (ws.workspace_sections || []).filter(
        (s) => s.current_text && s.current_text.trim().length > 30
      ).length
    );
  }, 0);
  const approvedCount = workspaces.filter(
    (w) => w.status === "approved" || w.status === "submitted"
  ).length;

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
      {/* 1. Header Card */}
      <PageHeaderCard
        title="Project Studio"
        subtitle="Project portfolio management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: profile?.full_name || user.email?.split("@")[0] || "Candidate" },
          { label: "Admission No", value: profile?.admission_number || "Unset" },
          { label: "Institution", value: institutionName },
          { label: "Active Projects", value: `${workspaces.length} Registered` },
        ]}
        actions={
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </Link>
        }
      />

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Portfolios"
          value={workspaces.length}
          icon={FolderKanban}
          color="indigo"
          subtext="Active workspaces"
        />
        <StatCard
          label="Approved Proposals"
          value={approvedCount}
          icon={CheckCircle}
          color="emerald"
          subtext="Cleared for drafting"
        />
        <StatCard
          label="Drafted Chapters"
          value={totalCompletedSections}
          icon={FileText}
          color="amber"
          subtext="Sections completed"
        />
      </div>

      {/* 2. Active Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Active Portfolios
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            {workspaces.length} {workspaces.length === 1 ? "portfolio" : "portfolios"}
          </span>
        </div>

        {workspaces.length === 0 ? (
          <ContentCard>
            <div className="text-center py-12 space-y-3 max-w-sm mx-auto">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                No active projects
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Create a project workspace to begin drafting your proposal and chapters.
              </p>
              <div className="pt-2">
                <Link
                  href="/studio/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Workspace</span>
                </Link>
              </div>
            </div>
          </ContentCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workspaces.map((ws) => {
              const typeLabel =
                ws.workspace_type === "trade_fabrication"
                  ? "Trade Fabrication"
                  : ws.workspace_type === "research_secondary"
                  ? "Secondary Research"
                  : "Business Plan";

              const TypeIcon =
                ws.workspace_type === "trade_fabrication"
                  ? Hammer
                  : ws.workspace_type === "research_secondary"
                  ? LineChart
                  : Briefcase;

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
                <div
                  key={ws.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                          {ws.level === "craft" ? "Certificate" : "Diploma"}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <TypeIcon className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{typeLabel}</span>
                        </span>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isPending
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {isApproved
                          ? "Approved"
                          : isPending
                          ? "Pending Review"
                          : "Drafting"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {ws.title || "Topic Formulation"}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Course: <span className="font-medium text-slate-800">{ws.course}</span>
                      </p>
                    </div>

                    {ws.supervisor?.full_name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-900 truncate">
                          Supervisor: {ws.supervisor.full_name}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Chapters Completed</span>
                        <span className="font-mono font-semibold text-indigo-600">
                          {completedSections} / {totalSections} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Updated {new Date(ws.updated_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isApproved && (
                        <DeleteDraftButton workspaceId={ws.id} title={ws.title} />
                      )}
                      <Link
                        href={`/studio/${ws.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
