import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
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
import {
  Briefcase,
  Layers,
  BookOpen,
  PlusCircle,
  Trash2,
  ArrowLeft,
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            {isAdmin && (
              <>
                <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </>
            )}
            <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="font-bold text-base tracking-tight">Trainer Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {isAdmin ? "Admin (Super-Trainer)" : "Verified Trainer"}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create & Publish Learning Content
            </h1>
            <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
              Upload ready-made project packages for students to purchase, or structure step-by-step revision modules and video lessons.
            </p>
            {isAdmin && (
              <p className="mt-3 text-xs bg-indigo-800/60 border border-indigo-700 rounded-lg px-3 py-1.5 inline-block text-emerald-300 font-medium">
                Admin privilege enabled: Content you add is automatically verified and published immediately.
              </p>
            )}
          </div>
        </div>

        {/* Bulk Upload Hub */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <UploadCloud className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Bulk Upload Hub
                </h2>
                <p className="text-xs text-zinc-500">
                  Batch import multiple projects or entire course curricula in seconds using CSV or JSON.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 w-fit">
              Time Saver
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Bulk Projects Import */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Bulk Import Projects (CSV or JSON)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Import dozens of projects at once. Upload a spreadsheet export (.csv) or JSON array, or paste directly below.
                </p>

                <form action={bulkImportProjects} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Choose .csv or .json file
                    </label>
                    <input
                      name="file"
                      type="file"
                      accept=".csv,text/csv,.json,application/json"
                      className="w-full text-xs text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900 hover:file:opacity-90 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Or paste CSV / JSON content
                    </label>
                    <textarea
                      name="rawText"
                      rows={4}
                      placeholder={`title,category,price_kes,description,file_path
"IoT Smart Irrigation System","Computer Science",2500,"Full source code and documentation","projects/irrigation.zip"
"Commercial Poultry Business Plan","Business",1800,"Complete 5-year financial model","projects/poultry.pdf"`}
                      className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <details className="text-[11px] text-zinc-500 cursor-pointer">
                    <summary className="font-medium text-purple-600 dark:text-purple-400 hover:underline">
                      View expected CSV headers
                    </summary>
                    <div className="mt-1 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] space-y-1">
                      <p><strong>Required:</strong> title</p>
                      <p><strong>Optional:</strong> category, price_kes, description, file_path, preview_path</p>
                    </div>
                  </details>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Import Projects Batch
                  </button>
                </form>
              </div>
            </div>

            {/* 2. Bulk Curriculum Import */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Bulk Import Modules & Lessons (JSON)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Import structured revision courses with modules and multiple nested lessons in a single click.
                </p>

                <form action={bulkImportModules} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Choose .json file
                    </label>
                    <input
                      name="file"
                      type="file"
                      accept=".json,application/json"
                      className="w-full text-xs text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900 hover:file:opacity-90 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
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
                      className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <details className="text-[11px] text-zinc-500 cursor-pointer">
                    <summary className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      View expected JSON structure
                    </summary>
                    <div className="mt-1 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px]">
                      <p>Array of objects with <code>title</code>, <code>description</code>, and a <code>lessons</code> array of objects with <code>title</code>, <code>body</code>, <code>video_url</code>, <code>is_free</code>.</p>
                    </div>
                  </details>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Import Curriculum Batch
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Upload a Ready-Made Project (Single) */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Upload Ready-Made Project for Sale
              </h2>
              <p className="text-xs text-zinc-500">
                Students can purchase this project via Paystack and download the associated resources.
              </p>
            </div>
          </div>

          <form action={createProject} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Project Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Automated Poultry Farming IoT System"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Category
                </label>
                <input
                  name="category"
                  type="text"
                  placeholder="e.g. Computer Science, Agriculture, Business"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Price in KES *
                </label>
                <input
                  name="priceKes"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Project File / Storage Path *
                </label>
                <input
                  name="filePath"
                  type="text"
                  required
                  defaultValue="projects/source-code-and-doc.zip"
                  placeholder="e.g. projects/source-code.zip"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Description & Deliverables
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Include details on what the project contains: source code, schema, report documentation, presentation slides..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Publish Project to Marketplace
            </button>
          </form>

          {/* List of Trainer's Projects */}
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Your Published & Submitted Projects ({projects.length})
            </h3>
            {projects.length === 0 ? (
              <p className="text-xs text-zinc-500">You haven&apos;t uploaded any projects yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase text-zinc-500">
                          {p.category || "General"}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            p.status === "published"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{p.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {p.description || "No description provided."}
                      </p>
                      <p className="mt-3 font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        KES {Number(p.price_kes).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        File: {p.file_path}
                      </span>
                      <form action={deleteProject}>
                        <input type="hidden" name="projectId" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Create Learning Modules & Lessons */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Revision Modules & Guided Lessons
              </h2>
              <p className="text-xs text-zinc-500">
                Structure revision courses into chapters and lessons visible to students in the Learn section.
              </p>
            </div>
          </div>

          {/* Create Module Form */}
          <form action={createModule} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 max-w-3xl space-y-3">
            <h3 className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">
              Create New Revision Module
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Module Title (e.g. Chapter 1: Business Plan Financial Modeling)"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
              <div>
                <input
                  name="position"
                  type="number"
                  defaultValue={modules.length + 1}
                  placeholder="Order (e.g. 1)"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
            </div>
            <div>
              <input
                name="description"
                type="text"
                placeholder="Short overview of what students will master in this module..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Create Module
            </button>
          </form>

          {/* Modules List with Add-Lesson forms */}
          <div className="mt-8 space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Your Modules & Lessons ({modules.length})
            </h3>

            {modules.length === 0 ? (
              <p className="text-xs text-zinc-500">No modules created yet. Use the form above to add your first module.</p>
            ) : (
              <div className="space-y-6">
                {modules.map((m: Module) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-zinc-400">Position #{m.position}</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{m.title}</h4>
                        {m.description && <p className="text-xs text-zinc-500">{m.description}</p>}
                      </div>
                      <form action={deleteModule}>
                        <input type="hidden" name="moduleId" value={m.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Module
                        </button>
                      </form>
                    </div>

                    {/* Lessons inside module */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Lessons ({m.lessons?.length || 0}):
                      </h5>
                      {(!m.lessons || m.lessons.length === 0) ? (
                        <p className="text-xs text-zinc-400 italic">No lessons in this module yet.</p>
                      ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                          {m.lessons.map((l: Lesson) => (
                            <div key={l.id} className="p-3 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                  #{l.position} {l.title}
                                </span>
                                {l.is_free && (
                                  <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                                {l.video_url && (
                                  <span className="ml-2 text-[10px] text-zinc-400">Video Attached</span>
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
                      className="mt-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
                    >
                      <input type="hidden" name="moduleId" value={m.id} />
                      <h5 className="text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400">
                        Add Lesson to &quot;{m.title}&quot;
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-3">
                          <input
                            name="title"
                            type="text"
                            required
                            placeholder="Lesson Title (e.g. Setting up the NPV Cash Flow)"
                            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <input
                            name="position"
                            type="number"
                            defaultValue={(m.lessons?.length || 0) + 1}
                            placeholder="Position"
                            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          name="videoUrl"
                          type="url"
                          placeholder="Optional Video URL (YouTube or Vimeo)"
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                        />
                        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 px-1">
                          <input type="checkbox" name="isFree" value="true" className="rounded" />
                          <span>Make this lesson free for preview</span>
                        </label>
                      </div>
                      <textarea
                        name="body"
                        rows={2}
                        placeholder="Lesson notes, Markdown content, or instructions..."
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-medium cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Lesson
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
