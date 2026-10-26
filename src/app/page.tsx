import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Layers,
  LayoutGrid,
  FileText,
  Building,
  CheckCircle2,
  ShoppingBag,
  Briefcase,
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
      : userRole === "supervisor"
      ? "/supervisor"
      : "/studio";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900">
      {/* 1. Global Institutional Topbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Application Switcher"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3554] text-white shadow-xs">
                <GraduationCap className="h-5 w-5 text-[#f59e0b]" />
              </span>
              <div>
                <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">
                  BrightPath TVET
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Kenya Education Cloud Standard
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link href="/studio" className="hover:text-blue-700 transition-colors">
              Project Studio
            </Link>
            <Link href="/projects" className="hover:text-blue-700 transition-colors">
              Projects Marketplace
            </Link>
            <Link href="/trainer" className="hover:text-blue-700 transition-colors">
              Trainer Publisher
            </Link>
            <Link href="/supervisor" className="hover:text-blue-700 transition-colors">
              Supervisor Portal
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden lg:inline-block text-xs font-bold text-slate-700">
                  {fullName}
                </span>
                <Link
                  href={dashboardHref}
                  className="rounded-lg bg-blue-700 hover:bg-blue-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Dashboard ({userRole})
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-700 hover:bg-blue-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Register Candidate
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Institutional Hero Section */}
      <section className="px-4 sm:px-6 py-12 lg:py-16 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Two-Tone KEC Accent Stripe */}
          <div className="h-1.5 w-full flex">
            <div className="h-full w-3/5 bg-blue-700" />
            <div className="h-full w-2/5 bg-amber-500" />
          </div>

          <div className="p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-900 mx-auto shadow-xs">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <span>National TVET Capstone Projects & Marketplace System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Progressive Project Building & Ready-Made Technical Marketplace
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A simplified, high-efficiency platform for TVET candidates to progressively build accredited Research Projects and Business Plans, and for trainers to publish ready-made capstones for sale with zero friction.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors"
              >
                <span>Progressive Project Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-colors shadow-xs"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-700" />
                <span>Browse Projects Marketplace</span>
              </Link>
              <Link
                href="/trainer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-colors shadow-xs"
              >
                <Briefcase className="h-4 w-4 text-blue-700" />
                <span>Publish Projects (Trainers)</span>
              </Link>
            </div>
          </div>

          {/* Academic Metadata Strip */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">TVET Levels</span>
              <span className="text-xs font-bold text-slate-900">Diploma & Craft Certificate</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Project Formats</span>
              <span className="text-xs font-bold text-slate-900">Research & Business Plan</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Trainer Publishing</span>
              <span className="text-xs font-bold text-slate-900">Single & Fast CSV Bulk Upload</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Instant Payment</span>
              <span className="text-xs font-bold text-slate-900">Paystack / M-PESA KES</span>
            </div>
          </div>
        </div>

        {/* 3. Core Institutional Pillars */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Progressive Project Studio</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step-by-step drafting for candidates: formulate research topics or business plans, draft section-by-section, track word counts, and submit to supervisors.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-2"
            >
              <span>Open Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Ready-Made Projects Marketplace</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download complete, tested technical source code packages and full business plans with instant delivery powered by Paystack.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Building className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Supervisor Moderation</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supervisors can review candidate proposal drafts, request specific revisions, approve titles, and sign off on chapters with minimal friction.
            </p>
            <Link
              href="/supervisor"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline pt-2"
            >
              <span>Supervisor Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Global Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>BrightPath TVET Examination & Projects Standard</span>
          </div>
          <div className="flex items-center gap-5 font-medium text-slate-600">
            <Link href="/studio" className="hover:text-blue-700">Project Studio</Link>
            <Link href="/projects" className="hover:text-blue-700">Projects</Link>
            <Link href="/trainer" className="hover:text-blue-700">Trainer Publisher</Link>
            <Link href="/supervisor" className="hover:text-blue-700">Supervisor</Link>
            <Link href="/login" className="hover:text-blue-700">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
