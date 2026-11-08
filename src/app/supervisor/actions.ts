"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { queueApprovedBusinessPlanListing } from "@/lib/studio/marketplaceListing";
import {
  reviewWholeBusinessPlan,
  type BusinessPlanAIProvider,
  type BusinessPlanResearch,
} from "@/lib/studio/businessPlanGeneration";
import { resolveBusinessPlanModel, type BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { getBusinessModelConflictFindings } from "@/lib/studio/businessPlanProfiles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SectionReviewKind, SectionReviewStatus } from "@/types/database";
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
    .select("id, supervisor_id, status, final_project_status")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  return { supabase: db, user, workspace, role: profile?.role };
}

async function assertSectionCommentsResolved(db: SupabaseClient, workspaceId: string) {
  const { count, error } = await db.from("section_review_threads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["open", "answered"]);
  if (error) throw new Error(error.message || "Could not verify section comments.");
  if ((count || 0) > 0) throw new Error("Resolve every open section comment before approving this project.");
}

export async function approveCompletedProjectForMarketplace(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const comment = formData.get("comment")?.toString().trim() || "Completed project reviewed and approved for marketplace consideration.";
  if (!workspaceId) throw new Error("Missing workspace ID.");
  const { supabase: db, user, workspace, role } = await verifySupervisorOrAdmin(workspaceId);
  if (role !== "admin" && workspace.supervisor_id !== user.id) throw new Error("This project is assigned to another supervisor.");
  if (role !== "admin" && workspace.final_project_status !== "pending_review") {
    throw new Error("This project is not awaiting final review.");
  }
  await assertSectionCommentsResolved(db, workspaceId);

  const { data: fullWorkspace } = await db.from("project_workspaces")
    .select("workspace_type, level, business_plan_specs").eq("id", workspaceId).single();
  if (!fullWorkspace) throw new Error("Project not found.");
  const specs = fullWorkspace.business_plan_specs as BusinessPlanSpecs | null;
  const model = fullWorkspace.workspace_type === "business_plan" ? resolveBusinessPlanModel(specs) : undefined;
  const definitions = getWorkspaceSections(fullWorkspace.workspace_type, fullWorkspace.level, model);
  const { data: rows, error: rowsError } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (rowsError) throw new Error(rowsError.message || "Could not verify project sections.");
  if (fullWorkspace.workspace_type === "business_plan" && specs) {
    const conflicts = getBusinessModelConflictFindings(specs, (rows || []).map((row) => ({
      key: row.section_key,
      content: row.current_text || "",
    })));
    if (conflicts.length) throw new Error(`Resolve the business-model mismatch in ${conflicts.map((item) => item.sectionKey).join(", ")} before final approval.`);
  }
  const contentByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const incomplete = definitions.filter((definition) => {
    const words = (contentByKey.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length;
    return words < (definition.minWords || 30);
  });
  if (incomplete.length) throw new Error("The completed project no longer meets every section minimum.");

  const { error: statusError } = await db.from("project_workspaces")
    .update({ status: "approved", final_project_status: "approved", final_project_approved_at: new Date().toISOString() }).eq("id", workspaceId);

  if (statusError) throw new Error(statusError.message || "Could not record final approval.");

  try {
    if (fullWorkspace.workspace_type === "business_plan") {
      await queueApprovedBusinessPlanListing(workspaceId);
    }
  } catch (error) {
    await db.from("project_workspaces").update({ final_project_status: "pending_review", final_project_approved_at: null }).eq("id", workspaceId);
    throw error;
  }

  const { error: reviewError } = await db.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "approved",
    review_stage: "final_project",
    comment,
  });
  if (reviewError) throw new Error(reviewError.message || "Final approval was saved but its review record could not be written.");
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: fullWorkspace.workspace_type === "business_plan"
      ? "Supervisor approved the completed project; business plan published live to marketplace."
      : "Supervisor approved the completed project.",
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath("/admin");
  revalidatePath("/projects");
}

export async function requestFinalProjectChanges(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const comment = formData.get("comment")?.toString().trim();
  if (!workspaceId || !comment) throw new Error("A clear final-review revision note is required.");
  const { supabase: db, user, workspace, role } = await verifySupervisorOrAdmin(workspaceId);
  if (role !== "admin" && workspace.supervisor_id !== user.id) throw new Error("This project is assigned to another supervisor.");
  if (workspace.final_project_status !== "pending_review") throw new Error("This project is not awaiting final review.");

  const { error: statusError } = await db.from("project_workspaces")
    .update({ final_project_status: "changes_requested", final_project_approved_at: null }).eq("id", workspaceId)

  if (statusError) throw new Error(statusError.message || "Could not request project changes.");
  const { error: reviewError } = await db.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "changes_requested",
    review_stage: "final_project",
    comment,
  });
  if (reviewError) throw new Error(reviewError.message || "Could not save the final-review notes.");
  await db.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Supervisor requested changes to the completed project.",
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath("/supervisor");
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
  if (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved") {
    throw new Error("Topic and chapter decisions are locked during or after final project review.");
  }
  await assertSectionCommentsResolved(supabase, workspaceId);

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
  if (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved") {
    throw new Error("Topic and chapter decisions are locked during or after final project review.");
  }

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

  const { supabase, workspace } = await verifySupervisorOrAdmin(workspaceId);
  if (workspace.final_project_status === "pending_review" || workspace.final_project_status === "approved") {
    throw new Error("The project title is locked during or after final project review.");
  }

  const { error } = await supabase
    .from("project_workspaces")
    .update({ title })
    .eq("id", workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
}

