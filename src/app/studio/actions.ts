"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import {
  getWorkspaceSections,
  getSectionStarterContent,
} from "@/lib/studio/templates";
import { buildCompleteBusinessPlan } from "@/lib/studio/businessPlanBuilder";
import {
  draftBusinessPlanSections,
  researchBusinessPlan,
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
import type { BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";

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
    throw new Error("Student admission / registration number is required by KNEC.");
  }

  if (privacyConsent !== "on") {
    throw new Error("You must agree to the privacy and personal data notice to continue.");
  }

  // Automatically resolve student's existing institution or default institution + default supervisor
  const [{ data: existingProfile }, { data: defaultInst }, { data: defaultSupervisor }] =
    await Promise.all([
      db.from("profiles").select("institution_id").eq("id", user.id).maybeSingle(),
      db.from("institutions").select("id").limit(1).maybeSingle(),
      db
        .from("profiles")
        .select("id")
        .in("role", ["supervisor", "admin"])
        .limit(1)
        .maybeSingle(),
    ]);

  const institutionId = existingProfile?.institution_id || defaultInst?.id || null;
  const supervisorId = defaultSupervisor?.id || null;

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
      title: initialTitle,
      problem_area: initialProblem,
      status: initialTitle ? "proposal_pending" : "ideation",
    })
    .select("id")
    .single();

  if (wsErr || !workspace) {
    throw new Error(wsErr?.message || "Failed to initialize project workspace.");
  }

  // 3. Populate workspace sections
  const sectionDefs = getWorkspaceSections(workspaceType, level);
  const sectionsPayload = sectionDefs.map((def, idx) => {
    const starterText = getSectionStarterContent(workspaceType, level, def.key);

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
  if (initialTitle) {
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
    .select("id, student_id, status")
    .eq("id", workspaceId)
    .single();

  if (!existingWs || existingWs.student_id !== user.id) {
    throw new Error("Unauthorized.");
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
    .select("id, student_id, status")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.status !== "approved" && ws.status !== "submitted") {
    throw new Error("Your project topic must be approved by your supervisor first.");
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
    .select("id, student_id, workspace_type, level, course, title, problem_area, status")
    .eq("id", workspaceId)
    .single();
  if (!workspace || workspace.student_id !== user.id) throw new Error("Unauthorized.");
  if (workspace.workspace_type !== "business_plan") {
    throw new Error("This writing polish is for business plan sections.");
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

  if (ws.status === "approved" || ws.status === "submitted" || ws.status === "closed") {
    throw new Error("Approved or submitted projects cannot be deleted.");
  }

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

  if (!workspaceId) throw new Error("Missing workspace ID.");
  if (!rawSpecs) throw new Error("Missing business plan specifications.");

  let specs: BusinessPlanSpecs;
  try {
    specs = JSON.parse(rawSpecs) as BusinessPlanSpecs;
  } catch {
    throw new Error("Invalid business plan specifications payload.");
  }

  // 1. Fetch workspace and ensure ownership.
  const { data: ws } = await db
    .from("project_workspaces")
    .select("id, student_id, supervisor_id, institution_id, workspace_type, level, course, status, business_plan_specs")
    .eq("id", workspaceId)
    .single();

  if (!ws || ws.student_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (ws.workspace_type !== "business_plan") {
    throw new Error("This workspace is not configured as a TVET Business Plan.");
  }
  if (ws.status !== "approved" && ws.status !== "submitted") {
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

  const requiredText: Array<keyof BusinessPlanSpecs> = [
    "businessName",
    "industrySector",
    "candidateName",
    "admissionNumber",
    "institutionName",
    "course",
    "county",
    "townOrMarket",
    "primaryProduct",
  ];
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
    priorSpecs?.businessName === specs.businessName &&
    priorSpecs?.industrySector === specs.industrySector &&
    priorSpecs?.primaryProduct === specs.primaryProduct &&
    priorSpecs?.county === specs.county &&
    priorSpecs?.townOrMarket === specs.townOrMarket
  );
  const research = canReuseResearch
    ? priorResearch as BusinessPlanResearch
    : await researchBusinessPlan(specs);
  const sectionDefinitions = getWorkspaceSections("business_plan", ws.level);
  const { data: existingSections } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  const existingByKey = new Map(
    (existingSections || []).map((section) => [section.section_key, section.current_text || ""])
  );
  const pendingDefinitions = sectionDefinitions.filter((definition) => {
    const currentText = existingByKey.get(definition.key) || "";
    const starterText = getSectionStarterContent("business_plan", ws.level, definition.key);
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
    `Location: ${specs.streetOrBuilding}, ${specs.townOrMarket}, ${specs.county}`,
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

  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/craft`);
  revalidatePath(`/studio/${workspaceId}/problem`);
  revalidatePath("/studio");
  revalidatePath("/supervisor");

  return {
    success: true,
    businessName: specs.businessName,
    preservedSectionsCount,
    chapterKeys,
    researchSources: research.sources,
  };
}

export async function buildBusinessPlanChapterAction(formData: FormData): Promise<{
  success: true;
  generatedSections: number;
  preservedSections: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = formData.get("workspaceId")?.toString();
  const chapterKey = formData.get("chapterKey")?.toString();
  if (!workspaceId || !chapterKey) throw new Error("Missing workspace or chapter.");

  const db = getServerDbClient(supabase);
  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, student_id, workspace_type, level, status, business_plan_specs")
    .eq("id", workspaceId)
    .single();
  if (!workspace || workspace.student_id !== user.id) throw new Error("Unauthorized.");
  if (workspace.workspace_type !== "business_plan") throw new Error("This is not a business plan workspace.");
  if (workspace.status !== "approved" && workspace.status !== "submitted") {
    throw new Error("Your business plan topic must be approved before drafting chapters.");
  }

  const specs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  const research = specs?.research;
  if (!specs || !research?.summary || !Array.isArray(research.sources) || research.sources.length === 0) {
    throw new Error("Run business research before drafting the chapters.");
  }

  const definitions = getWorkspaceSections("business_plan", workspace.level).filter(
    (definition) => (definition.chapter || definition.phase) === chapterKey
  );
  if (definitions.length === 0) throw new Error("Business plan chapter not found.");

  const { data: rows } = await db
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  const existingByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const pending = definitions.filter((definition) => {
    const currentText = existingByKey.get(definition.key) || "";
    const starterText = getSectionStarterContent("business_plan", workspace.level, definition.key);
    return !currentText.trim() || (starterText !== "" && currentText === starterText);
  });
  if (pending.length === 0) {
    return { success: true, generatedSections: 0, preservedSections: definitions.length };
  }

  const aiDrafts = await draftBusinessPlanSections(
    specs,
    pending,
    research as BusinessPlanResearch
  );
  const scriptedSections = new Map(
    buildCompleteBusinessPlan(specs).map((section) => [section.section_key, section.content])
  );
  const draftSections = pending.map((definition) => ({
    section_key: definition.key,
    position: definitions.findIndex((item) => item.key === definition.key) + 1,
    current_text:
      aiDrafts.get(definition.key) ||
      scriptedSections.get(definition.key) ||
      `### ${definition.title}\n\n[Add verified information for this section.]`,
    starter_text: getSectionStarterContent("business_plan", workspace.level, definition.key),
  }));

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
  const generatedSections = Number(stats?.generated_sections) || 0;
  const preservedSections = Number(stats?.preserved_sections) || 0;

  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `Drafted ${generatedSections} business plan sections for ${chapterKey}.`,
    auto_generated: true,
    student_signed_at: new Date().toISOString(),
  });
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write`);

  return { success: true, generatedSections, preservedSections };
}



