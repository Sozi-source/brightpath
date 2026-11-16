/**
 * Page budget and polish pipeline shared by the business plan and research builders.
 *
 * Marketplace documents are capped so they read as clean, finished work:
 *   Certificate (craft): aim for 30 pages, hard limit 35.
 *   Diploma:             aim for 42 pages, hard limit 45.
 *
 * Page counts come from the same layout simulation that drives the Word table of
 * contents, so the estimate matches the exported document.
 */
import { computeBusinessPlanLayout } from "./businessPlanDocx";

export type BudgetLevel = "craft" | "diploma";

export const PAGE_BUDGET: Record<BudgetLevel, { target: number; max: number }> = {
  craft: { target: 30, max: 35 },
  diploma: { target: 42, max: 45 },
};

export interface BudgetSection {
  section_key: string;
  title: string;
  content: string;
  wordCount?: number;
}

export interface FitOptions {
  /** Sections whose prose must never be shortened (front matter, references, key tables). */
  protectedKeys?: (string | RegExp)[];
  /** Sections dropped, in order, only if prose trimming cannot reach the target. */
  optionalKeys?: string[];
  /** Section that keeps one copy of any boilerplate paragraph that repeats across sections. */
  boilerplateAnchorKey?: string;
  /** Layout hook. Defaults to the Word layout simulation. */
  estimate?: (sections: { title: string; content: string }[]) => number;
}

export interface FitResult<T extends BudgetSection> {
  sections: T[];
  pages: number;
  target: number;
  max: number;
  withinTarget: boolean;
  withinMax: boolean;
  passes: string[];
}

export function normalizeBudgetLevel(level: string | null | undefined): BudgetLevel {
  return /diploma/i.test(level || "") ? "diploma" : "craft";
}

export function estimatePageCount(sections: { title: string; content: string }[]): number {
  return computeBusinessPlanLayout(sections).totalPages;
}

export function countWords(text: string): number {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[|#*`>_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Block helpers
// ---------------------------------------------------------------------------

function isStructural(line: string): boolean {
  const t = line.trim();
  return (
    !t ||
    t.startsWith("#") ||
    t.startsWith("|") ||
    t.startsWith("```") ||
    /^[-*+]\s+/.test(t) ||
    /^\d+[.)]\s+/.test(t) ||
    /^(---+|\*\*\*+)$/.test(t) ||
    /<br\s*\/?>/i.test(t)
  );
}

/** Splits text into sentences without breaking on common abbreviations. */
export function splitSentences(paragraph: string): string[] {
  const raw = paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9“"‘'(\[])/);
  const out: string[] = [];
  for (const piece of raw) {
    const prev = out[out.length - 1];
    if (prev && /\b(?:e\.g|i\.e|etc|vs|no|dr|mr|mrs|ms|approx|fig|ltd|co|inc|cf|ca|sec|vol)\.$/i.test(prev)) {
      out[out.length - 1] = `${prev} ${piece}`;
    } else {
      out.push(piece);
    }
  }
  return out;
}

function trimParagraph(paragraph: string, maxWords: number): string {
  if (countWords(paragraph) <= maxWords) return paragraph;
  const sentences = splitSentences(paragraph);
  if (sentences.length <= 1) return paragraph;
  const kept: string[] = [];
  let words = 0;
  for (const sentence of sentences) {
    const w = countWords(sentence);
    if (kept.length > 0 && words + w > maxWords) break;
    kept.push(sentence);
    words += w;
  }
  return kept.join(" ");
}

function normalizeForCompare(paragraph: string): string {
  return paragraph.replace(/\*\*/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Polish: bold discipline and boilerplate removal
// ---------------------------------------------------------------------------

/**
 * Removes inline bold from prose, lists and headings. Bold survives only on the
 * label cell of total / net / grand-total table rows, where it aids scanning.
 */
export function reduceBold(content: string): string {
  return content
    .replace(/<\/?(?:strong|b)>/gi, "")
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (t.startsWith("|")) {
        const cells = t.replace(/^\|/, "").replace(/\|$/, "").split("|");
        const isDivider = cells.every((c) => /^\s*:?-{3,}:?\s*$/.test(c));
        if (isDivider) return line;
        const first = (cells[0] || "").replace(/\*\*/g, "").trim();
        const keepBold = /^(?:total|net|gross profit|grand total|closing)\b/i.test(first);
        return `|${cells
          .map((c, i) => {
            const plain = c.replace(/\*\*/g, "");
            return i === 0 && keepBold ? ` **${plain.trim()}** ` : plain;
          })
          .join("|")}|`;
      }
      return line.replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/\*\*/g, "");
    })
    .join("\n");
}

