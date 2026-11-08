import type { WorkspaceType, WorkspaceLevel } from "@/types/database";
import { TRADE_FABRICATION_SECTIONS, type SectionDef } from "./trade";
import { RESEARCH_SECONDARY_SECTIONS } from "./research";
import { BUSINESS_PLAN_SECTIONS } from "./business";
import type { BusinessPlanModel } from "../businessPlanTypes";

export type { SectionDef, SectionDef as SectionDefinition };

export function getWorkspaceSections(
  type: WorkspaceType,
  level: WorkspaceLevel,
  businessModel?: BusinessPlanModel
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
        type !== "business_plan" &&
        sec.phase === "project" &&
        sec.chapter !== "cover" &&
        sec.chapter !== "preliminary" &&
        sec.chapter !== "appendices";

      // Trade/Research projects scale base words by level; Business Plans use the
      // explicit KNEC section minWords defined in src/lib/studio/templates/business.ts.
      const scaledMinWords = isSubstantiveChapter
        ? Math.round((baseWords * (isDiploma ? 3.1 : 1.25)) / 10) * 10
        : type !== "business_plan" && isDiploma && sec.phase === "proposal"
        ? Math.round((baseWords * 1.5) / 10) * 10
        : baseWords;

      let guidance = sec.guidance;
      let title = sec.title;
      if (type === "business_plan" && (businessModel === "consultancy" || businessModel === "clinical")) {
        const consultancyGuidance: Record<string, { title?: string; guidance: string }> = {
          "ch1.nature": { guidance: "Describe nutrition assessment, dietary counselling, service boundaries, and the local healthcare service opportunity." },
          "ch1.products": { guidance: "Specify consultation content, deliverables, duration, fee, variable cost, follow-up, and scope limits." },
          "ch1.goals": { guidance: "Set measurable client-service, appointment capacity, revenue, and quality objectives." },
          "ch1.justification": { guidance: "Explain the local need for nutrition consultancy and qualify market and affordability assumptions." },
          "ch2.customers": { guidance: "Define the intended client groups, service needs, access constraints, and evidence for demand." },
          "ch2.demand": { guidance: "Estimate service demand using a defined catchment, evidence, appointment capacity, and transparent assumptions." },
          "ch2.competitors": { guidance: "Compare verified local nutrition practices, clinics, online services, and public alternatives with dated evidence." },
          "ch2.pricing": { guidance: "Explain consultation fees, preparation and follow-up time, variable service costs, and payment terms." },
          "ch2.distribution": { guidance: "Describe appointment-based in-person or remote delivery, access, privacy, and client guidance channels." },
          "ch2.forecast": { guidance: "Forecast consultation sessions, fees, service costs, operating expenses, and revenue for three years." },
          "ch3.structure": { guidance: "Show a lean consultancy structure with professional, administrative, and outsourced responsibilities." },
          "ch3.staffing": { guidance: "Specify nutrition and administrative roles, verified qualifications, duties, hours, and proposed pay." },
          "ch3.recruitment": { guidance: "Describe recruitment, credential checks, client privacy training, consent, referral, and performance review." },
          "ch3.legal": { guidance: "Verify business, premises, professional-scope, privacy, tax, and county requirements; do not assume approvals." },
          "ch4.facilities": { title: "4.1 Consultancy Premises and Space Allocation", guidance: "Describe private consultation space, accessible waiting, sanitation, assessment tools, and secure client records." },
          "ch4.workflow": { title: "4.2 Client Service Delivery Workflow", guidance: "Describe enquiry, booking, consent, assessment, counselling, written guidance, referral, and follow-up steps." },
          "ch4.equipment": { title: "4.3 Clinical and Office Equipment", guidance: "List assessment and office equipment with verified prices, suppliers, and quotation status." },
          "ch4.materials": { title: "4.4 Consumables and Client Education Materials", guidance: "Estimate recurring consultation supplies and printed or digital client education materials." },
          "ch4.labor": { title: "4.5 Appointment Schedule and Workload", guidance: "Plan appointment time, preparation, records, follow-up, administrative work, and realistic monthly capacity." },
          "ch4.quality": { title: "4.6 Service Quality, Privacy, and Client Safety", guidance: "Explain consent, confidential records, scope boundaries, equipment care, complaints, and referral safeguards." },
          "ch4.schedule": { title: "4.7 Service Capacity and Maintenance Schedule", guidance: "Set feasible monthly consultation capacity and maintain assessment tools, software, records, and premises." },
        };
        const override = consultancyGuidance[sec.key];
        if (override) {
          title = override.title || title;
          guidance = override.guidance;
        }
      }
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
        title,
        chapterTitle: type === "business_plan" && (businessModel === "consultancy" || businessModel === "clinical") && sec.chapter === "ch4"
          ? "Chapter 4: Consultancy Operations Plan"
          : sec.chapterTitle,
        minWords: scaledMinWords,
        guidance,
      };
    });
}

/**
 * Returns initial starter text for a section if a formal cover/preliminary template is defined,
 * otherwise starts empty so candidates write their own content.
 */
export function getSectionStarterContent(
  type: WorkspaceType,
  level: WorkspaceLevel,
  sectionKey: string,
  businessModel?: BusinessPlanModel
): string {
  const sections = getWorkspaceSections(type, level, businessModel);
  const sec = sections.find((s) => s.key === sectionKey);
  if (sec?.starterTemplate) {
    return sec.starterTemplate;
  }
  return "";
}
