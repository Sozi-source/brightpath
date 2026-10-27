"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { KNEC_RUBRICS } from "@/lib/studio/rubrics";
import { encodeRubricReviewComment } from "@/lib/studio/authorship";
import { requireUuid, requireNonEmptyString } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WorkspaceType, WorkspaceLevel, ReviewStatus, SectionStatus } from "@/types/database";

async function verifySupervisorOrAdmin(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getServerDbClient(supabase);

  const { data: profile } = await db
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, supervisor_id, status, workspace_type, level, title")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  if (!isAdmin && workspace.supervisor_id !== user.id) {
    throw new Error("Unauthorized: Only the assigned supervisor or admin can perform this review.");
  }

  return { supabase: db, user, workspace, isAdmin, supervisorName: profile?.full_name || "Supervisor" };
}

export async function approveProposal(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const comment =
    formData.get("comment")?.toString().trim() || "Proposal formally reviewed and approved.";

  const { supabase, user } = await verifySupervisorOrAdmin(workspaceId);
  const nowIso = new Date().toISOString();

  // 1. Insert supervisor review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "approved",
    comment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. Update workspace status to 'approved' and mark proposal sections as 'reviewed'
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "approved",
      approved_at: nowIso,
    })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

  await supabase
    .from("workspace_sections")
    .update({ status: "reviewed" })
    .eq("workspace_id", workspaceId)
    .eq("phase", "proposal");

  // 3. Auto-generate Annex 12 log entry
  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Proposal Moderation: Candidate research/project proposal officially approved.",
    supervisor_comment: comment,
    auto_generated: true,
    student_signed_at: nowIso,
    supervisor_signed_at: nowIso,
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath(`/studio/${workspaceId}`);
}

export async function requestProposalChanges(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const comment = requireNonEmptyString(
    formData.get("comment"),
    "Feedback comment",
    { minLength: 5, maxLength: 2000 }
  );

  const { supabase, user } = await verifySupervisorOrAdmin(workspaceId);

  // 1. Insert review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "changes_requested",
    comment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. Revert workspace status back to 'ideation' for the student to edit
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "ideation",
    })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

  // 3. Auto-generate log entry
  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Proposal Moderation Review: Supervisor requested revisions on proposal sections.",
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath(`/studio/${workspaceId}`);
}

