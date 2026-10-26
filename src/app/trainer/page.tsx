import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createProject,
  deleteProject,
  bulkImportProjects,
} from "./actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  Layers,
  PlusCircle,
  Trash2,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
} from "lucide-react";
import type { Project, UserProfile } from "@/types/database";

export const instant = false;

export default async function TrainerPortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile | null;
  const isTrainer = profile?.role === "trainer";
  const isAdmin = profile?.role === "admin";

  if (!isTrainer && !isAdmin) {
    redirect("/studio");
  }

  // Fetch the trainer's published projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  const projects: Project[] = (projectsData as unknown as Project[]) || [];

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Trainer Project Publisher"
    >
      {/* 1. KEC-Standard Page Header Card */}
      <PageHeaderCard
        title="Trainer Project Marketplace Publisher"
        subtitle="Effortlessly publish and sell verified technical capstone packages, source code repositories, and complete business plans to TVET candidates across East Africa."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Trainer Publisher Hub", active: true },
        ]}
        metadata={[
          {
            label: "Faculty Trainer",
            value: profile?.full_name || user.email?.split("@")[0] || "Faculty Trainer",
          },
          {
            label: "Authorization",
            value: isAdmin ? "System Administrator (Verified Trainer)" : "Accredited Faculty Trainer",
          },
          { label: "Published Packages", value: `${projects.length} Ready-Made Projects` },
          { label: "Payment Channel", value: "Automated Paystack / M-PESA" },
        ]}
        actions={
          isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Admin Governance</span>
            </Link>
          ) : undefined
        }
      />

      {/* 2. Bulk Upload Hub Card (Zero-Labor Batch Publishing) */}
      <ContentCard
        title="Fast Bulk Upload Hub (CSV or JSON)"
        subtitle="Batch publish dozens of projects in seconds. Upload a spreadsheet (.csv) or JSON array, or paste raw text below."
        icon={UploadCloud}
        headerRight={
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Zero Friction
          </span>
        }
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Bulk Import Projects Spreadsheet or JSON
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Publish multiple ready-made projects at once. Choose a spreadsheet file (.csv) or paste tabular data directly.
          </p>

          <form action={bulkImportProjects} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Choose .csv or .json file
              </label>
              <input
                name="file"
                type="file"
                accept=".csv,text/csv,.json,application/json"
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Or paste CSV / JSON content directly
              </label>
              <textarea
                name="rawText"
                rows={4}
                placeholder={`title,category,price_kes,description,file_path
"IoT Smart Irrigation System","Computer Science",2500,"Full source code, circuit schematic, and 4-chapter report","projects/irrigation.zip"
"Commercial Poultry Production Business Plan","Business",1800,"Complete 5-year financial model with cash flow projections","projects/poultry.pdf"`}
                className="w-full font-mono rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <details className="text-[11px] text-slate-600 cursor-pointer">
              <summary className="font-bold text-blue-700 hover:underline">
                View expected CSV columns format
              </summary>
              <div className="mt-1 p-2 rounded bg-white border border-slate-200 font-mono text-[10px] space-y-1">
                <p><strong>Required:</strong> title</p>
                <p><strong>Optional:</strong> category, price_kes, description, file_path, preview_path</p>
              </div>
            </details>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Import Projects Batch Now</span>
            </button>
          </form>
        </div>
      </ContentCard>

      {/* 3. Publish Single Project for Sale */}
      <ContentCard
        title="Publish Single Project Package for Sale"
        subtitle="Add a single ready-made technical capstone or business plan with automated Paystack payment"
        icon={Layers}
      >
        <form action={createProject} className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Title <span className="text-rose-600">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. Automated Poultry Farming IoT System"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <input
                name="category"
                type="text"
                placeholder="e.g. Computer Science, Agriculture, Business Plan"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price in KES <span className="text-rose-600">*</span>
              </label>
              <input
                name="priceKes"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="e.g. 1500"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Storage File Path / Key <span className="text-rose-600">*</span>
              </label>
              <input
                name="filePath"
                type="text"
                required
                defaultValue="projects/source-code-and-doc.zip"
                placeholder="e.g. projects/source-code.zip"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Deliverables Included
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="What does this project contain: full source code, circuit schematic, complete 4-chapter report documentation, financial model..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publish Project to Marketplace</span>
          </button>
        </form>

        {/* List of Trainer's Projects */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Your Published Projects Catalog ({projects.length})
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {projects.length} Published
            </span>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 italic">You haven&apos;t published any projects yet. Use the single or bulk upload form above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {p.category || "General"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        KES {Number(p.price_kes).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                      {p.title}
                    </h4>
                    {p.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[11px]">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        p.status === "published"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.status}
                    </span>

                    <form action={deleteProject}>
                      <input type="hidden" name="projectId" value={p.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>
    </AppShell>
  );
}