function tidyBlankLines(content: string): string {
  return content.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Finds paragraphs that repeat verbatim in three or more sections (boilerplate
 * disclaimers) and keeps a single copy.
 */
function dedupeBoilerplate<T extends BudgetSection>(sections: T[], anchorKey?: string): T[] {
  const occurrences = new Map<string, Set<string>>();
  for (const section of sections) {
    for (const paragraph of section.content.split(/\n{2,}/)) {
      const p = paragraph.trim();
      if (!p || isStructural(p) || countWords(p) < 12) continue;
      const key = normalizeForCompare(p);
      if (!occurrences.has(key)) occurrences.set(key, new Set());
      occurrences.get(key)!.add(section.section_key);
    }
  }
  const boilerplate = new Map<string, string>();
  for (const [key, keys] of occurrences) {
    if (keys.size >= 3) boilerplate.set(key, "");
  }
  if (boilerplate.size === 0) return sections;

  const kept = new Set<string>();
  const anchor = anchorKey && sections.some((s) => s.section_key === anchorKey) ? anchorKey : undefined;
  return sections.map((section) => {
    const paragraphs = section.content.split(/\n{2,}/);
    const next: string[] = [];
    for (const paragraph of paragraphs) {
      const key = normalizeForCompare(paragraph);
      if (!boilerplate.has(key)) {
        next.push(paragraph);
        continue;
      }
      const isAnchorHere = anchor ? section.section_key === anchor : !kept.has(key);
      if (isAnchorHere && !kept.has(key)) {
        kept.add(key);
        next.push(paragraph);
      }
    }
    const content = tidyBlankLines(next.join("\n\n"));
    return { ...section, content, wordCount: countWords(content) };
  });
}

function isProtected(key: string, protectedKeys: (string | RegExp)[] = []): boolean {
  return protectedKeys.some((p) => (typeof p === "string" ? p === key : p.test(key)));
}

function trimSectionProse<T extends BudgetSection>(
  section: T,
  maxWords: number,
  maxProseBlocks?: number,
  maxListItems?: number
): T {
  const blocks = section.content.split(/\n{2,}/);
  let firstProse = true;
  let proseCount = 0;
  const next: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const hasStructural = lines.some((l) => isStructural(l));
    if (hasStructural) {
      if (maxListItems && lines.every((l) => !l.trim() || /^[-*+]\s+/.test(l.trim()) || /^\d+[.)]\s+/.test(l.trim()))) {
        next.push(lines.filter((l) => l.trim()).slice(0, maxListItems).join("\n"));
      } else {
        next.push(block);
      }
      continue;
    }
    proseCount += 1;
    if (maxProseBlocks && proseCount > maxProseBlocks) continue;
    const trimmed = trimParagraph(block.trim(), firstProse ? Math.round(maxWords * 1.2) : maxWords);
    firstProse = false;
    next.push(trimmed);
  }
  const content = tidyBlankLines(next.join("\n\n"));
  return { ...section, content, wordCount: countWords(content) };
}

// ---------------------------------------------------------------------------
// Fit pipeline
// ---------------------------------------------------------------------------

export function polishSections<T extends BudgetSection>(sections: T[], opts: FitOptions = {}): T[] {
  const deduped = dedupeBoilerplate(sections, opts.boilerplateAnchorKey);
  return deduped.map((section) => {
    const content = tidyBlankLines(reduceBold(section.content));
    return { ...section, content, wordCount: countWords(content) };
  });
}

export function fitToPageBudget<T extends BudgetSection>(
  rawSections: T[],
  levelInput: string | null | undefined,
  opts: FitOptions = {}
): FitResult<T> {
  const level = normalizeBudgetLevel(levelInput);
  const { target, max } = PAGE_BUDGET[level];
  const estimate = opts.estimate || estimatePageCount;
  const passes: string[] = ["polish"];
  let sections = polishSections(rawSections, opts);
  const pages = () => estimate(sections.map((s) => ({ title: s.title, content: s.content })));
  let current = pages();

  for (const cap of [150, 120, 100, 80, 65]) {
    if (current <= target) break;
    const maxProseBlocks = cap <= 80 ? 2 : undefined;
    const maxListItems = cap <= 65 ? 5 : undefined;
    sections = sections.map((s) =>
      isProtected(s.section_key, opts.protectedKeys)
        ? s
        : trimSectionProse(s, cap, maxProseBlocks, maxListItems)
    );
    passes.push(`trim-prose-${cap}`);
    current = pages();
  }

  for (const key of opts.optionalKeys || []) {
    if (current <= target) break;
    if (!sections.some((s) => s.section_key === key)) continue;
    sections = sections.filter((s) => s.section_key !== key);
    passes.push(`drop-${key}`);
    current = pages();
  }

  if (current > max) {
    for (const cap of [50, 40]) {
      if (current <= target) break;
      sections = sections.map((s) =>
        isProtected(s.section_key, opts.protectedKeys) ? s : trimSectionProse(s, cap, 1, 4)
      );
      passes.push(`compact-${cap}`);
      current = pages();
    }
  }

  return {
    sections,
    pages: current,
    target,
    max,
    withinTarget: current <= target,
    withinMax: current <= max,
    passes,
  };
}
