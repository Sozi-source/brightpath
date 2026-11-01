import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import {
  approveProposal,
  approveCompletedProjectForMarketplace,
  requestFinalProjectChanges,
  requestProposalChanges,
  updateProposalTitle,
} from "@/app/supervisor/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { WholeDocumentReviewPanel } from "./WholeDocumentReviewPanel";
import { ManuscriptReader, type ManuscriptChapter } from "./ManuscriptReader";
import { getSectionReviewThreads } from "@/lib/studio/sectionReviewData";
import { SupervisorDecisionForm } from "./SupervisorDecisionForm";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  History,
  Lightbulb,
  ListTree,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview, UserProfile } from "@/types/database";

export const instant = false;

interface SupervisorWorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

function reviewAnchor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ReviewContentsLinks({ chapters }: { chapters: ManuscriptChapter[] }) {
  return <nav aria-label="Project chapters and sections" className="space-y-3">
    {chapters.map((chapter, index) => <section key={chapter.key}>
      <a href={`#chapter-${reviewAnchor(chapter.key)}`} className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs font-semibold leading-snug text-slate-800 hover:bg-indigo-50 hover:text-indigo-800">
        <span className="mt-0.5 font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
        <span>{chapter.title}</span>
      </a>
      <ul className="ml-4 space-y-0.5 border-l border-slate-200 pl-2.5">
        {chapter.sections.map((section) => <li key={section.key}>
          <a href={`#section-${reviewAnchor(section.key)}`} title={section.title} className="block rounded-md px-2 py-1.5 text-[11px] leading-snug text-slate-600 hover:bg-indigo-50 hover:text-indigo-800">{section.title}</a>
        </li>)}
      </ul>
    </section>)}
  </nav>;
}

