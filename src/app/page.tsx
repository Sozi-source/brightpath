import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const pathways = [
  {
    icon: GraduationCap,
    eyebrow: "For students",
    title: "Build with confidence",
    description: "Follow a clear chapter plan, track progress, and export work you can defend.",
    href: "/studio",
    action: "Open Project Studio",
  },
  {
    icon: ClipboardCheck,
    eyebrow: "For supervisors",
    title: "Moderate with clarity",
    description: "Review drafts section by section, leave focused feedback, and approve faster.",
    href: "/supervisor",
    action: "Open Supervisor Portal",
  },
  {
    icon: Building2,
    eyebrow: "For institutions",
    title: "Govern quality",
    description: "Give departments one shared standard for resources, review, and readiness.",
    href: "/signup",
    action: "Explore the platform",
  },
];

const featuredResources = [
  {
    type: "Business plan",
    title: "Food processing venture plan",
    meta: "Diploma · 25–30 pages",
    tint: "bg-amber-50/80 text-amber-800 border border-amber-200/70",
  },
  {
    type: "Technical project",
    title: "Solar-powered irrigation system",
    meta: "Craft · Guided chapters",
    tint: "bg-slate-100 text-[#092B68] border border-slate-200",
  },
  {
    type: "Past paper",
    title: "Electrical installation revision set",
    meta: "Assessment · Downloadable",
    tint: "bg-slate-100 text-slate-700 border border-slate-200",
  },
];

