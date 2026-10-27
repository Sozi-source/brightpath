import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import { resolveNotebookLmUrl } from "@/lib/studio/notebookLmHelper";
import {
  submitProposalForApproval,
  submitChaptersForReview,
} from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { DeleteDraftButton } from "../DeleteDraftButton";
import {
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  UserCheck,
  Send,
  ShieldAlert,
  ChevronRight,
  Award,
  Lightbulb,
  BookOpen,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview } from "@/types/database";

export const instant = false;

interface WorkspaceOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceOverviewPage({ params }: WorkspaceOverviewPageProps) {
  await connection();
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}`);
  }

  const db = getServerDbClient(supabase);

  // Fetch student's profile
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  // Fetch workspace details
  const { data: workspaceData } = await db
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
    if (profile?.role !== "admin" && profile?.role !== "supervisor") {
      redirect("/studio");
    }
  }

  // Fetch all sections
  const { data: sectionsData } = await db
    .from("workspace_sections")
    .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];

  // Fetch recent supervisor reviews
  const { data: reviewsData } = await db
    .from("supervisor_reviews")
    .select("id, status, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];
  const latestReview = reviews[0] || null;

  // Template definitions & KNEC Rubric
  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);

  const sectionsMap = new Map(sections.map((s) => [s.section_key, s]));

  // Group templateDefs by chapter
  const chapterGroups: { chapterKey: string; chapterTitle: string; defs: SectionDefinition[] }[] = [];
  for (const def of templateDefs) {
    const cKey = def.chapter || "project";
    const cTitle = def.chapterTitle || "Project Sections";
    let group = chapterGroups.find((g) => g.chapterKey === cKey);
    if (!group) {
      group = { chapterKey: cKey, chapterTitle: cTitle, defs: [] };
      chapterGroups.push(group);
    }
    group.defs.push(def);
  }

  const isTopicReady = Boolean(workspace.title && workspace.title.trim().length >= 5);
  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isSubmitted = workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";
  const hasChangesRequested = latestReview?.status === "changes_requested" && !isPending && !isSubmitted;

  // Check if student has drafted any content in Chapter 1+ to allow submitting for review
  const hasDraftedChapterContent = templateDefs.some((def) => {
    const s = sectionsMap.get(def.key);
    return s && s.current_text && s.current_text.trim().length >= 20;
  });

  const { data: settingsData } = await db
    .from("platform_settings")
    .select("notebook_research_url, notebook_fabrication_url, notebook_business_url")
    .eq("id", 1)
    .maybeSingle();

  const { url: notebookUrl } = resolveNotebookLmUrl(workspace.workspace_type, settingsData);

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={workspace.title || workspace.course}
    >
      {/* 1. Header Card */}
      <PageHeaderCard
        title={workspace.title || "Project Workspace"}
        subtitle={`${workspace.course} • ${workspace.level.toUpperCase()} Level`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Overview", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: workspace.student?.full_name || "Student" },
          { label: "Admission No", value: workspace.student?.admission_number || "Unset" },
          { label: "Supervisor", value: workspace.supervisor?.full_name || "Unassigned" },
          {
            label: "Status",
            value: isSubmitted
              ? "Chapters Submitted"
              : isApproved
              ? "Topic Approved"
              : isPending
              ? "Pending Topic Approval"
              : hasChangesRequested
              ? "Revisions Requested"
              : "Topic Formulation",
          },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!isApproved && workspace.student_id === user.id && (
              <DeleteDraftButton
                workspaceId={workspaceId}
                title={workspace.title}
                redirectAfter
              />
            )}
            <a
              href={notebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
            >
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>NotebookLM Library</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>
            <Link
              href={`/studio/${workspaceId}/problem`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-slate-300 shadow-xs transition-colors"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Topic Formulation</span>
            </Link>
          </div>
        }
      />

      {/* 2. 4-Stage Stepper Progression Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>1. Topic Selection</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
              isApproved || isPending
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>2. Topic Approval</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
              isApproved
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            {isApproved ? (
              <Unlock className="h-4 w-4 text-emerald-600" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span>3. Chapter Writing</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
              isSubmitted
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>4. Supervisor Review</span>
          </div>
        </div>
      </div>

      {/* Changes Requested Notification Banner */}
      {hasChangesRequested && latestReview && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>Supervisor Feedback</span>
          </div>
          <p className="text-xs text-rose-950 leading-relaxed bg-white p-3 rounded-lg border border-rose-200">
            &ldquo;{latestReview.comment}&rdquo;
          </p>
        </div>
      )}

      {/* Main Grid: Left 2 Cols (Workflows), Right 1 Col (Scorecard & Supervisor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage 1: Project Topic & Approval */}
          <ContentCard
            title="Stage 1: Project Topic"
            subtitle="Submit your topic for supervisor approval to unlock Chapter 1"
            icon={Lightbulb}
            headerRight={
              isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Topic Approved</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pending Topic Approval</span>
                </span>
              ) : (
                <form action={submitProposalForApproval}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <button
                    type="submit"
                    disabled={!isTopicReady}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Topic for Approval</span>
                  </button>
                </form>
              )
            }
          >
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-700">
                    Official Project Title
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {workspace.title || "No project topic formulated yet."}
                  </h4>
                </div>

                <Link
                  href={`/studio/${workspaceId}/problem`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs transition-colors shrink-0 self-start"
                >
                  <span>{workspace.title ? "Edit Topic" : "Formulate Topic"}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </Link>
              </div>

              {workspace.problem_area && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Problem Focus &amp; Initial Objectives
                  </span>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {workspace.problem_area}
                  </p>
                </div>
              )}
            </div>
          </ContentCard>

          {/* Stage 2: KNEC Chapters (Starting at Chapter 1) */}
          <ContentCard
            title="Stage 2: Project Chapters"
            subtitle="Guided writing starting with Chapter 1 once your topic is approved"
            icon={Award}
            headerRight={
              !isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </span>
              ) : isSubmitted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Submitted for Review</span>
                </span>
              ) : (
                <form action={submitChaptersForReview}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <button
                    type="submit"
                    disabled={!hasDraftedChapterContent}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit for Supervisor Review</span>
                  </button>
                </form>
              )
            }
          >
            {!isApproved ? (
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1.5">
                <Lock className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                <h4 className="text-xs font-semibold text-slate-800">
                  Chapters Locked Until Topic Approval
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit your Project Topic in Stage 1. Once your supervisor approves your topic, Chapter 1 unlocks immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {chapterGroups.map((group) => {
                  const completedCount = group.defs.filter((d) => {
                    const sec = sectionsMap.get(d.key);
                    const words = sec?.current_text
                      ? sec.current_text.trim().split(/\s+/).length
                      : 0;
                    return words >= (d.minWords || 30);
                  }).length;

                  return (
                    <div
                      key={group.chapterKey}
                      className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40"
                    >
                      <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {group.chapterTitle}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600">
                          {completedCount}/{group.defs.length} completed
                        </span>
                      </div>

                      <div className="divide-y divide-slate-200/70 bg-white">
                        {group.defs.map((def) => {
                          const s = sectionsMap.get(def.key);
                          const wordCount = s?.current_text
                            ? s.current_text.trim().split(/\s+/).length
                            : 0;
                          const isDone = wordCount >= (def.minWords || 30);

                          return (
                            <div
                              key={def.key}
                              className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  {isDone ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="text-xs font-semibold text-slate-900 truncate">
                                    {def.title}
                                  </span>
                                  {def.rubricMarks !== undefined && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                      {def.rubricMarks}m
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate max-w-md pl-5">
                                  {s?.current_text ? s.current_text : def.guidance}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[11px] font-mono text-slate-500">
                                  {wordCount}w
                                </span>
                                <Link
                                  href={`/studio/${workspaceId}/write/${encodeURIComponent(def.key)}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                >
                                  <span>{s?.current_text ? "Edit" : "Write"}</span>
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>

          {/* Continuous Document Preview for Student */}
          {isApproved && hasDraftedChapterContent && (
            <ContentCard
              title="Continuous Document Preview"
              subtitle="Compiled view of your drafted chapters as seen by your supervisor"
              icon={FileText}
            >
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="text-center border-b border-slate-200 pb-5 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                    {workspace.institution?.name || "Kenya National Examinations Council (KNEC)"}
                  </p>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 uppercase tracking-tight">
                    {workspace.title}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {workspace.student?.full_name} • {workspace.course} ({workspace.level.toUpperCase()})
                  </p>
                </div>

                {chapterGroups.map((group) => {
                  const draftedDefs = group.defs.filter((d) => {
                    const s = sectionsMap.get(d.key);
                    return s && s.current_text && s.current_text.trim().length > 0;
                  });

                  if (draftedDefs.length === 0) return null;

                  return (
                    <div key={group.chapterKey} className="space-y-4 pt-2">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5">
                        {group.chapterTitle}
                      </h3>
                      <div className="space-y-4">
                        {draftedDefs.map((def) => {
                          const s = sectionsMap.get(def.key);
                          return (
                            <div key={def.key} className="space-y-1.5">
                              <h4 className="text-xs font-semibold text-slate-800">
                                {def.title}
                              </h4>
                              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {s?.current_text}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContentCard>
          )}
        </div>

        {/* Right Column (1 Col): Scorecard & Supervisor */}
        <div className="space-y-6">
          {/* KNEC Scorecard Card */}
          <ContentCard
            title="KNEC Scorecard"
            subtitle={`${rubric.scorecardName} (100 Marks)`}
            icon={Award}
          >
            <div className="space-y-2">
              {rubric.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-800 font-medium">
                    {item.category}
                  </span>
                  <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {item.marks}m
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Assigned Supervisor Card */}
          <ContentCard
            title="Department Supervisor"
            subtitle="Topic moderation and chapter review"
            icon={UserCheck}
          >
            {workspace.supervisor?.full_name ? (
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-900 block text-sm">
                    {workspace.supervisor.full_name}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium block">
                    Faculty Project Supervisor
                  </span>
                  {workspace.institution?.name && (
                    <span className="text-[11px] text-slate-500 block pt-1">
                      {workspace.institution.name}
                    </span>
                  )}
                </div>
                <span className="inline-block text-[11px] text-slate-500">
                  Topic approval and continuous chapter sign-off
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-semibold block">No Supervisor Assigned</span>
                <p className="text-[11px] text-amber-800">
                  Assign a supervisor to submit your topic for approval.
                </p>
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </AppShell>
  );
}
