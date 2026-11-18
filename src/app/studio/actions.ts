"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import {
  getWorkspaceSections,
  getSectionStarterContent,
} from "@/lib/studio/templates";
import { buildCompleteBusinessPlan } from "@/lib/studio/businessPlanBuilder";
import { buildResearchDocument } from "@/lib/studio/researchBuilder";
import { RESEARCH_TOPIC_CATALOGUE, buildResearchSpecsFromBlueprint, findBestResearchBlueprint } from "@/lib/studio/researchTopics";
import {
  draftBusinessPlanSections,
  reviewWholeBusinessPlan,
  respondToBusinessPlanCorrectionChat,
  researchBusinessPlan,
  isBusinessPlanProviderConfigured,
  resolveAvailableBusinessPlanProvider,
  type BusinessPlanAIProvider,
  type BusinessPlanCorrectionChatMessage,
  type BusinessPlanResearch,
} from "@/lib/studio/businessPlanGeneration";
import {
  narrowDownTopic,
  polishAndAlignSection,
  type WorkspaceContext,
  type TopicNarrowingResult,
} from "@/lib/studio/aiEngine";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { WorkspaceType, WorkspaceLevel } from "@/types/database";
import { resolveBusinessPlanModel } from "@/lib/studio/businessPlanTypes";
import type { BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { hasStudioAccess } from "@/lib/studio/access";
import { NUTRITION_VENTURES } from "@/lib/studio/catalog/nutritionVentures";
import {
  correctConsultancyLocationClaims,
  getConsultancyLocationRationaleCorrection,
  getBusinessModelConflictFindings,
  validateBusinessPlanModelSpecs,
} from "@/lib/studio/businessPlanProfiles";
import { queueApprovedBusinessPlanListing } from "@/lib/studio/marketplaceListing";

function getBusinessPlanAIProvider(formData: FormData): BusinessPlanAIProvider {
  const value = formData.get("aiProvider")?.toString();
  if (value && value !== "gemini" && value !== "groq") {
    throw new Error("Choose Gemini or Groq as the AI provider.");
  }
  const preferred: BusinessPlanAIProvider = value === "gemini" || value === "groq"
    ? value
    : isBusinessPlanProviderConfigured("gemini") && !isBusinessPlanProviderConfigured("groq")
    ? "gemini"
    : "groq";
  if (isBusinessPlanProviderConfigured(preferred)) return preferred;
  const alternate: BusinessPlanAIProvider = preferred === "gemini" ? "groq" : "gemini";
  if (isBusinessPlanProviderConfigured(alternate)) return alternate;
  return preferred;
}

export async function unlockStudioWithClassCode(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in first." };
  }

  const classCode = formData.get("classCode")?.toString().trim() || "";
  if (!classCode) {
    return { error: "Please enter the Class Access Code provided by your trainer." };
  }

  const db = getServerDbClient(supabase);
  const { data: inst } = await db
    .from("institutions")
    .select("id, name, code")
    .ilike("code", classCode)
    .limit(1)
    .maybeSingle();

  if (!inst) {
    return { error: "Invalid Class Access Code. Please verify the code with your trainer." };
  }

  const { error: updateErr } = await db
    .from("profiles")
    .update({
      institution_id: inst.id,
      institution: inst.name,
    })
    .eq("id", user.id);

  if (updateErr) {
    return { error: updateErr.message || "Could not unlock Studio access." };
  }

  revalidatePath("/studio");
  revalidatePath("/learn");
  return { success: true };
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
  const initialTitle = formData.get("title")?.toString().trim() || null;
  const initialProblem = formData.get("problemArea")?.toString().trim() || null;
  const privacyConsent = formData.get("privacyConsent")?.toString();

  if (!workspaceType || !level || !course) {
    throw new Error("Please fill in all required academic details.");
  }

  if (!admissionNumber) {
    throw new Error("Student admission / registration number is required by your TVET College or KMTC.");
  }

  if (privacyConsent !== "on") {
    throw new Error("You must agree to the privacy and personal data notice to continue.");
  }

  // Automatically resolve student's existing institution or default institution + default supervisor
  const [{ data: existingProfile }, { data: defaultInst }, { data: defaultSupervisor }] =
    await Promise.all([
      db.from("profiles").select("role, institution_id, full_name").eq("id", user.id).maybeSingle(),
      db.from("institutions").select("id").limit(1).maybeSingle(),
      db
        .from("profiles")
        .select("id")
        .in("role", ["supervisor", "admin"])
        .limit(1)
        .maybeSingle(),
    ]);

  if (!hasStudioAccess(existingProfile)) {
    throw new Error("Project Studio is restricted to enrolled class students. Enter your trainer's Class Access Code first.");
  }

  const isAdminMaster = existingProfile?.role === "admin";
  const institutionId = isAdminMaster ? null : (existingProfile?.institution_id || defaultInst?.id || null);
  const supervisorId = isAdminMaster ? null : (defaultSupervisor?.id || null);

  // 1. Update student profile with academic registration info (skip for Admin Studio masters)
  if (!isAdminMaster) {
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
  }

  const ventureId = formData.get("ventureId")?.toString().trim();
  const researchTopicId = formData.get("researchTopicId")?.toString().trim();
  const townOrMarket = formData.get("townOrMarket")?.toString().trim() || "Juja";
  const county = formData.get("county")?.toString().trim() || "Kiambu";
  const customBusinessName = formData.get("businessName")?.toString().trim();

  let businessPlanSpecs: Partial<BusinessPlanSpecs> | null = null;
  let finalTitle = initialTitle;
  let finalProblem = initialProblem;

  if (ventureId) {
    const venture = NUTRITION_VENTURES.find((v) => v.id === ventureId);
    if (venture) {
      finalTitle = customBusinessName || (venture.defaultSpecs.businessName as string) || venture.title;
      finalProblem = venture.summary;
      businessPlanSpecs = {
        ...venture.defaultSpecs,
        businessName: finalTitle,
        townOrMarket: isAdminMaster ? "{{TARGET_TOWN}}" : townOrMarket,
        county: isAdminMaster ? "{{TARGET_COUNTY}}" : county,
        candidateName: isAdminMaster ? "{{CANDIDATE_NAME}}" : (existingProfile?.full_name || user.email || "Candidate"),
        admissionNumber: isAdminMaster ? "{{ADMISSION_NUMBER}}" : admissionNumber,
        institutionName: isAdminMaster ? "{{INSTITUTION_NAME}}" : undefined,
        supervisorName: isAdminMaster ? "{{SUPERVISOR_NAME}}" : undefined,
        course,
        level,
      };
    }
  }

  const researchBlueprint =
    workspaceType === "research_secondary"
      ? RESEARCH_TOPIC_CATALOGUE.find((t) => t.id === researchTopicId) ||
        (finalTitle ? RESEARCH_TOPIC_CATALOGUE.find((t) => t.title.toLowerCase() === finalTitle?.toLowerCase()) : undefined)
      : undefined;

  if (researchBlueprint) {
    finalTitle = finalTitle || researchBlueprint.title;
    finalProblem = finalProblem || researchBlueprint.problemContext;
  }

  // 2. Insert new project workspace
  const { data: workspace, error: wsErr } = await db
    .from("project_workspaces")
    .insert({
      student_id: user.id,
      supervisor_id: supervisorId,
      institution_id: institutionId,
      workspace_type: workspaceType,
      level,
      course,
      title: finalTitle,
      problem_area: finalProblem,
      business_plan_specs: businessPlanSpecs,
      status: workspaceType === "business_plan" ? "approved" : (finalTitle ? "proposal_pending" : "ideation"),
    })
    .select("id")
    .single();

  if (wsErr || !workspace) {
    throw new Error(wsErr?.message || "Failed to initialize project workspace.");
  }

  // 3. Populate workspace sections
  const resolvedModel = workspaceType === "business_plan" ? resolveBusinessPlanModel(businessPlanSpecs as BusinessPlanSpecs | null) : undefined;
  const sectionDefs = getWorkspaceSections(workspaceType, level, resolvedModel);

  const prebuiltResearchMap = new Map<string, string>();
  if (workspaceType === "research_secondary" && researchBlueprint) {
    const specs = buildResearchSpecsFromBlueprint(researchBlueprint, {
      level,
      seed: `${workspace.id}|${researchBlueprint.id}`,
      identity: { mode: "master" },
      kind: "full",
    });
    for (const sec of buildResearchDocument(specs, "full")) {
      prebuiltResearchMap.set(sec.section_key, sec.content);
    }
  }

  const sectionsPayload = sectionDefs.map((def, idx) => {
    const starterText =
      prebuiltResearchMap.get(def.key) ??
      getSectionStarterContent(workspaceType, level, def.key, resolvedModel);

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
  revalidatePath("/supervisor");
  if (workspaceType === "business_plan" || finalTitle || initialTitle) {
    redirect(`/studio/${workspace.id}`);
  }
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
  if (!title) throw new Error("Please enter a project title.");

  const { data: existingWs } = await db
    .from("project_workspaces")
    .select("id, student_id, status, final_project_status, workspace_type")
    .eq("id", workspaceId)
    .single();

  if (!existingWs || existingWs.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }
  if (existingWs.final_project_status === "pending_review" || existingWs.final_project_status === "approved") {
    throw new Error("Project topic details are locked during or after final review.");
  }

  const nextStatus =
    existingWs.status === "ideation" ? "proposal_pending" : existingWs.status;

  const { error } = await db
    .from("project_workspaces")
    .update({
      title,
      problem_area: problemArea || null,
      status: nextStatus,
    })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) {
    throw new Error(error.message || "Failed to save project topic.");
  }

  if (existingWs.status === "ideation") {
    await db.from("project_log_entries").insert({
      workspace_id: workspaceId,
      activity: `Submitted project topic for supervisor approval: "${title}".`,
      auto_generated: true,
      student_signed_at: new Date().toISOString(),
    });
  }

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/problem`);
  revalidatePath("/supervisor");
  redirect(`/studio/${workspaceId}`);
}

export async function updateWorkspaceTrackAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);
  const workspaceId = formData.get("workspaceId")?.toString();
  const newType = formData.get("workspaceType")?.toString() as WorkspaceType;

  if (!workspaceId || !newType) throw new Error("Missing workspace ID or track type.");

  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id, level, status")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) throw new Error("Unauthorized.");

  // Update track
  const { error: wsErr } = await db
    .from("project_workspaces")
    .update({ workspace_type: newType })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

  // If in ideation/proposal_pending, update workspace sections to the new track's template
  if (ws.status === "ideation" || ws.status === "proposal_pending") {
    await db.from("workspace_sections").delete().eq("workspace_id", workspaceId);

    const sectionDefs = getWorkspaceSections(newType, ws.level);
    const sectionsPayload = sectionDefs.map((def, idx) => ({
      workspace_id: workspaceId,
      section_key: def.key,
      phase: def.phase,
      position: idx + 1,
      current_text: getSectionStarterContent(newType, ws.level, def.key),
      status: "empty" as const,
    }));

    await db.from("workspace_sections").insert(sectionsPayload);
  }

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/problem`);
  revalidatePath("/studio");
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
    .select("id, student_id, title")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (!ws.title || ws.title.trim().length < 5) {
    throw new Error("Please formulate your Project Title first before submitting for topic approval.");
  }

  const { error } = await db
    .from("project_workspaces")
    .update({ status: "proposal_pending" })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) throw new Error(error.message);

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Submitted project topic for supervisor approval.",
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/supervisor");
}

