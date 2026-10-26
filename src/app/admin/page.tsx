import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  updateCommission,
  updateTrainerStatus,
  updateProjectStatus,
  updateUserRole,
  createInstitution,
  updateInstitutionAiMode,
} from "./actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  GraduationCap,
  Briefcase,
  Layers,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  Building,
  Users,
} from "lucide-react";
import type {
  UserProfile,
  TrainerProfile,
  Project,
  Order,
  ContentReport,
  Institution,
} from "@/types/database";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/studio");
  }

  // Fetch admin dashboard data in parallel
  const [
    { data: allProfiles },
    { data: trainerProfiles },
    { data: allProjects },
    { data: allOrders },
    { data: allReports },
    { data: settingsData },
    { data: institutionsData },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("trainer_profiles").select("*, profiles(*)"),
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("platform_settings").select("*").eq("id", 1).single(),
    supabase.from("institutions").select("*").order("name"),
  ]);

  const profilesList: UserProfile[] = (allProfiles as unknown as UserProfile[]) || [];
  const trainersList: TrainerProfile[] = (trainerProfiles as unknown as TrainerProfile[]) || [];
  const projectsList: Project[] = (allProjects as unknown as Project[]) || [];
  const ordersList: Order[] = (allOrders as unknown as Order[]) || [];
  const reportsList: ContentReport[] = (allReports as unknown as ContentReport[]) || [];
  const institutionsList: Institution[] = (institutionsData as unknown as Institution[]) || [];
  const commissionPercent = settingsData?.commission_percent ?? 20;

  // Compute stats
  const studentCount = profilesList.filter((p) => p.role === "student").length;
  const trainerCount = trainersList.length;
  const pendingTrainers = trainersList.filter((t) => t.status === "pending");
  const pendingProjects = projectsList.filter((p) => p.status === "pending_review");

  const paidOrders = ordersList.filter((o) => o.status === "paid");
  const totalVolumeKES = paidOrders.reduce((acc, o) => acc + Number(o.amount_kes || 0), 0);
  const totalCommissionKES = paidOrders.reduce((acc, o) => acc + Number(o.commission_kes || 0), 0);

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="System Governance & Moderation"
    >
      <PageHeaderCard
        title="Administration"
        subtitle="Platform settings, user moderation, and TVET institutions."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Administration", active: true },
        ]}
        metadata={[
          { label: "Admin", value: profile?.full_name || user.email || "Admin" },
          { label: "Fee", value: `${commissionPercent}% Commission` },
          { label: "Institutions", value: `${institutionsList.length} Centers` },
        ]}
        actions={
          <Link
            href="/trainer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-blue-900 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Briefcase className="h-4 w-4 text-blue-700" />
            <span>Trainer Studio</span>
          </Link>
        }
      />

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Students
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tracking-tight">{studentCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Trainers
            </span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Briefcase className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">{trainerCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {pendingTrainers.length > 0 ? (
              <span className="text-amber-700 font-semibold">
                {pendingTrainers.length} awaiting review
              </span>
            ) : (
              "All trainer profiles up to date"
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Projects
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">{projectsList.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {pendingProjects.length > 0 ? (
              <span className="text-amber-700 font-semibold">
                {pendingProjects.length} pending approval
              </span>
            ) : (
              "Marketplace active"
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Commission Revenue
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight font-mono">
            KES {totalCommissionKES.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            From KES {totalVolumeKES.toLocaleString()} total sales volume
          </p>
        </div>
      </div>

      {/* Platform Settings Bar */}
      <div id="settings" className="scroll-mt-20">
        <ContentCard
          title="Platform Commission Configuration"
          subtitle="Current platform fee percentage deducted on each technical project purchased via Paystack"
          icon={Settings}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-xs text-slate-600 max-w-xl">
              When a TVET candidate acquires a project package, the configured commission percentage is retained by the institution while the remainder is automatically apportioned to the faculty trainer.
            </p>

            <form action={updateCommission} className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="commissionPercent"
                  defaultValue={commissionPercent}
                  required
                  className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  %
                </span>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Update Commission
              </button>
            </form>
          </div>
        </ContentCard>
      </div>

      {/* Pending Action Items (if any) */}
      {(pendingTrainers.length > 0 || pendingProjects.length > 0) && (
        <div id="pending" className="scroll-mt-20">
          <ContentCard
            title={`Pending Moderation Queue (${pendingTrainers.length + pendingProjects.length})`}
            subtitle="Trainer verification requests and project packages requiring administrative approval"
            icon={AlertCircle}
          >
          <div className="space-y-6">
            {/* Pending Trainers */}
            {pendingTrainers.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Trainer Verification Requests ({pendingTrainers.length})
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  {pendingTrainers.map((t) => (
                    <div key={t.user_id} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {t.profiles?.full_name || "Trainer"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {t.profiles?.institution || "Institution not provided"} • Subjects:{" "}
                          {t.subjects?.join(", ") || "General"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={updateTrainerStatus}>
                          <input type="hidden" name="userId" value={t.user_id} />
                          <input type="hidden" name="status" value="approved" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        </form>
                        <form action={updateTrainerStatus}>
                          <input type="hidden" name="userId" value={t.user_id} />
                          <input type="hidden" name="status" value="suspended" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Projects */}
            {pendingProjects.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Projects Submitted for Review ({pendingProjects.length})
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  {pendingProjects.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-600">
                          Trainer: {p.profiles?.full_name || "Unknown"} • Price: KES {Number(p.price_kes).toLocaleString()} • Category: {p.category || "General"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={updateProjectStatus}>
                          <input type="hidden" name="projectId" value={p.id} />
                          <input type="hidden" name="status" value="published" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Publish
                          </button>
                        </form>
                        <form action={updateProjectStatus}>
                          <input type="hidden" name="projectId" value={p.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ContentCard>
        </div>
      )}

      {/* Projects Section */}
      <div id="projects" className="scroll-mt-20">
        <ContentCard
          title="Technical Projects Catalog"
          subtitle="Manage and moderate all ready-made TVET capstone project packages submitted by trainers"
          icon={Layers}
          headerRight={
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {projectsList.length} Total
            </span>
          }
        >
          {projectsList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg">
              <Layers className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No projects uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Trainers can upload projects from the Trainer Studio at{" "}
                <Link href="/trainer" className="text-blue-700 font-bold hover:underline">
                  /trainer
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50">
                  <tr>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Trainer</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{p.title}</td>
                      <td className="py-3 px-3 text-slate-600">{p.profiles?.full_name || "-"}</td>
                      <td className="py-3 px-3 text-slate-600">{p.category || "General"}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">KES {Number(p.price_kes).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.status === "published"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : p.status === "pending_review"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {p.status !== "published" && (
                          <form action={updateProjectStatus} className="inline-block">
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="status" value="published" />
                            <button
                              type="submit"
                              className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                            >
                              Publish
                            </button>
                          </form>
                        )}
                        {p.status !== "rejected" && (
                          <form action={updateProjectStatus} className="inline-block">
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <button
                              type="submit"
                              className="text-xs text-rose-700 hover:underline font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>

      {/* Users Section */}
      <div id="users" className="scroll-mt-20">
        <ContentCard
          title="User Profiles & Role Directory"
          subtitle="Manage authorization privileges across students, trainers, institutional supervisors, and administrators"
          icon={Users}
          headerRight={
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {profilesList.length} Total Users
            </span>
          }
        >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Course / Institution</th>
                <th className="py-2.5 px-3">Joined</th>
                <th className="py-2.5 px-3 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profilesList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {p.full_name || "Unnamed"}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.role === "admin"
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : p.role === "trainer"
                          ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                          : p.role === "supervisor"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {p.institution || p.course || "-"}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {p.id !== user.id && (
                      <form action={updateUserRole} className="inline-flex gap-1.5">
                        <input type="hidden" name="userId" value={p.id} />
                        <select
                          name="role"
                          defaultValue={p.role}
                          className="rounded-md border border-slate-300 bg-white text-xs px-2 py-1 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="student">Student</option>
                          <option value="trainer">Trainer</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs px-2.5 py-1 font-bold cursor-pointer transition-colors"
                        >
                          Set
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
      </div>

      {/* Institutions Section */}
      <div id="institutions" className="scroll-mt-20">
        <ContentCard
          title="Accredited TVET Institutions & AI Governance"
          subtitle="Manage registered polytechnics, national colleges, and institutional AI coaching policies"
          icon={Building}
        headerRight={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {institutionsList.length} Institutions
          </span>
        }
      >
        <div className="space-y-6">
          {/* New Institution Form */}
          <form action={createInstitution} className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Institution Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Kenya Coast National Polytechnic"
                className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Code / Abbr.</label>
              <input
                type="text"
                name="code"
                placeholder="e.g. KCNP"
                className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">AI Coaching Mode</label>
              <select
                name="aiMode"
                defaultValue="feedback_and_polish"
                className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="feedback_and_polish">Feedback & Polish (Full)</option>
                <option value="feedback_only">Feedback Only (No text edit)</option>
                <option value="off">Off (AI disabled)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full text-xs font-bold rounded-md bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 transition-colors cursor-pointer"
              >
                + Register Institution
              </button>
            </div>
          </form>

          {/* Institutions Table */}
          {institutionsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">No institutions registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50">
                  <tr>
                    <th className="py-2.5 px-3">Institution Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Current AI Mode</th>
                    <th className="py-2.5 px-3 text-right">Update AI Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {institutionsList.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {inst.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">
                        {inst.code || "-"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono font-medium">
                          {inst.ai_mode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <form action={updateInstitutionAiMode} className="inline-flex gap-1.5">
                          <input type="hidden" name="institutionId" value={inst.id} />
                          <select
                            name="aiMode"
                            defaultValue={inst.ai_mode}
                            className="rounded-md border border-slate-300 bg-white text-xs px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="feedback_and_polish">Feedback & Polish</option>
                            <option value="feedback_only">Feedback Only</option>
                            <option value="off">Off</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs px-2.5 py-1 font-bold cursor-pointer transition-colors"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ContentCard>
      </div>

      {/* Orders Section */}
      <div id="orders" className="scroll-mt-20">
        <ContentCard
          title="Paystack Transactions & Revenue Distribution"
          subtitle="Audited record of project acquisitions and automated trainer disbursements"
          icon={Coins}
        headerRight={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {ordersList.length} Orders
          </span>
        }
      >
        {ordersList.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg">
            <Coins className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No transactions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Purchases made via Paystack will be listed here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Platform Cut</th>
                  <th className="py-2.5 px-3">Trainer Share</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersList.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">{o.paystack_reference}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">KES {Number(o.amount_kes).toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-700 font-mono font-bold">+KES {Number(o.commission_kes).toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">KES {Number(o.trainer_share_kes).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          o.status === "paid"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>
      </div>

      {/* Content Reports (if any) */}
      {reportsList.length > 0 && (
        <div id="reports" className="scroll-mt-20">
          <ContentCard
            title={`Student Content Reports (${reportsList.length})`}
            subtitle="Flagged educational content requiring administrative review"
            icon={AlertCircle}
          >
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              {reportsList.map((r) => (
                <div key={r.id} className="p-3.5">
                  <p className="text-xs font-bold text-slate-900">{r.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Filed on {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      )}
    </AppShell>
  );
}
