import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Video,
  ChevronLeft,
} from "lucide-react";
import type { Module, Lesson, UserProfile } from "@/types/database";

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

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

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
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Module #${currentModule.position}: ${currentModule.title}`}
    >
      <PageHeaderCard
        title={currentModule.title}
        subtitle={currentModule.description || "Structured TVET syllabus topic with practical demonstrations and assessment walk-throughs."}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Revision & Lessons", href: "/learn" },
          { label: `Module #${currentModule.position}`, active: true },
        ]}
        metadata={[
          { label: "Module Position", value: `Module #${currentModule.position}` },
          { label: "Faculty Trainer", value: currentModule.profiles?.full_name || "Verified Faculty" },
          { label: "Total Lessons", value: `${lessons.length} Lessons` },
          {
            label: "Completion Progress",
            value: user ? `${completedCount} / ${lessons.length} (${progressPercent}%)` : "Sign in to track",
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>All Modules</span>
            </Link>
            {firstIncompleteLesson && (
              <Link
                href={`/learn/${moduleId}/${firstIncompleteLesson.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{completedCount > 0 ? "Continue Lesson" : "Start Lesson 1"}</span>
              </Link>
            )}
          </div>
        }
      />

      {/* Progress Strip */}
      {user && lessons.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">
              Module Completion: {completedCount} of {lessons.length} lessons verified
            </span>
            <span className="font-mono font-bold text-blue-700 text-xs">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Syllabus Lessons Card */}
      <ContentCard
        title="Module Syllabus & Lesson Breakdown"
        subtitle="Follow the recommended sequence of video tutorials, practical case examples, and study notes"
        icon={BookOpen}
        headerRight={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
          </span>
        }
      >
        {lessons.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400 italic">No lessons have been published in this module yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {lessons.map((lesson) => {
              const isItemDone = completedLessonIds.has(lesson.id);

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${moduleId}/${lesson.id}`}
                  className="group p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                      isItemDone
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {isItemDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      ) : (
                        lesson.position
                      )}
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isItemDone ? "Completed" : "Ready to study"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-4">
                    {lesson.video_url && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        <Video className="h-3 w-3 text-blue-700" />
                        <span className="hidden sm:inline">Video</span>
                      </span>
                    )}

                    {lesson.is_free ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Free Preview
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
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
      </ContentCard>
    </AppShell>
  );
}
