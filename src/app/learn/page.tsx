import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  PlayCircle,
  Search,
} from "lucide-react";
import type { UserProfile } from "@/types/database";

const resourceCards = [
  { title: "Business plans", description: "Explore ready examples and build your own plan.", href: "/projects?type=business_plan", icon: BriefcaseBusiness, tone: "bg-amber-50 text-amber-700", tag: "Plan" },
  { title: "Trade projects", description: "Find practical project ideas for your course.", href: "/projects?type=technical_project", icon: ClipboardCheck, tone: "bg-indigo-50 text-indigo-700", tag: "Practice" },
  { title: "Study notes", description: "Review organised notes for focused study.", href: "/projects?type=lecture_notes", icon: BookOpen, tone: "bg-sky-50 text-sky-700", tag: "Learn" },
  { title: "Revision papers", description: "Test your knowledge with past papers.", href: "/projects?type=past_paper", icon: FileText, tone: "bg-rose-50 text-rose-700", tag: "Revise" },
  { title: "Ebooks & guides", description: "Read useful references and study guides.", href: "/projects?type=study_resources", icon: Library, tone: "bg-emerald-50 text-emerald-700", tag: "Read" },
  { title: "Short courses", description: "Build practical skills in focused lessons.", href: "/projects?type=study_resources", icon: PlayCircle, tone: "bg-violet-50 text-violet-700", tag: "Grow" },
];

export default async function LearningHubPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/learn");

  const [{ data: profileData }, { data: workspaces }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("project_workspaces").select("id, title, status, updated_at").eq("student_id", user.id).order("updated_at", { ascending: false }).limit(3),
  ]);
  const profile = profileData as UserProfile | null;

  return (
    <AppShell user={user} profile={profile} activeContextTitle="Learning Hub">
      <PageHeaderCard title="Learning Hub" subtitle="Choose what you need next." breadcrumbs={[{ label: "Home", active: true }]} />

      <section className="overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-700 to-[#087f8c] p-5 text-white shadow-xs sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-indigo-100">Welcome back</p><h2 className="!text-white mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Keep your learning moving.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-indigo-50">Find resources, practise your skills, and make progress at your pace.</p></div>
          <Link href="/projects" className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-indigo-800 shadow-xs transition hover:bg-indigo-50"><Search className="h-4 w-4" /> Explore resources</Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3"><div><p className="bp-eyebrow">Browse by need</p><h2 className="bp-title mt-1 text-2xl">What are you working on?</h2></div><span className="hidden text-xs text-slate-500 sm:inline">Six ways to learn and grow</span></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {resourceCards.map(({ title, description, href, icon: Icon, tone, tag }) => <Link key={title} href={href} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span><span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{tag}</span></div><h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">Open collection <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center justify-between gap-3"><div><p className="bp-eyebrow">Keep going</p><h2 className="bp-title mt-1 text-xl">Your active work</h2></div><Link href="/studio" className="text-xs font-semibold text-indigo-700 hover:text-indigo-900">Open Studio</Link></div>{workspaces?.length ? <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">{workspaces.map((workspace) => <Link key={workspace.id} href={`/studio/${workspace.id}`} className="flex items-center justify-between gap-3 px-3 py-3 transition hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{workspace.title || "Untitled project"}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{workspace.status?.replaceAll("_", " ") || "Draft"}</p></div><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" /></Link>)}</div> : <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><GraduationCap className="mx-auto h-7 w-7 text-indigo-500" /><p className="mt-2 text-sm font-semibold text-slate-900">Start your first project</p><p className="mt-1 text-xs text-slate-600">Choose a project idea and build it step by step.</p><Link href="/studio" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">Open Project Studio <ArrowRight className="h-3.5 w-3.5" /></Link></div>}</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><span className="inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-700"><GraduationCap className="h-5 w-5" /></span><h2 className="bp-title mt-4 text-xl">Need direction?</h2><p className="mt-1 text-sm leading-5 text-slate-600">Start with a resource, then move into guided practice.</p><Link href="/projects" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">View all resources <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </section>
    </AppShell>
  );
}
