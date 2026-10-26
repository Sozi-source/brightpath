"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function verifySupervisorOrAdmin(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: workspace } = await supabase
    .from("project_workspaces")
    .select("id, supervisor_id, status")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  if (!isAdmin && workspace.supervisor_id !== user.id) {
    throw new Error("Unauthorized: Only the assigned supervisor or admin can perform this review.");
  }

  return { supabase, user, workspace, isAdmin };
}

export async function approveProposal(formData: FormData) {
  const workspaceId = formData.get("workspaceId")?.toString();
  const comment = formData.get("comment")?.toString().trim() || "Proposal formally reviewed and approved.";

  if (!workspaceId) throw new Error("Missing workspace ID.");

  const { supabase, user } = await verifySupervisorOrAdmin(workspaceId);

  // 1. Insert supervisor review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "approved",
    comment,
  });

  if (revErr) throw revErr;

  // 2. Update workspace status to 'approved'.
  // This automatically sets approved_at = now() via trigger guard_workspace_update
  // and unlocks project chapters Ch1-Ch4 in both UI and RLS!
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "approved",
    })
    .eq("id", workspaceId);

  if (wsErr) throw wsErr;

  // 3. Auto-generate Annex 12 log entry
  await supabase.from("project_log_entries").insert({
    workspace_id: workspaceId,
    activity: "Proposal Moderation: Candidate research/project proposal officially approved.",
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

  const { supabase, user } = await verifySupervisorOrAdmin(workspaceId);

  // 1. Insert review record
  const { error: revErr } = await supabase.from("supervisor_reviews").insert({
    workspace_id: workspaceId,
    supervisor_id: user.id,
    status: "changes_requested",
    comment,
  });

  if (revErr) throw revErr;

  // 2. Revert workspace status back to 'ideation' for the student to edit
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "ideation",
    })
    .eq("id", workspaceId);

  if (wsErr) throw wsErr;

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
  const workspaceId = formData.get("workspaceId")?.toString();
  const title = formData.get("title")?.toString().trim();

  if (!workspaceId || !title) throw new Error("Missing workspace ID or title.");

  const { supabase } = await verifySupervisorOrAdmin(workspaceId);

  const { error } = await supabase
    .from("project_workspaces")
    .update({ title })
    .eq("id", workspaceId);

  if (error) throw error;

  revalidatePath(`/supervisor/${workspaceId}`);
  revalidatePath(`/studio/${workspaceId}`);
}
