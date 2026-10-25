import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkLessonAccess } from "@/lib/learn/access";
import { LessonContent } from "@/components/learn/LessonContent";
import { CompleteLessonButton } from "@/components/learn/CompleteLessonButton";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  BookOpen,
  CheckCircle2,
  Video,
} from "lucide-react";
import type { Module, Lesson } from "@/types/database";

export const instant = false;

interface LessonPageProps {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function LessonReaderPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch parent module details
  const { data: moduleData, error: moduleErr } = await supabase
    .from("modules")
    .select("id, title, description, trainer_id, position, status, profiles:trainer_id(full_name)")
    .eq("id", moduleId)
    .single();

  if (moduleErr || !moduleData) {
    notFound();
  }

  const currentModule = moduleData as unknown as Module;

  // 2. Fetch all sibling lessons for navigation and ordering (without body)
  const { data: siblingLessonsData } = await supabase
    .from("lessons")
    .select("id, module_id, title, position, is_free, video_url")
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  const siblingLessons: Lesson[] = (siblingLessonsData as unknown as Lesson[]) || [];

  const targetLesson = siblingLessons.find((l) => l.id === lessonId);
  if (!targetLesson) {
    notFound();
  }

  // 3. Enforce server-side access check
  const access = await checkLessonAccess(supabase, user, targetLesson, currentModule);

  // 4. If access is granted, securely query the lesson body
  let lessonBody: string | null = null;
  if (access.hasAccess) {
    const { data: fullLesson } = await supabase
      .from("lessons")
      .select("body")
      .eq("id", lessonId)
      .single();

    lessonBody = fullLesson?.body || null;
  }

  // 5. Fetch user completion progress if authenticated
  let isCompleted = false;
  let completedLessonIds: Set<string> = new Set();

  if (user) {
    const { data: progressList } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    if (progressList) {
      completedLessonIds = new Set(progressList.map((p) => p.lesson_id));
      isCompleted = completedLessonIds.has(lessonId);
    }
  }

  // 6. Calculate previous & next lesson links
  const currentIndex = siblingLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Reader Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 py-3.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/learn/${moduleId}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Module</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-mono text-zinc-400 shrink-0">
              Lesson #{targetLesson.position}
            </span>
            <h1 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
              {targetLesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {access.hasAccess && user && (
              <CompleteLessonButton
                lessonId={targetLesson.id}
                moduleId={currentModule.id}
                isCompleted={isCompleted}
              />
            )}
            {targetLesson.is_free && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-1 rounded-lg">
                Free Preview
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Reader Layout: Content & Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
              <span>{currentModule.title}</span>
              <span>•</span>
              <span>Part {targetLesson.position} of {siblingLessons.length}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {targetLesson.title}
            </h2>
          </div>

          {access.hasAccess ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <LessonContent
                body={lessonBody}
                videoUrl={targetLesson.video_url}
              />
            </div>
          ) : (
            /* Gated Screen (Zero leak of lesson body) */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold">This Lesson is Gated</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {access.reason === "unauthenticated"
                    ? "Please sign in to access full curriculum modules and track your revision progress."
                    : "This lesson requires enrollment or verified module access through your institution."}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {!user ? (
                  <Link
                    href={`/login?redirect=/learn/${moduleId}/${lessonId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
                  >
                    Sign In to Continue
                  </Link>
                ) : (
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                  >
                    Browse Available Packages
                  </Link>
                )}
                <Link
                  href={`/learn/${moduleId}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  View Module Overview
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
            {prevLesson ? (
              <Link
                href={`/learn/${moduleId}/${prevLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <div className="text-left">
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">Previous</span>
                  <span className="font-semibold line-clamp-1">{prevLesson.title}</span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${moduleId}/${nextLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right"
              >
                <div className="text-right">
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">Next</span>
                  <span className="font-semibold line-clamp-1">{nextLesson.title}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/learn/${moduleId}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:underline"
              >
                Finish Module Overview
              </Link>
            )}
          </div>
        </main>

        {/* Sidebar: Module Syllabus Outline */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Module Syllabus
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {siblingLessons.length} lessons
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {siblingLessons.map((l) => {
                const isCurrent = l.id === lessonId;
                const isItemDone = completedLessonIds.has(l.id);

                return (
                  <Link
                    key={l.id}
                    href={`/learn/${moduleId}/${l.id}`}
                    className={`p-3 block text-xs transition-colors ${
                      isCurrent
                        ? "bg-indigo-50/60 dark:bg-indigo-950/40 font-semibold border-l-2 border-indigo-600"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0">
                          {isItemDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <span className="inline-block h-3.5 w-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-[10px] text-center leading-3">
                              {l.position}
                            </span>
                          )}
                        </span>
                        <span
                          className={`line-clamp-2 ${
                            isCurrent
                              ? "text-indigo-900 dark:text-indigo-100 font-bold"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {l.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {l.video_url && <Video className="h-3 w-3 text-zinc-400" />}
                        {l.is_free ? (
                          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                            Free
                          </span>
                        ) : (
                          <Lock className="h-3 w-3 text-zinc-400" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
