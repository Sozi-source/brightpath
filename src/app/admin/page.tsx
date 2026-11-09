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
import { ContentCard } from "@/components/layout/ContentCard";
import {
  GraduationCap,
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

function cleanVentureTitle(rawTitle?: string | null): string {
  if (!rawTitle) return "Business Plan";
  let title = rawTitle.trim();
  title = title.replace(/^(?:Complete\s+KNEC\s+Business\s+Plan\s*(?:\([^)]*\))?\s*(?:for|on)?|Business\s+Plan\s*(?:for|on)?|A\s+Business\s+Plan\s*(?:for|on)?)\s+/i, "");
  title = title.replace(/\s+in\s+([A-Z][a-zA-Z]+(?:\s*,\s*[A-Z][a-zA-Z]+|\s+[A-Z][a-zA-Z]+)*)\s*(?:County|Sub-county|Region)?$/i, "");
  title = title.replace(/,\s*[A-Z][a-zA-Z\s]+(?:County|Region)$/i, "");
  title = title.replace(/\s+Regional,\s*County$/i, "");
  return title.trim() || rawTitle;
}

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
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70">Ready Plans</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">{readyPlans.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50/60 border border-rose-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-100/70 text-rose-800">
                <Layers className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900/70">Projects</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">{projectsList.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/60 border border-amber-100/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100/70 text-amber-800">
                <Coins className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900/70">Total Sales</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums leading-tight">
                  KES {totalVolumeKES.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Queues: Pending Approvals & Ready Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Pending Action Items */}
        <div id="pending" className="scroll-mt-28">
          <ContentCard
            title="Pending Approvals"
            icon={AlertCircle}
            compact
            noPadding
            headerRight={
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pendingProjects.length > 0
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {pendingProjects.length} Pending
              </span>
            }
          >
            {pendingProjects.length === 0 ? (
              <div className="flex items-center gap-2 px-3.5 py-3 text-xs text-slate-500 bg-slate-50/40">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Approval queue clear · all submissions reviewed</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Submitted Material</th>
                      <th className="py-2.5 px-3">Author</th>
                      <th className="py-2.5 px-3">Category & Price</th>
                      <th className="py-2.5 px-3 text-right">Review Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingProjects.map((p) => {
                      const cleanTitle = cleanVentureTitle(p.title);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 tracking-tight text-xs sm:text-[13px] max-w-[200px] truncate" title={cleanTitle}>
                            {cleanTitle}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                            {p.profiles?.full_name || "Unknown"}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500">{p.category || "General"}</span>
                              <span className="font-semibold text-slate-800 font-mono text-[11px]">
                                KES {Number(p.price_kes).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {p.file_path?.startsWith("workspace-export:") && (
                                <>
                                  <Link
                                    href={`/api/download?projectId=${encodeURIComponent(p.id)}&format=pdf`}
                                    className="inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                                    title="Download PDF"
                                  >
                                    <Download className="h-3 w-3 text-slate-500" /> PDF
                                  </Link>
                                  <Link
                                    href={`/api/download?projectId=${encodeURIComponent(p.id)}&format=docx`}
                                    className="inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                                    title="Download Word"
                                  >
                                    <Download className="h-3 w-3 text-slate-500" /> Word
                                  </Link>
                                </>
                              )}
                              <form action={updateProjectStatus}>
                                <input type="hidden" name="projectId" value={p.id} />
                                <input type="hidden" name="status" value="published" />
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Publish
                                </button>
                              </form>
                              <form action={updateProjectStatus}>
                                <input type="hidden" name="projectId" value={p.id} />
                                <input type="hidden" name="status" value="rejected" />
                                <button
                                  type="submit"
                                  className="inline-flex items-center rounded bg-rose-700 hover:bg-rose-800 text-white p-1 text-[10px] font-bold cursor-pointer transition-colors"
                                  title="Reject submission"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </ContentCard>
        </div>

        {/* Ready Plans Section */}
        <div id="ready-plans" className="scroll-mt-28">
          <ContentCard
            title="Approved Student Plans"
            icon={FileText}
            compact
            noPadding
            headerRight={
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {readyPlans.length} Ready
              </span>
            }
          >
            {readyPlans.length === 0 ? (
              <div className="flex items-center gap-2 px-3.5 py-3 text-xs text-slate-500 bg-slate-50/40">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span>No approved student plans awaiting action</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Business Venture</th>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {readyPlans.map((workspace) => {
                      const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
                      const listing = projectsList.find((project) => project.file_path === `workspace-export:${workspace.id}`);
                      const cleanTitle = cleanVentureTitle(workspace.title);
                      return (
                        <tr key={workspace.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 tracking-tight text-xs sm:text-[13px] max-w-[200px] truncate" title={cleanTitle}>
                            {cleanTitle}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                              <span className="font-medium text-slate-700 truncate max-w-[130px]">
                                {student?.full_name || "Student"}
                              </span>
                              {student?.admission_number && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60 w-fit">
                                  {student.admission_number}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                listing?.status === "published"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : listing?.status === "pending_review"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {listing?.status === "published"
                                ? "Published"
                                : listing?.status === "pending_review"
                                ? "Queued"
                                : "Unlisted"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {listing && (
                                <>
                                  <Link
                                    href={`/api/download?projectId=${encodeURIComponent(listing.id)}&format=pdf`}
                                    className="inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                                    title="Download PDF"
                                  >
                                    <Download className="h-3 w-3 text-slate-500" /> PDF
                                  </Link>
                                  <Link
                                    href={`/api/download?projectId=${encodeURIComponent(listing.id)}&format=docx`}
                                    className="inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                                    title="Download Word"
                                  >
                                    <Download className="h-3 w-3 text-slate-500" /> Word
                                  </Link>
                                </>
                              )}
                              {listing?.status !== "pending_review" && listing?.status !== "published" && (
                                <form action={queueApprovedBusinessPlanForPublishing} className="inline-flex items-center gap-1">
                                  <input type="hidden" name="workspaceId" value={workspace.id} />
                                  <label className="sr-only" htmlFor={`marketplace-price-${workspace.id}`}>
                                    Price KES
                                  </label>
                                  <input
                                    id={`marketplace-price-${workspace.id}`}
                                    name="priceKes"
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="1"
                                    required
                                    defaultValue={workspace.marketplace_price_kes ?? listing?.price_kes ?? 0}
                                    className="h-6 w-16 rounded border border-slate-300 px-1 text-[11px] font-semibold text-slate-900"
                                  />
                                  <button
                                    type="submit"
                                    className="rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 cursor-pointer transition-colors"
                                  >
                                    {listing ? "Requeue" : "Queue"}
                                  </button>
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </ContentCard>
        </div>
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
