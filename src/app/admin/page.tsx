import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import {
  updateCommission,
  updateTrainerStatus,
  updateProjectStatus,
  updateUserRole,
} from "./actions";
import { redirect } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  Layers,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import type {
  UserProfile,
  TrainerProfile,
  Project,
  Order,
  ContentReport,
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
    redirect("/learn");
  }

  // Fetch admin dashboard data in parallel
  const [
    { data: allProfiles },
    { data: trainerProfiles },
    { data: allProjects },
    { data: allOrders },
    { data: allReports },
    { data: settingsData },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("trainer_profiles").select("*, profiles(*)"),
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("platform_settings").select("*").eq("id", 1).single(),
  ]);

  const profilesList: UserProfile[] = (allProfiles as unknown as UserProfile[]) || [];
  const trainersList: TrainerProfile[] = (trainerProfiles as unknown as TrainerProfile[]) || [];
  const projectsList: Project[] = (allProjects as unknown as Project[]) || [];
  const ordersList: Order[] = (allOrders as unknown as Order[]) || [];
  const reportsList: ContentReport[] = (allReports as unknown as ContentReport[]) || [];
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Site
            </Link>
            <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-bold text-base tracking-tight">BrightPath Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{user.email}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Students
              </span>
              <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <GraduationCap className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{studentCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Registered platform learners</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Trainers
              </span>
              <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Briefcase className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{trainerCount}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {pendingTrainers.length > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {pendingTrainers.length} awaiting review
                </span>
              ) : (
                "All trainer profiles up to date"
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Projects
              </span>
              <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{projectsList.length}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {pendingProjects.length > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {pendingProjects.length} pending approval
                </span>
              ) : (
                "Marketplace active"
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Commission Revenue
              </span>
              <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Coins className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              KES {totalCommissionKES.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              From KES {totalVolumeKES.toLocaleString()} total sales volume
            </p>
          </div>
        </div>

        {/* Platform Settings Bar */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-base font-bold">Platform Commission Rate</h2>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Current platform cut deducted on each project purchased via Paystack.
              </p>
            </div>

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
                  className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                  %
                </span>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Rate
              </button>
            </form>
          </div>
        </section>

        {/* Pending Action Items (if any) */}
        {(pendingTrainers.length > 0 || pendingProjects.length > 0) && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              Pending Moderation & Approvals
            </h2>

            {/* Pending Trainers */}
            {pendingTrainers.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900/50 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Trainer Applications Awaiting Review ({pendingTrainers.length})
                </h3>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {pendingTrainers.map((t) => (
                    <div key={t.user_id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {t.profiles?.full_name || "Trainer"}
                        </p>
                        <p className="text-xs text-zinc-500">
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
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer"
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
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer"
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
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900/50 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Projects Submitted for Review ({pendingProjects.length})
                </h3>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {pendingProjects.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {p.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Trainer: {p.profiles?.full_name || "Unknown"} • Price: KES {Number(p.price_kes).toLocaleString()} • Category: {p.category || "General"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={updateProjectStatus}>
                          <input type="hidden" name="projectId" value={p.id} />
                          <input type="hidden" name="status" value="published" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer"
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
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer"
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
          </section>
        )}

        {/* Projects Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Projects Catalog</h2>
              <p className="text-xs text-zinc-500">All ready-made projects submitted by trainers.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {projectsList.length} Total
            </span>
          </div>

          {projectsList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Layers className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No projects uploaded yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Trainers can upload projects from the Trainer portal at{" "}
                <Link href="/trainer" className="text-emerald-600 underline">
                  /trainer
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500">
                  <tr>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Trainer</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {projectsList.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.title}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">{p.profiles?.full_name || "-"}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">{p.category || "General"}</td>
                      <td className="py-3 font-mono">KES {Number(p.price_kes).toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            p.status === "published"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : p.status === "pending_review"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {p.status !== "published" && (
                          <form action={updateProjectStatus} className="inline-block">
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="status" value="published" />
                            <button
                              type="submit"
                              className="text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
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
                              className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
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
        </section>

        {/* Users Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">User Profiles</h2>
              <p className="text-xs text-zinc-500">All registered students, trainers, and administrators.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {profilesList.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Course / Institution</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {profilesList.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {p.full_name || "Unnamed"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.role === "admin"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                            : p.role === "trainer"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">
                      {p.institution || p.course || "-"}
                    </td>
                    <td className="py-3 text-zinc-500 text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 text-right">
                      {p.id !== user.id && (
                        <form action={updateUserRole} className="inline-flex gap-1">
                          <input type="hidden" name="userId" value={p.id} />
                          <select
                            name="role"
                            defaultValue={p.role}
                            className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs px-2 py-1"
                          >
                            <option value="student">Student</option>
                            <option value="trainer">Trainer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded bg-zinc-800 text-white text-xs px-2 py-1 cursor-pointer"
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
        </section>

        {/* Orders Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Orders & Transactions</h2>
              <p className="text-xs text-zinc-500">Paystack project purchases and payouts.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {ordersList.length} Orders
            </span>
          </div>

          {ordersList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Coins className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No orders recorded yet</p>
              <p className="text-xs text-zinc-500 mt-1">Purchases made via Paystack will be listed here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500">
                  <tr>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Platform Cut</th>
                    <th className="pb-3">Trainer Share</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {ordersList.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-mono text-xs">{o.paystack_reference}</td>
                      <td className="py-3 font-semibold">KES {Number(o.amount_kes).toLocaleString()}</td>
                      <td className="py-3 text-emerald-600 font-mono text-xs">+KES {Number(o.commission_kes).toLocaleString()}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400 font-mono text-xs">KES {Number(o.trainer_share_kes).toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            o.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500 text-xs">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Content Reports (if any) */}
        {reportsList.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Student Content Reports ({reportsList.length})
            </h2>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reportsList.map((r) => (
                <div key={r.id} className="py-3">
                  <p className="text-sm font-medium">{r.reason}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Filed on {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
