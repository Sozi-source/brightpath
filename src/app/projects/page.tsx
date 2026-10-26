import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { Layers, Briefcase, Download, ShieldCheck } from "lucide-react";
import type { Project, UserProfile } from "@/types/database";
import { BuyButton } from "@/components/BuyButton";

export const instant = false;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = p as UserProfile | null;
  }

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, profiles:trainer_id(full_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

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
        subtitle="Verified technical capstone packages"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects Marketplace", active: true },
        ]}
        metadata={[
          { label: "Available", value: `${projects.length} Projects` },
          { label: "Delivery", value: "Instant Paystack / M-PESA" },
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
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {p.category || "General Project"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  By <strong className="text-slate-700">{p.profiles?.full_name || "Verified Faculty"}</strong>
                </p>
                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {p.description || "Complete project implementation files and comprehensive documentation."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">Price</span>
                  <span className="font-mono font-semibold text-base sm:text-lg text-slate-900">
                    KES {Number(p.price_kes).toLocaleString()}
                  </span>
                </div>
                <BuyButton projectId={p.id} priceKes={p.price_kes} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
