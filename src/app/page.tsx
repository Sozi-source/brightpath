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
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              aria-label="Application Switcher"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#13243a] hover:bg-slate-50 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#087f8c] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <span className="text-amber-300">B</span>P
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
                  BrightPath TVET
                </span>
                <span className="text-[10px] font-medium text-[#087f8c] uppercase tracking-wider block">
                  Kenya Education Cloud Standard
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/studio" className="hover:text-[#087f8c] transition-colors">
              Project Studio
            </Link>
            <Link href="/projects" className="hover:text-[#087f8c] transition-colors">
              Projects Marketplace
            </Link>
            <Link href="/supervisor" className="hover:text-[#087f8c] transition-colors">
              Supervisor Portal
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
                  Register Candidate
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Institutional Hero Section */}
      <section className="px-4 sm:px-6 py-10 lg:py-14 max-w-7xl mx-auto w-full">
        <div className="bp-card overflow-hidden">
          {/* Enterprise Gradient Accent Stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-[#087f8c] via-[#0e9ba5] to-[#d9a441]" />

          <div className="p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d8ebec] bg-[#e8f5f5] text-xs font-semibold text-[#13243a] mx-auto shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#087f8c]" />
              <span>TVET Projects & Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#13243a] leading-[1.15]">
              Progressive Project Studio & Technical Marketplace
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Build accredited TVET research projects and business plans step-by-step, or discover and publish complete capstones with instant delivery.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bp-btn-primary px-5 py-2.5 text-xs sm:text-sm shadow-xs"
              >
                <span>Project Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition-colors shadow-xs"
              >
                <ShoppingBag className="h-4 w-4 text-[#087f8c]" />
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </div>

          {/* Academic Metadata Strip */}
          <div className="bg-slate-50/80 border-t border-slate-200/80 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-2.5">
              <span className="bp-icon-tile h-8 w-8"><BrandIcon name="students" size="xs" /></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">TVET Levels</span>
                <span className="text-xs font-semibold text-slate-900">Diploma & Craft Certificate</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="bp-icon-tile h-8 w-8"><BrandIcon name="document" size="xs" /></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Project Formats</span>
                <span className="text-xs font-semibold text-slate-900">Research & Business Plan</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="bp-icon-tile h-8 w-8"><BrandIcon name="reports" size="xs" /></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">KNEC Compliance</span>
                <span className="text-xs font-semibold text-slate-900">28 Standard Sections</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="bp-icon-tile h-8 w-8"><BrandIcon name="analytics" size="xs" /></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Instant Payment</span>
                <span className="text-xs font-semibold text-slate-900">Paystack / M-PESA KES</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Core Institutional Pillars using FeatureCard & BrandIcon */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
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
      </section>

      {/* 4. Global Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#087f8c]" />
            <span>BrightPath TVET Examination & Projects Standard</span>
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
