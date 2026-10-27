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
  evaluateSectionFeedbackOnly,
  type WorkspaceContext,
  type TopicNarrowingResult,
  type SectionPolishResult,
} from "@/lib/studio/aiEngine";
import { compileReferenceList } from "@/lib/studio/sources";
import { enforceRateLimit, requireUuid, requireNonEmptyString } from "@/lib/validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { WorkspaceType, WorkspaceLevel, AiMode } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves the effective institutional AI governance policy (`off` | `feedback_only` | `feedback_and_polish`)
 * for a given workspace and student.
 */
export async function resolveWorkspaceAiMode(
  db: SupabaseClient,
  workspaceInstitutionId: string | null | undefined,
  studentId: string
): Promise<AiMode> {
  let targetInstitutionId = workspaceInstitutionId || null;

  if (!targetInstitutionId) {
    const { data: studentProfile } = await db
      .from("profiles")
      .select("institution_id")
      .eq("id", studentId)
      .maybeSingle();
    targetInstitutionId = studentProfile?.institution_id || null;
  }

  if (!targetInstitutionId) {
    return "feedback_and_polish";
  }

  const { data: institution } = await db
    .from("institutions")
    .select("ai_mode")
    .eq("id", targetInstitutionId)
    .maybeSingle();

  const mode = institution?.ai_mode as AiMode | undefined;
  if (mode === "off" || mode === "feedback_only" || mode === "feedback_and_polish") {
    return mode;
  }
  return "feedback_and_polish";
}

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

  // 4. Create initial Annex 12 project log entry
  await db.from("project_log_entries").insert({
    workspace_id: workspace.id,
    activity: `Initialized ${level.toUpperCase()} project workspace for ${course}.`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

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

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const title = requireNonEmptyString(formData.get("title"), "Project title", {
    minLength: 5,
    maxLength: 300,
  });
  const problemArea = formData.get("problemArea")?.toString().trim() || null;

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
      title,
      problem_area: problemArea,
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

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");

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

export async function submitFinalProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");

  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id, status")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.status !== "approved" && ws.status !== "submitted") {
    throw new Error("Proposal must be approved before submitting the final project report.");
  }

  const { data: projectSections } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId)
    .eq("phase", "project");

  const incomplete = (projectSections || []).filter(
    (s: { section_key: string; current_text: string | null }) =>
      !s.current_text || s.current_text.trim().length < 20
  );

  if (incomplete.length > 0) {
    throw new Error(
      `Please complete all project chapters before final submission (${incomplete.length} section(s) still empty or incomplete).`
    );
  }

  const nowIso = new Date().toISOString();
  const { error } = await db
    .from("project_workspaces")
    .update({
      status: "submitted",
      submitted_at: nowIso,
    })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) throw new Error(error.message);

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity:
      "Final Examination Submission: Candidate submitted completed project chapters and compiled references for final grading and oral defence.",
    auto_generated: true,
    student_signed_at: nowIso,
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
}

