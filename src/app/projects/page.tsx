import type { Metadata } from "next";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import type { Project, UserProfile } from "@/types/database";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import { ProjectsCatalogClient, type BrowseCategory, type RatingStat } from "./ProjectsCatalogClient";

type ProjectsPageProps = {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; page?: string; view?: string }>;
};

export async function generateMetadata({ searchParams }: ProjectsPageProps): Promise<Metadata> {
  const filters = await searchParams;
  const typeLabel = filters.type
    ? filters.type === "study_resources"
      ? "Study Resources"
      : getMaterialTypeLabel(filters.type)
    : "";
  const category = filters.category?.trim() || "";
  const q = filters.q?.trim() || "";

  const title = q
    ? `Search "${q}" — Learning Catalog`
    : typeLabel
    ? `${typeLabel} — Learning Catalog`
    : category
    ? `${category} — Learning Catalog`
    : "Learning Catalog — KNEC Business Plans, Notes & Past Papers";

  const description =
    "Browse verified Kenya TVET learning materials, KNEC 5-chapter business plans, lecture notes, and past papers with instant Word & PDF downloads.";

  return {
    title,
    description,
    alternates: { canonical: "/projects" },
    openGraph: {
      title,
      description,
      url: "/projects",
      type: "website",
    },
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await connection();
  const filters = await searchParams;
  const query = (filters.q || "").trim();
  const selectedCategory = filters.category || "";
  const selectedType = filters.type || "";
  const sort = filters.sort || "newest";
  const initialPage = Math.max(1, Number.parseInt(filters.page || "1", 10) || 1);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data as UserProfile | null;
  }

  const [{ data: projectsData }, { data: ratingStats }] = await Promise.all([
    supabase.from("projects").select("*, profiles:trainer_id(full_name)").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("marketplace_project_rating_stats").select("project_id, rating_average, review_count"),
  ]);
  const projects: Project[] = (projectsData as unknown as Project[]) || [];
  const ratingEntries: [string, RatingStat][] = (ratingStats || []).map((row) => [
    row.project_id,
    { rating_average: Number(row.rating_average), review_count: Number(row.review_count) },
  ]);

  const isPublisher = profile?.role === "admin";

  function filterHref(next: { q?: string; category?: string; type?: string; sort?: string; page?: string }) {
    const params = new URLSearchParams();
    const q = next.q ?? filters.q;
    const category = next.category ?? filters.category;
    const type = next.type ?? filters.type;
    const nextSort = next.sort ?? filters.sort;
    const page = next.page ?? "1";
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (nextSort) params.set("sort", nextSort);
    if (page !== "1") params.set("page", page);
    return `/projects${params.size ? `?${params.toString()}` : ""}`;
  }

  const browseCategories: BrowseCategory[] = [
    { value: "", label: "All materials", types: null },
    { value: "lecture_notes", label: "Lecture notes", types: ["lecture_notes"] },
    { value: "past_paper", label: "Past papers", types: ["past_paper"] },
    { value: "study_resources", label: "Study resources", types: ["study_guide", "reference_book", "other"] },
    { value: "business_plan", label: "Business plans", types: ["business_plan"] },
    { value: "technical_project", label: "Technical projects", types: ["technical_project"] },
    { value: "research_project", label: "Research projects", types: ["research_project"] },
  ].map((category) => ({
    ...category,
    count: projects.filter((project) => !category.types || category.types.includes(project.material_type || "")).length,
  }));

  const sidebarCategories = browseCategories.map((category) => ({
    label: category.label,
    href: filterHref({ type: category.value, category: "" }),
    count: category.count,
    active: selectedType === category.value,
  }));

  return (
    <AppShell user={user} profile={profile} activeContextTitle="Resource Store" marketplaceCategories={sidebarCategories}>
      <ProjectsCatalogClient
        projects={projects}
        ratingEntries={ratingEntries}
        browseCategories={browseCategories}
        viewerId={user?.id}
        isPublisher={isPublisher}
        initialQuery={query}
        initialCategory={selectedCategory}
        initialType={selectedType}
        initialSort={sort}
        initialPage={initialPage}
      />
    </AppShell>
  );
}
