import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { ArrowLeft, BookOpen, Video, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import type { Module, Lesson } from "@/types/database";

export const instant = false;

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Query modules and their lesson metadata. Notice: we explicitly DO NOT select `body` here
  // to avoid leaking gated content in list payloads, per Phase 0 specifications.
  const { data: modulesData } = await supabase
    .from("modules")
    .select(`
      id,
      trainer_id,
      title,
      description,
      position,
      status,
      created_at,
      profiles:trainer_id(full_name),
      lessons(id, module_id, title, position, is_free, video_url)
    `)
    .eq("status", "published")
    .order("position", { ascending: true });

  const modules: Module[] = (modulesData as unknown as Module[]) || [];

  // Fetch student progress if authenticated
  let completedLessonIds: Set<string> = new Set();
  if (user) {
    const { data: progressList } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    if (progressList) {
      completedLessonIds = new Set(progressList.map((p) => p.lesson_id));
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <span className="font-bold text-base tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Revision & Lessons
          </span>
          {user ? (
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Curriculum & Revision Modules</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Step-by-step revision topics, practice guides, and video walk-throughs.
          </p>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
            <BookOpen className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <h2 className="text-base font-bold">No revision modules published yet</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Trainers and admins can publish revision modules and lessons from the{" "}
              <Link href="/trainer" className="text-indigo-600 underline">
                Trainer Studio
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((m: Module) => {
              const moduleLessons = (m.lessons || []).slice().sort((a, b) => a.position - b.position);
              const completedCount = moduleLessons.filter((l) => completedLessonIds.has(l.id)).length;
              const progressPercent =
                moduleLessons.length > 0
                  ? Math.round((completedCount / moduleLessons.length) * 100)
                  : 0;

              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-zinc-400">Module #{m.position}</span>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        <Link
                          href={`/learn/${m.id}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {m.title}
                        </Link>
                      </h3>
                      {m.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{m.description}</p>
                      )}
                      <p className="text-[11px] text-zinc-400 pt-1">
                        Instructor: {m.profiles?.full_name || "Verified Trainer"}
                      </p>
                    </div>

                    <Link
                      href={`/learn/${m.id}`}
                      className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-800 dark:text-zinc-200 shrink-0"
                    >
                      <span>Open Module</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Progress Indicator for logged in users */}
                  {user && moduleLessons.length > 0 && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                        <span>
                          {completedCount} of {moduleLessons.length} completed
                        </span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lessons Listing */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Lessons Syllabus
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        {moduleLessons.length} {moduleLessons.length === 1 ? "lesson" : "lessons"}
                      </span>
                    </div>

                    {moduleLessons.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">No lessons in this module yet.</p>
                    ) : (
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        {moduleLessons.map((l: Lesson) => {
                          const isDone = completedLessonIds.has(l.id);

                          return (
                            <Link
                              key={l.id}
                              href={`/learn/${m.id}/${l.id}`}
                              className="group p-3.5 flex items-center justify-between text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0">
                                  {isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    l.position
                                  )}
                                </span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {l.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {l.video_url && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                    <Video className="h-3 w-3" />
                                    <span className="hidden sm:inline">Video</span>
                                  </span>
                                )}
                                {l.is_free ? (
                                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Free
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-zinc-400 inline-flex items-center gap-0.5">
                                    <Lock className="h-3 w-3" />
                                    <span className="hidden sm:inline">Enrolled</span>
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
