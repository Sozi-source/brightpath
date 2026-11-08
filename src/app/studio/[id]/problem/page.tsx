import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import {
  updateWorkspaceTopic,
  aiNarrowTopicAction,
} from "@/app/studio/actions";
import { TopicCoach } from "./TopicCoach";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ChevronLeft, Sparkles } from "lucide-react";
import type { UserProfile } from "@/types/database";

export const instant = false;

interface ProblemFinderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemFinderPage({ params }: ProblemFinderPageProps) {
  await connection();
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/problem`);
  }

  const db = getServerDbClient(supabase);

  const { data: profileData } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;

  // Load workspace
  const { data: workspace } = await db
    .from("project_workspaces")
    .select(`
      id,
      title,
      problem_area,
      workspace_type,
      level,
      course,
      status,
      student_id
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    notFound();
  }

  // Authorize student
  if (workspace.student_id !== user.id && profile?.role !== "admin") {
    redirect("/studio");
  }

  // Business plans are pre-configured from the catalog and bypass topic formulation
  if (workspace.workspace_type === "business_plan") {
    redirect(`/studio/${workspaceId}`);
  }

  const typeLabel =
    workspace.workspace_type === "trade_fabrication"
      ? "Food Science Formulation"
      : workspace.workspace_type === "research_secondary"
      ? "Nutrition Research"
      : "Nutrition Enterprise";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={
        workspace.workspace_type === "business_plan"
          ? `Business Plan: ${workspace.title || "Concept Formulation"}`
          : `Topic: ${workspace.title || "Formulation"}`
      }
    >
      <PageHeaderCard
        title={
          workspace.workspace_type === "business_plan"
            ? "Business Plan Concept"
            : "Project Topic"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Overview", href: `/studio/${workspaceId}` },
          {
            label: workspace.workspace_type === "business_plan" ? "Business Plan Concept" : "Topic",
            active: true,
          },
        ]}
        metadata={[
          { label: "Course", value: workspace.course },
          { label: "Track", value: `${workspace.level === "craft" ? "Certificate" : "Diploma"} • ${typeLabel}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            {workspace.workspace_type === "business_plan" && (
              <Link
                href={`/studio/${workspaceId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Build Business Plan</span>
              </Link>
            )}
          </div>
        }
      />

      <TopicCoach
        workspaceId={workspace.id}
        initialTitle={workspace.title || ""}
        initialProblemArea={workspace.problem_area || ""}
        workspaceType={workspace.workspace_type}
        saveAction={updateWorkspaceTopic}
        aiNarrowAction={aiNarrowTopicAction}
      />
    </AppShell>
  );
}
