import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

export const instant = false;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  let fullName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    userRole = profile?.role || "student";
    fullName = profile?.full_name || user.email;
  }

  const dashboardHref =
    userRole === "admin"
      ? "/admin"
      : userRole === "trainer"
      ? "/trainer"
      : "/learn";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>BrightPath</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Projects
            </Link>
            <Link href="/learn" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Revision & Lessons
            </Link>
            <Link href="/trainer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              For Trainers
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline-block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {fullName}
                </span>
                <Link
                  href={dashboardHref}
                  className="rounded-lg bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                >
                  Dashboard ({userRole})
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-20 lg:py-28 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 mx-auto mb-6 shadow-sm">
          <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Student & Trainer Project Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 max-w-3xl mx-auto leading-[1.15]">
          Projects, business plans, and revision, <span className="text-emerald-600 dark:text-emerald-400">guided.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Access high-quality ready-made student projects, comprehensive business plans, and structured revision modules verified by top trainers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Explore Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3.5 text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Revision Modules
          </Link>
        </div>

        {/* Value Pillars */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Ready-Made Projects</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-normal">
              Download complete, tested project source code and comprehensive business plans with immediate access.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Guided Lessons</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-normal">
              Follow step-by-step revision modules, video guides, and attached resources designed for academic success.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Verified Trainers</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-normal">
              Learn from vetted institution instructors and trainers who publish curriculum-aligned content.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BrightPath. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/projects" className="hover:underline">Projects</Link>
            <Link href="/learn" className="hover:underline">Lessons</Link>
            <Link href="/login" className="hover:underline">Sign In</Link>
            <Link href="/signup" className="hover:underline">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
