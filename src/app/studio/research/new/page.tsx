import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { StudioAccessGate } from "../../StudioAccessGate";
import { hasStudioAccess } from "@/lib/studio/access";
import { ResearchNewClient } from "./ResearchNewClient";

export default async function NewResearchProjectPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/studio/research/new");
  }

  const db = getServerDbClient(supabase);
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, role, admission_number, course, level, institution_id, institutions(name)")
    .eq("id", user.id)
    .single();

  const rawInst = profile?.institutions as unknown;
  const institutionName =
    (Array.isArray(rawInst)
      ? (rawInst[0] as { name?: string })?.name
      : (rawInst as { name?: string })?.name) || "Independent Candidate";

  const canUseStudio = hasStudioAccess(profile);

  return (
    <AppShell
      user={user}
      profile={profile}
      institutionName={institutionName}
      activeContextTitle="Research Project Builder"
    >
      {canUseStudio ? (
        <ResearchNewClient
          isAdmin={profile?.role === "admin"}
          defaultAdmissionNumber={profile?.admission_number || ""}
          defaultLevel={profile?.level === "craft" ? "craft" : "diploma"}
        />
      ) : (
        <StudioAccessGate />
      )}
    </AppShell>
  );
}
