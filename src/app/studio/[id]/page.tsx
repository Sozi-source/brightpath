import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import { getSectionReviewThreads } from "@/lib/studio/sectionReviewData";
import {
  submitProposalForApproval,
  submitChaptersForReview,
} from "@/app/studio/actions";
import { AppShell, type SidebarWorkspaceItem } from "@/components/layout/AppShell";
import { ContentCard } from "@/components/layout/ContentCard";
import { DeleteDraftButton } from "../DeleteDraftButton";
import { BusinessPlanBuilderModal } from "./BusinessPlanBuilderModal";
import { FinalProjectSubmissionForm } from "./FinalProjectSubmissionForm";
import {
  CheckCircle2,
  Clock,
  Lock,
  Send,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview } from "@/types/database";
import type { BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";

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
    .select("full_name, role, admission_number, course, level, institution_id, institutions(name)")
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
      business_plan_specs,
      status,
      final_project_status,
      marketplace_price_kes,
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
    .select("id, status, review_stage, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];
  const latestReview = reviews[0] || null;
  const sectionReviewThreads = await getSectionReviewThreads(db, workspaceId);

  // Template definitions & KNEC Rubric
  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
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

  const isBusiness = workspace.workspace_type === "business_plan";
  const hasPlanContent = isBusiness && sections.some((section) => section.current_text.trim());
  const totalDefinedSections = templateDefs.length;
  const completedDefinedSections = templateDefs.filter((definition) => {
    const text = sectionsMap.get(definition.key)?.current_text || "";
    return text.trim().split(/\s+/).filter(Boolean).length >= (definition.minWords || 30);
  }).length;
  const overallProgressPct =
    totalDefinedSections > 0 ? Math.round((completedDefinedSections / totalDefinedSections) * 100) : 0;

  const isProjectComplete = completedDefinedSections === totalDefinedSections;
  const incompleteProjectSections = totalDefinedSections - completedDefinedSections;

  const { data: marketplaceListing } = isBusiness && workspace.student_id === user.id
    ? await db.from("projects").select("id, status, price_kes").eq("file_path", `workspace-export:${workspaceId}`).maybeSingle()
    : { data: null };
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
  const firstIncompleteChapterKey =
    chapterGroups.find((group) =>
      group.defs.some((def) => {
        const text = sectionsMap.get(def.key)?.current_text || "";
        return text.trim().split(/\s+/).filter(Boolean).length < (def.minWords || 30);
      })
    )?.chapterKey || chapterGroups[0]?.chapterKey;

  const cleanBusinessTitle = (
    workspace.title || (isBusiness ? "Untitled Business Enterprise" : "Untitled Project Workspace")
  )
    .replace(/^business\s+plan\s+for\s+/i, "")
    .trim();

  const rawInst = profile?.institutions as unknown;
  const institutionName =
    workspace.institution?.name ||
    (Array.isArray(rawInst)
      ? (rawInst[0] as { name?: string })?.name
      : (rawInst as { name?: string })?.name) ||
    "Independent Candidate";

  const sidebarWorkspaces: SidebarWorkspaceItem[] = [
    {
      id: workspace.id,
      title: workspace.title || "Untitled project",
      typeLabel: isBusiness ? "Business Plan" : "Research Project",
      status: isApproved ? "approved" : isPending ? "pending" : "draft",
      completedSections: completedDefinedSections,
      totalSections: totalDefinedSections,
      progressPct: overallProgressPct,
    },
  ];

  return (
    <AppShell
      user={user}
      profile={profile}
      institutionName={institutionName}
      activeContextTitle={workspace.course || "KNEC Project Studio"}
      studioWorkspaces={sidebarWorkspaces}
    >
      <div className="space-y-4">
        {/* 1. Unified Compact Workspace Bar & Concept Card (Replaces 4 stacked banners) */}
        <section className="bp-card overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#087f8c] via-[#0e9ba5] to-[#d9a441]" />

          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Top Toolbar: Back Link + Status Pill + Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Areas</span>
                </Link>

                <span className="text-slate-300">|</span>

                {isApproved ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>{isBusiness ? "Plan Approved" : "Topic Approved"}</span>
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>Awaiting Supervisor Approval</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Draft Workspace</span>
                  </span>
                )}

                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                  {completedDefinedSections}/{totalDefinedSections} sections ({overallProgressPct}%)
                </span>
              </div>

              {/* Consolidated Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {hasPlanContent && (
                  <>
                    <Link
                      href={`/api/studio/${workspaceId}/export?format=pdf`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-[#087f8c]" />
                      <span>PDF</span>
                    </Link>
                    <Link
                      href={`/api/studio/${workspaceId}/export?format=docx`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#087f8c]" />
                      <span>Word (.docx)</span>
                    </Link>
                  </>
                )}

                {isBusiness && workspace.student_id === user.id ? (
                  <BusinessPlanBuilderModal
                    workspaceId={workspaceId}
                    defaultCandidateName={workspace.student?.full_name || ""}
                    defaultAdmissionNumber={workspace.student?.admission_number || ""}
                    defaultInstitutionName={workspace.institution?.name || ""}
                    defaultSupervisorName={workspace.supervisor?.full_name || ""}
                    defaultCourse={workspace.course}
                    defaultLevel={workspace.level}
                    initialSpecs={workspace.business_plan_specs as Partial<BusinessPlanSpecs> | undefined}
                    triggerButton={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 bp-btn-primary px-3.5 py-1.5 text-xs shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{hasPlanContent ? "Configure & Rebuild" : "Build Business Plan"}</span>
                      </button>
                    }
                  />
                ) : (
                  <Link
                    href={`/studio/${workspaceId}/problem`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{workspace.title ? "Edit Topic" : "Formulate Topic"}</span>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </Link>
                )}

                {!isApproved && !isPending && (
                  <form action={submitProposalForApproval}>
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <button
                      type="submit"
                      disabled={!isTopicReady}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit for Approval</span>
                    </button>
                  </form>
                )}

                {workspace.student_id === user.id && (
                  <DeleteDraftButton
                    workspaceId={workspaceId}
                    title={workspace.title}
                    redirectAfter
                    compact
                  />
                )}
              </div>
            </div>

            {/* Project Title (Two-Line Format) & Collapsible Concept Profile */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#087f8c]">
                  {isBusiness
                    ? "BUSINESS PLAN"
                    : workspace.workspace_type === "trade_fabrication"
                    ? "TRADE FABRICATION"
                    : "RESEARCH PROJECT"}
                </div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-snug">
                  {cleanBusinessTitle}
                </h1>
              </div>

              {workspace.problem_area && (
                <details className="group rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-700">
                    <span>{isBusiness ? "Enterprise Profile & Concept Summary" : "Problem Focus & Objectives"}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#087f8c]">
                      <span className="group-open:hidden">Show details</span>
                      <span className="hidden group-open:inline">Hide details</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-2 border-t border-slate-200/70 pt-2 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {workspace.problem_area}
                  </p>
                </details>
              )}
            </div>
          </div>
        </section>

        {/* 2. Supervisor Feedback Alert (Only when changes are requested) */}
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

        {/* 3. KNEC Chapters & Sections (Immediately Visible) */}
        <ContentCard
          title="Chapters & Sections"
          subtitle="Select any section to review, edit, or refine its manuscript content."
          headerRight={
            !isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                <Lock className="h-3 w-3" />
                <span>Locked until approved</span>
              </span>
            ) : isSubmitted ||
              workspace.final_project_status === "pending_review" ||
              workspace.final_project_status === "approved" ||
              workspace.final_project_status === "changes_requested" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#e8f5f5] text-[#087f8c] border border-[#d8ebec]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#087f8c]" />
                <span>
                  {workspace.final_project_status === "approved"
                    ? "Finally Approved"
                    : workspace.final_project_status === "pending_review"
                    ? "Final Review Pending"
                    : workspace.final_project_status === "changes_requested"
                    ? "Final Changes Requested"
                    : "Submitted for Review"}
                </span>
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
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Lock className="h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-xs text-slate-700">
                Chapters unlock after your {isBusiness ? "plan concept" : "topic"} is approved.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapterGroups.map((group) => {
                const completedCount = group.defs.filter((d) => {
                  const sec = sectionsMap.get(d.key);
                  const words = sec?.current_text
                    ? sec.current_text.trim().split(/\s+/).length
                    : 0;
                  return words >= (d.minWords || 30);
                }).length;

                return (
                  <details
                    key={group.chapterKey}
                    open={group.chapterKey === firstIncompleteChapterKey}
                    className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50/70 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-900">{group.chapterTitle}</span>
                      <span className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                        <span className="font-mono">{completedCount}/{group.defs.length} done</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                      </span>
                    </summary>

                    <div className="divide-y divide-slate-100 bg-white">
                      {group.defs.map((def) => {
                        const s = sectionsMap.get(def.key);
                        const wordCount = s?.current_text
                          ? s.current_text.trim().split(/\s+/).length
                          : 0;
                        const isDone = wordCount >= (def.minWords || 30);
                        const sectionThreads = sectionReviewThreads.filter((thread) => thread.section_key === def.key);
                        const openComments = sectionThreads.filter((thread) => thread.status !== "resolved").length;

                        return (
                          <div
                            key={def.key}
                            className="px-4 py-2.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
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
                                {sectionThreads.length > 0 && (
                                  <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${openComments ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                                    {openComments ? `${openComments} comment${openComments === 1 ? "" : "s"} open` : `${sectionThreads.length} resolved`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] font-mono text-slate-500">
                                {wordCount}w
                              </span>
                              <Link
                                href={`/studio/${workspaceId}/write/${encodeURIComponent(def.key)}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#e8f5f5] hover:bg-teal-100 text-[#087f8c] transition-colors"
                              >
                                <span>{s?.current_text ? "Edit" : "Write"}</span>
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </ContentCard>

        {/* 4. Final Project Approval Card */}
        {workspace.student_id === user.id && (isProjectComplete || workspace.final_project_status !== "not_submitted") && (
          <ContentCard title="Final Project Approval" icon={CheckCircle2}>
            {workspace.final_project_status === "approved" ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Final supervisor approval recorded</p>
                  {isBusiness && marketplaceListing && <p className="mt-1 text-xs text-slate-700">Marketplace listing: {marketplaceListing.status.replaceAll("_", " ")} · KES {Number(marketplaceListing.price_kes).toLocaleString()}</p>}
                  {isBusiness && !marketplaceListing && <p className="mt-1 text-xs text-slate-700">Marketplace listing is being prepared for admin review.</p>}
                </div>
                {marketplaceListing?.status === "published" && <Link href="/projects" className="text-xs font-semibold text-[#087f8c] hover:underline">View marketplace</Link>}
              </div>
            ) : workspace.final_project_status === "pending_review" ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Completed project submitted. Waiting for final supervisor review.</p>
            ) : workspace.status !== "approved" ? (
              <p className="text-xs text-slate-700">Supervisor approval of the submitted chapters is required before final review.</p>
            ) : (
              <div className="space-y-3">
                {workspace.final_project_status === "changes_requested" && latestReview?.review_stage === "final_project" && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    <p className="font-semibold">Final changes requested</p>
                    <p className="mt-1">{latestReview.comment}</p>
                  </div>
                )}
                <p className="text-xs text-slate-700">{isProjectComplete ? "Your completed project is ready for a separate final supervisor review." : `${incompleteProjectSections} section(s) still need content before final review.`}</p>
                {isProjectComplete && <FinalProjectSubmissionForm workspaceId={workspaceId} isBusinessPlan={isBusiness} defaultPrice={workspace.marketplace_price_kes} />}
              </div>
            )}
          </ContentCard>
        )}
      </div>
    </AppShell>
  );
}
