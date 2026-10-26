"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Lightbulb,
} from "lucide-react";

export interface StepItem {
  key: string;
  title: string;
  phase: "proposal" | "project";
  stepNumber: number;
  isDone: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  wordCount: number;
  minWords: number;
}

interface SectionEditorProps {
  workspaceId: string;
  workspaceTitle: string;
  course: string;
  sectionKey: string;
  sectionTitle: string;
  guidance: string;
  rubricMarks?: number;
  minWords?: number;
  phase: "proposal" | "project";
  isLocked: boolean;
  currentText: string;
  starterTemplate?: string;
  steps: StepItem[];
  currentStepIndex: number;
  prevStep: { key: string; title: string } | null;
  nextStep: { key: string; title: string } | null;
  saveAction: (formData: FormData) => Promise<void>;
}

export function SectionEditor({
  workspaceId,
  workspaceTitle,
  course,
  sectionKey,
  sectionTitle,
  guidance,
  minWords = 30,
  phase,
  isLocked,
  currentText: initialText,
  starterTemplate,
  steps,
  currentStepIndex,
  prevStep,
  nextStep,
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
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* 1. Context Ribbon: Workspace Link & Step Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/studio/${workspaceId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Workspace</span>
          </Link>

          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-900 truncate">
              {workspaceTitle || course}
            </span>
            <span className="block text-[11px] text-slate-500 capitalize">
              {phase === "proposal" ? "Proposal Phase" : "Project Phase"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
              isMinMet && wordsCount > 0
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {wordsCount} / {minWords} words
          </span>
        </div>
      </div>

      {/* 2. Visual Step Progression Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-2.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {steps.map((st) => {
            const isCurrent = st.isCurrent;
            const isDone = st.isDone;
            const isSecLocked = st.isLocked;

            if (isSecLocked) {
              return (
                <div
                  key={st.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>
                    {st.stepNumber}. {st.title}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={st.key}
                href={`/studio/${workspaceId}/write/${encodeURIComponent(st.key)}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {isDone && !isCurrent ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span
                    className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-mono ${
                      isCurrent ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {st.stepNumber}
                  </span>
                )}
                <span className="truncate max-w-[140px] sm:max-w-none">{st.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Unified Writing Canvas */}
      {isLocked ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="h-1 w-full flex">
            <div className="h-full w-3/5 bg-blue-700" />
            <div className="h-full w-2/5 bg-amber-500" />
          </div>
          <div className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Section Locked
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This chapter unlocks after your proposal is approved by your supervisor.
            </p>
            <div className="pt-2">
              <Link
                href={`/studio/${workspaceId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <span>Return to Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Two-Tone KEC Accent Stripe */}
          <div className="h-1 w-full flex">
            <div className="h-full w-3/5 bg-blue-700" />
            <div className="h-full w-2/5 bg-amber-500" />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Canvas Header & Primary Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                  {sectionTitle}
                </h1>
                <p className="text-xs text-slate-500">
                  Step {currentStepIndex + 1} • Minimum target: {minWords} words
                </p>
              </div>

              <div className="flex items-center gap-2">
                {starterTemplate && (
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Insert KNEC outline for this chapter"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Insert Outline</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>
                    {isPending ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Save Draft"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error banner if save fails */}
            {saveStatus === "error" && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage || "Failed to save draft."}</span>
              </div>
            )}

            {/* Concise Prompt Guidance */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900">Guide:</span>
                <p className="text-slate-600 leading-relaxed">{guidance}</p>
              </div>
            </div>

            {/* Editor Textarea */}
            <div>
              <textarea
                id="editorTextarea"
                rows={14}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your section draft here in clear, concise academic English..."
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 leading-relaxed font-sans placeholder:text-slate-400 min-h-[320px]"
              />
            </div>

            {/* Step Navigation Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div>
                {prevStep ? (
                  <Link
                    href={`/studio/${workspaceId}/write/${encodeURIComponent(prevStep.key)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous Step: {prevStep.title}</span>
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">First step</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {nextStep ? (
                  <Link
                    href={`/studio/${workspaceId}/write/${encodeURIComponent(nextStep.key)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                  >
                    <span>Next Step: {nextStep.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/studio/${workspaceId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <span>Complete {phase === "proposal" ? "Proposal" : "Chapters"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
