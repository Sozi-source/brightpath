import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { FeatureCard } from "@/components/ui/FeatureCard";
import {
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  CheckCircle2,
  ShoppingBag,
  Search,
  BookOpen,
  Building2,
  Sparkles,
} from "lucide-react";

export const instant = false;

export default async function HomePage() {
  await connection();
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
      : userRole === "supervisor"
      ? "/supervisor"
      : "/studio";

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa] text-slate-900">
      {/* 1. Global Institutional Topbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto flex h-16 items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/studio"
              aria-label="Application Switcher"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#13243a] hover:bg-slate-50 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>

            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#087f8c] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <span className="text-amber-300">T</span>H
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
                  TVET Hub
                </span>
                <span className="text-[10px] font-medium text-[#087f8c] tracking-wider block">
                  Simple · Reliable · Innovative
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <Link href="/projects" className="hover:text-[#087f8c] transition-colors">
              Find Resources
            </Link>
            <Link href="/library" className="hover:text-[#087f8c] transition-colors">
              My Library
            </Link>
            <Link href="/studio" className="hover:text-[#087f8c] transition-colors">
              Project Studio
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden lg:inline-block text-xs font-semibold text-slate-700">
                  {fullName}
                </span>
                <Link
                  href={dashboardHref}
                  className="bp-btn-primary px-3.5 py-2 text-xs shadow-xs"
                >
                  Dashboard ({userRole})
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bp-btn-primary px-3.5 py-2 text-xs shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Institutional Hero Section (Unboxed, Breathing, Premium) */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#f2fafb]/50 to-[#f5f7fa] py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-200/80 bg-white text-xs font-semibold text-[#087f8c] shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-[#087f8c]" />
            <span>Kenya TVET Examination &amp; Projects Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] max-w-4xl mx-auto">
            The Modern Platform for <span className="text-[#087f8c]">TVET Excellence</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Build accredited KNEC research projects and 25–30 page business plans step-by-step, or discover and export verified curriculum capstones with instant M-Pesa delivery.
          </p>

          <form action="/projects" className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
            <label htmlFor="home-search" className="sr-only">Search TVET resources</label>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#087f8c]" />
              <input id="home-search" name="q" placeholder="Search projects, business plans, notes or past papers" className="h-11 w-full rounded-lg border-0 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-500 focus:bg-white" />
            </div>
            <select name="type" aria-label="Resource type" className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#087f8c]">
              <option value="">All resources</option>
              <option value="business_plan">Business plans</option>
              <option value="technical_project">Technical projects</option>
              <option value="research_project">Research projects</option>
              <option value="past_paper">Past papers</option>
            </select>
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087f8c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#086b76]">
              Search Hub
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Popular:</span>
            <Link href="/projects?type=business_plan" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium hover:border-teal-200 hover:text-[#087f8c]">Business plans</Link>
            <Link href="/projects?type=technical_project" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium hover:border-teal-200 hover:text-[#087f8c]">Technical projects</Link>
            <Link href="/projects?type=past_paper" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium hover:border-teal-200 hover:text-[#087f8c]">Past papers</Link>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/studio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bp-btn-primary px-6 py-3 text-sm font-semibold shadow-xs"
            >
              <span>Launch Project Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              <ShoppingBag className="h-4 w-4 text-[#087f8c]" />
              <span>Browse Marketplace</span>
            </Link>
          </div>

          {/* Academic Trust & Feature Badges */}
          <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TVET Levels</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">Diploma &amp; Craft</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">KNEC Compliance</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">25–30 Page Standard</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Templates</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">35 Verified Ventures</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Instant Export</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">Word (.docx) &amp; PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Discovery Routes */}
      <section className="w-full border-y border-slate-200/80 bg-white px-3 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1800px]">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="bp-eyebrow">One platform</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Choose your next move</h2>
            </div>
            <p className="text-xs text-slate-500">From discovery to submission-ready work.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/projects" className="group rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/50">
              <span className="bp-icon-tile h-10 w-10 bg-teal-50 text-[#087f8c]"><BookOpen className="h-5 w-5" /></span>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Find resources</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Search projects, plans, notes and assessments.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#087f8c]">Browse hub <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
            <Link href="/studio" className="group rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50">
              <span className="bp-icon-tile h-10 w-10 bg-indigo-50 text-indigo-700"><Sparkles className="h-5 w-5" /></span>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Build with Studio</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Create guided projects and business plans.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">Open Studio <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
            <Link href="/library" className="group rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/50">
              <span className="bp-icon-tile h-10 w-10 bg-amber-50 text-amber-700"><ShoppingBag className="h-5 w-5" /></span>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Keep your library</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Return to purchased and exported materials.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">Open library <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
            <Link href="/supervisor" className="group rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 transition-colors hover:border-rose-200 hover:bg-rose-50/50">
              <span className="bp-icon-tile h-10 w-10 bg-rose-50 text-rose-700"><Building2 className="h-5 w-5" /></span>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Review and govern</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Moderate work and manage academic quality.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-700">Supervisor portal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Core Institutional Pillars */}
      <section className="w-full px-3 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1800px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            title="Project Studio"
            description="Formulate topics, draft section-by-section with KNEC chapter outlines, track words, and submit for moderation."
            brandIcon="projects"
            href="/studio"
            meta="Workspace"
            actionLabel="Open Studio"
          />

          <FeatureCard
            title="Projects Marketplace"
            description="Discover tested technical packages and business plans with instant delivery and M-PESA settlement."
            brandIcon="marketplace"
            href="/projects"
            meta="Catalog"
            actionLabel="Explore Marketplace"
          />

          <FeatureCard
            title="Supervisor Moderation"
            description="Review candidate proposals, verify chapter progress, refine project titles, and approve work."
            brandIcon="supervisor"
            href="/supervisor"
            meta="Faculty"
            actionLabel="Supervisor Portal"
          />
        </div>
        </div>
      </section>

      {/* 4. Global Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#087f8c]" />
            <span>TVET Hub Examination & Projects Standard</span>
          </div>
          <div className="flex items-center gap-5 font-medium text-slate-600">
            <Link href="/studio" className="hover:text-[#087f8c]">Project Studio</Link>
            <Link href="/projects" className="hover:text-[#087f8c]">Projects</Link>
            <Link href="/supervisor" className="hover:text-[#087f8c]">Supervisor</Link>
            <Link href="/login" className="hover:text-[#087f8c]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
