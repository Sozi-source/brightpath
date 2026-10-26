"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Info,
} from "lucide-react";
import type { TopicBankItem } from "@/types/database";

interface TopicSelectorProps {
  workspaceId: string;
  initialTitle: string;
  initialProblemArea: string;
  workspaceType: string;
  level: string;
  topics: TopicBankItem[];
  action: (formData: FormData) => Promise<void>;
}

export function TopicSelector({
  workspaceId,
  initialTitle,
  initialProblemArea,
  workspaceType,
  level,
  topics,
  action,
}: TopicSelectorProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [problemArea, setProblemArea] = useState(initialProblemArea || "");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Filter topics for this workspace type
  const matchingTopics = topics.filter(
    (t) => t.workspace_type === workspaceType || !t.workspace_type
  );

  function handleSelectTopic(topic: TopicBankItem) {
    setSelectedTopicId(topic.id);
    setTitle(topic.title);
    setProblemArea(
      `${topic.area}: ${topic.suggested_indicators ? "Key Indicators: " + topic.suggested_indicators : ""}`
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Bank Ideas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold tracking-tight text-slate-900">
              Curated TVET Topic Bank Ideas
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {matchingTopics.length} ideas available
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Browse verified curriculum topics adapted from KNEC project kits. Click any idea to prefill
          your formulation fields, or type your custom angle below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingTopics.map((topic) => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <div
                key={topic.id}
                className={`p-5 rounded-xl border transition-all text-left flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {topic.area}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>

                  {topic.suggested_indicators && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Suggested Indicators:
                      </span>
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {topic.suggested_indicators}
                      </p>
                    </div>
                  )}

                  {topic.suggested_sources && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Verified Sources:
                      </span>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {topic.suggested_sources}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  <span>{isSelected ? "Topic Selected" : "Use This Topic Idea"}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* KNEC Level Guidance Note */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">KNEC Guidelines on Project Titles ({level.toUpperCase()}):</span>
          <p className="leading-relaxed">
            {level === "craft" ? (
              <>
                For <strong>Craft Certificate</strong>, the supervisor designs or refines the project title. Up to 5
                candidates may share a title. Your supervisor has the authority to refine this title in their portal.
              </>
            ) : (
              <>
                For <strong>Diploma / Higher Diploma</strong>, candidates must formulate their title and rationale
                personally with supervisor guidance. The title and rationale carry <strong>5 marks</strong> on the KNEC
                Scorecard 1B.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Title & Problem Statement Formulation Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Confirm Proposal Title & Problem Focus
          </h3>
          <p className="text-xs text-slate-500">
            Save your title and problem area. This updates your workspace and informs your proposal sections.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />

          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Working Project Title <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Assessment of Nutritional Status and Infant Feeding Practices among Pastoralist Communities in Turkana County"
              required
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="problemArea"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Problem Area & Demographic / Location Focus
            </label>
            <input
              type="text"
              id="problemArea"
              name="problemArea"
              value={problemArea}
              onChange={(e) => setProblemArea(e.target.value)}
              placeholder="e.g. Food insecurity, stunting prevalence, KDHS secondary data 2014-2022"
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Save & Proceed to Proposal &rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
