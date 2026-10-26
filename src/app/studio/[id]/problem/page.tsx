import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWorkspaceTopic } from "@/app/studio/actions";
import { TopicSelector } from "./TopicSelector";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { TopicBankItem } from "@/types/database";

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
  if (workspace.student_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/studio");
    }
  }

  // Fetch topics from topic_bank
  const { data: topicsData } = await supabase
    .from("topic_bank")
    .select("id, area, title, workspace_type, suggested_indicators, suggested_sources, course_tags, active")
    .eq("active", true)
    .order("area", { ascending: true });

  const topics: TopicBankItem[] = topicsData || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
              Problem Finder & Topic Bank
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
              {workspace.workspace_type.replace("_", " ")}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {workspace.level}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Phase 1: Topic Selection & Formulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Problem Statement & Topic Bank
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            Course: <strong className="text-zinc-900 dark:text-zinc-100">{workspace.course}</strong>.
            Select a verified curriculum research topic from our TVET knowledge base, or craft your custom project title and problem focus.
          </p>
        </div>

        <TopicSelector
          workspaceId={workspace.id}
          initialTitle={workspace.title || ""}
          initialProblemArea={workspace.problem_area || ""}
          workspaceType={workspace.workspace_type}
          level={workspace.level}
          topics={topics}
          action={updateWorkspaceTopic}
        />
      </main>
    </div>
  );
}