export async function submitChaptersForReview(formData: FormData) {
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
    .select("id, student_id, status, final_project_status, workspace_type")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.workspace_type !== "business_plan" && ws.status !== "approved" && ws.status !== "submitted") {
    throw new Error("Your project topic must be approved by your supervisor first.");
  }
  if (ws.final_project_status === "pending_review" || ws.final_project_status === "approved") {
    throw new Error("Your project is locked during or after final supervisor approval.");
  }

  const { error } = await db
    .from("project_workspaces")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) throw new Error(error.message);

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Submitted drafted chapters for supervisor review.",
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
}

export async function submitCompletedProjectForFinalReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID.");
  const db = getServerDbClient(supabase);
  const { data: workspace } = await db.from("project_workspaces")
    .select("id, student_id, workspace_type, level, status, final_project_status, business_plan_specs")
    .eq("id", workspaceId).maybeSingle();
  if (!workspace || workspace.student_id !== user.id) throw new Error("This project is not yours.");
  if (!["not_submitted", "changes_requested"].includes(workspace.final_project_status)) {
    throw new Error("This project is already in or past final review.");
  }
  const { count: unresolvedCommentCount, error: commentsError } = await db.from("section_review_threads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["open", "answered"]);
  if (commentsError) throw new Error(commentsError.message || "Could not verify section comments.");
  if ((unresolvedCommentCount || 0) > 0) throw new Error("Ask your supervisor to resolve every section comment before final submission.");

  let priceKes: number | null = null;
  if (workspace.workspace_type === "business_plan" || workspace.workspace_type === "research_secondary") {
    // Under Option A: Standard institutional pricing (Diploma: KES 2,500, Craft/Certificate: KES 1,500)
    const rawPrice = formData.get("priceKes")?.toString().trim() || "";
    const parsed = Number(rawPrice);
    if (rawPrice && Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000) {
      priceKes = parsed;
    } else {
      priceKes = workspace.level === "craft" ? 1500 : 2500;
    }
  }

  const planSpecs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  const businessModel = workspace.workspace_type === "business_plan" ? resolveBusinessPlanModel(planSpecs) : undefined;
  const definitions = getWorkspaceSections(workspace.workspace_type, workspace.level, businessModel);
  const { data: sections, error: sectionsError } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (sectionsError) throw new Error(sectionsError.message || "Could not verify project sections.");
  const contentByKey = new Map((sections || []).map((section) => [section.section_key, section.current_text || ""]));
  if (workspace.workspace_type === "business_plan" && planSpecs) {
    const conflicts = getBusinessModelConflictFindings(planSpecs, (sections || []).map((section) => ({
      key: section.section_key,
      content: section.current_text || "",
    })));
    if (conflicts.length) throw new Error(`Resolve the business-model mismatch in ${conflicts.map((item) => item.sectionKey).join(", ")} before final submission.`);
  }
  const incomplete = definitions.filter((definition) => {
    const words = (contentByKey.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length;
    return words < (definition.minWords || 30);
  });
  if (incomplete.length) throw new Error(`Complete every section before final review. ${incomplete.length} section(s) need more content.`);

  const { error } = await db.from("project_workspaces").update({
    status: "submitted",
    final_project_status: "pending_review",
    final_project_submitted_at: new Date().toISOString(),
    final_project_approved_at: null,
    marketplace_price_kes: priceKes,
  }).eq("id", workspaceId).eq("student_id", user.id);
  if (error) throw new Error(error.message || "Could not submit the project for final review.");

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Submitted the completed project for final supervisor approval.",
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/supervisor/${workspaceId}`);
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
    .select("status, student_id, final_project_status, workspace_type, business_plan_specs")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }
  if (
    workspace.workspace_type !== "business_plan" &&
    (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved")
  ) {
    throw new Error("Project sections are locked during or after final review.");
  }
  if (
    workspace.workspace_type === "business_plan" &&
    Boolean(section.current_text?.trim()) &&
    (workspace.business_plan_specs as Record<string, unknown> | null)?.export_unlocked !== true
  ) {
    throw new Error("Unlock the Word Export (KES 350) to edit generated business plan sections.");
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

  if (
    workspace.workspace_type === "business_plan" &&
    (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved")
  ) {
    try {
      await queueApprovedBusinessPlanListing(workspaceId);
    } catch {
      // Non-blocking snapshot refresh
    }
  }

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${sectionKey}`);
  revalidatePath(`/supervisor/${workspaceId}`);
}

