import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const { data: signedData } = await adminClient.storage
    .from("project-files")
    .createSignedUrl(project.file_path, 3600, { download: true });

  if (signedData?.signedUrl) {
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
