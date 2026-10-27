import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { updateWorkspaceTopic, aiNarrowTopicAction, resolveWorkspaceAiMode } from "@/app/studio/actions";
import { TopicCoach } from "./TopicCoach";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ChevronLeft } from "lucide-react";
import type { TopicBankItem, UserProfile } from "@/types/database";

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
      student_id,
      institution_id
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

  // Fetch topics from topic_bank and resolve institutional AI policy in parallel
  const [{ data: topicsData }, effectiveAiMode] = await Promise.all([
    db
      .from("topic_bank")
      .select("id, area, title, workspace_type, suggested_indicators, suggested_sources, course_tags, active")
      .eq("active", true)
      .order("area", { ascending: true }),
    resolveWorkspaceAiMode(db, workspace.institution_id, workspace.student_id),
  ]);

  const topics: TopicBankItem[] = topicsData || [];

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
      activeContextTitle={`Topic: ${workspace.title || "Formulation"}`}
    >
      <PageHeaderCard
        title="Topic Discovery & Formulation"
        subtitle="Narrow down research ideas into approved examination proposals"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Overview", href: `/studio/${workspaceId}` },
          { label: "Topic Formulation", active: true },
        ]}
        metadata={[
          { label: "Course", value: workspace.course },
          { label: "Track", value: `${workspace.level.toUpperCase()} • ${typeLabel}` },
        ]}
        actions={
          <Link
            href={`/studio/${workspaceId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Overview</span>
          </Link>
        }
      />

      <TopicCoach
        workspaceId={workspace.id}
        initialTitle={workspace.title || ""}
        initialProblemArea={workspace.problem_area || ""}
        workspaceType={workspace.workspace_type}
        course={workspace.course}
        aiMode={effectiveAiMode}
        topics={topics}
        saveAction={updateWorkspaceTopic}
        aiNarrowAction={aiNarrowTopicAction}
      />
    </AppShell>
  );
}
