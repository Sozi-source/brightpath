"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import {
  getWorkspaceSections,
  getSectionStarterContent,
  getStarterKitById,
} from "@/lib/studio/templates";
import {
  narrowDownTopic,
  polishAndAlignSection,
  type WorkspaceContext,
  type TopicNarrowingResult,
  type SectionPolishResult,
} from "@/lib/studio/aiEngine";
import { compileReferenceList } from "@/lib/studio/sources";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { WorkspaceType, WorkspaceLevel } from "@/types/database";

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const db = getServerDbClient(supabase);

  const workspaceType = formData.get("workspaceType")?.toString() as WorkspaceType;
  const level = formData.get("level")?.toString() as WorkspaceLevel;
  const course = formData.get("course")?.toString().trim();
  const admissionNumber = formData.get("admissionNumber")?.toString().trim();
  const institutionId = formData.get("institutionId")?.toString().trim() || null;
  const supervisorId = formData.get("supervisorId")?.toString().trim() || null;
  const templateKitId = formData.get("templateKit")?.toString().trim() || "knec_standard";
  const privacyConsent = formData.get("privacyConsent")?.toString();

  if (!workspaceType || !level || !course) {
    throw new Error("Please fill in all required academic details.");
  }

  if (!admissionNumber) {
    throw new Error("Student admission / registration number is required by KNEC.");
  }

  if (privacyConsent !== "on") {
    throw new Error("You must agree to the privacy and personal data notice to continue.");
  }

  // 1. Update student profile with academic registration info
  const { error: profileErr } = await db
    .from("profiles")
    .update({
      admission_number: admissionNumber,
      institution_id: institutionId,
      course,
      level,
    })
    .eq("id", user.id);

  if (profileErr) throw new Error(profileErr.message);

  // Determine initial title/problem area from selected template if available
  const selectedKit =
    templateKitId !== "clean_slate" && templateKitId !== "knec_standard"
      ? getStarterKitById(templateKitId)
      : null;

  const initialTitle = selectedKit?.sampleTitle || null;
  const initialProblemArea = selectedKit?.sampleProblemArea || null;

  // 2. Insert new project workspace (initial status: ideation)
  const { data: workspace, error: wsErr } = await db
    .from("project_workspaces")
    .insert({
      student_id: user.id,
      supervisor_id: supervisorId,
      institution_id: institutionId,
      workspace_type: workspaceType,
      level,
      course,
      title: initialTitle,
      problem_area: initialProblemArea,
      status: "ideation",
    })
    .select("id")
    .single();

  if (wsErr || !workspace) {
    throw new Error(wsErr?.message || "Failed to initialize project workspace.");
  }

  // 3. Populate workspace sections pre-filled with KNEC starter outlines
  const sectionDefs = getWorkspaceSections(workspaceType, level);
  const sectionsPayload = sectionDefs.map((def, idx) => {
    const starterText =
      templateKitId === "clean_slate"
        ? ""
        : getSectionStarterContent(workspaceType, level, def.key, templateKitId);

    return {
      workspace_id: workspace.id,
      section_key: def.key,
      phase: def.phase,
      position: idx + 1,
      current_text: starterText,
      status: starterText ? ("draft" as const) : ("empty" as const),
    };
  });

  const { error: sectionsErr } = await db
    .from("workspace_sections")
    .insert(sectionsPayload);

  if (sectionsErr) {
    throw new Error("Failed to initialize workspace section checklist: " + sectionsErr.message);
  }

  revalidatePath("/studio");
  redirect(`/studio/${workspace.id}/problem`);
}

