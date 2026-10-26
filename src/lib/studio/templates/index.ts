import type { WorkspaceType, WorkspaceLevel } from "@/types/database";
import { TRADE_FABRICATION_SECTIONS, type SectionDef } from "./trade";
import { RESEARCH_SECONDARY_SECTIONS } from "./research";
import { BUSINESS_PLAN_SECTIONS } from "./business";
import {
  STARTER_KITS,
  getAvailableStarterKits,
  getStarterKitById,
  type StarterKit,
} from "./starterKits";

export type { SectionDef, StarterKit };
export { STARTER_KITS, getAvailableStarterKits, getStarterKitById };

export function getWorkspaceSections(
  type: WorkspaceType,
  level: WorkspaceLevel
): SectionDef[] {
  let masterList: SectionDef[] = [];

  switch (type) {
    case "trade_fabrication":
      masterList = TRADE_FABRICATION_SECTIONS;
      break;
    case "research_secondary":
      masterList = RESEARCH_SECONDARY_SECTIONS;
      break;
    case "business_plan":
      masterList = BUSINESS_PLAN_SECTIONS;
      break;
    default:
      masterList = TRADE_FABRICATION_SECTIONS;
  }

  // Filter sections that apply to the selected academic level
  return masterList.filter((sec) => !sec.levels || sec.levels.includes(level));
}

/**
 * Returns structured KNEC starter template text for a section based on chosen template kit or default standard.
 */
export function getSectionStarterContent(
  type: WorkspaceType,
  level: WorkspaceLevel,
  sectionKey: string,
  templateKitId?: string
): string {
  // 1. If a specific starter kit is selected, check its content
  if (templateKitId && templateKitId !== "clean_slate") {
    const kit = getStarterKitById(templateKitId);
    if (kit?.sectionsContent[sectionKey]) {
      return kit.sectionsContent[sectionKey];
    }
  }

  // 2. Fall back to standard KNEC kit for this track if available
  const defaultKitId =
    type === "research_secondary"
      ? "knec_std_research"
      : type === "business_plan"
      ? "knec_std_business"
      : "knec_std_trade";

  const defaultKit = getStarterKitById(defaultKitId);
  if (defaultKit?.sectionsContent[sectionKey]) {
    return defaultKit.sectionsContent[sectionKey];
  }

  // 3. Fall back to section definition starterTemplate if set
  const sections = getWorkspaceSections(type, level);
  const sec = sections.find((s) => s.key === sectionKey);
  if (sec?.starterTemplate) {
    return sec.starterTemplate;
  }

  // 4. Fall back to minimal structured heading
  if (sec) {
    return `## ${sec.title}\n\n[Provide substantive technical content aligned with KNEC requirements: ${sec.guidance}]`;
  }

  return "";
}

