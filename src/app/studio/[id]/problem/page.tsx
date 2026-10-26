import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWorkspaceTopic } from "@/app/studio/actions";
import { TopicSelector } from "./TopicSelector";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ChevronLeft } from "lucide-react";
import type { TopicBankItem, UserProfile } from "@/types/database";

export const instant = false;

interface ProblemFinderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemFinderPage({ params }: ProblemFinderPageProps) {
  const { id: workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/problem`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;

  // Load workspace
  const { data: workspace } = await supabase
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

  // Fetch topics from topic_bank
  const { data: topicsData } = await supabase
    .from("topic_bank")
    .select("id, area, title, workspace_type, suggested_indicators, suggested_sources, course_tags, active")
    .eq("active", true)
    .order("area", { ascending: true });

  const topics: TopicBankItem[] = topicsData || [];

  const typeLabel =
    workspace.workspace_type === "trade_fabrication"
      ? "Trade Fabrication"
      : workspace.workspace_type === "research_secondary"
      ? "Secondary Research"
      : "Business Plan";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Problem Formulation: ${workspace.title || "Topic"}`}
    >
      <PageHeaderCard
        title="Problem Formulation & Curated Topic Bank"
        subtitle={`Select a verified curriculum research topic from our TVET knowledge base, or formulate your specific project title and demographic focus for ${workspace.course}.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Workspace Overview", href: `/studio/${workspaceId}` },
          { label: "Problem Formulation", active: true },
        ]}
        metadata={[
          { label: "Course Specialization", value: workspace.course },
          { label: "TVET Track", value: `${workspace.level.toUpperCase()} • ${typeLabel}` },
          { label: "Curriculum Bank", value: `${topics.length} Accredited Topics` },
          { label: "Milestone", value: "Phase 1: Topic Selection" },
        ]}
        actions={
          <Link
            href={`/studio/${workspaceId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Workspace Overview</span>
          </Link>
        }
      />

      <TopicSelector
        workspaceId={workspace.id}
        initialTitle={workspace.title || ""}
        initialProblemArea={workspace.problem_area || ""}
        workspaceType={workspace.workspace_type}
        level={workspace.level}
        topics={topics}
        action={updateWorkspaceTopic}
      />
    </AppShell>
  );
}
