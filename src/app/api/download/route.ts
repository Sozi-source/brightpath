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
    const { data: snapshot } = await adminClient.from("project_plan_snapshots")
      .select("title, course, level, sections").eq("project_id", project.id).maybeSingle();
    if (!snapshot || !Array.isArray(snapshot.sections)) {
      return NextResponse.json({ error: "The published business plan is unavailable." }, { status: 404 });
    }
    const rawSections = snapshot.sections as { title: string; content: string }[];
    const buyerInstitution = profile?.institutions as { name?: string } | { name?: string }[] | null;
    const buyerInstitutionName = Array.isArray(buyerInstitution)
      ? buyerInstitution[0]?.name
      : buyerInstitution?.name;

    // Under Option A: Personalize the white-labeled marketplace document with buyer details upon download
    const candidateName = profile?.full_name || "Candidate";
    const admissionNumber = profile?.admission_number || "ADM/2026/001";
    const institutionName = buyerInstitutionName || "Kenya Education Cloud TVET Institute";
    const supervisorName = "Institutional Supervisor";

    const sections = stampMarketplaceBusinessPlan(rawSections, {
      candidateName,
      admissionNumber,
      institutionName,
      supervisorName,
      townOrMarket: "Regional Center",
      county: "Regional County",
    });

    const document = {
      title: snapshot.title || project.title,
      businessName: snapshot.title || project.title,
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
