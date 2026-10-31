import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import {
  submitProposalForApproval,
  submitChaptersForReview,
} from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { DeleteDraftButton } from "../DeleteDraftButton";
import { BusinessPlanBuilderModal } from "./BusinessPlanBuilderModal";
import { MarketplacePublishForm } from "./MarketplacePublishForm";
import {
  CheckCircle2,
  Clock,
  Lock,
  Send,
  ShieldAlert,
  ChevronRight,
  Lightbulb,
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
      business_plan_specs,
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
  const isPlanComplete = isBusiness && templateDefs.every((definition) => {
    const text = sectionsMap.get(definition.key)?.current_text || "";
    return text.trim().split(/\s+/).filter(Boolean).length >= (definition.minWords || 30);
  });
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
  const firstIncompleteChapterKey = chapterGroups.find((group) =>
    group.defs.some((def) => {
      const text = sectionsMap.get(def.key)?.current_text || "";
      return text.trim().split(/\s+/).filter(Boolean).length < (def.minWords || 30);
    })
  )?.chapterKey;

  const levelLabel = workspace.level === "craft" ? "Certificate" : "Diploma";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={workspace.title || workspace.course}
    >
      {/* 1. Header Card */}
      <PageHeaderCard
        title={isBusiness ? "Business Plan" : "Project Workspace"}
        subtitle={`${workspace.course} • ${levelLabel} Level`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Overview", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: workspace.student?.full_name || "Student" },
          { label: "Admission No", value: workspace.student?.admission_number || "Unset" },
          { label: "Qualification", value: levelLabel },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isBusiness && workspace.student_id === user.id && (
              <BusinessPlanBuilderModal
                workspaceId={workspaceId}
                defaultCandidateName={workspace.student?.full_name || ""}
                defaultAdmissionNumber={workspace.student?.admission_number || ""}
                defaultInstitutionName={workspace.institution?.name || ""}
                defaultSupervisorName={workspace.supervisor?.full_name || ""}
                defaultCourse={workspace.course}
                defaultLevel={workspace.level}
                initialSpecs={workspace.business_plan_specs as Partial<BusinessPlanSpecs> | undefined}
              />
            )}
            {hasPlanContent && (
              <Link href={`/api/studio/${workspaceId}/export`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
                <span>Download Word</span>
              </Link>
            )}
            {!isApproved && workspace.student_id === user.id && (
              <DeleteDraftButton
                workspaceId={workspaceId}
                title={workspace.title}
                redirectAfter
              />
            )}
          </div>
        }
      />

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

      <div className="space-y-4">
          {/* Stage 1: Project Topic & Approval / Business Plan Concept */}
          <ContentCard
            title={isBusiness ? "Project setup" : "Project topic"}
            icon={Lightbulb}
            headerRight={
              isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isBusiness ? "Plan Approved" : "Topic Approved"}</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>{isBusiness ? "Pending Plan Approval" : "Pending Topic Approval"}</span>
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
                    <span>{isBusiness ? "Submit Plan for Approval" : "Submit Topic for Approval"}</span>
                  </button>
                </form>
              )
            }
          >
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-700">
                    {isBusiness ? "Approved Business Plan Title" : "Official Project Title"}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {workspace.title ||
                      (isBusiness
                        ? "No business plan concept formulated yet."
                        : "No project topic formulated yet.")}
                  </h4>
                </div>

                <Link
                  href={`/studio/${workspaceId}/problem`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs transition-colors shrink-0 self-start"
                >
                  <span>
                    {workspace.title
                      ? isBusiness
                        ? "Edit Plan Concept"
                        : "Edit Topic"
                      : isBusiness
                      ? "Formulate Concept"
                      : "Formulate Topic"}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </Link>
              </div>

              {workspace.problem_area && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                    {isBusiness ? "Business Concept & Enterprise Profile" : "Problem Focus & Initial Objectives"}
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
            title="Write your project"
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
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                <p className="text-xs text-slate-700">
                  Chapters unlock after your {isBusiness ? "plan concept" : "topic"} is approved.
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
                    <details
                      key={group.chapterKey}
                      open={group.chapterKey === firstIncompleteChapterKey}
                      className="group rounded-lg border border-slate-200 bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                        <span className="text-xs font-semibold text-slate-900">{group.chapterTitle}</span>
                        <span className="flex items-center gap-2 text-[11px] text-slate-600">
                          {completedCount}/{group.defs.length} done
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                        </span>
                      </summary>

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
                    </details>
                  );
                })}
              </div>
            )}
          </ContentCard>

          {isBusiness && workspace.student_id === user.id && isPlanComplete && (
            <ContentCard title="Marketplace listing" icon={CheckCircle2}>
              {marketplaceListing ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {marketplaceListing.status === "published" ? "Published" : marketplaceListing.status === "rejected" ? "Rejected" : "In review"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">KES {Number(marketplaceListing.price_kes).toLocaleString()} · Business Plan</p>
                  </div>
                  {marketplaceListing.status === "published" && <Link href="/projects" className="text-xs font-semibold text-indigo-700 hover:text-indigo-900">View marketplace</Link>}
                </div>
              ) : workspace.status === "approved" ? (
                <MarketplacePublishForm workspaceId={workspaceId} />
              ) : (
                <p className="text-xs text-slate-600">Supervisor approval is required before listing.</p>
              )}
            </ContentCard>
          )}


      </div>
    </AppShell>
  );
}