export async function correctBusinessPlanLocationClaimsAction(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!workspaceId) throw new Error("Missing workspace ID.");

  const db = getServerDbClient(supabase);
  const { data: workspace, error: workspaceError } = await db.from("project_workspaces")
    .select("student_id, status, final_project_status, business_plan_specs")
    .eq("id", workspaceId).maybeSingle();
  if (workspaceError || !workspace || workspace.student_id !== user.id) throw new Error("This project is not yours.");
  if (workspace.status !== "approved" && workspace.status !== "submitted") {
    throw new Error("The supervisor must approve the topic before correcting project chapters.");
  }

  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  if (!specs || resolveBusinessPlanModel(specs) !== "consultancy") {
    throw new Error("This correction applies only to nutrition consultancy plans.");
  }
  const locationCorrection = getConsultancyLocationRationaleCorrection(specs);
  if (locationCorrection) specs.locationRationale = locationCorrection;

  const { data: sections, error: sectionsError } = await db.from("workspace_sections")
    .select("id, section_key, current_text").eq("workspace_id", workspaceId);
  if (sectionsError) throw new Error(sectionsError.message || "Could not load the plan sections.");

  const corrected = (sections || []).flatMap((section) => {
    const currentText = section.current_text || "";
    const nextText = correctConsultancyLocationClaims(currentText, specs);
    return nextText !== currentText ? [{ ...section, nextText }] : [];
  });
  for (const section of corrected) {
    const { error } = await db.from("workspace_sections").update({ current_text: section.nextText })
      .eq("id", section.id).eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message || `Could not correct ${section.section_key}.`);
    await db.from("section_versions").insert({
      section_id: section.id,
      text: section.nextText,
      source: "student_typed",
      ai_chars_accepted: 0,
    });
  }

  const { error: specsError } = await db.from("project_workspaces")
    .update({ business_plan_specs: specs }).eq("id", workspaceId).eq("student_id", user.id);
  if (specsError) throw new Error(specsError.message || "Could not save the corrected location details.");
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Corrected unsupported location-proximity claims in ${corrected.length} business plan section(s).`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  return { correctedSections: corrected.map((section) => section.section_key), correctedRationale: Boolean(locationCorrection) };
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
    model: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "tvet-kmtc-academic-engine-v1",
  });

  return result;
}

export async function polishBusinessPlanSectionAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  const sectionKey = formData.get("sectionKey")?.toString();
  const draftText = formData.get("draftText")?.toString() || "";
  if (!workspaceId || !sectionKey) throw new Error("Missing workspace or section.");
  if (draftText.length > 30_000) throw new Error("This draft is too long to polish at once.");
  if (!draftText.trim()) throw new Error("Write a draft before asking for a polish.");

  const db = getServerDbClient(supabase);
  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, student_id, workspace_type, level, course, title, problem_area, status, business_plan_specs")
    .eq("id", workspaceId)
    .single();
  if (!workspace || workspace.student_id !== user.id) throw new Error("Unauthorized.");
  if (workspace.workspace_type !== "business_plan") {
    throw new Error("This writing polish is for business plan sections.");
  }
  if ((workspace.business_plan_specs as Record<string, unknown> | null)?.export_unlocked !== true) {
    throw new Error("Unlock the Word Export (KES 350) to polish and edit business plan sections.");
  }
  if (workspace.status !== "approved" && workspace.status !== "submitted") {
    throw new Error("The business plan must be approved before drafting chapters.");
  }

  const section = getWorkspaceSections("business_plan", workspace.level).find(
    (item) => item.key === sectionKey
  );
  if (!section) throw new Error("Section is not part of the business plan template.");

  const context: WorkspaceContext = {
    title: workspace.title,
    problemArea: workspace.problem_area,
    course: workspace.course,
    level: workspace.level,
    workspaceType: "business_plan",
  };
  const result = await polishAndAlignSection({
    draftText,
    sectionKey,
    sectionTitle: section.title,
    guidance: section.guidance,
    minWords: section.minWords || 30,
    context,
  });

  await db.from("ai_events").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    kind: "language_suggestion",
    student_input: draftText,
    response: result as unknown as Record<string, unknown>,
    suggestions_total: result.polishedText === draftText ? 0 : 1,
    model: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_MODEL || "gemini-2.0-flash"
      : process.env.OPENAI_API_KEY
      ? "gpt-4o-mini"
      : "unavailable",
  });

  return result;
}

export async function deleteDraftWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);
  const workspaceId = formData.get("workspaceId")?.toString()?.trim();
  const redirectAfter = formData.get("redirectAfter")?.toString() === "true";

  if (!workspaceId) {
    throw new Error("Missing workspace ID.");
  }

  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id, status")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized to delete this workspace.");
  }

  // Clean up any associated marketplace project entry
  await db.from("projects").delete().eq("file_path", `workspace-export:${workspaceId}`);

  const { error } = await db
    .from("project_workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("student_id", user.id);

  if (error) {
    throw new Error(error.message || "Failed to delete draft project.");
  }

  revalidatePath("/studio");
  revalidatePath("/supervisor");

  if (redirectAfter) {
    redirect("/studio");
  }
}

export async function saveBusinessPlanDetailsAction(formData: FormData): Promise<
  | {
      success: true;
      businessName: string;
      preservedSectionsCount: number;
      chapterKeys: string[];
      researchSources: BusinessPlanResearch["sources"];
    }
  | { success: false; error: string }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const workspaceId = formData.get("workspaceId")?.toString();
  const rawSpecs = formData.get("specs")?.toString();
  const replaceExisting = formData.get("replaceExisting") === "true";
  const aiProvider = getBusinessPlanAIProvider(formData);

  if (!workspaceId) throw new Error("Missing workspace ID.");
  if (!rawSpecs) throw new Error("Missing business plan specifications.");

  let specs: BusinessPlanSpecs;
  try {
    specs = JSON.parse(rawSpecs) as BusinessPlanSpecs;
  } catch {
    throw new Error("Invalid business plan specifications payload.");
  }
  specs.businessModel = resolveBusinessPlanModel(specs);
  const isInstitutionalPlan = specs.isInstitutional === true;
  const modelIssues = validateBusinessPlanModelSpecs(specs);
  if (modelIssues.length) throw new Error(modelIssues.join(" "));

  // 1. Fetch workspace and ensure ownership.
  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id, supervisor_id, institution_id, workspace_type, level, course, status, final_project_status, business_plan_specs")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.final_project_status === "pending_review" || ws.final_project_status === "approved") {
    throw new Error("Business plan details are locked during or after final review.");
  }

  if (ws.workspace_type !== "business_plan") {
    throw new Error("This workspace is not configured as a TVET Business Plan.");
  }
  if (ws.workspace_type !== "business_plan" && ws.status !== "approved" && ws.status !== "submitted") {
    throw new Error("Your business plan topic must be approved before you build the full draft.");
  }

  if (rawSpecs.length > 100_000) {
    throw new Error("Business plan details are too large to save.");
  }

  // Resolve profile defaults before validation so required values can be supplied
  // automatically when they are already present on the student's profile.
  const [{ data: profile }, { data: supervisor }] = await Promise.all([
    db
      .from("profiles")
      .select("full_name, admission_number, institutions(name)")
      .eq("id", user.id)
      .maybeSingle(),
    ws.supervisor_id
      ? db
          .from("profiles")
          .select("full_name")
          .eq("id", ws.supervisor_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const profileInstitution = profile?.institutions as
    | { name?: string }
    | { name?: string }[]
    | null;
  const profileInstitutionName = Array.isArray(profileInstitution)
    ? profileInstitution[0]?.name
    : profileInstitution?.name;
  const { data: workspaceInstitution } = !profileInstitutionName && ws.institution_id
    ? await db.from("institutions").select("name").eq("id", ws.institution_id).maybeSingle()
    : { data: null };

  if (!specs.candidateName && profile?.full_name) {
    specs.candidateName = profile.full_name;
  }
  if (!specs.admissionNumber && profile?.admission_number) {
    specs.admissionNumber = profile.admission_number;
  }
  if (!specs.institutionName) {
    const institutionName = profileInstitutionName || workspaceInstitution?.name;
    if (institutionName) specs.institutionName = institutionName;
  }
  if (!specs.supervisorName && supervisor?.full_name) {
    specs.supervisorName = supervisor.full_name;
  }
  if (!specs.course) {
    specs.course = ws.course;
  }

  const requiredText: Array<keyof BusinessPlanSpecs> = isInstitutionalPlan
    ? ["businessName", "industrySector", "institutionName", "course", "county", "townOrMarket", "primaryProduct"]
    : ["businessName", "industrySector", "candidateName", "admissionNumber", "institutionName", "course", "county", "townOrMarket", "primaryProduct"];
  const requiredFieldLabels: Partial<Record<keyof BusinessPlanSpecs, string>> = {
    businessName: "Business name",
    industrySector: "Industry sector",
    candidateName: "Candidate name",
    admissionNumber: "Admission number",
    institutionName: "Training institution",
    course: "Course",
    county: "County",
    townOrMarket: "Town or market",
    primaryProduct: "Primary product",
  };
  for (const field of requiredText) {
    if (typeof specs[field] !== "string" || !String(specs[field]).trim()) {
      return { error: `${requiredFieldLabels[field] ?? "This field"} is required.` };
    }
  }

  if (
    !["Sole Proprietorship", "Partnership", "Private Limited Company"].includes(
      specs.formOfOwnership
    )
  ) {
    throw new Error("Choose a valid form of ownership.");
  }

  const numericFields: Array<keyof BusinessPlanSpecs> = [
    "unitSellingPrice",
    "unitCostOfProduction",
    "monthlyProductionUnitsYear1",
    "annualGrowthRateYear2",
    "annualGrowthRateYear3",
    "projectedMarketSharePercentage",
    "monthlyRent",
    "preOperationalCosts",
    "workingCapitalBuffer",
    "ownerEquityAmount",
    "loanAmount",
    "loanInterestRateAnnual",
    "loanTenureMonths",
  ];
  for (const field of numericFields) {
    const value = specs[field];
    const lowerBound = field === "annualGrowthRateYear2" || field === "annualGrowthRateYear3" ? -1 : 0;
    const upperBound = field === "loanInterestRateAnnual" || field === "projectedMarketSharePercentage" ? 100 : 1_000_000_000;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < lowerBound ||
      value > upperBound
    ) {
      throw new Error(`Enter a valid value for ${field}.`);
    }
  }

  const lists = [specs.competitors, specs.machinery, specs.rawMaterials, specs.staffing];
  if (lists.some((items) => !Array.isArray(items) || items.length > 100)) {
    throw new Error("Review the competitor, equipment, materials, and staffing lists.");
  }
  const isText = (value: unknown) => typeof value === "string" && value.length <= 2_000;
  const isAmount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
  if (
    !specs.competitors.every((item) => item && isText(item.name) && isText(item.location) && isText(item.priceLevel) && isText(item.strengths) && isText(item.weaknesses)) ||
    !specs.machinery.every((item) => item && isText(item.item) && isText(item.supplier) && Number.isInteger(item.quantity) && item.quantity >= 0 && isAmount(item.unitCost)) ||
    !specs.rawMaterials.every((item) => item && isText(item.material) && isText(item.monthlyQuantity) && isText(item.supplier) && isAmount(item.monthlyCost)) ||
    !specs.staffing.every((item) => item && isText(item.position) && isText(item.duties) && isText(item.qualifications) && Number.isInteger(item.count) && item.count >= 0 && isAmount(item.monthlySalary))
  ) {
    throw new Error("Check the values in your competitor, equipment, material, and staffing lists.");
  }
  if (
    !specs.monthlyOverheads ||
    ![specs.monthlyOverheads.rent, specs.monthlyOverheads.electricity, specs.monthlyOverheads.water,
      specs.monthlyOverheads.transport, specs.monthlyOverheads.marketing, specs.monthlyOverheads.stationeryMisc]
      .every(isAmount)
  ) {
    throw new Error("Enter valid monthly overhead amounts.");
  }

  const priorSpecs = ws.business_plan_specs as BusinessPlanSpecs | null;
  const priorResearch = priorSpecs?.research;
  const canReuseResearch = Boolean(
    priorResearch?.summary &&
    resolveBusinessPlanModel(priorSpecs) === specs.businessModel &&
    priorSpecs?.businessName === specs.businessName &&
    priorSpecs?.industrySector === specs.industrySector &&
    priorSpecs?.primaryProduct === specs.primaryProduct &&
    priorSpecs?.county === specs.county &&
    priorSpecs?.townOrMarket === specs.townOrMarket
  );
  let research: BusinessPlanResearch;
  if (canReuseResearch) {
    research = priorResearch as BusinessPlanResearch;
  } else {
    try {
      research = await researchBusinessPlan(specs, aiProvider);
    } catch {
      research = {
        summary: `Market research for ${specs.businessName} in ${specs.industrySector} (${specs.county}).`,
        sources: [],
        searchedAt: new Date().toISOString(),
      };
    }
  }
  const sectionDefinitions = getWorkspaceSections("business_plan", ws.level, specs.businessModel);
  const { data: existingSections, error: existingSectionsError } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  if (existingSectionsError) {
    return { error: "Could not check the saved sections. Retry the build." };
  }
  const existingByKey = new Map(
    (existingSections || []).map((section) => [section.section_key, section.current_text || ""])
  );
  const pendingDefinitions = replaceExisting ? sectionDefinitions : sectionDefinitions.filter((definition) => {
    const currentText = existingByKey.get(definition.key) || "";
    const starterText = getSectionStarterContent("business_plan", ws.level, definition.key, specs.businessModel);
    return !currentText.trim() || (starterText !== "" && currentText === starterText);
  });
  const chapterKeys = [...new Set(
    pendingDefinitions.map((definition) => definition.chapter || definition.phase)
  )];

  // Research is stored with the candidate's details so claims can be checked later.
  const savedSpecs: BusinessPlanSpecs = { ...specs, research };
  const fullTitle = `Business Plan for ${specs.businessName} in ${specs.townOrMarket}, ${specs.county}`;
  const executiveProfile = [
    `Business: ${specs.businessName}`,
    `Ownership: ${specs.formOfOwnership}`,
    `Location: ${specs.townOrMarket}, ${specs.county}`,
    `Product or service: ${specs.primaryProduct}`,
    `Sector: ${specs.industrySector}`,
  ].join("\n");

  const { error: saveError } = await db
    .from("project_workspaces")
    .update({
      title: fullTitle,
      problem_area: executiveProfile,
      business_plan_specs: savedSpecs,
    })
    .eq("id", workspaceId);
  if (saveError) throw new Error(saveError.message || "Could not save business plan details.");

  const preservedSectionsCount = sectionDefinitions.length - pendingDefinitions.length;

  // 6. Project log entry
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Prepared sourced research for the business plan "${specs.businessName}".`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });

  // The active workspace is refreshed by the client after all chapter actions
  // complete. Invalidating it here would render Server Components in the
  // middle of the build and can fail after this details save has committed.
  // revalidatePath is intentionally omitted here. The client calls router.refresh()
  // after all chapters are saved. Calling it here triggers an RSC re-render
  // mid-build which can fail while the workspace title is still being written.

  return {
    success: true,
    businessName: specs.businessName,
    preservedSectionsCount: replaceExisting ? 0 : preservedSectionsCount,
    chapterKeys,
    researchSources: research.sources,
  };
}

