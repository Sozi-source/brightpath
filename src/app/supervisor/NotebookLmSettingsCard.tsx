"use client";

import { useState, useTransition } from "react";
import { BookOpen, ExternalLink, Save, ChevronDown, ChevronUp, Check } from "lucide-react";
import { saveNotebookLmLinks } from "./actions";

interface NotebookLmSettingsCardProps {
  notebookUrl: string;
}

export function NotebookLmSettingsCard({
  notebookUrl: initialUrl,
}: NotebookLmSettingsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notebookUrl, setNotebookUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLinked = Boolean(notebookUrl.trim());

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveNotebookLmLinks(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save NotebookLM link.");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-900">
                Master Google NotebookLM Library
              </span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  isLinked
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {isLinked ? "Linked" : "Not Linked"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Shared reference notebook accessible across all student workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
          <span>{isOpen ? "Hide" : "Configure"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <form
          onSubmit={handleSave}
          className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-3"
        >
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="notebookUrl"
              className="block text-xs font-semibold text-slate-800 mb-1"
            >
              Shared Google NotebookLM URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="notebookUrl"
                name="notebookUrl"
                type="url"
                value={notebookUrl}
                onChange={(e) => setNotebookUrl(e.target.value)}
                placeholder="https://notebooklm.google.com/notebook/..."
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isPending ? "Saving..." : saved ? "Saved ✓" : "Save Link"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href={notebookUrl.trim() || "https://notebooklm.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800"
            >
              <span>Open Master Notebook on Google NotebookLM</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
