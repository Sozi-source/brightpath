import type { WorkspaceType, WorkspaceLevel } from "@/types/database";

export interface RubricCategory {
  key: string;
  label: string;
  maxMarks: number;
  sections?: string[];
}

export interface RubricBreakdown {
  totalMarks: number;
  categories: RubricCategory[];
}

/**
 * Official KNEC Business & Technical Examinations Score Cards (Craft & Diploma)
 * Source: KNEC Project Guidelines Part II to V
 */
export const KNEC_RUBRICS: Record<
  WorkspaceType,
  Record<WorkspaceLevel, RubricBreakdown>
> = {
  trade_fabrication: {
    craft: {
      totalMarks: 100,
      categories: [
        { key: "fabrication", label: "Fabrication / Practical execution", maxMarks: 75 },
        {
          key: "report",
          label: "Report Write-Up (Synopsis, Ch1, Ch2, Ch3, Ch4 - 4 marks each)",
          maxMarks: 20,
        },
        { key: "submission", label: "Final Report Submission & Presentation", maxMarks: 5 },
      ],
    },
    diploma: {
      totalMarks: 100,
      categories: [
        { key: "proposal", label: "Title, rationale & justification", maxMarks: 5 },
        { key: "defence_prep", label: "Defence, moderation & panel approval", maxMarks: 10 },
        { key: "fabrication", label: "Fabrication / Practical work / Testing", maxMarks: 25 },
        {
          key: "report",
          label:
            "Report Chapters (Synopsis 2, Terms 3, Ch1 5, Ch2 8, Ch3 10, Ch4 10, References 2)",
          maxMarks: 40,
        },
        { key: "defence", label: "Project Oral Defence", maxMarks: 15 },
        { key: "submission", label: "Final Report Submission", maxMarks: 5 },
      ],
    },
  },
  research_secondary: {
    craft: {
      totalMarks: 100,
      categories: [
        { key: "data_collection", label: "Secondary Data Sourcing & Compilation", maxMarks: 75 },
        { key: "report", label: "Report Write-Up (Synopsis, Ch1-Ch4)", maxMarks: 20 },
        { key: "submission", label: "Final Report Submission", maxMarks: 5 },
      ],
    },
    diploma: {
      totalMarks: 100,
      categories: [
        { key: "proposal", label: "Research Title & Rationale", maxMarks: 5 },
        { key: "defence_prep", label: "Proposal Defence & Panel Approval", maxMarks: 10 },
        { key: "data_collection", label: "Data Quality, Verification & Analysis", maxMarks: 25 },
        {
          key: "report",
          label:
            "Research Chapters (Synopsis 2, Terms 3, Ch1 5, Ch2 8, Ch3 10, Ch4 10, References 2)",
          maxMarks: 40,
        },
        { key: "defence", label: "Project Oral Defence", maxMarks: 15 },
        { key: "submission", label: "Final Report Submission", maxMarks: 5 },
      ],
    },
  },
  business_plan: {
    craft: {
      totalMarks: 100,
      categories: [
        { key: "proposal", label: "Business Title & Rationale (5), Panel Approval (10)", maxMarks: 15 },
        {
          key: "report",
          label: "Business Plan (Synopsis 5, Ch1 10, Ch2 10, Ch3 15, Ch4 15, Ch5 15)",
          maxMarks: 70,
        },
        { key: "defence", label: "Project Defence (10), Final Submission (5)", maxMarks: 15 },
      ],
    },
    diploma: {
      totalMarks: 100,
      categories: [
        { key: "proposal", label: "Business Title & Rationale (5), Panel Approval (10)", maxMarks: 15 },
        {
          key: "report",
          label: "Business Plan (Synopsis 5, Ch1 10, Ch2 10, Ch3 15, Ch4 15, Ch5 15)",
          maxMarks: 70,
        },
        { key: "defence", label: "Project Defence (10), Final Submission (5)", maxMarks: 15 },
      ],
    },
  },
};

export interface RubricItem {
  category: string;
  marks: number;
}

export interface WorkspaceRubric {
  scorecardName: string;
  totalMarks: number;
  breakdown: RubricItem[];
}

export function getRubricForWorkspace(
  type: WorkspaceType,
  level: WorkspaceLevel
): WorkspaceRubric {
  const rubric =
    KNEC_RUBRICS[type]?.[level] || KNEC_RUBRICS.trade_fabrication.diploma;

  const levelLabel = level === "craft" ? "Certificate" : "Diploma";
  const scorecardName =
    type === "business_plan"
      ? `${levelLabel} Business Plan`
      : type === "research_secondary"
      ? `${levelLabel} Research Project`
      : `${levelLabel} Project`;

  return {
    scorecardName,
    totalMarks: rubric.totalMarks,
    breakdown: rubric.categories.map((c) => ({
      category: c.label,
      marks: c.maxMarks,
    })),
  };
}