export default async function SupervisorWorkspacePage({ params }: SupervisorWorkspacePageProps) {
  await connection();
  const { workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?portal=faculty&redirect=/supervisor/${workspaceId}`);
  }

  const db = getServerDbClient(supabase);

  // Verify supervisor or admin role
  const { data: profileData } = await db
    .from("profiles")
    .select("*, institutions:institution_id(name, code, ai_mode)")
    .eq("id", user.id)
    .single();

  const profile = profileData as unknown as UserProfile | null;

  if (profile?.role !== "supervisor" && profile?.role !== "admin") {
    redirect("/studio");
  }

  // Load candidate workspace
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
      final_project_status,
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
  const isBusiness = workspace.workspace_type === "business_plan";

  // Load sections
  const { data: sectionsData } = await db
    .from("workspace_sections")
    .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];

  // Load supervisor review history
  const { data: reviewsData } = await db
    .from("supervisor_reviews")
    .select("id, status, review_stage, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];
  const latestTopicChapterReview = reviews.find((review) => review.review_stage !== "final_project") || null;
  const sectionReviewThreads = await getSectionReviewThreads(db, workspaceId);

  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);

  const sectionsMap = new Map(sections.map((s) => [s.section_key, s]));

  // Group sections by chapter for continuous document rendering
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

  const totalWords = sections.reduce((sum, s) => {
    const w = s.current_text ? s.current_text.trim().split(/\s+/).filter(Boolean).length : 0;
    return sum + w;
  }, 0);

  const manuscriptChapters: ManuscriptChapter[] = chapterGroups.map((group) => {
    const chapterSections = group.defs.map((definition) => ({
      key: definition.key,
      title: definition.title,
      text: sectionsMap.get(definition.key)?.current_text || "",
      updatedAt: sectionsMap.get(definition.key)?.updated_at || "",
      threads: sectionReviewThreads.filter((thread) => thread.section_key === definition.key),
    }));
    const words = chapterSections.reduce((sum, section) => sum + section.text.trim().split(/\s+/).filter(Boolean).length, 0);
    return { key: group.chapterKey, title: group.chapterTitle, sections: chapterSections, words };
  });

  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isSubmitted = workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";
  const hasPlanContent = isBusiness && sections.some((section) => section.current_text.trim());
  const finalProjectIncomplete = templateDefs.filter((definition) => {
    const words = (sectionsMap.get(definition.key)?.current_text || "").trim().split(/\s+/).filter(Boolean).length;
    return words < (definition.minWords || 30);
  });
  const isFinalProjectReady = finalProjectIncomplete.length === 0;
  const isFinalReviewPending = workspace.final_project_status === "pending_review";
  const topicChapterReviewLocked = isFinalReviewPending || workspace.final_project_status === "approved";

  const levelLabel = workspace.level === "craft" ? "Certificate" : "Diploma";
  const typeLabel =
    workspace.workspace_type === "trade_fabrication"
      ? "Food Science Formulation"
      : workspace.workspace_type === "research_secondary"
      ? "Secondary Research"
      : "Business Plan";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Review: ${workspace.student?.full_name || "Candidate"}`}
      fullScreenWorkspace
    >
      <div className="flex min-h-full bg-[#f4f7fb]">
        <aside className="sticky top-0 hidden h-[calc(100vh-4rem)] w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-4 py-4">
            <Link href="/supervisor" className="text-[11px] font-semibold text-indigo-700 hover:underline">← Supervisor queue</Link>
            <div className="mt-3 flex items-center gap-2 text-slate-800">
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><ListTree className="h-4 w-4" /></span>
              <div><h2 className="text-sm font-semibold tracking-tight">Review outline</h2><p className="text-[10px] text-slate-500">Chapters and sections</p></div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs font-medium leading-snug text-slate-700">{workspace.title || "Untitled project"}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5">
            <ReviewContentsLinks chapters={manuscriptChapters} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6 p-3 sm:p-5 lg:p-6">
          <details className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-xs lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-900">
              <ListTree className="h-4 w-4 text-indigo-700" />Project contents
              <span className="ml-auto text-[10px] font-medium text-slate-500">{chapterGroups.length} chapters</span>
            </summary>
            <div className="mt-3 max-h-[55vh] overflow-y-auto border-t border-slate-100 pt-2">
              <ReviewContentsLinks chapters={manuscriptChapters} />
            </div>
          </details>
      <PageHeaderCard
        title={workspace.title || "Untitled Project"}
        subtitle={`${workspace.student?.full_name || "Candidate"} · ${workspace.course} (${levelLabel})`}
        breadcrumbs={[]}
        compact
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/supervisor"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <span
              className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                isSubmitted
                  ? "bg-indigo-50 text-indigo-800 border border-indigo-300"
                  : isApproved
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : isPending
                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {isSubmitted
                ? "Chapters Submitted"
                : isApproved
                ? "Topic Approved"
                : isPending
                ? "Topic Review Required"
                : "Topic Ideation"}
            </span>
          </div>
        }
      />

      {hasPlanContent && (
        <section aria-label="Download business plan" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">Download business plan</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/api/studio/${workspaceId}/export?format=pdf`} className="inline-flex items-center rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700">Download PDF</Link>
            <Link href={`/api/studio/${workspaceId}/export?format=docx`} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">Download Word</Link>
          </div>
        </section>
      )}

      <div className="space-y-6">
        {/* 1. Candidate Topic & Moderation Decision Card */}
        <ContentCard
          title="Project Topic & Moderation Decision"
          subtitle={`${rubric.scorecardName} • Approve topic to unlock Chapter 1 or review submitted chapters`}
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            {/* Submitted Topic Summary */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-900">
                    Proposed Project Title &amp; Problem Focus
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {isFinalReviewPending ? "Final Project Review" : isSubmitted ? "Chapter Review" : isApproved ? "Chapter Stage" : "Stage 1 Topic"}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                {workspace.title || "No project title submitted yet."}
              </h3>

              {workspace.problem_area ? (
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pt-2 border-t border-slate-200/80">
                  {workspace.problem_area}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No problem summary or initial objectives provided yet.
                </p>
              )}
            </div>

            {/* Moderation Action Forms */}
            {topicChapterReviewLocked ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Topic and chapter decisions are locked during final project review and after approval.
                {isFinalReviewPending && <a href="#final-project-approval" className="ml-1 font-semibold underline">Go to final review</a>}
              </div>
            ) : (isPending || isSubmitted) ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form 1: Approve Topic / Chapters */}
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>{isApproved ? "Approve Chapter Submission" : "Approve Project Topic"}</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  {isApproved
                    ? "Confirms supervisor review of the candidate's drafted chapters."
                    : "Approves the candidate's project topic and unlocks Chapter 1 for guided writing."}
                </p>

                <SupervisorDecisionForm
                  action={approveProposal}
                  successMessage={isApproved ? "Chapter submission approved." : "Project topic approved; Chapter 1 is unlocked."}
                  submitLabel={isApproved ? "Approve Submitted Chapters" : "Approve Topic & Unlock Chapter 1"}
                  pendingLabel="Saving approval..."
                  className="space-y-2"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    placeholder="Optional supervisor approval notes..."
                    className="w-full text-xs bg-white border border-emerald-300 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </SupervisorDecisionForm>
              </div>

              {/* Form 2: Request Revisions */}
              <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/40 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                  <AlertCircle className="h-4 w-4 text-rose-700" />
                  <span>Request Revisions</span>
                </div>
                <p className="text-[11px] text-rose-800 font-medium">
                  {isApproved
                    ? "Sends revision feedback to the candidate while keeping chapters unlocked."
                    : "Returns topic to candidate for refinement before unlocking chapters."}
                </p>

                <SupervisorDecisionForm
                  action={requestProposalChanges}
                  successMessage="Revision request sent to the candidate."
                  submitLabel="Request Revisions"
                  pendingLabel="Sending request..."
                  tone="danger"
                  className="space-y-2"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    required
                    placeholder="Specify required revisions..."
                    className="w-full text-xs bg-white border border-rose-300 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                </SupervisorDecisionForm>
              </div>
            </div> : (
              <div className={`rounded-lg border px-4 py-3 ${latestTopicChapterReview?.status === "changes_requested" ? "border-amber-200 bg-amber-50/70" : "border-emerald-200 bg-emerald-50/60"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${latestTopicChapterReview?.status === "changes_requested" ? "border-amber-200 bg-white text-amber-900" : "border-emerald-200 bg-white text-emerald-800"}`}>
                    {latestTopicChapterReview?.status === "changes_requested" ? "Revisions requested" : latestTopicChapterReview ? "Decision recorded" : isApproved ? "Approved" : "Awaiting candidate submission"}
                  </span>
                  {latestTopicChapterReview && <span className="text-[10px] text-slate-500">{new Date(latestTopicChapterReview.created_at).toLocaleString()}</span>}
                </div>
                {latestTopicChapterReview?.comment && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{latestTopicChapterReview.comment}</p>}
                {!latestTopicChapterReview && <p className="mt-1 text-xs text-slate-600">Supervisor actions will appear when a topic or chapter submission is ready for review.</p>}
              </div>
            )}

            {/* Title Refinement Form */}
            {isPending && !topicChapterReviewLocked && <div className="pt-3 border-t border-slate-200">
              <form action={updateProposalTitle} className="space-y-1.5">
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <label
                  htmlFor="supTitle"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Refine Official Project Title
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    id="supTitle"
                    name="title"
                    defaultValue={workspace.title || ""}
                    placeholder="Refined official project title..."
                    required
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shrink-0"
                  >
                    Update Title
                  </button>
                </div>
              </form>
            </div>}
          </div>
        </ContentCard>

        {isBusiness && <WholeDocumentReviewPanel workspaceId={workspaceId} />}

        <div id="final-project-approval" className="scroll-mt-20">
        <ContentCard
          title="Final Project Approval"
          subtitle="Separate from topic and chapter approval"
          icon={ShieldCheck}
          headerRight={<span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${workspace.final_project_status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : isFinalReviewPending ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>{workspace.final_project_status.replaceAll("_", " ")}</span>}
        >
          {isFinalReviewPending ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-700">All {templateDefs.length} required sections meet their minimums. Review the manuscript and record a final decision.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <SupervisorDecisionForm
                  action={approveCompletedProjectForMarketplace}
                  successMessage="Completed project approved and queued for marketplace review."
                  submitLabel="Approve completed project"
                  pendingLabel="Saving final approval..."
                  className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <label className="grid gap-1 text-xs font-medium text-slate-700">Approval note<input name="comment" defaultValue="Completed project reviewed and approved." className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs" /></label>
                </SupervisorDecisionForm>
                <SupervisorDecisionForm
                  action={requestFinalProjectChanges}
                  successMessage="Final review changes sent to the candidate."
                  submitLabel="Request final changes"
                  pendingLabel="Sending request..."
                  tone="danger"
                  className="space-y-2 rounded-lg border border-rose-200 bg-rose-50/50 p-3"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <label className="grid gap-1 text-xs font-medium text-slate-700">Required changes<textarea name="comment" required rows={2} className="rounded-lg border border-slate-300 bg-white p-2 text-xs" /></label>
                </SupervisorDecisionForm>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-700">
              {workspace.final_project_status === "approved"
                ? isBusiness ? "Final approval recorded. The business plan is in the admin marketplace review queue." : "Final approval recorded."
                : workspace.final_project_status === "changes_requested"
                  ? "Final changes were requested. The student can revise and resubmit after topic or chapter approval."
                  : !isApproved
                    ? "Approve the project topic and submitted chapters before final project review."
                    : !isFinalProjectReady
                      ? `Waiting for the student to complete ${finalProjectIncomplete.length} section(s) before final review.`
                      : "The completed project is ready for the student to submit for final review."}
            </p>
          )}
        </ContentCard>
        </div>

        <section id="manuscript" className="scroll-mt-20" aria-label="Project manuscript">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">Project Manuscript</h2>
              <p className="mt-0.5 text-xs text-slate-600">Browse chapters and sections</p>
            </div>
            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-indigo-800">{totalWords.toLocaleString()} words</span>
          </div>
          <ManuscriptReader
            workspaceId={workspaceId}
            title={workspace.title || "Untitled Project"}
            institution={workspace.institution?.name || "Kenya National Examinations Council (KNEC)"}
            candidate={workspace.student?.full_name || "Candidate"}
            admissionNumber={workspace.student?.admission_number || "No Admission No"}
            course={workspace.course}
            level={levelLabel}
            planType={typeLabel}
            totalWords={totalWords}
            chapters={manuscriptChapters}
            viewerRole={profile.role}
            canReview={(profile.role === "admin" || workspace.supervisor_id === user.id) && workspace.status !== "closed" && workspace.final_project_status !== "approved"}
            canReply={workspace.status !== "closed" && workspace.final_project_status !== "approved"}
          />
        </section>

        {/* 3. Supervisor Review History Log */}
        {reviews.length > 0 && (
          <ContentCard
            title="Moderation History"
            subtitle="Chronological log of supervisor reviews"
            icon={History}
          >
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {rev.review_stage === "final_project" ? "Final project" : "Topic / chapters"}
                      </span>
                      <span className={`font-semibold capitalize ${rev.status === "approved" ? "text-emerald-800" : "text-rose-800"}`}>
                        {rev.status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(rev.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </ContentCard>
        )}
      </div>
      </div>
      </div>
    </AppShell>
  );
}
