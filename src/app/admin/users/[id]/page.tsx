import { connection } from "next/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import { StatCard } from "@/components/ui/StatCard";
import {
  ArrowLeft,
  UserCheck,
  Shield,
  BookOpen,
  Coins,
  Archive,
  Trash2,
  GraduationCap,
} from "lucide-react";
import type { UserProfile, Order } from "@/types/database";
import {
  updateUserRole,
  toggleStudentStudioAccess,
  toggleArchiveStudentAction,
  deleteStudentAction,
} from "@/app/admin/actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?portal=faculty&redirect=/admin/users/${id}`);
  }

  const { data: adminProfileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const adminProfile = adminProfileData as UserProfile | null;
  if (adminProfile?.role !== "admin") {
    redirect("/studio");
  }

  const adminClient = createAdminClient();
  const [
    { data: targetProfileData },
    { data: authUserResult },
    { data: workspacesData },
    { data: ordersData },
  ] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", id).maybeSingle(),
    adminClient.auth.admin.getUserById(id),
    adminClient
      .from("project_workspaces")
      .select("id, title, status, final_project_status, updated_at")
      .eq("student_id", id)
      .order("updated_at", { ascending: false }),
    adminClient
      .from("orders")
      .select("*")
      .eq("student_id", id)
      .eq("status", "paid")
      .order("created_at", { ascending: false }),
  ]);

  if (!targetProfileData) {
    notFound();
  }

  const target = targetProfileData as UserProfile;
  const email = authUserResult?.user?.email || "—";
  const workspaces = (workspacesData || []) as Array<{
    id: string;
    title: string;
    status: string;
    final_project_status: string | null;
    updated_at: string;
  }>;
  const paidOrders = (ordersData || []) as Order[];
  const totalSpentKes = paidOrders.reduce(
    (sum, o) => sum + Number(o.amount_kes || 0),
    0
  );

  const studioAllowed =
    target.role === "admin" ||
    target.role === "supervisor" ||
    Boolean(target.institution_id);
  const isSelf = target.id === user.id;
  const isAdmin = target.role === "admin";
  const displayName = target.full_name || "Unnamed User";

  return (
    <AppShell
      user={user}
      profile={adminProfile}
      activeContextTitle="User Profile"
    >
      <PageHeaderCard
        title={displayName}
        subtitle={email}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "User Directory", href: "/admin#users" },
          { label: displayName, active: true },
        ]}
        metadata={[
          { label: "Role", value: target.role.toUpperCase() },
          {
            label: "Access",
            value: studioAllowed ? "Studio Class" : "Marketplace Only",
          },
          {
            label: "Status",
            value: target.archived_at ? "Archived" : "Active",
          },
        ]}
        actions={
          <Link
            href="/admin#users"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Directory</span>
          </Link>
        }
      />

      {/* Quick Activity Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Project Workspaces"
          value={workspaces.length}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Completed Purchases"
          value={paidOrders.length}
          icon={Coins}
          color="emerald"
        />
        <StatCard
          label="Total Spend"
          value={`KES ${totalSpentKes.toLocaleString()}`}
          icon={GraduationCap}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Left: Profile Information & Activity */}
        <div className="space-y-5">
          <ContentCard
            title="Profile Details"
            subtitle="Academic & account metadata"
            icon={UserCheck}
            compact
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Full Name
                </dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {displayName}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Email Address
                </dt>
                <dd className="mt-0.5 font-mono text-slate-800">{email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Institution
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {target.institution || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Course / Programme
                </dt>
                <dd className="mt-0.5 text-slate-800">{target.course || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Admission No.
                </dt>
                <dd className="mt-0.5 font-mono text-slate-800">
                  {target.admission_number || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Phone
                </dt>
                <dd className="mt-0.5 font-mono text-slate-800">
                  {target.phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Joined
                </dt>
                <dd className="mt-0.5 font-mono text-slate-800">
                  {target.created_at
                    ? new Date(target.created_at).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase text-[10.5px] tracking-wider">
                  Account State
                </dt>
                <dd className="mt-0.5">
                  {target.archived_at ? (
                    <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">
                      Archived on{" "}
                      {new Date(target.archived_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-800">
                      Active
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </ContentCard>

          <ContentCard
            title={`Workspaces (${workspaces.length})`}
            subtitle="Business plans started in Project Studio"
            icon={BookOpen}
            compact
          >
            {workspaces.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No workspaces created yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {ws.title || "Untitled Workspace"}
                      </p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {(ws.final_project_status || ws.status || "draft").replaceAll("_", " ")}
                      </p>
                    </div>
                    <Link
                      href={`/studio/${ws.id}`}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right: Dedicated Account Actions */}
        <div className="space-y-5">
          <ContentCard
            title="Access & Role"
            subtitle="Studio permissions and portal role"
            icon={Shield}
            compact
          >
            <div className="space-y-4">
              {target.role === "student" && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Project Studio Access
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {studioAllowed
                        ? "Enrolled in Studio Class"
                        : "Marketplace-only buyer"}
                    </p>
                  </div>
                  <form action={toggleStudentStudioAccess}>
                    <input type="hidden" name="userId" value={target.id} />
                    <input
                      type="hidden"
                      name="grant"
                      value={studioAllowed ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        studioAllowed
                          ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-[#087f8c] text-white hover:bg-teal-800 shadow-2xs"
                      }`}
                    >
                      {studioAllowed ? "Revoke Access" : "Grant Studio"}
                    </button>
                  </form>
                </div>
              )}

              {!isSelf && (
                <form
                  action={updateUserRole}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <input type="hidden" name="userId" value={target.id} />
                  <div>
                    <label
                      htmlFor="role-select"
                      className="block text-xs font-semibold text-slate-900"
                    >
                      Account Role
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Assign student or admin privileges
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      id="role-select"
                      name="role"
                      defaultValue={target.role}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </ContentCard>

          {!isSelf && !isAdmin && (
            <ContentCard
              title="Account Lifecycle"
              subtitle="Archive or permanently remove student"
              icon={Archive}
              compact
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/80 bg-amber-50/40 p-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {target.archived_at
                        ? "Restore Archived Account"
                        : "Archive Student"}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {target.archived_at
                        ? "Mark this student account as active again."
                        : "Flag account as archived without deleting records."}
                    </p>
                  </div>
                  <form action={toggleArchiveStudentAction}>
                    <input type="hidden" name="userId" value={target.id} />
                    <input
                      type="hidden"
                      name="archive"
                      value={target.archived_at ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 cursor-pointer whitespace-nowrap"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>{target.archived_at ? "Restore" : "Archive"}</span>
                    </button>
                  </form>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                  <div>
                    <p className="text-xs font-semibold text-rose-950">
                      Delete Student Permanently
                    </p>
                    <p className="text-[11px] text-rose-700">
                      Removes auth login and profile record permanently.
                    </p>
                  </div>
                  <form action={deleteStudentAction}>
                    <input type="hidden" name="userId" value={target.id} />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/admin#users"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </form>
                </div>
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
