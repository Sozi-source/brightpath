"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Loader2, ArrowLeft, Database } from "lucide-react";
import { RESEARCH_TOPIC_CATALOGUE } from "@/lib/studio/researchTopics";
import { createAndBuildResearchWorkspace } from "../../actions";

interface ResearchNewClientProps {
  isAdmin: boolean;
  defaultAdmissionNumber: string;
  defaultLevel: "craft" | "diploma";
}

const DOMAIN_LABELS: Record<string, string> = {
  ALL: "All Domains",
  child_malnutrition: "Child Malnutrition",
  iycf_feeding: "Infant & Young Child Feeding",
  maternal_nutrition: "Maternal Nutrition",
  micronutrients: "Micronutrients",
  food_security: "Food Security",
  child_health: "Child Health & Survival",
};

export function ResearchNewClient({
  isAdmin,
  defaultAdmissionNumber,
  defaultLevel,
}: ResearchNewClientProps) {
  const [domain, setDomain] = useState("ALL");
  const [topicId, setTopicId] = useState(RESEARCH_TOPIC_CATALOGUE[0].id);
  const [level, setLevel] = useState<"craft" | "diploma">(defaultLevel);
  const [kind, setKind] = useState<"full" | "proposal">("full");
  const [customTitle, setCustomTitle] = useState("");
  const [dedicationText, setDedicationText] = useState("");
  const [acknowledgementsText, setAcknowledgementsText] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState(defaultAdmissionNumber);
  const [supervisorName, setSupervisorName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTopics =
    domain === "ALL"
      ? RESEARCH_TOPIC_CATALOGUE
      : RESEARCH_TOPIC_CATALOGUE.filter((t) => t.domain === domain);

  const selectedTopic =
    RESEARCH_TOPIC_CATALOGUE.find((t) => t.id === topicId) || RESEARCH_TOPIC_CATALOGUE[0];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("level", level);
    fd.set("topicId", topicId);
    fd.set("kind", kind);
    if (customTitle.trim()) fd.set("customTitle", customTitle.trim());
    if (dedicationText.trim()) fd.set("dedicationText", dedicationText.trim());
    if (acknowledgementsText.trim()) fd.set("acknowledgementsText", acknowledgementsText.trim());
    if (!isAdmin) {
      fd.set("admissionNumber", admissionNumber);
      if (supervisorName.trim()) fd.set("supervisorName", supervisorName.trim());
    }

    startTransition(async () => {
      try {
        await createAndBuildResearchWorkspace(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not build research project.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Studio</span>
        </Link>
        <Link
          href="/studio/new"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>Switch to Business Plan Builder</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bp-card overflow-hidden">
        <div className="h-1 flex w-full">
          <div className="w-[60%] bg-blue-700" />
          <div className="w-[40%] bg-amber-500" />
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Research Project Builder
                </h1>
                <p className="text-xs text-slate-500">
                  KNEC secondary-data research using verified Kenya survey indicators.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isAdmin ? "Marketplace Master Mode" : "Verified World Bank / KDHS Data"}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Qualification Level
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as "craft" | "diploma")}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
              >
                <option value="craft">Certificate / Craft (Max 30-35 pages)</option>
                <option value="diploma">Diploma (Max 45 pages)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Build Scope
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as "full" | "proposal")}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
              >
                <option value="full">Full Project Report (Chapters 1-5)</option>
                <option value="proposal">Proposal Only (Chapters 1-3)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Research Domain
              <select
                value={domain}
                onChange={(e) => {
                  const next = e.target.value;
                  setDomain(next);
                  const first =
                    next === "ALL"
                      ? RESEARCH_TOPIC_CATALOGUE[0]
                      : RESEARCH_TOPIC_CATALOGUE.find((t) => t.domain === next);
                  if (first) setTopicId(first.id);
                }}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
              >
                {Object.entries(DOMAIN_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Select Topic Blueprint
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
              >
                {filteredTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">
                Course: {selectedTopic.course} ({selectedTopic.yearFrom}-{selectedTopic.yearTo})
              </div>
              <div>{selectedTopic.problemContext}</div>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Custom Title (Optional)
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={selectedTopic.title}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
          </div>

          {!isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Admission / Index Number
                <input
                  type="text"
                  required
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="e.g. HND/2026/014"
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Supervisor Name (Optional)
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="Project Supervisor"
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Dedication (Optional)
              <textarea
                rows={2}
                value={dedicationText}
                onChange={(e) => setDedicationText(e.target.value)}
                placeholder="Write a short personal dedication."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Acknowledgements (Optional)
              <textarea
                rows={2}
                value={acknowledgementsText}
                onChange={(e) => setAcknowledgementsText(e.target.value)}
                placeholder="Thank the people and institutions that supported your project."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/studio"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 bp-btn-primary px-5 py-2 text-xs shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Building Research Project...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Build Research Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
