"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLessonCompletion(lessonId: string, moduleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be signed in to mark lesson progress.");
  }

  // Check if completion already exists
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) {
    const { error: deleteErr } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);

    if (deleteErr) throw deleteErr;
  } else {
    const { error: insertErr } = await supabase.from("lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    });

    if (insertErr) throw insertErr;
  }

  revalidatePath("/learn");
  revalidatePath(`/learn/${moduleId}`);
  revalidatePath(`/learn/${moduleId}/${lessonId}`);
}
