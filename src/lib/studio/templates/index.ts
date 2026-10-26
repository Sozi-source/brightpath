import type { WorkspaceType, WorkspaceLevel } from "@/types/database";
import { TRADE_FABRICATION_SECTIONS, type SectionDef } from "./trade";
import { RESEARCH_SECONDARY_SECTIONS } from "./research";
import { BUSINESS_PLAN_SECTIONS } from "./business";

export type { SectionDef };

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
