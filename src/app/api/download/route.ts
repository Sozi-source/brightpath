import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBusinessPlanDocx } from "@/lib/studio/businessPlanDocx";
import { createBusinessPlanPdf } from "@/lib/studio/businessPlanPdf";
import { stampMarketplaceBusinessPlan } from "@/lib/studio/marketplaceListing";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  const format = request.nextUrl.searchParams.get("format");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId parameter." }, { status: 400 });
  }

  // Fetch project details
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, trainer_id, title, file_path")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  // Check admin privileges and buyer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, admission_number, institutions(name)")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = project.trainer_id === user.id;

  // Check purchase status if not admin/owner
  let isPurchased = false;
  if (!isAdmin && !isOwner) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("student_id", user.id)
      .eq("project_id", projectId)
      .eq("status", "paid")
      .maybeSingle();

    isPurchased = Boolean(order);
  }

  if (!isAdmin && !isOwner && !isPurchased) {
    return NextResponse.json(
      { error: "Access denied: Purchase required to download this project." },
      { status: 403 }
    );
  }

  // Attempt to generate signed storage URL using service role client
  const adminClient = createAdminClient();
  if (project.file_path.startsWith("workspace-export:")) {
    const workspaceIdFromPath = project.file_path.replace("workspace-export:", "").trim();
    const { data: snapshot } = await adminClient.from("project_plan_snapshots")
      .select("workspace_id, title, course, level, sections").eq("project_id", project.id).maybeSingle();
    if (!snapshot || !Array.isArray(snapshot.sections)) {
      return NextResponse.json({ error: "The published business plan is unavailable." }, { status: 404 });
    }

    const sourceWorkspaceId = snapshot.workspace_id || workspaceIdFromPath;
    const { data: sourceWorkspace } = sourceWorkspaceId
      ? await adminClient
          .from("project_workspaces")
          .select("id, title, business_plan_specs, student:student_id(full_name, admission_number), supervisor:supervisor_id(full_name), institution:institution_id(name)")
          .eq("id", sourceWorkspaceId)
          .maybeSingle()
      : { data: null };

    const specs = (sourceWorkspace?.business_plan_specs || null) as {
      businessName?: string;
      tagline?: string;
      industrySector?: string;
      primaryProduct?: string;
      candidateName?: string;
      admissionNumber?: string;
      institutionName?: string;
      supervisorName?: string;
      townOrMarket?: string;
      county?: string;
      streetOrBuilding?: string;
    } | null;
    const wsStudent = sourceWorkspace?.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
    const wsSupervisor = sourceWorkspace?.supervisor as unknown as { full_name?: string | null } | null;
    const wsInstitution = sourceWorkspace?.institution as unknown as { name?: string | null } | null;

    const rawSections = snapshot.sections as { title: string; content: string }[];
    const buyerInstitution = profile?.institutions as { name?: string } | { name?: string }[] | null;
    const buyerInstitutionName = Array.isArray(buyerInstitution)
      ? buyerInstitution[0]?.name
      : buyerInstitution?.name;

    const cleanParam = (key: string, ignoreValues: string[] = []) => {
      const val = request.nextUrl.searchParams.get(key)?.trim();
      if (!val) return "";
      if (ignoreValues.some((ignored) => ignored.toLowerCase() === val.toLowerCase())) return "";
      return val;
    };

    // Personalize the document using user-provided customization parameters, profile, or original workspace specs
    const candidateName =
      cleanParam("candidateName", ["Candidate"]) ||
      (isAdmin ? specs?.candidateName?.trim() || wsStudent?.full_name?.trim() || profile?.full_name?.trim() : profile?.full_name?.trim() || specs?.candidateName?.trim()) ||
      "Candidate";
    const admissionNumber =
      cleanParam("admissionNumber", ["ADM/2026/001"]) ||
      (isAdmin ? specs?.admissionNumber?.trim() || wsStudent?.admission_number?.trim() || profile?.admission_number?.trim() : profile?.admission_number?.trim() || specs?.admissionNumber?.trim()) ||
      "ADM/2026/001";
    const institutionName =
      cleanParam("institutionName", ["Kenya Education Cloud TVET Institute"]) ||
      buyerInstitutionName ||
      specs?.institutionName?.trim() ||
      wsInstitution?.name?.trim() ||
      "Kenya Education Cloud TVET Institute";
    const supervisorName =
      cleanParam("supervisorName", ["Institutional Supervisor"]) ||
      specs?.supervisorName?.trim() ||
      wsSupervisor?.full_name?.trim() ||
      "Project Supervisor";
    const townOrMarket =
      cleanParam("townOrMarket", ["Regional Center"]) ||
      specs?.townOrMarket?.trim() ||
      "Nairobi";
    const county =
      cleanParam("county", ["Regional County"]) ||
      specs?.county?.trim() ||
      "Nairobi County";

    const rawEnterpriseName = (
      specs?.businessName ||
      sourceWorkspace?.title ||
      snapshot.title ||
      project.title ||
      "Business Plan"
    )
      .replace(/\s*—\s*Complete KNEC Business Plan.*$/i, "")
      .replace(/\s*\((?:Craft Certificate|Diploma|Certificate)\)\s*$/i, "")
      .replace(/^Business Plan for\s+/i, "")
      .replace(/\s+in\s+Regional(?:,\s*County)?$/i, "")
      .replace(new RegExp(`\\s+in\\s+${(specs?.townOrMarket || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:,\\s*${(specs?.county || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})?$`, "i"), "")
      .trim();

    const isResearch = /research/i.test(snapshot.title || project.title || "");
    const cleanBusinessTitle = rawEnterpriseName || (isResearch ? "Research Project" : "Enterprise Business Plan");
    const coverTitle = isResearch
      ? cleanBusinessTitle.replace(/\s*—\s*Complete KNEC Research Project.*$/i, "").trim()
      : `Business Plan for ${cleanBusinessTitle} in ${townOrMarket}, ${county}`;

    const sections = stampMarketplaceBusinessPlan(rawSections, {
      seed: `${project.id}|${sourceWorkspaceId || ""}`,
      businessName: cleanBusinessTitle,
      course: snapshot.course,
      level: snapshot.level,
      industrySector: specs?.industrySector,
      primaryProduct: specs?.primaryProduct,
      candidateName,
      admissionNumber,
      institutionName,
      supervisorName,
      townOrMarket,
      county,
      streetOrBuilding: specs?.streetOrBuilding,
    });

    const document = {
      title: coverTitle,
      businessName: cleanBusinessTitle,
      tagline: isResearch ? undefined : specs?.tagline,
      industrySector: isResearch ? undefined : specs?.industrySector,
      primaryProduct: isResearch ? undefined : specs?.primaryProduct,
      documentKind: isResearch ? ("research" as const) : ("business_plan" as const),
      candidate: candidateName,
      admissionNumber,
      institution: institutionName,
      supervisor: supervisorName,
      course: snapshot.course,
      level: snapshot.level === "craft" ? "Certificate" : "Diploma",
      sections,
    };
    const stem = (project.title || "business-plan").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "business-plan";
    if (format === "pdf") {
      try {
        const pdf = await createBusinessPlanPdf(document);
        await adminClient.rpc("increment_project_download", { p_project_id: project.id });
        return new Response(pdf as unknown as BodyInit, {
          headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${stem}.pdf"`, "Cache-Control": "private, no-store" },
        });
      } catch (error) {
        console.error("Marketplace business plan PDF export failed:", error);
        return NextResponse.json({ error: "PDF export is temporarily unavailable. Download the Word copy instead." }, { status: 503 });
      }
    }
    const docx = createBusinessPlanDocx(document);
    await adminClient.rpc("increment_project_download", { p_project_id: project.id });
    const filename = `${stem}.docx`;
    return new Response(docx as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const { data: signedData } = await adminClient.storage
    .from("project-files")
    .createSignedUrl(project.file_path, 3600, { download: true });

  if (signedData?.signedUrl) {
    await adminClient.rpc("increment_project_download", { p_project_id: project.id });
    return NextResponse.redirect(signedData.signedUrl);
  }

  // Fallback: If external URL or placeholder, return download manifest
  return NextResponse.json({
    message: "Authorized project download ready.",
    projectId: project.id,
    title: project.title,
    filePath: project.file_path,
    downloadUrl: signedData?.signedUrl || null,
  });
}
