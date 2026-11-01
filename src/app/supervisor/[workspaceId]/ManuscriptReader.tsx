"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { FileText } from "lucide-react";
import { SectionReviewThreads, type ReviewSelection } from "./SectionReviewThreads";
import styles from "./ManuscriptReader.module.css";
import type { SectionReviewThread, UserRole } from "@/types/database";

export interface ManuscriptSection {
  key: string;
  title: string;
  text: string;
  updatedAt: string;
  threads: SectionReviewThread[];
}

export interface ManuscriptChapter {
  key: string;
  title: string;
  sections: ManuscriptSection[];
  words: number;
}

function anchor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function splitMarkdownTables(markdown: string) {
  const lines = markdown.split("\n");
  const parts: ({ type: "markdown"; value: string } | { type: "table"; rows: string[][] })[] = [];
  let prose: string[] = [];
  let index = 0;
  const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());

  while (index < lines.length) {
    const nextLine = lines[index + 1] || "";
    const isTableStart = lines[index].includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(nextLine);
    if (!isTableStart) {
      prose.push(lines[index]);
      index += 1;
      continue;
    }

    if (prose.some((line) => line.trim())) parts.push({ type: "markdown", value: prose.join("\n") });
    prose = [];
    const rows = [cells(lines[index])];
    index += 2;
    while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
      rows.push(cells(lines[index]));
      index += 1;
    }
    parts.push({ type: "table", rows });
  }

  if (prose.some((line) => line.trim())) parts.push({ type: "markdown", value: prose.join("\n") });
  return parts;
}

function ManuscriptText({ text }: { text: string }) {
  return <>
    {splitMarkdownTables(text).map((part, index) => part.type === "markdown" ? (
      <ReactMarkdown key={index} rehypePlugins={[rehypeSanitize]}>{part.value}</ReactMarkdown>
    ) : (
      <div key={index} className="my-4 overflow-x-auto">
        <table>
          <thead><tr>{part.rows[0].map((cell, cellIndex) => <th key={cellIndex}><InlineMarkdown text={cell} /></th>)}</tr></thead>
          <tbody>{part.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{part.rows[0].map((_, cellIndex) => <td key={cellIndex}><InlineMarkdown text={row[cellIndex] || ""} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    ))}
  </>;
}

function InlineMarkdown({ text }: { text: string }) {
  return <ReactMarkdown
    rehypePlugins={[rehypeSanitize]}
    components={{ p: ({ children }) => <>{children}</> }}
  >{text}</ReactMarkdown>;
}

export function ManuscriptReader({
  workspaceId,
  title,
  institution,
  candidate,
  admissionNumber,
  course,
  level,
  planType,
  totalWords,
  chapters,
  viewerRole,
  canReview,
  canReply,
}: {
  workspaceId: string;
  title: string;
  institution: string;
  candidate: string;
  admissionNumber: string;
  course: string;
  level: string;
  planType: string;
  totalWords: number;
  chapters: ManuscriptChapter[];
  viewerRole: UserRole;
  canReview: boolean;
  canReply: boolean;
}) {
  const [selection, setSelection] = useState<ReviewSelection | null>(null);

  function captureSelection(article: HTMLElement) {
    const current = window.getSelection();
    const quotedText = current?.toString().trim() || "";
    const range = current?.rangeCount ? current.getRangeAt(0) : null;
    const parent = range?.commonAncestorContainer.parentElement;
    const section = parent?.closest<HTMLElement>("[data-section-key]");
    if (!quotedText) return;
    if (!range || !section || !article.contains(section) || quotedText.length > 1000) {
      setSelection(null);
      return;
    }
    try {
      const before = document.createRange();
      before.selectNodeContents(section);
      before.setEnd(range.startContainer, range.startOffset);
      const after = document.createRange();
      after.selectNodeContents(section);
      after.setStart(range.endContainer, range.endOffset);
      setSelection({
        sectionKey: section.dataset.sectionKey || "",
        sectionUpdatedAt: section.dataset.sectionUpdatedAt || "",
        quotedText,
        contextBefore: before.toString().slice(-160),
        contextAfter: after.toString().slice(0, 160),
      });
    } catch {
      setSelection(null);
    }
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex h-1.5 w-full overflow-hidden rounded-t-xl"><div className="w-[60%] bg-blue-600" /><div className="w-[40%] bg-amber-400" /></div>
      <div className="min-w-0 bg-[#f4f7fb] p-3 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-end gap-3">
            <span className="text-[11px] font-medium text-slate-500">{chapters.length} chapters <span aria-hidden="true">·</span> {totalWords.toLocaleString()} words</span>
          </div>

          <article onMouseUp={(event) => captureSelection(event.currentTarget)} onKeyUp={(event) => captureSelection(event.currentTarget)} className="rounded-lg border border-slate-200 bg-white px-5 py-7 shadow-xs sm:px-10 sm:py-10">
            <header className="mb-8 border-b-2 border-slate-200 pb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{institution}</p>
              <h1 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-800">{candidate} <span className="font-normal text-slate-500">({admissionNumber})</span></p>
              <p className="mt-1 text-xs text-slate-600">{course} <span aria-hidden="true">·</span> {level} Level <span aria-hidden="true">·</span> {planType}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">{chapters.length} chapters</span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono">{totalWords.toLocaleString()} words</span>
              </div>
            </header>

            <div className="space-y-10">
              {chapters.map((chapter, chapterIndex) => <section key={chapter.key} id={`chapter-${anchor(chapter.key)}`} className="scroll-mt-4">
                <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-slate-300 pb-2">
                  <h2 className="border-l-[3px] border-indigo-600 pl-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{chapter.title}</h2>
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">{chapter.words} words</span>
                </div>
                <div className="space-y-7">
                  {chapter.sections.map((section) => <section key={section.key} id={`section-${anchor(section.key)}`} data-section-key={section.key} data-section-updated-at={section.updatedAt} className="scroll-mt-4">
                    <h3 className="mb-3 border-b border-slate-200 pb-2 text-base font-semibold tracking-tight text-indigo-900 sm:text-lg">{section.title}</h3>
                    {section.text.trim() ? <div className={styles.manuscript}><ManuscriptText text={section.text} /></div> : <p className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500"><FileText className="h-4 w-4" />Not yet drafted by candidate</p>}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <SectionReviewThreads
                        workspaceId={workspaceId}
                        sectionKey={section.key}
                        threads={section.threads}
                        viewerRole={viewerRole}
                        canReview={canReview}
                        canReply={canReply}
                        currentSectionUpdatedAt={section.updatedAt}
                        selection={selection}
                        onClearSelection={() => { setSelection(null); window.getSelection()?.removeAllRanges(); }}
                      />
                    </div>
                  </section>)}
                </div>
                {chapterIndex < chapters.length - 1 && <div className="mt-8 border-b border-slate-200" />}
              </section>)}
            </div>
          </article>
          </div>
      </div>
    </div>
  );
}
