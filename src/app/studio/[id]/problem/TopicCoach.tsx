"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { TopicNarrowingOption, TopicNarrowingResult } from "@/lib/studio/aiEngine";

interface TopicCoachProps {
  workspaceId: string;
  initialTitle: string;
  initialProblemArea: string;
  workspaceType: "research_secondary" | "trade_fabrication" | "business_plan";
  saveAction: (formData: FormData) => Promise<void>;
  aiNarrowAction: (formData: FormData) => Promise<TopicNarrowingResult>;
}

export function TopicCoach({
  workspaceId,
  initialTitle,
  initialProblemArea,
  workspaceType,
  saveAction,
  aiNarrowAction,
}: TopicCoachProps) {
  const [studentInput, setStudentInput] = useState("");
  const [isAiLoading, startAiTransition] = useTransition();
  const [aiResult, setAiResult] = useState<TopicNarrowingResult | null>(null);

  const [selectedTitle, setSelectedTitle] = useState(initialTitle || "");
  const [selectedProblem, setSelectedProblem] = useState(initialProblemArea || "");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [isSaving, startSaveTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAskAi = () => {
    if (!studentInput.trim() || isAiLoading) return;
    setActionError(null);

    startAiTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("studentInput", studentInput);
        const res = await aiNarrowAction(formData);
        setAiResult(res);
      } catch (err) {
        console.error("AI Narrowing failed:", err);
        setActionError(
          err instanceof Error ? err.message : "Could not suggest topics. Try again."
        );
      }
    });
  };

  const isBusiness = workspaceType === "business_plan";

  const handleAdoptOption = (opt: TopicNarrowingOption) => {
    setSelectedOptionId(opt.id);
    setSelectedTitle(opt.title);
    if (!isBusiness) {
      setSelectedProblem(
        `Problem: ${opt.problemSummary}\n\nGeneral Objective: ${opt.generalObjective}\n\nSpecific Objectives:\n1. ${opt.specificObjectives[0] || ""}\n2. ${opt.specificObjectives[1] || ""}\n3. ${opt.specificObjectives[2] || ""}`
      );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* 1. Topic Ideas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-1 w-full flex">
          <div className="h-full w-3/5 bg-blue-700" />
          <div className="h-full w-2/5 bg-amber-500" />
        </div>

        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                {isBusiness ? "Business Plan Concept" : "Topic Ideas"}
              </h2>
            </div>

          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="studentInput"
              className="block text-xs font-semibold text-slate-700"
            >
              {isBusiness ? "Business Idea or Enterprise Sector" : "Problem area"}
            </label>
            <textarea
              id="studentInput"
              rows={2}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder={
                isBusiness
                  ? "e.g. nutrition consultancy practice, fortified flour milling, natural juice in Kitui"
                  : "e.g. child stunting in Kitui"
              }
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAskAi}
              disabled={!studentInput.trim() || isAiLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {isAiLoading
                  ? "Working..."
                  : isBusiness
                  ? "Suggest Business Plans"
                  : "Suggest Topics"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Suggestions */}
      {aiResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiResult.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                className={`bg-white rounded-xl border p-4 flex flex-col justify-between gap-3 shadow-xs transition-all ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-600/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {opt.businessConcept || opt.problemSummary}
                  </p>
                  {isBusiness && opt.startupCapital && (
                    <div className="pt-1 text-[11px] font-mono text-indigo-700">
                      Capital: {opt.startupCapital}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAdoptOption(opt)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>{isBusiness ? "Select Plan" : "Use Topic"}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Your Topic / Business Plan Concept */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          {isBusiness ? "Your Business Plan Concept" : "Your Topic"}
        </h3>

        {actionError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-800">
            {actionError}
          </div>
        )}

        <form
          action={(formData) => {
            setActionError(null);
            startSaveTransition(async () => {
              try {
                await saveAction(formData);
              } catch (err) {
                if (
                  err instanceof Error &&
                  (err.message.includes("NEXT_REDIRECT") ||
                    (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
                ) {
                  throw err;
                }
                setActionError(
                  err instanceof Error ? err.message : "Could not save topic. Try again."
                );
              }
            });
          }}
          className="space-y-4"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />

          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {isBusiness ? "Business Plan Title" : "Title"}{" "}
              <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              rows={2}
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              required
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div>
            <label
              htmlFor="problemArea"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {isBusiness ? "Business Concept & Profile" : "Problem & Objectives"}
            </label>
            <textarea
              id="problemArea"
              name="problemArea"
              rows={4}
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={!selectedTitle.trim() || isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSaving
                  ? "Submitting..."
                  : isBusiness
                  ? "Submit Plan for Approval"
                  : "Submit for Approval"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
