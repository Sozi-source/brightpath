import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  FolderGit2,
  Plus,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
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

  // Fetch student's profile and active workspaces
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id, institutions(name)")
    .eq("id", user.id)
    .single();

  const { data: workspacesData } = await supabase
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              BrightPath
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              <FolderGit2 className="h-4 w-4 text-indigo-600" />
              Project Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/learn"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hidden sm:inline"
            >
              Curriculum Revision
            </Link>
            <span className="text-xs text-zinc-400 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {profile?.full_name || user.email}
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                KNEC Academic Workspace
              </span>
              {profile?.admission_number && (
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  Adm: {profile.admission_number}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              My Project Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Guided authoring environment for Craft, Diploma, and Higher Diploma candidates. Write your
              proposal, track supervisor approvals, compile secondary data, and format compliant KNEC
              examinations projects.
            </p>
          </div>

          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Project Workspace</span>
          </Link>
        </div>

        {/* Workspaces List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold tracking-tight">Active Workspaces</h2>
            <span className="text-xs font-mono text-zinc-400">
              {workspaces.length} {workspaces.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 space-y-3 p-6">
              <FolderGit2 className="h-10 w-10 mx-auto text-zinc-400 mb-2" />
              <h3 className="text-base font-bold">No active workspace yet</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Begin by creating a new project workspace. You will select your qualification level (Craft
                or Diploma), choose a research or fabrication track, and connect with your institutional
                supervisor.
              </p>
              <div className="pt-2">
                <Link
                  href="/studio/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Start Your Project</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workspaces.map((ws) => {
                const typeLabel =
                  ws.workspace_type === "trade_fabrication"
                    ? "Trade Fabrication"
                    : ws.workspace_type === "research_secondary"
                    ? "Secondary Research"
                    : "Business Plan";

                // Count section progress
                const sections = ws.workspace_sections;
                const totalSections = sections?.length || 0;
                const completedSections = (sections || []).filter(
                  (s) => s.current_text && s.current_text.trim().length > 30
                ).length;
                const progressPct =
                  totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

                return (
                  <div
                    key={ws.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                          {ws.level} • {typeLabel}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            ws.status === "approved"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20"
                              : ws.status === "proposal_pending"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20"
                              : ws.status === "submitted"
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {ws.status === "approved" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : ws.status === "proposal_pending" ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>
                            {ws.status === "proposal_pending"
                              ? "Proposal Pending"
                              : ws.status === "approved"
                              ? "Proposal Approved"
                              : ws.status === "submitted"
                              ? "Final Submitted"
                              : "Proposal Ideation"}
                          </span>
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-zinc-950 dark:text-zinc-50 line-clamp-2">
                          {ws.title || ws.problem_area || "Untitled Project Idea"}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">Course: {ws.course}</p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Section Progress</span>
                          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                            {completedSections}/{totalSections} ({progressPct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                        <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Supervisor:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {ws.supervisor?.full_name || "Unassigned"}
                        </span>
                      </div>

                      <Link
                        href={`/studio/${ws.id}`}
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
                      >
                        <span>Open Studio</span>
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
