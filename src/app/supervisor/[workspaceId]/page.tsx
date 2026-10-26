import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import {
  approveProposal,
  requestProposalChanges,
  updateProposalTitle,
} from "@/app/supervisor/actions";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview } from "@/types/database";

export const instant = false;

interface SupervisorWorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function SupervisorWorkspacePage({ params }: SupervisorWorkspacePageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/supervisor/${workspaceId}`);
  }

  // Verify supervisor or admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "supervisor" && profile?.role !== "admin") {
    redirect("/learn");
  }

  // Load candidate workspace
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
      student:student_id(full_name, admission_number, course, level),
      institution:institution_id(name, code, ai_mode)
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspaceData) {
    notFound();
  }

  const workspace = workspaceData as unknown as ProjectWorkspace;

  // Authorization: must be assigned supervisor or admin
  if (profile.role !== "admin" && workspace.supervisor_id !== user.id) {
    redirect("/supervisor");
  }

  // Load sections
  const { data: sectionsData } = await supabase
    .from("workspace_sections")
    .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];

  // Load supervisor review history
  const { data: reviewsData } = await supabase
    .from("supervisor_reviews")
    .select("id, status, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];

  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);

  const proposalDefs = templateDefs.filter((d) => d.phase === "proposal");
  const projectDefs = templateDefs.filter((d) => d.phase === "project");

  const proposalSectionsMap = new Map(
    sections.filter((s) => s.phase === "proposal").map((s) => [s.section_key, s])
  );

  const projectSectionsMap = new Map(
    sections.filter((s) => s.phase === "project").map((s) => [s.section_key, s])
  );

  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/supervisor"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Candidates</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-xs sm:text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              Candidate Review
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isApproved
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20"
                  : isPending
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {isApproved
                ? "Approved"
                : isPending
                ? "Review Required"
                : "Ideation"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Candidate Summary Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Candidate: {workspace.student?.full_name || "Enrolled Student"}
              </span>
              {workspace.student?.admission_number && (
                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                  Adm: {workspace.student.admission_number}
                </span>
              )}
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                {workspace.level} Level
              </span>
              <span className="text-[11px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                {workspace.workspace_type.replace("_", " ")}
              </span>
            </div>

            <div className="text-xs text-zinc-500">
              Institution: {workspace.institution?.name || "Independent"}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              {workspace.title || "Untitled Project Formulation"}
            </h1>
            <p className="text-xs text-zinc-500">
              Course: <strong className="text-zinc-800 dark:text-zinc-200">{workspace.course}</strong>
              {workspace.problem_area ? ` • Area: ${workspace.problem_area}` : ""}
            </p>
          </div>
        </div>

        {/* Proposal Moderation Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Proposal Moderation
              </span>
              <h2 className="text-xl font-bold tracking-tight">Candidate Proposal Draft</h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              Scorecard: {rubric.scorecardName}
            </span>
          </div>

          {/* Proposal Section Details */}
          <div className="grid grid-cols-1 gap-4">
            {proposalDefs.map((def) => {
              const s = proposalSectionsMap.get(def.key);
              const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;

              return (
                <div
                  key={def.key}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {def.title}
                      </h3>
                      {def.rubricMarks !== undefined && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {def.rubricMarks} Rubric Marks
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono text-zinc-500">
                      {wordCount} words
                    </span>
                  </div>

                  <div className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans min-h-[4rem]">
                    {s?.current_text && s.current_text.trim().length > 0 ? (
                      s.current_text
                    ) : (
                      <span className="text-zinc-400 italic">No candidate text entered yet.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supervisor Decision Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Supervisor Moderation Decision
              </h3>
              <p className="text-xs text-zinc-500">
                Review candidate proposal against KNEC regulations. Approving the proposal officially unlocks
                Chapters 1–4/5 for candidate authoring and records the decision in the candidate Annex 12 project log.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Form 1: Approve Proposal */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Approve Proposal</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  Confirms the title, statement of problem, objectives, and rationale meet academic standards.
                </p>

                <form action={approveProposal} className="space-y-3">
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    placeholder="Optional approval remarks (e.g. Approved for field data collection / fabrication)..."
                    className="w-full text-xs bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Approve Proposal & Unlock Chapters
                  </button>
                </form>
              </div>

              {/* Form 2: Request Changes */}
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>Request Revisions</span>
                </div>
                <p className="text-xs text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
                  Reverts status to candidate ideation and supplies specific moderation feedback.
                </p>

                <form action={requestProposalChanges} className="space-y-3">
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    required
                    placeholder="Specify exact revisions required (e.g. Narrow specific objectives, update study period)..."
                    className="w-full text-xs bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800/80 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Send Feedback & Request Revisions
                  </button>
                </form>
              </div>
            </div>

            {/* Title Refinement Form (Supervisor authority, especially for Craft) */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <form action={updateProposalTitle} className="space-y-2">
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <label
                  htmlFor="supTitle"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Supervisor Project Title Refinement (KNEC Craft / Moderation Standard)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    id="supTitle"
                    name="title"
                    defaultValue={workspace.title || ""}
                    placeholder="Refined official project title..."
                    required
                    className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    Update Title
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Chapters Progress & AI Influence Metric */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Project Chapters Status & AI Influence Audit
              </h3>
              <span className="text-xs font-mono text-zinc-400">
                {projectDefs.length} Chapters Sections
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {projectDefs.map((def) => {
                const s = projectSectionsMap.get(def.key);
                const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;
                const aiInfluence = s?.current_text
                  ? Math.round(
                      ((s.ai_accepted_chars || 0) / Math.max(s.current_text.length, 1)) * 100
                    )
                  : 0;

                return (
                  <div
                    key={def.key}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate max-w-[180px] text-zinc-900 dark:text-zinc-100">
                        {def.title}
                      </span>
                      {def.rubricMarks !== undefined && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {def.rubricMarks}m
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{wordCount} words</span>
                      <span className="font-mono">AI: {aiInfluence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Review History Log */}
          {reviews.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Prior Moderation Log
              </h3>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold capitalize ${
                          rev.status === "approved"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {rev.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
