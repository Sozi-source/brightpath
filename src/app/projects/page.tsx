import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { Layers, Briefcase, Download } from "lucide-react";
import type { Project, UserProfile } from "@/types/database";
import { MarketplaceProjectCard } from "./MarketplaceProjectCard";

export const instant = false;

export default async function ProjectsPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

  const [{ data: projectsData }, { data: ratingStats }] = await Promise.all([
    supabase.from("projects")
      .select("*, profiles:trainer_id(full_name)")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.from("marketplace_project_rating_stats")
      .select("project_id, rating_average, review_count"),
  ]);

  const projects: Project[] = (projectsData as unknown as Project[]) || [];

  const isTrainerOrAdmin = profile?.role === "trainer" || profile?.role === "admin";

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="TVET Projects Marketplace"
    >
      <PageHeaderCard
        title="Projects Marketplace"
        subtitle="Business plans and technical projects"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects Marketplace", active: true },
        ]}
        metadata={[
          { label: "Available", value: `${projects.length} Projects` },
          { label: "Format", value: "Digital downloads" },
        ]}
        actions={
          isTrainerOrAdmin ? (
            <Link
              href="/trainer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-indigo-900 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-indigo-600" />
              <span>Publisher</span>
            </Link>
          ) : (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              <span>My Library</span>
            </Link>
          )
        }
      />

      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
          <Layers className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-semibold text-slate-900">No projects available yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Published capstones and business plans will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = ratingStats?.find((row) => row.project_id === project.id);
            return <MarketplaceProjectCard
              key={project.id}
              project={project}
              viewerId={user?.id}
              rating={stats ? { rating_average: Number(stats.rating_average), review_count: Number(stats.review_count) } : undefined}
            />;
          })}
        </div>
      )}
    </AppShell>
  );
}
