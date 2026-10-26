import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { Download, Layers, ShieldCheck } from "lucide-react";
import type { Order, Project, UserProfile } from "@/types/database";

export const instant = false;

interface PurchasedProjectOrder extends Order {
  projects?: Project | null;
}

export default async function LibraryPage() {
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

  // Fetch student's paid orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*, projects(*)")
    .eq("student_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  const purchasedOrders: PurchasedProjectOrder[] =
    (ordersData as unknown as PurchasedProjectOrder[]) || [];

  return (
    <AppShell
      user={user}
      profile={profile}
      activeContextTitle="Candidate Digital Library"
    >
      <PageHeaderCard
        title="Library"
        subtitle="Purchased digital assets"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Digital Library", active: true },
        ]}
        metadata={[
          { label: "Learner", value: profile?.full_name || user.email || "Candidate" },
          { label: "Purchases", value: `${purchasedOrders.length} Projects` },
        ]}
        actions={
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-indigo-900 border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Marketplace</span>
          </Link>
        }
      />

      {purchasedOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
          <Layers className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-semibold text-slate-900">No purchased projects yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Acquired projects will appear here for download.
          </p>
          <Link
            href="/projects"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            Explore Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedOrders.map((order) => {
            const project = order.projects;
            if (!project) return null;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      {project.category || "Project Package"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Paid & Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {project.description || "Complete project archive and technical documentation files."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Paid: <strong className="text-slate-800">KES {Number(order.amount_kes).toLocaleString()}</strong>
                  </span>
                  <a
                    href={`/api/download?projectId=${project.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Package</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
