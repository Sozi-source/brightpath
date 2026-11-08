"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { queueApprovedBusinessPlanListing } from "@/lib/studio/marketplaceListing";
import { isMarketplaceMaterialType } from "@/lib/marketplace";
import type { ContentStatus } from "@/types/database";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin privileges required.");
  }

  return { supabase, user };
}

export async function updateCommission(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const raw = formData.get("commissionPercent");
  const commission = parseFloat(raw?.toString() || "");

  if (isNaN(commission) || commission < 0 || commission > 100) {
    throw new Error("Invalid commission percentage. Must be between 0 and 100.");
  }

  const { error } = await supabase
    .from("platform_settings")
    .update({ commission_percent: commission })
    .eq("id", 1);

  if (error) throw error;
  revalidatePath("/admin");
}

export async function updateProjectStatus(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString();

  if (!projectId || !status) throw new Error("Missing projectId or status");

  if (status === "published") {
    const { data: project } = await supabase.from("projects").select("file_path").eq("id", projectId).maybeSingle();
    if (project?.file_path?.startsWith("workspace-export:")) {
      const { data: snapshot } = await supabase.from("project_plan_snapshots").select("workspace_id").eq("project_id", projectId).maybeSingle();
      const { data: workspace } = snapshot
        ? await supabase.from("project_workspaces").select("final_project_status").eq("id", snapshot.workspace_id).maybeSingle()
        : { data: null };
      if (workspace?.final_project_status !== "approved") {
        throw new Error("Supervisor final project approval is required before marketplace publication.");
      }
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/projects");
}

export async function queueApprovedBusinessPlanForPublishing(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const workspaceId = formData.get("workspaceId")?.toString();
  const rawPrice = formData.get("priceKes")?.toString().trim() || "";
  if (!workspaceId) throw new Error("Missing business plan workspace.");
  const priceKes = Number(rawPrice);
  if (!rawPrice || !Number.isFinite(priceKes) || priceKes < 0 || priceKes > 1_000_000) {
    throw new Error("Enter a valid marketplace price in KES.");
  }

  const { data: workspace, error: workspaceError } = await supabase.from("project_workspaces")
    .select("id, workspace_type, final_project_status").eq("id", workspaceId).maybeSingle();
  if (workspaceError || !workspace || workspace.workspace_type !== "business_plan") {
    throw new Error(workspaceError?.message || "Approved business plan not found.");
  }
  if (workspace.final_project_status !== "approved") {
    throw new Error("Supervisor final approval is required before queueing this plan.");
  }

  const { error: priceError } = await supabase.from("project_workspaces")
    .update({ marketplace_price_kes: priceKes }).eq("id", workspaceId).eq("final_project_status", "approved");
  if (priceError) throw new Error(priceError.message || "Could not save the marketplace price.");
  await queueApprovedBusinessPlanListing(workspaceId);
  revalidatePath("/admin");
  revalidatePath("/projects");
}

export async function adminUpdateMarketplaceProduct(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const projectId = formData.get("projectId")?.toString().trim();
  if (!projectId) throw new Error("Missing projectId");

  const title = formData.get("title")?.toString().trim();
  if (!title) throw new Error("Product title is required.");
  if (title.length > 180) throw new Error("Product title must be 180 characters or fewer.");

  const description = formData.get("description")?.toString().trim() || null;
  if (description && description.length > 5000) throw new Error("Description must be 5,000 characters or fewer.");

  const category = formData.get("category")?.toString().trim() || "General";
  if (category.length > 100) throw new Error("Category must be 100 characters or fewer.");

  const materialType = formData.get("materialType")?.toString().trim() || "business_plan";
  if (!isMarketplaceMaterialType(materialType)) {
    throw new Error("Invalid resource type.");
  }

  const rawPrice = formData.get("priceKes")?.toString().trim() || "0";
  const priceKes = parseFloat(rawPrice);
  if (!Number.isFinite(priceKes) || priceKes < 0 || priceKes > 1_000_000) {
    throw new Error("Enter a valid price between KES 0 and KES 1,000,000.");
  }

  const status = formData.get("status")?.toString().trim() || "published";
  const validStatuses: ContentStatus[] = ["published", "draft", "pending_review", "rejected"];
  if (!validStatuses.includes(status as ContentStatus)) {
    throw new Error("Invalid publication status.");
  }

  // Fetch current project to verify and get existing file/cover paths
  const { data: currentProject, error: fetchErr } = await supabase
    .from("projects")
    .select("id, file_path, cover_path, status")
    .eq("id", projectId)
    .single();

  if (fetchErr || !currentProject) {
    throw new Error("Product not found.");
  }

  // Check supervisor approval if publishing a workspace export
  if (status === "published" && currentProject.file_path?.startsWith("workspace-export:")) {
    const { data: snapshot } = await supabase
      .from("project_plan_snapshots")
      .select("workspace_id")
      .eq("project_id", projectId)
      .maybeSingle();

    const { data: workspace } = snapshot
      ? await supabase.from("project_workspaces").select("final_project_status").eq("id", snapshot.workspace_id).maybeSingle()
      : { data: null };

    if (workspace?.final_project_status !== "approved") {
      throw new Error("Supervisor final project approval is required before marketplace publication.");
    }
  }

  const adminClient = createAdminClient();
  let updatedCoverPath: string | null | undefined = undefined;

  const removeCover = formData.get("removeCover")?.toString() === "true";
  const coverFile = formData.get("coverFile");
  const isFile = (val: unknown): val is File => typeof File !== "undefined" && val instanceof File && val.size > 0;

  if (removeCover) {
    if (currentProject.cover_path) {
      await adminClient.storage.from("project-files").remove([currentProject.cover_path]);
    }
    updatedCoverPath = null;
  } else if (isFile(coverFile)) {
    if (coverFile.size > 5 * 1024 * 1024) {
      throw new Error("Cover image must be 5 MB or smaller.");
    }
    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      throw new Error("Cover image must be a JPG, PNG, or WebP file.");
    }

    const storagePath = `marketplace/covers/${projectId}/${Date.now()}.${ext}`;
    const fileBuffer = Buffer.from(await coverFile.arrayBuffer());
    const { error: uploadErr } = await adminClient.storage.from("project-files").upload(storagePath, fileBuffer, {
      contentType: coverFile.type || "image/jpeg",
      upsert: true,
    });

    if (uploadErr) {
      throw new Error(uploadErr.message || "Failed to upload cover image.");
    }

    // Remove old cover if it existed and is different
    if (currentProject.cover_path && currentProject.cover_path !== storagePath) {
      await adminClient.storage.from("project-files").remove([currentProject.cover_path]);
    }

    updatedCoverPath = storagePath;
  }

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    category,
    material_type: materialType,
    price_kes: priceKes,
    status,
  };

  if (updatedCoverPath !== undefined) {
    updatePayload.cover_path = updatedCoverPath;
  }

  const { error: updateErr } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", projectId);

  if (updateErr) {
    throw new Error(updateErr.message || "Failed to update project.");
  }

  // If this was an export from a workspace, also synchronize marketplace_price_kes in project_workspaces
  if (currentProject.file_path?.startsWith("workspace-export:")) {
    const { data: snapshot } = await supabase
      .from("project_plan_snapshots")
      .select("workspace_id")
      .eq("project_id", projectId)
      .maybeSingle();

    if (snapshot?.workspace_id) {
      await supabase
        .from("project_workspaces")
        .update({ marketplace_price_kes: priceKes })
        .eq("id", snapshot.workspace_id);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/trainer");

  return { success: true };
}

export async function adminDeleteMarketplaceProduct(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const projectId = formData.get("projectId")?.toString().trim();
  if (!projectId) throw new Error("Missing projectId");

  const { data: project } = await supabase
    .from("projects")
    .select("file_path, preview_path, cover_path")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) throw new Error("Project not found.");

  const { error: deleteErr } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (deleteErr) throw new Error(deleteErr.message || "Failed to delete project.");

  // Clean up storage files if not workspace-export
  const pathsToRemove: string[] = [];
  if (project.cover_path) pathsToRemove.push(project.cover_path);
  if (project.file_path && !project.file_path.startsWith("workspace-export:")) {
    pathsToRemove.push(project.file_path);
  }
  if (project.preview_path) pathsToRemove.push(project.preview_path);

  if (pathsToRemove.length > 0) {
    await createAdminClient().storage.from("project-files").remove(pathsToRemove);
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath("/trainer");

  return { success: true };
}

export async function updateUserRole(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const userId = formData.get("userId")?.toString();
  const role = formData.get("role")?.toString();

  if (!userId || !role) throw new Error("Missing userId or role");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin");
}

export async function grantModuleAccess(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const userId = formData.get("userId")?.toString();
  const moduleId = formData.get("moduleId")?.toString();

  if (!userId || !moduleId) throw new Error("Missing userId or moduleId");

  const { error } = await supabase.from("module_access").upsert({
    user_id: userId,
    module_id: moduleId,
    granted_by: "admin",
  });

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/learn");
}

export async function revokeModuleAccess(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const userId = formData.get("userId")?.toString();
  const moduleId = formData.get("moduleId")?.toString();

  if (!userId || !moduleId) throw new Error("Missing userId or moduleId");

  const { error } = await supabase
    .from("module_access")
    .delete()
    .eq("user_id", userId)
    .eq("module_id", moduleId);

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/learn");
}

export async function createInstitution(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const name = formData.get("name")?.toString().trim();
  const code = formData.get("code")?.toString().trim() || null;
  const aiMode = formData.get("aiMode")?.toString() || "feedback_and_polish";

  if (!name) throw new Error("Institution name is required.");

  const { error } = await supabase.from("institutions").insert({
    name,
    code,
    ai_mode: aiMode,
  });

  if (error) throw error;
  revalidatePath("/admin");
}

export async function updateInstitutionAiMode(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const institutionId = formData.get("institutionId")?.toString();
  const aiMode = formData.get("aiMode")?.toString();

  if (!institutionId || !aiMode) throw new Error("Missing institutionId or aiMode");

  const { error } = await supabase
    .from("institutions")
    .update({ ai_mode: aiMode })
    .eq("id", institutionId);

  if (error) throw error;
  revalidatePath("/admin");
}

export async function assignUserInstitution(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const userId = formData.get("userId")?.toString();
  const institutionId = formData.get("institutionId")?.toString() || null;
  const admissionNumber = formData.get("admissionNumber")?.toString().trim() || null;

  if (!userId) throw new Error("Missing userId");

  const updateData: { institution_id: string | null; admission_number?: string | null } = {
    institution_id: institutionId,
  };
  if (admissionNumber !== null) {
    updateData.admission_number = admissionNumber;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin");
}
