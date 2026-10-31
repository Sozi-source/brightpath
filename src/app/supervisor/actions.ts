"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import {
  reviewWholeBusinessPlan,
  type BusinessPlanAIProvider,
  type BusinessPlanResearch,
} from "@/lib/studio/businessPlanGeneration";
import type { BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function verifySupervisorOrAdmin(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSupervisorOrAdmin =
    profile?.role === "admin" || profile?.role === "supervisor";

  if (!isSupervisorOrAdmin) {
    throw new Error("Unauthorized: Only faculty supervisors or admins can perform this review.");
  }

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, supervisor_id, status")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  return { supabase: db, user, workspace, role: profile?.role };
}

export async function reviewSupervisorBusinessPlanDocument(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const providerValue = formData.get("aiProvider")?.toString();
  const provider: BusinessPlanAIProvider = providerValue === "gemini" || providerValue === "groq"
    ? providerValue
    : "gemini";
  if (!workspaceId) throw new Error("Missing workspace ID.");

  const { supabase, user, workspace, role } = await verifySupervisorOrAdmin(workspaceId);
  if (role !== "admin" && workspace.supervisor_id !== user.id) {
    throw new Error("Unauthorized: this workspace is assigned to another supervisor.");
  }

  const { data: fullWorkspace, error: workspaceError } = await supabase
    .from("project_workspaces")
    .select("id, workspace_type, level, business_plan_specs")
    .eq("id", workspaceId)
    .single();
  if (workspaceError || !fullWorkspace) throw new Error(workspaceError?.message || "Workspace not found.");
  if (fullWorkspace.workspace_type !== "business_plan") {
    throw new Error("Whole-document AI review is available for business plans only.");
  }

  const specs = fullWorkspace.business_plan_specs as BusinessPlanSpecs | null;
  const research = specs?.research;
  if (!specs || !research?.summary || !Array.isArray(research.sources)) {
    throw new Error("The candidate must build the business plan before it can be reviewed.");
  }

  const { data: rows, error: rowsError } = await supabase
    .from("workspace_sections")
    .select("section_key, current_text")
    .eq("workspace_id", workspaceId);
  if (rowsError) throw new Error(rowsError.message || "Could not load business-plan sections.");

  const contentByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const sections = getWorkspaceSections("business_plan", fullWorkspace.level)
    .map((definition) => ({
      key: definition.key,
      title: definition.title,
      guidance: definition.guidance,
      content: contentByKey.get(definition.key) || "",
    }))
    .filter((section) => section.content.trim());
  if (sections.length === 0) throw new Error("No generated sections are available to review.");

  const result = await reviewWholeBusinessPlan(specs, sections, research as BusinessPlanResearch, provider);
  return { success: true as const, ...result, researchSources: research.sources };
}

export async function approveProposal(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const comment =
    formData.get("comment")?.toString().trim() ||
    "Topic and drafted sections formally reviewed and approved.";

  if (!workspaceId) throw new Error("Missing workspace ID.");

  const { supabase, user, workspace } = await verifySupervisorOrAdmin(workspaceId);

  // 1. Insert supervisor review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "approved",
    comment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. Update workspace status to 'approved' (unlocks Chapter 1+ or confirms review).
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

  // 3. Auto-generate Annex 12 log entry
  const logActivity =
    workspace.status === "submitted"
      ? "Chapter Review Moderation: Candidate drafted chapters reviewed and approved by supervisor."
      : "Topic Moderation: Candidate project topic formally approved; Chapter 1 unlocked.";

  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: logActivity,
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath(`/studio/${workspaceId}`);
}

export async function requestProposalChanges(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const comment = formData.get("comment")?.toString().trim();

  if (!workspaceId || !comment) {
    throw new Error("A clear feedback comment is required when requesting modifications.");
  }

  const { supabase, user, workspace } = await verifySupervisorOrAdmin(workspaceId);

  // 1. Insert review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "changes_requested",
    comment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. If already approved or submitted (student is revising chapters), keep status 'approved' so chapters stay unlocked.
  //    If still in 'proposal_pending' (Topic stage), return to 'ideation'.
  const isChapterStage = workspace.status === "approved" || workspace.status === "submitted";
  const nextStatus = isChapterStage ? "approved" : "ideation";

  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: nextStatus,
    })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

  // 3. Auto-generate log entry
  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: isChapterStage
      ? "Chapter Moderation Review: Supervisor requested revisions on drafted chapters."
      : "Topic Moderation Review: Supervisor requested revisions on project topic.",
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath(`/studio/${workspaceId}`);
}

export async function updateProposalTitle(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const title = formData.get("title")?.toString().trim();

  if (!workspaceId || !title) throw new Error("Missing workspace ID or title.");

  const { supabase } = await verifySupervisorOrAdmin(workspaceId);

  const { error } = await supabase
    .from("project_workspaces")
    .update({ title })
    .eq("id", workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
}

export async function saveNotebookLmLinks(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "supervisor") {
    throw new Error("Unauthorized: Only faculty supervisors or admins can update NotebookLM links.");
  }

  const masterUrl = formData.get("notebookUrl")?.toString().trim() || null;

  const { error } = await db
    .from("platform_settings")
    .update({
      notebook_research_url: masterUrl,
      notebook_fabrication_url: masterUrl,
      notebook_business_url: masterUrl,
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/supervisor");
  revalidatePath("/studio", "layout");
}


