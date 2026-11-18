"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unlockStudioWithClassCode } from "./actions";
import { KeyRound, ShoppingBag, Library, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export function StudioAccessGate() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("classCode", classCode.trim());
      const res = await unlockStudioWithClassCode(formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not verify Class Access Code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-6 sm:py-10">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Two-Tone KEC Accent Stripe */}
        <div className="flex h-1.5 w-full">
          <div className="h-full w-3/5 bg-indigo-600" />
          <div className="h-full w-2/5 bg-amber-400" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-block rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Instructor-Guided Class Workspace
              </span>
              <h1 className="mt-1.5 text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                Class Studio Access Required
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Project Studio is reserved for enrolled class students under instructor supervision. Looking for a completed, ready-to-download TVET &amp; KMTC project? Visit the Marketplace.
              </p>
            </div>
          </div>

          {/* Option 1: External Buyers -> Marketplace & Library */}
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-900">
                Need a Ready-Made TVET &amp; KMTC Project?
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Download complete, personalized TVET Colleges and KMTC business plans and projects immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#087f8c] hover:bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Marketplace</span>
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <Library className="h-3.5 w-3.5" />
                <span>My Library</span>
              </Link>
            </div>
          </div>

          {/* Option 2: Taught Students -> Enter Class Code */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5 space-y-3">
            <label htmlFor="studio-class-code" className="block text-xs font-semibold text-slate-800">
              Enrolled in the Trainer&apos;s Class? Enter Your Class Access Code
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="studio-class-code"
                type="text"
                required
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Enter Class Access Code from your trainer"
                className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-xs sm:text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>{loading ? "Verifying..." : "Unlock Studio"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
             Supervised Class Access Control
          </span>
          <span>Ask your trainer for the class code or approval</span>
        </div>
      </div>
    </div>
  );
}
