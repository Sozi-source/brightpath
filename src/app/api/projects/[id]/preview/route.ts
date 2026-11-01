import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: project } = await supabase.from("projects")
    .select("preview_path, status, trainer_id").eq("id", id).maybeSingle();
  if (!project?.preview_path || project.preview_path.startsWith("workspace-export:")) {
    return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
  }
  if (project.status !== "published") {
    if (!user) return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (project.trainer_id !== user.id && profile?.role !== "admin") return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
  }

  const { data, error } = await createAdminClient().storage.from("project-files")
    .createSignedUrl(project.preview_path, 900, { download: false });
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
}
