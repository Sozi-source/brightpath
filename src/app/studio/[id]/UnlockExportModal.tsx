"use client";

import { useState } from "react";
import { Lock, Sparkles, CheckCircle2, FileText, Download, Loader2, ShieldCheck, X } from "lucide-react";

interface UnlockExportModalProps {
  workspaceId: string;
  businessTitle: string;
}

export function UnlockExportModal({ workspaceId, businessTitle }: UnlockExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInitiateUnlock = async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to initialize unlock checkout.");
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No authorization URL returned from payment gateway.");
      }
    } catch (err) {
      console.error("Unlock checkout error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Payment checkout could not be reached. Please try again."
      );
      setIsInitializing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3.5 py-1.5 text-xs shadow-xs transition-colors cursor-pointer"
      >
        <Lock className="h-3.5 w-3.5" />
        <span>Unlock KNEC Export (KES 350)</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isInitializing && setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-150 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => !isInitializing && setIsOpen(false)}
              disabled={isInitializing}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Badge & Title */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e8f5f5] text-[#087f8c] border border-[#d8ebec] uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>Official KNEC Export License</span>
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Unlock Official KNEC Export
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download fully formatted Word (.docx) and PDF copies of{" "}
                <span className="font-semibold text-slate-800">&ldquo;{businessTitle}&rdquo;</span>, ready for printing, spiral binding, and submission to your supervisor.
              </p>
            </div>

            {/* What is Included */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Included in Your Export Package
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Microsoft Word (.docx) Editable Copy:</strong> Standard KNEC headings, margins (1.5 inch left for binding), double line spacing, and page numbers.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Official PDF Copy:</strong> Clean layout with formal title page, student declaration, preliminary tables, and formatted financial schedules.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Lifetime Workspace Access:</strong> Rebuild or tweak your business plan as many times as you like and re-download anytime without paying again.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#087f8c] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">KNEC Examination Ready:</strong> Formatted specifically for Kenyan TVET Craft Certificate and Diploma series guidelines.
                  </span>
                </li>
              </ul>
            </div>

            {/* Price & Checkout Action */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    One-Time Export Fee
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-950">KES 350</span>
                    <span className="text-[11px] text-slate-500">M-Pesa STK Push / Card</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateUnlock}
                  disabled={isInitializing}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-2.5 text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Connecting to M-Pesa...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Pay KES 350 via M-Pesa</span>
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <p className="text-[11px] text-center text-slate-400">
                Fast &amp; secure checkout powered by Paystack. Instant M-Pesa prompt sent directly to your phone.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
