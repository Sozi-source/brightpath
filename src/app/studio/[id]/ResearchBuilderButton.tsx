"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { buildCompleteResearchProjectAction } from "../actions";
import { RESEARCH_TOPIC_CATALOGUE, findBestResearchBlueprint } from "@/lib/studio/researchTopics";

interface ResearchBuilderButtonProps {
  workspaceId: string;
  currentTitle?: string | null;
  hasExistingContent: boolean;
}

export function ResearchBuilderButton({
  workspaceId,
  currentTitle,
  hasExistingContent,
}: ResearchBuilderButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const matched = findBestResearchBlueprint(currentTitle).id;
  const [topicId, setTopicId] = useState(matched);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [dedicationText, setDedicationText] = useState("");
  const [acknowledgementsText, setAcknowledgementsText] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const runBuild = (kind: "proposal" | "full") => {
    setStatusMsg(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("workspaceId", workspaceId);
      fd.set("kind", kind);
      fd.set("topicId", topicId);
      if (dedicationText.trim()) fd.set("dedicationText", dedicationText.trim());
      if (acknowledgementsText.trim()) fd.set("acknowledgementsText", acknowledgementsText.trim());
      fd.set("confirmReplace", hasExistingContent ? "true" : "false");
      const res = await buildCompleteResearchProjectAction(fd);
      if (res && "error" in res && res.error) {
        setStatusMsg(res.error);
      } else if (res && "success" in res && res.success) {
        setStatusMsg(
          kind === "proposal"
            ? `Proposal built (${res.sectionsCount} sections)`
            : `Full project built (${res.sectionsCount} sections)`
        );
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
        aria-label="Research Topic Blueprint"
        className="h-8 max-w-[260px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800"
      >
        {RESEARCH_TOPIC_CATALOGUE.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={isPending}
        onClick={() => runBuild("proposal")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5 text-indigo-600" />}
        <span>Build Proposal</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => runBuild("full")}
        className="inline-flex items-center gap-1.5 bp-btn-primary px-3.5 py-1.5 text-xs shadow-2xs disabled:opacity-50 cursor-pointer"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        <span>{hasExistingContent ? "Rebuild Full Project" : "Build Full Project"}</span>
      </button>

      <button
        type="button"
        onClick={() => setShowPersonalize((v) => !v)}
        className="text-xs font-medium text-indigo-700 hover:underline cursor-pointer"
      >
        {showPersonalize ? "Hide Dedication / Acknowledgements" : "Personalize Preliminaries"}
      </button>

      {statusMsg && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {statusMsg}
        </span>
      )}

      {showPersonalize && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
          <label className="grid gap-1 text-[11px] font-medium text-slate-600">
            Dedication
            <textarea
              rows={2}
              value={dedicationText}
              onChange={(e) => setDedicationText(e.target.value)}
              placeholder="Write a short personal dedication."
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-medium text-slate-600">
            Acknowledgements
            <textarea
              rows={2}
              value={acknowledgementsText}
              onChange={(e) => setAcknowledgementsText(e.target.value)}
              placeholder="Thank the people and institutions that supported your project."
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
            />
          </label>
        </div>
      )}
    </div>
  );
}
