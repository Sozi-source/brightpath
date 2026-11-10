export const MARKETPLACE_MATERIAL_TYPES = [
  { value: "lecture_notes", label: "Lecture notes" },
  { value: "past_paper", label: "Past papers" },
  { value: "study_guide", label: "Study guides" },
  { value: "reference_book", label: "Reference books" },
  { value: "business_plan", label: "Business plans" },
  { value: "technical_project", label: "Technical projects" },
  { value: "research_project", label: "Research projects" },
  { value: "other", label: "Other materials" },
] as const;

export type MarketplaceMaterialType = (typeof MARKETPLACE_MATERIAL_TYPES)[number]["value"];

export function getMaterialTypeLabel(value: string | null | undefined) {
  return MARKETPLACE_MATERIAL_TYPES.find((item) => item.value === value)?.label || "Learning material";
}

export function isMarketplaceMaterialType(value: string): value is MarketplaceMaterialType {
  return MARKETPLACE_MATERIAL_TYPES.some((item) => item.value === value);
}

/**
 * Extracts the exact, clean business or document title from raw marketplace titles,
 * purging verbose prefixes ("Business Plan for"), regional/county placeholders
 * ("in Regional, County", "in Kiambu"), and syllabus suffixes ("Complete KNEC Business Plan (Craft Certificate & Diploma)").
 */
export function getExactBusinessTitle(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "Learning Resource";

  let title = rawTitle.trim();

  // 1. Strip leading "Business Plan for / on / of / - / :" or "Complete KNEC Business Plan for"
  title = title
    .replace(/^(?:A\s+)?(?:Complete\s+)?(?:KNEC\s+)?(?:5-Chapter\s+)?Business\s+Plan\s+(?:for|on|of|about)?\s*[:—–-]?\s*/i, "")
    .trim();

  // 2. Strip trailing syllabus / format / complete plan annotations
  // e.g. "— Complete KNEC Business Plan...", ". Complete KNEC Business Plan...", "- Complete KNEC..."
  title = title.replace(/(?:[\s—–.-]+|\s+)Complete\s+KNEC\s+Business\s+Plan.*$/i, "");
  title = title.replace(/(?:[\s—–.-]+|\s+)KNEC\s+Business\s+Plan.*$/i, "");
  title = title.replace(/(?:[\s—–.-]+|\s+)Business\s+Plan\b.*$/i, "");

  // 3. Strip qualification badges: (Craft Certificate & Diploma), (Diploma), Certificate & Diploma, etc.
  title = title.replace(/[\s—–.-]*\(?\s*(?:Craft\s+)?Certificate\s*(?:&|and|\/)\s*Diploma\s*\)?/gi, "");
  title = title.replace(/[\s—–.-]*\(?\s*Diploma\s*(?:&|and|\/)\s*(?:Craft\s+)?Certificate\s*\)?/gi, "");
  title = title.replace(/[\s—–.-]*\(?\s*(?:Craft\s+Certificate|Diploma|Higher\s+Diploma|Certificate|Artisan)\s*\)?/gi, "");

  // 4. Strip trailing location clauses (e.g. "in Regional, County", "in Juja, Kiambu", "in Eldoret, Uasin Gishu")
  title = title.replace(/\s+in\s+Regional,\s*County\b.*$/i, "");
  title = title.replace(/\s+Regional,\s*County\b.*$/i, "");

  const lastInIndex = title.lastIndexOf(" in ");
  if (lastInIndex > 0) {
    const afterIn = title.substring(lastInIndex + 4).trim();
    if (
      afterIn.length <= 40 &&
      !/\b(enterprise|ventures?|solutions?|clinic|center|centre|bakery|farms?|services?|shops?|stores?|depot|hub|mills?|consultancy|limited|ltd)\b/i.test(
        afterIn
      )
    ) {
      title = title.substring(0, lastInIndex).trim();
    }
  }

  // Strip trailing County or rogue location commas
  title = title.replace(/,\s*[A-Za-z0-9'.-]+(?:\s+[A-Za-z0-9'.-]+)?\s+County$/i, "");

  // 5. Clean trailing/leading punctuation
  title = title.replace(/^[\s—–.:,-]+|[\s—–.:,-]+$/g, "").trim();

  return title || rawTitle.trim();
}
