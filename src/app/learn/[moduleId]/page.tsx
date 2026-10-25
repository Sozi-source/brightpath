import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Video,
  UserCheck,
} from "lucide-react";
import type { Module, Lesson } from "@/types/database";

export const instant = false;

interface ModulePageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function ModuleDetailPage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch module details
  const { data: moduleData, error: moduleErr } = await supabase
    .from("modules")
    .select("id, title, description, trainer_id, position, status, profiles:trainer_id(full_name)")
    .eq("id", moduleId)
    .single();

  if (moduleErr || !moduleData) {
    notFound();
  }

  const currentModule = moduleData as unknown as Module;

  // 2. Fetch all lessons in this module (omit body to prevent payload leaks)
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, module_id, title, position, is_free, video_url")
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  const lessons: Lesson[] = (lessonsData as unknown as Lesson[]) || [];

  // 3. Fetch user progress if signed in
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

  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Find next lesson to take (first incomplete lesson, or lesson 1)
  const firstIncompleteLesson = lessons.find((l) => !completedLessonIds.has(l.id)) || lessons[0];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Curriculum Modules
          </Link>

          <span className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Module Overview
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
              href={`/login?redirect=/learn/${moduleId}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Module Banner Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Module #{currentModule.position}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              {currentModule.title}
            </h1>
            {currentModule.description && (
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                {currentModule.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <UserCheck className="h-4 w-4 text-zinc-400" />
              <span>Instructor:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {currentModule.profiles?.full_name || "Verified Trainer"}
              </span>
            </div>

            {firstIncompleteLesson && (
              <Link
                href={`/learn/${moduleId}/${firstIncompleteLesson.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{completedCount > 0 ? "Continue Learning" : "Start Lesson 1"}</span>
              </Link>
            )}
          </div>

          {/* Progress Bar (if signed in) */}
          {user && lessons.length > 0 && (
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {completedCount} of {lessons.length} lessons completed
                </span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lessons Syllabus List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Lessons & Topics
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <p className="text-xs text-zinc-400 italic">No lessons have been published in this module yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
              {lessons.map((lesson) => {
                const isItemDone = completedLessonIds.has(lesson.id);

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${moduleId}/${lesson.id}`}
                    className="group p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                        {isItemDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          lesson.position
                        )}
                      </span>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {isItemDone ? "Completed" : "Ready to study"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-4">
                      {lesson.video_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          <Video className="h-3 w-3" />
                          <span className="hidden sm:inline">Video</span>
                        </span>
                      )}

                      {lesson.is_free ? (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          Free
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-zinc-400 inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
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
      </main>
    </div>
  );
}
