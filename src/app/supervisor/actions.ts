"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
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

  const isAdmin = profile?.role === "admin";

  const { data: workspace } = await db
    .from("project_workspaces")
    .select("id, supervisor_id, status")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  if (!isAdmin && workspace.supervisor_id !== user.id) {
    throw new Error("Unauthorized: Only the assigned supervisor or admin can perform this review.");
  }

  return { supabase: db, user, workspace, isAdmin };
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

  if (revErr) throw new Error(revErr.message);

  // 2. Update workspace status to 'approved'.
  const { error: wsErr } = await supabase
    .from("project_workspaces")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", workspaceId);

  if (wsErr) throw new Error(wsErr.message);

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


