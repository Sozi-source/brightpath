import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { ArrowLeft, BookOpen, Video, Lock } from "lucide-react";
import type { Module, Lesson } from "@/types/database";

export const instant = false;

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: modulesData } = await supabase
    .from("modules")
    .select("*, lessons(*), profiles:trainer_id(full_name)")
    .eq("status", "published")
    .order("position", { ascending: true });

  const modules: Module[] = (modulesData as unknown as Module[]) || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
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
            {modules.map((m: Module) => (
              <div
                key={m.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400">Module #{m.position}</span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{m.title}</h3>
                    {m.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{m.description}</p>
                    )}
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Instructor: {m.profiles?.full_name || "Verified Trainer"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lessons</h4>
                  {(!m.lessons || m.lessons.length === 0) ? (
                    <p className="text-xs text-zinc-400 italic">No lessons in this module yet.</p>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                      {m.lessons.map((l: Lesson) => (
                        <div
                          key={l.id}
                          className="p-3.5 flex items-center justify-between text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                              {l.position}
                            </span>
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">{l.title}</p>
                              {l.body && (
                                <p className="text-xs text-zinc-500 line-clamp-1">{l.body}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {l.video_url && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                <Video className="h-3 w-3" />
                                Video
                              </span>
                            )}
                            {l.is_free ? (
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                Free
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-zinc-400 inline-flex items-center gap-0.5">
                                <Lock className="h-3 w-3" />
                                Enrolled
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
