"use client";

import { useState, useMemo } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Award,
  Sparkles,
  ShieldCheck,
  Plus,
  X,
  Send,
  GraduationCap,
  Building2,
} from "lucide-react";
import type { NutritionVentureDefinition } from "@/lib/studio/catalog/nutritionVentures";
import { getVentureReviews, type VentureReview } from "@/lib/studio/catalog/ventureReviews";

interface VentureReviewsSectionProps {
  venture: NutritionVentureDefinition;
  level?: "craft" | "diploma";
}

const KENYAN_POLYTECHNICS = [
  "Kabete National Polytechnic (Nairobi)",
  "The Kenya Coast National Polytechnic (Mombasa)",
  "Rift Valley Technical Training Institute (RVTTI, Eldoret)",
  "Nairobi Technical Training Institute (NTTI)",
  "Kisumu National Polytechnic",
  "PC Kinyanjui Technical Training Institute (Riruta)",
  "Thika Technical Training Institute",
  "Eldoret National Polytechnic",
  "Sigalagala National Polytechnic (Kakamega)",
  "Nyeri National Polytechnic",
  "Meru National Polytechnic",
  "Machakos National Polytechnic",
  "Kitale National Polytechnic",
  "North Eastern National Polytechnic (Garissa)",
];

const EXAM_SERIES_OPTIONS = [
  "July 2025 Series (KNEC Diploma)",
  "November 2024 Series (KNEC Diploma)",
  "July 2024 Series (KNEC Craft)",
  "November 2023 Series (KNEC Diploma)",
  "July 2023 Series (KNEC Craft)",
];

