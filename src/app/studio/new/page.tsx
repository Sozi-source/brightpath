import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWorkspace } from "@/app/studio/actions";
import {
  ArrowLeft,
  ShieldCheck,
  Hammer,
  LineChart,
  Briefcase,
} from "lucide-react";

export const instant = false;

export default async function NewWorkspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/studio/new");
  }

  // Pre-load profile info if existing
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  // Load institutions and active supervisors
  const { data: institutionsData } = await supabase
    .from("institutions")
    .select("id, name, code")
    .order("name", { ascending: true });

  const { data: supervisorsData } = await supabase
    .from("profiles")
    .select("id, full_name, institution_id")
    .eq("role", "supervisor")
    .order("full_name", { ascending: true });

  const institutions = institutionsData || [];
  const supervisors = supervisorsData || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Workspaces</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
              New Project Setup
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            {profile?.full_name || user.email}
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header Banner */}
          <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/20">
                Step 1 of 2: Candidate Onboarding
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create KNEC Project Workspace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Configure your academic level, curriculum track, and supervisor details. Your workspace will
              automatically configure the official KNEC marking rubric, section templates, and approval
              pipeline.
            </p>
          </div>

          <form action={createWorkspace} className="space-y-8">
            {/* 1. Track Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                1. Select Project Track
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative flex flex-col p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/30 dark:has-checked:bg-indigo-950/20 transition-all">
                  <input
                    type="radio"
                    name="workspaceType"
                    value="trade_fabrication"
                    defaultChecked
                    className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2.5 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Hammer className="h-5 w-5" />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Trade Fabrication
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Practical trade projects: equipment fabrication, recipe formulation tests, bakery or dairy processing, and physical prototypes.
                  </p>
                </label>

                <label className="relative flex flex-col p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/30 dark:has-checked:bg-indigo-950/20 transition-all">
                  <input
                    type="radio"
                    name="workspaceType"
                    value="research_secondary"
                    className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2.5 mb-2 text-emerald-600 dark:text-emerald-400">
                    <LineChart className="h-5 w-5" />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Secondary Research
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Nutrition surveillance, KDHS & KNBS data extraction, descriptive statistics in Excel, and demographic trend analysis.
                  </p>
                </label>

                <label className="relative flex flex-col p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/30 dark:has-checked:bg-indigo-950/20 transition-all">
                  <input
                    type="radio"
                    name="workspaceType"
                    value="business_plan"
                    className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2.5 mb-2 text-amber-600 dark:text-amber-400">
                    <Briefcase className="h-5 w-5" />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Business Plan
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    KNEC Entrepreneurship: comprehensive enterprise plan with market analysis, operations layout, staffing, and 3-year cash flow.
                  </p>
                </label>
              </div>
            </div>

            {/* 2. Academic Level & Registration Details */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                2. Academic Qualification & Candidate ID
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="level"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Qualification Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={profile?.level || "diploma"}
                    required
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="craft">Craft Certificate (Scorecard 1A - 75m Practical / 20m Theory)</option>
                    <option value="diploma">Diploma (Scorecard 1B - 40m Report / 25m Practical / 15m Defence)</option>
                    <option value="higher_diploma">Higher Diploma (Scorecard 1B - Advanced)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admissionNumber"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Admission / Candidate Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="admissionNumber"
                    name="admissionNumber"
                    defaultValue={profile?.admission_number || ""}
                    placeholder="e.g. HND/2024/0481 or 24/09123"
                    required
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-zinc-400"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Mandatory for the signed candidate declaration on KNEC examination copies.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="course"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Academic Course Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  defaultValue={profile?.course || "Diploma in Human Nutrition and Dietetics"}
                  placeholder="e.g. Diploma in Food Science & Processing Technology"
                  required
                  className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* 3. Institution & Supervisor Selection */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                3. Institution & Assigned Project Supervisor
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="institutionId"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Institution / TVET College
                  </label>
                  <select
                    id="institutionId"
                    name="institutionId"
                    defaultValue={profile?.institution_id || (institutions[0]?.id ?? "")}
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Independent Candidate / Unlisted --</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} {inst.code ? `(${inst.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="supervisorId"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Assigned Project Supervisor
                  </label>
                  <select
                    id="supervisorId"
                    name="supervisorId"
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Assign Later by Invitation Code --</option>
                    {supervisors.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.full_name || "Faculty Supervisor"}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Your supervisor reviews your proposal and signs your Annex 12 project log.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Kenya Data Protection Notice & Consent */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Kenya Data Protection Act (2019) Compliance Notice
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    BrightPath collects your candidate admission number and academic submissions strictly for
                    institutional project moderation, supervisor reviews, and KNEC examination report generation.
                    We do not collect national ID or unrelated personal information.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  required
                  className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  I confirm that the academic details provided are accurate, and I consent to the processing
                  of my candidate information for KNEC project moderation. <span className="text-rose-500">*</span>
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/studio"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <span>Initialize Workspace &rarr;</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
