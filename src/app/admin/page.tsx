import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateUserRole,
  purgePendingOrdersAction,
} from "./actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  GraduationCap,
  Layers,
  AlertCircle,
  Coins,
  Users,
} from "lucide-react";
import type {
  UserProfile,
  Project,
  Order,
  ContentReport,
} from "@/types/database";
import { AdminProjectsManager } from "@/components/admin/AdminProjectsManager";

export const instant = false;

export default async function AdminPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/admin");
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
    { data: allProjects },
    { data: allOrders },
    { data: allReports },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
  ]);

  const profilesList: UserProfile[] = (allProfiles as unknown as UserProfile[]) || [];
  const adminCount = profilesList.filter((p) => p.role === "admin").length;
  const projectsList: Project[] = (allProjects as unknown as Project[]) || [];
  const ordersList: Order[] = (allOrders as unknown as Order[]) || [];
  const reportsList: ContentReport[] = (allReports as unknown as ContentReport[]) || [];

  // Compute stats
  const studentCount = profilesList.filter((p) => p.role === "student").length;

  const pendingProjects = projectsList.filter((p) => p.status === "pending_review");

  const paidOrders = ordersList.filter((o) => o.status === "paid");
  const pendingOrdersCount = ordersList.filter((o) => o.status === "pending").length;
  const totalVolumeKES = paidOrders.reduce((acc, o) => acc + Number(o.amount_kes || 0), 0);

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="System Administration"
    >
      {/* Sticky Administrative Command HUD */}
      <div className="sticky top-16 z-20 -mt-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Administration
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
              Console
            </span>
          </div>

          {/* 4 Compact Sticky Live KPI Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50/60 border border-teal-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-100/70 text-teal-800">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-900/70">Students</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">{studentCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100/70 text-indigo-800">
                <Layers className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70">Business Plans</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">{projectsList.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/60 border border-amber-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100/70 text-amber-800">
                <AlertCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900/70">Pending Review</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">{pendingProjects.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100/70 text-emerald-800">
                <Coins className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70">Total Sales</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">
                  KES {totalVolumeKES.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Plans Section */}
      <div id="business-plans" className="scroll-mt-28">
        <ContentCard
          title="Business Plans"
          icon={Layers}
          compact
          headerRight={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {projectsList.length} Total Plans
            </span>
          }
        >
          <AdminProjectsManager
            projects={projectsList}
          />
        </ContentCard>
      </div>

      {/* Users Section */}
      <div id="users" className="scroll-mt-20">
        <ContentCard
          title="User Directory"
          subtitle="User roles and access permissions"
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

      {/* Orders Section */}
      <div id="orders" className="scroll-mt-20">
        <ContentCard
          title="Transactions"
          subtitle="Paystack settlement ledger"
          icon={Coins}
        headerRight={
          <div className="flex items-center gap-2">
            {pendingOrdersCount > 0 && (
              <form action={purgePendingOrdersAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  <span>Purge {pendingOrdersCount} Pending</span>
                </button>
              </form>
            )}
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {ordersList.length} Orders
            </span>
          </div>
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
                  <th className="py-2.5 px-3">Author Share</th>
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

      {/* Content Reports */}
      <div id="reports" className="scroll-mt-20">
        <ContentCard
          title={`Flagged Content (${reportsList.length})`}
          subtitle="User-reported items and policy disputes"
          icon={AlertCircle}
        >
          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No content reports or disputes filed. Platform materials are compliant.
            </p>
          ) : (
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
          )}
        </ContentCard>
      </div>
    </AppShell>
  );
}
