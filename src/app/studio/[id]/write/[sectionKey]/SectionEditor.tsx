"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Lock,
  Lightbulb,
  Check,
  X,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
  FileText,
  BookOpen,
  ClipboardCheck,
  Crosshair,
  Plus,
} from "lucide-react";
import type { SectionPolishResult, SectionQuestionGuide } from "@/lib/studio/aiEngine";
import type { CitationInfo } from "@/lib/studio/sources";
import { extractUnfilledPlaceholders } from "@/lib/studio/templates/knecSectionTemplates";
import type { AiMode, ReviewStatus, SectionStatus } from "@/types/database";

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
  aiMode?: AiMode;
  sectionStatus?: SectionStatus;
  supervisorReview?: {
    status: ReviewStatus;
    comment: string;
    createdAt: string;
  } | null;
  currentText: string;
  standardTemplate?: string;
  availableCitations?: CitationInfo[];
  questionGuide?: SectionQuestionGuide;
  steps: StepItem[];
  currentStepIndex: number;
  prevStep: { key: string; title: string } | null;
  nextStep: { key: string; title: string } | null;
  saveAction: (formData: FormData) => Promise<void>;
  aiPolishAction?: (formData: FormData) => Promise<SectionPolishResult>;
  acceptAiAction?: (formData: FormData) => Promise<void>;
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
  aiMode = "feedback_and_polish",
  sectionStatus = "draft",
  supervisorReview = null,
  currentText: initialText,
  standardTemplate = "",
  availableCitations = [],
  questionGuide,
  steps,
  currentStepIndex,
  prevStep,
  nextStep,
  saveAction,
  aiPolishAction,
  acceptAiAction,
}: SectionEditorProps) {
  const [text, setText] = useState(initialText);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [citationFeedback, setCitationFeedback] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Rubric Check / Reference Compilation state
  const [isPolishing, startPolishTransition] = useTransition();
  const [polishResult, setPolishResult] = useState<SectionPolishResult | null>(null);
  const [isAcceptingAi, startAcceptTransition] = useTransition();

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const unfilledPlaceholders = extractUnfilledPlaceholders(text);
  const unfilledCount = unfilledPlaceholders.length;
  const isReferencesSection = sectionKey === "references";
  const canUseRubricButton = isReferencesSection || aiMode !== "off";
  // Only the deterministic APA 7th Reference Compiler replaces section text; content sections stay 100% student-authored
  const canAcceptCompiledText = isReferencesSection;

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

  const handleRubricCheckOrBuildRefs = () => {
    if (isLocked || !aiPolishAction || isPolishing || !canUseRubricButton) return;
    setErrorMessage("");

    startPolishTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("sectionKey", sectionKey);
        formData.append("draftText", text);
        const res = await aiPolishAction(formData);
        setPolishResult(res);
      } catch (err: unknown) {
        setSaveStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Rubric check failed.");
      }
    });
  };

  const handleAcceptCompiledReferences = () => {
    if (!polishResult || !acceptAiAction || !canAcceptCompiledText) return;

    startAcceptTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("sectionKey", sectionKey);
        formData.append("text", polishResult.polishedText);
        formData.append("charsAdded", "0");
        await acceptAiAction(formData);

        setText(polishResult.polishedText);
        setPolishResult(null);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3500);
      } catch (err: unknown) {
        setSaveStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to apply compiled references."
        );
      }
    });
  };

  const handleLoadKnecTemplate = () => {
    if (isLocked || !standardTemplate) return;
    const isGenericOrEmpty =
      !text.trim() ||
      text.includes("[Provide substantive technical content aligned with KNEC requirements:");

    if (!isGenericOrEmpty && text.trim() !== standardTemplate.trim()) {
      const confirmed = window.confirm(
        "Replace current draft with the fresh standardized KNEC fill-in template for this section?"
      );
      if (!confirmed) return;
    }
    setText(standardTemplate);
    setSaveStatus("idle");
  };

  const handleJumpToNextPlaceholder = () => {
    const el = textareaRef.current;
    if (!el || unfilledPlaceholders.length === 0) return;

    const currentCursor = el.selectionEnd || 0;
    const targetToken = unfilledPlaceholders[0];
    let nextIdx = text.indexOf(targetToken, currentCursor);
    if (nextIdx === -1) {
      nextIdx = text.indexOf(targetToken, 0);
    }
    if (nextIdx !== -1) {
      el.focus();
      el.setSelectionRange(nextIdx, nextIdx + targetToken.length);
    }
  };

  const handleInsertAtCursor = (snippet: string, label: string) => {
    if (isLocked) return;
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? text.length;
      const end = el.selectionEnd ?? text.length;
      const before = text.slice(0, start);
      const after = text.slice(end);
      const needsLeadingSpace = before.length > 0 && !/[\s(\n]$/.test(before);
      const inserted = `${needsLeadingSpace ? " " : ""}${snippet}`;
      const updated = `${before}${inserted}${after}`;
      setText(updated);
      setTimeout(() => {
        el.focus();
        const cursor = start + inserted.length;
        el.setSelectionRange(cursor, cursor);
      }, 10);
    } else {
      setText((prev) => `${prev.trimEnd()} ${snippet}`);
    }
    setCitationFeedback(`Inserted ${label}`);
    setTimeout(() => setCitationFeedback(null), 2500);
  };

  const handleDismissAi = () => {
    setPolishResult(null);
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
              {phase === "proposal" ? "Proposal Phase" : "Project Phase"} • Status:{" "}
              {sectionStatus.toUpperCase()} • 100% Candidate Authorship Template
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          {!isReferencesSection && (
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
                unfilledCount === 0 && wordsCount > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                  : "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
              }`}
            >
              {unfilledCount === 0 && wordsCount > 0
                ? "Template Fields Filled ✓"
                : `${unfilledCount} [field${unfilledCount === 1 ? "" : "s"}] to fill`}
            </span>
          )}
          <span
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors ${
              wordsCount >= minWords
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

      {/* Supervisor Inline Chapter Review Banner */}
      {supervisorReview && (
        <div
          className={`rounded-xl border p-4 space-y-1.5 text-xs ${
            supervisorReview.status === "changes_requested"
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : supervisorReview.status === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-indigo-50 border-indigo-200 text-indigo-950"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>
                Supervisor Chapter Review (
                {supervisorReview.status === "approved"
                  ? "Approved & Marked Final"
                  : supervisorReview.status === "changes_requested"
                  ? "Revisions Requested"
                  : "Supervision Note"}
                )
              </span>
            </div>
            <span className="text-[10px] font-mono opacity-75">
              {new Date(supervisorReview.createdAt).toLocaleDateString("en-KE")}
            </span>
          </div>
          <p className="leading-relaxed bg-white/80 p-2.5 rounded-lg border border-black/5">
            &ldquo;{supervisorReview.comment}&rdquo;
          </p>
        </div>
      )}

      {/* 3. KNEC Rubric Pre-Check / Reference Compilation Card */}
      {polishResult && (
        <div className="bg-white rounded-xl border-2 border-indigo-500 shadow-md overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 bg-indigo-50/60 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-600 text-white">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-indigo-950">
                  {isReferencesSection
                    ? "Compiled APA 7th Edition Reference List"
                    : "KNEC Examination Rubric & Template Completeness Check"}
                </h3>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                    polishResult.targetMet
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {polishResult.wordsPolished} / {minWords} words{" "}
                  {polishResult.targetMet ? "• Ready ✓" : "• Action Needed"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                {polishResult.improvements.map((imp, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-indigo-100"
                  >
                    <Check className="h-3 w-3 text-indigo-600" />
                    {imp}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleDismissAi}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close Check</span>
              </button>
              {canAcceptCompiledText && (
                <button
                  type="button"
                  onClick={handleAcceptCompiledReferences}
                  disabled={isAcceptingAi}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>{isAcceptingAi ? "Applying..." : "Apply Compiled References"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white space-y-3">
            {canAcceptCompiledText && (
              <>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Compiled APA 7th References
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto font-sans">
                  {polishResult.polishedText || "Nothing to compile yet."}
                </div>
              </>
            )}

            {polishResult.warnings.length > 0 ? (
              <ul className="space-y-1.5">
                {polishResult.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              !isReferencesSection && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-900">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Excellent work! All template placeholders are filled and your section meets the
                    KNEC word count and citation requirements.
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 4. Unified Writing Canvas */}
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
            <h3 className="text-base font-semibold text-slate-900">Section Locked</h3>
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
                  Step {currentStepIndex + 1} • Replace{" "}
                  <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">
                    [bracketed fields]
                  </code>{" "}
                  in your own words • Target: {minWords}+ words
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {standardTemplate && !isReferencesSection && (
                  <button
                    type="button"
                    onClick={handleLoadKnecTemplate}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    title="Load or reset the official standardized KNEC fill-in template for this section"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-600" />
                    <span>Load KNEC Template</span>
                  </button>
                )}

                {unfilledCount > 0 && !isReferencesSection && (
                  <button
                    type="button"
                    onClick={handleJumpToNextPlaceholder}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                    title="Highlight the next unfilled [bracket] field in the editor"
                  >
                    <Crosshair className="h-3.5 w-3.5 text-amber-700" />
                    <span>Next [Field] ({unfilledCount})</span>
                  </button>
                )}

                {!canUseRubricButton && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                    <span>Manual Mode</span>
                  </span>
                )}

                {aiPolishAction && canUseRubricButton && (
                  <button
                    type="button"
                    onClick={handleRubricCheckOrBuildRefs}
                    disabled={isPolishing || isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                    title={
                      isReferencesSection
                        ? "Compile APA 7th references from verified sources cited across your chapters"
                        : "Check template completion, word count target, and APA citations against KNEC rubric"
                    }
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>
                      {isPolishing
                        ? "Checking..."
                        : isReferencesSection
                        ? "Build APA References"
                        : "Run KNEC Rubric Check"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || isPolishing}
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
            {(saveStatus === "error" || Boolean(errorMessage)) && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage || "Failed to save draft."}</span>
              </div>
            )}

            {/* Prominent Guided Fill-In Instructions Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-slate-50 border border-indigo-200 shadow-2xs space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-2xs">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                    Standardized KNEC Fill-In Guide
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                    {questionGuide?.mainQuestion || `Complete the standardized KNEC template for ${sectionTitle}`}
                  </h2>
                </div>
              </div>

              {questionGuide && questionGuide.subQuestions.length > 0 && (
                <div className="pl-11 space-y-1">
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600">
                    {questionGuide.subQuestions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* KNEC Syllabus Target Line */}
              <div className="pl-11 pt-1 border-t border-indigo-100/80 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-medium text-slate-700">KNEC Syllabus Standard:</span>
                <span className="truncate">{guidance}</span>
              </div>
            </div>

            {/* Interactive Verified KNEC / KDHS Citation & Data Picker */}
            {availableCitations.length > 0 && !isReferencesSection && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">
                        Verified KNEC, KDHS 2022, WHO & KEBS Reference Bank
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Click to insert an official APA 7th citation or verified statistic at your cursor.
                      </p>
                    </div>
                  </div>
                  {citationFeedback && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      {citationFeedback} ✓
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableCitations.map((cit) => {
                    const primaryFact = cit.supports[0] || "";
                    return (
                      <div
                        key={cit.id}
                        className="bg-white rounded-lg border border-slate-200 p-2.5 flex flex-col justify-between gap-2 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-semibold text-indigo-700">
                              {cit.inText}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleInsertAtCursor(cit.inText, cit.inText)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Cite {cit.inText}</span>
                            </button>
                          </div>
                          {primaryFact && (
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                              {primaryFact}.
                            </p>
                          )}
                        </div>
                        {primaryFact && (
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400 truncate">
                              {cit.reference}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleInsertAtCursor(
                                  `${primaryFact} ${cit.inText}.`,
                                  `finding ${cit.inText}`
                                )
                              }
                              className="text-[10px] font-semibold text-slate-600 hover:text-indigo-700 shrink-0 cursor-pointer"
                            >
                              + Insert Finding
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Editor Textarea */}
            <div>
              <textarea
                id="editorTextarea"
                ref={textareaRef}
                rows={16}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  standardTemplate ||
                  questionGuide?.placeholderExample ||
                  "Fill in the standardized KNEC section template here in your own words..."
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 leading-relaxed font-sans placeholder:text-slate-400 min-h-[360px]"
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
                    <span>Previous: {prevStep.title}</span>
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
                    <span>Next: {nextStep.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/studio/${workspaceId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <span>Finish {phase === "proposal" ? "Proposal" : "Chapters"}</span>
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
