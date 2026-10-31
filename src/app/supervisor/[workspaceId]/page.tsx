import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections, type SectionDefinition } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import {
  approveProposal,
  requestProposalChanges,
  updateProposalTitle,
} from "@/app/supervisor/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { WholeDocumentReviewPanel } from "./WholeDocumentReviewPanel";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  History,
  Lightbulb,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview, UserProfile } from "@/types/database";

export const instant = false;

interface SupervisorWorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
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
    .select("id, status, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];

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

  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isSubmitted = workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";

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
    >
      <PageHeaderCard
        title={workspace.title || "Untitled Project"}
        subtitle={`${workspace.student?.full_name || "Candidate"} • ${workspace.course} (${levelLabel})`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Supervisor", href: "/supervisor" },
          { label: workspace.student?.full_name || "Review", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: `${workspace.student?.full_name || "Student"} (${workspace.student?.admission_number || "—"})` },
          { label: "Track", value: `${levelLabel} • ${typeLabel}` },
          { label: "Total Words", value: `${totalWords.toLocaleString()} words` },
          {
            label: "Status",
            value: isSubmitted
              ? "Chapters Submitted"
              : isApproved
              ? "Topic Approved"
              : isPending
              ? "Pending Topic Approval"
              : "Topic Formulation",
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
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
                  Stage 1 Topic
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <form action={approveProposal} className="space-y-2">
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    placeholder="Optional supervisor approval notes..."
                    className="w-full text-xs bg-white border border-emerald-300 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-md text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                  >
                    {isApproved ? "Approve Submitted Chapters" : "Approve Topic & Unlock Chapter 1"}
                  </button>
                </form>
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

                <form action={requestProposalChanges} className="space-y-2">
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <textarea
                    name="comment"
                    rows={2}
                    required
                    placeholder="Specify required revisions..."
                    className="w-full text-xs bg-white border border-rose-300 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-md text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition-colors cursor-pointer"
                  >
                    Request Revisions
                  </button>
                </form>
              </div>
            </div>

            {/* Title Refinement Form */}
            <div className="pt-3 border-t border-slate-200">
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
            </div>
          </div>
        </ContentCard>

        {isBusiness && <WholeDocumentReviewPanel workspaceId={workspaceId} />}

        {/* 2. Continuous Project Document View (Single Continuous Sheet — Not In Pieces) */}
        <ContentCard
          title="Continuous Project Document"
          subtitle="Full manuscript view flowing continuously across all KNEC chapters and subsections"
          icon={FileText}
          headerRight={
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalWords.toLocaleString()} Total Words
            </span>
          }
        >
          <div className="space-y-4">
            {/* Quick Chapter Anchor Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200">
              {chapterGroups.map((group) => {
                const chapterWords = group.defs.reduce((acc, d) => {
                  const sec = sectionsMap.get(d.key);
                  const w = sec?.current_text
                    ? sec.current_text.trim().split(/\s+/).filter(Boolean).length
                    : 0;
                  return acc + w;
                }, 0);

                return (
                  <a
                    key={group.chapterKey}
                    href={`#doc-${group.chapterKey}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                      chapterWords > 0
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{group.chapterTitle.split(":")[0]}</span>
                    <span className="ml-1.5 text-[10px] font-mono opacity-80">
                      ({chapterWords}w)
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Single Continuous Academic Document Sheet */}
            <article className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
              {/* Document Title Block */}
              <header className="text-center border-b border-slate-200 pb-6 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                  {workspace.institution?.name || "Kenya National Examinations Council (KNEC)"}
                </p>
                <h1 className="text-base sm:text-xl font-semibold text-slate-900 uppercase tracking-tight leading-snug">
                  {workspace.title || "Untitled Project"}
                </h1>
                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p className="font-semibold text-slate-800">
                    {workspace.student?.full_name || "Candidate"} ({workspace.student?.admission_number || "No Admission No"})
                  </p>
                  <p>
                    {workspace.course} • {levelLabel} Level ({typeLabel})
                  </p>
                </div>
              </header>

              {/* Continuous Chapters Flow */}
              <div className="space-y-10 divide-y divide-slate-200/80">
                {chapterGroups.map((group) => {
                  const chapterWords = group.defs.reduce((acc, d) => {
                    const sec = sectionsMap.get(d.key);
                    const w = sec?.current_text
                      ? sec.current_text.trim().split(/\s+/).filter(Boolean).length
                      : 0;
                    return acc + w;
                  }, 0);

                  return (
                    <section
                      key={group.chapterKey}
                      id={`doc-${group.chapterKey}`}
                      className="pt-8 first:pt-0 space-y-5 scroll-mt-20"
                    >
                      <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
                        <h2 className="text-sm sm:text-base font-semibold text-slate-900 uppercase tracking-wide">
                          {group.chapterTitle}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {chapterWords} words
                        </span>
                      </div>

                      <div className="space-y-6">
                        {group.defs.map((def) => {
                          const s = sectionsMap.get(def.key);
                          const hasContent = Boolean(
                            s?.current_text && s.current_text.trim().length > 0
                          );

                          return (
                            <div key={def.key} className="space-y-1.5">
                              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                                {def.title}
                              </h3>
                              {hasContent ? (
                                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                  {s?.current_text}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">
                                  [Not yet drafted by candidate]
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          </div>
        </ContentCard>

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
                    <span
                      className={`font-semibold capitalize ${
                        rev.status === "approved"
                          ? "text-emerald-800"
                          : "text-rose-800"
                      }`}
                    >
                      {rev.status.replace("_", " ")}
                    </span>
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
    </AppShell>
  );
}
