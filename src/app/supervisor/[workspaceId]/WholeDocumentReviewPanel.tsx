"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, SearchCheck } from "lucide-react";
import { reviewSupervisorBusinessPlanDocument } from "@/app/supervisor/actions";

type ReviewReport = {
  findings: Array<{
    sectionKey: string;
    severity: "high" | "medium" | "low";
    category: string;
    issue: string;
    recommendation: string;
    sourceRefs: number[];
  }>;
  chaptersReviewed: number;
  warnings: string[];
  researchSources: Array<{ title: string; url: string }>;
};

function chapterAnchor(sectionKey: string) {
  if (sectionKey.startsWith("app.")) return "appendices";
  if (sectionKey.startsWith("prelim.")) return "preliminary";
  return sectionKey.split(".")[0];
}

export function WholeDocumentReviewPanel({ workspaceId }: { workspaceId: string }) {
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");
  const [isReviewing, startReview] = useTransition();
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const review = () => {
    setReport(null);
    setError(null);
    startReview(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("aiProvider", provider);
        setReport(await reviewSupervisorBusinessPlanDocument(formData));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not review this business plan.");
      }
    });
  };

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
            <SearchCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Whole-document review</h2>
            <p className="text-xs text-slate-600">Audit every chapter for evidence, consistency, and structure.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            Provider
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value as "gemini" | "groq")}
              disabled={isReviewing}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </label>
          <button
            type="button"
            onClick={review}
            disabled={isReviewing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {isReviewing ? "Reviewing..." : report ? "Review Again" : "Review Document"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {report && (
        <div className="max-h-[32rem] space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-900">
              {report.chaptersReviewed} groups reviewed · {report.findings.length} findings
            </span>
          </div>
          {report.warnings.map((warning) => (
            <p key={warning} className="text-xs text-amber-800">{warning}</p>
          ))}
          {report.findings.length === 0 ? (
            <p className="text-xs text-slate-600">
              {report.chaptersReviewed === 0
                ? "The document review did not complete. See the warning above."
                : "No substantive issues found. Verify cited facts and local evidence before approval."}
            </p>
          ) : report.findings.map((finding, index) => (
            <article key={`${finding.sectionKey}-${index}`} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">{finding.sectionKey.replaceAll(".", " ")}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  finding.severity === "high"
                    ? "bg-rose-100 text-rose-800"
                    : finding.severity === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {finding.severity} · {finding.category}
                </span>
              </div>
              <p className="text-xs text-slate-800">{finding.issue}</p>
              <p className="mt-1 text-xs text-slate-600">Action: {finding.recommendation}</p>
              <Link
                href={`/supervisor/${workspaceId}#doc-${chapterAnchor(finding.sectionKey)}`}
                className="mt-2 inline-block text-[11px] font-semibold text-indigo-700 underline underline-offset-2"
              >
                Open chapter
              </Link>
              {finding.sourceRefs.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {finding.sourceRefs.map((sourceRef) => {
                    const source = report.researchSources[sourceRef - 1];
                    return source ? (
                      <a key={sourceRef} href={source.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-700 underline underline-offset-2">
                        [{sourceRef}] {source.title}
                      </a>
                    ) : null;
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
