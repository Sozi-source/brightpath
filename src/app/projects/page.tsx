import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Layers } from "lucide-react";
import type { Project } from "@/types/database";
import { BuyButton } from "@/components/BuyButton";

export const instant = false;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, profiles:trainer_id(full_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const projects: Project[] = (projectsData as unknown as Project[]) || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <span className="font-bold text-base tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600" />
            Projects Marketplace
          </span>
          <Link
            href="/trainer"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
          >
            Sell Project
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ready-Made Projects</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Browse and download verified academic projects, source code packages, and business plans.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
            <Layers className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <h2 className="text-base font-bold">No projects published yet</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              As an administrator or trainer, you can upload and publish your first project package in the{" "}
              <Link href="/trainer" className="text-emerald-600 underline">
                Trainer Studio
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      {p.category || "Project"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    By {p.profiles?.full_name || "Verified Trainer"}
                  </p>
                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {p.description || "Complete project files and comprehensive documentation."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Price</span>
                    <span className="font-mono font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                      KES {Number(p.price_kes).toLocaleString()}
                    </span>
                  </div>
                  <BuyButton projectId={p.id} priceKes={p.price_kes} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