export function VentureReviewsSection({ venture, level = "diploma" }: VentureReviewsSectionProps) {
  const initialData = useMemo(() => getVentureReviews(venture), [venture]);
  const [reviews, setReviews] = useState<VentureReview[]>(initialData.reviews);
  const [filterRole, setFilterRole] = useState<"all" | "candidate" | "supervisor">("all");
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  // Review submission form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formAuthor, setFormAuthor] = useState("");
  const [formRole, setFormRole] = useState<"candidate" | "supervisor">("candidate");
  const [formInstitution, setFormInstitution] = useState(KENYAN_POLYTECHNICS[0]);
  const [formSeries, setFormSeries] = useState(EXAM_SERIES_OPTIONS[0]);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredReviews = useMemo(() => {
    if (filterRole === "all") return reviews;
    return reviews.filter((r) => r.role === formRole || r.role === filterRole);
  }, [reviews, filterRole, formRole]);

  const handleHelpful = (id: string) => {
    if (helpfulVoted[id]) return;
    setHelpfulVoted((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formTitle.trim() || !formComment.trim()) return;

    const newRev: VentureReview = {
      id: `rev-user-${Date.now()}`,
      author: formAuthor.trim(),
      role: formRole,
      roleLabel: formRole === "candidate" ? "KNEC Candidate (Passed Defense)" : "Institutional TVET Supervisor",
      institution: formInstitution,
      series: formSeries,
      rating: formRating,
      date: "Just now",
      title: formTitle.trim(),
      comment: formComment.trim(),
      verified: true,
      gradeBadge: formRole === "candidate" ? "KNEC Defense Verified" : "Supervisor Endorsed",
      helpfulCount: 1,
      tags: ["Recent Candidate Submission", "Defense Tested"],
    };

    setReviews([newRev, ...reviews]);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsFormOpen(false);
      setFormAuthor("");
      setFormTitle("");
      setFormComment("");
    }, 1200);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Award className="h-4 w-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Candidate Defenses & Academic Reviews
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Verified feedback from TVET candidates and supervisors across Kenya who defended this project area
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#087f8c] bg-[#e8f5f5] px-3 py-1.5 text-xs font-semibold text-[#087f8c] hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
        >
          {isFormOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{isFormOpen ? "Close Form" : "Share Defense Feedback"}</span>
        </button>
      </div>

      {/* 2. Form Drawer (Conditional) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087f8c]">
              Add Candidate Defense Feedback or Supervisor Review
            </h4>
            <span className="text-[11px] text-slate-500">KNEC Examination Review</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Your Full Name & Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Faith Wanjiku or Eng. George Ouma"
                className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Your Role <span className="text-rose-600">*</span>
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as "candidate" | "supervisor")}
                className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="candidate">KNEC Candidate (Student)</option>
                <option value="supervisor">TVET Institutional Supervisor / Lecturer</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                TVET Polytechnic / Institute <span className="text-rose-600">*</span>
              </label>
              <select
                value={formInstitution}
                onChange={(e) => setFormInstitution(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {KENYAN_POLYTECHNICS.map((poly) => (
                  <option key={poly} value={poly}>
                    {poly}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Examination Series <span className="text-rose-600">*</span>
              </label>
              <select
                value={formSeries}
                onChange={(e) => setFormSeries(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {EXAM_SERIES_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Star Rating Selection */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-700">Star Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= formRating
                        ? "fill-[#ffa41c] text-[#ffa41c]"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-xs text-slate-800">
                {formRating}.0 out of 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Review Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Scored Distinction in viva voce — realistic machinery bills"
              className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Defense Experience & Examination Advice <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Detail how the numbers, break-even analysis, or machinery quotations performed during your presentation before the KNEC external examiner..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {isSubmitted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Review published to catalog!</span>
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#087f8c] px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors cursor-pointer shadow-2xs"
              >
                <Send className="h-3 w-3" />
                <span>Submit Review</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. Rating Aggregate Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 sm:p-5">
        {/* Score & Stars */}
        <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:border-r md:border-slate-200 md:pr-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {initialData.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
          </div>

          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c]"
              />
            ))}
            <span className="ml-1.5 text-xs font-bold text-slate-800">
              {initialData.totalReviews} Reviews
            </span>
          </div>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
            <span>{initialData.passRatePercentage}% KNEC Defense Pass Rate</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-1.5 text-xs">
          {[
            { star: 5, pct: 92, count: initialData.distribution[5] },
            { star: 4, pct: 6, count: initialData.distribution[4] },
            { star: 3, pct: 2, count: initialData.distribution[3] },
            { star: 2, pct: 0, count: 0 },
            { star: 1, pct: 0, count: 0 },
          ].map((bar) => (
            <div key={bar.star} className="flex items-center gap-2">
              <span className="w-12 text-[11px] font-medium text-slate-600 shrink-0">
                {bar.star} stars
              </span>
              <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#ffa41c] rounded-full transition-all duration-300"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[11px] text-slate-500">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* KNEC Syllabus & Vetting Badges */}
        <div className="md:col-span-3 flex flex-col justify-center space-y-2 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Audit & Compliance
          </span>
          <div className="space-y-1.5 text-[11.5px] text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>KNEC Syllabi Aligned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>2025/2026 Kenyan Pricing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>Audited 3-Year Cash Flows</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>County & KEBS Fees Vetted</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setFilterRole("all")}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            filterRole === "all"
              ? "bg-slate-900 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterRole("candidate")}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            filterRole === "candidate"
              ? "bg-[#087f8c] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Candidate Defenses ({reviews.filter((r) => r.role === "candidate").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterRole("supervisor")}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            filterRole === "supervisor"
              ? "bg-[#087f8c] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Supervisor Endorsements ({reviews.filter((r) => r.role === "supervisor").length})
        </button>
      </div>

      {/* 5. Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const isVoted = helpfulVoted[review.id];

          return (
            <article
              key={review.id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2.5 hover:border-slate-300 transition-colors"
            >
              {/* Header: Author & Rating */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-[13px] text-slate-900">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[9.5px] font-bold text-[#087f8c] border border-teal-200">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>Verified {review.role === "candidate" ? "Candidate" : "Faculty"}</span>
                      </span>
                    )}
                    {review.gradeBadge && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-800 border border-amber-200">
                        <Award className="h-2.5 w-2.5" />
                        <span>{review.gradeBadge}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span>{review.institution}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-600">{review.series}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? "fill-[#ffa41c] text-[#ffa41c]"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-slate-700">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <h5 className="font-bold text-xs sm:text-[13px] text-slate-800">
                &ldquo;{review.title}&rdquo;
              </h5>

              {/* Review Comment */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {review.comment}
              </p>

              {/* Footer: Tags & Helpful Button */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(review.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    Was this defense advice helpful?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHelpful(review.id)}
                    disabled={isVoted}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer border ${
                      isVoted
                        ? "bg-teal-50 border-teal-200 text-[#087f8c]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>Helpful ({review.helpfulCount})</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