export async function addProjectLogEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const activity = requireNonEmptyString(formData.get("activity"), "Milestone activity", {
    minLength: 5,
    maxLength: 600,
  });
  const problems = formData.get("problems")?.toString().trim() || null;

  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  const { error } = await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity,
    problems,
    auto_generated: false,
    student_signed_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/export`);
  revalidatePath(`/supervisor/${workspaceId}`);
}

export async function saveSectionText(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const sectionKey = requireNonEmptyString(formData.get("sectionKey"), "section key", {
    maxLength: 100,
  });
  const text = formData.get("text")?.toString() ?? "";

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

  if (workspace.status === "closed") {
    throw new Error("This project workspace has been closed and finalized by your supervisor.");
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

  const rateCheck = enforceRateLimit(`ai_narrow:${user.id}`, 10, 60_000);
  if (!rateCheck.allowed) {
    throw new Error(
      `Rate limit reached. Please wait ${rateCheck.retryAfterSeconds}s before requesting more AI topic proposals.`
    );
  }

  const db = getServerDbClient(supabase);

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const studentInput = requireNonEmptyString(
    formData.get("studentInput"),
    "Problem idea or nutritional topic",
    { minLength: 3, maxLength: 1000 }
  );

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("workspace_type, level, course, title, problem_area, student_id, institution_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");
  if (workspace.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  // Enforce Institution AI Governance Policy
  const aiMode = await resolveWorkspaceAiMode(db, workspace.institution_id, user.id);
  if (aiMode === "off") {
    throw new Error(
      "Institutional Policy: AI topic generation is disabled for your institution (AI Mode: Off). Please choose from the National Curriculum Topic Bank below or enter your topic directly."
    );
  }

  const context: WorkspaceContext = {
    title: workspace.title,
    course: workspace.course,
    level: workspace.level,
    problemArea: workspace.problem_area,
    workspaceType: workspace.workspace_type,
  };

  const result = await narrowDownTopic(studentInput, context);
  const estTokensIn = Math.ceil(studentInput.length / 4) + 250;
  const estTokensOut = Math.ceil(JSON.stringify(result).length / 4);

  // Log to ai_events audit trail
  await db.from("ai_events").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    kind: "topic_suggestions",
    student_input: studentInput,
    response: result as unknown as Record<string, unknown>,
    suggestions_total: result.options.length,
    model: process.env.GEMINI_API_KEY ? "gemini-3.5-flash" : "knec-academic-engine-v1",
    tokens_in: estTokensIn,
    tokens_out: estTokensOut,
  });

  return result;
}

export async function aiPolishSectionAction(formData: FormData): Promise<SectionPolishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const rateCheck = enforceRateLimit(`ai_polish:${user.id}`, 12, 60_000);
  if (!rateCheck.allowed) {
    throw new Error(
      `Rate limit reached. Please wait ${rateCheck.retryAfterSeconds}s before running another AI check.`
    );
  }

  const db = getServerDbClient(supabase);

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const sectionKey = requireNonEmptyString(formData.get("sectionKey"), "section key", {
    maxLength: 100,
  });
  const draftText = formData.get("draftText")?.toString() || "";

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("workspace_type, level, course, title, problem_area, student_id, institution_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  // References section: deterministic APA 7th compilation from sources cited in the candidate's chapters
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
      warnings.push(
        "No verified citations found yet. Insert verified citations into your chapters first, then build references."
      );
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

  // Enforce Institution AI Governance Policy
  const aiMode = await resolveWorkspaceAiMode(db, workspace.institution_id, user.id);
  if (aiMode === "off") {
    throw new Error(
      "Institutional Policy: Automated rubric diagnostics are disabled by your institution (AI Mode: Off)."
    );
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

  // Run standardized KNEC Rubric, Template Completeness & Citation Validator (never rewrites student prose)
  const result = evaluateSectionFeedbackOnly({
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
    const estTokensIn = Math.ceil(draftText.length / 4) + 150;
    const estTokensOut = Math.ceil(JSON.stringify(result.improvements).length / 4);

    await db.from("ai_events").insert({
      workspace_id: workspaceId,
      section_id: section.id,
      user_id: user.id,
      kind: "rubric_feedback",
      student_input: draftText.slice(0, 500),
      response: {
        aiMode,
        wordsOriginal: result.wordsOriginal,
        wordsPolished: result.wordsPolished,
        targetMet: result.targetMet,
      },
      suggestions_total: 1,
      model: "knec-rubric-validator-v1",
      tokens_in: estTokensIn,
      tokens_out: estTokensOut,
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

  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const sectionKey = requireNonEmptyString(formData.get("sectionKey"), "section key", {
    maxLength: 100,
  });
  const polishedText = formData.get("text")?.toString() ?? "";

  const { data: ws } = await db
    .from("project_workspaces")
    .select("student_id, institution_id, status")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.status === "closed") {
    throw new Error("Workspace is finalized and locked.");
  }

  // Enforce Institution AI Governance Policy on accepting AI prose
  if (sectionKey !== "references") {
    const aiMode = await resolveWorkspaceAiMode(db, ws.institution_id, user.id);
    if (aiMode === "off" || aiMode === "feedback_only") {
      throw new Error(
        `Institutional Policy: Automated prose replacement is disabled under ${
          aiMode === "off" ? "AI Disabled" : "Feedback-Only"
        } mode.`
      );
    }
  }

  const { data: section } = await db
    .from("workspace_sections")
    .select("id, current_text, ai_accepted_chars")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  if (!section) throw new Error("Section not found.");

  const previousText = (section.current_text || "").trim();
  const nextText = polishedText.trim();
  const currentAiChars = Math.max(0, section.ai_accepted_chars || 0);

  // Compute genuine net AI character contribution (or minimum 25% of rewritten block when polishing)
  const netGrowth = Math.max(0, nextText.length - previousText.length);
  const estimatedAiContribution =
    sectionKey === "references"
      ? 0
      : netGrowth > 0
      ? netGrowth
      : Math.round(nextText.length * 0.25);

  const updatedAiChars = Math.min(nextText.length, currentAiChars + estimatedAiContribution);

  // 1. Update section with polished text
  const { error: updErr } = await db
    .from("workspace_sections")
    .update({
      current_text: polishedText,
      status: "draft",
      ai_accepted_chars: updatedAiChars,
    })
    .eq("id", section.id);

  if (updErr) throw new Error(updErr.message);

  // 2. Insert into section_versions with source student_accepted_suggestion
  await db.from("section_versions").insert({
    section_id: section.id,
    text: polishedText,
    source: "student_accepted_suggestion",
    ai_chars_accepted: estimatedAiContribution,
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${sectionKey}`);
  revalidatePath(`/supervisor/${workspaceId}`);
}
