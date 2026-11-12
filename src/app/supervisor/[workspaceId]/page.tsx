import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import {

  approveCompletedProjectForMarketplace,
  requestFinalProjectChanges,


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
      business_plan_specs,
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
  const isInstitutional = isBusiness && Boolean((workspace.business_plan_specs as { isInstitutional?: boolean } | null)?.isInstitutional);

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

  const isApproved = workspace.final_project_status === "approved";
  const isReviewPending = workspace.final_project_status === "pending_review";


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
                isApproved
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : isReviewPending
                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                  : workspace.final_project_status === "changes_requested"
                  ? "bg-rose-50 text-rose-800 border border-rose-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {isApproved
                ? (isInstitutional ? "Approved for Internal Use" : "Approved & Published")
                : isReviewPending
                ? "Review Required"
                : workspace.final_project_status === "changes_requested"
                ? "Changes Requested"
                : "Drafting"}
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
        {isBusiness && <WholeDocumentReviewPanel workspaceId={workspaceId} />}

        <div id="supervisor-moderation" className="scroll-mt-20">
        <ContentCard
          title="Supervisor Review & Moderation"
          subtitle={`${rubric.scorecardName} • Review completed manuscript and record decision`}
          icon={ShieldCheck}
          headerRight={
            <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
              isApproved
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : isReviewPending
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : workspace.final_project_status === "changes_requested"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}>
              {isApproved
                ? "Approved & Published"
                : isReviewPending
                ? "Review Required"
                : workspace.final_project_status === "changes_requested"
                ? "Changes Requested"
                : "Drafting"}
            </span>
          }
        >
          {isApproved ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
              <div>
                <p className="text-sm font-semibold text-emerald-900">{isInstitutional ? "Institutional Plan Approved" : "Project Approved &amp; Published Live to Marketplace"}</p>
                <p className="mt-1 text-xs text-slate-600">{isInstitutional ? "Approved for internal ICMHS management use. Marketplace publication is blocked." : "This business plan meets all KNEC standards and is published live in the marketplace catalog."}</p>
              </div>
              {isInstitutional ? (
                <Link href={`/api/studio/${workspaceId}/export?format=docx`} className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors">
                  Download Word
                </Link>
              ) : (
                <Link href="/projects" className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors">
                  View in Marketplace
                </Link>
              )}
            </div>
          ) : isReviewPending || (isFinalProjectReady && (profile.role === "admin" || workspace.supervisor_id === user.id)) ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-700">All {templateDefs.length} required sections meet their minimums. Review the manuscript below and record your moderation decision.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <SupervisorDecisionForm
                  action={approveCompletedProjectForMarketplace}
                  successMessage={isInstitutional ? "Institutional plan approved for internal use." : "Completed project approved and published live to marketplace."}
                  submitLabel={isInstitutional ? "Approve for internal use" : "Approve & publish to marketplace"}
                  pendingLabel="Approving & publishing..."
                  className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <label className="grid gap-1 text-xs font-medium text-slate-700">
                    Approval note
                    <input name="comment" defaultValue="Completed project reviewed and approved." className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs" />
                  </label>
                </SupervisorDecisionForm>
                <SupervisorDecisionForm
                  action={requestFinalProjectChanges}
                  successMessage="Final review changes sent to the candidate."
                  submitLabel="Request changes"
                  pendingLabel="Sending request..."
                  tone="danger"
                  className="space-y-2 rounded-lg border border-rose-200 bg-rose-50/50 p-3"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <label className="grid gap-1 text-xs font-medium text-slate-700">
                    Required changes
                    <textarea name="comment" required rows={2} placeholder="Specify required revisions..." className="rounded-lg border border-slate-300 bg-white p-2 text-xs" />
                  </label>
                </SupervisorDecisionForm>
              </div>
            </div>
          ) : workspace.final_project_status === "changes_requested" ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 space-y-1">
              <p className="font-semibold">Revisions Requested</p>
              <p className="text-slate-700">{reviews[0]?.comment || "Candidate has been notified to revise the manuscript."}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">Drafting in Progress</p>
              <p className="mt-1 text-slate-600">Candidate has completed {templateDefs.length - finalProjectIncomplete.length} of {templateDefs.length} required sections. Full approval unlocks when every section meets its minimum.</p>
            </div>
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