async function getSectionReviewActor(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to use section review comments.");
  const db = getServerDbClient(supabase);
  const [{ data: profile }, { data: workspace }] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).single(),
    db.from("project_workspaces").select("id, student_id, supervisor_id, status, final_project_status").eq("id", workspaceId).single(),
  ]);
  if (!workspace) throw new Error("Project workspace not found.");
  const role = profile?.role;
  const isSupervisor = role === "admin" || (role === "supervisor" && workspace.supervisor_id === user.id);
  const isStudent = role === "student" && workspace.student_id === user.id;
  if (!isSupervisor && !isStudent) throw new Error("You do not have access to this project review.");
  if (workspace.status === "closed" || workspace.final_project_status === "approved") {
    throw new Error("This project review is closed to new comments.");
  }
  return { db, user, workspace, role, isSupervisor, isStudent };
}

function requiredFormValue(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key)?.toString().trim() || "";
  if (!value || value.length > maxLength) throw new Error(`Enter a valid ${key.replaceAll(/([A-Z])/g, " $1").toLowerCase()}.`);
  return value;
}

export async function createSectionReviewThread(formData: FormData) {
  const workspaceId = requiredFormValue(formData, "workspaceId", 80);
  const sectionKey = requiredFormValue(formData, "sectionKey", 160);
  const quotedText = requiredFormValue(formData, "quotedText", 1000);
  const sectionUpdatedAt = requiredFormValue(formData, "sectionUpdatedAt", 80);
  const body = requiredFormValue(formData, "body", 2000);
  const kindValue = formData.get("kind")?.toString();
  const allowedKinds: SectionReviewKind[] = ["correction", "evidence", "question", "structure"];
  if (!kindValue || !allowedKinds.includes(kindValue as SectionReviewKind)) throw new Error("Choose a feedback type.");
  const contextBefore = formData.get("contextBefore")?.toString().slice(-160) || "";
  const contextAfter = formData.get("contextAfter")?.toString().slice(0, 160) || "";
  const suggestedText = formData.get("suggestedText")?.toString().trim() || null;
  if (suggestedText && suggestedText.length > 5000) throw new Error("Suggested replacement is too long.");

  const { db, user, isSupervisor } = await getSectionReviewActor(workspaceId);
  if (!isSupervisor) throw new Error("Only the assigned supervisor can create review comments.");
  const { data: section } = await db.from("workspace_sections")
    .select("id, current_text, updated_at").eq("workspace_id", workspaceId).eq("section_key", sectionKey).single();
  if (!section) throw new Error("Section not found.");
  if (section.updated_at !== sectionUpdatedAt) {
    throw new Error("This section changed after it was opened. Refresh the review and select the text again.");
  }
  const normalizedText = section.current_text.replace(/\s+/g, " ").trim();
  const normalizedQuote = quotedText.replace(/\s+/g, " ").trim();
  if (!normalizedText.includes(normalizedQuote)) {
    throw new Error("The selected text no longer matches this section. Refresh and try again.");
  }

  const { error } = await db.from("section_review_threads").insert({
    workspace_id: workspaceId,
    section_id: section.id,
    section_key: sectionKey,
    author_id: user.id,
    quoted_text: quotedText,
    context_before: contextBefore,
    context_after: contextAfter,
    section_updated_at: section.updated_at,
    kind: kindValue,
    body,
    suggested_text: suggestedText,
  });
  if (error) throw new Error(error.message || "Could not save the review comment.");
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${encodeURIComponent(sectionKey)}`);
}

export async function replyToSectionReviewThread(formData: FormData) {
  const workspaceId = requiredFormValue(formData, "workspaceId", 80);
  const threadId = requiredFormValue(formData, "threadId", 80);
  const body = requiredFormValue(formData, "body", 2000);
  const { db, user, isSupervisor, isStudent } = await getSectionReviewActor(workspaceId);
  const { data: thread } = await db.from("section_review_threads")
    .select("id, workspace_id, status").eq("id", threadId).eq("workspace_id", workspaceId).single();
  if (!thread) throw new Error("Review comment not found.");
  if (thread.status === "resolved") throw new Error("Reopen this comment before replying.");
  if (!isSupervisor && !isStudent) throw new Error("You cannot reply to this review comment.");

  const { error } = await db.from("section_review_replies").insert({ thread_id: threadId, author_id: user.id, body });
  if (error) throw new Error(error.message || "Could not save your reply.");
  const nextStatus: SectionReviewStatus = isStudent ? "answered" : "open";
  const update: { status: SectionReviewStatus; resolved_by: string | null; resolved_at: string | null } = {
    status: nextStatus,
    resolved_by: null,
    resolved_at: null,
  };
  const { error: statusError } = await db.from("section_review_threads").update(update).eq("id", threadId);
  if (statusError) throw new Error(statusError.message || "Your reply was saved, but the comment status could not be updated.");
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/[sectionKey]`, "page");
}

export async function setSectionReviewThreadStatus(formData: FormData) {
  const workspaceId = requiredFormValue(formData, "workspaceId", 80);
  const threadId = requiredFormValue(formData, "threadId", 80);
  const statusValue = formData.get("status")?.toString();
  if (statusValue !== "open" && statusValue !== "resolved") throw new Error("Choose a valid comment status.");
  const { db, user, isSupervisor } = await getSectionReviewActor(workspaceId);
  if (!isSupervisor) throw new Error("Only the assigned supervisor can change comment status.");
  const resolved = statusValue === "resolved";
  const { error } = await db.from("section_review_threads").update({
    status: statusValue,
    resolved_by: resolved ? user.id : null,
    resolved_at: resolved ? new Date().toISOString() : null,
  }).eq("id", threadId).eq("workspace_id", workspaceId);
  if (error) throw new Error(error.message || "Could not update comment status.");
  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/[sectionKey]`, "page");
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


