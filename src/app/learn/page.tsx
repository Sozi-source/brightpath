import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  BookOpen,
  Video,
  Lock,
  CheckCircle2,
  ChevronRight,
  Layers,
  GraduationCap,
} from "lucide-react";
import type { Module, Lesson, UserProfile } from "@/types/database";

export const instant = false;

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

  // Query modules and their lesson metadata (explicitly omit body)
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

  const allLessons = modules.flatMap((m) => m.lessons || []);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Curriculum Revision & Lessons"
    >
      <PageHeaderCard
        title="Curriculum & Technical Revision Modules"
        subtitle="Structured TVET exam revision, practical technical walk-throughs, and step-by-step video lessons accredited for East African polytechnics."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Revision & Lessons", active: true },
        ]}
        metadata={[
          {
            label: "Candidate",
            value: profile?.full_name || (user ? user.email?.split("@")[0] : "Guest Learner") || "Learner",
          },
          { label: "Available Modules", value: `${modules.length} Modules` },
          { label: "Total Lessons", value: `${totalLessonsCount} Practical Lessons` },
          {
            label: "Progress",
            value: user ? `${completedLessonsCount} / ${totalLessonsCount} Completed` : "Sign in to track",
          },
        ]}
        actions={
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-blue-900 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Layers className="h-4 w-4 text-blue-700" />
            <span>Browse Projects</span>
          </Link>
        }
      />

      {modules.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
          <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-bold text-slate-900">No revision modules published yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Accredited trainers and faculty can author syllabus modules and lessons from the{" "}
            <Link href="/trainer" className="text-blue-700 font-bold hover:underline">
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
              <ContentCard
                key={m.id}
                title={m.title}
                subtitle={m.description || "Comprehensive syllabus breakdown and practical demonstrations."}
                icon={GraduationCap}
                headerRight={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Module #{m.position}
                    </span>
                    <Link
                      href={`/learn/${m.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                    >
                      <span>Open Module</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Instructor line & Progress indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-medium text-slate-700">Faculty Instructor:</span>{" "}
                      <span className="font-bold text-slate-900">{m.profiles?.full_name || "Verified Faculty"}</span>
                    </div>

                    {user && moduleLessons.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-600">
                          {completedCount} of {moduleLessons.length} completed
                        </span>
                        <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-blue-700 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {progressPercent}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lessons Listing */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Lesson Syllabus ({moduleLessons.length})
                      </h4>
                    </div>

                    {moduleLessons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No lessons in this module yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                        {moduleLessons.map((l: Lesson) => {
                          const isDone = completedLessonIds.has(l.id);

                          return (
                            <Link
                              key={l.id}
                              href={`/learn/${m.id}/${l.id}`}
                              className="group p-3 flex items-center justify-between text-xs hover:bg-blue-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shrink-0 ${
                                  isDone
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {isDone ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                  ) : (
                                    l.position
                                  )}
                                </span>
                                <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                  {l.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {l.video_url && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    <Video className="h-3 w-3 text-blue-700" />
                                    <span>Video</span>
                                  </span>
                                )}
                                {l.is_free ? (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Free Preview
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                    <Lock className="h-3 w-3" />
                                    <span>Enrolled</span>
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
              </ContentCard>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
