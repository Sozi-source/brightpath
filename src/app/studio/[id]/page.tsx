import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import { submitProposalForApproval } from "@/app/studio/actions";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  AlertCircle,
  UserCheck,
  Send,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Award,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview } from "@/types/database";

export const instant = false;

interface WorkspaceOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceOverviewPage({ params }: WorkspaceOverviewPageProps) {
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}`);
  }

  // Fetch workspace details
  const { data: workspaceData } = await supabase
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
      student:student_id(full_name, admission_number),
      supervisor:supervisor_id(full_name),
      institution:institution_id(name, code)
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspaceData) {
    notFound();
  }

  const workspace = workspaceData as unknown as ProjectWorkspace;

  // Authorize student (or supervisor/admin)
  if (workspace.student_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "supervisor") {
      redirect("/studio");
    }
  }

  // Fetch all sections
  const { data: sectionsData } = await supabase
    .from("workspace_sections")
    .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];

  // Fetch recent supervisor reviews
  const { data: reviewsData } = await supabase
    .from("supervisor_reviews")
    .select("id, status, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];
  const latestReview = reviews[0] || null;

  // Template definitions & KNEC Rubric
  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);

  // Separate proposal sections vs project sections
  const proposalDefs = templateDefs.filter((d) => d.phase === "proposal");
  const projectDefs = templateDefs.filter((d) => d.phase === "project");

  const proposalSectionsMap = new Map(
    sections.filter((s) => s.phase === "proposal").map((s) => [s.section_key, s])
  );

  const projectSectionsMap = new Map(
    sections.filter((s) => s.phase === "project").map((s) => [s.section_key, s])
  );

  // Proposal readiness check
  const proposalSectionsComplete = proposalDefs.every((def) => {
    const s = proposalSectionsMap.get(def.key);
    return s && s.current_text && s.current_text.trim().length >= 20;
  });

  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";
  const hasChangesRequested = latestReview?.status === "changes_requested" && !isApproved && !isPending;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Workspaces</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-xs sm:text-sm truncate max-w-xs sm:max-w-md text-zinc-900 dark:text-zinc-100">
              {workspace.title || "Untitled Project"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isApproved
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20"
                  : isPending
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20"
                  : hasChangesRequested
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-500/20"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {isApproved
                ? "Chapters Unlocked"
                : isPending
                ? "Moderation Pending"
                : hasChangesRequested
                ? "Changes Requested"
                : "Proposal Drafting"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Workspace Title & Meta Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {workspace.workspace_type.replace("_", " ")}
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                {workspace.level} Level
              </span>
              {workspace.student?.admission_number && (
                <span className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded text-zinc-500">
                  Adm: {workspace.student.admission_number}
                </span>
              )}
            </div>

            <Link
              href={`/studio/${workspaceId}/problem`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Topic & Problem Settings</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              {workspace.title || "Project Title Formulation in Progress"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              Course: <strong className="text-zinc-900 dark:text-zinc-100">{workspace.course}</strong>
              {workspace.institution?.name ? ` • ${workspace.institution.name}` : ""}
              {workspace.supervisor?.full_name ? ` • Supervisor: ${workspace.supervisor.full_name}` : ""}
            </p>
          </div>

          {/* Stepper Progression Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>1. Ideation</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                isApproved || isPending
                  ? "border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
              }`}
            >
              {isApproved || isPending ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              <span>2. Proposal Moderation</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                isApproved
                  ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
              }`}
            >
              {isApproved ? <Unlock className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4" />}
              <span>3. Chapters & Practical</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                workspace.status === "submitted"
                  ? "border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>4. Final Defence</span>
            </div>
          </div>
        </div>

        {/* Changes Requested Notification Banner */}
        {hasChangesRequested && latestReview && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <ShieldAlert className="h-5 w-5" />
              <span>Supervisor Feedback: Revisions Requested</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed bg-white/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-rose-200/50 dark:border-rose-800/50">
              &ldquo;{latestReview.comment}&rdquo;
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Please revise your proposal sections below according to your supervisor&apos;s recommendations and resubmit.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Proposal & Chapters */}
          <div className="lg:col-span-2 space-y-8">
            {/* Phase A: Proposal Moderation Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Phase 1 (Mandatory)
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      KNEC Project Proposal
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">Proposal Sections Checklist</h2>
                </div>

                {/* Proposal Submission Status / Action */}
                {isApproved ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approved by Supervisor</span>
                  </div>
                ) : isPending ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="h-4 w-4" />
                    <span>Awaiting Moderation</span>
                  </div>
                ) : (
                  <form action={submitProposalForApproval}>
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <button
                      type="submit"
                      disabled={!proposalSectionsComplete}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit for Approval</span>
                    </button>
                  </form>
                )}
              </div>

              {!isApproved && !isPending && !proposalSectionsComplete && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    To submit for supervisor review, draft all 4 proposal sections below with at least 20 words.
                  </span>
                </div>
              )}

              {/* Proposal Sections List */}
              <div className="space-y-3">
                {proposalDefs.map((def) => {
                  const s = proposalSectionsMap.get(def.key);
                  const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;
                  const isDone = wordCount >= 20;

                  return (
                    <div
                      key={def.key}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/40"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {def.title}
                          </span>
                          {def.rubricMarks !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                              {def.rubricMarks}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate max-w-md">
                          {s?.current_text ? s.current_text : "No draft entered yet."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {wordCount} words
                        </span>
                        <Link
                          href={`/studio/${workspaceId}/write/${def.key}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <span>{s?.current_text ? "Edit" : "Draft"}</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase B: Project Chapters Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Phase 2: Project Proper
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Chapters 1 to {workspace.workspace_type === "business_plan" ? "5" : "4"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">Report Sections</h2>
                </div>

                {!isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Locked (Approval Required)</span>
                  </span>
                )}
              </div>

              {!isApproved ? (
                /* Locked State Notice */
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                  <Lock className="h-7 w-7 mx-auto text-zinc-400 mb-1" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Project Chapters Locked per KNEC Guidelines
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-lg mx-auto leading-relaxed">
                    Under KNEC Business and Technical Examinations regulations, project chapters (Synopsis,
                    Chapters 1 to {workspace.workspace_type === "business_plan" ? "5" : "4"}) unlock immediately
                    once your proposal is reviewed and approved by your supervisor.
                  </p>
                </div>
              ) : (
                /* Unlocked Active Project Sections */
                <div className="space-y-2.5">
                  {projectDefs.map((def) => {
                    const s = projectSectionsMap.get(def.key);
                    const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;

                    return (
                      <div
                        key={def.key}
                        className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-4 bg-white dark:bg-zinc-900"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {def.title}
                            </span>
                            {def.rubricMarks !== undefined && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {def.rubricMarks}m
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate max-w-md">
                            {s?.current_text ? s.current_text : "Empty"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-zinc-400">
                            {wordCount} words
                          </span>
                          <Link
                            href={`/studio/${workspaceId}/write/${def.key}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <span>Write</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col): Rubric Scorecard & Supervisor Info */}
          <div className="space-y-6">
            {/* KNEC Rubric Scorecard */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold tracking-tight">Official KNEC Scorecard</h3>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 space-y-1">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                  {rubric.scorecardName}
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Total Evaluation: <strong>{rubric.totalMarks} Marks</strong>
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {rubric.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.marks}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supervisor & Institution Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">Assigned Supervisor</h3>
              </div>

              {workspace.supervisor?.full_name ? (
                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      {workspace.supervisor.full_name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 block">
                      Faculty Project Supervisor
                    </span>
                    {workspace.institution?.name && (
                      <span className="text-[11px] text-zinc-400 block pt-1">
                        {workspace.institution.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Your supervisor reviews section submissions, signs your Annex 12 interaction log, and conducts your project moderation defence.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">No Supervisor Assigned Yet</span>
                  <p className="text-[11px] leading-relaxed">
                    Connect with your department supervisor so they can moderate your proposal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
