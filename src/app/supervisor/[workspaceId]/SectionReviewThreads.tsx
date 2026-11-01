"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Check, CircleHelp, FilePenLine, MessageSquareText, RotateCcw, Send } from "lucide-react";
import { createSectionReviewThread, replyToSectionReviewThread, setSectionReviewThreadStatus } from "@/app/supervisor/actions";
import type { SectionReviewKind, SectionReviewThread, UserRole } from "@/types/database";

export interface ReviewSelection {
  sectionKey: string;
  sectionUpdatedAt: string;
  quotedText: string;
  contextBefore: string;
  contextAfter: string;
}

const kindLabels: Record<SectionReviewKind, string> = {
  correction: "Correction",
  evidence: "Evidence",
  question: "Question",
  structure: "Structure",
};

function statusLabel(status: SectionReviewThread["status"]) {
  if (status === "resolved") return "Resolved";
  if (status === "answered") return "Student replied";
  return "Needs response";
}

export function SectionReviewThreads({
  workspaceId,
  sectionKey,
  threads,
  viewerRole,
  canReview,
  currentSectionUpdatedAt,
  onApplySuggestion,
  canReply = true,
  selection = null,
  onClearSelection,
}: {
  workspaceId: string;
  sectionKey: string;
  threads: SectionReviewThread[];
  viewerRole: UserRole;
  canReview: boolean;
  currentSectionUpdatedAt?: string;
  onApplySuggestion?: (quotedText: string, suggestedText: string) => boolean;
  canReply?: boolean;
  selection?: ReviewSelection | null;
  onClearSelection?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  function run(formData: FormData, action: (data: FormData) => Promise<void>, success: string, after?: () => void) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        await action(formData);
        setNotice(success);
        after?.();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save the review update.");
      }
    });
  }

  function createComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || selection.sectionKey !== sectionKey) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspaceId", workspaceId);
    formData.set("sectionKey", sectionKey);
    formData.set("quotedText", selection.quotedText);
    formData.set("contextBefore", selection.contextBefore);
    formData.set("contextAfter", selection.contextAfter);
    formData.set("sectionUpdatedAt", selection.sectionUpdatedAt);
    run(formData, createSectionReviewThread, "Comment added.", () => {
      form.reset();
      setShowComposer(false);
      onClearSelection?.();
    });
  }

  function reply(event: FormEvent<HTMLFormElement>, threadId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspaceId", workspaceId);
    formData.set("threadId", threadId);
    run(formData, replyToSectionReviewThread, "Reply sent.", () => form.reset());
  }

  function changeStatus(threadId: string, status: "open" | "resolved") {
    const formData = new FormData();
    formData.set("workspaceId", workspaceId);
    formData.set("threadId", threadId);
    formData.set("status", status);
    run(formData, setSectionReviewThreadStatus, status === "resolved" ? "Comment resolved." : "Comment reopened.");
  }

  return <div className="space-y-3">
    {canReview && selection?.sectionKey === sectionKey && <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-3">
      {!showComposer ? <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-indigo-900">Selected text is ready for a targeted comment.</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowComposer(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"><MessageSquareText className="h-3.5 w-3.5" />Add comment</button>
          <button type="button" onClick={onClearSelection} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </div> : <form onSubmit={createComment} className="space-y-2.5">
        <blockquote className="border-l-2 border-indigo-400 pl-3 text-xs leading-relaxed text-slate-700">“{selection.quotedText}”</blockquote>
        <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
          <label className="grid gap-1 text-[11px] font-semibold text-slate-700">Feedback type
            <select name="kind" className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs font-normal text-slate-800">
              {Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-[11px] font-semibold text-slate-700">Comment
            <textarea name="body" required maxLength={2000} rows={2} placeholder="State the specific change or question" className="rounded-lg border border-slate-300 bg-white p-2 text-xs font-normal text-slate-800" />
          </label>
        </div>
        <label className="grid gap-1 text-[11px] font-semibold text-slate-700">Suggested replacement <span className="font-normal text-slate-500">Optional</span>
          <textarea name="suggestedText" maxLength={5000} rows={2} placeholder="Offer sample wording when useful" className="rounded-lg border border-slate-300 bg-white p-2 text-xs font-normal text-slate-800" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowComposer(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">Cancel</button>
          <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><Send className="h-3.5 w-3.5" />{pending ? "Saving…" : "Save comment"}</button>
        </div>
      </form>}
    </div>}

    {threads.length > 0 && <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><FilePenLine className="h-3.5 w-3.5 text-indigo-700" />Review comments <span className="font-mono text-slate-500">{threads.length}</span></h4>
      {threads.map((thread) => <article key={thread.id} className={`rounded-lg border p-3 ${thread.status === "resolved" ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-700">{kindLabels[thread.kind]}</span>
            <span className={`text-[10px] font-semibold ${thread.status === "resolved" ? "text-emerald-800" : thread.status === "answered" ? "text-indigo-800" : "text-amber-900"}`}>{statusLabel(thread.status)}</span>
            <span className="text-[10px] text-slate-600">{thread.author_name} · {thread.author_role === "student" ? "Candidate" : thread.author_role === "admin" ? "Administrator" : "Supervisor"}</span>
            <span className="text-[10px] text-slate-500">{thread.replies.length} replies</span>
          </div>
          <span className="text-[10px] text-slate-500">{new Date(thread.created_at).toLocaleDateString()}</span>
        </div>
        <blockquote className="mt-2 border-l-2 border-slate-300 pl-2.5 text-xs leading-relaxed text-slate-700">“{thread.quoted_text}”</blockquote>
        {currentSectionUpdatedAt && currentSectionUpdatedAt !== thread.section_updated_at && <p className="mt-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-900">Section edited since this comment. Verify the quote in the current draft.</p>}
        {(thread.context_before || thread.context_after) && <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{thread.context_before} <span className="font-medium text-slate-700">{thread.quoted_text}</span> {thread.context_after}</p>}
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-800">{thread.body}</p>
        {thread.suggested_text && <div className="mt-2 rounded-md border border-indigo-100 bg-white p-2"><p className="text-[10px] font-semibold text-indigo-800">Suggested replacement</p><p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">{thread.suggested_text}</p>{viewerRole === "student" && canReply && thread.status !== "resolved" && onApplySuggestion && <button type="button" onClick={() => setNotice(onApplySuggestion(thread.quoted_text, thread.suggested_text || "") ? "Suggestion inserted into the unsaved draft. Save your section and reply." : "The quote does not appear exactly once in this draft. Copy the suggested wording into the section manually.")} className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100">Use suggestion in draft</button>}</div>}
        {thread.replies.length > 0 && <div className="mt-3 space-y-2 border-l border-slate-200 pl-3">
          {thread.replies.map((item) => <div key={item.id} className="rounded-md bg-white/80 p-2">
            <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-slate-700">{item.author_name} <span className="font-normal text-slate-500">· {item.author_role === "student" ? "Candidate" : item.author_role === "admin" ? "Administrator" : "Supervisor"}</span></span><time className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString()}</time></div>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{item.body}</p>
          </div>)}
        </div>}
        {canReply && thread.status !== "resolved" && (viewerRole === "student" || canReview) && <form onSubmit={(event) => reply(event, thread.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input name="body" required maxLength={2000} placeholder={viewerRole === "student" ? "Reply or describe your revision" : "Add a follow-up"} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800" />
          <button disabled={pending} type="submit" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Send className="h-3.5 w-3.5" />Reply</button>
        </form>}
        {canReview && <div className="mt-2 flex justify-end">
          {thread.status === "resolved" ? <button type="button" onClick={() => changeStatus(thread.id, "open")} className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:underline"><RotateCcw className="h-3 w-3" />Reopen</button> : <button type="button" onClick={() => changeStatus(thread.id, "resolved")} className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline"><Check className="h-3 w-3" />Resolve</button>}
        </div>}
      </article>)}
    </div>}
    {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
    {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{notice}</p>}
    {threads.length === 0 && viewerRole === "student" && <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><CircleHelp className="h-3.5 w-3.5" />No supervisor comments on this section.</p>}
  </div>;
}
