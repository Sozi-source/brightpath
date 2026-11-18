"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unlockStudioWithClassCode } from "./actions";
import { KeyRound, ArrowRight, AlertCircle } from "lucide-react";

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
      setError("Could not verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-2 py-8 sm:py-14">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex h-1 w-full">
          <div className="h-full w-3/5 bg-indigo-600" />
          <div className="h-full w-2/5 bg-amber-400" />
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                Unlock Studio
              </h1>
              <p className="text-xs text-slate-500">
                Enter your class access code.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <label htmlFor="studio-class-code" className="sr-only">
              Class access code
            </label>
            <input
              id="studio-class-code"
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Class access code"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              <span>{loading ? "Verifying..." : "Unlock Studio"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-600">
          <Link href="/projects" className="hover:text-indigo-700 transition-colors">
            Marketplace
          </Link>
          <Link href="/library" className="hover:text-indigo-700 transition-colors">
            My Library
          </Link>
        </div>
      </div>
    </div>
  );
}
