import type { SupabaseClient } from "@supabase/supabase-js";
import type { SectionReviewReply, SectionReviewThread, UserRole } from "@/types/database";

type ThreadRow = Omit<SectionReviewThread, "replies" | "author_name" | "author_role">;
type ReplyRow = Omit<SectionReviewReply, "author_name" | "author_role">;

export async function getSectionReviewThreads(db: SupabaseClient, workspaceId: string): Promise<SectionReviewThread[]> {
  const { data: threadRows, error: threadError } = await db.from("section_review_threads")
    .select("id, workspace_id, section_id, section_key, author_id, quoted_text, context_before, context_after, section_updated_at, kind, body, suggested_text, status, resolved_by, resolved_at, created_at")
    .eq("workspace_id", workspaceId).order("created_at", { ascending: true });
  if (threadError) throw new Error(threadError.message || "Could not load section review comments.");
  const threads = (threadRows || []) as unknown as ThreadRow[];
  if (!threads.length) return [];

  const { data: workspace } = await db.from("project_workspaces").select("student_id, supervisor_id").eq("id", workspaceId).single();

  const threadIds = threads.map((thread) => thread.id);
  const { data: replyRows, error: replyError } = await db.from("section_review_replies")
    .select("id, thread_id, author_id, body, created_at").in("thread_id", threadIds).order("created_at", { ascending: true });
  if (replyError) throw new Error(replyError.message || "Could not load comment replies.");
  const replies = (replyRows || []) as unknown as ReplyRow[];
  const authorIds = [...new Set([...threads.map((thread) => thread.author_id), ...replies.map((reply) => reply.author_id)])];
  const { data: profiles, error: profileError } = await db.from("profiles").select("id, full_name, role").in("id", authorIds);
  if (profileError) throw new Error(profileError.message || "Could not load review participants.");
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const replyMap = new Map<string, SectionReviewReply[]>();

  for (const reply of replies) {
    const author = profileMap.get(reply.author_id);
    const list = replyMap.get(reply.thread_id) || [];
    list.push({
      ...reply,
      author_name: author?.full_name || (reply.author_id === workspace?.student_id ? "Candidate" : reply.author_id === workspace?.supervisor_id ? "Supervisor" : "Administrator"),
      author_role: (author?.role || (reply.author_id === workspace?.student_id ? "student" : reply.author_id === workspace?.supervisor_id ? "supervisor" : "admin")) as UserRole,
    });
    replyMap.set(reply.thread_id, list);
  }

  return threads.map((thread) => {
    const author = profileMap.get(thread.author_id);
    return {
      ...thread,
      author_name: author?.full_name || (thread.author_id === workspace?.student_id ? "Candidate" : thread.author_id === workspace?.supervisor_id ? "Supervisor" : "Administrator"),
      author_role: (author?.role || (thread.author_id === workspace?.student_id ? "student" : thread.author_id === workspace?.supervisor_id ? "supervisor" : "admin")) as UserRole,
      replies: replyMap.get(thread.id) || [],
    };
  });
}
