import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ContentCard } from "@/components/layout/ContentCard";
import { updateClassStudioCode } from "../actions";
import type { UserProfile } from "@/types/database";

export default async function AdminUsersPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/admin/users");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/studio");
  }

  const [{ data: allProfiles }, { data: primaryInstitution }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("institutions")
      .select("id, name, code")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const classStudioCode = (primaryInstitution as { code?: string | null } | null)?.code || "ICMHS-2026";
  const profilesList: UserProfile[] = (allProfiles as unknown as UserProfile[]) || [];

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="User Directory"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Link href="/admin" className="font-semibold text-[#092B68] hover:underline">
            Admin Console
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">User Directory</span>
        </div>
      </div>

      <ContentCard
        title="User Directory"
        subtitle="Manage Studio class access vs. Marketplace-only buyers"
        icon={Users}
        compact
        headerRight={
          <div className="flex flex-wrap items-center gap-2">
            <form
              action={updateClassStudioCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1"
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#092B68]">
                Class Studio Code:
              </span>
              <input
                type="text"
                name="classCode"
                defaultValue={classStudioCode}
                aria-label="Class Studio Access Code"
                className="h-6 w-28 rounded border border-slate-300 bg-white px-2 text-xs font-mono font-semibold text-slate-900 focus:border-[#092B68] focus:outline-none"
              />
              <button
                type="submit"
                className="h-6 rounded bg-[#092B68] hover:bg-[#07204f] px-2.5 text-[10.5px] font-semibold text-white transition-colors cursor-pointer"
              >
                Save Code
              </button>
            </form>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {profilesList.length} Total Users
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Studio Access</th>
                <th className="py-2 px-3">Course / Institution</th>
                <th className="py-2 px-3">Joined</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profilesList.map((p) => {
                const studioAllowed =
                  p.role === "admin" || p.role === "supervisor" || Boolean(p.institution_id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      p.archived_at ? "opacity-65 bg-slate-50/40" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/users/${p.id}`}
                          className="hover:text-[#092B68] hover:underline transition-colors"
                        >
                          {p.full_name || "Unnamed"}
                        </Link>
                        {p.archived_at && (
                          <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.role === "admin"
                            ? "bg-slate-100 text-[#092B68] border border-slate-300"
                            : p.role === "supervisor"
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          studioAllowed
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {studioAllowed ? "Studio Class" : "Marketplace Only"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.institution || p.course || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${p.id}`}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#092B68] hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </AppShell>
  );
}