export async function updateWorkspaceTopic(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const problemArea = formData.get("problemArea")?.toString().trim();

  if (!workspaceId) throw new Error("Missing workspace ID.");

  const { data: existingWs } = await db
    .from("project_workspaces")
    .select("id, student_id")
    .eq("id", workspaceId)
    .single();

  if (!existingWs || existingWs.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  const { error } = await db
    .from("project_workspaces")
    .update({
      title: title || null,
      problem_area: problemArea || null,
    })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) {
    throw new Error(error.message || "Failed to save project topic.");
  }

  // Sync proposal.title with the selected topic so Step 1 of the proposal is ready
  if (title) {
    const summaryText = problemArea
      ? `### Research Title\n${title}\n\n${problemArea}`
      : `### Research Title\n${title}`;
    await db
      .from("workspace_sections")
      .update({
        current_text: summaryText,
        status: "draft",
      })
      .eq("workspace_id", workspaceId)
      .eq("section_key", "proposal.title");
  }

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/problem`);
  redirect(`/studio/${workspaceId}`);
}

export async function submitProposalForApproval(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID.");

  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  // Fetch proposal sections to ensure candidate has entered substantive text
  const { data: proposalSections } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId)
    .eq("phase", "proposal");

  const emptyRequired = (proposalSections || []).filter(
    (s: { section_key: string; current_text: string | null }) =>
      !s.current_text || s.current_text.trim().length < 20
  );

  if (emptyRequired.length > 0) {
    throw new Error(
      "All proposal sections (Title, Problem Statement, Objectives, Rationale) must have written content before submitting for supervisor review."
    );
  }

  // Update workspace status to proposal_pending
  const { error } = await db
    .from("project_workspaces")
    .update({ status: "proposal_pending" })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) throw new Error(error.message);

  // Add auto-generated project log entry (Annex 12 draft)
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Submitted project proposal for supervisor moderation review.",
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/supervisor");
}

export async function saveSectionText(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const sectionKey = formData.get("sectionKey")?.toString();
  const text = formData.get("text")?.toString() ?? "";

  if (!workspaceId || !sectionKey) throw new Error("Missing workspace or section key.");

  // Fetch section and workspace
  const { data: section } = await db
    .from("workspace_sections")
    .select("id, phase, current_text, status")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  if (!section) throw new Error("Section not found.");

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("status, student_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  // Enforce KNEC Rule 6: project chapters locked before proposal approval
  if (
    section.phase === "project" &&
    workspace.status !== "approved" &&
    workspace.status !== "submitted"
  ) {
    throw new Error(
      "Project chapters remain locked until proposal approval by your supervisor."
    );
  }

  const nextStatus =
    text.trim().length > 0
      ? section.status === "empty"
        ? "draft"
        : section.status
      : "empty";

  const { error: updErr } = await db
    .from("workspace_sections")
    .update({
      current_text: text,
      status: nextStatus,
    })
    .eq("id", section.id);

  if (updErr) throw new Error(updErr.message);

  // Insert immutable section_version audit record
  await db.from("section_versions").insert({
    section_id: section.id,
    text,
    source: "student_typed",
    ai_chars_accepted: 0,
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${sectionKey}`);
  revalidatePath(`/supervisor/${workspaceId}`);
}

export async function aiNarrowTopicAction(formData: FormData): Promise<TopicNarrowingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const studentInput = formData.get("studentInput")?.toString()?.trim() || "";

  if (!workspaceId) throw new Error("Missing workspace ID.");
  if (!studentInput) throw new Error("Please enter your problem idea or nutritional topic.");

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("workspace_type, level, course, title, problem_area")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  const context: WorkspaceContext = {
    title: workspace.title,
    course: workspace.course,
    level: workspace.level,
    problemArea: workspace.problem_area,
    workspaceType: workspace.workspace_type,
  };

  const result = await narrowDownTopic(studentInput, context);

  // Log to ai_events audit trail
  await db.from("ai_events").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    kind: "topic_suggestions",
    student_input: studentInput,
    response: result as unknown as Record<string, unknown>,
    suggestions_total: result.options.length,
    model: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "knec-academic-engine-v1",
  });

  return result;
}

