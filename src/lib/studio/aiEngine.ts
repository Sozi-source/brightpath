/**
 * BrightPath Dependable KNEC AI Engine
 * 
 * Purpose: Carries technical TVET students (Nutrition & Dietetics, Food Science & Technology,
 * and Nutrition Enterprise) through the complete research lifecycle to final examination submission:
 * 1. Open-Ended Topic Discovery & Narrowing Coach.
 * 2. Academic Alignment & Subheading Word Target Expansion.
 * 3. Formative Writing Prompts to unblock candidates.
 * 
 * Resilient Architecture:
 * - Direct integration with LLM providers (Gemini / OpenAI) via native fetch when API keys exist.
 * - Deterministic, rule-based Academic Alignment fallback when offline or without API keys.
 * - Transparent audit logging into `ai_events` and `section_versions`.
 */

import {
  selectEvidence,
  resolveCitationTokens,
  findCitedSources,
  findUnsupportedFigures,
  toCitationInfo,
  formatInText,
  type CitationInfo,
  type EvidenceNote,
} from "./sources";
import { generateSecondaryDataTopics } from "./secondaryTopics";
import { buildSectionQuestionGuide } from "./questionGuides";

export interface TopicNarrowingOption {
  id: string;
  title: string;
  problemSummary: string;
  generalObjective: string;
  specificObjectives: string[];
  methodologyHint: string;
  businessConcept?: string;
  productsServices?: string;
  targetMarket?: string;
  startupCapital?: string;
  commercialGoals?: string[];
}

export interface TopicNarrowingResult {
  problemAnalysis: string;
  options: TopicNarrowingOption[];
  followUpQuestion: string;
}

export interface WorkspaceContext {
  title?: string | null;
  course: string;
  level: string;
  problemArea?: string | null;
  workspaceType: "research_secondary" | "trade_fabrication" | "business_plan";
}

export interface SectionPolishResult {
  polishedText: string;
  wordsOriginal: number;
  wordsPolished: number;
  wordDiff: number;
  targetMet: boolean;
  improvements: string[];
  /** Verified sources actually cited in the polished text (APA 7th reference included). */
  citations: CitationInfo[];
  /** Things the student must double-check before accepting. */
  warnings: string[];
}

export interface AcademicLevelSpec {
  levelLabel: string;
  minRequiredPages: number;
  targetPages: number;
  targetWords: number;
  analysisMethods: string;
  isDiploma: boolean;
}

/**
 * Returns KNEC page length and statistical analysis standards for Certificate vs Diploma:
 * - Certificate (Craft): Minimum 10 pages required, focused target of at least 15 pages (~3,750+ words).
 *   Uses simple descriptive statistics (frequencies, percentages, averages/means, tables, and charts).
 * - Diploma: Minimum 40 pages required (~10,000+ words).
 *   Uses both descriptive statistics (frequencies, percentages, means, standard deviation) and
 *   inferential statistics (e.g. Chi-square test of association, t-test, correlation, p-values at p < 0.05).
 */
export function getAcademicLevelSpec(level: string): AcademicLevelSpec {
  const isDiploma = level.toLowerCase() === "diploma";
  if (isDiploma) {
    return {
      levelLabel: "Diploma",
      minRequiredPages: 40,
      targetPages: 40,
      targetWords: 10000,
      analysisMethods:
        "both descriptive statistics (frequencies, percentages, means, standard deviation) and inferential statistics (Chi-square test of association, t-test, correlation, and p-values at p < 0.05)",
      isDiploma: true,
    };
  }
  return {
    levelLabel: "Certificate",
    minRequiredPages: 10,
    targetPages: 15,
    targetWords: 3750,
    analysisMethods:
      "simple descriptive statistics (frequencies, percentages, averages/means, summary tables, and charts)",
    isDiploma: false,
  };
}

/**
 * 1. AI Topic Narrowing Coach
 * Takes raw student query (e.g. "child stunting in kilifi", "composite sweet potato flour")
 * and produces 3 KNEC-compliant, examination-ready research proposals.
 */
export async function narrowDownTopic(
  studentInput: string,
  context: WorkspaceContext
): Promise<TopicNarrowingResult> {
  const query = studentInput.trim();
  const type = context.workspaceType;
  const course = context.course;
  const level = context.level;

  // Attempt external LLM if API key is present
  const llmResult = await tryLlmTopicNarrowing(query, context);
  if (llmResult) return llmResult;

  // Built-in Deterministic Academic Alignment Engine
  return generateDeterministicTopics(query, type, course, level);
}

const VERIFY_WARNING =
  "Confirm each cited statement in the original source before submission. Page numbers are not added automatically.";

/**
 * 2. Section Polish, Deepen & Cite Engine
 * Takes the candidate's own writing, polishes and deepens it, and adds in-text citations
 * drawn ONLY from the verified source library (never invented by the model).
 */
export async function polishAndAlignSection(params: {
  draftText: string;
  sectionKey: string;
  sectionTitle: string;
  guidance: string;
  minWords: number;
  context: WorkspaceContext;
}): Promise<SectionPolishResult> {
  const { draftText, sectionKey, sectionTitle, guidance, minWords, context } = params;
  const rawWords = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const levelSpec = getAcademicLevelSpec(context.level);

  if (context.workspaceType === "business_plan") {
    const polished = await tryLlmBusinessPlanPolish({
      draftText,
      sectionTitle,
      guidance,
      context,
    });
    const polishedText = polished || draftText;
    const polishedWords = polishedText.trim() ? polishedText.trim().split(/\s+/).length : 0;
    return {
      polishedText,
      wordsOriginal: rawWords,
      wordsPolished: polishedWords,
      wordDiff: polishedWords - rawWords,
      targetMet: polishedWords >= minWords,
      improvements: polished
        ? ["Improved clarity while preserving the candidate's facts and figures."]
        : ["AI polishing is unavailable; your draft has not been changed."],
      citations: [],
      warnings: polished
        ? ["Check every claim and attach the evidence you collected before submission."]
        : ["Configure an AI provider to polish this draft. No replacement text was generated."],
    };
  }

  const evidence = selectEvidence({
    sectionKey,
    text: draftText,
    title: context.title,
    problemArea: context.problemArea,
    workspaceType: context.workspaceType,
  });

  // Attempt external LLM if API key is present
  const llmRaw = await tryLlmSectionPolish({
    draftText,
    sectionKey,
    sectionTitle,
    guidance,
    minWords,
    context,
    evidence,
  });

  if (llmRaw) {
    const allowed = new Set(evidence.map((e) => e.source.id));
    const { text: polishedText, stripped } = resolveCitationTokens(llmRaw, allowed);
    const polishedWords = polishedText.trim().split(/\s+/).length;
    const citations = findCitedSources(polishedText).map((s) => toCitationInfo(s, evidence));

    const warnings: string[] = [];
    if (citations.length > 0) warnings.push(VERIFY_WARNING);
    if (stripped > 0) warnings.push(`${stripped} citation(s) not in the verified library were removed.`);
    const odd = findUnsupportedFigures(polishedText, draftText, evidence);
    if (odd.length > 0) {
      warnings.push(`Check these figures, they are not in your draft or source notes: ${odd.join(", ")}.`);
    }

    return {
      polishedText,
      wordsOriginal: rawWords,
      wordsPolished: polishedWords,
      wordDiff: polishedWords - rawWords,
      targetMet: polishedWords >= minWords,
      improvements: [
        `Aligned to ${levelSpec.levelLabel} standard (target ≥${levelSpec.targetPages} pages overall)`,
        citations.length > 0
          ? `${citations.length} verified source(s) cited in text`
          : "No verified source matched this section",
        `Section length now ${polishedWords} words (target ${minWords} words)`,
      ],
      citations,
      warnings,
    };
  }

  // Built-in deterministic engine (used when no API key is configured)
  return generateDeterministicSectionPolish({
    draftText,
    sectionKey,
    sectionTitle,
    guidance,
    minWords,
    context,
    evidence,
  });
}

async function tryLlmBusinessPlanPolish(params: {
  draftText: string;
  sectionTitle: string;
  guidance: string;
  context: WorkspaceContext;
}): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!geminiKey && !openaiKey) return null;

  const prompt = `You are a writing coach helping a Kenyan TVET student prepare a business plan using the supplied institutional template.
Polish only the student's draft for clear, concise, well-organized business-plan writing.

Rules:
- Use only facts and figures present in the candidate draft and the stated workspace context.
- Do not invent survey results, market sizes, competitor details, prices, quotations, suppliers, licenses, approvals, loan offers, financial results, citations, or sources.
- Preserve the candidate's meaning, location, units, amounts, dates, and uncertainty.
- If a useful detail is missing, insert a short bracketed prompt such as [Add your survey sample size] instead of guessing.
- Treat projections as estimates and label them as assumptions when the student does.
- Do not claim the business is viable, profitable, compliant, approved, or funded unless the draft provides evidence for that claim.
- Return only the revised section text. Do not add a title, preamble, references, or a conclusion not supported by the draft.

Workspace: ${params.context.title || "Business plan"}
Business context: ${params.context.problemArea || "No additional business details supplied"}
Template section: ${params.sectionTitle}
Section guidance: ${params.guidance}

Candidate draft:
${params.draftText}`;

  try {
    if (geminiKey) {
      const text = await callGeminiText(prompt, geminiKey, {
        temperature: 0.2,
        timeoutMs: 25000,
      });
      if (text?.trim()) return text.trim();
    }
    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: params.draftText },
          ],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text === "string" && text.trim()) return text.trim();
      }
    }
  } catch (error) {
    console.warn("Business plan section polish failed:", error);
  }
  return null;
}


