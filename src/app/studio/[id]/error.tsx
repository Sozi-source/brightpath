"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function WorkspaceError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Keep the server digest available in browser telemetry and support reports.
    console.error("Studio workspace render failed", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex h-1 w-full" aria-hidden="true">
          <div className="w-[60%] bg-blue-700" />
          <div className="w-[40%] bg-amber-500" />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <TriangleAlert className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Workspace unavailable</h1>
              <p className="text-sm text-slate-600">Reload the workspace to continue.</p>
            </div>
          </div>
          {error.digest && (
            <p className="font-mono text-xs text-slate-500">Reference: {error.digest}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link
              href="/studio"
              className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Project Studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
