import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import {
  saveSectionText,
  aiPolishSectionAction,
  acceptAiPolishedSection,
  resolveWorkspaceAiMode,
} from "@/app/studio/actions";
import { getSectionQuestionGuide, type WorkspaceContext } from "@/lib/studio/aiEngine";
import { SectionEditor, type StepItem } from "./SectionEditor";
import { AppShell } from "@/components/layout/AppShell";
import type { UserProfile, SupervisorReview } from "@/types/database";

export const instant = false;

interface WriteSectionPageProps {
  params: Promise<{ id: string; sectionKey: string }>;
}

export default async function WriteSectionPage({ params }: WriteSectionPageProps) {
  await connection();
  const { id: workspaceId, sectionKey: rawSectionKey } = await params;
  const sectionKey = decodeURIComponent(rawSectionKey);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/write/${sectionKey}`);
  }

  const db = getServerDbClient(supabase);

  const { data: profileData } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;

  // Load workspace
  const { data: workspace } = await db
    .from("project_workspaces")
    .select(`
      id,
      title,
      problem_area,
      workspace_type,
      level,
      course,
      status,
      student_id,
      institution_id
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspace) notFound();

  // Authorize student (or supervisor/admin)
  if (
    workspace.student_id !== user.id &&
    profile?.role !== "admin" &&
    profile?.role !== "supervisor"
  ) {
    redirect("/studio");
  }

  // Find section definitions from template
  const sectionDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const sectionDefIndex = sectionDefs.findIndex((s) => s.key === sectionKey);

  if (sectionDefIndex === -1) {
    notFound();
  }

  const sectionDef = sectionDefs[sectionDefIndex];

  // Load all existing sections + effective AI mode in parallel
  const [{ data: allSectionsData }, effectiveAiMode] = await Promise.all([
    db
      .from("workspace_sections")
      .select("id, section_key, phase, position, current_text, status")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    resolveWorkspaceAiMode(db, workspace.institution_id, workspace.student_id),
  ]);

  const allSections = allSectionsData || [];
  const textMap = new Map(allSections.map((s) => [s.section_key, s.current_text || ""]));
  const currentSecRecord = allSections.find((s) => s.section_key === sectionKey);

  // Fetch latest supervisor review for this specific section if available
  let latestSectionReview: SupervisorReview | null = null;
  if (currentSecRecord?.id) {
    const { data: secRevData } = await db
      .from("supervisor_reviews")
      .select("id, workspace_id, section_id, supervisor_id, status, comment, created_at")
      .eq("workspace_id", workspaceId)
      .eq("section_id", currentSecRecord.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    latestSectionReview = (secRevData as SupervisorReview | null) || null;
  }

  // Sections belonging to the current active phase (e.g. proposal vs project)
  const phaseSections = sectionDefs.filter((s) => s.phase === sectionDef.phase);
  const currentPhaseIndex = phaseSections.findIndex((s) => s.key === sectionKey);

  const prevStepDef = currentPhaseIndex > 0 ? phaseSections[currentPhaseIndex - 1] : null;
  const nextStepDef =
    currentPhaseIndex < phaseSections.length - 1 ? phaseSections[currentPhaseIndex + 1] : null;

  const isLocked =
    workspace.status === "closed" ||
    (sectionDef.phase === "project" &&
      workspace.status !== "approved" &&
      workspace.status !== "submitted");

  // Build interactive step list
  const steps: StepItem[] = phaseSections.map((sec, idx) => {
    const rawText = textMap.get(sec.key) || "";
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    const isDone = words >= (sec.minWords || 30);
    const isSecLocked =
      workspace.status === "closed" ||
      (sec.phase === "project" &&
        workspace.status !== "approved" &&
        workspace.status !== "submitted");

    return {
      key: sec.key,
      title: sec.title,
      phase: sec.phase,
      stepNumber: idx + 1,
      isDone,
      isCurrent: sec.key === sectionKey,
      isLocked: isSecLocked,
      wordCount: words,
      minWords: sec.minWords || 30,
    };
  });

  const wsContext: WorkspaceContext = {
    title: workspace.title,
    course: workspace.course,
    level: workspace.level,
    problemArea: workspace.problem_area,
    workspaceType: workspace.workspace_type,
  };
  const questionGuide = getSectionQuestionGuide(sectionDef.key, wsContext);

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Step ${currentPhaseIndex + 1}: ${sectionDef.title}`}
    >
      <SectionEditor
        workspaceId={workspace.id}
        workspaceTitle={workspace.title || workspace.course}
        course={workspace.course}
        sectionKey={sectionDef.key}
        sectionTitle={sectionDef.title}
        guidance={sectionDef.guidance}
        rubricMarks={sectionDef.rubricMarks}
        minWords={sectionDef.minWords}
        phase={sectionDef.phase}
        isLocked={isLocked}
        aiMode={effectiveAiMode}
        sectionStatus={currentSecRecord?.status || "empty"}
        supervisorReview={
          latestSectionReview
            ? {
                status: latestSectionReview.status,
                comment: latestSectionReview.comment,
                createdAt: latestSectionReview.created_at,
              }
            : null
        }
        currentText={textMap.get(sectionDef.key) || ""}
        questionGuide={questionGuide}
        steps={steps}
        currentStepIndex={currentPhaseIndex}
        prevStep={prevStepDef ? { key: prevStepDef.key, title: prevStepDef.title } : null}
        nextStep={nextStepDef ? { key: nextStepDef.key, title: nextStepDef.title } : null}
        saveAction={saveSectionText}
        aiPolishAction={aiPolishSectionAction}
        acceptAiAction={acceptAiPolishedSection}
      />
    </AppShell>
  );
}
