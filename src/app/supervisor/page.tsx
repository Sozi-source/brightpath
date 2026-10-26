import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/supervisor");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*, institutions:institution_id(name, code, ai_mode)")
    .eq("id", user.id)
    .single();

  const profile = profileData as unknown as UserProfile | null;

  if (profile?.role !== "supervisor" && profile?.role !== "admin") {
    redirect("/studio");
  }

  // Fetch candidates supervised by this user (or all if admin)
  let query = supabase
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

  if (profile?.role !== "admin") {
    query = query.eq("supervisor_id", user.id);
  }

  const { data: workspacesData } = await query;
  const workspaces: ProjectWorkspace[] = (workspacesData as unknown as ProjectWorkspace[]) || [];

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
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
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
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {ws.student?.full_name || "Unknown Student"}
                      </span>
                      {ws.student?.admission_number && (
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {ws.student.admission_number}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ws.level}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      {ws.title || ws.problem_area || "Topic under ideation"}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>Course: <strong className="text-slate-700">{ws.course}</strong></span>
                      <span>•</span>
                      <span>Type: <strong className="text-slate-700">{typeLabel}</strong></span>
                      <span>•</span>
                      <span>
                        Updated: {new Date(ws.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        ws.status === "approved"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : ws.status === "proposal_pending"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : ws.status === "submitted"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {ws.status === "proposal_pending"
                        ? "Needs Review"
                        : ws.status === "approved"
                        ? "Approved"
                        : ws.status === "submitted"
                        ? "Final Submitted"
                        : "Ideation"}
                    </span>

                    <Link
                      href={`/supervisor/${ws.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
