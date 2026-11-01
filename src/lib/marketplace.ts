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
