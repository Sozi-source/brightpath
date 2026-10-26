import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { getRubricForWorkspace } from "@/lib/studio/rubrics";
import { submitProposalForApproval } from "@/app/studio/actions";
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
  ChevronRight,
  Award,
  Layers,
  Lightbulb,
} from "lucide-react";
import type { ProjectWorkspace, WorkspaceSection, SupervisorReview } from "@/types/database";

export const instant = false;

interface WorkspaceOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceOverviewPage({ params }: WorkspaceOverviewPageProps) {
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}`);
  }

  // Fetch student's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  // Fetch workspace details
  const { data: workspaceData } = await supabase
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
  const { data: sectionsData } = await supabase
    .from("workspace_sections")
    .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const sections: WorkspaceSection[] = (sectionsData as WorkspaceSection[]) || [];

  // Fetch recent supervisor reviews
  const { data: reviewsData } = await supabase
    .from("supervisor_reviews")
    .select("id, status, comment, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as SupervisorReview[]) || [];
  const latestReview = reviews[0] || null;

  // Template definitions & KNEC Rubric
  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const rubric = getRubricForWorkspace(workspace.workspace_type, workspace.level);

  // Separate proposal sections vs project sections
  const proposalDefs = templateDefs.filter((d) => d.phase === "proposal");
  const projectDefs = templateDefs.filter((d) => d.phase === "project");

  const proposalSectionsMap = new Map(
    sections.filter((s) => s.phase === "proposal").map((s) => [s.section_key, s])
  );

  const projectSectionsMap = new Map(
    sections.filter((s) => s.phase === "project").map((s) => [s.section_key, s])
  );

  // Proposal readiness check
  const proposalSectionsComplete = proposalDefs.every((def) => {
    const s = proposalSectionsMap.get(def.key);
    return s && s.current_text && s.current_text.trim().length >= 20;
  });

  const isApproved = workspace.status === "approved" || workspace.status === "submitted";
  const isPending = workspace.status === "proposal_pending";
  const hasChangesRequested = latestReview?.status === "changes_requested" && !isApproved && !isPending;

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
            value: isApproved
              ? "Approved (Chapters Unlocked)"
              : isPending
              ? "Awaiting Supervisor Approval"
              : hasChangesRequested
              ? "Revisions Requested"
              : "Drafting",
          },
        ]}
        actions={
          <Link
            href={`/studio/${workspaceId}/problem`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 shadow-xs transition-colors"
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Topic & Title</span>
          </Link>
        }
      />

      {/* 2. 4-Stage Stepper Progression Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-700" />
            <span>1. Ideation</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 ${
              isApproved || isPending
                ? "border-blue-200 bg-blue-50 text-blue-900"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            {isApproved || isPending ? (
              <CheckCircle2 className="h-4 w-4 text-blue-700" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>2. Moderation</span>
          </div>
          <div
            className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 ${
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
            className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 ${
              workspace.status === "submitted"
                ? "border-blue-200 bg-blue-50 text-blue-900"
                : "border-slate-200 text-slate-500 bg-slate-50/50"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>4. Defence</span>
          </div>
        </div>
      </div>

      {/* Changes Requested Notification Banner */}
      {hasChangesRequested && latestReview && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
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
          {/* Phase 1: Proposal Sections Checklist */}
          <ContentCard
            title="Proposal Sections"
            subtitle="4 sections required before supervisor submission"
            icon={Layers}
            headerRight={
              isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Approved by Supervisor</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Awaiting Moderation</span>
                </span>
              ) : (
                <form action={submitProposalForApproval}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <button
                    type="submit"
                    disabled={!proposalSectionsComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                return (
                  <div
                    key={def.key}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {def.title}
                        </span>
                        {def.rubricMarks !== undefined && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs transition-colors"
                      >
                        <span>{s?.current_text ? "Edit Draft" : "Start Writing"}</span>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentCard>

          {/* Phase 2: Project Chapters */}
          <ContentCard
            title="Project Chapters"
            subtitle="Unlocked once proposal is approved"
            icon={Award}
            headerRight={
              !isApproved && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </span>
              )
            }
          >
            {!isApproved ? (
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1.5">
                <Lock className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                <h4 className="text-xs font-bold text-slate-800">
                  Chapters Locked
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chapters unlock once your proposal is approved by your supervisor.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {projectDefs.map((def) => {
                  const s = projectSectionsMap.get(def.key);
                  const wordCount = s?.current_text ? s.current_text.trim().split(/\s+/).length : 0;

                  return (
                    <div
                      key={def.key}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 bg-white"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {def.title}
                          </span>
                          {def.rubricMarks !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {def.rubricMarks}m
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                        >
                          <span>Write</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right Column (1 Col): Scorecard & Supervisor */}
        <div className="space-y-6">
          {/* Official KNEC Scorecard Card */}
          <ContentCard
            title="Official KNEC Scorecard"
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
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.marks}m
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Assigned Supervisor Card */}
          <ContentCard
            title="Assigned Department Supervisor"
            subtitle="Proposal moderation & Annex 12 review"
            icon={UserCheck}
          >
            {workspace.supervisor?.full_name ? (
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-sm">
                    {workspace.supervisor.full_name}
                  </span>
                  <span className="text-xs text-blue-800 font-semibold block">
                    Faculty Project Supervisor
                  </span>
                  {workspace.institution?.name && (
                    <span className="text-[11px] text-slate-500 block pt-1">
                      {workspace.institution.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your supervisor conducts your proposal defence, provides feedback, and signs your Annex 12 project interaction log.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">No Supervisor Assigned Yet</span>
                <p className="text-[11px] leading-relaxed">
                  Connect with your department supervisor so they can moderate your proposal.
                </p>
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </AppShell>
  );
}
