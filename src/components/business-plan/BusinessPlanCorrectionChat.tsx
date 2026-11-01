"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import {
  applyBusinessPlanCorrectionProposalAction,
  chatAboutBusinessPlanFindingAction,
} from "@/app/studio/actions";
import type { BusinessPlanAIProvider } from "@/lib/studio/businessPlanGeneration";

type Message = { role: "user" | "assistant"; content: string };

export function BusinessPlanCorrectionChat({
  workspaceId,
  sectionKey,
  sectionTitle,
  issue,
  recommendation,
  provider,
}: {
  workspaceId: string;
  sectionKey: string;
  sectionTitle: string;
  issue: string;
  recommendation: string;
  provider: BusinessPlanAIProvider;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [proposal, setProposal] = useState("");
  const [baseText, setBaseText] = useState("");
  const [baseUpdatedAt, setBaseUpdatedAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isFinancialSection = sectionKey.startsWith("ch5.");

  const send = async () => {
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setQuestion("");
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    try {
      const formData = new FormData();
      formData.set("workspaceId", workspaceId);
      formData.set("sectionKey", sectionKey);
      formData.set("issue", issue);
      formData.set("recommendation", recommendation);
      formData.set("provider", provider);
      formData.set("messages", JSON.stringify(nextMessages));
      formData.set("currentProposal", proposal);
      const result = await chatAboutBusinessPlanFindingAction(formData);
      if (baseUpdatedAt && baseUpdatedAt !== result.baseUpdatedAt) {
        setProposal("");
        setConfirmed(false);
        setError("The section changed during this chat. The old proposal was cleared; review the latest text and ask again.");
      } else {
        setBaseText(result.baseText);
        setBaseUpdatedAt(result.baseUpdatedAt);
        if (result.proposedText) setProposal(result.proposedText);
        setConfirmed(false);
      }
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The correction chat could not respond.");
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!confirmed || !proposal.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("workspaceId", workspaceId);
      formData.set("sectionKey", sectionKey);
      formData.set("baseText", baseText);
      formData.set("baseUpdatedAt", baseUpdatedAt);
      formData.set("proposedText", proposal);
      await applyBusinessPlanCorrectionProposalAction(formData);
      setSaved(true);
      setProposal("");
      setConfirmed(false);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not apply this correction.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      {isFinancialSection ? (
        <p className="rounded-md bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
          AI edits are disabled for financial statements and calculated totals. Review assumptions with the supervisor.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {open ? "Close correction chat" : "Discuss and correct"}
          </button>

          {open && (
            <div className="mt-2 space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white p-1.5 text-indigo-700"><Sparkles className="h-3.5 w-3.5" /></span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Correction chat</p>
                  <p className="text-[10px] text-slate-600">Focused on {sectionTitle}. Your text changes only after confirmation.</p>
                </div>
              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto" aria-live="polite">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`max-w-[95%] rounded-lg px-2.5 py-2 text-xs ${message.role === "user" ? "ml-auto bg-indigo-700 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                    {message.content}
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600">
                    Finding: {issue}<br />Suggested action: {recommendation}
                  </p>
                )}
              </div>

              <div className="flex items-end gap-2">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
                  rows={2}
                  maxLength={1500}
                  aria-label={`Ask about the ${sectionTitle} correction`}
                  placeholder="Ask about this finding or request a specific edit…"
                  className="min-h-10 flex-1 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button type="button" onClick={() => void send()} disabled={busy || !question.trim()} className="inline-flex h-9 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Send
                </button>
              </div>

              {proposal && (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900"><Check className="h-3.5 w-3.5 text-emerald-700" /> Proposed section edit</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Before</p>
                      <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-md bg-rose-50 p-2 text-[10px] leading-4 text-slate-700">{baseText}</pre>
                    </div>
                    <div>
                      <label htmlFor={`proposal-${sectionKey}`} className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">After · editable</label>
                      <textarea id={`proposal-${sectionKey}`} value={proposal} onChange={(event) => { setProposal(event.target.value); setConfirmed(false); }} rows={7} maxLength={30000} className="max-h-36 min-h-24 w-full resize-y overflow-auto rounded-md border border-emerald-200 bg-emerald-50/50 p-2 text-[10px] leading-4 text-slate-800" />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-[11px] text-slate-700">
                    <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 accent-indigo-600" />
                    I reviewed this edit and want to replace the current section text.
                  </label>
                  <button type="button" onClick={() => void apply()} disabled={!confirmed || busy} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                    {busy ? "Saving…" : "Apply correction"}
                  </button>
                </div>
              )}

              {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-800">{error}</p>}
              {saved && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800">Correction applied. The previous version remains in section history.</p>}
              <p className="text-[10px] text-slate-500">AI suggestions are not verified evidence. Check facts before applying.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
