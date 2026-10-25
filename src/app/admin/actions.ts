"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function updateTrainerStatus(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const userId = formData.get("userId")?.toString();
  const status = formData.get("status")?.toString();

  if (!userId || !status) throw new Error("Missing userId or status");

  const updateData: { status: string; approved_at?: string | null } = { status };
  if (status === "approved") {
    updateData.approved_at = new Date().toISOString();
  } else {
    updateData.approved_at = null;
  }

  const { error: trainerErr } = await supabase
    .from("trainer_profiles")
    .update(updateData)
    .eq("user_id", userId);

  if (trainerErr) throw trainerErr;

  // Sync role to trainer if approved
  if (status === "approved") {
    await supabase.from("profiles").update({ role: "trainer" }).eq("id", userId);
  }

  revalidatePath("/admin");
}

export async function updateProjectStatus(formData: FormData) {
  const { supabase } = await verifyAdmin();
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString();

  if (!projectId || !status) throw new Error("Missing projectId or status");

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) throw error;
  revalidatePath("/admin");
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
