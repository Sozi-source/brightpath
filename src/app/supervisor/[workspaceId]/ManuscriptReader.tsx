"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ChevronDown, ChevronRight, FileText, ListTree, X } from "lucide-react";
import styles from "./ManuscriptReader.module.css";

export interface ManuscriptSection {
  key: string;
  title: string;
  text: string;
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
          <thead><tr>{part.rows[0].map((cell, cellIndex) => <th key={cellIndex}>{cell}</th>)}</tr></thead>
          <tbody>{part.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{part.rows[0].map((_, cellIndex) => <td key={cellIndex}>{row[cellIndex] || ""}</td>)}</tr>)}</tbody>
        </table>
      </div>
    ))}
  </>;
}

export function ManuscriptReader({
  title,
  institution,
  candidate,
  admissionNumber,
  course,
  level,
  planType,
  totalWords,
  chapters,
}: {
  title: string;
  institution: string;
  candidate: string;
  admissionNumber: string;
  course: string;
  level: string;
  planType: string;
  totalWords: number;
  chapters: ManuscriptChapter[];
}) {
  const [openChapters, setOpenChapters] = useState(() => new Set(chapters.map((chapter) => chapter.key)));
  const [contentsOpen, setContentsOpen] = useState(false);

  function toggleChapter(key: string) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex h-1.5 w-full overflow-hidden rounded-t-xl"><div className="w-[60%] bg-blue-600" /><div className="w-[40%] bg-amber-400" /></div>
      <div className="min-w-0 bg-[#f4f7fb] p-3 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setContentsOpen(true)} aria-expanded={contentsOpen} aria-controls="manuscript-contents" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <ListTree className="h-4 w-4" />Contents
            </button>
            <span className="text-[11px] font-medium text-slate-500">{chapters.length} chapters <span aria-hidden="true">·</span> {totalWords.toLocaleString()} words</span>
          </div>

          {contentsOpen && <div className="fixed inset-0 z-[60]">
            <button type="button" aria-label="Close manuscript contents" onClick={() => setContentsOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-slate-950/30" />
            <aside id="manuscript-contents" role="dialog" aria-modal="true" aria-label="Manuscript contents" className="absolute inset-y-0 left-0 flex w-[min(21rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Manuscript</p><p className="mt-1 text-sm font-semibold text-slate-900">Contents</p></div>
                <button type="button" aria-label="Close contents" onClick={() => setContentsOpen(false)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"><X className="h-4 w-4" /></button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {chapters.map((chapter, index) => {
              const isOpen = openChapters.has(chapter.key);
              const chapterId = `chapter-${anchor(chapter.key)}`;
              return (
                <div key={chapter.key}>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => toggleChapter(chapter.key)} aria-expanded={isOpen} aria-label={`${isOpen ? "Collapse" : "Expand"} ${chapter.title}`} className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <a href={`#${chapterId}`} onClick={() => setContentsOpen(false)} className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                      <span className="mr-1.5 font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, "0")}</span>{chapter.title}
                    </a>
                    <span className="pr-2 font-mono text-[10px] text-slate-500">{chapter.words}</span>
                  </div>
                  {isOpen && <ul className="ml-8 border-l border-slate-200 py-0.5 pl-2">
                    {chapter.sections.map((section) => <li key={section.key}>
                      <a href={`#section-${anchor(section.key)}`} onClick={() => setContentsOpen(false)} className="block truncate rounded-md px-2 py-1.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">{section.title}</a>
                    </li>)}
                  </ul>}
                </div>
              );
            })}
              </nav>
            </aside>
          </div>}

          <article className="rounded-lg border border-slate-200 bg-white px-5 py-7 shadow-xs sm:px-10 sm:py-10">
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
              {chapters.map((chapter, chapterIndex) => <section key={chapter.key} id={`chapter-${anchor(chapter.key)}`} className="scroll-mt-24">
                <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-slate-300 pb-2">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">{chapter.title}</h2>
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">{chapter.words} words</span>
                </div>
                <div className="space-y-7">
                  {chapter.sections.map((section) => <section key={section.key} id={`section-${anchor(section.key)}`} className="scroll-mt-24">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">{section.title}</h3>
                    {section.text.trim() ? <div className={styles.manuscript}><ManuscriptText text={section.text} /></div> : <p className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500"><FileText className="h-4 w-4" />Not yet drafted by candidate</p>}
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
