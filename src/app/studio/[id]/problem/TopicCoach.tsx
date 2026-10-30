"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
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
  switchTrackAction?: (formData: FormData) => Promise<void>;
  aiNarrowAction: (formData: FormData) => Promise<TopicNarrowingResult>;
}

export function TopicCoach({
  workspaceId,
  initialTitle,
  initialProblemArea,
  workspaceType,
  topics,
  saveAction,
  switchTrackAction,
  aiNarrowAction,
}: TopicCoachProps) {
  const [studentInput, setStudentInput] = useState("");
  const [isAiLoading, startAiTransition] = useTransition();
  const [aiResult, setAiResult] = useState<TopicNarrowingResult | null>(null);

  const [selectedTitle, setSelectedTitle] = useState(initialTitle || "");
  const [selectedProblem, setSelectedProblem] = useState(initialProblemArea || "");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [isSaving, startSaveTransition] = useTransition();
  const [isSwitchingTrack, startTrackTransition] = useTransition();
  const [showCuratedBank, setShowCuratedBank] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSwitchTrack = (newTrack: "research_secondary" | "trade_fabrication" | "business_plan") => {
    if (!switchTrackAction || newTrack === workspaceType) return;
    setActionError(null);
    startTrackTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("workspaceType", newTrack);
        await switchTrackAction(formData);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to switch track.");
      }
    });
  };

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
    if (isBusiness) {
      const concept = opt.businessConcept || opt.problemSummary;
      const products = opt.productsServices || "Nutrient-dense food products and dietary consulting services.";
      const market = opt.targetMarket || "Local households, clinic referrals, and neighborhood retailers.";
      const capital = opt.startupCapital || "KES 250,000 - 350,000";
      const goals =
        opt.commercialGoals && opt.commercialGoals.length > 0
          ? opt.commercialGoals
              .map((g, i) => `${i + 1}. ${g.replace(/^\d+\.\s*/, "")}`)
              .join("\n")
          : opt.specificObjectives && opt.specificObjectives.length > 0
          ? opt.specificObjectives
              .map((o, i) => `${i + 1}. ${o.replace(/^\d+\.\s*/, "")}`)
              .join("\n")
          : "1. Achieve operational break-even within the first 6-8 months.\n2. Build a reliable monthly client base and steady sales revenue.\n3. Secure regulatory licensing and county health permits.";

      setSelectedProblem(
        `Business Concept: ${concept}\n\nProducts & Services Offered: ${products}\n\nTarget Market: ${market}\n\nEstimated Startup Capital: ${capital}\n\nKey Commercial Goals:\n${goals}`
      );
    } else {
      setSelectedProblem(
        `Problem: ${opt.problemSummary}\n\nGeneral Objective: ${opt.generalObjective}\n\nSpecific Objectives:\n1. ${opt.specificObjectives[0] || ""}\n2. ${opt.specificObjectives[1] || ""}\n3. ${opt.specificObjectives[2] || ""}`
      );
    }
  };

  const handleAdoptCuratedIdea = (t: TopicBankItem) => {
    setSelectedOptionId(t.id);
    setSelectedTitle(t.title);
    if (isBusiness) {
      setSelectedProblem(
        `Business Sector: ${t.area}\n\nProposed Offerings: ${t.suggested_indicators || "Nutritional products and services"}\n\nForm of Ownership: Sole Proprietorship\n\nCommercial Target: To establish a self-sustaining nutrition and food enterprise in the study area.`
      );
    } else {
      setSelectedProblem(
        `Core Area: ${t.area}\n${t.suggested_indicators ? "Key Indicators: " + t.suggested_indicators : ""}`
      );
    }
  };

  const matchingTopics = topics.filter(
    (t) => t.workspace_type === workspaceType || !t.workspace_type
  );

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

            {switchTrackAction && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Track:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    disabled={isSwitchingTrack}
                    onClick={() => handleSwitchTrack("research_secondary")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      workspaceType === "research_secondary"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Nutrition Research
                  </button>
                  <button
                    type="button"
                    disabled={isSwitchingTrack}
                    onClick={() => handleSwitchTrack("trade_fabrication")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      workspaceType === "trade_fabrication"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Food Science
                  </button>
                  <button
                    type="button"
                    disabled={isSwitchingTrack}
                    onClick={() => handleSwitchTrack("business_plan")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      workspaceType === "business_plan"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Enterprise
                  </button>
                </div>
              </div>
            )}
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

      {/* 4. Topic Bank */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowCuratedBank(!showCuratedBank)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800">
              {isBusiness ? "Enterprise Idea Bank" : "Topic Bank"}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({matchingTopics.length})
            </span>
          </div>

          {showCuratedBank ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {showCuratedBank && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {matchingTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {topic.area}
                  </span>
                  <h4 className="font-semibold text-slate-900 leading-snug">
                    {topic.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdoptCuratedIdea(topic)}
                  className="py-1 px-2.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer self-start"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
