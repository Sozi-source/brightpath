import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookOpen, Download, Eye, FileText, Star, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BuyButton } from "@/components/BuyButton";
import { AmazonPrice } from "@/components/ui/AmazonPrice";
import { createClient } from "@/lib/supabase/server";
import { getMaterialTypeLabel, getExactBusinessTitle } from "@/lib/marketplace";
import { getCanvasPalette } from "@/lib/canvasTheme";
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
  const isAdmin = profile?.role === "admin";

  const { data: product } = await supabase.from("projects")
    .select("*, profiles:trainer_id(full_name)").eq("id", id).maybeSingle();
  if (!product) notFound();
  const isOwner = product.trainer_id === user?.id;
  if (product.status !== "published" && !isAdmin && !isOwner) {
    notFound();
  }

  const [{ data: rating }, { data: reviews }, { data: relatedProducts }] = await Promise.all([
    supabase.from("marketplace_project_rating_stats").select("rating_average, review_count").eq("project_id", id).maybeSingle(),
    supabase.from("marketplace_project_public_reviews").select("rating, comment, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("projects").select("id, title, price_kes, category, material_type").neq("id", id).eq("status", "published").limit(3),
  ]);
  const { data: paidOrder } = user && !isOwner && !isAdmin
    ? await supabase.from("orders").select("id").eq("student_id", user.id).eq("project_id", id).eq("status", "paid").maybeSingle()
    : { data: null };
  const canDownload = isOwner || isAdmin || Boolean(paidOrder);
  const average = Number(rating?.rating_average || 0);
  const reviewCount = Number(rating?.review_count || 0);
  const publisher = product.profiles as unknown as { full_name?: string | null } | null;
  const publisherName = product.material_type === "business_plan"
    ? "TVET Hub Academic Repository"
    : (publisher?.full_name || "TVET Hub Publisher");
  const isBusinessPlan =
    product.material_type === "business_plan" ||
    (product.category || "").toLowerCase().includes("business") ||
    product.file_path.startsWith("workspace-export:");
  const levelMatch = product.title.match(/\((Diploma|Craft Certificate|Certificate|Higher Diploma)\)/i);
  const levelLabel = levelMatch
    ? levelMatch[1]
    : product.title.toLowerCase().includes("craft") || product.title.toLowerCase().includes("certificate")
    ? "Craft Certificate"
    : "Diploma";
  const exactTitle = getExactBusinessTitle(product.title);

  const extension = product.file_path.startsWith("workspace-export:")
    ? "PDF + Word"
    : product.file_path.split(".").pop()?.toUpperCase() || "Digital file";

  return (
    <AppShell user={user} profile={profile} activeContextTitle="Learning Resource Marketplace">
      {/* Sleek Minimal Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 mb-1">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <Link href="/projects" className="hover:text-slate-900 transition-colors">Marketplace</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-md">{exactTitle}</span>
        </nav>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All materials</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="h-1 bg-gradient-to-r from-[#087f8c] via-teal-500 to-amber-400" />
            <div className="grid gap-5 p-5 md:grid-cols-[210px_1fr]">
              {/* Left Column: Aspect [3/4] Cover + Material Dossier Box to fill gap */}
              <div className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-teal-500/30 bg-gradient-to-br from-[#0c8ea0] via-[#087f8c] to-[#045963] shrink-0">
                  {product.cover_path ? (
                    <Image src={`/api/projects/${product.id}/cover`} alt={`${product.title} cover`} fill unoptimized sizes="210px" className="object-cover" />
                  ) : isBusinessPlan ? (
                    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0c8ea0] via-[#087f8c] to-[#045963] p-4 text-white flex flex-col justify-between select-none shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/30 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
                      <div className="absolute inset-2 rounded border border-white/25 pointer-events-none" />

                      <div className="relative z-10 text-center pt-1">
                        <span className="inline-block text-[9.5px] font-bold tracking-[0.24em] uppercase !text-amber-300 drop-shadow-xs border-b border-amber-300/40 pb-0.5">
                          BUSINESS PLAN
                        </span>
                      </div>

                      <div className="relative z-10 my-auto text-center px-2 py-1">
                        <p className="text-[13.5px] sm:text-[14px] font-bold tracking-tight !text-white line-clamp-3 leading-snug drop-shadow-sm">
                          {exactTitle}
                        </p>
                        {levelLabel && (
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[8.5px] font-semibold tracking-wider uppercase !text-white border border-white/30 shadow-2xs">
                            {levelLabel}
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex items-center justify-between text-[8px] font-mono !text-teal-100 px-1 border-t border-white/20 pt-1 font-semibold">
                        <span className="tracking-wider uppercase">KNEC Series</span>
                        <span className="tracking-widest uppercase">Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0284c7] via-[#087f8c] to-[#0f766e] p-4 text-white flex flex-col justify-between select-none shadow-inner">
                      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
                      <div className="absolute inset-2 rounded border border-white/25 pointer-events-none" />
                      <div className="relative z-10 text-center pt-1">
                        <span className="inline-block text-[9.5px] font-bold tracking-[0.22em] uppercase !text-amber-300 drop-shadow-xs border-b border-amber-300/40 pb-0.5">
                          {getMaterialTypeLabel(product.material_type).toUpperCase()}
                        </span>
                      </div>
                      <div className="relative z-10 my-auto text-center px-2 py-1">
                        <p className="text-[13.5px] font-bold tracking-tight !text-white line-clamp-3 leading-snug drop-shadow-sm">
                          {exactTitle}
                        </p>
                      </div>
                      <div className="relative z-10 flex items-center justify-between text-[8px] font-mono !text-teal-100 px-1 border-t border-white/20 pt-1 font-semibold">
                        <span className="tracking-wider uppercase">Learning Resource</span>
                        <span className="tracking-widest uppercase">PDF</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gap Filler: Clean Material Dossier Specifications */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-2 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5">
                    <span className="uppercase tracking-wider text-[10px] text-slate-500 font-bold">Material Dossier</span>
                    <span className="font-mono text-[10px] text-[#087f8c] font-bold">Verified</span>
                  </div>

                  <dl className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-start gap-1">
                      <dt className="text-slate-500">Resource:</dt>
                      <dd className="font-semibold text-slate-800 text-right">{getMaterialTypeLabel(product.material_type)}</dd>
                    </div>
                    <div className="flex justify-between items-start gap-1">
                      <dt className="text-slate-500">Format:</dt>
                      <dd className="font-semibold text-slate-800 text-right">{extension}</dd>
                    </div>
                    <div className="flex justify-between items-start gap-1">
                      <dt className="text-slate-500">Access:</dt>
                      <dd className="font-semibold text-slate-800 text-right">Lifetime Access</dd>
                    </div>
                    <div className="flex justify-between items-start gap-1">
                      <dt className="text-slate-500">Delivery:</dt>
                      <dd className="font-semibold text-slate-800 text-right">Instant Download</dd>
                    </div>
                  </dl>

                  <div className="pt-2 border-t border-slate-200/80 text-[10.5px] text-slate-500 flex items-center justify-between">
                    <span>Category:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[125px]">{product.category || "General"}</span>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col font-sans">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#007185]">{getMaterialTypeLabel(product.material_type)}</span>
                  {product.category && <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-[#565959]">{product.category}</span>}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007600] ml-auto">
                    <CheckCircle2 className="h-3 w-3" /> In Stock · Instant Download
                  </span>
                </div>
                <h1 className="mt-3 text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-[#0f1111]">{exactTitle}</h1>
                <p className="mt-1.5 text-xs text-[#565959]">By <span className="text-[#007185] hover:underline cursor-pointer font-medium">{publisherName}</span></p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#565959]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0f1111]"><Star className="h-4 w-4 fill-[#ffa41c] text-[#de7921]" />{reviewCount ? average.toFixed(1) : "New"}{reviewCount > 0 && <span className="font-normal text-[#007185] hover:underline">({reviewCount} customer reviews)</span>}</span>
                  <span className="inline-flex items-center gap-1 text-[#565959]"><Download className="h-3.5 w-3.5 text-slate-400" />{Number(product.download_count || 0).toLocaleString()} downloads</span>
                  <span className="inline-flex items-center gap-1 text-[#565959]"><FileText className="h-3.5 w-3.5 text-slate-400" />{extension}</span>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#565959]">Brief description</h2>
                  <div className="mt-2 whitespace-pre-line text-sm leading-6 text-[#0f1111]">{product.description || "A verified digital resource for TVET learners."}</div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-[#565959]">Price</span>
                    <AmazonPrice amount={product.price_kes} size="xl" />
                  </div>
                  {canDownload ? <div className="flex flex-wrap gap-2">
                    {product.file_path.startsWith("workspace-export:") ? <><a href={`/api/download?projectId=${product.id}&format=pdf`} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"><Download className="h-4 w-4" /> Download PDF</a><a href={`/api/download?projectId=${product.id}&format=docx`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"><Download className="h-4 w-4" /> Download Word</a></> : <a href={`/api/download?projectId=${product.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"><Download className="h-4 w-4" /> Download</a>}
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

        <aside className="space-y-4 xl:sticky xl:top-20 h-fit">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><BookOpen className="h-4 w-4" /></span>
              <h2 className="text-sm font-semibold text-slate-900">What’s included</h2>
            </div>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Resource</dt><dd className="text-right font-medium text-slate-900">{getMaterialTypeLabel(product.material_type)}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Subject</dt><dd className="text-right font-medium text-slate-900">{product.category || "General"}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Format</dt><dd className="text-right font-medium text-slate-900">{extension}</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-slate-600">Access</dt><dd className="text-right font-medium text-slate-900">Lifetime download</dd></div>
            </dl>
            <Link href="/projects" className="mt-4 inline-flex text-xs font-semibold text-indigo-700 hover:text-indigo-900">← Continue browsing</Link>
          </div>

          {relatedProducts && relatedProducts.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-teal-50 p-2 text-[#087f8c]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Related Materials</h2>
                    <p className="text-[11px] text-slate-500">From the marketplace</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400">TVET Hub</span>
              </div>

              <div className="divide-y divide-slate-100">
                {relatedProducts.map((item) => {
                  const relTitle = getExactBusinessTitle(item.title);
                  const palette = getCanvasPalette(item.id || item.title);
                  return (
                    <Link
                      key={item.id}
                      href={`/projects/${item.id}`}
                      className="w-full text-left py-2.5 group flex items-start gap-2.5 transition-colors hover:bg-slate-50/70 -mx-1 px-1 rounded-md block"
                    >
                      <div
                        className={`h-8 w-8 rounded shrink-0 flex items-center justify-center text-white text-[10px] font-mono font-bold bg-gradient-to-br ${palette.bgGradient}`}
                      >
                        TH
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#087f8c] line-clamp-1 transition-colors">
                          {relTitle}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          KES {Number(item.price_kes).toLocaleString()} · {getMaterialTypeLabel(item.material_type)}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
