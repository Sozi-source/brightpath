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
import {
  getStandardKnecFillInTemplate,
  countUnfilledPlaceholders,
  extractUnfilledPlaceholders,
} from "./knecSectionTemplates";

export type { SectionDef, StarterKit };
export {
  STARTER_KITS,
  getAvailableStarterKits,
  getStarterKitById,
  getStandardKnecFillInTemplate,
  countUnfilledPlaceholders,
  extractUnfilledPlaceholders,
};

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

  const isDiploma = level === "diploma";

  // Filter sections that apply to the selected academic level and adjust word targets + analysis guidance:
  // - Certificate: at least 15 pages (~3,750 - 4,200 words total; min 10 pages required), simple descriptive statistics.
  // - Diploma: at least 40 pages (~10,000+ words total), both descriptive and inferential statistics.
  return masterList
    .filter((sec) => !sec.levels || sec.levels.includes(level))
    .map((sec) => {
      const baseWords = sec.minWords || 100;
      const isSubstantiveChapter =
        sec.phase === "project" &&
        sec.chapter !== "cover" &&
        sec.chapter !== "preliminary" &&
        sec.chapter !== "appendices";

      // Certificate uses 1.25x base (~3,850 words / ~15+ pages); Diploma uses 3.1x base (~10,000+ words / ~40+ pages)
      const scaledMinWords = isSubstantiveChapter
        ? Math.round((baseWords * (isDiploma ? 3.1 : 1.25)) / 10) * 10
        : isDiploma && sec.phase === "proposal"
        ? Math.round((baseWords * 1.5) / 10) * 10
        : baseWords;

      let guidance = sec.guidance;
      if (type === "research_secondary") {
        if (sec.key === "ch3.analysis") {
          guidance = isDiploma
            ? "Explain how the extracted secondary data was organized and analyzed using both descriptive statistics (frequencies, percentages, means, standard deviation) and inferential statistics (such as Chi-square test of association, t-test, or correlation at p < 0.05)."
            : "Explain how the extracted secondary data was organized and summarized using simple descriptive statistics (frequencies, percentages, averages, and frequency tables).";
        } else if (sec.key === "ch4.results") {
          guidance = isDiploma
            ? "Present both descriptive statistical findings (frequencies, percentages, means, standard deviations) and inferential test results (Chi-square, t-test, or correlation p-values) across your specific objectives."
            : "Present the simple descriptive findings (frequencies, percentages, averages, and summary tables) extracted from your secondary data sources for each specific objective.";
        } else if (sec.key === "ch4.subgroup") {
          guidance = isDiploma
            ? "Compare extracted figures across groups (age, sex, rural vs. urban residence) and report inferential statistical test results (e.g. Chi-square test of independence or t-test at p < 0.05)."
            : "Compare the extracted percentages and averages across groups (e.g. age groups, sex, or rural vs. urban residence) using simple comparison tables.";
        }
      }

      return {
        ...sec,
        minWords: scaledMinWords,
        guidance,
      };
    });
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

  const sections = getWorkspaceSections(type, level);
  const sec = sections.find((s) => s.key === sectionKey);

  // 3. Fall back to standardized KNEC Fill-In Template for this section
  const standardFillIn = getStandardKnecFillInTemplate({
    type,
    level,
    sectionKey,
    sectionTitle: sec?.title,
  });
  if (standardFillIn) {
    return standardFillIn;
  }

  // 4. Fall back to section definition starterTemplate if set
  if (sec?.starterTemplate) {
    return sec.starterTemplate;
  }

  // 5. Fall back to minimal structured heading
  if (sec) {
    return `## ${sec.title}\n\n[Provide substantive technical content aligned with KNEC requirements: ${sec.guidance}]`;
  }

  return "";
}

