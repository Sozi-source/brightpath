import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects")
    .select("cover_path").eq("id", id).eq("status", "published").maybeSingle();
  if (!project?.cover_path) return NextResponse.json({ error: "Cover image unavailable." }, { status: 404 });

  const { data, error } = await createAdminClient().storage.from("project-files")
    .createSignedUrl(project.cover_path, 900, { download: false });
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Cover image unavailable." }, { status: 404 });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
}
