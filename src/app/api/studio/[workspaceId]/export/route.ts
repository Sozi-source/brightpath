import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { createBusinessPlanDocx } from "@/lib/studio/businessPlanDocx";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: RouteContext<"/api/studio/[workspaceId]/export">) {
  const { workspaceId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to download this plan." }, { status: 401 });

  const db = getServerDbClient(supabase);
  const [{ data: workspace }, { data: profile }] = await Promise.all([
    db.from("project_workspaces")
      .select("id, student_id, supervisor_id, workspace_type, level, course, title, status, student:student_id(full_name, admission_number), institution:institution_id(name)")
      .eq("id", workspaceId).maybeSingle(),
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!workspace) return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
  const authorized = workspace.student_id === user.id || profile?.role === "admin" || (profile?.role === "supervisor" && workspace.supervisor_id === user.id);
  if (!authorized) return NextResponse.json({ error: "You cannot download this plan." }, { status: 403 });
  if (workspace.workspace_type !== "business_plan") return NextResponse.json({ error: "Word export is available for business plans." }, { status: 400 });

  const { data: rows, error } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: "Could not load the business plan." }, { status: 500 });

  const sectionsByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const sections = getWorkspaceSections("business_plan", workspace.level)
    .map((definition) => ({ title: definition.title, content: sectionsByKey.get(definition.key) || "" }))
    .filter((section) => section.content.trim());
  if (sections.length === 0) return NextResponse.json({ error: "Build the business plan before downloading." }, { status: 400 });

  const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
  const institution = workspace.institution as unknown as { name?: string | null } | null;
  const docx = createBusinessPlanDocx({
    title: workspace.title || "Business Plan",
    candidate: student?.full_name || "Candidate",
    admissionNumber: student?.admission_number,
    institution: institution?.name,
    course: workspace.course,
    level: workspace.level === "craft" ? "Certificate" : "Diploma",
    sections,
  });
  const filename = `${(workspace.title || "business-plan").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "business-plan"}.docx`;
  return new Response(docx as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
