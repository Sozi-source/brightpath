import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Lesson, Module } from "@/types/database";

export interface AccessCheckResult {
  hasAccess: boolean;
  reason: "free" | "admin" | "author" | "purchased" | "unauthenticated" | "locked";
}

/**
 * Enforces server-side gating for lesson content per Phase 0 specifications.
 * A lesson body is accessible only if:
 * 1. The lesson is flagged is_free = true
 * 2. User is an admin
 * 3. User is the trainer who authored the parent module
 * 4. User has an active record in module_access for the parent module
 */
export async function checkLessonAccess(
  supabase: SupabaseClient,
  user: User | null,
  lesson: Pick<Lesson, "id" | "is_free" | "module_id">,
  moduleData: Pick<Module, "id" | "trainer_id">
): Promise<AccessCheckResult> {
  // 1. Free lessons are open to everyone (even unauthenticated)
  if (lesson.is_free) {
    return { hasAccess: true, reason: "free" };
  }

  // 2. Gated lessons require an authenticated session
  if (!user) {
    return { hasAccess: false, reason: "unauthenticated" };
  }

  // 3. Check user role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return { hasAccess: true, reason: "admin" };
  }

  // 4. Check if user is the authoring trainer
  if (moduleData.trainer_id === user.id) {
    return { hasAccess: true, reason: "author" };
  }

  // 5. Check module_access table (defensively handle if table not yet migrated)
  try {
    const { data: access, error } = await supabase
      .from("module_access")
      .select("module_id")
      .eq("user_id", user.id)
      .eq("module_id", moduleData.id)
      .maybeSingle();

    if (!error && access) {
      return { hasAccess: true, reason: "purchased" };
    }
  } catch {
    // If table doesn't exist yet, proceed with locked status
  }

  return { hasAccess: false, reason: "locked" };
}
