"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Info,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";

interface SectionEditorProps {
  workspaceId: string;
  sectionKey: string;
  guidance: string;
  rubricMarks?: number;
  minWords?: number;
  phase: "proposal" | "project";
  isLocked: boolean;
  currentText: string;
  prevSectionKey: string | null;
  nextSectionKey: string | null;
  saveAction: (formData: FormData) => Promise<void>;
}

export function SectionEditor({
  workspaceId,
  sectionKey,
  guidance,
  rubricMarks,
  minWords = 50,
  phase,
  isLocked,
  currentText: initialText,
  prevSectionKey,
  nextSectionKey,
  saveAction,
}: SectionEditorProps) {
  const [text, setText] = useState(initialText);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;
  const isMinMet = wordsCount >= minWords;

  const handleSave = () => {
    if (isLocked) return;
    setSaveStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("sectionKey", sectionKey);
        formData.append("text", text);
        await saveAction(formData);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3500);
      } catch (err: unknown) {
        setSaveStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to save section.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Guidance Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {phase === "proposal" ? "Proposal Section" : "Project Chapter"}
            </span>
            {rubricMarks !== undefined && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {rubricMarks} Rubric Marks
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-zinc-500 flex items-center gap-3">
            <span>
              Words: <strong>{wordsCount}</strong> {minWords > 0 && `(min: ${minWords})`}
              {isMinMet && wordsCount > 0 && (
                <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">✓</span>
              )}
            </span>
            <span>•</span>
            <span>Chars: {charsCount}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
              KNEC Section Guidance:
            </span>
            <p className="whitespace-pre-line">{guidance}</p>
          </div>
        </div>
      </div>

      {/* Locked Warning if Project phase not approved */}
      {isLocked ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <Lock className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Chapter Section Locked
          </h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 max-w-lg mx-auto leading-relaxed">
            In accordance with KNEC Business and Technical Examinations regulations, project chapter
            work (Chapters 1–4) unlocks immediately once your project proposal is reviewed and approved
            by your supervisor.
          </p>
          <div className="pt-2">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
            >
              <span>Return to Proposal Overview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active Writing Area */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="editorTextarea"
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Candidate Draft</span>
            </label>

            {saveStatus === "saved" && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" />
                Draft saved & version recorded
              </span>
            )}

            {saveStatus === "error" && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMessage || "Error saving draft"}
              </span>
            )}
          </div>

          <textarea
            id="editorTextarea"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your candidate section draft here in clear, concise academic English..."
            className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans placeholder:text-zinc-400"
          />

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {prevSectionKey ? (
                <Link
                  href={`/studio/${workspaceId}/write/${prevSectionKey}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous Section</span>
                </Link>
              ) : (
                <span />
              )}

              {nextSectionKey && (
                <Link
                  href={`/studio/${workspaceId}/write/${nextSectionKey}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <span>Next Section</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/studio/${workspaceId}`}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Back to Workspace
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isPending ? "Saving..." : "Save Draft"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
