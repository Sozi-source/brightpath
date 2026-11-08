import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
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
    .select("full_name, role, admission_number, course, level, institution_id")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="New Project"
    >
      <PageHeaderCard
        title="Select Project Area"
        subtitle="Choose from 35 curriculum ventures to initialize your workspace."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: "Select Area", active: true },
        ]}
        metadata={[
          { label: "Candidate", value: profile?.full_name || user.email || "Student" },
          { label: "Admission No", value: profile?.admission_number || "Unset" },
        ]}
      />

      <div className="space-y-4">
        <ProjectAreaCatalog
          candidateName={profile?.full_name || user.email || "Candidate"}
          admissionNumber={profile?.admission_number || ""}
          course={profile?.course || "Diploma in Human Nutrition and Dietetics"}
          level={profile?.level || "diploma"}
          currentWorkspacesCount={0}
        />
      </div>
    </AppShell>
  );
}
