"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitProjectReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to submit a review.");

  const projectId = formData.get("projectId")?.toString();
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment")?.toString().trim() || "";
  if (!projectId || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 1000) {
    throw new Error("Choose a rating from 1 to 5. Reviews can contain up to 1,000 characters.");
  }

  const db = getServerDbClient(supabase);
  const { data: project } = await db.from("projects").select("trainer_id").eq("id", projectId).maybeSingle();
  if (!project || project.trainer_id === user.id) throw new Error("You cannot review your own listing.");
  const { data: order } = await db.from("orders").select("id")
    .eq("student_id", user.id).eq("project_id", projectId).eq("status", "paid").maybeSingle();
  if (!order) throw new Error("Only buyers can review this project.");

  const { error } = await db.from("project_reviews").upsert({
    project_id: projectId,
    student_id: user.id,
    rating,
    comment,
  }, { onConflict: "project_id,student_id" });
  if (error) throw new Error(error.message || "Could not save your review.");
  revalidatePath("/library");
  revalidatePath("/projects");
}
