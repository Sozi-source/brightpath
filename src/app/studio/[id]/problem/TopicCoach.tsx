"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TopicBankItem } from "@/types/database";
import type { TopicNarrowingOption, TopicNarrowingResult } from "@/lib/studio/aiEngine";

interface TopicCoachProps {
  workspaceId: string;
  initialTitle: string;
  initialProblemArea: string;
  workspaceType: "research_secondary" | "trade_fabrication" | "business_plan";
  course: string;
  topics: TopicBankItem[];
  saveAction: (formData: FormData) => Promise<void>;
  aiNarrowAction: (formData: FormData) => Promise<TopicNarrowingResult>;
}

export function TopicCoach({
  workspaceId,
  initialTitle,
  initialProblemArea,
  workspaceType,
  course,
  topics,
  saveAction,
  aiNarrowAction,
}: TopicCoachProps) {
  const [studentInput, setStudentInput] = useState("");
  const [isAiLoading, startAiTransition] = useTransition();
  const [aiResult, setAiResult] = useState<TopicNarrowingResult | null>(null);

  // Selected topic details
  const [selectedTitle, setSelectedTitle] = useState(initialTitle || "");
  const [selectedProblem, setSelectedProblem] = useState(initialProblemArea || "");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Form submission state
  const [isSaving, startSaveTransition] = useTransition();
  const [showCuratedBank, setShowCuratedBank] = useState(false);
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
          err instanceof Error ? err.message : "Could not generate AI topic options. Please try again."
        );
      }
    });
  };

  const handleAdoptOption = (opt: TopicNarrowingOption) => {
    setSelectedOptionId(opt.id);
    setSelectedTitle(opt.title);
    setSelectedProblem(
      `Problem: ${opt.problemSummary}\n\nGeneral Objective: ${opt.generalObjective}\n\nSpecific Objectives:\n1. ${opt.specificObjectives[0] || ""}\n2. ${opt.specificObjectives[1] || ""}\n3. ${opt.specificObjectives[2] || ""}`
    );
  };

  const handleAdoptCuratedIdea = (t: TopicBankItem) => {
    setSelectedOptionId(t.id);
    setSelectedTitle(t.title);
    setSelectedProblem(
      `Core Area: ${t.area}\n${t.suggested_indicators ? "Key Indicators: " + t.suggested_indicators : ""}`
    );
  };

  const matchingTopics = topics.filter(
    (t) => t.workspace_type === workspaceType || !t.workspace_type
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Open-Ended AI Topic Discovery Coach Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Two-Tone KEC Accent Stripe */}
        <div className="h-1 w-full flex">
          <div className="h-full w-3/5 bg-blue-700" />
          <div className="h-full w-2/5 bg-amber-500" />
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  Guided Topic Discovery
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Type your topic idea. We will generate 3 direct and simple proposals tailored for Certificate & Diploma TVET examination standards.
              </p>
            </div>

            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md shrink-0">
              {course}
            </span>
          </div>

          {/* Open-Ended Question Prompt */}
          <div className="space-y-2">
            <label
              htmlFor="studentInput"
              className="block text-xs font-semibold text-slate-800"
            >
              Which problem area or nutritional challenge do you wish to conduct your research on?
            </label>
            <div className="relative">
              <textarea
                id="studentInput"
                rows={3}
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="e.g. food insecurity and school performance in Kitui, or child feeding practices in Kilifi, or composite sweet potato porridge flour..."
                className="w-full text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                Mention any health condition, food ingredient, or target community.
              </span>

              <button
                type="button"
                onClick={handleAskAi}
                disabled={!studentInput.trim() || isAiLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAiLoading ? "Narrowing Down..." : "Narrow Down with AI"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Narrowing Results (3 Examination Proposals) */}
      {aiResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Analysis Banner */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
              <BookOpen className="h-4 w-4 text-indigo-700 shrink-0" />
              <span>Supervisor Research Assessment</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{aiResult.problemAnalysis}</p>
          </div>

          {/* 3 Refined KNEC Proposals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiResult.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const optionLetters = ["A", "B", "C"];

              return (
                <div
                  key={opt.id}
                  className={`bg-white rounded-xl border p-4.5 flex flex-col justify-between space-y-3.5 transition-all shadow-xs ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Proposal {optionLetters[idx] || idx + 1}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {opt.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3">
                      <span className="font-medium text-slate-800">Problem:</span> {opt.problemSummary}
                    </p>

                    <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-800 block">General Aim:</span>
                      <p className="line-clamp-2 text-slate-600">{opt.generalObjective}</p>
                    </div>

                    {opt.specificObjectives && opt.specificObjectives.length > 0 && (
                      <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-800 block">Objectives:</span>
                        <ul className="space-y-0.5 text-slate-600 text-[10.5px]">
                          {opt.specificObjectives.slice(0, 3).map((obj, i) => (
                            <li key={i} className="line-clamp-1">{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                      <span className="font-medium text-slate-700">Methodology:</span>
                      <p className="line-clamp-2">{opt.methodologyHint}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdoptOption(opt)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isSelected ? "Selected Topic" : "Adopt This Topic"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Follow-Up Guidance Prompt */}
          {aiResult.followUpQuestion && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-700">
              <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">Follow-Up Refinement:</span>
                <p className="text-slate-700">{aiResult.followUpQuestion}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Official KNEC Topic Confirmation & Review Submission */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Official Project Scope
            </h3>
            <p className="text-xs text-slate-500">
              Review and submit this settled topic for supervisor moderation.
            </p>
          </div>

          {selectedTitle && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Topic Ready
            </span>
          )}
        </div>

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
                  err instanceof Error ? err.message : "Could not save topic. Please try again."
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
              Approved Project Title <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              rows={2}
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              placeholder="Select an AI proposal above or enter your confirmed research title..."
              required
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label
              htmlFor="problemArea"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Problem Area Rationale & SMART Objectives
            </label>
            <textarea
              id="problemArea"
              name="problemArea"
              rows={4}
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              placeholder="Summary of the nutritional problem, general aim, and specific objectives..."
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 placeholder:text-slate-400 leading-relaxed font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={!selectedTitle.trim() || isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{isSaving ? "Submitting..." : "Submit Topic for Approval"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 4. Optional: Expandable Curated Topic Bank */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowCuratedBank(!showCuratedBank)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800">
              Browse Pre-Curated National Curriculum Topic Bank
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({matchingTopics.length} ideas)
            </span>
          </div>

          {showCuratedBank ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {showCuratedBank && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchingTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2 text-xs"
              >
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {topic.area}
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1 leading-snug">
                    {topic.title}
                  </h4>
                  {topic.suggested_indicators && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {topic.suggested_indicators}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAdoptCuratedIdea(topic)}
                  className="py-1 px-2.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer self-start"
                >
                  Adopt Idea
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
