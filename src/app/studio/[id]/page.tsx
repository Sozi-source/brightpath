import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { getRubricForWorkspace, KNEC_RUBRICS } from "@/lib/studio/rubrics";
import {
  computeWorkspaceAuthorship,
  extractLatestRubricScorecard,
  cleanDisplayReviewComment,
  formatAiModeLabel,
} from "@/lib/studio/authorship";
import {
  submitProposalForApproval,
  submitFinalProject,
  resolveWorkspaceAiMode,
} from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  UserCheck,
  Send,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Award,
  Layers,
  Lightbulb,
  FileDown,
  ClipboardCheck,
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
      institution:institution_id(name, code, ai_mode)
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

  const [{ data: sectionsData }, { data: reviewsData }, effectiveAiMode] = await Promise.all([
    db
      .from("workspace_sections")
      .select(
        "id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at"
      )
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    db
      .from("supervisor_reviews")
      .select("id, section_id, status, comment, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    resolveWorkspaceAiMode(db, workspace.institution_id, workspace.student_id),
  ]);

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];
  const reviews: SupervisorReview[] = (reviewsData as SupervisorReview[]) || [];

  // Latest general proposal review (where section_id is null)
  const generalReviews = reviews.filter((r) => !r.section_id);
  const latestGeneralReview = generalReviews[0] || null;

  // Map latest supervisor review per section_id
  const sectionReviewsMap = new Map<string, SupervisorReview>();
  for (const rev of reviews) {
    if (rev.section_id && !sectionReviewsMap.has(rev.section_id)) {
      sectionReviewsMap.set(rev.section_id, rev);
    }
  }

  // Template definitions & KNEC Rubric
  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);
  const rubricCategories =
    (KNEC_RUBRICS[workspace.workspace_type]?.[workspace.level] ||
      KNEC_RUBRICS.trade_fabrication.diploma).categories;

  const authorship = computeWorkspaceAuthorship(sections, templateDefs.length);
  const savedScorecard = extractLatestRubricScorecard(reviews);
  const aiModeInfo = formatAiModeLabel(effectiveAiMode);

  // Separate proposal sections vs project sections
  const proposalDefs = templateDefs.filter((d) => d.phase === "proposal");
  const projectDefs = templateDefs.filter((d) => d.phase === "project");

  const proposalSectionsMap = new Map(
    sections.filter((s) => s.phase === "proposal").map((s) => [s.section_key, s])
  );

  const projectSectionsMap = new Map(
    sections.filter((s) => s.phase === "project").map((s) => [s.section_key, s])
  );

  // Readiness checks
  const proposalSectionsComplete = proposalDefs.every((def) => {
    const s = proposalSectionsMap.get(def.key);
    return s && s.current_text && s.current_text.trim().length >= 20;
  });

  const projectSectionsComplete = projectDefs.every((def) => {
    const s = projectSectionsMap.get(def.key);
    return s && s.current_text && s.current_text.trim().length >= 20;
  });

  const isApproved =
    workspace.status === "approved" ||
    workspace.status === "submitted" ||
    workspace.status === "closed";
  const isSubmitted = workspace.status === "submitted" || workspace.status === "closed";
  const isPending = workspace.status === "proposal_pending";
  const hasChangesRequested =
    latestGeneralReview?.status === "changes_requested" && !isApproved && !isPending;

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
          { label: "AI Policy", value: aiModeInfo.label },
          {
            label: "Status",
            value: isSubmitted
              ? "Submitted"
              : isApproved
              ? "Approved"
              : isPending
              ? "Pending Review"
              : hasChangesRequested
              ? "Revisions Requested"
              : "Drafting",
          },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/studio/${workspaceId}/problem`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-slate-300 shadow-xs transition-colors"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Topic Formulation</span>
            </Link>

            <Link
              href={`/studio/${workspaceId}/export`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-colors"
            >
              <ClipboardCheck className="h-4 w-4 text-indigo-600" />
              <span>Annex 12 &amp; Preview</span>
            </Link>

            <a
              href={`/api/studio/${workspaceId}/export?doc=report`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <FileDown className="h-4 w-4" />
              <span>Export KNEC Report</span>
            </a>
          </div>
        }
      />

      {/* 2. 4-Stage Stepper Progression Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>1. Ideation</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
              isApproved || isPending
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            {isApproved || isPending ? (
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>2. Moderation</span>
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
            <span>3. Chapters</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
              isSubmitted
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            {isSubmitted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            <span>4. Defence &amp; Export</span>
          </div>
        </div>
      </div>

      {/* Changes Requested Notification Banner */}
      {hasChangesRequested && latestGeneralReview && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>Supervisor Feedback</span>
          </div>
          <p className="text-xs text-rose-950 leading-relaxed bg-white p-3 rounded-lg border border-rose-200">
            &ldquo;{cleanDisplayReviewComment(latestGeneralReview.comment)}&rdquo;
          </p>
        </div>
      )}

      {/* Main Grid: Left 2 Cols (Workflows), Right 1 Col (Scorecard, Integrity & Supervisor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase 1: Proposal Sections Checklist */}
          <ContentCard
            title="Proposal Sections"
            subtitle="Required for supervisor review"
            icon={Layers}
            headerRight={
              isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Approved</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pending Review</span>
                </span>
              ) : (
                <form action={submitProposalForApproval}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <button
                    type="submit"
                    disabled={!proposalSectionsComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit for Approval</span>
                  </button>
                </form>
              )
            }
          >
            <div className="space-y-3">
              {proposalDefs.map((def) => {
                const s = proposalSectionsMap.get(def.key);
                const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;
                const isDone = wordCount >= 20;
                const secReview = s?.id ? sectionReviewsMap.get(s.id) : undefined;

                return (
                  <div
                    key={def.key}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all space-y-2 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {def.title}
                          </span>
                          {def.rubricMarks !== undefined && (
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {def.rubricMarks}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-md">
                          {s?.current_text ? s.current_text : "No draft entered yet."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500">
                          {wordCount} words
                        </span>
                        <Link
                          href={`/studio/${workspaceId}/write/${def.key}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs transition-colors"
                        >
                          <span>{s?.current_text ? "Edit Draft" : "Start Writing"}</span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        </Link>
                      </div>
                    </div>

                    {secReview && (
                      <div className="px-3 py-2 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700">
                        <span className="font-semibold text-indigo-700">Supervisor Note: </span>
                        <span>{secReview.comment}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ContentCard>

          {/* Phase 2: Project Chapters */}
          <ContentCard
            title="Project Chapters"
            subtitle="Unlocked upon proposal approval"
            icon={Award}
            headerRight={
              !isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </span>
              ) : isSubmitted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Submitted for Defence</span>
                </span>
              ) : (
                <form action={submitFinalProject}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <button
                    type="submit"
                    disabled={!projectSectionsComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Final Project</span>
                  </button>
                </form>
              )
            }
          >
            {!isApproved ? (
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1.5">
                <Lock className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                <h4 className="text-xs font-semibold text-slate-800">Chapters Locked</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chapters unlock after proposal approval.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {projectDefs.map((def) => {
                  const s = projectSectionsMap.get(def.key);
                  const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;
                  const secReview = s?.id ? sectionReviewsMap.get(s.id) : undefined;

                  const secStatusBadge =
                    s?.status === "final"
                      ? {
                          label: "Final",
                          cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        }
                      : secReview?.status === "changes_requested"
                      ? {
                          label: "Revisions Needed",
                          cls: "bg-rose-50 text-rose-700 border-rose-200",
                        }
                      : s?.status === "reviewed"
                      ? {
                          label: "Reviewed",
                          cls: "bg-blue-50 text-blue-700 border-blue-200",
                        }
                      : null;

                  return (
                    <div
                      key={def.key}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all space-y-2 bg-white"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {def.title}
                            </span>
                            {def.rubricMarks !== undefined && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {def.rubricMarks}m
                              </span>
                            )}
                            {secStatusBadge && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${secStatusBadge.cls}`}
                              >
                                {secStatusBadge.label}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-md">
                            {s?.current_text ? s.current_text : "Empty"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-slate-500">
                            {wordCount} words
                          </span>
                          <Link
                            href={`/studio/${workspaceId}/write/${def.key}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                          >
                            <span>Write</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      {secReview && (
                        <div
                          className={`px-3 py-2 rounded-md border text-[11px] ${
                            secReview.status === "changes_requested"
                              ? "bg-rose-50/70 border-rose-200 text-rose-900"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="font-semibold">Supervisor Feedback: </span>
                          <span>{secReview.comment}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right Column (1 Col): Authorship Badge, Scorecard & Supervisor */}
        <div className="space-y-6">
          {/* Authorship Integrity Badge Card */}
          <ContentCard
            title="Authorship Integrity"
            subtitle="Originality & institutional AI governance"
            icon={ShieldCheck}
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{authorship.tierLabel}</span>
                <span
                  className={`font-mono font-semibold px-2 py-0.5 rounded border ${
                    authorship.tier === "high_originality"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {authorship.humanRatioPercent}% Original
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${authorship.humanRatioPercent}%` }}
                />
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${authorship.aiRatioPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Total Words</span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {authorship.totalWords.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Chapters Final</span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {authorship.sectionsFinal} / {projectDefs.length}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-slate-700 flex items-center justify-between">
                <span className="font-medium text-slate-600">Institution AI Policy</span>
                <span className="font-semibold text-indigo-800">{aiModeInfo.label}</span>
              </div>
            </div>
          </ContentCard>

          {/* KNEC Scorecard Card */}
          <ContentCard
            title="KNEC Scorecard"
            subtitle={`${rubric.scorecardName} (100 Marks)`}
            icon={Award}
            headerRight={
              savedScorecard && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {savedScorecard.totalAwarded}/{savedScorecard.maxMarks}
                </span>
              )
            }
          >
            <div className="space-y-2">
              {rubricCategories.map((item) => {
                const awarded = savedScorecard?.scores?.[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0 gap-2"
                  >
                    <span className="text-slate-800 font-medium">{item.label}</span>
                    <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                      {awarded !== undefined ? `${awarded} / ${item.maxMarks}m` : `${item.maxMarks}m`}
                    </span>
                  </div>
                );
              })}

              {savedScorecard?.examinerSummary && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                  <span className="font-semibold block text-emerald-800">
                    Supervisor Assessment Remarks
                  </span>
                  <p>{savedScorecard.examinerSummary}</p>
                </div>
              )}
            </div>
          </ContentCard>

          {/* Assigned Supervisor Card */}
          <ContentCard
            title="Department Supervisor"
            subtitle="Proposal moderation and review"
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
                  Proposal defence and Annex 12 log sign-off
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-semibold block">No Supervisor Assigned</span>
                <p className="text-[11px] text-amber-800">
                  Assign a supervisor to submit your proposal for approval.
                </p>
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </AppShell>
  );
}
