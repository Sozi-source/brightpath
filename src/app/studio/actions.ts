"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import {
  getWorkspaceSections,
  getSectionStarterContent,
} from "@/lib/studio/templates";
import {
  narrowDownTopic,
  type WorkspaceContext,
  type TopicNarrowingResult,
} from "@/lib/studio/aiEngine";
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