/**
 * 3. Formative Writing Prompts & Open-Ended Guided Questions
 */
export interface SectionQuestionGuide {
  mainQuestion: string;
  subQuestions: string[];
  placeholderExample: string;
}

export function getSectionQuestionGuide(
  sectionKey: string,
  context: WorkspaceContext
): SectionQuestionGuide {
  return buildSectionQuestionGuide(sectionKey, context);
}

export function getSectionWritingPrompts(sectionKey: string, context: WorkspaceContext): string[] {
  return getSectionQuestionGuide(sectionKey, context).subQuestions;
}

// ============================================================================
// Internal LLM Providers (Native fetch - Zero external dependencies)
// ============================================================================

async function tryLlmTopicNarrowing(
  query: string,
  context: WorkspaceContext
): Promise<TopicNarrowingResult | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) return null;

  const isBusiness = context.workspaceType === "business_plan";
  const isSecondaryResearch = context.workspaceType === "research_secondary";
  const levelSpec = getAcademicLevelSpec(context.level);

  if (isBusiness) {
    const businessPrompt = `You are a practical TVET Business Plan Advisor for Kenyan Certificate and Diploma students studying ${context.course} (${levelSpec.levelLabel.toUpperCase()} level).
The student wants to develop a viable KNEC Business Plan for a micro- or small-scale enterprise in nutrition, dietetics, or food processing.

CRITICAL KNEC BUSINESS PLAN RULES:
1. This is a COMMERCIAL BUSINESS PLAN, NOT an academic research thesis.
2. DO NOT format this as a research problem with hypotheses, research questions, or secondary data extraction.
3. Every proposal must follow the official KNEC 5-Chapter Business Plan format:
   - Chapter 1: Business Description (name, location, form of ownership, products/services, SWOT)
   - Chapter 2: Marketing Plan (customers, market share, competitor analysis, pricing, promotion, distribution)
   - Chapter 3: Organization and Management Plan (organogram, management team, staff, licenses/permits)
   - Chapter 4: Operational and Production Plan (facilities, production workflow, machinery, raw materials)
   - Chapter 5: Financial Plan (startup capital, cash flow, income statement P&L, balance sheet, break-even)
4. Titles MUST start with "Business Plan for..." (e.g. "Business Plan for Establishing a Nutrition Consultancy Practice in Nakuru", "Business Plan for a Fortified Porridge Flour Milling Enterprise in Kitui").
5. Financial figures must be realistic for Kenyan TVET startups (startup capital KES 200,000 to KES 450,000; break-even 6-8 months).

Return strictly valid JSON with this shape:
{
  "problemAnalysis": "2 short sentences explaining why this commercial enterprise is viable in the Kenyan market and noting the ${levelSpec.targetPages}+ page ${levelSpec.levelLabel} standard.",
  "options": [
    {
      "id": "bp-1",
      "title": "Business Plan for [Specific Enterprise Name] in [Location]",
      "problemSummary": "1-2 sentences summarizing market need and commercial value proposition",
      "businessConcept": "Clear description of enterprise operations and value proposition",
      "productsServices": "Specific products or services offered and packaging/pricing formats",
      "targetMarket": "Primary customer segments (e.g. clinics, households, schools)",
      "startupCapital": "Estimated startup capital (e.g. KES 280,000)",
      "commercialGoals": [
        "1. First operational milestone (e.g. Year 1 production or client target)",
        "2. Break-even timeline and monthly revenue target",
        "3. Regulatory/expansion milestone (e.g. KEBS or county permit)"
      ],
      "generalObjective": "To prepare a viable business plan for establishing [Enterprise Name] in [Location]",
      "specificObjectives": [
        "1. Conduct market and customer demand survey in the target locality",
        "2. Establish operational, equipment, and production workflow",
        "3. Formulate 3-year financial projections and break-even analysis"
      ],
      "methodologyHint": "Market feasibility survey, supplier quotations, and 3-year pro-forma financial statements for a ${levelSpec.targetPages}+ page report."
    }
  ],
  "followUpQuestion": "Which enterprise model matches your career vision?"
}`;

    try {
      if (geminiKey) {
        const jsonText = await callGeminiText(
          `${businessPrompt}\n\nStudent Idea: ${query}`,
          geminiKey,
          { jsonMode: true, temperature: 0.3, timeoutMs: 18000 }
        );
        if (jsonText) return JSON.parse(jsonText);
      }
      if (openaiKey) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: businessPrompt },
              { role: "user", content: `Student Idea: ${query}` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return JSON.parse(content);
        }
      }
    } catch {
      // Fall through to deterministic
    }
    return null;
  }

  const designRules = isSecondaryResearch
    ? `CRITICAL RESEARCH DESIGN & LEVEL RULES (${levelSpec.levelLabel.toUpperCase()} LEVEL):
1. Every proposed topic MUST use a **Descriptive Cross-Sectional Research Design relying 100% on Secondary Data**.
2. The student will NOT go to the field to administer questionnaires, conduct interviews, or take new anthropometric measurements (no weighing scales or MUAC tapes).
3. Instead, the student will extract and summarize existing figures from verified secondary sources: Kenya Demographic and Health Survey (KDHS 2022 / 2014), KNBS reports (KIHBS), Ministry of Health (MOH / KHIS) facility summary reports, existing school feeding/attendance records, or published nutrition studies.
4. PROJECT LENGTH REQUIREMENT: ${
        levelSpec.isDiploma
          ? "Diploma project reports MUST be at least 40 pages long (~10,000+ words)."
          : "Certificate project reports require at least 10 pages, and we focus on a target of at least 15 pages (~3,750+ words)."
      }
5. STATISTICAL ANALYSIS REQUIREMENT: ${
        levelSpec.isDiploma
          ? "Diploma students may use BOTH descriptive statistics (frequencies, percentages, means, standard deviation) AND inferential statistics (e.g. Chi-square test of association, t-test, correlation at p < 0.05)."
          : "Certificate students use simple descriptive statistics ONLY (frequencies, percentages, averages/means, and simple summary tables/charts)."
      }`
    : `CRITICAL TECHNICAL DESIGN & LEVEL RULES (${levelSpec.levelLabel.toUpperCase()} LEVEL):
1. Propose practical, realistic food product formulation or nutrition enterprise topics suitable for a ${levelSpec.levelLabel} TVET student.
2. Target project report length: at least ${levelSpec.targetPages} pages (${levelSpec.targetWords}+ words).
3. Data analysis: ${levelSpec.analysisMethods}.`;

  const systemPrompt = `You are a practical Academic Research Supervisor for TVET Certificate and Diploma students in Kenya studying ${context.course} (${levelSpec.levelLabel.toUpperCase()} level).
ALL proposed topics, objectives, and methodologies MUST be STRAIGHTFORWARD, SIMPLE, DIRECT, and REALISTIC.

${designRules}

STRICT STYLE RULES:
1. DO NOT generate overly convoluted titles or PhD-level econometric topics.
2. Titles MUST be direct, simple, and under 15 words (e.g., "Assessment of Complementary Feeding Practices and Child Stunting in Kitui County").
3. Problem Summary: 1-2 simple sentences in plain language describing the issue.
4. General Aim: 1 simple sentence starting with "To assess...", "To examine...", or "To determine...".
5. Specific Objectives: Exactly 3 simple, numbered steps extracting/reviewing figures from secondary reports.
6. Methodology Hint: Explicitly state "Descriptive cross-sectional study using secondary data from [specific report/register], analyzed using ${levelSpec.analysisMethods} for a ${levelSpec.targetPages}+ page ${levelSpec.levelLabel} report."

Return strictly valid JSON with this shape:
{
  "problemAnalysis": "2 short, plain-language sentences explaining why this topic matters, which secondary reports can be used, and noting the ${levelSpec.targetPages}+ page ${levelSpec.levelLabel} standard.",
  "options": [
    {
      "id": "opt-1",
      "title": "Direct and simple title (under 15 words)",
      "problemSummary": "1-2 simple sentences explaining the problem",
      "generalObjective": "Simple general aim",
      "specificObjectives": [
        "1. First simple objective using secondary data",
        "2. Second simple objective using secondary data",
        "3. Third simple objective using secondary data"
      ],
      "methodologyHint": "Descriptive cross-sectional design using secondary data from KDHS / KNBS / MOH reports, analyzed with ${levelSpec.analysisMethods}."
    }
  ],
  "followUpQuestion": "A friendly, simple question to help the student pick their preferred option"
}`;

  try {
    if (geminiKey) {
      const jsonText = await callGeminiText(
        `${systemPrompt}\n\nStudent Idea: ${query}`,
        geminiKey,
        { jsonMode: true, temperature: 0.3, timeoutMs: 18000 }
      );
      if (jsonText) return JSON.parse(jsonText);
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Student Idea: ${query}` },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    }
  } catch (err) {
    console.warn("External LLM topic narrowing failed, utilizing built-in academic engine:", err);
  }

  return null;
}

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function callGeminiText(
  promptText: string,
  apiKey: string,
  options: { jsonMode?: boolean; temperature?: number; timeoutMs?: number } = {}
): Promise<string | null> {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const models = configuredModel
    ? [configuredModel, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== configuredModel)]
    : DEFAULT_GEMINI_MODELS;

  const generationConfig: Record<string, unknown> = {
    temperature: options.temperature ?? 0.4,
  };
  if (options.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig,
        }),
        signal: AbortSignal.timeout(options.timeoutMs ?? 25000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const parts: Array<{ text?: string; thought?: boolean }> =
        data?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join("\n")
        .trim();

      if (text) return text;
    } catch {
      // Try next fallback Gemini model
    }
  }

  return null;
}

/**
 * Strips stacked/duplicate "### Research Title" prefixes left over from previous polishes
 * while preserving the student's actual title and notes.
 */
function stripDuplicateTitleHeaders(rawDraft: string): string {
  const lines = rawDraft
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cleaned: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip standalone "### Research Title" header lines
    if (/^#{1,4}\s*research\s+title\.?$/i.test(line)) {
      continue;
    }
    // Strip inline "### Research Title." or "Research Title:" prefix
    const stripped = line.replace(/^(?:#{1,4}\s*)?research\s+title[.:;\s-]*/i, "").trim();
    if (!stripped) continue;

    // Skip if an earlier line was auto-generated generic title and a later line has more specific student notes
    if (
      cleaned.length > 0 &&
      /^assessment of household dietary diversity and daily food consumption patterns in nairobi county\.?$/i.test(
        cleaned[cleaned.length - 1]
      )
    ) {
      cleaned.pop();
    }
    if (
      cleaned.length > 0 &&
      cleaned[cleaned.length - 1].toLowerCase().replace(/\.$/, "") ===
        stripped.toLowerCase().replace(/\.$/, "")
    ) {
      continue;
    }
    cleaned.push(stripped);
  }

  return cleaned.join("\n\n");
}

async function tryLlmSectionPolish(params: {
  draftText: string;
  sectionKey: string;
  sectionTitle: string;
  guidance: string;
  minWords: number;
  context: WorkspaceContext;
  evidence: EvidenceNote[];
}): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) return null;

  const { sectionKey, sectionTitle, guidance, minWords, context, evidence } = params;
  const cleanedDraft = stripDuplicateTitleHeaders(params.draftText);
  const levelSpec = getAcademicLevelSpec(context.level);

  const sourceNotes = evidence.length
    ? evidence
        .map((e) => `- id=${e.source.id} | ${formatInText(e.source)} | finding: ${e.claim.text}`)
        .join("\n")
    : "(none: this section has no verified source notes, so write without any citation)";

  const designNote =
    context.workspaceType === "research_secondary"
      ? `Research design: Straightforward descriptive cross-sectional design relying entirely on secondary data (existing KDHS, KNBS, MOH reports, or published studies; no primary field questionnaires or lab work).\nAcademic Level Standard: ${levelSpec.levelLabel} level — overall project report length must be at least ${levelSpec.targetPages} pages (minimum ${levelSpec.minRequiredPages} pages), and statistical analysis uses ${levelSpec.analysisMethods}.`
      : `Academic Level Standard: ${levelSpec.levelLabel} level — overall project report length must be at least ${levelSpec.targetPages} pages (minimum ${levelSpec.minRequiredPages} pages), and data analysis uses ${levelSpec.analysisMethods}.`;

  const sectionFormatRule =
    sectionKey === "proposal.title" || sectionKey === "cover.details"
      ? `SECTION FORMAT FOR RESEARCH TITLE & RATIONALE:
- Start with a single heading "### Research Title" followed on the next line by ONE clear, properly capitalized research title that preserves the student's exact study site (e.g., Mathare Informal Settlement, Nairobi County) and target group (e.g., Children Under Five Years). NEVER repeat "### Research Title" more than once.
- Then add a heading "### Study Rationale" followed by 2–3 well-structured paragraphs that explain the background, target group, secondary data sources (e.g. KDHS 2022, KNBS, Ministry of Health reports, and comparable studies in similar demographic settings), and why the study matters, weaving verified citations naturally into the sentences.`
      : `SECTION FORMAT:
- Write 2–4 coherent, well-structured academic paragraphs addressing "${sectionTitle}". Do NOT repeat section headings multiple times.`;

  const prompt = `You are a supportive academic writing coach for a Kenyan TVET student studying ${context.course} (${levelSpec.levelLabel} level).
The student has written their draft notes and context for the section "${sectionTitle}".
Project title: ${context.title || "Academic Project"}
Problem area: ${context.problemArea || "Public health nutrition"}
${designNote}
Section guidance: ${guidance}
Target section length: at least ${minWords} words (scaled so the full ${levelSpec.levelLabel} report reaches at least ${levelSpec.targetPages} pages).

${sectionFormatRule}

WRITING RULES
1. Keep every specific fact, study site (such as Mathare informal settlement in Nairobi, specific counties, or schools), target population (e.g. children under five years), and secondary data source (e.g. KDHS 2022, KNBS, MoH Kenya) the student mentioned.
2. CONVERT INSTRUCTIONS INTO ACADEMIC PROSE: Students often write notes or instructions to the AI inside their draft (such as "You will focus on KDHS 2022, KNBS and MoH Kenya data...", "you can also explore other similar research findings...", "I want to...", or "use KDHS..."). Follow those instructions, and NEVER leave second-person ("you will", "you can") or conversational prompt instructions in the final text. Always write in formal third-person academic English ("This study focuses on...", "Furthermore, comparative empirical findings from similar urban informal settlements and demographic settings demonstrate...").
3. Use clear, simple, formal academic English suitable for a ${levelSpec.levelLabel} student. ${
    levelSpec.isDiploma
      ? "For methodology and results sections, support both descriptive statistics (frequencies, percentages, means, SD) and inferential statistics (Chi-square tests, t-tests, correlation, p-values) where appropriate."
      : "For methodology and results sections, stick strictly to simple descriptive statistics (frequencies, percentages, averages, tables, and charts)."
  }
4. Output ONLY the polished section text. No preamble, no meta-commentary.

CITATION RULES (strict)
5. You may support a statement ONLY with the SOURCE NOTES below. Weave the paraphrased findings naturally into your paragraphs to support the student's topic and comparative settings; never copy more than four consecutive words and never dump a disconnected list of citations at the end.
6. To cite, write [[cite:ID]] straight after the statement, before the full stop, using an id from the notes. Several sources: [[cite:a]][[cite:b]].
7. Never write an author name, year, title, journal, page number or reference yourself. Never cite anything not in the notes.
8. Do not add statistics or percentages that are not in the student's draft or the notes.

SOURCE NOTES
${sourceNotes}`;

  try {
    if (geminiKey) {
      const text = await callGeminiText(
        `${prompt}\n\nCandidate Draft & Context Notes:\n${cleanedDraft}`,
        geminiKey,
        { temperature: 0.35, timeoutMs: 25000 }
      );
      if (text && text.length > 50) return text;
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Candidate Draft & Context Notes:\n${cleanedDraft}` },
          ],
          temperature: 0.35,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 50) return text.trim();
      }
    }
  } catch (err) {
    console.warn("External LLM section polish failed, utilizing built-in academic engine:", err);
  }

  return null;
}

