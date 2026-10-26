import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createModule,
  createLesson,
  createProject,
  deleteModule,
  deleteProject,
  bulkImportProjects,
  bulkImportModules,
} from "./actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { ContentCard } from "@/components/layout/ContentCard";
import {
  Layers,
  BookOpen,
  PlusCircle,
  Trash2,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import type { Module, Lesson, Project } from "@/types/database";

export const instant = false;

export default async function TrainerPortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isTrainer = profile?.role === "trainer";
  const isAdmin = profile?.role === "admin";

  if (!isTrainer && !isAdmin) {
    redirect("/learn");
  }

  // Fetch the trainer's existing modules (with lessons) and projects
  const [{ data: modulesData }, { data: projectsData }] = await Promise.all([
    supabase
      .from("modules")
      .select("*, lessons(*)")
      .eq("trainer_id", user.id)
      .order("position", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const modules: Module[] = (modulesData as unknown as Module[]) || [];
  const projects: Project[] = (projectsData as unknown as Project[]) || [];

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Trainer & Content Studio"
    >
      {/* 1. KEC-Standard Page Header Card */}
      <PageHeaderCard
        title="Trainer Authoring & Content Studio"
        subtitle="Author and publish accredited technical projects, business plans, and curriculum revision modules with video lessons for TVET candidates across East Africa."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Trainer Studio", active: true },
        ]}
        metadata={[
          {
            label: "Trainer",
            value: profile?.full_name || user.email?.split("@")[0] || "Faculty Trainer",
          },
          {
            label: "Authorization",
            value: isAdmin ? "System Administrator (Verified Trainer)" : "Accredited Trainer",
          },
          { label: "Published Projects", value: `${projects.length} Published` },
          { label: "Curriculum Modules", value: `${modules.length} Modules` },
        ]}
        actions={
          isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Admin Dashboard</span>
            </Link>
          ) : undefined
        }
      />

      {/* 2. Bulk Upload Hub Card */}
      <ContentCard
        title="Bulk Upload Hub"
        subtitle="Batch import multiple projects or entire course curricula in seconds using CSV or JSON"
        icon={UploadCloud}
        headerRight={
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            Batch Processor
          </span>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bulk Projects Import */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk Import Projects (CSV or JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Import multiple ready-made projects at once. Upload a spreadsheet (.csv) or JSON array, or paste raw text below.
              </p>
            </div>

            <form action={bulkImportProjects} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Choose .csv or .json file
                </label>
                <input
                  name="file"
                  type="file"
                  accept=".csv,text/csv,.json,application/json"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Or paste CSV / JSON content
                </label>
                <textarea
                  name="rawText"
                  rows={4}
                  placeholder={`title,category,price_kes,description,file_path
"IoT Smart Irrigation System","Computer Science",2500,"Full source code and documentation","projects/irrigation.zip"
"Commercial Poultry Business Plan","Business",1800,"Complete 5-year financial model","projects/poultry.pdf"`}
                  className="w-full font-mono rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <details className="text-[11px] text-slate-600 cursor-pointer">
                <summary className="font-semibold text-blue-700 hover:underline">
                  View expected CSV headers
                </summary>
                <div className="mt-1 p-2 rounded bg-white border border-slate-200 font-mono text-[10px] space-y-1">
                  <p><strong>Required:</strong> title</p>
                  <p><strong>Optional:</strong> category, price_kes, description, file_path, preview_path</p>
                </div>
              </details>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import Projects Batch</span>
              </button>
            </form>
          </div>

          {/* Bulk Curriculum Import */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk Import Modules & Lessons (JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Import structured revision courses with modules and nested lessons in a single operation.
              </p>
            </div>

            <form action={bulkImportModules} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Choose .json file
                </label>
                <input
                  name="file"
                  type="file"
                  accept=".json,application/json"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Or paste JSON curriculum
                </label>
                <textarea
                  name="rawText"
                  rows={4}
                  placeholder={`[
  {
    "title": "Chapter 1: Cash Flow & Financials",
    "description": "Essential financial projections",
    "lessons": [
      { "title": "Income Statements", "body": "Overview of revenues...", "is_free": true },
      { "title": "Break-Even Analysis", "video_url": "https://youtu.be/sample", "is_free": false }
    ]
  }
]`}
                  className="w-full font-mono rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <details className="text-[11px] text-slate-600 cursor-pointer">
                <summary className="font-semibold text-blue-700 hover:underline">
                  View expected JSON structure
                </summary>
                <div className="mt-1 p-2 rounded bg-white border border-slate-200 font-mono text-[10px]">
                  <p>Array of objects with <code>title</code>, <code>description</code>, and a <code>lessons</code> array of objects with <code>title</code>, <code>body</code>, <code>video_url</code>, <code>is_free</code>.</p>
                </div>
              </details>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import Curriculum Batch</span>
              </button>
            </form>
          </div>
        </div>
      </ContentCard>

      {/* 3. Upload Ready-Made Project for Sale */}
      <ContentCard
        title="Publish Technical Project to Marketplace"
        subtitle="Students can purchase this project via Paystack and download the associated resources"
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
                placeholder="e.g. Computer Science, Agriculture, Business"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price in KES <span className="text-rose-600">*</span>
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
                Project Storage File Path <span className="text-rose-600">*</span>
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
              Description & Deliverables
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Include details on what the project contains: source code, schema, report documentation, presentation slides..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publish Project to Marketplace</span>
          </button>
        </form>

        {/* List of Trainer's Projects */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Your Published Projects ({projects.length})
          </h3>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500">You haven&apos;t published any projects yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {p.category || "General"}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {p.description || "No description provided."}
                    </p>
                    <p className="mt-2 font-mono font-bold text-sm text-blue-900">
                      KES {Number(p.price_kes).toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      File: {p.file_path}
                    </span>
                    <form action={deleteProject}>
                      <input type="hidden" name="projectId" value={p.id} />
                      <button
                        type="submit"
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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

      {/* 4. Curriculum Modules & Lesson Builder */}
      <ContentCard
        title="Curriculum Modules & Guided Lessons"
        subtitle="Structure revision courses into chapters and lessons visible to students in the Learn section"
        icon={BookOpen}
      >
        {/* Create Module Form */}
        <form
          action={createModule}
          className="p-4 rounded-lg bg-slate-50 border border-slate-200 max-w-3xl space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Create New Revision Module
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                name="title"
                type="text"
                required
                placeholder="Module Title (e.g. Chapter 1: Business Plan Financial Modeling)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <input
                name="position"
                type="number"
                defaultValue={modules.length + 1}
                placeholder="Order (e.g. 1)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div>
            <input
              name="description"
              type="text"
              placeholder="Short overview of what students will master in this module..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Module</span>
          </button>
        </form>

        {/* Modules List with Add-Lesson forms */}
        <div className="mt-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-900">
            Your Modules & Lessons ({modules.length})
          </h3>

          {modules.length === 0 ? (
            <p className="text-xs text-slate-500">
              No modules created yet. Use the form above to add your first module.
            </p>
          ) : (
            <div className="space-y-6">
              {modules.map((m: Module) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Position #{m.position}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                      {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
                    </div>
                    <form action={deleteModule}>
                      <input type="hidden" name="moduleId" value={m.id} />
                      <button
                        type="submit"
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Module</span>
                      </button>
                    </form>
                  </div>

                  {/* Lessons inside module */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-700">
                      Lessons ({m.lessons?.length || 0}):
                    </h5>
                    {!m.lessons || m.lessons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No lessons in this module yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                        {m.lessons.map((l: Lesson) => (
                          <div
                            key={l.id}
                            className="p-3 flex items-center justify-between text-xs hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                #{l.position} {l.title}
                              </span>
                              {l.is_free && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Free Preview
                                </span>
                              )}
                              {l.video_url && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Video Attached
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Lesson to this Module Form */}
                  <form
                    action={createLesson}
                    className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <input type="hidden" name="moduleId" value={m.id} />
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Add Lesson to &quot;{m.title}&quot;
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <input
                          name="title"
                          type="text"
                          required
                          placeholder="Lesson Title (e.g. Setting up the NPV Cash Flow)"
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <input
                          name="position"
                          type="number"
                          defaultValue={(m.lessons?.length || 0) + 1}
                          placeholder="Position"
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        name="videoUrl"
                        type="url"
                        placeholder="Optional Video URL (YouTube or Vimeo)"
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-700 px-1">
                        <input type="checkbox" name="isFree" value="true" className="rounded" />
                        <span>Make this lesson free for preview</span>
                      </label>
                    </div>
                    <textarea
                      name="body"
                      rows={2}
                      placeholder="Lesson notes, Markdown content, or instructions..."
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add Lesson</span>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>
    </AppShell>
  );
}