export async function updateProposalTitle(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const title = requireNonEmptyString(formData.get("title"), "Official project title", {
    minLength: 5,
    maxLength: 300,
  });

  const { supabase } = await verifySupervisorOrAdmin(workspaceId);

  const { error } = await supabase
    .from("project_workspaces")
    .update({ title })
    .eq("id", workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
}

/**
 * Chapter-level Supervisor Review:
 * Records inline feedback against a specific workspace section, updates section status,
 * and appends a signed Annex 12 supervision log entry.
 */
export async function reviewChapterSection(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const sectionKey = requireNonEmptyString(formData.get("sectionKey"), "section key", {
    maxLength: 100,
  });
  const sectionTitle = formData.get("sectionTitle")?.toString().trim() || sectionKey;
  const rawDecision = formData.get("decision")?.toString().trim() as ReviewStatus | undefined;
  const decision: ReviewStatus =
    rawDecision === "approved" || rawDecision === "changes_requested" || rawDecision === "comment"
      ? rawDecision
      : "comment";

  const comment = requireNonEmptyString(
    formData.get("comment"),
    "Chapter review feedback",
    { minLength: 3, maxLength: 2000 }
  );

  const { supabase, user } = await verifySupervisorOrAdmin(workspaceId);

  const { data: section } = await supabase
    .from("workspace_sections")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  if (!section) {
    throw new Error("Target section not found in workspace.");
  }

  // 1. Insert section-linked supervisor review
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    section_id: section.id,
    supervisor_id: user.id,
    status: decision,
    comment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. Update section status based on supervisor decision
  const nextSectionStatus: SectionStatus =
    decision === "approved"
      ? "final"
      : decision === "changes_requested"
      ? "draft"
      : "reviewed";

  const { error: secErr } = await supabase
    .from("workspace_sections")
    .update({ status: nextSectionStatus })
    .eq("id", section.id);

  if (secErr) throw new Error(secErr.message);

  // 3. Record signed Annex 12 supervision entry
  const actionLabel =
    decision === "approved"
      ? `Chapter Cleared (${sectionTitle}): Marked final by supervisor.`
      : decision === "changes_requested"
      ? `Chapter Revision Requested (${sectionTitle}): Returned for candidate corrections.`
      : `Chapter Supervision Note (${sectionTitle}): Reviewed by supervisor.`;

  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: actionLabel,
    supervisor_comment: comment,
    auto_generated: true,
    supervisor_signed_at: new Date().toISOString(),
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/write/${sectionKey}`);
}

/**
 * Official KNEC 100-Mark Rubric Grading & Final Sign-Off
 */
export async function submitRubricGrade(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const examinerSummary =
    formData.get("examinerSummary")?.toString().trim() ||
    "Official KNEC project evaluation completed and signed by supervisor.";
  const finalizeSignoff = formData.get("finalizeSignoff")?.toString() === "on";

  const { supabase, user, workspace } = await verifySupervisorOrAdmin(workspaceId);

  const wsType = workspace.workspace_type as WorkspaceType;
  const wsLevel = workspace.level as WorkspaceLevel;
  const rubricDef =
    KNEC_RUBRICS[wsType]?.[wsLevel] || KNEC_RUBRICS.trade_fabrication.diploma;

  const scores: Record<string, number> = {};
  let totalAwarded = 0;

  for (const cat of rubricDef.categories) {
    const rawVal = formData.get(`score_${cat.key}`)?.toString() ?? "0";
    const parsed = Number(rawVal);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > cat.maxMarks) {
      throw new Error(
        `Invalid score for "${cat.label}". Must be between 0 and ${cat.maxMarks}.`
      );
    }
    const rounded = Math.round(parsed * 10) / 10;
    scores[cat.key] = rounded;
    totalAwarded += rounded;
  }

  totalAwarded = Math.round(totalAwarded * 10) / 10;
  const encodedComment = encodeRubricReviewComment({
    scores,
    totalAwarded,
    maxMarks: rubricDef.totalMarks,
    examinerSummary,
  });

  const nowIso = new Date().toISOString();

  // 1. Save rubric evaluation in supervisor_reviews
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: totalAwarded >= 50 ? "approved" : "comment",
    comment: encodedComment,
  });

  if (revErr) throw new Error(revErr.message);

  // 2. If final sign-off checked, mark workspace 'submitted' (or 'closed'), finalize sections, and countersign logbook
  if (finalizeSignoff) {
    await supabase
      .from("project_workspaces")
      .update({
        status: "submitted",
        submitted_at: nowIso,
      })
      .eq("id", workspaceId);

    await supabase
      .from("workspace_sections")
      .update({ status: "final" })
      .eq("workspace_id", workspaceId)
      .neq("status", "empty");

    await supabase
      .from("project_log_entries")
      .update({ supervisor_signed_at: nowIso })
      .eq("workspace_id", workspaceId)
      .is("supervisor_signed_at", null);
  }

  // 3. Append Annex 12 logbook entry
  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: `KNEC Rubric Evaluation Recorded: ${totalAwarded}/${rubricDef.totalMarks} marks (${
      finalizeSignoff ? "Final Defence Sign-Off Completed" : "Provisional Assessment"
    }).`,
    supervisor_comment: examinerSummary,
    auto_generated: true,
    student_signed_at: nowIso,
    supervisor_signed_at: nowIso,
  });

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath("/supervisor");
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/export`);
}

/**
 * Countersign an individual candidate Annex 12 logbook entry
 */
export async function signProjectLogEntry(formData: FormData) {
  const workspaceId = requireUuid(formData.get("workspaceId"), "workspace ID");
  const logEntryId = requireUuid(formData.get("logEntryId"), "log entry ID");
  const supervisorComment =
    formData.get("supervisorComment")?.toString().trim() || "Verified and countersigned by supervisor.";

  const { supabase } = await verifySupervisorOrAdmin(workspaceId);

  const { error } = await supabase
    .from("project_log_entries")
    .update({
      supervisor_comment: supervisorComment,
      supervisor_signed_at: new Date().toISOString(),
    })
    .eq("id", logEntryId)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}/export`);
}
