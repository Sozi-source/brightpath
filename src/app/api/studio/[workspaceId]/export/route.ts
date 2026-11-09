import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { resolveBusinessPlanModel, type BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { createBusinessPlanDocx } from "@/lib/studio/businessPlanDocx";
import { createBusinessPlanPdf } from "@/lib/studio/businessPlanPdf";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: RouteContext<"/api/studio/[workspaceId]/export">) {
  const { workspaceId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to download this plan." }, { status: 401 });

  const db = getServerDbClient(supabase);
  const [{ data: workspace }, { data: profile }] = await Promise.all([
    db.from("project_workspaces")
      .select("id, student_id, supervisor_id, workspace_type, level, course, title, status, business_plan_specs, student:student_id(full_name, admission_number), supervisor:supervisor_id(full_name), institution:institution_id(name)")
      .eq("id", workspaceId).maybeSingle(),
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!workspace) return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
  const authorized = workspace.student_id === user.id || profile?.role === "admin" || (profile?.role === "supervisor" && workspace.supervisor_id === user.id);
  if (!authorized) return NextResponse.json({ error: "You cannot download this plan." }, { status: 403 });
  if (workspace.workspace_type !== "business_plan") return NextResponse.json({ error: "Document export is available for business plans." }, { status: 400 });

  const { data: rows, error } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: "Could not load the business plan." }, { status: 500 });

  const businessSpecs = workspace.business_plan_specs as (Partial<BusinessPlanSpecs> & {
    export_unlocked?: boolean;
    unlocked_at?: string;
  }) | null;

  // Enforce Pay-to-Export Gate:
  // Admin role is exempt. Students must unlock KNEC Word (.docx) & PDF export for KES 350.
  const isUnlocked = Boolean(
    profile?.role === "admin" ||
    businessSpecs?.export_unlocked === true ||
    (workspace as unknown as { is_unlocked?: boolean })?.is_unlocked === true
  );

  if (!isUnlocked) {
    return NextResponse.json(
      {
        error: "Export locked. Please unlock the official KNEC Word (.docx) & PDF export (KES 350) to download this business plan.",
        locked: true,
        price_kes: 350,
      },
      { status: 402 }
    );
  }

  const businessModel = resolveBusinessPlanModel(businessSpecs);
  const sectionsByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const sections = getWorkspaceSections("business_plan", workspace.level, businessModel)
    .map((definition) => ({ title: definition.title, content: sectionsByKey.get(definition.key) || "" }))
    .filter((section) => section.content.trim());
  if (sections.length === 0) return NextResponse.json({ error: "Build the business plan before downloading." }, { status: 400 });

  const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
  const supervisor = workspace.supervisor as unknown as { full_name?: string | null } | null;
  const institution = workspace.institution as unknown as { name?: string | null } | null;
  const document = {
    title: workspace.title || businessSpecs?.businessName || "Business Plan",
    candidate: student?.full_name || businessSpecs?.candidateName || "Candidate",
    admissionNumber: student?.admission_number || businessSpecs?.admissionNumber || null,
    institution: institution?.name || businessSpecs?.institutionName || null,
    supervisor: supervisor?.full_name || businessSpecs?.supervisorName || null,
    businessName: businessSpecs?.businessName || workspace.title,
    tagline: businessSpecs?.tagline,
    industrySector: businessSpecs?.industrySector,
    primaryProduct: businessSpecs?.primaryProduct,
    course: workspace.course || businessSpecs?.course || "Human Nutrition and Dietetics",
    level: workspace.level === "craft" ? "Certificate" : "Diploma",
    sections,
  };
  const stem = (workspace.title || "business-plan").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "business-plan";
  if (_request.nextUrl.searchParams.get("format") === "pdf") {
    try {
      const pdf = await createBusinessPlanPdf(document);
      return new Response(pdf as unknown as BodyInit, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${stem}.pdf"`, "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      console.error("Business plan PDF export failed:", error);
      return NextResponse.json({ error: "PDF export is temporarily unavailable. Download the Word copy instead." }, { status: 503 });
    }
  }
  const docx = createBusinessPlanDocx(document);
  const filename = `${stem}.docx`;
  return new Response(docx as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