// ============================================================================
// Built-in Deterministic KNEC Academic Engine
// ============================================================================

function detectKenyaLocation(text: string): string {
  const t = text.toLowerCase();

  // Check specific urban informal settlements / sub-locations first so they are never lost!
  const settlements: Array<[string, string]> = [
    ["mathare", "Mathare Informal Settlement, Nairobi County"],
    ["kibera", "Kibera Informal Settlement, Nairobi County"],
    ["mukuru", "Mukuru Informal Settlement, Nairobi County"],
    ["korogocho", "Korogocho Informal Settlement, Nairobi County"],
    ["kawangware", "Kawangware, Nairobi County"],
    ["dandora", "Dandora, Nairobi County"],
    ["kangemi", "Kangemi, Nairobi County"],
    ["viwandani", "Viwandani Informal Settlement, Nairobi County"],
    ["eastleigh", "Eastleigh, Nairobi County"],
    ["kisauni", "Kisauni, Mombasa County"],
    ["likoni", "Likoni, Mombasa County"],
    ["nyalenda", "Nyalenda Informal Settlement, Kisumu County"],
    ["kondele", "Kondele, Kisumu County"],
  ];

  for (const [key, label] of settlements) {
    if (t.includes(key)) return label;
  }

  const counties = [
    "kitui", "kilifi", "kisumu", "turkana", "machakos", "homa bay", "nairobi", "mombasa",
    "nakuru", "kakamega", "meru", "kiambu", "uasin gishu", "garissa", "mandera", "wajir",
    "bungoma", "kwale", "makueni", "embu", "nyeri", "murang'a", "kericho", "bomet", "isiolo",
    "marsabit", "samburu", "kajiado", "narok", "vihiga", "busia", "siaya", "kisii", "nyamira",
    "migori", "taita taveta", "lamu", "tana river", "tharaka nithi", "nyandarua", "kirinyaga",
    "laikipia", "nandi", "baringo", "elgeyo marakwet", "west pokot", "trans nzoia",
  ];

  for (const c of counties) {
    if (t.includes(c) || (c === "kitui" && t.includes("kitu"))) {
      return c.charAt(0).toUpperCase() + c.slice(1) + " County";
    }
  }

  if (t.includes("school") || t.includes("pupil") || t.includes("student")) {
    return "Selected Public Primary Schools";
  }
  if (t.includes("rural")) return "Selected Rural Community";
  if (t.includes("urban")) return "Selected Urban Community";
  return "the Study Area";
}

