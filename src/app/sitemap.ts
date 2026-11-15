import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const adminClient = createAdminClient();
    const { data: publishedProjects } = await adminClient
      .from("projects")
      .select("id, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    const projectRoutes: MetadataRoute.Sitemap = (publishedProjects || []).map((project) => ({
      url: `${SITE_URL}/projects/${project.id}`,
      lastModified: project.created_at ? new Date(project.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
