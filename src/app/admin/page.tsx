import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateProjectStatus,
  updateUserRole,
  queueApprovedBusinessPlanForPublishing,
  purgePendingOrdersAction,
} from "./actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import {
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  Users,
  Download,
  FileText,
} from "lucide-react";
import type {
  UserProfile,
  Project,
  Order,
  ContentReport,
} from "@/types/database";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { resolveBusinessPlanModel, type BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
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
    { data: approvedBusinessPlans },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("project_workspaces")
      .select("id, title, course, level, student_id, business_plan_specs, marketplace_price_kes, student:student_id(full_name, admission_number)")
      .eq("workspace_type", "business_plan")
      .eq("final_project_status", "approved")
      .order("updated_at", { ascending: false }),
  ]);

  const readyPlanIds = (approvedBusinessPlans || []).map((workspace) => workspace.id);
  const { data: approvedPlanSections } = readyPlanIds.length
    ? await supabase.from("workspace_sections").select("workspace_id, section_key, current_text").in("workspace_id", readyPlanIds)
    : { data: [] };
  const sectionsByWorkspace = new Map<string, Map<string, string>>();
  for (const section of approvedPlanSections || []) {
    if (!sectionsByWorkspace.has(section.workspace_id)) sectionsByWorkspace.set(section.workspace_id, new Map());
    sectionsByWorkspace.get(section.workspace_id)!.set(section.section_key, section.current_text || "");
  }
  const readyPlans = (approvedBusinessPlans || []).filter((workspace) => {
    const sectionText = sectionsByWorkspace.get(workspace.id);
    return getWorkspaceSections("business_plan", workspace.level, resolveBusinessPlanModel(workspace.business_plan_specs as BusinessPlanSpecs | null)).every((definition) =>
      (sectionText?.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length >= (definition.minWords || 30)
    );
  });

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
      <PageHeaderCard
        title="Administration"
        subtitle="Institutional administration controls"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Administration", active: true },
        ]}
        metadata={[
          { label: "Admin", value: profile?.full_name || user.email || "Admin" },
          { label: "Role", value: "System Administrator" },
        ]}
        actions={
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <FileText className="h-4 w-4 text-[#087f8c]" />
            <span>Studio Workspaces</span>
          </Link>
        }
      />

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Students"
          value={studentCount}
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          label="Approved Plans"
          value={readyPlans.length}
          icon={FileText}
          color="emerald"
          subtext={readyPlans.length > 0 ? `${readyPlans.length} ready for market` : undefined}
        />
        <StatCard
          label="Projects"
          value={projectsList.length}
          icon={Layers}
          color="rose"
          subtext={pendingProjects.length > 0 ? `${pendingProjects.length} pending approval` : undefined}
        />
        <StatCard
          label="Total Sales"
          value={`KES ${totalVolumeKES.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={Coins}
          color="amber"
          subtext={`${paidOrders.length} paid transactions`}
        />
      </div>

      {/* Pending Action Items */}
      <div id="pending" className="scroll-mt-20">
        <ContentCard
          title={`Pending Approvals (${pendingProjects.length})`}
          subtitle="Submitted materials awaiting administrative review"
          icon={AlertCircle}
        >
          {pendingProjects.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              All project submissions have been reviewed. The approval queue is clear.
            </p>
          ) : (
            <div className="space-y-6">
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
                          Author: {p.profiles?.full_name || "Unknown"} • Price: KES {Number(p.price_kes).toLocaleString()} • Category: {p.category || "General"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {p.file_path?.startsWith("workspace-export:") && (
                          <>
                            <Link
                              href={`/api/download?projectId=${encodeURIComponent(p.id)}&format=pdf`}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="h-3.5 w-3.5" /> PDF
                            </Link>
                            <Link
                              href={`/api/download?projectId=${encodeURIComponent(p.id)}&format=docx`}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="h-3.5 w-3.5" /> Word
                            </Link>
                          </>
                        )}
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
            </div>
          )}
        </ContentCard>
      </div>

      {/* Projects Section */}
      <div id="ready-plans" className="scroll-mt-20">
        <ContentCard
          title="Approved Student Plans"
          subtitle="Final approved plans ready for download"
          icon={FileText}
          headerRight={<span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">{readyPlans.length} Ready</span>}
        >
          {readyPlans.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-600">No approved plans are ready yet.</p>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {readyPlans.map((workspace) => {
                const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
                const listing = projectsList.find((project) => project.file_path === `workspace-export:${workspace.id}`);
                return (
                  <div key={workspace.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{workspace.title || "Business Plan"}</p>
                      <p className="text-xs text-slate-600">{student?.full_name || "Student"}{student?.admission_number ? ` · ${student.admission_number}` : ""} · {workspace.course || "Business Plan"}</p>
                      <p className={`mt-1 text-[11px] font-medium ${listing?.status === "published" ? "text-emerald-700" : listing?.status === "pending_review" ? "text-amber-700" : "text-slate-600"}`}>
                        {listing?.status === "published" ? "Published in marketplace" : listing?.status === "pending_review" ? "Queued · awaiting publishing" : listing ? `Listing ${listing.status} · requeue required` : "Not queued for marketplace publishing"}
                      </p>
                    </div>
                    {listing && <div className="flex items-center gap-2">
                      <Link href={`/api/download?projectId=${encodeURIComponent(listing.id)}&format=pdf`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> PDF</Link>
                      <Link href={`/api/download?projectId=${encodeURIComponent(listing.id)}&format=docx`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Word</Link>
                    </div>}
                    {listing?.status !== "pending_review" && listing?.status !== "published" && (
                      <form action={queueApprovedBusinessPlanForPublishing} className="flex items-center gap-2">
                        <input type="hidden" name="workspaceId" value={workspace.id} />
                        <label className="sr-only" htmlFor={`marketplace-price-${workspace.id}`}>Marketplace price in KES</label>
                        <input id={`marketplace-price-${workspace.id}`} name="priceKes" type="number" min="0" max="1000000" step="1" required defaultValue={workspace.marketplace_price_kes ?? listing?.price_kes ?? 0} className="h-8 w-28 rounded-lg border border-slate-300 px-2 text-xs" />
                        <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                          {listing ? "Requeue for publishing" : "Queue for publishing"}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ContentCard>
      </div>

      {/* Projects Section */}
      <div id="projects" className="scroll-mt-20">
        <ContentCard
          title="Marketplace Catalog Setup"
          subtitle="Manage cover photos, prices, metadata, and publication status"
          icon={Layers}
          headerRight={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {projectsList.length} Listed
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