function detectFoodIngredients(text: string): { ingA: string; ingB: string } {
  const t = text.toLowerCase();
  let ingA = "Orange-Fleshed Sweet Potato";
  let ingB = "Soybean";

  if (t.includes("sweet potato") || t.includes("ofsp")) ingA = "Orange-Fleshed Sweet Potato";
  else if (t.includes("cassava")) ingA = "Cassava";
  else if (t.includes("banana") || t.includes("plantain")) ingA = "Green Banana";
  else if (t.includes("pumpkin")) ingA = "Pumpkin Seed";

  if (t.includes("amaranth")) ingB = "Amaranth Grain";
  else if (t.includes("soy") || t.includes("soya")) ingB = "Soybean";
  else if (t.includes("millet")) ingB = "Finger Millet";
  else if (t.includes("sorghum")) ingB = "Sorghum";
  else if (t.includes("groundnut") || t.includes("peanut")) ingB = "Groundnut";

  return { ingA, ingB };
}

function generateDeterministicTopics(
  query: string,
  type: "research_secondary" | "trade_fabrication" | "business_plan",
  course: string,
  level: string = "certificate"
): TopicNarrowingResult {
  const loc = detectKenyaLocation(query);
  const levelSpec = getAcademicLevelSpec(level);

  const q = query.toLowerCase();

  const isResearchQuery =
    q.includes("factor") ||
    q.includes("contribut") ||
    q.includes("determinant") ||
    q.includes("prevalen") ||
    q.includes("wast") ||
    q.includes("stunt") ||
    q.includes("underweight") ||
    q.includes("malnutrit") ||
    q.includes("kdhs") ||
    q.includes("breastfe") ||
    q.includes("attendance") ||
    q.includes("intake") ||
    q.includes("maternal") ||
    q.includes("hypertens") ||
    q.includes("diabet");

  const isExplicitProduct =
    q.includes("flour") ||
    q.includes("biscuit") ||
    q.includes("dry") ||
    q.includes("drier") ||
    q.includes("recipe") ||
    q.includes("process") ||
    q.includes("bake") ||
    q.includes("juice") ||
    q.includes("yogurt") ||
    q.includes("bread") ||
    q.includes("snack") ||
    q.includes("paste") ||
    q.includes("rutf") ||
    q.includes("rusf");

  // If a student entered a pure public health/epidemiological research query without asking for a food product,
  // route directly to the Secondary Research generator so they get precise KDHS and facility study proposals.
  if (type === "trade_fabrication" && isResearchQuery && !isExplicitProduct) {
    return generateSecondaryDataTopics(query, loc, level);
  }

  // 1. Food Science / Trade Formulation
  if (type === "trade_fabrication") {
    // Condition-tailored formulations
    if (q.includes("wast") || q.includes("malnutrit") || q.includes("acute")) {
      return {
        problemAnalysis: `Formulating targeted therapeutic or supplementary foods under ${course} (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) provides practical clinical nutrition solutions for acute child wasting in ${loc}.`,
        options: [
          {
            id: "tf-w1",
            title: `Formulation and Sensory Evaluation of a Locally Sourced Ready-to-Use Supplementary Food (RUSF) Paste for Children with Wasting in ${loc}`,
            problemSummary: `Commercial therapeutic foods for wasting are expensive and often imported, leaving vulnerable children in arid and resource-poor communities without accessible rehabilitation feeds.`,
            generalObjective: `To formulate and evaluate the sensory acceptability of a nutrient-dense RUSF paste using locally available peanuts, roasted sorghum, and milk powder in ${loc}.`,
            specificObjectives: [
              `1. To roast, mill, and blend local peanuts, sorghum, and dry milk into a smooth lipid-rich paste.`,
              `2. To prepare three experimental formulation ratios meeting WHO/UNICEF macronutrient guidelines for supplementary feeding.`,
              `3. To evaluate sensory acceptability (taste, mouthfeel, aroma) with a trained testing panel.`,
            ],
            methodologyHint: `Kitchen batch formulation, hygiene standard trials, and a 9-point hedonic sensory evaluation panel analyzed using ${levelSpec.analysisMethods}.`,
          },
          {
            id: "tf-w2",
            title: `Development and Proximate Analysis of High-Energy Composite Porridge Flour for Management of Child Undernutrition in ${loc}`,
            problemSummary: `Traditional cereal gruels provided to wasted children have high water content, low energy density, and inadequate protein to support rapid catch-up growth.`,
            generalObjective: `To develop and evaluate the nutrient density of an energy-dense composite flour blend from locally accessible grains and legumes.`,
            specificObjectives: [
              `1. To process, pre-cook (roast), and mill selected grains to reduce dietary bulk and starch viscosity.`,
              `2. To blend the composite flours in ratios designed to deliver at least 400 kcal per 100g.`,
              `3. To evaluate sensory acceptability and cooked porridge consistency with a panel of mothers and care-givers.`,
            ],
            methodologyHint: `Grain germination or roasting trials, standardized viscosity testing, and sensory acceptance scoring analyzed using ${levelSpec.analysisMethods}.`,
          },
          {
            id: "tf-w3",
            title: `Processing and Quality Assessment of a Fortified Lipid-Based Nutrient Supplement (LNS) Prototype in ${loc}`,
            problemSummary: `Infants recovering from wasting suffer frequent relapses due to inadequate home micronutrient fortification during convalescence.`,
            generalObjective: `To prepare and test the physical stability and acceptability of a small-quantity lipid-based nutrient supplement prototype.`,
            specificObjectives: [
              `1. To blend vegetable oil, legume flours, and micronutrient premix into a homogeneous shelf-stable spread.`,
              `2. To monitor oil separation and physical texture over a 4-week storage period at ambient temperature.`,
              `3. To evaluate taste acceptability and ease of feeding with a sensory assessment panel.`,
            ],
            methodologyHint: `Pilot spread formulation, room temperature accelerated shelf stability observation, and acceptability testing analyzed using ${levelSpec.analysisMethods}.`,
          },
        ],
        followUpQuestion: `Would you prefer to develop a Ready-to-Use Supplementary Food (RUSF) paste, high-energy composite porridge flour, or an LNS spread prototype?`,
      };
    }

    if (q.includes("diabet") || q.includes("hypertens") || q.includes("glycem") || q.includes("sugar")) {
      return {
        problemAnalysis: `Developing low-glycemic, high-fiber functional foods under ${course} (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) supports community dietary management of non-communicable diseases.`,
        options: [
          {
            id: "tf-d1",
            title: `Formulation and Sensory Acceptability of Low-Glycemic Index Composite Flour from Sorghum, Millet, and Fenugreek for Diabetic Management in ${loc}`,
            problemSummary: `Diabetic patients frequently struggle to find staple flour alternatives that prevent rapid postprandial blood glucose spikes.`,
            generalObjective: `To formulate and test a palatable low-glycemic flour blend using high-fiber indigenous grains.`,
            specificObjectives: [
              `1. To clean and mill whole sorghum, finger millet, and fenugreek seeds into uniform flour blends.`,
              `2. To prepare composite ugali or porridge samples across three formulation ratios.`,
              `3. To assess consumer sensory acceptability and texture preferences among an evaluation panel.`,
            ],
            methodologyHint: `Milling and blending trials, sensory evaluation panel, and estimated glycemic response analysis using ${levelSpec.analysisMethods}.`,
          },
          {
            id: "tf-d2",
            title: `Development and Quality Assessment of High-Fiber Snack Crackers Incorporating Legume Flours for Diabetic Diets in ${loc}`,
            problemSummary: `Commercial snack foods are high in refined wheat flour and added sugars, lacking healthy options for individuals managing diabetes.`,
            generalObjective: `To formulate and bake a high-dietary-fiber snack cracker incorporating pigeon pea or chickpea flour.`,
            specificObjectives: [
              `1. To prepare cracker dough using varying proportions of composite pulse and whole cereal flours.`,
              `2. To bake test batches under standardized oven temperature and timing.`,
              `3. To evaluate crispness, sensory acceptability, and packaging moisture resistance.`,
            ],
            methodologyHint: `Baking trials, moisture-barrier packaging testing, and sensory acceptance scoring analyzed using ${levelSpec.analysisMethods}.`,
          },
          {
            id: "tf-d3",
            title: `Processing and Physicochemical Evaluation of Herbal Dietary Tea Infusions for Blood Pressure Support in ${loc}`,
            problemSummary: `Local communities lack standardized, hygienically packaged herbal tea blends formulated to support cardiovascular health.`,
            generalObjective: `To process and assess the acceptability of a dried herbal infusion blend combining hibiscus and indigenous herbs.`,
            specificObjectives: [
              `1. To wash, solar dry, and mill herbal ingredients into tea-bag grade granules.`,
              `2. To blend experimental infusions and evaluate liquor color, aroma, and taste acceptability.`,
              `3. To assess moisture content and packaging shelf stability under ambient conditions.`,
            ],
            methodologyHint: `Drying experiment, sensory infusion panel, and moisture content recording analyzed using ${levelSpec.analysisMethods}.`,
          },
        ],
        followUpQuestion: `Do you prefer to formulate composite flour for ugali, high-fiber baked crackers, or herbal infusion teas?`,
      };
    }

    const { ingA, ingB } = detectFoodIngredients(query);

    return {
      problemAnalysis: `Developing practical value-added food products under ${course} (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) addresses local community nutrition needs and uses ${levelSpec.analysisMethods}.`,
      options: [
        {
          id: "tf-1",
          title: `Formulation and Sensory Acceptability of Composite Porridge Flour from ${ingA} and ${ingB} in ${loc}`,
          problemSummary: `Single-cereal porridges lack adequate protein and essential micronutrients, leading to poor growth and nutrient deficiencies among young children.`,
          generalObjective: `To formulate and evaluate the sensory acceptability of a nutrient-dense composite porridge flour from ${ingA} and ${ingB}.`,
          specificObjectives: [
            `1. To clean, dry, and mill raw ${ingA} and ${ingB} into fine flours.`,
            `2. To blend three experimental formulation ratios (70:30, 60:40, and 50:50).`,
            `3. To evaluate consumer sensory acceptability (taste, aroma, color, texture) with a 20-member panel.`,
          ],
          methodologyHint: `Practical formulation trials, standardized cooking, and a 9-point hedonic sensory evaluation panel analyzed using ${levelSpec.analysisMethods}.`,
        },
        {
          id: "tf-2",
          title: `Development and Quality Assessment of Nutrient-Enriched Biscuits Incorporating ${ingA} in ${loc}`,
          problemSummary: `Commercial snacks consumed by school children are high in refined sugars and low in dietary fiber and essential vitamins.`,
          generalObjective: `To formulate and assess the sensory quality of baked biscuits enriched with ${ingA} flour.`,
          specificObjectives: [
            `1. To prepare standardized biscuit dough with varying inclusion levels of ${ingA}.`,
            `2. To bake prototype batches under controlled oven temperature and time.`,
            `3. To assess consumer sensory acceptability and physical texture of the baked biscuits.`,
          ],
          methodologyHint: `Kitchen baking trials, airtight packaging in clean pouches, and consumer acceptability scorecards analyzed using ${levelSpec.analysisMethods}.`,
        },
        {
          id: "tf-3",
          title: `Processing and Quality Evaluation of Solar-Dried ${ingA} Slices using a Simple Dryer in ${loc}`,
          problemSummary: `Seasonal overproduction of perishable produce leads to heavy post-harvest rotting and economic losses for rural smallholder farmers.`,
          generalObjective: `To evaluate the quality and drying duration of ${ingA} slices dried using a simple solar cabinet dryer.`,
          specificObjectives: [
            `1. To wash, peel, slice, and pretreat raw ${ingA} prior to dehydration.`,
            `2. To compare drying duration and moisture reduction under solar drying versus open-sun drying.`,
            `3. To assess the visual color, crispness, and rehydration properties of the dried slices.`,
          ],
          methodologyHint: `Cabinet solar drying experiment, weight loss recording at regular intervals, and sensory evaluation analyzed using ${levelSpec.analysisMethods}.`,
        },
      ],
      followUpQuestion: `Which practical product do you prefer to develop: composite porridge flour, enriched biscuits, or solar-dried food slices?`,
    };
  }

  // 2. Business Plan Track (Strict KNEC TVET 5-Chapter Commercial Enterprise Standard)
  if (type === "business_plan") {
    const isConsulting =
      q.includes("consult") ||
      q.includes("clinic") ||
      q.includes("advis") ||
      q.includes("counsel") ||
      q.includes("diet") ||
      q.includes("service") ||
      q.includes("therap") ||
      q.includes("wellness");

    const isMilling =
      q.includes("mill") ||
      q.includes("flour") ||
      q.includes("porridge") ||
      q.includes("cereal") ||
      q.includes("grain") ||
      q.includes("composite") ||
      q.includes("soy") ||
      q.includes("sorghum") ||
      q.includes("millet");

    const isBeverage =
      q.includes("juice") ||
      q.includes("fruit") ||
      q.includes("snack") ||
      q.includes("bak") ||
      q.includes("bread") ||
      q.includes("biscuit") ||
      q.includes("yogurt") ||
      q.includes("dairy");

    if (isConsulting) {
      return {
        problemAnalysis: `Developing a nutrition advisory practice (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) provides vital community wellness services while building a profitable, self-employed enterprise in Kenya.`,
        options: [
          {
            id: "bp-c1",
            title: `Business Plan for Establishing a Nutrition and Dietetics Consultancy Practice in ${loc}`,
            problemSummary: `Local residents managing lifestyle conditions like diabetes, hypertension, and obesity lack access to affordable, private nutrition counseling and personalized diet planning.`,
            businessConcept: `A community-based clinical nutrition and wellness practice offering individualized dietary assessments, medical nutrition therapy, diabetic meal plans, and maternal-child nutrition coaching.`,
            productsServices: `Clinical dietary consultations, personalized meal planning, diabetic and hypertensive diet management packages, and corporate wellness coaching sessions.`,
            targetMarket: `Doctor-referred clinic patients, individuals managing chronic lifestyle conditions, pregnant/lactating women, and health-conscious adults.`,
            startupCapital: `KES 280,000 (Consulting room lease, bioimpedance body composition analyzer, infant & adult scales, ICT equipment, and county permits).`,
            commercialGoals: [
              `Onboard 35 regular monthly consultation clients within the first 6 months.`,
              `Establish referral partnerships with 5 local private clinics and community pharmacies.`,
              `Achieve operational break-even by month 6 with projected monthly revenue of KES 140,000.`,
            ],
            generalObjective: `To prepare a viable commercial business plan for establishing a nutrition consultancy practice in ${loc}.`,
            specificObjectives: [
              `1. To assess target client demand and private clinic referral networks across ${loc}.`,
              `2. To establish clinical consultation workflows, service fees, and professional licensing compliance.`,
              `3. To develop comprehensive 3-year financial statements demonstrating profitability and capital recovery.`,
            ],
            methodologyHint: `Client willingness-to-pay survey, clinic referral interviews, and 3-year pro-forma financial statements for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-c2",
            title: `Business Plan for a Community Maternal and Child Nutrition Advisory Clinic in ${loc}`,
            problemSummary: `Young mothers frequently encounter infant feeding difficulties, early weaning challenges, and poor child growth without convenient professional guidance.`,
            businessConcept: `A specialized pediatric and maternal nutrition center offering growth monitoring, lactation counseling, infant complementary feeding demos, and home visits.`,
            productsServices: `Growth tracking subscriptions, complementary feeding guidance, lactation support, and nutrient-dense porridge starter packs.`,
            targetMarket: `Mothers of children under two, pregnant women, daycare centers, and local community health groups.`,
            startupCapital: `KES 240,000 (Premises fit-out, infant anthropometric equipment, demonstration kitchen tools, and licensing).`,
            commercialGoals: [
              `Enroll 50 mother-child pairs in monthly growth tracking and dietary counseling by month 4.`,
              `Conduct bi-weekly community nutrition education workshops for caregivers.`,
              `Attain operational break-even within 7 months of operation.`,
            ],
            generalObjective: `To prepare a viable commercial business plan for a maternal and child nutrition clinic in ${loc}.`,
            specificObjectives: [
              `1. To survey local demand for personalized infant feeding guidance among 40 mothers.`,
              `2. To outline clinical service protocols, staff requirements, and operational safety.`,
              `3. To calculate startup capital, pricing tiers, and projected 1-year profit and loss.`,
            ],
            methodologyHint: `Target mother interviews, local health facility consultations, and cash flow projections for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-c3",
            title: `Business Plan for a Lifestyle Diseases Dietary Wellness Hub in ${loc}`,
            problemSummary: `Patients diagnosed with diabetes and cardiovascular conditions struggle to locate low-glycemic meal options, whole foods, and ongoing diet management.`,
            businessConcept: `An integrated dietary wellness facility combining dietary counseling with a specialized whole-foods pantry delivering low-glycemic, low-sodium meal solutions.`,
            productsServices: `Diabetic meal prep guidance, low-sodium pantry products, whole-grain flour blends, and bi-weekly blood sugar/pressure dietary check-ins.`,
            targetMarket: `Hypertensive and diabetic patients, overweight individuals, and elderly clients requiring specialized nutrition.`,
            startupCapital: `KES 320,000 (Office lease, display shelving, initial stock of specialized whole-grain foods, and diagnostic equipment).`,
            commercialGoals: [
              `Build an active client registry of 60 regular lifestyle-management subscribers in Year 1.`,
              `Achieve a gross monthly profit margin of 40% on healthy food and consulting packages.`,
              `Recover initial startup investment within 10 months of launching.`,
            ],
            generalObjective: `To develop a viable commercial business plan for a dietary wellness and food hub in ${loc}.`,
            specificObjectives: [
              `1. To evaluate market demand for specialized lifestyle meal packages and pantry supplies.`,
              `2. To define sourcing channels for certified organic grains, equipment layout, and store operations.`,
              `3. To project 3-year cash flow, break-even sales volume, and return on investment.`,
            ],
            methodologyHint: `Market demand questionnaires, distributor price quotes, and 3-year pro-forma balance sheet for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
        ],
        followUpQuestion: `Would you prefer to focus on a general clinical nutrition practice, maternal-child nutrition advisory, or a lifestyle disease wellness hub?`,
      };
    }

    if (isMilling) {
      return {
        problemAnalysis: `Establishing a small-scale composite flour milling enterprise (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) addresses community malnutrition while generating steady manufacturing income.`,
        options: [
          {
            id: "bp-m1",
            title: `Business Plan for Establishing a Fortified Composite Porridge Flour Milling Enterprise in ${loc}`,
            problemSummary: `Local mothers and families lack access to clean, affordable, and hygienically packaged composite porridge flour within neighborhood retail kiosks.`,
            businessConcept: `A micro-scale agro-processing mill that procures indigenous grains (sorghum, finger millet, amaranth, and soybean) to produce hygienically blended, nutrient-dense composite flours.`,
            productsServices: `500g and 1kg branded laminated pouches of infant composite flour, family breakfast porridge flour, and whole-grain diabetic flour.`,
            targetMarket: `Households with young children, primary school feeding canteens, community health centers, and neighborhood retail kiosks.`,
            startupCapital: `KES 380,000 (Commercial hammer mill, moisture meter, impulse sealer, initial grain inventory, and KEBS standardization).`,
            commercialGoals: [
              `Process and distribute 2,000 kg of packaged composite flour per month in Year 1.`,
              `Secure retail placement in 30 neighborhood shops and 3 supermarkets across ${loc}.`,
              `Achieve break-even by month 7 with a Year 1 net profit margin exceeding 22%.`,
            ],
            generalObjective: `To prepare a viable business plan for establishing a composite porridge flour milling enterprise in ${loc}.`,
            specificObjectives: [
              `1. To conduct a market survey of 40 households and 15 retail kiosks to evaluate flour demand.`,
              `2. To design the grain cleaning, roasting, milling, packaging workflow, and equipment sourcing.`,
              `3. To compute total start-up costs, unit break-even volume, and 3-year pro-forma financial statements.`,
            ],
            methodologyHint: `Household purchasing survey, supplier quotes for grain and hammer mills, and 3-year financial models for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-m2",
            title: `Business Plan for a Micro-Scale Infant Weaning Foods Processing Plant in ${loc}`,
            problemSummary: `Commercial baby cereals in supermarkets are too expensive for low- and middle-income families, while informal cereal blends lack hygiene safeguards.`,
            businessConcept: `A certified sanitary food processing venture producing precooked, digestible complementary feeding flours fortified with biofortified orange-fleshed sweet potato and roasted pulses.`,
            productsServices: `250g and 500g moisture-barrier containers of instant complementary baby porridge and nutrient-dense convalescent feeding mixes.`,
            targetMarket: `Mothers of weaning infants aged 6-24 months, private maternity clinics, daycare centers, and local community pharmacies.`,
            startupCapital: `KES 350,000 (Grain roasting drum, stainless steel pulverizer, hygienic pouch sealer, and KEBS certification).`,
            commercialGoals: [
              `Reach monthly production and sales of 1,200 packaged units by month 4.`,
              `Partner with 10 maternal-child health clinics for educational product stocking.`,
              `Break even at 650 units sold per month within the first half-year.`,
            ],
            generalObjective: `To develop a business plan for an infant weaning foods processing enterprise in ${loc}.`,
            specificObjectives: [
              `1. To assess parental willingness-to-pay and infant feeding preferences in ${loc}.`,
              `2. To detail factory layout, KEBS hygiene protocols, and raw material procurement contracts.`,
              `3. To formulate 3-year income statements, cash flow budgets, and balance sheet projections.`,
            ],
            methodologyHint: `Maternal consumer survey, machinery quotations, and pro-forma financial schedules for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-m3",
            title: `Business Plan for a Hygienic Grain Cleaning, Milling, and Packaging Depot in ${loc}`,
            problemSummary: `Urban consumers and grain producers lose quality and nutritional value due to stone contamination, high moisture, and unhygienic traditional hammer mills.`,
            businessConcept: `A modern community milling service and retail hub offering mechanical grain destoning, precision moisture testing, custom composite blending, and sealed packaging.`,
            productsServices: `Grain destoning and toll milling services, custom composite flour blending, and retail supply of clean whole flours.`,
            targetMarket: `Urban households, small bakeries, boarding schools, and local smallholder grain farmers.`,
            startupCapital: `KES 310,000 (Electric grain destoner, commercial hammer mill, electronic scales, and shop leasing).`,
            commercialGoals: [
              `Serve 30 milling customers daily and process 3,500 kg weekly in Year 1.`,
              `Generate consistent positive operating cash flow starting from month 2.`,
              `Pay off initial capital equipment loan within 12 months.`,
            ],
            generalObjective: `To prepare a viable commercial business plan for a modern grain milling depot in ${loc}.`,
            specificObjectives: [
              `1. To determine daily grain milling traffic and commercial pricing expectations in ${loc}.`,
              `2. To outline equipment specifications, electricity load requirements, and workshop layout.`,
              `3. To calculate monthly break-even milling volumes, operational overheads, and annual returns.`,
            ],
            methodologyHint: `Market trade survey, equipment energy consumption audit, and 3-year cash flow forecast for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
        ],
        followUpQuestion: `Which milling enterprise model do you prefer: fortified composite porridge flours, infant weaning foods, or a modern custom milling depot?`,
      };
    }

    if (isBeverage) {
      return {
        problemAnalysis: `Developing a value-addition beverage or snack enterprise (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) captures high retail margins while addressing demand for healthy, natural products.`,
        options: [
          {
            id: "bp-b1",
            title: `Business Plan for Small-Scale Natural Fresh Fruit Juice Processing and Bottling in ${loc}`,
            problemSummary: `Commercial retail shops are filled with sugar-loaded artificial cordials, while fresh seasonal fruits rot at farmgate due to lack of local processing facilities.`,
            businessConcept: `A hygienic food processing unit that extracts, pasteurizes, and bottles fresh local seasonal fruits into 100% natural juices free from artificial additives.`,
            productsServices: `300ml and 500ml tamper-proof bottles of fresh mango-passion, pineapple-mint, and citrus fruit juices.`,
            targetMarket: `School canteens, commercial office workers, hospital cafeterias, gym enthusiasts, and event caterers.`,
            startupCapital: `KES 320,000 (Commercial cold press extractor, pasteurization tank, stainless steel worktables, bottles, and inventory).`,
            commercialGoals: [
              `Process and retail 4,000 bottles of fresh juice per month in Year 1.`,
              `Establish supply contracts with 8 institutional cafeterias and school canteens.`,
              `Reach break-even point within 6 months of operations.`,
            ],
            generalObjective: `To prepare a commercial business plan for processing and distributing natural fruit juices in ${loc}.`,
            specificObjectives: [
              `1. To survey institutional buyer demand and consumer price sensitivity across ${loc}.`,
              `2. To design cold-chain storage, pasteurization workflow, and public health food handling protocols.`,
              `3. To compute unit production costs, wholesale/retail margins, and 3-year financial statements.`,
            ],
            methodologyHint: `Consumer taste test survey, packaging supplier quotes, and 3-year financial schedules for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-b2",
            title: `Business Plan for a Healthy High-Fiber Bakery and Snack Enterprise in ${loc}`,
            problemSummary: `Urban commuters and school children consume high-calorie refined wheat snacks that lack dietary fiber and essential micronutrients.`,
            businessConcept: `A specialized bakery producing high-fiber cookies, sweet potato buns, and nutrient-enriched muffins utilizing locally sourced composite flours.`,
            productsServices: `Individual and family packs of biofortified sweet potato muffins, amaranth crackers, and diabetic-friendly pulse biscuits.`,
            targetMarket: `School students, urban commuters, hospital cafeterias, and health-conscious families.`,
            startupCapital: `KES 290,000 (Commercial convection oven, dough mixer, stainless steel baking trays, and packaging materials).`,
            commercialGoals: [
              `Bake and distribute 500 snack packs daily to local kiosks and schools.`,
              `Achieve operational break-even by month 5 with steady daily cash collections.`,
              `Expand supply routes to 3 neighboring towns by month 12.`,
            ],
            generalObjective: `To develop a commercial business plan for a healthy high-fiber bakery in ${loc}.`,
            specificObjectives: [
              `1. To evaluate retail shop demand and daily snack purchasing patterns across ${loc}.`,
              `2. To specify kitchen bakery workflow, equipment layout, and food safety standards.`,
              `3. To prepare 3-year pro-forma income statement, cash flow budget, and balance sheet.`,
            ],
            methodologyHint: `Retail vendor survey, baking equipment quotes, and pro-forma financial models for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
          {
            id: "bp-b3",
            title: `Business Plan for a Solar-Dried Fruit and Vegetable Packaging Enterprise in ${loc}`,
            problemSummary: `Farmers suffer up to 40% post-harvest loss during fruit harvest gluts, while urban markets face severe vegetable shortages during dry seasons.`,
            businessConcept: `An agribusiness venture utilizing cabinet solar dryers to process surplus mangoes, bananas, and indigenous green vegetables into shelf-stable dried products.`,
            productsServices: `100g vacuum-sealed bags of dried mango chews, banana chips, and powdered indigenous vegetables (kunde, managu).`,
            targetMarket: `Supermarkets, travelers, school snackers, and specialty food stores in urban centers.`,
            startupCapital: `KES 260,000 (Cabinet solar dryer, chamber vacuum sealer, moisture tester, and branded pouch packaging).`,
            commercialGoals: [
              `Process 600 kg of fresh seasonal produce monthly into value-added dried packs.`,
              `Contract 15 local smallholder fruit farmers to eliminate post-harvest gluts.`,
              `Break even within 6 months with a 35% gross profit margin.`,
            ],
            generalObjective: `To prepare a viable commercial business plan for a solar-dried fruit and vegetable enterprise in ${loc}.`,
            specificObjectives: [
              `1. To assess supermarket buyer requirements and retail shelf-space opportunities.`,
              `2. To establish solar drying parameters, packaging moisture barrier specifications, and hygiene protocols.`,
              `3. To formulate 3-year cash flow projections, break-even unit sales, and return on investment.`,
            ],
            methodologyHint: `Supermarket buyer interviews, dryer construction material quotes, and financial forecast models for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
          },
        ],
        followUpQuestion: `Would you prefer to launch fresh natural juices, a high-fiber composite bakery, or a solar-dried fruit and vegetable venture?`,
      };
    }

    // Default: General TVET Nutrition Enterprises across consulting, milling, and beverages
    return {
      problemAnalysis: `Launching a nutrition or food enterprise (${levelSpec.levelLabel} standard: ≥${levelSpec.targetPages} pages) provides essential community wellness services while creating sustainable self-employment in Kenya.`,
      options: [
        {
          id: "bp-g1",
          title: `Business Plan for Establishing a Nutrition and Dietetics Consultancy Practice in ${loc}`,
          problemSummary: `Community members managing chronic lifestyle diseases (diabetes, hypertension) lack convenient, private dietary guidance and customized meal planning.`,
          businessConcept: `A community-based clinical nutrition practice offering individualized dietary counseling, medical nutrition therapy, diabetic meal plans, and wellness workshops.`,
          productsServices: `Dietary consultations, diabetic meal plans, hypertension diet packages, and corporate wellness coaching sessions.`,
          targetMarket: `Doctor-referred clinic patients, individuals managing chronic lifestyle conditions, pregnant/lactating women, and health-conscious adults.`,
          startupCapital: `KES 280,000 (Consulting room lease, bioimpedance analyzer, anthropometric scales, ICT equipment, and county permits).`,
          commercialGoals: [
            `Onboard 35 regular monthly consultation clients within the first 6 months.`,
            `Establish referral partnerships with 5 local private clinics and community pharmacies.`,
            `Achieve operational break-even by month 6 with projected monthly revenue of KES 140,000.`,
          ],
          generalObjective: `To prepare a viable commercial business plan for establishing a nutrition consultancy practice in ${loc}.`,
          specificObjectives: [
            `1. To assess target client demand and clinic referral networks across ${loc}.`,
            `2. To establish consultation workflows, service fees, and professional licensing compliance.`,
            `3. To develop comprehensive 3-year financial statements demonstrating profitability and capital recovery.`,
          ],
          methodologyHint: `Client willingness-to-pay survey, clinic referral interviews, and 3-year pro-forma financial statements for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
        },
        {
          id: "bp-g2",
          title: `Business Plan for Establishing a Fortified Composite Porridge Flour Milling Enterprise in ${loc}`,
          problemSummary: `Local mothers and families lack access to clean, affordable, and hygienically packaged composite porridge flour within neighborhood retail kiosks.`,
          businessConcept: `A micro-scale agro-processing mill that procures indigenous grains (sorghum, finger millet, amaranth, and soybean) to produce hygienically blended, nutrient-dense composite flours.`,
          productsServices: `500g and 1kg branded laminated pouches of infant composite flour, family breakfast porridge flour, and whole-grain diabetic flour.`,
          targetMarket: `Households with young children, primary school feeding canteens, community health centers, and neighborhood retail kiosks.`,
          startupCapital: `KES 380,000 (Commercial hammer mill, moisture meter, impulse sealer, initial grain inventory, and KEBS standardization).`,
          commercialGoals: [
            `Process and distribute 2,000 kg of packaged composite flour per month in Year 1.`,
            `Secure retail placement in 30 neighborhood shops and 3 supermarkets across ${loc}.`,
            `Achieve break-even by month 7 with a Year 1 net profit margin exceeding 22%.`,
          ],
          generalObjective: `To prepare a viable business plan for establishing a composite porridge flour milling enterprise in ${loc}.`,
          specificObjectives: [
            `1. To conduct a market survey of 40 households and 15 retail kiosks to evaluate flour demand.`,
            `2. To design the grain cleaning, roasting, milling, packaging workflow, and equipment sourcing.`,
            `3. To compute total start-up costs, unit break-even volume, and 3-year pro-forma financial statements.`,
          ],
          methodologyHint: `Household purchasing survey, supplier quotes for grain and hammer mills, and 3-year financial models for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
        },
        {
          id: "bp-g3",
          title: `Business Plan for Small-Scale Natural Fresh Fruit Juice Processing and Bottling in ${loc}`,
          problemSummary: `Commercial retail shops are filled with sugar-loaded artificial cordials, while fresh seasonal fruits rot at farmgate due to lack of local processing facilities.`,
          businessConcept: `A hygienic food processing unit that extracts, pasteurizes, and bottles fresh local seasonal fruits into 100% natural juices free from artificial additives.`,
          productsServices: `300ml and 500ml tamper-proof bottles of fresh mango-passion, pineapple-mint, and citrus fruit juices.`,
          targetMarket: `School canteens, commercial office workers, hospital cafeterias, gym enthusiasts, and event caterers.`,
          startupCapital: `KES 320,000 (Commercial cold press extractor, pasteurization tank, stainless steel worktables, bottles, and inventory).`,
          commercialGoals: [
            `Process and retail 4,000 bottles of fresh juice per month in Year 1.`,
            `Establish supply contracts with 8 institutional cafeterias and school canteens.`,
            `Reach break-even point within 6 months of operations.`,
          ],
          generalObjective: `To prepare a commercial business plan for processing and distributing natural fruit juices in ${loc}.`,
          specificObjectives: [
            `1. To survey institutional buyer demand and consumer price sensitivity across ${loc}.`,
            `2. To design cold-chain storage, pasteurization workflow, and public health food handling protocols.`,
            `3. To compute unit production costs, wholesale/retail margins, and 3-year financial statements.`,
          ],
          methodologyHint: `Consumer taste test survey, packaging supplier quotes, and 3-year financial schedules for a ${levelSpec.targetPages}+ page KNEC Business Plan.`,
        },
      ],
      followUpQuestion: `Which commercial enterprise matches your career path: nutrition consultancy practice, composite flour milling, or natural fruit juice processing?`,
    };
  }

  // 3. Nutrition & Dietetics Research (Certificate & Diploma Standard: Descriptive Cross-Sectional Secondary Data Design)
  return generateSecondaryDataTopics(query, loc, level);
}

function extractTopicEntities(draftText: string, context: WorkspaceContext) {
  const cleanedDraft = stripDuplicateTitleHeaders(draftText);
  const combined = `${cleanedDraft} ${context.title || ""} ${context.problemArea || ""}`.toLowerCase();
  const location = detectKenyaLocation(combined);

  // Check if the student explicitly wrote an "Assessment of..." or "Evaluation of..." title in their draft
  const explicitTitleMatch = cleanedDraft.match(
    /(?:^|\n|\.\s*)((?:Assessment|Evaluation|Investigation|Analysis|Determinants|Prevalence)\s+of\s+[^.\n]{15,120})/i
  );

  let title = "";
  if (explicitTitleMatch?.[1]) {
    title = explicitTitleMatch[1]
      .trim()
      .replace(/\bmathare\s+slum\b/gi, "Mathare Informal Settlement")
      .replace(/\bnairobi\b/gi, "Nairobi County")
      .replace(/\s+County\s+County\b/gi, " County");
  } else if (context.title?.trim()) {
    title = context.title.trim();
  }

  // Topic detection
  let topic = "Household Dietary Diversity and Nutritional Outcomes";
  if (
    combined.includes("school") ||
    combined.includes("performance") ||
    combined.includes("pupil") ||
    combined.includes("student") ||
    combined.includes("attendance")
  ) {
    topic = "Household Food Insecurity and Academic Performance among Primary School Pupils";
  } else if (combined.includes("breakfast")) {
    topic = "Breakfast Consumption Habits and Morning Class Concentration";
  } else if (
    (combined.includes("dietary diversity") || combined.includes("diet diversity")) &&
    (combined.includes("under five") || combined.includes("below five") || combined.includes("under-5") || combined.includes("child"))
  ) {
    topic = "Household Dietary Diversity and Nutritional Outcomes among Children Under Five Years";
  } else if (combined.includes("dietary diversity") || combined.includes("diet diversity")) {
    topic = "Household Dietary Diversity and Daily Food Consumption Patterns";
  } else if (combined.includes("stunting") || combined.includes("under-5") || combined.includes("complementary") || combined.includes("weaning")) {
    topic = "Complementary Feeding Practices and Growth of Children Under Five";
  } else if (combined.includes("exclusive breastfeeding") || combined.includes("breastfeeding")) {
    topic = "Exclusive Breastfeeding Practices and Maternal Challenges";
  } else if (combined.includes("pregnant") || combined.includes("maternal") || combined.includes("anc")) {
    topic = "Maternal Dietary Practices and Nutrition during Pregnancy";
  } else if (combined.includes("sweet potato") || combined.includes("composite")) {
    topic = "Formulation and Sensory Acceptability of Composite Porridge Flour";
  } else if (combined.includes("milling") || combined.includes("business plan") || context.workspaceType === "business_plan") {
    topic = "Small-Scale Fortified Composite Flour Milling Enterprise";
  }

  if (!title) {
    title = `Assessment of ${topic} in ${location}`;
  }

  return { location, topic, title };
}

function rewriteStudentDirectivesToAcademic(sentence: string): string {
  let s = sentence.trim();
  // Convert second-person prompt instructions ("You will focus on...", "you can also explore...") into third-person academic prose
  s = s.replace(
    /^you\s+will\s+focus\s+on\s+/i,
    "This study relies on secondary data extracted from "
  );
  s = s.replace(
    /,\s*you\s+can\s+also\s+explore\s+other\s+similar\s+research\s+findings\s+in\s+different\s+geographical\s+areas\s+or\s+demographic\s+settings\.?$/i,
    ", supplemented by comparative empirical findings from related geographical and demographic settings."
  );
  s = s.replace(
    /\byou\s+can\s+also\s+explore\s+/gi,
    "and incorporates comparative evidence from "
  );
  s = s.replace(/^i\s+am\s+investigating\s+(?:on\s+)?/i, "This study investigates ");
  s = s.replace(/^i\s+want\s+to\s+conduct\s+my\s+study\s+in\s+/i, "The study is conducted in ");
  s = s.replace(/^use\s+(kdhs|knbs|moh)/i, "The investigation utilizes secondary records from $1");
  return s;
}

function cleanStudentDraft(draftText: string, stripTitleLine?: string): string[] {
  const deduplicated = stripDuplicateTitleHeaders(draftText);

  return deduplicated
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim().replace(/^(?:[-*•]+|\d+[.)])\s*/, ""))
        .filter(Boolean)
        .map((line) => {
          // Split inline sentences so we can strip a duplicate title sentence and rewrite directives
          const sentences = line
            .split(/(?<=[.?!])\s+/)
            .map((part) => part.trim())
            .filter(Boolean)
            .filter((part) => {
              if (!stripTitleLine) return true;
              const normPart = part.toLowerCase().replace(/[.?!]+$/, "").trim();
              const normTitle = stripTitleLine.toLowerCase().replace(/[.?!]+$/, "").trim();
              return normPart !== normTitle;
            })
            .map(rewriteStudentDirectivesToAcademic);
          return sentences.join(" ");
        })
        .filter(Boolean)
        .map((line) => (/[.?!:]$/.test(line) ? line : `${line}.`))
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .replace(/\bi\b/g, "I")
    )
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

/**
 * Offline engine (no AI key). It never invents topic-specific prose: it tidies the
 * student's own words and adds only evidence sentences from the verified library,
 * each with a generated in-text citation.
 */
function generateDeterministicSectionPolish(params: {
  draftText: string;
  sectionKey: string;
  sectionTitle: string;
  guidance: string;
  minWords: number;
  context: WorkspaceContext;
  evidence: EvidenceNote[];
}): SectionPolishResult {
  const { draftText, sectionKey, minWords, context, evidence } = params;
  const rawWords = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const { title } = extractTopicEntities(draftText, context);
  const levelSpec = getAcademicLevelSpec(context.level);

  const paragraphs: string[] = [];
  const isTitleSection = sectionKey === "proposal.title" || sectionKey === "cover.details";

  if (isTitleSection) {
    paragraphs.push(`### Research Title\n${title}`);
  }

  const bodyParagraphs = cleanStudentDraft(draftText, isTitleSection ? title : undefined);
  if (isTitleSection && bodyParagraphs.length > 0) {
    paragraphs.push(`### Study Rationale\n${bodyParagraphs.join("\n\n")}`);
  } else {
    paragraphs.push(...bodyParagraphs);
  }

  const alreadyCited = new Set(findCitedSources(draftText).map((s) => s.id));
  const freshEvidence = evidence.filter((e) => !alreadyCited.has(e.source.id));
  if (freshEvidence.length > 0) {
    paragraphs.push(
      freshEvidence.map((e) => `${e.claim.text} ${formatInText(e.source)}.`).join(" ")
    );
  }

  const polishedText = paragraphs.join("\n\n");
  const polishedWords = polishedText.trim().split(/\s+/).length;
  const cited = findCitedSources(polishedText);
  const citations = cited.map((s) => toCitationInfo(s, evidence));

  const warnings: string[] = [
    "Basic polish only. Connect the AI service for deeper rewriting and expansion.",
  ];
  if (citations.length > 0) warnings.push(VERIFY_WARNING);
  if (polishedWords < minWords) {
    warnings.push(
      `Add more detail in your own words to reach ${minWords} words (${levelSpec.levelLabel} overall project target: at least ${levelSpec.targetPages} pages).`
    );
  }

  return {
    polishedText,
    wordsOriginal: rawWords,
    wordsPolished: polishedWords,
    wordDiff: polishedWords - rawWords,
    targetMet: polishedWords >= minWords,
    improvements: [
      `Your words kept and formatted for ${levelSpec.levelLabel} standard (≥${levelSpec.targetPages} pages)`,
      citations.length > 0
        ? `${citations.length} verified source(s) cited in text`
        : "No verified source matched this section",
      `Section length now ${polishedWords} words (target ${minWords} words)`,
    ],
    citations,
    warnings,
  };
}

