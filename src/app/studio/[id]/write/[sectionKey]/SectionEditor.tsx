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
  const charsCount = text.length;
  const isMinMet = wordsCount >= minWords;

  const handleInsertTemplate = () => {
    if (isLocked || !starterTemplate) return;
    if (text.trim() && text.trim() !== starterTemplate.trim()) {
      const confirmed = window.confirm(
        "Insert official KNEC chapter outline & starter template? This will replace your current text in this section with the structured KNEC outline."
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
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {phase === "proposal" ? "Proposal Section" : "Project Chapter"}
            </span>
            {rubricMarks !== undefined && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {rubricMarks} Rubric Marks
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center gap-3">
            <span>
              Words: <strong className="text-slate-800">{wordsCount}</strong> {minWords > 0 && `(min: ${minWords})`}
              {isMinMet && wordsCount > 0 && (
                <span className="ml-1 text-emerald-700 font-bold">✓</span>
              )}
            </span>
            <span>•</span>
            <span>Chars: <strong className="text-slate-800">{charsCount}</strong></span>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              KNEC Section Guidance:
            </span>
            <p className="whitespace-pre-line text-slate-700">{guidance}</p>
          </div>
        </div>
      </div>

      {/* Locked Warning if Project phase not approved */}
      {isLocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <Lock className="h-8 w-8 mx-auto text-amber-700 mb-1" />
          <h3 className="text-base font-bold text-amber-900">
            Chapter Section Locked
          </h3>
          <p className="text-xs text-amber-900/80 max-w-lg mx-auto leading-relaxed">
            In accordance with KNEC Business and Technical Examinations regulations, project chapter
            work (Chapters 1–4) unlocks immediately once your project proposal is reviewed and approved
            by your supervisor.
          </p>
          <div className="pt-2">
            <Link
              href={`/studio/${workspaceId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors"
            >
              <span>Return to Proposal Overview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active Writing Area */
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label
              htmlFor="editorTextarea"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Candidate Draft</span>
            </label>

            <div className="flex items-center gap-3">
              {starterTemplate && (
                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                  title="Insert official KNEC chapter outline & structured starter text"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-700" />
                  <span>Insert KNEC Chapter Outline</span>
                </button>
              )}

              {saveStatus === "saved" && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Draft saved & version recorded
                </span>
              )}

              {saveStatus === "error" && (
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorMessage || "Error saving draft"}
                </span>
              )}
            </div>
          </div>

          {/* Quick empty-state helper banner */}
          {text.trim().length === 0 && starterTemplate && (
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Sparkles className="h-4 w-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Avoid starting from a blank page!</strong> Load the official KNEC chapter outline with structured headings, sub-points, and guided starters.
                </span>
              </div>
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="px-3 py-1.5 rounded-md text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 shrink-0 shadow-xs transition-colors cursor-pointer"
              >
                Pre-fill Outline Now
              </button>
            </div>
          )}

          <textarea
            id="editorTextarea"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your candidate section draft here in clear, concise academic English..."
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans placeholder:text-slate-400"
          />

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {prevSectionKey ? (
                <Link
                  href={`/studio/${workspaceId}/write/${prevSectionKey}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors"
                >
                  <span>Next Section</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/studio/${workspaceId}`}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back to Workspace
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
