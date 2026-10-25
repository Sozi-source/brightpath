import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Download, Layers, ShieldCheck } from "lucide-react";
import type { Order, Project } from "@/types/database";

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
            <BookOpen className="h-4 w-4 text-emerald-600" />
            My Digital Library
          </span>
          <Link
            href="/projects"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
          >
            Browse Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Purchased Projects & Resources</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Access, view documentation, and download source code packages for your active purchases.
          </p>
        </div>

        {purchasedOrders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
            <Layers className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <h2 className="text-base font-bold">Your library is currently empty</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t purchased any projects yet. Browse our marketplace to find ready-made systems and business plans.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
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
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        {project.category || "Project"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Purchased
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-1">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3">
                      {project.description || "Project package and documentation files."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Paid: KES {Number(order.amount_kes).toLocaleString()}
                    </span>
                    <a
                      href={`/api/download?projectId=${project.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Files
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
