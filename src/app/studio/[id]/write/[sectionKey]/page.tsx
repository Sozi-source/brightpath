import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import {
  polishBusinessPlanSectionAction,
  saveSectionText,
} from "@/app/studio/actions";
import { getSectionQuestionGuide, type WorkspaceContext } from "@/lib/studio/aiEngine";
import {
  resolveNotebookLmUrl,
  getNotebookLmPromptsForSection,
} from "@/lib/studio/notebookLmHelper";
import { SectionEditor, type StepItem } from "./SectionEditor";
import { AppShell } from "@/components/layout/AppShell";
import type { UserProfile } from "@/types/database";

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
      student_id
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspace) notFound();

  // Authorize student (or supervisor/admin)
  if (workspace.student_id !== user.id && profile?.role !== "admin" && profile?.role !== "supervisor") {
    redirect("/studio");
  }

  // Find section definitions from template
  const sectionDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const sectionDefIndex = sectionDefs.findIndex((s) => s.key === sectionKey);

  if (sectionDefIndex === -1) {
    notFound();
  }

  const sectionDef = sectionDefs[sectionDefIndex];

  // Load all existing sections to build the live step tracker
  const { data: allSectionsData } = await db
    .from("workspace_sections")
    .select("id, section_key, phase, position, current_text, status")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const allSections = allSectionsData || [];
  const textMap = new Map(allSections.map((s) => [s.section_key, s.current_text || ""]));

  // Sections belonging to the current chapter (e.g. Chapter 1: 1.1 - 1.8)
  const chapterSections = sectionDefs.filter(
    (s) => (s.chapter || s.phase) === (sectionDef.chapter || sectionDef.phase)
  );
  const currentChapterIndex = chapterSections.findIndex((s) => s.key === sectionKey);

  const prevStepDef = sectionDefIndex > 0 ? sectionDefs[sectionDefIndex - 1] : null;
  const nextStepDef =
    sectionDefIndex < sectionDefs.length - 1 ? sectionDefs[sectionDefIndex + 1] : null;

  const isLocked =
    workspace.status !== "approved" && workspace.status !== "submitted";

  // Build interactive step list for the current chapter
  const steps: StepItem[] = chapterSections.map((sec, idx) => {
    const rawText = textMap.get(sec.key) || "";
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    const isDone = words >= (sec.minWords || 30);

    return {
      key: sec.key,
      title: sec.title,
      phase: sec.phase,
      stepNumber: idx + 1,
      isDone,
      isCurrent: sec.key === sectionKey,
      isLocked,
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

  const { data: settingsData } = await db
    .from("platform_settings")
    .select("notebook_research_url, notebook_fabrication_url, notebook_business_url")
    .eq("id", 1)
    .maybeSingle();

  const { url: notebookUrl, trackName: notebookTrackName } = resolveNotebookLmUrl(
    workspace.workspace_type,
    settingsData
  );

  const notebookPrompts = getNotebookLmPromptsForSection({
    sectionKey: sectionDef.key,
    sectionTitle: sectionDef.title,
    workspaceTitle: workspace.title,
    problemArea: workspace.problem_area,
    course: workspace.course,
    level: workspace.level,
    workspaceType: workspace.workspace_type,
  });

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={sectionDef.title}
    >
      <SectionEditor
        workspaceId={workspace.id}
        workspaceTitle={workspace.title || workspace.course}
        course={workspace.course}
        sectionKey={sectionDef.key}
        sectionTitle={sectionDef.title}
        chapterTitle={sectionDef.chapterTitle || "Chapter"}
        guidance={sectionDef.guidance}
        rubricMarks={sectionDef.rubricMarks}
        minWords={sectionDef.minWords}
        phase={sectionDef.phase}
        isLocked={isLocked}
        currentText={textMap.get(sectionDef.key) || ""}
        questionGuide={questionGuide}
        notebookUrl={notebookUrl}
        notebookTrackName={notebookTrackName}
        notebookPrompts={notebookPrompts}
        steps={steps}
        currentStepIndex={currentChapterIndex}
        prevStep={prevStepDef ? { key: prevStepDef.key, title: prevStepDef.title } : null}
        nextStep={nextStepDef ? { key: nextStepDef.key, title: nextStepDef.title } : null}
        saveAction={saveSectionText}
        polishAction={
          workspace.workspace_type === "business_plan"
            ? polishBusinessPlanSectionAction
            : undefined
        }
      />
    </AppShell>
  );
}
