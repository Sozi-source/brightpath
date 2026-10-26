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
    <div className="space-y-8">
      {/* Topic Bank Ideas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Curated TVET Topic Bank Ideas
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {matchingTopics.length} ideas for this track
          </span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Browse verified curriculum topics adapted from KNEC project kits. Click any idea to prefill
          your formulation fields, or type your custom angle below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingTopics.map((topic) => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <div
                key={topic.id}
                className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {topic.area}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {topic.title}
                  </h3>

                  {topic.suggested_indicators && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                        Suggested Indicators:
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {topic.suggested_indicators}
                      </p>
                    </div>
                  )}

                  {topic.suggested_sources && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                        Verified Sources:
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {topic.suggested_sources}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            Confirm Proposal Title & Problem Focus
          </h3>
          <p className="text-xs text-zinc-500">
            Save your title and problem area. This updates your workspace and informs your proposal sections.
          </p>
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="workspaceId" value={workspaceId} />

          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Working Project Title <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Assessment of Nutritional Status and Infant Feeding Practices among Pastoralist Communities in Turkana County"
              required
              className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="problemArea"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
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
              className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Save & Proceed to Proposal &rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
