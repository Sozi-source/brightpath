import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWorkspace } from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  ShieldCheck,
  Hammer,
  LineChart,
  Briefcase,
  GraduationCap,
  Building,
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
    .select("full_name, role, admission_number, course, level, institution_id")
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
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="New Project Setup"
    >
      {/* 1. KEC-Standard Page Header with Two-Tone Accent Stripe & Breadcrumb Ribbon */}
      <PageHeaderCard
        title="Initialize KNEC Project Workspace"
        subtitle="Step 1 of 2: Candidate Academic Registration. Configure your examination level (Diploma or Craft Certificate), practical project track (Research or Business Plan), and assigned supervisor."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: "New Project Setup", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: profile?.full_name || user.email || "Registered Student" },
          { label: "Admission No", value: profile?.admission_number || "To be entered" },
          { label: "Examination Authority", value: "KNEC Business & Technical Examinations" },
        ]}
      />

      {/* 2. Onboarding Form Container */}
      <form action={createWorkspace} className="space-y-6">
        {/* Track Selection Card */}
        <ContentCard
          title="1. Select KNEC Curriculum Track"
          subtitle="Choose the practical methodology for your project portfolio"
          icon={Hammer}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex flex-col p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 cursor-pointer has-checked:border-blue-700 has-checked:bg-blue-50/40 transition-all">
              <input
                type="radio"
                name="workspaceType"
                value="trade_fabrication"
                defaultChecked
                className="absolute top-4 right-4 text-blue-700 focus:ring-blue-600"
              />
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <Hammer className="h-5 w-5" />
                <span className="font-bold text-sm text-slate-900">
                  Trade Fabrication
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practical fabrication projects: equipment engineering, food product formulation, bakery or dairy processing, and prototype testing.
              </p>
            </label>

            <label className="relative flex flex-col p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 cursor-pointer has-checked:border-blue-700 has-checked:bg-blue-50/40 transition-all">
              <input
                type="radio"
                name="workspaceType"
                value="research_secondary"
                className="absolute top-4 right-4 text-blue-700 focus:ring-blue-600"
              />
              <div className="flex items-center gap-2 mb-2 text-emerald-700">
                <LineChart className="h-5 w-5" />
                <span className="font-bold text-sm text-slate-900">
                  Secondary Research
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nutrition surveillance, KDHS & KNBS demographic data extraction, descriptive statistics in Excel, and nutritional trend analysis.
              </p>
            </label>

            <label className="relative flex flex-col p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 cursor-pointer has-checked:border-blue-700 has-checked:bg-blue-50/40 transition-all">
              <input
                type="radio"
                name="workspaceType"
                value="business_plan"
                className="absolute top-4 right-4 text-blue-700 focus:ring-blue-600"
              />
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <Briefcase className="h-5 w-5" />
                <span className="font-bold text-sm text-slate-900">
                  Business Plan
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                KNEC Entrepreneurship plan: enterprise modeling with market survey, operations workflow, staffing schedule, and 3-year cash flow.
              </p>
            </label>
          </div>
        </ContentCard>

        {/* Academic Qualification & Candidate ID */}
        <ContentCard
          title="2. Academic Qualification & Candidate Identification"
          subtitle="Accreditation details required on official KNEC project submission copies"
          icon={GraduationCap}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="level"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Qualification Level <span className="text-rose-600">*</span>
                </label>
                <select
                  id="level"
                  name="level"
                  defaultValue={profile?.level || "diploma"}
                  required
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="diploma">Diploma (Scorecard 1B - 40m Chapters / 25m Practical / 15m Defence)</option>
                  <option value="craft">Craft Certificate (Scorecard 1A - 75m Practical / 20m Theory)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="admissionNumber"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Candidate Admission / Registration No <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="admissionNumber"
                  name="admissionNumber"
                  defaultValue={profile?.admission_number || ""}
                  placeholder="e.g. HND/2024/0481 or 24/09123"
                  required
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Mandatory for the signed candidate declaration page per KNEC guidelines.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="course"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Academic Course Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                id="course"
                name="course"
                defaultValue={profile?.course || "Diploma in Human Nutrition and Dietetics"}
                placeholder="e.g. Diploma in Food Science & Processing Technology"
                required
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
              />
            </div>
          </div>
        </ContentCard>

        {/* Institution & Assigned Supervisor */}
        <ContentCard
          title="3. Institution & Assigned Project Supervisor"
          subtitle="Connect with your department supervisor for proposal review and Annex 12 sign-offs"
          icon={Building}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="institutionId"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                TVET College / Polytechnic
              </label>
              <select
                id="institutionId"
                name="institutionId"
                defaultValue={profile?.institution_id || (institutions[0]?.id ?? "")}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Assigned Project Supervisor
              </label>
              <select
                id="supervisorId"
                name="supervisorId"
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Assign Later by Invitation Code --</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.full_name || "Faculty Supervisor"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Your supervisor reviews your proposal and signs your Annex 12 interaction log.
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Kenya Data Protection Act Notice & Consent */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">
                Kenya Data Protection Act (2019) Compliance Notice
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                BrightPath processes your admission number and project draft submissions strictly for
                institutional project moderation, supervisor reviews, and KNEC examination report generation.
                We do not collect national ID or extraneous personal information.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 pt-2 cursor-pointer border-t border-slate-200">
            <input
              type="checkbox"
              name="privacyConsent"
              required
              className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <span className="text-xs font-semibold text-slate-800">
              I confirm that the academic details provided are accurate, and I consent to the processing
              of my candidate information for KNEC project moderation. <span className="text-rose-600">*</span>
            </span>
          </label>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/studio"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>Initialize Workspace & Continue &rarr;</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
