import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  Users,
  Clock,
  CheckCircle,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { ProjectWorkspace } from "@/types/database";

export const instant = false;

export default async function SupervisorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, institution_id, institutions:institution_id(name, code, ai_mode)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "supervisor" && profile?.role !== "admin") {
    redirect("/learn");
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

  if (profile.role !== "admin") {
    query = query.eq("supervisor_id", user.id);
  }

  const { data: workspacesData } = await query;
  const workspaces: ProjectWorkspace[] = (workspacesData as unknown as ProjectWorkspace[]) || [];

  const pendingCount = workspaces.filter((w) => w.status === "proposal_pending").length;
  const approvedCount = workspaces.filter(
    (w) => w.status === "approved" || w.status === "submitted"
  ).length;

  const institution = (
    Array.isArray(profile?.institutions)
      ? profile?.institutions[0]
      : profile?.institutions
  ) as { name: string; code: string | null; ai_mode: string } | null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              BrightPath
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Supervisor Portal
              </span>
              {profile.role === "admin" && (
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                  Admin Access
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {profile.full_name || user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            <Building className="h-4 w-4" />
            <span>
              {institution?.name
                ? `${institution.name} (${institution.code || "Active"})`
                : "Institutional Project Moderation Panel"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Candidate Supervision
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Review candidate research proposals, evaluate section drafts against KNEC rubrics, inspect
            the AI influence audit log, and sign candidate Annex 12 interaction records.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Assigned Candidates</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold font-mono">{workspaces.length}</p>
            <p className="text-[11px] text-zinc-400 mt-1">Total active project workspaces</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Pending Approvals</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Proposals awaiting moderation sign-off</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Active In-Progress</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Proposals approved for project writing</p>
          </div>
        </div>

        {/* Candidate Workspaces Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Supervised Candidates</h2>
            <span className="text-xs text-zinc-400 font-mono">
              {workspaces.length} {workspaces.length === 1 ? "record" : "records"}
            </span>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-2">
              <GraduationCap className="h-10 w-10 mx-auto text-zinc-400 mb-2" />
              <h3 className="text-base font-bold">No candidates linked yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Students will appear here once they select you as their project supervisor during onboarding
                in Project Studio.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800">
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
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {ws.student?.full_name || "Unknown Student"}
                        </span>
                        {ws.student?.admission_number && (
                          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {ws.student.admission_number}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                          {ws.level}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {ws.title || ws.problem_area || "Topic under ideation"}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                        <span>Course: {ws.course}</span>
                        <span>•</span>
                        <span>Type: {typeLabel}</span>
                        <span>•</span>
                        <span>
                          Updated: {new Date(ws.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          ws.status === "approved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20"
                            : ws.status === "proposal_pending"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20"
                            : ws.status === "submitted"
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
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
        </div>
      </main>
    </div>
  );
}
