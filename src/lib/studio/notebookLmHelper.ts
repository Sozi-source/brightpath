import type { WorkspaceType } from "@/types/database";

export interface NotebookLmTrackLinks {
  notebook_research_url?: string | null;
  notebook_fabrication_url?: string | null;
  notebook_business_url?: string | null;
}

export interface NotebookLmPromptItem {
  id: string;
  label: string;
  shortHint: string;
  prompt: string;
}

export const DEFAULT_NOTEBOOKLM_URL = "https://notebooklm.google.com";

/**
 * Resolves the shared Master Google NotebookLM URL.
 * Priority: Database platform_settings -> Environment variable -> notebooklm.google.com
 */
export function resolveNotebookLmUrl(
  _workspaceType?: WorkspaceType,
  settings?: NotebookLmTrackLinks | null
): { url: string; isConfigured: boolean; trackName: string } {
  const configured =
    settings?.notebook_research_url?.trim() ||
    settings?.notebook_fabrication_url?.trim() ||
    settings?.notebook_business_url?.trim() ||
    process.env.NEXT_PUBLIC_NOTEBOOKLM_URL?.trim() ||
    process.env.NEXT_PUBLIC_NOTEBOOKLM_RESEARCH_URL?.trim() ||
    "";

  return {
    url: configured || DEFAULT_NOTEBOOKLM_URL,
    isConfigured: Boolean(configured),
    trackName: "Verified Reference Library (NotebookLM)",
  };
}

/**
 * Generates 3 zero-quota, rule-based NotebookLM prompts tailored to the student's
 * exact project title, track, level, and active chapter section.
 */
export function getNotebookLmPromptsForSection(params: {
  sectionKey: string;
  sectionTitle: string;
  workspaceTitle?: string | null;
  problemArea?: string | null;
  course: string;
  level: string;
  workspaceType: WorkspaceType;
}): NotebookLmPromptItem[] {
  const topic =
    params.workspaceTitle?.trim() ||
    params.problemArea?.trim() ||
    `a ${params.level.toUpperCase()} project in ${params.course}`;

  const key = params.sectionKey.toLowerCase();

  if (key === "references") {
    return [
      {
        id: "apa-refs",
        label: "Compile APA 7th References",
        shortHint: "Full bibliography from notebook sources",
        prompt: `List all sources in this notebook relevant to "${topic}" formatted strictly in APA 7th edition reference list order (Author, Year, Title, Publisher/Journal).`,
      },
      {
        id: "verify-citations",
        label: "Verify In-Text Citations",
        shortHint: "Match (Author, Year) to full sources",
        prompt: `For a KNEC project on "${topic}", list the exact (Author, Year) in-text citation and corresponding full APA 7th reference for each official report or standard in this notebook.`,
      },
      {
        id: "kenya-reports",
        label: "Official Kenyan Reports",
        shortHint: "KDHS, KNBS, MoH & KEBS citations",
        prompt: `Provide the official APA 7th reference entries for all Kenyan government and institutional reports (KDHS, KNBS, Ministry of Health, KEBS, WHO, FAO) in this notebook related to "${topic}".`,
      },
    ];
  }

  if (key.includes("literature") || key.includes("ch2")) {
    return [
      {
        id: "lit-findings",
        label: "Extract Empirical Findings",
        shortHint: "Key study findings + (Author, Year)",
        prompt: `Using only the uploaded sources in this notebook, list key empirical findings, statistics, and page/table numbers relevant to "${topic}" (${params.sectionTitle}). Include the exact APA 7th in-text citation (Author, Year) for each point so I can write my literature review in my own words.`,
      },
      {
        id: "lit-gaps",
        label: "Identify Research Gaps",
        shortHint: "What local reports recommend investigating",
        prompt: `Based on the uploaded sources for "${topic}", what policy, data, or community intervention gaps are highlighted that justify a ${params.level} TVET study? Cite the exact source and year for each gap.`,
      },
      {
        id: "lit-concepts",
        label: "Key Definitions & Standards",
        shortHint: "Official WHO / MoH / KEBS thresholds",
        prompt: `From the uploaded sources, list the official technical definitions, cut-off thresholds, or KEBS/MoH standards relevant to "${topic}" with exact citations.`,
      },
    ];
  }

  if (
    key.includes("data") ||
    key.includes("findings") ||
    key.includes("results") ||
    key.includes("ch4") ||
    key.includes("production") ||
    key.includes("financial")
  ) {
    return [
      {
        id: "data-tables",
        label: "Extract Benchmark Tables & Stats",
        shortHint: "Exact percentages, means & table numbers",
        prompt: `From the uploaded sources in this notebook, extract exact numerical figures, percentages, or benchmark standards relevant to "${topic}" (${params.sectionTitle}). Show the indicator, value, year, source document, and table/page number.`,
      },
      {
        id: "data-compare",
        label: "Compare With National Baselines",
        shortHint: "Compare findings against KDHS / KEBS",
        prompt: `What are the national or county baseline figures in the uploaded sources for "${topic}" that I should compare my ${params.sectionTitle} results against? Include exact (Author, Year) citations.`,
      },
      {
        id: "data-interpretation",
        label: "Key Discussion Points",
        shortHint: "Evidence-backed explanations",
        prompt: `According to the uploaded sources, what are the main biological, socio-economic, or technical reasons explaining trends in "${topic}"? Cite the exact documents.`,
      },
    ];
  }

  if (key.includes("method") || key.includes("ch3") || key.includes("design")) {
    return [
      {
        id: "method-indicators",
        label: "Standard Indicators & Tools",
        shortHint: "Validated indicators used in Kenyan surveys",
        prompt: `Based on the uploaded sources in this notebook, what standard indicators, measurement procedures, or quality parameters are used to assess "${topic}" (${params.sectionTitle})? Cite the source document for each indicator.`,
      },
      {
        id: "method-standards",
        label: "Sampling / Protocol Benchmarks",
        shortHint: "Standard survey or formulation procedures",
        prompt: `How do the uploaded reference reports define the target population, sampling indicators, or laboratory/formulation protocols for "${topic}"?`,
      },
      {
        id: "method-ethics",
        label: "Quality & Compliance Rules",
        shortHint: "MoH / KEBS / NACOSTI requirements",
        prompt: `What quality assurance, food safety (KEBS), or research compliance standards mentioned in the uploaded sources apply to "${topic}"?`,
      },
    ];
  }

  // Default: Proposal, Background, Problem Statement, Objectives, Conclusions
  return [
    {
      id: "kenya-stats",
      label: "Find Kenyan Statistics",
      shortHint: "Prevalence rates & figures with citations",
      prompt: `From the uploaded sources in this notebook, list the exact national and county statistics, prevalence rates, or market figures for "${topic}" (${params.sectionTitle}). Include the source name, year, and page/table number for each statistic.`,
    },
    {
      id: "problem-evidence",
      label: "Evidence for Problem Statement",
      shortHint: "Verified facts showing severity & gap",
      prompt: `Using only the uploaded sources, what documented evidence shows the severity, causes, and consequences of "${topic}" in Kenya? Provide exact (Author, Year) citations I can reference in my ${params.sectionTitle}.`,
    },
    {
      id: "apa-citations",
      label: "Get APA 7th Citations",
      shortHint: "In-text + full reference entries",
      prompt: `List the top 5 sources in this notebook most relevant to "${topic}" with both their APA 7th in-text citation (Author, Year) and full reference list entry.`,
    },
  ];
}
