import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";

export async function queueApprovedBusinessPlanListing(workspaceId: string) {
  const db = createAdminClient();
  const { data: workspace, error: workspaceError } = await db.from("project_workspaces")
    .select("id, student_id, workspace_type, level, title, course, problem_area, business_plan_specs, marketplace_price_kes, final_project_status, student:student_id(full_name, admission_number), supervisor:supervisor_id(full_name), institution:institution_id(name)")
    .eq("id", workspaceId).maybeSingle();
  if (workspaceError || !workspace) throw new Error(workspaceError?.message || "Approved project not found.");
  if (workspace.workspace_type !== "business_plan" || workspace.final_project_status !== "approved") {
    throw new Error("Only finally approved business plans can enter marketplace review.");
  }
  const priceKes = Number(workspace.marketplace_price_kes);
  if (!Number.isFinite(priceKes) || priceKes < 0 || priceKes > 1_000_000) {
    throw new Error("The student’s marketplace price is invalid.");
  }

  const definitions = getWorkspaceSections("business_plan", workspace.level);
  const { data: rows, error: sectionsError } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (sectionsError) throw new Error(sectionsError.message || "Could not load approved plan sections.");
  const sectionText = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const incomplete = definitions.filter((definition) => {
    const words = (sectionText.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length;
    return words < (definition.minWords || 30);
  });
  if (incomplete.length) throw new Error("The business plan no longer meets the completion requirements.");

  const specs = workspace.business_plan_specs as {
    candidateName?: string; admissionNumber?: string; institutionName?: string; supervisorName?: string;
  } | null;
  const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
  const supervisor = workspace.supervisor as unknown as { full_name?: string | null } | null;
  const institution = workspace.institution as unknown as { name?: string | null } | null;
  const redact = (content: string, value: string | null | undefined, replacement: string) => {
    const normalized = value?.trim();
    if (!normalized || normalized.length < 2) return content;
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return content.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"), replacement);
  };
  const redactPrivateDetails = (content: string) => [
    [specs?.candidateName, "[Candidate]"], [student?.full_name, "[Candidate]"],
    [specs?.admissionNumber, "[Admission number withheld]"], [student?.admission_number, "[Admission number withheld]"],
    [specs?.institutionName, "[Institution]"], [institution?.name, "[Institution]"],
    [specs?.supervisorName, "[Supervisor]"], [supervisor?.full_name, "[Supervisor]"],
  ].reduce((text, [value, replacement]) => redact(text, value, replacement as string), content);

  const listingTitle = redactPrivateDetails(workspace.title || `${workspace.course} Business Plan`);
  const listingDescription = redactPrivateDetails(workspace.problem_area || `Completed ${workspace.course} business plan.`);
  const filePath = `workspace-export:${workspaceId}`;
  const { data: existing, error: existingError } = await db.from("projects")
    .select("id, status").eq("file_path", filePath).maybeSingle();
  if (existingError) throw new Error(existingError.message || "Could not check the marketplace queue.");

  let projectId = existing?.id;
  let createdProject = false;
  if (existing) {
    if (existing.status !== "published") {
      const { error } = await db.from("projects").update({
        title: listingTitle, description: listingDescription, category: "Business Plan",
        price_kes: priceKes, status: "pending_review",
      }).eq("id", existing.id);
      if (error) throw new Error(error.message || "Could not update the marketplace listing.");
    }
  } else {
    const { data: listing, error } = await db.from("projects").insert({
      trainer_id: workspace.student_id, title: listingTitle, description: listingDescription,
      category: "Business Plan", price_kes: priceKes, file_path: filePath, status: "pending_review",
    }).select("id").single();
    if (error || !listing) throw new Error(error?.message || "Could not submit the plan for marketplace review.");
    projectId = listing.id;
    createdProject = true;
  }

  if (existing?.status !== "published") {
    const { error: snapshotError } = await db.from("project_plan_snapshots").upsert({
      project_id: projectId,
      workspace_id: workspaceId,
      title: listingTitle,
      course: workspace.course,
      level: workspace.level,
      sections: definitions.map((definition) => ({
        title: definition.title,
        content: redactPrivateDetails(sectionText.get(definition.key) || ""),
      })),
    }, { onConflict: "project_id" });
    if (snapshotError) {
      if (createdProject) await db.from("projects").delete().eq("id", projectId);
      throw new Error(snapshotError.message || "Could not save the private marketplace document.");
    }
  }
  return projectId;
}
