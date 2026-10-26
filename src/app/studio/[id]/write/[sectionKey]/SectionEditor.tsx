"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
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
  starterTemplate?: string;
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
  starterTemplate,
  prevSectionKey,
  nextSectionKey,
  saveAction,
}: SectionEditorProps) {
  const [text, setText] = useState(initialText);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isMinMet = wordsCount >= minWords;

  const handleInsertTemplate = () => {
    if (isLocked || !starterTemplate) return;
    if (text.trim() && text.trim() !== starterTemplate.trim()) {
      const confirmed = window.confirm(
        "Replace current draft with official KNEC chapter outline?"
      );
      if (!confirmed) return;
    }
    setText(starterTemplate);
  };

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
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {phase === "proposal" ? "Proposal" : "Chapter"}
            </span>
            {rubricMarks !== undefined && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {rubricMarks}m
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span>Words: <span className="font-semibold text-slate-800">{wordsCount}</span> {minWords > 0 && `(min: ${minWords})`}</span>
            {isMinMet && wordsCount > 0 && <span className="text-emerald-700 font-semibold">✓</span>}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-snug border-t border-slate-100 pt-2">
          <span className="font-semibold text-slate-800">Prompt:</span> {guidance}
        </p>
      </div>

      {/* Locked Warning if Project phase not approved */}
      {isLocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-2 shadow-xs">
          <Lock className="h-6 w-6 mx-auto text-amber-700" />
          <h3 className="text-sm font-semibold text-amber-900">
            Section Locked
          </h3>
          <p className="text-xs text-amber-800 max-w-sm mx-auto">
            This chapter unlocks once your proposal is approved by your supervisor.
          </p>
          <div className="pt-1">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors"
            >
              <span>Return to Overview</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active Writing Area */
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label
              htmlFor="editorTextarea"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Draft</span>
            </label>

            <div className="flex items-center gap-3">
              {starterTemplate && (
                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  title="Insert official KNEC chapter starter outline"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Insert KNEC Outline</span>
                </button>
              )}

              {saveStatus === "saved" && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}

              {saveStatus === "error" && (
                <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorMessage || "Error saving draft"}
                </span>
              )}
            </div>
          </div>

          {/* Quick empty-state helper banner */}
          {text.trim().length === 0 && starterTemplate && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3 text-xs">
              <span className="text-indigo-900 font-medium">
                Load official KNEC outline and prompts:
              </span>
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 shadow-xs transition-colors cursor-pointer"
              >
                Insert Outline
              </button>
            </div>
          )}

          <textarea
            id="editorTextarea"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your section draft here..."
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 leading-relaxed font-sans placeholder:text-slate-400"
          />

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {prevSectionKey ? (
                <Link
                  href={`/studio/${workspaceId}/write/${prevSectionKey}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <span>Next Section</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/studio/${workspaceId}`}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Workspace
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
