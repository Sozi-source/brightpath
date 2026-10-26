import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceSections, getSectionStarterContent } from "@/lib/studio/templates";
import { saveSectionText } from "@/app/studio/actions";
import { SectionEditor } from "./SectionEditor";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ChevronLeft, Lock } from "lucide-react";
import type { UserProfile } from "@/types/database";

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
  if (workspace.student_id !== user.id && profile?.role !== "admin" && profile?.role !== "supervisor") {
    redirect("/studio");
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

  const typeLabel =
    workspace.workspace_type === "trade_fabrication"
      ? "Trade Fabrication"
      : workspace.workspace_type === "research_secondary"
      ? "Secondary Research"
      : "Business Plan";

  // Compute built-in KNEC starter template for this specific chapter
  const starterTemplate = getSectionStarterContent(
    workspace.workspace_type,
    workspace.level,
    sectionDef.key
  );

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle={`Drafting: ${sectionDef.title}`}
    >
      <PageHeaderCard
        title={sectionDef.title}
        subtitle={`${workspace.title || "Project Workspace"} • ${workspace.course}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Project Studio", href: "/studio" },
          { label: workspace.title || "Overview", href: `/studio/${workspaceId}` },
          { label: sectionDef.title, active: true },
        ]}
        metadata={[
          { label: "Track", value: typeLabel },
          { label: "Target", value: `Min ${sectionDef.minWords || 50} words` },
          { label: "Status", value: isLocked ? "Locked" : "Drafting" },
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
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300">
                <Lock className="h-3.5 w-3.5" />
                Locked
              </span>
            )}
          </div>
        }
      />

      <SectionEditor
        workspaceId={workspace.id}
        sectionKey={sectionDef.key}
        guidance={sectionDef.guidance}
        rubricMarks={sectionDef.rubricMarks}
        minWords={sectionDef.minWords}
        phase={sectionDef.phase}
        isLocked={isLocked}
        currentText={sectionRecord?.current_text || ""}
        starterTemplate={starterTemplate}
        prevSectionKey={prevSectionKey}
        nextSectionKey={nextSectionKey}
        saveAction={saveSectionText}
      />
    </AppShell>
  );
}
