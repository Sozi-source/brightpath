import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  AdminInstitutionalPlans,
  type AdminInstitutionalPlanRow,
} from "@/components/admin/AdminInstitutionalPlans";

export default async function AdminInstitutionalPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/admin/institutional");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/studio");
  }

  const { data: institutionalWorkspaces } = await supabase
    .from("project_workspaces")
    .select("id, title, status, final_project_status, updated_at, workspace_type, business_plan_specs")
    .eq("workspace_type", "business_plan")
    .order("updated_at", { ascending: false });

  const institutionalPlans: AdminInstitutionalPlanRow[] = (
    (institutionalWorkspaces || []) as Array<
      AdminInstitutionalPlanRow & {
        workspace_type?: string;
        business_plan_specs?: { isInstitutional?: boolean } | null;
      }
    >
  )
    .filter((workspace) => workspace.business_plan_specs?.isInstitutional === true)
    .map(({ id, title, status, final_project_status, updated_at }) => ({
      id,
      title,
      status,
      final_project_status,
      updated_at,
    }));

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Institutional Plans"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Link href="/admin" className="font-semibold text-[#092B68] hover:underline">
            Admin Console
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Institutional Plans</span>
        </div>
      </div>

      <ContentCard
        title="Institutional Plans"
        subtitle="ICMHS feasibility workspaces"
        icon={ShieldCheck}
        compact
        headerRight={
          <span className="text-[11px] font-semibold rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[#092B68]">
            Admin only
          </span>
        }
      >
        <AdminInstitutionalPlans plans={institutionalPlans} />
      </ContentCard>
    </AppShell>
  );
}
