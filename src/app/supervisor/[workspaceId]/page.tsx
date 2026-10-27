import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import {
  approveProposal,
  requestProposalChanges,
  updateProposalTitle,
} from "@/app/supervisor/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Activity,
  History,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview, UserProfile } from "@/types/database";

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
        subtitle={`${workspace.student?.full_name || "Candidate"} • ${workspace.course} (${workspace.level})`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Supervisor", href: "/supervisor" },
          { label: workspace.student?.full_name || "Review", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: `${workspace.student?.full_name || "Student"} (${workspace.student?.admission_number || "—"})` },
          { label: "Track", value: `${workspace.level} • ${typeLabel}` },
          { label: "Institution", value: workspace.institution?.name || "Accredited TVET Center" },
          {
            label: "Status",
            value: isApproved ? "Approved" : isPending ? "Pending Review" : "Drafting",
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/supervisor"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <span
              className={`text-xs font-bold px-3 py-2 rounded-lg ${
                isApproved
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : isPending
                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {isApproved ? "Approved" : isPending ? "Review Required" : "Ideation"}
            </span>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Proposal Moderation Section */}
        <ContentCard
          title="Proposal Submission"
          subtitle={rubric.scorecardName}
          icon={FileText}
          headerRight={
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {proposalDefs.length} Sections
            </span>
          }
        >
          <div className="space-y-4">
            {proposalDefs.map((def) => {
              const s = proposalSectionsMap.get(def.key);
              const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;

              return (
                <div
                  key={def.key}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-700" />
                      <h4 className="text-xs font-bold text-slate-900">
                        {def.title}
                      </h4>
                      {def.rubricMarks !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {def.rubricMarks} Rubric Marks
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      {wordCount} words
                    </span>
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

        {/* Supervisor Moderation Decision Card */}
        <ContentCard
          title="Moderation Decision"
          subtitle="Approve proposal to unlock project chapters or request specific candidate revisions."
          icon={ShieldCheck}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form 1: Approve Proposal */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
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
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
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
        </ContentCard>

        {/* Chapters Progress & AI Influence Metric */}
        <ContentCard
          title="Project Chapters"
          subtitle="Candidate drafting progress and originality metrics"
          icon={Activity}
          headerRight={
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {projectDefs.length} Sections
            </span>
          }
        >
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
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate max-w-[180px] text-slate-900">
                      {def.title}
                    </span>
                    {def.rubricMarks !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        {def.rubricMarks}m
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{wordCount} words</span>
                    <span className="font-mono font-bold text-slate-700">AI: {aiInfluence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ContentCard>

        {/* Supervisor Review History Log */}
        {reviews.length > 0 && (
          <ContentCard
            title="Moderation History"
            subtitle="Chronological log of supervisor reviews."
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
                      className={`font-bold capitalize ${
                        rev.status === "approved"
                          ? "text-emerald-800 font-bold"
                          : "text-rose-800 font-bold"
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
