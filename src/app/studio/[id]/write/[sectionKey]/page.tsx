import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { saveSectionText, aiPolishSectionAction, acceptAiPolishedSection } from "@/app/studio/actions";
import { SectionEditor, type StepItem } from "./SectionEditor";
import { AppShell } from "@/components/layout/AppShell";
import type { UserProfile } from "@/types/database";

export const instant = false;

interface WriteSectionPageProps {
  params: Promise<{ id: string; sectionKey: string }>;
}

export default async function WriteSectionPage({ params }: WriteSectionPageProps) {
  const { id: workspaceId, sectionKey: rawSectionKey } = await params;
  const sectionKey = decodeURIComponent(rawSectionKey);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/write/${sectionKey}`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;

  // Load workspace
  const { data: workspace } = await supabase
    .from("project_workspaces")
    .select(`
      id,
      title,
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
  const { data: allSectionsData } = await supabase
    .from("workspace_sections")
    .select("id, section_key, phase, position, current_text, status")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  const allSections = allSectionsData || [];
  const textMap = new Map(allSections.map((s) => [s.section_key, s.current_text || ""]));

  // Sections belonging to the current active phase (e.g. proposal vs project)
  const phaseSections = sectionDefs.filter((s) => s.phase === sectionDef.phase);
  const currentPhaseIndex = phaseSections.findIndex((s) => s.key === sectionKey);

  const prevStepDef = currentPhaseIndex > 0 ? phaseSections[currentPhaseIndex - 1] : null;
  const nextStepDef = currentPhaseIndex < phaseSections.length - 1 ? phaseSections[currentPhaseIndex + 1] : null;

  const isLocked =
    sectionDef.phase === "project" &&
    workspace.status !== "approved" &&
    workspace.status !== "submitted";

  // Build interactive step list
  const steps: StepItem[] = phaseSections.map((sec, idx) => {
    const rawText = textMap.get(sec.key) || "";
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    const isDone = words >= (sec.minWords || 30);
    const isSecLocked =
      sec.phase === "project" &&
      workspace.status !== "approved" &&
      workspace.status !== "submitted";

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
        currentText={textMap.get(sectionDef.key) || ""}
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
