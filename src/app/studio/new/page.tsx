import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectAreaCatalog } from "@/components/studio/ProjectAreaCatalog";

export const instant = false;

export default async function NewWorkspacePage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/studio/new");
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

  return (
    <AppShell
      user={user}
      profile={profile}
      institutionName={institutionName}
      activeContextTitle={profile?.course || "New Project"}
    >
      <ProjectAreaCatalog
        candidateName={profile?.full_name || user.email || "Candidate"}
        admissionNumber={profile?.admission_number || ""}
        course={profile?.course || "Diploma in Human Nutrition and Dietetics"}
        level={profile?.level || "diploma"}
        currentWorkspacesCount={0}
      />
    </AppShell>
  );
}