export async function buildBusinessPlanChapterAction(formData: FormData): Promise<{
  success: true;
  generatedSections: number;
  preservedSections: number;
  factReviewWarning?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  const chapterKey = formData.get("chapterKey")?.toString();
  const replaceExisting = formData.get("replaceExisting") === "true";
  const aiProvider = getBusinessPlanAIProvider(formData);
  if (!workspaceId || !chapterKey) throw new Error("Missing workspace or chapter.");

  const db = getServerDbClient(supabase);
  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, student_id, workspace_type, level, status, final_project_status, business_plan_specs")
    .eq("id", workspaceId)
    .single();
  if (!workspace || workspace.student_id !== user.id) throw new Error("Unauthorized.");
  if (workspace.workspace_type !== "business_plan") throw new Error("This is not a business plan workspace.");
  if (workspace.status !== "approved" && workspace.status !== "submitted") {
    throw new Error("Your business plan topic must be approved before drafting chapters.");
  }
  if (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved") {
    throw new Error("Business plan chapters are locked during or after final review.");
  }

  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  const research = specs?.research;
  if (!specs || !research?.summary || !Array.isArray(research.sources)) {
    throw new Error("Save business plan details before drafting the chapters.");
  }

  const allDefinitions = getWorkspaceSections("business_plan", workspace.level, resolveBusinessPlanModel(specs)).filter(
    (definition) => !(
      specs.isInstitutional === true &&
      ["prelim.declaration", "prelim.dedication", "prelim.acknowledgements"].includes(definition.key)
    )
  );
  const definitions = allDefinitions.filter(
    (definition) => (definition.chapter || definition.phase) === chapterKey
  );
  if (definitions.length === 0) throw new Error("Business plan chapter not found.");

  const { data: rows } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  const existingByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const resolvedModel = resolveBusinessPlanModel(specs);
  const pending = replaceExisting ? definitions : definitions.filter((definition) => {
    const currentText = existingByKey.get(definition.key) || "";
    const starterText = getSectionStarterContent("business_plan", workspace.level, definition.key, resolvedModel);
    return !currentText.trim() || (starterText !== "" && currentText === starterText);
  });
  if (pending.length === 0) {
    return { success: true, generatedSections: 0, preservedSections: definitions.length };
  }

  const scriptedSections = new Map(
    buildCompleteBusinessPlan(specs).map((section) => [section.section_key, section.content])
  );
  let aiCorrections = new Map<string, string>();
  let factReviewWarning: string | undefined;
  let activeProvider: BusinessPlanAIProvider = aiProvider;
  let fallbackProvider: BusinessPlanAIProvider | null = null;
  let providerAvailable = false;
  try {
    const resolved = resolveAvailableBusinessPlanProvider(aiProvider);
    activeProvider = resolved.primary;
    fallbackProvider = resolved.fallback;
    providerAvailable = true;
  } catch {
    factReviewWarning = "AI provider unavailable; built deterministic draft from enterprise specifications.";
  }

  if (providerAvailable) {
    try {
      aiCorrections = await draftBusinessPlanSections(
        specs,
        pending,
        research as BusinessPlanResearch,
        scriptedSections,
        activeProvider
      );
    } catch (error) {
      if (fallbackProvider) {
        console.warn(`${activeProvider} build failed, falling back to ${fallbackProvider}:`, error);
        try {
          aiCorrections = await draftBusinessPlanSections(
            specs,
            pending,
            research as BusinessPlanResearch,
            scriptedSections,
            fallbackProvider
          );
        } catch {
          factReviewWarning = "AI provider encountered an error; completed remaining sections with the deterministic builder.";
        }
      } else {
        factReviewWarning = "AI provider encountered an error; completed remaining sections with the deterministic builder.";
      }
    }
  }

  for (const definition of pending) {
    if (!aiCorrections.has(definition.key) && scriptedSections.has(definition.key)) {
      aiCorrections.set(definition.key, scriptedSections.get(definition.key)!);
      if (!factReviewWarning) {
        factReviewWarning = "Some sections used the deterministic enterprise template.";
      }
    }
  }
  const draftSections = pending.map((definition) => ({
    section_key: definition.key,
    position: allDefinitions.findIndex((item) => item.key === definition.key) + 1,
    current_text:
      aiCorrections.get(definition.key) ||
      scriptedSections.get(definition.key) ||
      `### ${definition.title}\n\n[Add verified information for this section.]`,
    starter_text: getSectionStarterContent("business_plan", workspace.level, definition.key, resolvedModel),
  }));
  const modelConflicts = getBusinessModelConflictFindings(
    specs,
    draftSections.map((section) => ({ key: section.section_key, content: section.current_text }))
  );
  if (modelConflicts.length) {
    throw new Error(`Generated text conflicts with the selected business model in ${modelConflicts.map((item) => item.sectionKey).join(", ")}. Review the model-specific template before saving.`);
  }

  let generatedSections = 0;
  let preservedSections = 0;
  if (replaceExisting) {
    for (const section of draftSections) {
      const { data: savedSection, error: saveSectionError } = await db
        .from("workspace_sections")
        .upsert(
          {
            workspace_id: workspaceId,
            section_key: section.section_key,
            phase: "project",
            position: section.position,
            current_text: section.current_text,
            status: "draft",
          },
          { onConflict: "workspace_id,section_key" }
        )
        .select("id")
        .single();
      if (saveSectionError || !savedSection) {
        throw new Error(saveSectionError?.message || "Could not save the rebuilt chapter.");
      }
      const { error: versionError } = await db.from("section_versions").insert({
        section_id: savedSection.id,
        text: section.current_text,
        source: "ai_generated_draft",
        ai_chars_accepted: 0,
      });
      if (versionError) throw new Error(versionError.message || "Could not save the rebuilt chapter version.");
      generatedSections += 1;
    }
  } else {
    const { data: generationStats, error: generationError } = await db.rpc(
      "fill_empty_business_plan_sections",
      {
        p_workspace_id: workspaceId,
        p_user_id: user.id,
        p_sections: draftSections,
      }
    );
    if (generationError) throw new Error(generationError.message || "Could not save this chapter.");
    const stats = Array.isArray(generationStats) ? generationStats[0] : null;
    generatedSections = Number(stats?.generated_sections) || 0;
    preservedSections = Number(stats?.preserved_sections) || 0;
  }

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Drafted ${generatedSections} business plan sections for ${chapterKey}.`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });
  // Do not invalidate the active Server Component route after each chapter.
  // The client builds chapters sequentially; rendering the full page between
  // commits can fail after a successful save and make the client report a
  // misleading RSC error. The builder refreshes the page once the run ends.

  return { success: true, generatedSections, preservedSections, factReviewWarning };
}

// ---------------------------------------------------------------------------
// buildCompleteBusinessPlanAction
// ---------------------------------------------------------------------------
// A single Server Action request that runs the entire build pipeline:
//   research → save specs → generate all chapters → revalidate once.
//
// Design principles:
//   • Never throws — all failures are returned as { success: false, error }.
//   • revalidatePath is called exactly once, at the very end, after every
//     write has committed. This prevents RSC re-renders mid-build (React #441).
//   • Research failures fall back to a stub so chapter generation still runs.
//   • Chapter failures do NOT abort the run; the client is told how many
//     chapters succeeded so it can retry the rest.
// ---------------------------------------------------------------------------

export type BuildCompleteBusinessPlanResult =
  | {
      success: true;
      businessName: string;
      totalSections: number;
      preservedSections: number;
      researchSources: BusinessPlanResearch["sources"];
      factReviewWarning: boolean;
      chaptersBuilt: number;
      chaptersTotal: number;
    }
  | { success: false; error: string };

export async function buildCompleteBusinessPlanAction(
  formData: FormData
): Promise<BuildCompleteBusinessPlanResult> {
  try {
    return await runCompleteBusinessPlanBuild(formData);
  } catch (error) {
    // Return operational failures as serializable data and keep details in
    // server logs. Database writes completed before a failure remain saved.
    console.error("Business plan build failed unexpectedly", error);
    return {
      success: false,
      error: "The build could not finish. Saved sections are preserved; retry to resume.",
    };
  }
}

async function runCompleteBusinessPlanBuild(
  formData: FormData
): Promise<BuildCompleteBusinessPlanResult> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // redirect() throws an internal Next.js error — use a returned error here
    // so the client can show an inline message instead of crashing.
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const db = getServerDbClient(supabase);

  // ── Parse inputs ──────────────────────────────────────────────────────────
  const workspaceId = formData.get("workspaceId")?.toString();
  const rawSpecs = formData.get("specs")?.toString();
  const replaceExisting = formData.get("replaceExisting") === "true";

  let aiProvider: BusinessPlanAIProvider = "groq";
  try {
    aiProvider = getBusinessPlanAIProvider(formData);
  } catch {
    return { success: false, error: "Choose Gemini or Groq as the AI provider." };
  }

  if (!workspaceId) return { success: false, error: "Missing workspace ID." };
  if (!rawSpecs) return { success: false, error: "Missing business plan specifications." };
  if (rawSpecs.length > 100_000)
    return { success: false, error: "Business plan details are too large to save." };

  let specs: BusinessPlanSpecs;
  try {
    specs = JSON.parse(rawSpecs) as BusinessPlanSpecs;
  } catch {
    return { success: false, error: "Invalid business plan specifications payload." };
  }
  specs.businessModel = resolveBusinessPlanModel(specs);
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return { success: false, error: "Invalid business plan specifications payload." };
  }
  specs.businessModel = resolveBusinessPlanModel(specs);
  const isInstitutionalPlan = specs.isInstitutional === true;
  const modelIssues = validateBusinessPlanModelSpecs(specs);
  if (modelIssues.length) return { success: false, error: modelIssues.join(" ") };

  // ── Workspace ownership & status ──────────────────────────────────────────
  const { data: ws } = await db
    .from("project_workspaces")
    .select(
      "id, student_id, supervisor_id, institution_id, workspace_type, level, course, status, final_project_status, business_plan_specs"
    )
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    return { success: false, error: "Unauthorized." };
  }
  if (ws.workspace_type !== "business_plan") {
    return { success: false, error: "This workspace is not configured as a TVET Business Plan." };
  }
  if (ws.workspace_type !== "business_plan" && ws.status !== "approved" && ws.status !== "submitted") {
    return {
      success: false,
      error:
        "Your business plan topic must be approved by your supervisor before you can build the full draft.",
    };
  }

  // ── Profile defaults ───────────────────────────────────────────────────────
  const [{ data: profile }, { data: supervisor }] = await Promise.all([
    db
      .from("profiles")
      .select("full_name, admission_number, institutions(name)")
      .eq("id", user.id)
      .maybeSingle(),
    ws.supervisor_id
      ? db.from("profiles").select("full_name").eq("id", ws.supervisor_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const profileInstitution = profile?.institutions as
    | { name?: string }
    | { name?: string }[]
    | null;
  const profileInstitutionName = Array.isArray(profileInstitution)
    ? profileInstitution[0]?.name
    : profileInstitution?.name;
  const { data: workspaceInstitution } =
    !profileInstitutionName && ws.institution_id
      ? await db.from("institutions").select("name").eq("id", ws.institution_id).maybeSingle()
      : { data: null };

  if (!specs.candidateName && profile?.full_name) specs.candidateName = profile.full_name;
  if (!specs.admissionNumber && profile?.admission_number)
    specs.admissionNumber = profile.admission_number;
  if (!specs.institutionName) {
    const name = profileInstitutionName || workspaceInstitution?.name;
    if (name) specs.institutionName = name;
  }
  if (!specs.supervisorName && supervisor?.full_name) specs.supervisorName = supervisor.full_name;
  if (!specs.course) specs.course = ws.course;

  // ── Validation ────────────────────────────────────────────────────────────
  const requiredText: Array<keyof BusinessPlanSpecs> = isInstitutionalPlan
    ? ["businessName", "industrySector", "institutionName", "course", "county", "townOrMarket", "primaryProduct"]
    : ["businessName", "industrySector", "candidateName", "admissionNumber", "institutionName", "course", "county", "townOrMarket", "primaryProduct"];
  const requiredFieldLabels: Partial<Record<keyof BusinessPlanSpecs, string>> = {
    businessName: "Business name",
    industrySector: "Industry sector",
    candidateName: "Candidate name",
    admissionNumber: "Admission number",
    institutionName: "Training institution",
    course: "Course",
    county: "County",
    townOrMarket: "Town or market",
    primaryProduct: "Primary product",
  };
  for (const field of requiredText) {
    if (typeof specs[field] !== "string" || !String(specs[field]).trim()) {
      return {
        success: false,
        error: `${requiredFieldLabels[field] ?? "This field"} is required.`,
      };
    }
  }
  if (
    !["Sole Proprietorship", "Partnership", "Private Limited Company"].includes(
      specs.formOfOwnership
    )
  ) {
    return { success: false, error: "Choose a valid form of ownership." };
  }

  const numericFields: Array<keyof BusinessPlanSpecs> = [
    "unitSellingPrice",
    "unitCostOfProduction",
    "monthlyProductionUnitsYear1",
    "annualGrowthRateYear2",
    "annualGrowthRateYear3",
    "projectedMarketSharePercentage",
    "monthlyRent",
    "preOperationalCosts",
    "workingCapitalBuffer",
    "ownerEquityAmount",
    "loanAmount",
    "loanInterestRateAnnual",
    "loanTenureMonths",
  ];
  for (const field of numericFields) {
    const value = specs[field];
    const lowerBound = field === "annualGrowthRateYear2" || field === "annualGrowthRateYear3" ? -1 : 0;
    const upperBound = field === "loanInterestRateAnnual" || field === "projectedMarketSharePercentage" ? 100 : 1_000_000_000;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < lowerBound ||
      value > upperBound
    ) {
      return { success: false, error: `Enter a valid value for ${field}.` };
    }
  }

  const lists = [specs.competitors, specs.machinery, specs.rawMaterials, specs.staffing];
  if (lists.some((items) => !Array.isArray(items) || items.length > 100)) {
    return { success: false, error: "Review the competitor, equipment, materials, and staffing lists." };
  }
  const isText = (value: unknown) => typeof value === "string" && value.length <= 2_000;
  const isAmount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
  if (
    !specs.competitors.every((item) => item && isText(item.name) && isText(item.location) && isText(item.priceLevel) && isText(item.strengths) && isText(item.weaknesses)) ||
    !specs.machinery.every((item) => item && isText(item.item) && isText(item.supplier) && Number.isInteger(item.quantity) && item.quantity >= 0 && isAmount(item.unitCost)) ||
    !specs.rawMaterials.every((item) => item && isText(item.material) && isText(item.monthlyQuantity) && isText(item.supplier) && isAmount(item.monthlyCost)) ||
    !specs.staffing.every((item) => item && isText(item.position) && isText(item.duties) && isText(item.qualifications) && Number.isInteger(item.count) && item.count >= 0 && isAmount(item.monthlySalary))
  ) {
    return { success: false, error: "Check the values in your competitor, equipment, material, and staffing lists." };
  }
  if (
    !specs.monthlyOverheads ||
    ![
      specs.monthlyOverheads.rent,
      specs.monthlyOverheads.electricity,
      specs.monthlyOverheads.water,
      specs.monthlyOverheads.transport,
      specs.monthlyOverheads.marketing,
      specs.monthlyOverheads.stationeryMisc,
    ].every(isAmount)
  ) {
    return { success: false, error: "Enter valid monthly overhead amounts." };
  }

  // ── 1. Persist specs & commit deterministic bulk draft IMMEDIATELY ───────
  // Save user inputs and deterministic sections BEFORE any external AI/research
  // network call so built work always persists in the DB even if connectivity drops.
  const priorSpecs = ws.business_plan_specs as BusinessPlanSpecs | null;
  const priorResearch = priorSpecs?.research;
  const canReuseResearch = Boolean(
    priorResearch?.summary &&
      Array.isArray(priorResearch.sources) &&
      resolveBusinessPlanModel(priorSpecs) === specs.businessModel &&
      priorSpecs?.businessName === specs.businessName &&
      priorSpecs?.industrySector === specs.industrySector &&
      priorSpecs?.primaryProduct === specs.primaryProduct &&
      priorSpecs?.county === specs.county &&
      priorSpecs?.townOrMarket === specs.townOrMarket
  );

  const stubResearch: BusinessPlanResearch = canReuseResearch
    ? (priorResearch as BusinessPlanResearch)
    : {
        summary: `Market research for ${specs.businessName} in ${specs.industrySector} (${specs.county}).`,
        sources: [],
        searchedAt: new Date().toISOString(),
      };

  // ── Determine pending chapters ────────────────────────────────────────────
  const sectionDefinitions = getWorkspaceSections("business_plan", ws.level, specs.businessModel).filter(
    (definition) => !(
      isInstitutionalPlan &&
      ["prelim.declaration", "prelim.dedication", "prelim.acknowledgements"].includes(definition.key)
    )
  );
  const { data: existingSections, error: existingSectionsError } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  if (existingSectionsError) {
    return { success: false, error: "Could not check the saved sections. Retry the build." };
  }
  if (isInstitutionalPlan && replaceExisting) {
    const { error: obsoletePreliminariesError } = await db
      .from("workspace_sections")
      .delete()
      .eq("workspace_id", workspaceId)
      .in("section_key", ["prelim.declaration", "prelim.dedication", "prelim.acknowledgements"]);
    if (obsoletePreliminariesError) {
      return { success: false, error: "Could not remove obsolete preliminary pages. Retry the rebuild." };
    }
  }
  const existingByKey = new Map(
    (existingSections || []).map((s) => [s.section_key, s.current_text || ""])
  );
  const hasUserDedication = Boolean(specs.dedicationText?.trim());
  const hasUserAcknowledgements = Boolean(specs.acknowledgementsText?.trim());
  const pendingDefinitions = replaceExisting
    ? sectionDefinitions
    : sectionDefinitions.filter((def) => {
        if (def.key === "prelim.dedication" && hasUserDedication) return true;
        if (def.key === "prelim.acknowledgements" && hasUserAcknowledgements) return true;
        const currentText = existingByKey.get(def.key) || "";
        const starterText = getSectionStarterContent("business_plan", ws.level, def.key, specs.businessModel);
        return !currentText.trim() || (starterText !== "" && currentText === starterText);
      });
  const chapterKeys = [
    ...new Set(pendingDefinitions.map((def) => def.chapter || def.phase)),
  ] as string[];

  // ── Save specs immediately (with prior/stub research) ─────────────────────
  const priorExportMeta = priorSpecs as (BusinessPlanSpecs & {
    export_unlocked?: boolean;
    unlocked_at?: string;
    paystack_reference?: string;
  }) | null;
  const savedSpecs: BusinessPlanSpecs & {
    export_unlocked?: boolean;
    unlocked_at?: string;
    paystack_reference?: string;
  } = {
    ...specs,
    research: stubResearch,
    ...(priorExportMeta?.export_unlocked
      ? {
          export_unlocked: true,
          unlocked_at: priorExportMeta.unlocked_at,
          paystack_reference: priorExportMeta.paystack_reference,
        }
      : {}),
  };
  const fullTitle = `Business Plan for ${specs.businessName} in ${specs.townOrMarket}, ${specs.county}`;
  const executiveProfile = [
    `Business: ${specs.businessName}`,
    `Ownership: ${specs.formOfOwnership}`,
    `Location: ${specs.townOrMarket}, ${specs.county}`,
    `Product or service: ${specs.primaryProduct}`,
    `Sector: ${specs.industrySector}`,
  ].join("\n");

  const { error: saveError } = await db
    .from("project_workspaces")
    .update({
      title: fullTitle,
      problem_area: executiveProfile,
      business_plan_specs: savedSpecs,
    })
    .eq("id", workspaceId);
  if (saveError) {
    return {
      success: false,
      error: saveError.message || "Could not save business plan details.",
    };
  }

  const preservedSectionsCount = sectionDefinitions.length - pendingDefinitions.length;
  let totalGeneratedSections = 0;
  let totalPreservedSections = preservedSectionsCount;
  let factReviewWarning = false;
  let chaptersBuilt = 0;

  let activeProvider: BusinessPlanAIProvider = aiProvider;
  let fallbackProvider: BusinessPlanAIProvider | null = null;
  let providerAvailable = false;
  try {
    const resolved = resolveAvailableBusinessPlanProvider(aiProvider);
    activeProvider = resolved.primary;
    fallbackProvider = resolved.fallback;
    providerAvailable = true;
  } catch {
    factReviewWarning = true;
  }

  const scriptedSections = new Map(
    buildCompleteBusinessPlan(savedSpecs).map((s) => [s.section_key, s.content])
  );

  const baselineSections = pendingDefinitions.map((def) => ({
    section_key: def.key,
    position: sectionDefinitions.findIndex((item) => item.key === def.key) + 1,
    current_text:
      scriptedSections.get(def.key) ||
      `### ${def.title}\n\n[Add verified information for this section.]`,
    starter_text: getSectionStarterContent("business_plan", ws.level, def.key, specs.businessModel),
  }));

  const baselineConflicts = getBusinessModelConflictFindings(
    specs,
    baselineSections.map((section) => ({ key: section.section_key, content: section.current_text }))
  );
  if (baselineConflicts.length) {
    return {
      success: false,
      error: `Generated text conflicts with the selected business model in ${baselineConflicts.map((item) => item.sectionKey).join(", ")}. Review the model-specific template before saving.`,
    };
  }

  if (baselineSections.length > 0) {
    if (replaceExisting) {
      for (const section of baselineSections) {
        const { data: savedSection, error: saveSectionError } = await db
          .from("workspace_sections")
          .upsert(
            {
              workspace_id: workspaceId,
              section_key: section.section_key,
              phase: "project",
              position: section.position,
              current_text: section.current_text,
              status: "draft",
            },
            { onConflict: "workspace_id,section_key" }
          )
          .select("id")
          .single();
        if (saveSectionError || !savedSection) {
          factReviewWarning = true;
          continue;
        }
        const { error: versionError } = await db.from("section_versions").insert({
          section_id: savedSection.id,
          text: section.current_text,
          source: "ai_generated_draft",
          ai_chars_accepted: 0,
        });
        if (versionError) factReviewWarning = true;
        totalGeneratedSections += 1;
      }
    } else {
      const { data: generationStats, error: generationError } = await db.rpc(
        "fill_empty_business_plan_sections",
        {
          p_workspace_id: workspaceId,
          p_user_id: user.id,
          p_sections: baselineSections,
        }
      );
      if (generationError) {
        for (const section of baselineSections) {
          const previousText = existingByKey.get(section.section_key);
          const sectionValues = {
            workspace_id: workspaceId,
            section_key: section.section_key,
            phase: "project",
            position: section.position,
            current_text: section.current_text,
            status: "draft",
          };
          const saveResult = previousText === undefined
            ? await db.from("workspace_sections").insert(sectionValues).select("id").maybeSingle()
            : await db
                .from("workspace_sections")
                .update(sectionValues)
                .eq("workspace_id", workspaceId)
                .eq("section_key", section.section_key)
                .eq("current_text", previousText)
                .select("id")
                .maybeSingle();
          const savedSection = saveResult.data;
          if (!savedSection) {
            factReviewWarning = true;
            continue;
          }
          const { error: versionError } = await db.from("section_versions").insert({
            section_id: savedSection.id,
            text: section.current_text,
            source: "ai_generated_draft",
            ai_chars_accepted: 0,
          });
          if (versionError) factReviewWarning = true;
          totalGeneratedSections += 1;
        }
        factReviewWarning = true;
      } else {
        const stats = Array.isArray(generationStats) ? generationStats[0] : null;
        totalGeneratedSections += Number(stats?.generated_sections) || 0;
        totalPreservedSections += Number(stats?.preserved_sections) || 0;
      }
    }
  }

  // ── 1b. Live Research (after deterministic draft is safely persisted) ─────
  let research: BusinessPlanResearch = stubResearch;
  if (!canReuseResearch && providerAvailable) {
    try {
      research = await researchBusinessPlan(specs, activeProvider);
      savedSpecs.research = research;
      await db
        .from("project_workspaces")
        .update({ business_plan_specs: savedSpecs })
        .eq("id", workspaceId);
    } catch {
      factReviewWarning = true;
    }
  } else if (!canReuseResearch) {
    factReviewWarning = true;
  }

  // ── 2. Bounded AI refinement pass across pending chapters ─────────────────
  const aiBuildDeadline = Date.now() + 24_000;
  let aiProviderExhausted = false;

  for (const chapterKey of chapterKeys) {
    const definitions = sectionDefinitions.filter(
      (def) => (def.chapter || def.phase) === chapterKey
    );
    const pending = replaceExisting
      ? definitions
      : definitions.filter((def) => {
          const currentText = existingByKey.get(def.key) || "";
          const starterText = getSectionStarterContent("business_plan", ws.level, def.key, specs.businessModel);
          return !currentText.trim() || (starterText !== "" && currentText === starterText);
        });

    if (pending.length === 0) {
      chaptersBuilt += 1;
      continue;
    }

    if (!providerAvailable || aiProviderExhausted || Date.now() >= aiBuildDeadline) {
      factReviewWarning = true;
      chaptersBuilt += 1;
      continue;
    }

    let aiCorrections = new Map<string, string>();
    try {
      aiCorrections = await draftBusinessPlanSections(
        savedSpecs,
        pending,
        research,
        scriptedSections,
        activeProvider
      );
    } catch (error) {
      if (fallbackProvider && Date.now() < aiBuildDeadline) {
        console.warn(`${activeProvider} build failed, falling back to ${fallbackProvider}:`, error);
        try {
          aiCorrections = await draftBusinessPlanSections(
            savedSpecs,
            pending,
            research,
            scriptedSections,
            fallbackProvider
          );
          activeProvider = fallbackProvider;
          fallbackProvider = null;
        } catch {
          factReviewWarning = true;
          aiProviderExhausted = true;
        }
      } else {
        factReviewWarning = true;
        aiProviderExhausted = true;
      }
    }

    for (const def of pending) {
      const baselineText =
        scriptedSections.get(def.key) ||
        `### ${def.title}\n\n[Add verified information for this section.]`;
      const refinedText = aiCorrections.get(def.key);
      if (!refinedText || refinedText === baselineText) {
        if (!aiCorrections.has(def.key)) factReviewWarning = true;
        continue;
      }
      if (getBusinessModelConflictFindings(specs, [{ key: def.key, content: refinedText }]).length) {
        continue;
      }
      const { data: updatedSection } = await db
        .from("workspace_sections")
        .update({ current_text: refinedText, status: "draft" })
        .eq("workspace_id", workspaceId)
        .eq("section_key", def.key)
        .eq("current_text", baselineText)
        .select("id")
        .maybeSingle();
      if (updatedSection) {
        await db.from("section_versions").insert({
          section_id: updatedSection.id,
          text: refinedText,
          source: "ai_generated_draft",
          ai_chars_accepted: 0,
        });
      }
    }
    chaptersBuilt += 1;
  }

  // ── Auto-submit completed business plan to Admin / Supervisor Review ──────
  if (!isInstitutionalPlan && !specs.adminOnly) {
    const nextFinalStatus = ws.final_project_status === "approved" ? "approved" : "pending_review";
    await db
      .from("project_workspaces")
      .update({
        status: "approved",
        final_project_status: nextFinalStatus,
        final_project_submitted_at: new Date().toISOString(),
      })
      .eq("id", workspaceId);

    try {
      await queueApprovedBusinessPlanListing(workspaceId);
    } catch (queueError) {
      console.warn("Could not auto-queue business plan for marketplace review:", queueError);
    }
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  const { error: auditLogError } = await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Built ${totalGeneratedSections} business plan sections across ${chaptersBuilt} chapters for "${specs.businessName}" and submitted to Admin Review.`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });
  if (auditLogError) factReviewWarning = true;

  // ── Single revalidation at the end ────────────────────────────────────────
  // Called once, after every DB write has committed. This is the only safe
  // point: calling revalidatePath earlier triggers RSC re-renders mid-build.
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/admin");
  revalidatePath("/supervisor");

  return {
    success: true,
    businessName: specs.businessName,
    totalSections: totalGeneratedSections,
    preservedSections: totalPreservedSections,
    researchSources: research.sources,
    factReviewWarning,
    chaptersBuilt,
    chaptersTotal: chapterKeys.length,
  };
}


async function getBusinessPlanCorrectionActor(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to use the correction chat.");
  const db = getServerDbClient(supabase);
  const [{ data: profile }, { data: workspace }] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).single(),
    db.from("project_workspaces")
      .select("id, student_id, supervisor_id, status, final_project_status, workspace_type, level, business_plan_specs")
      .eq("id", workspaceId).maybeSingle(),
  ]);
  if (!workspace || workspace.workspace_type !== "business_plan") throw new Error("Business plan not found.");
  const role = profile?.role;
  const isAllowed = role === "admin" ||
    (role === "supervisor" && workspace.supervisor_id === user.id) ||
    (role === "student" && workspace.student_id === user.id);
  if (!isAllowed) throw new Error("You do not have access to this business plan.");
  if (
    role === "student" &&
    (workspace.business_plan_specs as Record<string, unknown> | null)?.export_unlocked !== true
  ) {
    throw new Error("Unlock the Word Export (KES 350) to view and edit raw section manuscripts.");
  }
  if (workspace.status === "closed") {
    throw new Error("This project is closed.");
  }
  if (workspace.status !== "approved" && workspace.status !== "submitted") {
    throw new Error("The topic must be approved before correcting project chapters.");
  }
  return { db, user, workspace };
}

export async function chatAboutBusinessPlanFindingAction(formData: FormData): Promise<
  | { success: true; reply: string; proposedText: string; baseText: string; baseUpdatedAt: string }
  | { success: false; error: string }
> {
  try {
  const workspaceId = formData.get("workspaceId")?.toString() || "";
  const sectionKey = formData.get("sectionKey")?.toString() || "";
  const issue = formData.get("issue")?.toString().trim() || "";
  const recommendation = formData.get("recommendation")?.toString().trim() || "";
  const providerValue = formData.get("provider")?.toString();
  const provider: BusinessPlanAIProvider = providerValue === "gemini" ? "gemini" : "groq";
  if (providerValue !== "gemini" && providerValue !== "groq") throw new Error("Choose Gemini or Groq.");
  if (!workspaceId || !sectionKey || !issue || !recommendation || issue.length > 1500 || recommendation.length > 1500) {
    throw new Error("The review finding is incomplete or too long.");
  }
  if (sectionKey.startsWith("ch5.")) throw new Error("AI correction chat is disabled for financial statements and calculated totals.");

  let messages: BusinessPlanCorrectionChatMessage[];
  try {
    const value = JSON.parse(formData.get("messages")?.toString() || "[]");
    if (!Array.isArray(value) || value.length > 10 || value.some((item) =>
      !item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string" || item.content.length > 2000
    )) throw new Error();
    messages = value as BusinessPlanCorrectionChatMessage[];
  } catch {
    throw new Error("The chat history is invalid. Start a new correction chat.");
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") throw new Error("Enter a correction question first.");

  const { db, workspace } = await getBusinessPlanCorrectionActor(workspaceId);
  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  if (!specs) throw new Error("Business plan details are missing.");
  const definitions = getWorkspaceSections("business_plan", workspace.level, resolveBusinessPlanModel(specs));
  const definition = definitions.find((item) => item.key === sectionKey);
  if (!definition) throw new Error("Choose a valid business-plan section.");
  const { data: section } = await db.from("workspace_sections")
    .select("id, current_text, updated_at").eq("workspace_id", workspaceId).eq("section_key", sectionKey).maybeSingle();
  if (!section) throw new Error("The section could not be found.");

  const currentProposal = formData.get("currentProposal")?.toString().slice(0, 30000) || "";
  const result = await respondToBusinessPlanCorrectionChat({
    provider,
    specs,
    sectionKey,
    sectionTitle: definition.title,
    sectionText: section.current_text || "",
    issue,
    recommendation,
    messages,
    currentProposal,
  });
  return {
    success: true,
    ...result,
    baseText: section.current_text || "",
    baseUpdatedAt: section.updated_at,
  };
  } catch (error) {
    console.error("Business plan correction chat failed", error);
    const message = error instanceof Error ? error.message : "The correction chat could not respond.";
    const safeMessage = message
      .replace(/(?:AIza[0-9A-Za-z_-]{20,}|gsk_[0-9A-Za-z_-]{20,})/g, "[redacted]")
      .slice(0, 500);
    return { success: false, error: safeMessage };
  }
}

export async function applyBusinessPlanCorrectionProposalAction(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString() || "";
  const sectionKey = formData.get("sectionKey")?.toString() || "";
  const proposedText = formData.get("proposedText")?.toString() || "";
  const baseText = formData.get("baseText")?.toString() || "";
  const baseUpdatedAt = formData.get("baseUpdatedAt")?.toString() || "";
  if (!workspaceId || !sectionKey || !proposedText.trim() || proposedText.length > 30000 || !baseUpdatedAt) {
    throw new Error("The correction proposal is invalid.");
  }
  if (sectionKey.startsWith("ch5.")) throw new Error("AI correction cannot edit financial calculations.");
  const { db, user, workspace } = await getBusinessPlanCorrectionActor(workspaceId);
  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  if (!specs) throw new Error("Business plan details are missing.");
  if (getBusinessModelConflictFindings(specs, [{ key: sectionKey, content: proposedText }]).length) {
    throw new Error("This proposal conflicts with the selected business model. Refine it before applying.");
  }
  const { data: section } = await db.from("workspace_sections")
    .select("id, current_text, status, updated_at").eq("workspace_id", workspaceId).eq("section_key", sectionKey).maybeSingle();
  if (!section) throw new Error("The section could not be found.");
  if (section.updated_at !== baseUpdatedAt || section.current_text !== baseText) {
    throw new Error("This section changed after the proposal was prepared. Refresh the review and request a new proposal.");
  }
  if (proposedText === section.current_text) throw new Error("The proposal does not change this section.");

  const { error } = await db.from("workspace_sections").update({
    current_text: proposedText,
    status: section.status === "empty" ? "draft" : section.status,
  }).eq("id", section.id).eq("workspace_id", workspaceId);
  if (error) throw new Error(error.message || "Could not apply the correction.");
  const { error: versionError } = await db.from("section_versions").insert({
    section_id: section.id,
    text: proposedText,
    source: "ai_generated_draft",
    ai_chars_accepted: proposedText.length,
  });
  if (versionError) throw new Error(versionError.message || "The correction was saved, but version history could not be updated.");
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Applied an AI-assisted correction to ${sectionKey} after review.`,
    auto_generated: true,
    student_signed_at: workspace.student_id === user.id ? new Date().toISOString() : null,
    supervisor_signed_at: workspace.supervisor_id === user.id ? new Date().toISOString() : null,
  });
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${encodeURIComponent(sectionKey)}`);
  return { success: true };
}

export async function reviewBusinessPlanDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  const aiProvider = getBusinessPlanAIProvider(formData);
  if (!workspaceId) throw new Error("Missing workspace ID.");

  const db = getServerDbClient(supabase);
  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, student_id, workspace_type, level, business_plan_specs")
    .eq("id", workspaceId)
    .single();
  if (!workspace || workspace.student_id !== user.id) throw new Error("Unauthorized.");
  if (workspace.workspace_type !== "business_plan") throw new Error("This is not a business plan workspace.");

  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  const research = specs?.research;
  if (!specs || !research?.summary || !Array.isArray(research.sources)) {
    throw new Error("Build the business plan before reviewing the full document.");
  }

  const { data: rows, error: rowsError } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  if (rowsError) throw new Error(rowsError.message || "Could not load the business plan sections.");

  const contentByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const sections = getWorkspaceSections("business_plan", workspace.level, resolveBusinessPlanModel(specs))
    .map((definition) => ({
      key: definition.key,
      title: definition.title,
      guidance: definition.guidance,
      content: contentByKey.get(definition.key) || "",
    }))
    .filter((section) => section.content.trim());
  if (sections.length === 0) throw new Error("No generated sections are available to review.");

  const result = await reviewWholeBusinessPlan(
    specs,
    sections,
    research as BusinessPlanResearch,
    aiProvider
  );
  return {
    success: true as const,
    ...result,
    researchSources: research.sources,
  };
}

export async function createAndBuildResearchWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);
  const { data: existingProfile } = await db
    .from("profiles")
    .select("role, institution_id, full_name, admission_number, institutions(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!hasStudioAccess(existingProfile)) {
    throw new Error("Project Studio is restricted to enrolled class students. Enter your trainer's Class Access Code first.");
  }

  const isAdminMaster = existingProfile?.role === "admin";
  const level = (formData.get("level")?.toString() === "craft" ? "craft" : "diploma") as WorkspaceLevel;
  const topicId = formData.get("topicId")?.toString().trim() || RESEARCH_TOPIC_CATALOGUE[0].id;
  const kind = (formData.get("kind")?.toString() === "proposal" ? "proposal" : "full") as "proposal" | "full";
  const customTitle = formData.get("customTitle")?.toString().trim();
  const dedicationText = formData.get("dedicationText")?.toString().trim();
  const acknowledgementsText = formData.get("acknowledgementsText")?.toString().trim();

  const blueprint = RESEARCH_TOPIC_CATALOGUE.find((t) => t.id === topicId) || RESEARCH_TOPIC_CATALOGUE[0];
  const finalTitle = customTitle || blueprint.title;
  const institutionId = isAdminMaster ? null : (existingProfile?.institution_id || null);

  const { data: workspace, error: wsErr } = await db
    .from("project_workspaces")
    .insert({
      student_id: user.id,
      supervisor_id: null,
      institution_id: institutionId,
      workspace_type: "research_secondary",
      level,
      course: blueprint.course,
      title: finalTitle,
      problem_area: blueprint.problemContext,
      status: isAdminMaster ? "approved" : "proposal_pending",
    })
    .select("id")
    .single();

  if (wsErr || !workspace) {
    throw new Error(wsErr?.message || "Failed to create research workspace.");
  }

  const specs = buildResearchSpecsFromBlueprint(blueprint, {
    level,
    seed: `${workspace.id}|${blueprint.id}`,
    identity: { mode: "master" },
    kind,
  });
  specs.title = finalTitle;
  if (dedicationText) specs.dedicationText = dedicationText;
  if (acknowledgementsText) specs.acknowledgementsText = acknowledgementsText;

  const generated = buildResearchDocument(specs, kind);
  const rows = generated.map((sec, idx) => ({
    workspace_id: workspace.id,
    section_key: sec.section_key,
    phase: "project",
    position: idx + 1,
    current_text: sec.content,
    status: "draft",
  }));

  const { error: secErr } = await db
    .from("workspace_sections")
    .upsert(rows, { onConflict: "workspace_id,section_key" });

  if (secErr) {
    throw new Error(secErr.message || "Failed to save research sections.");
  }

  revalidatePath("/studio");
  redirect(`/studio/${workspace.id}`);
}

export async function buildCompleteResearchProjectAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  const kind = (formData.get("kind")?.toString() === "proposal" ? "proposal" : "full") as "proposal" | "full";
  const topicId = formData.get("topicId")?.toString().trim();
  const dedicationText = formData.get("dedicationText")?.toString().trim();
  const acknowledgementsText = formData.get("acknowledgementsText")?.toString().trim();
  const confirmReplace = formData.get("confirmReplace")?.toString() === "true";
  if (!workspaceId) return { error: "Missing workspace ID." };

  const db = getServerDbClient(supabase);
  const [{ data: profile }, { data: workspace }] = await Promise.all([
    db.from("profiles").select("role, full_name, admission_number, institution_id, institutions(name)").eq("id", user.id).maybeSingle(),
    db.from("project_workspaces").select("id, student_id, workspace_type, level, course, title, problem_area").eq("id", workspaceId).maybeSingle(),
  ]);

  if (!workspace || (workspace.student_id !== user.id && profile?.role !== "admin")) {
    return { error: "Workspace not found or unauthorized." };
  }
  if (workspace.workspace_type !== "research_secondary") {
    return { error: "Research builder is only available for secondary-data research workspaces." };
  }

  const blueprint =
    (topicId ? RESEARCH_TOPIC_CATALOGUE.find((t) => t.id === topicId) : undefined) ||
    findBestResearchBlueprint(workspace.title);

  const specs = buildResearchSpecsFromBlueprint(blueprint, {
    level: workspace.level,
    seed: `${workspace.id}|${blueprint.id}`,
    identity: { mode: "master" },
    kind,
  });
  if (workspace.title) specs.title = workspace.title;
  if (workspace.problem_area) specs.problemContext = workspace.problem_area;
  if (dedicationText) specs.dedicationText = dedicationText;
  if (acknowledgementsText) specs.acknowledgementsText = acknowledgementsText;

  const generated = buildResearchDocument(specs, kind);
  const { data: existingRows } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);

  const existingByKey = new Map((existingRows || []).map((r) => [r.section_key, r.current_text || ""]));
  const rowsToUpsert = generated
    .map((item, i) => ({ item, position: i + 1 }))
    .filter(({ item }) => {
      if (confirmReplace) return true;
      if (item.section_key === "prelim.dedication" && dedicationText) return true;
      if (item.section_key === "prelim.acknowledgements" && acknowledgementsText) return true;
      const prev = existingByKey.get(item.section_key) || "";
      return !prev.trim();
    })
    .map(({ item, position }) => ({
      workspace_id: workspaceId,
      section_key: item.section_key,
      phase: "project",
      position,
      current_text: item.content,
      status: "draft",
    }));

  if (rowsToUpsert.length > 0) {
    const { error: upsertErr } = await db
      .from("workspace_sections")
      .upsert(rowsToUpsert, { onConflict: "workspace_id,section_key" });
    if (upsertErr) {
      return { error: upsertErr.message || "Could not save research project sections." };
    }
  }

  revalidatePath(`/studio/${workspaceId}`);
  return { success: true as const, sectionsCount: generated.length, kind };
}

export async function publishBusinessPlanToMarketplace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID.");

  const db = getServerDbClient(supabase);
  const [{ data: profile }, { data: workspace }] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    db.from("project_workspaces")
      .select("id, student_id, workspace_type, final_project_status")
      .eq("id", workspaceId).maybeSingle(),
  ]);
  const isAdmin = profile?.role === "admin";
  if (!workspace || (workspace.student_id !== user.id && !isAdmin)) throw new Error("This project is not yours.");
  if (workspace.workspace_type !== "business_plan" && workspace.workspace_type !== "research_secondary") {
    throw new Error("Only business plans and secondary-data research projects can be submitted from this workspace.");
  }
  if (workspace.final_project_status !== "approved") {
    if (isAdmin) {
      await db.from("project_workspaces").update({
        status: "approved",
        final_project_status: "approved",
        final_project_approved_at: new Date().toISOString(),
      }).eq("id", workspaceId);
    } else {
      throw new Error("A supervisor must approve the complete project before marketplace publication.");
    }
  }

  await queueApprovedBusinessPlanListing(workspaceId);

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/projects");
  revalidatePath("/admin");
}



