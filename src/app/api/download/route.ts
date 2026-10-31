import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBusinessPlanDocx } from "@/lib/studio/businessPlanDocx";
import { createBusinessPlanPdf } from "@/lib/studio/businessPlanPdf";
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

  // Check admin privileges
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
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
    const sections = snapshot.sections as { title: string; content: string }[];
    const document = {
      title: snapshot.title || project.title,
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
