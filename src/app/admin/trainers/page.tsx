import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ContentCard } from "@/components/layout/ContentCard";
import { approveTrainer } from "../actions";

export default async function AdminTrainersPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?portal=faculty&redirect=/admin/trainers");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/studio");
  }

  const { data: pendingTrainerProfiles } = await supabase
    .from("trainer_profiles")
    .select("user_id, status, profiles(full_name)")
    .eq("status", "pending");

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Trainer Approvals"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Link href="/admin" className="font-semibold text-[#092B68] hover:underline">
            Admin Console
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Trainer Approvals</span>
        </div>
      </div>

      <ContentCard
        title="Trainer approvals"
        subtitle="Review access requests before enabling trainer tools"
        icon={ShieldCheck}
        compact
        headerRight={
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            {pendingTrainerProfiles?.length || 0} Pending
          </span>
        }
      >
        {!pendingTrainerProfiles?.length ? (
          <p className="text-xs text-slate-500">No trainer applications are waiting for review.</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {pendingTrainerProfiles.map((trainer) => {
              const trainerProfile = trainer.profiles as unknown as {
                full_name?: string | null;
              } | null;
              return (
                <div
                  key={trainer.user_id}
                  className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {trainerProfile?.full_name || "Unnamed applicant"}
                    </p>
                    <p className="text-xs text-slate-500">Trainer access request</p>
                  </div>
                  <form action={approveTrainer}>
                    <input type="hidden" name="userId" value={trainer.user_id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg bg-[#092B68] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#07204f] transition-colors cursor-pointer"
                    >
                      Approve trainer
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </AppShell>
  );
}
