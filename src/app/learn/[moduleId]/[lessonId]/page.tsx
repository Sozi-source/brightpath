import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkLessonAccess } from "@/lib/learn/access";
import { LessonContent } from "@/components/learn/LessonContent";
import { CompleteLessonButton } from "@/components/learn/CompleteLessonButton";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  BookOpen,
  CheckCircle2,
  Video,
} from "lucide-react";
import type { Module, Lesson, UserProfile } from "@/types/database";

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

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

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
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Lesson: ${targetLesson.title}`}
    >
      <PageHeaderCard
        title={targetLesson.title}
        subtitle={`${currentModule.title} • Part ${targetLesson.position} of ${siblingLessons.length}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Revision & Lessons", href: "/learn" },
          { label: `Module #${currentModule.position}`, href: `/learn/${moduleId}` },
          { label: `Lesson #${targetLesson.position}`, active: true },
        ]}
        metadata={[
          { label: "Parent Module", value: currentModule.title },
          { label: "Lesson Sequence", value: `Part ${targetLesson.position} of ${siblingLessons.length}` },
          { label: "Access Level", value: targetLesson.is_free ? "Free Preview" : "Accredited Enrollment" },
          { label: "Completion Status", value: isCompleted ? "Completed (Verified)" : "In Progress" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/learn/${moduleId}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Syllabus</span>
            </Link>
            {access.hasAccess && user && (
              <CompleteLessonButton
                lessonId={targetLesson.id}
                moduleId={currentModule.id}
                isCompleted={isCompleted}
              />
            )}
          </div>
        }
      />

      {/* Reader Layout: Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {access.hasAccess ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <LessonContent
                body={lessonBody}
                videoUrl={targetLesson.video_url}
              />
            </div>
          ) : (
            /* Gated Screen (Zero leak of lesson body) */
            <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">This Lesson is Gated</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {access.reason === "unauthenticated"
                    ? "Please sign in to access full curriculum modules and track your revision progress."
                    : "This lesson requires enrollment or verified module access through your institution."}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {!user ? (
                  <Link
                    href={`/login?redirect=/learn/${moduleId}/${lessonId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
                  >
                    Sign In to Continue
                  </Link>
                ) : (
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                  >
                    Browse Project Packages
                  </Link>
                )}
                <Link
                  href={`/learn/${moduleId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Module Overview
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            {prevLesson ? (
              <Link
                href={`/learn/${moduleId}/${prevLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Previous</span>
                  <span className="line-clamp-1">{prevLesson.title}</span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${moduleId}/${nextLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-700 transition-colors text-right"
              >
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Next</span>
                  <span className="line-clamp-1">{nextLesson.title}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/learn/${moduleId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finish Module Overview</span>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar: Module Syllabus Outline */}
        <aside className="lg:col-span-4 space-y-4">
          <ContentCard
            title="Module Syllabus"
            subtitle={`${siblingLessons.length} Total Lessons`}
            icon={BookOpen}
          >
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto bg-white">
              {siblingLessons.map((l) => {
                const isCurrent = l.id === lessonId;
                const isItemDone = completedLessonIds.has(l.id);

                return (
                  <Link
                    key={l.id}
                    href={`/learn/${moduleId}/${l.id}`}
                    className={`p-3 block text-xs transition-colors ${
                      isCurrent
                        ? "bg-blue-50 font-bold border-l-4 border-blue-700 text-blue-900"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0">
                          {isItemDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          ) : (
                            <span className="inline-block h-4 w-4 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-center leading-4 text-slate-600">
                              {l.position}
                            </span>
                          )}
                        </span>
                        <span className="line-clamp-2">
                          {l.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {l.video_url && <Video className="h-3 w-3 text-slate-400" />}
                        {l.is_free ? (
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Free
                          </span>
                        ) : (
                          <Lock className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ContentCard>
        </aside>
      </div>
    </AppShell>
  );
}
