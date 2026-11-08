import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookOpen, Download, Eye, FileText, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeaderCard } from "@/components/layout/PageHeaderCard";
import { BuyButton } from "@/components/BuyButton";
import { createClient } from "@/lib/supabase/server";
import { getMaterialTypeLabel } from "@/lib/marketplace";
import type { UserProfile } from "@/types/database";

type MarketplaceProductPageProps = { params: Promise<{ id: string }> };

export default async function MarketplaceProductPage({ params }: MarketplaceProductPageProps) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data as UserProfile | null;
  }

  const { data: product } = await supabase.from("projects")
    .select("*, profiles:trainer_id(full_name)").eq("id", id).eq("status", "published").maybeSingle();
  if (!product) notFound();

  const [{ data: rating }, { data: reviews }] = await Promise.all([
    supabase.from("marketplace_project_rating_stats").select("rating_average, review_count").eq("project_id", id).maybeSingle(),
    supabase.from("marketplace_project_public_reviews").select("rating, comment, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  const isOwner = product.trainer_id === user?.id;
  const isAdmin = profile?.role === "admin";
  const { data: paidOrder } = user && !isOwner && !isAdmin
    ? await supabase.from("orders").select("id").eq("student_id", user.id).eq("project_id", id).eq("status", "paid").maybeSingle()
    : { data: null };
  const canDownload = isOwner || isAdmin || Boolean(paidOrder);
  const average = Number(rating?.rating_average || 0);
  const reviewCount = Number(rating?.review_count || 0);
  const publisher = product.profiles as unknown as { full_name?: string | null } | null;
  const publisherName = product.material_type === "business_plan"
    ? "BrightPath Academic Repository"
    : (publisher?.full_name || "BrightPath Publisher");
  const extension = product.file_path.startsWith("workspace-export:")
    ? "PDF + Word"
    : product.file_path.split(".").pop()?.toUpperCase() || "Digital file";

  return (
    <AppShell user={user} profile={profile} activeContextTitle="Learning Resource Marketplace">
      <PageHeaderCard
        title="Material Details"
        subtitle={product.title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Marketplace", href: "/projects" }, { label: "Details", active: true }]}
        metadata={[
          { label: "Type", value: getMaterialTypeLabel(product.material_type) },
          { label: "Subject", value: product.category || "General" },
          { label: "Downloads", value: Number(product.download_count || 0).toLocaleString() },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-600 to-amber-400" />
            <div className="grid gap-5 p-5 md:grid-cols-[190px_1fr]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-amber-50">
                {product.cover_path ? <Image src={`/api/projects/${product.id}/cover`} alt={`${product.title} cover`} fill unoptimized sizes="190px" className="object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-blue-800"><BookOpen className="h-10 w-10" /><span className="text-xs font-semibold uppercase tracking-wider">{getMaterialTypeLabel(product.material_type)}</span></div>}
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-800">{getMaterialTypeLabel(product.material_type)}</span>
                  {product.category && <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{product.category}</span>}
                </div>
                <h1 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-slate-900">{product.title}</h1>
                <p className="mt-2 text-sm text-slate-600">By {publisherName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-900"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{reviewCount ? average.toFixed(1) : "New"}{reviewCount > 0 && <span className="font-normal text-slate-600">({reviewCount} reviews)</span>}</span>
                  <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{Number(product.download_count || 0).toLocaleString()} downloads</span>
                  <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{extension}</span>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">About this material</h2>
                  <div className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{product.description || "A digital resource for TVET learners."}</div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600">Price</span><span className="font-mono text-xl font-semibold tracking-tight text-indigo-700">KES {Number(product.price_kes).toLocaleString()}</span></div>
                  {canDownload ? <div className="flex flex-wrap gap-2">
                    {product.file_path.startsWith("workspace-export:") ? <><a href={`/api/download?projectId=${product.id}&format=pdf`} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"><Download className="h-4 w-4" /> PDF</a><a href={`/api/download?projectId=${product.id}&format=docx`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Word</a></> : <a href={`/api/download?projectId=${product.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"><Download className="h-4 w-4" /> Download</a>}
                  </div> : <BuyButton projectId={product.id} isOwner={isOwner} />}
                </div>
              </div>
            </div>
          </section>

          <section id="preview" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div className="flex items-center gap-2"><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><Eye className="h-4 w-4" /></span><div><h2 className="text-sm font-semibold text-slate-900">Sample preview</h2><p className="text-xs text-slate-600">Publisher supplied excerpt</p></div></div>{product.preview_path && <a href={`/api/projects/${product.id}/preview`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-700 hover:text-indigo-900">Open preview</a>}</div>
            {product.preview_path ? <iframe title={`${product.title} sample preview`} src={`/api/projects/${product.id}/preview#toolbar=0&navpanes=0`} className="h-[520px] w-full bg-slate-50" /> : <div className="flex min-h-44 flex-col items-center justify-center gap-2 bg-slate-50/50 px-5 text-center"><FileText className="h-7 w-7 text-slate-400" /><p className="text-xs text-slate-600">A sample preview isn’t available for this material.</p></div>}
          </section>

          <section id="reviews" className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Buyer reviews</h2><p className="text-xs text-slate-600">Verified purchases only</p></div><span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{reviewCount ? average.toFixed(1) : "—"}<span className="text-xs font-normal text-slate-600">({reviewCount})</span></span></div>
            {reviews?.length ? <div className="divide-y divide-slate-100">{reviews.map((review, index) => <article key={`${review.created_at}-${index}`} className="px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-900">Verified buyer</span><time className="text-[11px] text-slate-600">{new Date(review.created_at).toLocaleDateString()}</time></div><div className="mt-1 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, star) => <Star key={star} className={`h-3.5 w-3.5 ${star < review.rating ? "fill-amber-400 text-amber-500" : "text-slate-300"}`} />)}</div><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-700">{review.comment}</p></article>)}</div> : <p className="px-4 py-8 text-center text-xs text-slate-600">No written reviews yet.</p>}
          </section>
        </main>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-xs xl:sticky xl:top-20">
          <div className="mb-3 flex items-center gap-2"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><BookOpen className="h-4 w-4" /></span><h2 className="text-sm font-semibold text-slate-900">What’s included</h2></div>
          <dl className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Resource</dt><dd className="text-right font-medium text-slate-900">{getMaterialTypeLabel(product.material_type)}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Subject</dt><dd className="text-right font-medium text-slate-900">{product.category || "General"}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Format</dt><dd className="text-right font-medium text-slate-900">{extension}</dd></div>
            <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Access</dt><dd className="text-right font-medium text-slate-900">Lifetime download</dd></div>
          </dl>
          <Link href="/projects" className="mt-4 inline-flex text-xs font-semibold text-indigo-700 hover:text-indigo-900">← Continue browsing</Link>
        </aside>
      </div>
    </AppShell>
  );
}
