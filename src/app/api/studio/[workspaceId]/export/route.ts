import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { resolveBusinessPlanModel, type BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import {
  buildVariedBusinessPlanPreliminaries,
  buildVariedBrandSymbolismBlock,
  isPlaceholderPreliminary,
} from "@/lib/studio/businessPlanPreliminaries";
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
      .select("id, student_id, supervisor_id, workspace_type, level, course, title, status, business_plan_specs, student:student_id(full_name, admission_number), supervisor:supervisor_id(full_name), institution:institution_id(name)")
      .eq("id", workspaceId).maybeSingle(),
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!workspace) return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
  const authorized = workspace.student_id === user.id || profile?.role === "admin" || (profile?.role === "supervisor" && workspace.supervisor_id === user.id);
  if (!authorized) return NextResponse.json({ error: "You cannot download this plan." }, { status: 403 });
  const isResearch = workspace.workspace_type === "research_secondary";
  if (workspace.workspace_type !== "business_plan" && !isResearch) {
    return NextResponse.json({ error: "Document export is available for business plans and research projects." }, { status: 400 });
  }

  const { data: rows, error } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: "Could not load the business plan." }, { status: 500 });

  const businessSpecs = workspace.business_plan_specs as (Partial<BusinessPlanSpecs> & {
    export_unlocked?: boolean;
    unlocked_at?: string;
  }) | null;

  // Enforce Pay-to-Export Gate:
  // Admin role is exempt. Students must unlock KNEC Word (.docx) export for KES 350.
  const isUnlocked = Boolean(
    profile?.role === "admin" ||
    businessSpecs?.export_unlocked === true ||
    (workspace as unknown as { is_unlocked?: boolean })?.is_unlocked === true
  );

  if (!isUnlocked) {
    return NextResponse.json(
      {
        error: "Export locked. Please unlock the official KNEC Word (.docx) export (KES 350) to download this business plan.",
        locked: true,
        price_kes: 350,
      },
      { status: 402 }
    );
  }

  const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
  const supervisor = workspace.supervisor as unknown as { full_name?: string | null } | null;
  const institution = workspace.institution as unknown as { name?: string | null } | null;

  const qCandidate = _request.nextUrl.searchParams.get("candidateName")?.trim();
  const qAdmission = _request.nextUrl.searchParams.get("admissionNumber")?.trim();
  const qInstitution = _request.nextUrl.searchParams.get("institutionName")?.trim();
  const qSupervisor = _request.nextUrl.searchParams.get("supervisorName")?.trim();
  const qTown = _request.nextUrl.searchParams.get("townOrMarket")?.trim();
  const qCounty = _request.nextUrl.searchParams.get("county")?.trim();
  const hasQueryOverrides = Boolean(qCandidate || qAdmission || qInstitution || qSupervisor || qTown || qCounty);

  const isAdminMaster = workspace.supervisor_id === null && !institution?.name && !hasQueryOverrides && profile?.role === "admin";
  const resolvedCandidate = isAdminMaster
    ? "{{CANDIDATE_NAME}}"
    : qCandidate || businessSpecs?.candidateName?.trim() || student?.full_name?.trim() || "Candidate";
  const resolvedAdmission = isAdminMaster
    ? "{{ADMISSION_NUMBER}}"
    : qAdmission || businessSpecs?.admissionNumber?.trim() || student?.admission_number?.trim() || "ADM/2026/001";
  const resolvedInstitution = isAdminMaster
    ? "{{INSTITUTION_NAME}}"
    : qInstitution || businessSpecs?.institutionName?.trim() || institution?.name?.trim() || "Kenya Education Cloud TVET Institute";
  const resolvedSupervisor = isAdminMaster
    ? "{{SUPERVISOR_NAME}}"
    : qSupervisor || businessSpecs?.supervisorName?.trim() || supervisor?.full_name?.trim() || "Project Supervisor";
  const resolvedTown = isAdminMaster
    ? "{{TARGET_TOWN}}"
    : qTown || businessSpecs?.townOrMarket?.trim() || "Nairobi";
  const resolvedCounty = isAdminMaster
    ? "{{TARGET_COUNTY}}"
    : qCounty || businessSpecs?.county?.trim() || "Nairobi County";
  const resolvedBusinessName = businessSpecs?.businessName?.trim() || workspace.title || "Business Plan";

  const variedPrelims = buildVariedBusinessPlanPreliminaries({
    seed: `${workspace.id}|${resolvedBusinessName}|${resolvedCandidate}`,
    businessName: resolvedBusinessName,
    candidateName: resolvedCandidate,
    admissionNumber: resolvedAdmission,
    institutionName: resolvedInstitution,
    supervisorName: resolvedSupervisor,
    townOrMarket: resolvedTown,
    county: resolvedCounty,
    course: workspace.course || businessSpecs?.course,
    level: workspace.level,
    industrySector: businessSpecs?.industrySector,
    primaryProduct: businessSpecs?.primaryProduct,
    dedicationText: businessSpecs?.dedicationText,
    acknowledgementsText: businessSpecs?.acknowledgementsText,
  });

  const businessModel = resolveBusinessPlanModel(businessSpecs);
  const sectionsByKey = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const sections = getWorkspaceSections(workspace.workspace_type, workspace.level, isResearch ? undefined : businessModel)
    .map((definition) => {
      let content = sectionsByKey.get(definition.key) || "";
      if (!isResearch && definition.key === "prelim.declaration" && isPlaceholderPreliminary(content)) {
        content = variedPrelims.declaration;
      } else if (
        !isResearch &&
        definition.key === "prelim.dedication" &&
        ((businessSpecs?.dedicationText?.trim() && !isPlaceholderPreliminary(businessSpecs.dedicationText)) ||
          isPlaceholderPreliminary(content))
      ) {
        content = variedPrelims.dedication;
      } else if (
        !isResearch &&
        definition.key === "prelim.acknowledgements" &&
        ((businessSpecs?.acknowledgementsText?.trim() && !isPlaceholderPreliminary(businessSpecs.acknowledgementsText)) ||
          isPlaceholderPreliminary(content))
      ) {
        content = variedPrelims.acknowledgements;
      } else if (content) {
        content = content
          .replaceAll("{{CANDIDATE_NAME}}", resolvedCandidate)
          .replaceAll("{{ADMISSION_NUMBER}}", resolvedAdmission)
          .replaceAll("{{INSTITUTION_NAME}}", resolvedInstitution)
          .replaceAll("{{SUPERVISOR_NAME}}", resolvedSupervisor)
          .replaceAll("{{TARGET_TOWN}}", resolvedTown)
          .replaceAll("{{TARGET_COUNTY}}", resolvedCounty)
          .replaceAll("[Enter candidate name]", resolvedCandidate)
          .replaceAll("[Enter index number]", resolvedAdmission)
          .replaceAll("[Enter institution name]", resolvedInstitution)
          .replaceAll("[Institution name]", resolvedInstitution)
          .replaceAll("[Enter supervisor name]", resolvedSupervisor)
          .replaceAll("[Supervisor name]", resolvedSupervisor);
        if (definition.key === "ch1.name" && /Green Vitality Motif/i.test(content)) {
          const variedMotif = buildVariedBrandSymbolismBlock({
            seed: `${workspace.id}|${resolvedBusinessName}`,
            businessName: resolvedBusinessName,
            county: resolvedCounty,
            townOrMarket: resolvedTown,
            industrySector: businessSpecs?.industrySector,
            primaryProduct: businessSpecs?.primaryProduct,
          });
          content = content.replace(
            /#### 1\.1\.1 Brand Positioning and Symbolism[\s\S]*?(?=\n#### 1\.1\.2|\n### |$)/i,
            `#### 1.1.1 Brand Positioning and Symbolism\n${variedMotif}\n`
          );
        }
      }
      return { title: definition.title, content };
    })
    .filter((section) => section.content.trim());
  if (sections.length === 0) return NextResponse.json({ error: "Build the business plan before downloading." }, { status: 400 });

  const document = {
    title: workspace.title || resolvedBusinessName,
    candidate: resolvedCandidate,
    admissionNumber: resolvedAdmission,
    institution: resolvedInstitution,
    supervisor: resolvedSupervisor,
    businessName: resolvedBusinessName,
    tagline: isResearch ? undefined : businessSpecs?.tagline,
    industrySector: isResearch ? undefined : businessSpecs?.industrySector,
    primaryProduct: isResearch ? undefined : businessSpecs?.primaryProduct,
    documentKind: isResearch ? ("research" as const) : ("business_plan" as const),
    isInstitutional: businessSpecs?.isInstitutional === true,
    course: workspace.course || businessSpecs?.course || "Human Nutrition and Dietetics",
    level: workspace.level === "craft" ? "Certificate" : "Diploma",
    sections,
  };
  const stem = (workspace.title || "business-plan").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "business-plan";
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
