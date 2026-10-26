import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { saveSectionText } from "@/app/studio/actions";
import { SectionEditor } from "./SectionEditor";
import { ArrowLeft, Lock } from "lucide-react";

export const instant = false;

interface WriteSectionPageProps {
  params: Promise<{ id: string; sectionKey: string }>;
}

export default async function WriteSectionPage({ params }: WriteSectionPageProps) {
  const { id: workspaceId, sectionKey: rawSectionKey } = await params;
  const sectionKey = decodeURIComponent(rawSectionKey);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/studio/${workspaceId}/write/${sectionKey}`);
  }

  // Load workspace
  const { data: workspace } = await supabase
    .from("project_workspaces")
    .select(`
      id,
      title,
      workspace_type,
      level,
      course,
      status,
      student_id
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspace) notFound();

  // Authorize student (or supervisor/admin)
  if (workspace.student_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "supervisor") {
      redirect("/studio");
    }
  }

  // Find section definition from template
  const sectionDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const sectionDefIndex = sectionDefs.findIndex((s) => s.key === sectionKey);

  if (sectionDefIndex === -1) {
    notFound();
  }

  const sectionDef = sectionDefs[sectionDefIndex];
  const prevSectionKey = sectionDefIndex > 0 ? sectionDefs[sectionDefIndex - 1].key : null;
  const nextSectionKey =
    sectionDefIndex < sectionDefs.length - 1 ? sectionDefs[sectionDefIndex + 1].key : null;

  // Load existing section data from database
  const { data: sectionRecord } = await supabase
    .from("workspace_sections")
    .select("id, current_text, status, phase")
    .eq("workspace_id", workspaceId)
    .eq("section_key", sectionKey)
    .single();

  const isLocked =
    sectionDef.phase === "project" &&
    workspace.status !== "approved" &&
    workspace.status !== "submitted";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-xs sm:text-sm truncate max-w-xs sm:max-w-md text-zinc-900 dark:text-zinc-100">
              {sectionDef.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                Active Section
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {workspace.course}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[10px] font-mono uppercase text-zinc-500">
              {workspace.level} Level
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {sectionDef.title}
          </h1>
          {workspace.title && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              Project: &ldquo;{workspace.title}&rdquo;
            </p>
          )}
        </div>

        <SectionEditor
          workspaceId={workspace.id}
          sectionKey={sectionDef.key}
          guidance={sectionDef.guidance}
          rubricMarks={sectionDef.rubricMarks}
          minWords={sectionDef.minWords}
          phase={sectionDef.phase}
          isLocked={isLocked}
          currentText={sectionRecord?.current_text || ""}
          prevSectionKey={prevSectionKey}
          nextSectionKey={nextSectionKey}
          saveAction={saveSectionText}
        />
      </main>
    </div>
  );
}