function HeroSection({ resourceCount }: { resourceCount: number }) {
  return (
    <>
      <section className="border-b border-slate-200 bg-[#f4f7fb] px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-[#092B68] via-[#0c357a] to-[#104294] shadow-[0_18px_48px_rgba(9,43,104,.18)]">
          <div className="flex h-1 w-full">
            <div className="w-3/5 bg-[#092B68]" />
            <div className="w-2/5 bg-[#F5A000]" />
          </div>
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-white/[0.03]" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-12 lg:py-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#F5A000] backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Learn with confidence</span>
              </div>

              <h1 className="!text-white mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Your learning journey, made <span className="text-[#F5A000]">simple.</span>
              </h1>
              <p className="mt-3 max-w-lg text-xs leading-relaxed text-slate-200 sm:text-sm">
                Find verified notes, past papers, research projects, and business plans in one structured workspace.
              </p>

              <form
                action="/projects"
                className="mt-6 flex w-full flex-col gap-2 rounded-xl border border-white/15 bg-white p-1.5 shadow-lg sm:flex-row"
              >
                <label htmlFor="home-search" className="sr-only">
                  Search learning resources
                </label>
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#092B68]" />
                  <input
                    id="home-search"
                    name="q"
                    placeholder="Search notes, past papers, projects..."
                    className="h-10 w-full rounded-lg border-0 bg-slate-50 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:bg-white"
                  />
                </div>
                <select
                  name="type"
                  aria-label="Resource type"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#092B68]"
                >
                  <option value="">All resources</option>
                  <option value="business_plan">Business plans</option>
                  <option value="research_project">Research projects</option>
                  <option value="technical_project">Technical projects</option>
                  <option value="past_paper">Past papers</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#092B68] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#07204f] cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#092B68] shadow-xs transition-colors hover:bg-slate-100"
                >
                  <span>Open learning workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Browse resources</span>
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5 text-[11px] font-medium text-white/85">
                <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1">Notes</span>
                <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1">Past papers</span>
                <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1">Research projects</span>
                <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1">Business plans</span>
              </div>
            </div>

            <aside aria-hidden className="hidden lg:block space-y-3">
              <div className="rounded-xl border border-white/15 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,.22)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-slate-100 p-2 text-[#092B68]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Project Studio</p>
                      <p className="text-[11px] text-slate-500">Guided 5-chapter workflow</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                    In progress
                  </span>
                </div>
                <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/5 rounded-full bg-[#092B68]" />
                </div>
                <ul className="mt-3.5 space-y-1.5 text-xs">
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Executive summary</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Market &amp; trend analysis</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-[#092B68] border border-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-[#F5A000]" />
                    <span>Financial &amp; data tables</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-400">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Export Word (.docx)</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-xs">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-[#F5A000]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">Supervisor review</p>
                    <p className="truncate text-[10.5px] text-slate-200">Feedback in one place</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-xs">
                  <BookMarked className="h-4 w-4 shrink-0 text-[#F5A000]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">Digital library</p>
                    <p className="truncate text-[10.5px] text-slate-200">Lifetime downloads</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-[11px] sm:text-xs font-semibold text-slate-700 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#092B68]" />
            TVET &amp; KMTC aligned
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5 text-[#092B68]" />
            Supervisor review
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#092B68]" />
            Free to start
          </span>
          {resourceCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BookMarked className="h-3.5 w-3.5 text-[#092B68]" />
              {resourceCount.toLocaleString("en-KE")} published resources
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default async function HomePage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let resourceCount = 0;
  try {
    const { count } = await createAdminClient()
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    resourceCount = count || 0;
  } catch {}
  let userRole: string | null = null;
  let fullName: string | null = null;
  let canAccessStudio = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, institution_id")
      .eq("id", user.id)
      .single();
    userRole = profile?.role || "student";
    fullName = profile?.full_name || user.email || null;
    canAccessStudio =
      userRole === "admin" ||
      userRole === "supervisor" ||
      Boolean(profile?.institution_id);
  }
  const dashboardHref =
    userRole === "admin"
      ? "/admin"
      : userRole === "supervisor"
      ? "/supervisor"
      : canAccessStudio
      ? "/studio"
      : "/projects";

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/projects?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f4f7fb] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href={user ? dashboardHref : "/projects"}
              aria-label="Application Switcher"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#092B68] transition-colors hover:bg-slate-50"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex min-w-0 items-center">
              <BrandLogo size="sm" />
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-600 lg:flex">
            <Link href="/projects" className="transition-colors hover:text-[#092B68]">
              Find Resources
            </Link>
            <Link href="/library" className="transition-colors hover:text-[#092B68]">
              My Library
            </Link>
            {(!user || canAccessStudio) && (
              <Link href="/studio" className="transition-colors hover:text-[#092B68]">
                Project Studio
              </Link>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden text-xs font-semibold text-slate-700 lg:inline-block">
                  {fullName}
                </span>
                <Link
                  href={dashboardHref}
                  className="bp-btn-primary whitespace-nowrap px-3.5 py-2 text-xs shadow-xs"
                >
                  Dashboard
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="hidden rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:block cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bp-btn-primary whitespace-nowrap px-3.5 py-2 text-xs shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <HeroSection resourceCount={resourceCount} />

        {/* Section 2: Symmetrical 4-card metrics strip */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
            <div className="p-4">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#092B68]">35+</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Verified templates
              </p>
            </div>
            <div className="p-4">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#092B68]">25–30</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Page standard
              </p>
            </div>
            <div className="p-4">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-amber-600">3×</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Clearer pathways
              </p>
            </div>
            <div className="p-4">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#092B68]">.docx</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Ready to export
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Symmetrical 3-step workflow */}
        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-xl">
            <p className="bp-eyebrow">One clear workflow</p>
            <h2 className="bp-title mt-1.5 text-xl sm:text-2xl">
              Move from uncertainty to progress.
            </h2>
            <p className="bp-body mt-2 text-xs sm:text-sm text-slate-600">
              Every step is structured around the work TVET learners and supervisors already need to do.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#092B68]">
                <BookMarked className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#092B68]">
                01 · Discover
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">Choose a direction</h3>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                Search research projects, business plans, notes, and past papers by the work you need.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#092B68]">
                <LayoutDashboard className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#092B68]">
                02 · Build
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">Follow the structure</h3>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                Draft chapter by chapter with clear prompts, word targets, and visible progress.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <FileCheck2 className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                03 · Submit
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">Export with confidence</h3>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                Prepare a clean Word document, share it for moderation, and keep feedback in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Symmetrical 3-role pathways */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="bp-eyebrow">Built for the ecosystem</p>
                <h2 className="bp-title mt-1.5 text-xl sm:text-2xl">A better path for every role.</h2>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#092B68] hover:underline"
              >
                <span>See how it works</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pathways.map(({ icon: Icon, ...pathway }) => (
                <Link
                  key={pathway.title}
                  href={pathway.href}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#f8fafc] p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#092B68]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                      {pathway.eyebrow}
                    </p>
                    <h3 className="mt-1.5 text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                      {pathway.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                      {pathway.description}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#092B68]">
                    {pathway.action}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Symmetrical curated resources */}
        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="bp-eyebrow">Curated resources</p>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                Start with something useful.
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#092B68] hover:underline"
            >
              <span>Browse all resources</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredResources.map((resource) => (
              <Link
                key={resource.title}
                href="/projects"
                className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-20 items-end rounded-lg p-3 ${resource.tint}`}>
                  <FileText className="h-5 w-5 opacity-80" />
                </div>
                <p className="mt-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {resource.type}
                </p>
                <h3 className="mt-1 text-sm sm:text-[15px] font-semibold text-slate-900">
                  {resource.title}
                </h3>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{resource.meta}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#092B68]" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 6: Unified CTA banner */}
        <section className="border-y border-slate-200 bg-gradient-to-r from-[#092B68] to-[#133b82] text-white">
          <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-9 sm:px-6 sm:py-11 lg:flex-row lg:items-center lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#F5A000]">
                Ready when you are
              </p>
              <h2 className="!text-white mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight">
                Turn your next idea into progress.
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-200">
                Start free. Build clearly. Submit with confidence.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#092B68] transition-colors hover:bg-slate-100"
            >
              <span>Launch Project Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-7 text-xs text-slate-500">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#092B68]" />
            <span>TVET Hub · Clarix Innovators</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 font-medium text-slate-600">
            <Link href="/studio" className="hover:text-[#092B68]">
              Project Studio
            </Link>
            <Link href="/projects" className="hover:text-[#092B68]">
              Projects
            </Link>
            <Link href="/supervisor" className="hover:text-[#092B68]">
              Supervisor
            </Link>
            <Link href="/privacy" className="hover:text-[#092B68]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#092B68]">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-[#092B68]">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
