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
 * ("in Regional, County", "in Kiambu"), and syllabus suffixes ("Complete KNEC Business Plan (Craft Certificate)").
 */
export function getExactBusinessTitle(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "Learning Resource";

  let title = rawTitle.trim();

  // 1. Strip trailing complete business plan annotations and qualification parentheses
  title = title
    .replace(/\s*—?\s*Complete KNEC Business Plan.*$/i, "")
    .replace(/\s*\(?(Craft Certificate|Diploma|Certificate|Higher Diploma)\)?/gi, "")
    .trim();

  // 2. Strip leading "Business Plan for / on / of / - / :"
  title = title.replace(/^business\s+plan\s+(for|on|of|:|-)?\s*/i, "").trim();

  // 3. Strip trailing regional/county location clauses (e.g. "in Regional, County", "in Regional, County", "in Juja, Kiambu", "in Nakuru County")
  title = title
    .replace(/\s+in\s+Regional,\s*County.*$/i, "")
    .replace(/\s+Regional,\s*County.*$/i, "")
    .replace(/\s+in\s+[A-Za-z0-9\s,\/.-]+County.*$/i, "")
    .replace(/\s+in\s+[A-Za-z0-9\s,\/.-]+$/i, "")
    .replace(/,\s*[A-Za-z\s]+County.*$/i, "")
    .trim();

  return title || rawTitle.trim();
}
