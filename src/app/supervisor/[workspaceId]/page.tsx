import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { resolveWorkspaceAiMode } from "@/app/studio/actions";
import {
  approveProposal,
  requestProposalChanges,
  updateProposalTitle,
  reviewChapterSection,
  submitRubricGrade,
  signProjectLogEntry,
} from "@/app/supervisor/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Activity,
  History,
  Award,
  FileDown,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import type {
  ProjectWorkspace,
  WorkspaceSection,
  SupervisorReview,
  ProjectLogEntry,
  UserProfile,
} from "@/types/database";

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

  // Authorization: must be assigned supervisor or admin
  if (profile.role !== "admin" && workspace.supervisor_id !== user.id) {
    redirect("/supervisor");
  }

  // Load sections, review history, and Annex 12 log entries in parallel
  const [{ data: sectionsData }, { data: reviewsData }, { data: logsData }, effectiveAiMode] =
    await Promise.all([
      db
        .from("workspace_sections")
        .select(
          "id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true }),
      db
        .from("supervisor_reviews")
        .select("id, workspace_id, section_id, supervisor_id, status, comment, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      db
        .from("project_log_entries")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true }),
      resolveWorkspaceAiMode(db, workspace.institution_id, workspace.student_id),
    ]);

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];
  const reviews: SupervisorReview[] = (reviewsData as SupervisorReview[]) || [];
  const logs: ProjectLogEntry[] = (logsData as ProjectLogEntry[]) || [];

  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);
  const rubricCategories =
    (KNEC_RUBRICS[workspace.workspace_type]?.[workspace.level] ||
      KNEC_RUBRICS.trade_fabrication.diploma).categories;

  const authorship = computeWorkspaceAuthorship(sections, templateDefs.length);
  const savedScorecard = extractLatestRubricScorecard(reviews);
  const aiModeInfo = formatAiModeLabel(effectiveAiMode);

  // Map latest review by section_id
  const latestSectionReviewMap = new Map<string, SupervisorReview>();
  for (const rev of reviews) {
    if (rev.section_id && !latestSectionReviewMap.has(rev.section_id)) {
      latestSectionReviewMap.set(rev.section_id, rev);
    }
  }

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
  const isSubmitted = workspace.status === "submitted";

  const typeLabel =
    workspace.workspace_type === "trade_fabrication"
      ? "Trade Fabrication"
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
        subtitle={`${workspace.student?.full_name || "Candidate"} • ${workspace.course} (${workspace.level.toUpperCase()})`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Supervisor", href: "/supervisor" },
          { label: workspace.student?.full_name || "Review", active: true },
        ]}
        metadata={[
          {
            label: "Candidate",
            value: `${workspace.student?.full_name || "Student"} (${
              workspace.student?.admission_number || "—"
            })`,
          },
          { label: "Track", value: `${workspace.level.toUpperCase()} • ${typeLabel}` },
          {
            label: "Institution",
            value: workspace.institution?.name || "Accredited TVET Center",
          },
          {
            label: "AI Governance",
            value: aiModeInfo.label,
          },
          {
            label: "Status",
            value: isSubmitted
              ? "Submitted for Grading"
              : isApproved
              ? "Approved"
              : isPending
              ? "Pending Review"
              : "Drafting",
          },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/supervisor"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>

            <a
              href={`/api/studio/${workspaceId}/export?doc=report`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <FileDown className="h-4 w-4" />
              <span>KNEC Report (.doc)</span>
            </a>

            <a
              href={`/api/studio/${workspaceId}/export?doc=annex12`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-xs transition-colors"
            >
              <ClipboardCheck className="h-4 w-4 text-indigo-600" />
              <span>Annex 12 (.doc)</span>
            </a>
          </div>
        }
      />

      {/* KPI & Authorship Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Authorship Originality"
          value={`${authorship.humanRatioPercent}%`}
          subtext={authorship.tierLabel}
          icon={ShieldCheck}
          color={
            authorship.tier === "high_originality"
              ? "emerald"
              : authorship.tier === "balanced_coaching"
              ? "amber"
              : "rose"
          }
        />
        <StatCard
          label="Total Word Count"
          value={authorship.totalWords.toLocaleString()}
          subtext={`${authorship.sectionsCompleted}/${authorship.totalSections} sections drafted`}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          label="Chapters Cleared"
          value={`${authorship.sectionsFinal}/${projectDefs.length}`}
          subtext={`${authorship.sectionsReviewed} total reviewed`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="KNEC Rubric Grade"
          value={
            savedScorecard
              ? `${savedScorecard.totalAwarded}/${savedScorecard.maxMarks}`
              : "Ungraded"
          }
          subtext={`AI Policy: ${aiModeInfo.label}`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Authorship Integrity Visual Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-900">
              Authorship Integrity Badge: {authorship.tierLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-700 font-semibold">
              Candidate Typed: {authorship.humanRatioPercent}%
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-700 font-semibold">
              AI Polish Accepted: {authorship.aiRatioPercent}%
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Mode: {aiModeInfo.label}
            </span>
          </div>
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
      </div>

      <div className="space-y-6">
        {/* Phase 1: Proposal Moderation Section */}
        <ContentCard
          title="Phase 1: Proposal Submission"
          subtitle={rubric.scorecardName}
          icon={FileText}
          headerRight={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {proposalDefs.length} Sections
            </span>
          }
        >
          <div className="space-y-4">
            {proposalDefs.map((def) => {
              const s = proposalSectionsMap.get(def.key);
              const secAuth = authorship.bySection.get(def.key);
              const wordCount = secAuth?.wordCount ?? 0;

              return (
                <div
                  key={def.key}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-700" />
                      <h4 className="text-xs font-semibold text-slate-900">{def.title}</h4>
                      {def.rubricMarks !== undefined && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {def.rubricMarks} Marks
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-500">{wordCount} words</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {secAuth?.humanRatioPercent ?? 100}% Human
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[3rem]">
                    {s?.current_text && s.current_text.trim().length > 0 ? (
                      s.current_text
                    ) : (
                      <span className="text-slate-400 italic">No candidate text entered yet.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ContentCard>

        {/* Proposal Moderation Decision Card */}
        <ContentCard
          title="Proposal Moderation Decision"
          subtitle="Approve proposal to unlock project chapters or return for candidate revision"
          icon={ShieldCheck}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form 1: Approve Proposal */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>Approve Proposal</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Clears proposal title and methodology, unlocking Chapters 1–5 for drafting.
              </p>

              <form action={approveProposal} className="space-y-2">
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <textarea
                  name="comment"
                  rows={2}
                  placeholder="Optional approval notes..."
                  className="w-full text-xs bg-white border border-emerald-300 rounded-md p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-md text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                >
                  Approve Proposal
                </button>
              </form>
            </div>

            {/* Form 2: Request Changes */}
            <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/40 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <AlertCircle className="h-4 w-4 text-rose-700" />
                <span>Request Revisions</span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">
                Returns proposal to candidate with feedback.
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
          <div className="mt-4 pt-3.5 border-t border-slate-200">
            <form action={updateProposalTitle} className="space-y-1.5">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <label htmlFor="supTitle" className="block text-xs font-semibold text-slate-800">
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
        </ContentCard>

        {/* Phase 2: Chapter-by-Chapter Inspection & Inline Supervisor Review */}
        <ContentCard
          title="Phase 2: Chapter-Level Review"
          subtitle="Inspect candidate chapter drafts, verify authorship originality, and record per-section decisions"
          icon={Activity}
          headerRight={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {authorship.sectionsFinal}/{projectDefs.length} Finalized
            </span>
          }
        >
          <div className="space-y-4">
            {projectDefs.map((def) => {
              const s = projectSectionsMap.get(def.key);
              const secAuth = authorship.bySection.get(def.key);
              const wordCount = secAuth?.wordCount ?? 0;
              const targetWords = def.minWords || 100;
              const latestSecReview = s?.id ? latestSectionReviewMap.get(s.id) : undefined;

              const statusBadge =
                s?.status === "final"
                  ? {
                      label: "Cleared / Final",
                      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    }
                  : latestSecReview?.status === "changes_requested"
                  ? {
                      label: "Revisions Requested",
                      cls: "bg-rose-50 text-rose-700 border-rose-200",
                    }
                  : s?.status === "reviewed"
                  ? {
                      label: "Reviewed",
                      cls: "bg-blue-50 text-blue-700 border-blue-200",
                    }
                  : wordCount > 0
                  ? {
                      label: "Draft Ready",
                      cls: "bg-amber-50 text-amber-800 border-amber-200",
                    }
                  : {
                      label: "Empty",
                      cls: "bg-slate-100 text-slate-600 border-slate-200",
                    };

              return (
                <div
                  key={def.key}
                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{def.title}</span>
                      {def.rubricMarks !== undefined && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {def.rubricMarks} Marks
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadge.cls}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span
                        className={
                          wordCount >= targetWords ? "text-emerald-700 font-semibold" : "text-slate-500"
                        }
                      >
                        {wordCount} / {targetWords} words
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          (secAuth?.humanRatioPercent ?? 100) >= 70
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {secAuth?.humanRatioPercent ?? 100}% Human / {secAuth?.aiRatioPercent ?? 0}% AI
                      </span>
                    </div>
                  </div>

                  {/* Candidate Chapter Content */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {s?.current_text && s.current_text.trim().length > 0 ? (
                      s.current_text
                    ) : (
                      <span className="text-slate-400 italic">
                        Candidate has not drafted this section yet.
                      </span>
                    )}
                  </div>

                  {/* Latest Section Review Note */}
                  {latestSecReview && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-indigo-950">Latest Feedback: </span>
                        <span>&ldquo;{latestSecReview.comment}&rdquo;</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(latestSecReview.created_at).toLocaleDateString("en-KE")}
                      </span>
                    </div>
                  )}

                  {/* Per-Chapter Review Form */}
                  <form
                    action={reviewChapterSection}
                    className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                  >
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="sectionKey" value={def.key} />
                    <input type="hidden" name="sectionTitle" value={def.title} />

                    <select
                      name="decision"
                      defaultValue={s?.status === "final" ? "approved" : "comment"}
                      aria-label={`Review decision for ${def.title}`}
                      className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:w-48 shrink-0"
                    >
                      <option value="approved">Approve &amp; Mark Final</option>
                      <option value="comment">Record Supervision Note</option>
                      <option value="changes_requested">Request Revisions</option>
                    </select>

                    <input
                      type="text"
                      name="comment"
                      required
                      placeholder={`Enter supervisor review feedback for ${def.title}...`}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />

                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Save Chapter Review
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </ContentCard>

        {/* Phase 3: Official KNEC 100-Mark Rubric Grading & Final Sign-Off */}
        <ContentCard
          title="Phase 3: KNEC Rubric Grading & Sign-Off"
          subtitle={`${rubric.scorecardName} — Official 100-mark assessment`}
          icon={Award}
          headerRight={
            savedScorecard ? (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Recorded Score: {savedScorecard.totalAwarded} / {savedScorecard.maxMarks}
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Awaiting Final Grading
              </span>
            )
          }
        >
          <form action={submitRubricGrade} className="space-y-4">
            <input type="hidden" name="workspaceId" value={workspaceId} />

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">KNEC Assessment Criterion</th>
                    <th className="py-2.5 px-3 w-28 text-center">Max Marks</th>
                    <th className="py-2.5 px-3 w-36 text-center">Awarded Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rubricCategories.map((cat) => (
                    <tr key={cat.key} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{cat.label}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {cat.maxMarks}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          name={`score_${cat.key}`}
                          min={0}
                          max={cat.maxMarks}
                          step="0.5"
                          required
                          defaultValue={savedScorecard?.scores?.[cat.key] ?? cat.maxMarks}
                          aria-label={`Marks for ${cat.label}`}
                          className="w-24 text-center font-mono text-xs font-semibold bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-1">
                <label
                  htmlFor="examinerSummary"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Examiner Remarks &amp; Defence Summary
                </label>
                <input
                  id="examinerSummary"
                  name="examinerSummary"
                  type="text"
                  required
                  defaultValue={
                    savedScorecard?.examinerSummary ||
                    "Candidate demonstrated strong mastery of research methodology and KNEC reporting standards."
                  }
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="finalizeSignoff"
                    defaultChecked
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>Finalize &amp; countersign Annex 12 logbook</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Record Official Rubric Grade
                </button>
              </div>
            </div>
          </form>
        </ContentCard>

        {/* Annex 12 Supervision Logbook Verification */}
        <ContentCard
          title="Annex 12 Supervision Logbook"
          subtitle="Countersign candidate project milestones for examination submission"
          icon={ClipboardCheck}
          headerRight={
            <a
              href={`/api/studio/${workspaceId}/export?doc=annex12`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Download Annex 12 (.doc)</span>
            </a>
          }
        >
          <div className="space-y-2.5">
            {logs.map((log, idx) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      #{idx + 1} • {new Date(log.entry_date || log.created_at).toLocaleDateString("en-KE")}
                    </span>
                    {log.supervisor_signed_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Countersigned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>Awaiting Sign-Off</span>
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900">{log.activity}</p>
                  {log.supervisor_comment && (
                    <p className="text-[11px] text-slate-600">
                      Supervisor Note: {log.supervisor_comment}
                    </p>
                  )}
                </div>

                {!log.supervisor_signed_at && (
                  <form action={signProjectLogEntry} className="flex items-center gap-2 shrink-0">
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="logEntryId" value={log.id} />
                    <input
                      type="text"
                      name="supervisorComment"
                      placeholder="Optional sign-off remark..."
                      className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 w-44"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    >
                      Countersign
                    </button>
                  </form>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-slate-500 py-3 text-center">
                No Annex 12 log entries recorded yet.
              </p>
            )}
          </div>
        </ContentCard>

        {/* Supervisor Review History Log */}
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
                          : rev.status === "changes_requested"
                          ? "text-rose-800"
                          : "text-indigo-800"
                      }`}
                    >
                      {rev.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(rev.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    &ldquo;{cleanDisplayReviewComment(rev.comment)}&rdquo;
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
