/**
 * Seeded variation and n-gram similarity helpers for the research project builder.
 * Prevents look-alike manuscripts across candidates by varying phrasing, structure,
 * and indicator emphasis deterministically from a candidate/project seed.
 */

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickVariant<T>(seed: string, variants: readonly T[]): T {
  if (variants.length === 0) {
    throw new Error("pickVariant requires at least one variant.");
  }
  const idx = hashSeed(seed) % variants.length;
  return variants[idx];
}

export function orderBySeed<T>(seed: string, items: readonly T[]): T[] {
  const arr = [...items];
  let state = hashSeed(seed) || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function stripNonProse(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      return t && !t.startsWith("|") && !t.startsWith("#") && !t.startsWith("```");
    })
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNgrams(text: string, n: number): Set<string> {
  const words = stripNonProse(text).split(" ").filter(Boolean);
  const set = new Set<string>();
  if (words.length < n) {
    if (words.length > 0) set.add(words.join(" "));
    return set;
  }
  for (let i = 0; i <= words.length - n; i += 1) {
    set.add(words.slice(i, i + n).join(" "));
  }
  return set;
}

/**
 * Computes Jaccard similarity of word n-grams between two prose documents
 * (excluding Markdown tables, headings, and code blocks).
 */
export function ngramOverlap(a: string, b: string, n = 8): number {
  const setA = extractNgrams(a, n);
  const setB = extractNgrams(b, n);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const gram of setA) {
    if (setB.has(gram)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function hasAcceptableUniqueness(
  draft: string,
  existingDrafts: string[],
  threshold = 0.3,
  n = 8
): { ok: boolean; maxOverlap: number } {
  let maxOverlap = 0;
  for (const other of existingDrafts) {
    const score = ngramOverlap(draft, other, n);
    if (score > maxOverlap) maxOverlap = score;
  }
  return { ok: maxOverlap < threshold, maxOverlap };
}