export async function aiPolishSectionAction(formData: FormData): Promise<SectionPolishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const sectionKey = formData.get("sectionKey")?.toString();
  const draftText = formData.get("draftText")?.toString() || "";

  if (!workspaceId || !sectionKey) throw new Error("Missing parameters.");

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("workspace_type, level, course, title, problem_area, student_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  // References section: compile an APA 7th list from sources cited in the other sections.
  if (sectionKey === "references") {
    const { data: allSections } = await db
      .from("workspace_sections")
      .select("section_key, current_text")
      .eq("workspace_id", workspaceId);

    const { references, unverified } = compileReferenceList(
      (allSections ?? [])
        .filter((s) => s.section_key !== "references")
        .map((s) => s.current_text ?? "")
    );

    const polishedText = references.join("\n\n");
    const words = polishedText.trim() ? polishedText.trim().split(/\s+/).length : 0;
    const currentWords = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
    const warnings: string[] = [];
    if (references.length === 0) {
      warnings.push("No verified citations found yet. Polish your chapters first, then build references.");
    }
    if (unverified.length > 0) {
      warnings.push(
        `Citations not in the verified library (add these references yourself): ${unverified.join("; ")}.`
      );
    }

    return {
      polishedText,
      wordsOriginal: currentWords,
      wordsPolished: words,
      wordDiff: words - currentWords,
      targetMet: references.length > 0,
      improvements: [
        `${references.length} reference(s) compiled in APA 7th order`,
        "Only sources cited in your chapters are listed",
      ],
      citations: [],
      warnings,
    };
  }

  // Find section definition for guidance and minWords
  const sectionDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const def = sectionDefs.find((s) => s.key === sectionKey);

  const context: WorkspaceContext = {
    title: workspace.title,
    course: workspace.course,
    level: workspace.level,
    problemArea: workspace.problem_area,
    workspaceType: workspace.workspace_type,
  };

  const result = await polishAndAlignSection({
    draftText,
    sectionKey,
    sectionTitle: def?.title || sectionKey,
    guidance: def?.guidance || "Adhere to KNEC technical guidelines.",
    minWords: def?.minWords || 100,
    context,
  });

  // Log to ai_events audit trail
  const { data: section } = await db
    .from("workspace_sections")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  if (section) {
    await db.from("ai_events").insert({
      workspace_id: workspaceId,
      section_id: section.id,
      user_id: user.id,
      kind: "language_suggestion",
      student_input: draftText.slice(0, 500),
      response: {
        wordsOriginal: result.wordsOriginal,
        wordsPolished: result.wordsPolished,
        targetMet: result.targetMet,
      },
      suggestions_total: 1,
      model: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "knec-academic-engine-v1",
    });
  }

  return result;
}

export async function acceptAiPolishedSection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const sectionKey = formData.get("sectionKey")?.toString();
  const polishedText = formData.get("text")?.toString() ?? "";
  const charsAdded = parseInt(formData.get("charsAdded")?.toString() || "0", 10);

  if (!workspaceId || !sectionKey) throw new Error("Missing parameters.");

  const { data: ws } = await db
    .from("project_workspaces")
    .select("student_id")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  const { data: section } = await db
    .from("workspace_sections")
    .select("id, ai_accepted_chars")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  if (!section) throw new Error("Section not found.");

  const currentAiChars = section.ai_accepted_chars || 0;

  // 1. Update section with polished text
  const { error: updErr } = await db
    .from("workspace_sections")
    .update({
      current_text: polishedText,
      status: "draft",
      ai_accepted_chars: currentAiChars + (charsAdded > 0 ? charsAdded : polishedText.length),
    })
    .eq("id", section.id);

  if (updErr) throw new Error(updErr.message);

  // 2. Insert into section_versions with source student_accepted_suggestion
  await db.from("section_versions").insert({
    section_id: section.id,
    text: polishedText,
    source: "student_accepted_suggestion",
    ai_chars_accepted: charsAdded > 0 ? charsAdded : polishedText.length,
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${sectionKey}`);
  revalidatePath(`/supervisor/${workspaceId}`);
}


