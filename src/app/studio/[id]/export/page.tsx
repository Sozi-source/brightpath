import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { KNEC_RUBRICS } from "@/lib/studio/rubrics";
import { compileReferenceList } from "@/lib/studio/sources";
import {
  computeWorkspaceAuthorship,
  extractLatestRubricScorecard,
} from "@/lib/studio/authorship";
import { addProjectLogEntry } from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import { ExportPrintControls } from "./ExportPrintControls";
import {
  FileText,
  ClipboardCheck,
  Award,
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  Clock,
  PlusCircle,
} from "lucide-react";
import type {
  ProjectWorkspace,
  WorkspaceSection,
  ProjectLogEntry,
  SupervisorReview,
  UserProfile,
} from "@/types/database";

export const instant = false;

interface ExportPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceExportPage({ params }: ExportPageProps) {
  await connection();
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/export`);
  }

  const db = getServerDbClient(supabase);

  const { data: profileData } = await db
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;

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
      supervisor:supervisor_id(full_name),
      institution:institution_id(name, code)
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspaceData) {
    notFound();
  }

  const workspace = workspaceData as unknown as ProjectWorkspace;

  const isOwner = workspace.student_id === user.id;
  const isSupervisorOrAdmin =
    workspace.supervisor_id === user.id ||
    profile?.role === "supervisor" ||
    profile?.role === "admin";

  if (!isOwner && !isSupervisorOrAdmin) {
    redirect("/studio");
  }

  const [{ data: sectionsData }, { data: logsData }, { data: reviewsData }] = await Promise.all([
    db
      .from("workspace_sections")
      .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    db
      .from("project_log_entries")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }),
    db
      .from("supervisor_reviews")
      .select("id, workspace_id, section_id, supervisor_id, status, comment, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
  ]);

  const sections = (sectionsData as WorkspaceSection[]) || [];
  const logs = (logsData as ProjectLogEntry[]) || [];
  const reviews = (reviewsData as SupervisorReview[]) || [];

  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const sectionMap = new Map(sections.map((s) => [s.section_key, s]));
  const authorship = computeWorkspaceAuthorship(sections, templateDefs.length);
  const savedScorecard = extractLatestRubricScorecard(reviews);
  const rubricDef =
    KNEC_RUBRICS[workspace.workspace_type]?.[workspace.level] ||
    KNEC_RUBRICS.trade_fabrication.diploma;

  const refSection = sectionMap.get("references");
  let compiledRefsText = refSection?.current_text?.trim() || "";
  if (!compiledRefsText) {
    const { references } = compileReferenceList(
      sections
        .filter((s) => s.section_key !== "references")
        .map((s) => s.current_text || "")
    );
    compiledRefsText = references.join("\n\n");
  }

  const signedLogsCount = logs.filter((l) => Boolean(l.supervisor_signed_at)).length;

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Export: ${workspace.title || workspace.course}`}
    >
      <div className="print:hidden space-y-6">
        <PageHeaderCard
          title="KNEC Examination Export"
          subtitle="Download compiled project dossier and signed Annex 12 logbook"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Project Studio", href: "/studio" },
            { label: workspace.title || "Workspace", href: `/studio/${workspaceId}` },
            { label: "Report & Annex 12", active: true },
          ]}
          metadata={[
            { label: "Candidate", value: workspace.student?.full_name || "Student" },
            { label: "Admission No", value: workspace.student?.admission_number || "Unset" },
            { label: "Supervisor", value: workspace.supervisor?.full_name || "Unassigned" },
            { label: "Status", value: workspace.status.replace("_", " ").toUpperCase() },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={isOwner ? `/studio/${workspaceId}` : `/supervisor/${workspaceId}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
              <ExportPrintControls workspaceId={workspaceId} />
            </div>
          }
        />

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Word Count"
            value={authorship.totalWords.toLocaleString()}
            subtext={`${authorship.sectionsCompleted}/${authorship.totalSections} sections drafted`}
            icon={FileText}
            color="indigo"
          />
          <StatCard
            label="Candidate Originality"
            value={`${authorship.humanRatioPercent}%`}
            subtext={authorship.tierLabel}
            icon={ShieldCheck}
            color={authorship.humanRatioPercent >= 70 ? "emerald" : "amber"}
          />
          <StatCard
            label="Annex 12 Logbook"
            value={`${signedLogsCount}/${logs.length}`}
            subtext="Entries countersigned"
            icon={ClipboardCheck}
            color="blue"
          />
          <StatCard
            label="Rubric Score"
            value={
              savedScorecard
                ? `${savedScorecard.totalAwarded}/${savedScorecard.maxMarks}`
                : "Pending"
            }
            subtext={
              savedScorecard ? "Official supervisor evaluation" : "Awaiting final grading"
            }
            icon={Award}
            color="purple"
          />
        </div>

        {/* Annex 12 Supervision Logbook Interactive Card */}
        <ContentCard
          title="Annex 12 Supervision Logbook"
          subtitle="Chronological record of candidate milestones and supervisor verification"
          icon={ClipboardCheck}
          headerRight={
            <a
              href={`/api/studio/${workspaceId}/export?doc=annex12`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Export Annex 12 (.doc)</span>
            </a>
          }
        >
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3 w-28">Date</th>
                    <th className="py-2.5 px-3">Milestone / Activity</th>
                    <th className="py-2.5 px-3">Challenges</th>
                    <th className="py-2.5 px-3">Supervisor Remarks</th>
                    <th className="py-2.5 px-3 w-36">Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {logs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {new Date(log.entry_date || log.created_at).toLocaleDateString("en-KE")}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">{log.activity}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.problems || "—"}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {log.supervisor_comment || "Recorded"}
                      </td>
                      <td className="py-2.5 px-3">
                        {log.supervisor_signed_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Signed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No supervision milestones logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Candidate Form to Record Additional Supervision Milestone */}
            {isOwner && workspace.status !== "closed" && (
              <form
                action={addProjectLogEntry}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3"
              >
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <PlusCircle className="h-4 w-4 text-indigo-600" />
                  <span>Log Supervision Milestone</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="logActivity"
                      className="block text-[11px] font-semibold text-slate-600 mb-1"
                    >
                      Activity Undertaken
                    </label>
                    <input
                      id="logActivity"
                      name="activity"
                      type="text"
                      required
                      placeholder="e.g. Completed KDHS 2022 data extraction for Chapter 4"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="logProblems"
                      className="block text-[11px] font-semibold text-slate-600 mb-1"
                    >
                      Challenges Encountered (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="logProblems"
                        name="problems"
                        type="text"
                        placeholder="e.g. Missing county subgroup indicator"
                        className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </ContentCard>
      </div>

      {/* Print-Ready Official KNEC Document Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 print:border-0 print:shadow-none print:p-0">
        {/* Official Cover Header */}
        <div className="text-center border-b border-slate-200 pb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
            {workspace.institution?.name || "Kenya TVET Examination Portal"}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight max-w-3xl mx-auto">
            {workspace.title || `${workspace.course} Examination Project`}
          </h1>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-600">
            <span>
              <strong className="text-slate-900">Candidate:</strong>{" "}
              {workspace.student?.full_name || "Candidate"}
            </span>
            <span>
              <strong className="text-slate-900">Admission No:</strong>{" "}
              {workspace.student?.admission_number || "N/A"}
            </span>
            <span>
              <strong className="text-slate-900">Level &amp; Course:</strong>{" "}
              {workspace.level.toUpperCase()} in {workspace.course}
            </span>
            <span>
              <strong className="text-slate-900">Supervisor:</strong>{" "}
              {workspace.supervisor?.full_name || "Assigned Supervisor"}
            </span>
          </div>
        </div>

        {/* All Project Sections */}
        <div className="space-y-8">
          {templateDefs.map((def) => {
            const sec = sectionMap.get(def.key);
            const rawText =
              def.key === "references"
                ? compiledRefsText
                : sec?.current_text?.trim() || "";

            return (
              <section key={def.key} className="space-y-2.5 break-inside-avoid-page">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                    {def.title}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500 print:hidden">
                    {sec?.status ? sec.status.toUpperCase() : "EMPTY"}
                  </span>
                </div>
                {rawText ? (
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {rawText}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    [Section not yet drafted]
                  </p>
                )}
              </section>
            );
          })}
        </div>

        {/* Print Appendix: KNEC Rubric Scorecard Summary */}
        <div className="pt-6 border-t border-slate-200 space-y-3 break-before-page">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            Official KNEC Scorecard Assessment ({rubricDef.totalMarks} Marks)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2 px-3">Rubric Category</th>
                  <th className="py-2 px-3 w-28 text-center">Max Marks</th>
                  <th className="py-2 px-3 w-32 text-center">Awarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rubricDef.categories.map((cat) => (
                  <tr key={cat.key}>
                    <td className="py-2 px-3 text-slate-800">{cat.label}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">
                      {cat.maxMarks}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-indigo-700">
                      {savedScorecard?.scores?.[cat.key] !== undefined
                        ? savedScorecard.scores[cat.key]
                        : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="py-2.5 px-3 text-slate-900">Total Examination Score</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-900">
                    {rubricDef.totalMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-700">
                    {savedScorecard
                      ? `${savedScorecard.totalAwarded} / ${savedScorecard.maxMarks}`
                      : "Pending"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
