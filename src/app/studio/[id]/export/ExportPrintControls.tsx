"use client";

import { Printer, FileDown, ClipboardCheck } from "lucide-react";

interface ExportPrintControlsProps {
  workspaceId: string;
}

export function ExportPrintControls({ workspaceId }: ExportPrintControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <a
        href={`/api/studio/${workspaceId}/export?doc=report`}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
      >
        <FileDown className="h-4 w-4" />
        <span>Download Report (.doc)</span>
      </a>

      <a
        href={`/api/studio/${workspaceId}/export?doc=annex12`}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-xs transition-colors"
      >
        <ClipboardCheck className="h-4 w-4 text-indigo-600" />
        <span>Annex 12 Logbook (.doc)</span>
      </a>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors cursor-pointer"
      >
        <Printer className="h-4 w-4 text-slate-600" />
        <span>Print / Save PDF</span>
      </button>
    </div>
  );
}
