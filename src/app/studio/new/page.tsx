import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { createWorkspace } from "@/app/studio/actions";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { STARTER_KITS } from "@/lib/studio/templates";
import {
  FlaskConical,
  LineChart,
  Briefcase,
  GraduationCap,
  Building,
  Sparkles,
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

  const db = getServerDbClient(supabase);

  const { data: profile } = await db
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  const [{ data: institutionsData }, { data: supervisorsData }] = await Promise.all([
    db.from("institutions").select("id, name, code").order("name"),
    db.from("profiles").select("id, full_name, institution_id").eq("role", "supervisor").order("full_name"),
  ]);

  const institutions = institutionsData || [];
  const supervisors = supervisorsData || [];

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="New Workspace"
    >
      <PageHeaderCard
        title="New Workspace"
        subtitle="Configure curriculum track and qualification level"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: "New Workspace", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: profile?.full_name || user.email || "Student" },
          { label: "Admission No", value: profile?.admission_number || "Unset" },
        ]}
      />

      <form action={createWorkspace} className="space-y-6">
        {/* Track Selection Card */}
        <ContentCard
          title="Curriculum Track"
          icon={FlaskConical}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all shadow-2xs">
              <input
                type="radio"
                name="workspaceType"
                value="trade_fabrication"
                defaultChecked
                className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 mb-1.5 text-indigo-600">
                <FlaskConical className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">
                  Food Science Formulation
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Recipe formulation, proximate analysis, and sensory evaluation.
              </p>
            </label>

            <label className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all shadow-2xs">
              <input
                type="radio"
                name="workspaceType"
                value="research_secondary"
                className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                <LineChart className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">
                  Nutrition Research
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Public health survey analysis and KDHS dietary trends.
              </p>
            </label>

            <label className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all shadow-2xs">
              <input
                type="radio"
                name="workspaceType"
                value="business_plan"
                className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 mb-1.5 text-amber-600">
                <Briefcase className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">
                  Nutrition Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Commercial food processing and clinical dietary operations.
              </p>
            </label>
          </div>
        </ContentCard>

        {/* Academic Qualification & Candidate ID */}
        <ContentCard
          title="Academic Details"
          icon={GraduationCap}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="level"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Qualification Level <span className="text-rose-600">*</span>
                </label>
                <select
                  id="level"
                  name="level"
                  defaultValue={profile?.level || "diploma"}
                  required
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                  <option value="diploma">Diploma (Scorecard 1B)</option>
                  <option value="craft">Craft Certificate (Scorecard 1A)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="admissionNumber"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Admission No <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="admissionNumber"
                  name="admissionNumber"
                  defaultValue={profile?.admission_number || ""}
                  placeholder="e.g. 24/09123"
                  required
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="course"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Course <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                id="course"
                name="course"
                defaultValue={profile?.course || "Diploma in Human Nutrition and Dietetics"}
                placeholder="e.g. Diploma in Food Science and Technology"
                required
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 placeholder:text-slate-400"
              />
            </div>
          </div>
        </ContentCard>

        {/* Starting Template Selection */}
        <ContentCard
          title="Starter Template"
          icon={Sparkles}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default KNEC Standard Outline */}
            <label className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all md:col-span-2 shadow-2xs">
              <input
                type="radio"
                name="templateKit"
                value="knec_standard"
                defaultChecked
                className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 mb-1 text-indigo-700">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">
                  KNEC Chapter Outline
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 ml-auto mr-6">
                  Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Standard KNEC chapters and guided prompts for Food Science and Nutrition.
              </p>
            </label>

            {/* Domain Specific Starter Kits (Strictly Nutrition & Dietetics and Food Science) */}
            {STARTER_KITS.filter((kit) => kit.id !== "knec_std_research" && kit.id !== "knec_std_business" && kit.id !== "knec_std_trade").map((kit) => (
              <label
                key={kit.id}
                className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all shadow-2xs"
              >
                <input
                  type="radio"
                  name="templateKit"
                  value={kit.id}
                  className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {kit.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mb-1 pr-6">
                  {kit.title}
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  {kit.description}
                </p>
              </label>
            ))}

            {/* Clean Slate */}
            <label className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-600 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50/40 transition-all md:col-span-2 shadow-2xs">
              <input
                type="radio"
                name="templateKit"
                value="clean_slate"
                className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 mb-1 text-slate-700">
                <span className="font-semibold text-sm text-slate-900">
                  Clean Slate
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 ml-auto mr-6">
                  Minimal
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Empty chapter sections for custom manual drafting.
              </p>
            </label>
          </div>
        </ContentCard>

        {/* Institution & Assigned Supervisor */}
        <ContentCard
          title="Supervision"
          icon={Building}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="institutionId"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Institution
              </label>
              <select
                id="institutionId"
                name="institutionId"
                defaultValue={profile?.institution_id || (institutions[0]?.id ?? "")}
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <option value="">-- Independent Candidate --</option>
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
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Supervisor
              </label>
              <select
                id="supervisorId"
                name="supervisorId"
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <option value="">-- Assign Later --</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.full_name || "Faculty Supervisor"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ContentCard>

        {/* Single Line Consent */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="privacyConsent"
              required
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span className="text-xs font-semibold text-slate-800">
              I confirm my academic details are accurate for examination. <span className="text-rose-600">*</span>
            </span>
          </label>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/studio"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>Create Workspace</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
