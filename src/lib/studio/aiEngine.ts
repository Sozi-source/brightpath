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

export interface TopicNarrowingOption {
  id: string;
  title: string;
  problemSummary: string;
  generalObjective: string;
  specificObjectives: string[];
  methodologyHint: string;
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

  // Attempt external LLM if API key is present
  const llmResult = await tryLlmTopicNarrowing(query, context);
  if (llmResult) return llmResult;

  // Built-in Deterministic Academic Alignment Engine
  return generateDeterministicTopics(query, type, course);
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
        "Your ideas kept and written in formal academic style",
        citations.length > 0
          ? `${citations.length} verified source(s) cited in text`
          : "No verified source matched this section",
        `Length now ${polishedWords} words (target ${minWords})`,
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
  const isBusiness = context.workspaceType === "business_plan";
  const isTrade = context.workspaceType === "trade_fabrication";
  const isSecondaryResearch = context.workspaceType === "research_secondary";

  // Proposal Title or Research Title
  if (sectionKey === "proposal.title" || sectionKey === "cover.details") {
    if (isBusiness) {
      return {
        mainQuestion: "What enterprise or product idea do you wish to establish?",
        subQuestions: [
          "What specific food commodity, fortified flour, or dietary service will you provide?",
          "Which target town, county, or local community market will you operate in?",
          "What is your proposed enterprise name or trade identity?",
        ],
        placeholderExample:
          'e.g. "I want to establish a commercial milling enterprise producing fortified composite flour from orange-fleshed sweet potato and amaranth for young children in Kisumu Central..."',
      };
    }
    if (isTrade) {
      return {
        mainQuestion: "What food product or formulation do you wish to develop?",
        subQuestions: [
          "What raw materials or biofortified crops will you combine (e.g. cassava, soy, amaranth, pumpkin seed)?",
          "What is the intended form of the product (e.g. composite flour, extruded snack, dehydrated puree)?",
          "What practical deficiency or target consumer group does this solve?",
        ],
        placeholderExample:
          'e.g. "I want to formulate a nutrient-dense composite complementary porridge flour using 60% orange-fleshed sweet potato and 40% soybean to address protein-energy malnutrition..."',
      };
    }
    return {
      mainQuestion: "What straightforward nutrition topic will you investigate using existing secondary data?",
      subQuestions: [
        "What specific nutrition issue are you studying (e.g. child stunting, exclusive breastfeeding, iron supplementation, school feeding)?",
        "Which county or population group is your study focused on?",
        "Which existing secondary data source will you review (e.g. KDHS 2022 report, KNBS reports, MOH health facility registers, or school records)?",
      ],
      placeholderExample:
        'e.g. "Assessment of Complementary Feeding Practices and Child Nutritional Status in Kitui County using KDHS 2022 Secondary Data."',
    };
  }

  // Problem Statement
  if (sectionKey.includes("problem")) {
    if (isSecondaryResearch) {
      return {
        mainQuestion: "What nutrition problem exists in your study area, and what do published reports show?",
        subQuestions: [
          "What does existing data (e.g. KDHS 2022, KNBS, or MOH reports) show about this nutrition problem?",
          "Which group (children under 5, pregnant women, pupils, or patients) is most affected?",
          "Why is it helpful to review and summarize existing secondary records on this issue?",
        ],
        placeholderExample:
          'e.g. "In our county, child stunting and poor dietary diversity remain high according to national nutrition reports. However, local health workers and students lack a simple summary comparing feeding practices and malnutrition rates from existing survey records..."',
      };
    }
    return {
      mainQuestion: "What exact problem or deficit exists, and why is it urgent to solve?",
      subQuestions: [
        "What evidence or data shows that this nutritional issue or market deficit is a burden?",
        "Who is currently suffering or affected if this problem remains unaddressed?",
        "Why have existing commercial products or conventional solutions failed to fix it?",
      ],
      placeholderExample:
        'e.g. "In our county, stunting affects over 18% of children under 5 due to poor complementary feeding practices. Commercial imported baby foods are unaffordable for low-income mothers..."',
    };
  }

  // Objectives
  if (sectionKey.includes("objectives")) {
    if (isSecondaryResearch) {
      return {
        mainQuestion: "What 3 straightforward objectives will you achieve using secondary data?",
        subQuestions: [
          "What is your main general objective (starting with 'To assess...' or 'To examine...')?",
          "Objective 1: Which main indicator or prevalence rate will you extract from the report/register?",
          "Objective 2: Which related dietary practice or service coverage indicator will you review?",
          "Objective 3: How will you compare the figures (e.g. by age group, rural vs. urban, or across years)?",
        ],
        placeholderExample:
          'e.g. "General Objective: To assess infant feeding practices and child stunting in Kitui County using KDHS 2022 data.\nSpecific Objectives:\n1. To determine the proportion of children aged 6-23 months meeting minimum dietary diversity from KDHS 2022 tables.\n2. To examine stunting and wasting rates recorded in the survey report.\n3. To compare feeding indicators between rural and urban households."',
      };
    }
    return {
      mainQuestion: "What specific steps or investigations will you carry out?",
      subQuestions: [
        "What is the single overarching general objective of this project?",
        "What baseline data or raw material properties will you evaluate first (Objective 1)?",
        "What formulation trials or experiments will you conduct next (Objective 2)?",
        "What evaluation, sensory testing, or costing will you perform to conclude (Objective 3)?",
      ],
      placeholderExample:
        'e.g. "General: To formulate and evaluate a composite porridge flour. Specific: 1. Determine baseline nutrient profile. 2. Formulate 3 experimental blend ratios. 3. Test sensory acceptability with 30 panelists."',
    };
  }

  // Rationale / Justification / Significance
  if (
    sectionKey.includes("rationale") ||
    sectionKey.includes("justification") ||
    sectionKey.includes("significance")
  ) {
    return {
      mainQuestion: "Who will benefit from this project and how will the findings be useful?",
      subQuestions: [
        "How will your findings help nutritionists, health workers, teachers, or community members?",
        "Why is using secondary data (existing official reports) a practical and reliable approach for this study?",
      ],
      placeholderExample:
        'e.g. "This study summarizes official nutrition data in a simple format for county nutritionists, community health promoters, and college students to guide nutrition education..."',
    };
  }

  // Background
  if (sectionKey.includes("background")) {
    return {
      mainQuestion: "What is the background of this nutrition issue globally, in Kenya, and in your county?",
      subQuestions: [
        "What is the nutrition topic and why does it matter for human health?",
        "What do WHO, UNICEF, or Kenya national reports (such as KDHS 2022) say about this problem?",
        "What is the situation in your selected county or target group?",
      ],
      placeholderExample:
        'e.g. "Good nutrition during early childhood is essential for growth and development. In Kenya, the 2022 KDHS report shows that 18% of children under five are stunted, with rural counties experiencing higher rates..."',
    };
  }

  // Secondary Research Chapter 3 Specific Sections (Sources, Variables, Verification, Analysis, Ethics)
  if (sectionKey === "ch3.sources") {
    return {
      mainQuestion: "Which official secondary reports, registers, or publications did you get your data from?",
      subQuestions: [
        "Which exact reports or registers did you use (e.g. KDHS 2022, KNBS KIHBS, MOH KHIS facility reports, or published studies)?",
        "Which organization published or maintains these records (e.g. KNBS, Ministry of Health, FAO/WHO)?",
        "Which specific tables, chapters, or summary sheets did you extract your numbers from?",
      ],
      placeholderExample:
        'e.g. "This study relied entirely on secondary data extracted from the Kenya Demographic and Health Survey (KDHS) 2022 report published by KNBS and ICF, alongside Ministry of Health routine nutrition summary reports..."',
    };
  }

  if (sectionKey === "ch3.variables") {
    return {
      mainQuestion: "Which key variables or nutrition indicators did you extract from the secondary records?",
      subQuestions: [
        "What is your main outcome (dependent) variable (e.g. stunting rate, anemia prevalence, school attendance)?",
        "What are the independent or background variables (e.g. dietary diversity, age group, meal frequency, rural/urban residence)?",
        "How are these indicators defined in standard WHO, FAO, or MOH guidelines?",
      ],
      placeholderExample:
        'e.g. "The main dependent variable is child stunting (height-for-age below -2 SD). The independent variables extracted from the report are minimum dietary diversity (at least 5 out of 8 food groups) and minimum meal frequency..."',
    };
  }

  if (sectionKey === "ch3.verification") {
    return {
      mainQuestion: "How did you check and verify that the extracted secondary figures were accurate?",
      subQuestions: [
        "How did you record the figures from the original report (e.g. using a structured data extraction checklist)?",
        "How did you double-check the numbers against the official published tables to avoid copying errors?",
      ],
      placeholderExample:
        'e.g. "A structured data extraction sheet was used to record percentages directly from the published KDHS 2022 tables. All extracted values were cross-checked twice against the official report to ensure accuracy and completeness..."',
    };
  }

  if (sectionKey === "ch3.analysis") {
    return {
      mainQuestion: "How did you organize, summarize, and present the secondary data?",
      subQuestions: [
        "How were the extracted figures organized (e.g. grouped by objective in Microsoft Excel)?",
        "Which simple descriptive statistics did you use (e.g. frequencies, percentages, averages/means)?",
        "How will the results be presented in Chapter 4 (e.g. simple frequency tables and bar charts)?",
      ],
      placeholderExample:
        'e.g. "The extracted secondary data was entered into Microsoft Excel and analyzed using simple descriptive statistics, including frequencies, percentages, and averages. Findings are presented in clear summary tables..."',
    };
  }

  if (sectionKey === "ch3.ethics") {
    return {
      mainQuestion: "What ethical rules did you follow when using secondary data?",
      subQuestions: [
        "Did you collect any personal names or private patient identifiers? (State clearly that only anonymous summary data was used).",
        "How did you credit the original data owners (e.g. citing KNBS, MOH, WHO, and published authors in APA 7th format)?",
      ],
      placeholderExample:
        'e.g. "Because this study relied wholly on publicly available, anonymized secondary reports, no human subjects were interviewed. All data custodians and authors are properly acknowledged and cited in APA 7th format..."',
    };
  }

  // Methodology / Design / Procedure / Workflow
  if (
    sectionKey.includes("methodology") ||
    sectionKey.includes("design") ||
    sectionKey.includes("procedure") ||
    sectionKey.includes("workflow")
  ) {
    if (isSecondaryResearch) {
      return {
        mainQuestion: "How did you apply a descriptive cross-sectional design using secondary data?",
        subQuestions: [
          "State clearly that your study uses a descriptive cross-sectional research design based on secondary data.",
          "Why is a descriptive cross-sectional design appropriate for summarizing existing nutrition indicators at a defined period?",
          "Why did you choose secondary data (existing KDHS/KNBS/MOH reports) instead of collecting primary field data?",
        ],
        placeholderExample:
          'e.g. "This study used a descriptive cross-sectional research design relying entirely on secondary data. This design was chosen because it allows clear description of nutritional indicators and feeding practices at a specific point in time using verified KDHS 2022 and MOH summary reports without field interviews..."',
      };
    }
    return {
      mainQuestion: "How will you practically execute this project step-by-step?",
      subQuestions: [
        "What study design, batch recipe ratios, or sampling procedure will you use?",
        "What equipment, instruments, or laboratory methods will guarantee accurate measurements?",
        "What quality control (HACCP / KEBS standards) and ethics will you uphold?",
      ],
      placeholderExample:
        'e.g. "We will use an experimental formulation design with three composite ratios (70:30, 60:40, 50:50). Raw roots will be washed, sliced, solar-dehydrated at 55°C, and milled through a 0.5mm sieve..."',
    };
  }

  // Results / Findings / Subgroup / Discussion
  if (
    sectionKey.includes("results") ||
    sectionKey.includes("findings") ||
    sectionKey.includes("subgroup") ||
    sectionKey.includes("discussion")
  ) {
    if (isSecondaryResearch) {
      return {
        mainQuestion: "What key percentages and findings did you extract from the secondary reports?",
        subQuestions: [
          "What exact percentages or figures were recorded from the report for each of your objectives?",
          "How do the figures compare across groups (e.g. rural vs. urban, age groups, or boys vs. girls)?",
          "How do your extracted findings compare with WHO standards or other published studies?",
        ],
        placeholderExample:
          'e.g. "According to the extracted KDHS 2022 tables, 18% of children under five are stunted nationally, with higher prevalence in rural areas (20%) compared to urban areas (12%). Only 31% of children aged 6-23 months met the minimum acceptable diet..."',
      };
    }
    return {
      mainQuestion: "What were your key observations, measurements, or findings?",
      subQuestions: [
        "What scores or percentages were recorded across your samples or survey indicators?",
        "Which blend, sample, or demographic group performed best?",
        "Did any unexpected findings or challenges emerge during testing?",
      ],
      placeholderExample:
        'e.g. "The 60:40 blend scored highest in sensory overall acceptability (7.8 out of 9), while proximate analysis confirmed crude protein increased from 6.2% to 14.5%..."',
    };
  }

  // Conclusions & Recommendations
  if (
    sectionKey.includes("conclusions") ||
    sectionKey.includes("recommendations") ||
    sectionKey.includes("summary")
  ) {
    return {
      mainQuestion: "What final conclusions and practical recommendations do you draw from your findings?",
      subQuestions: [
        "What main conclusion answers each of your specific objectives?",
        "What simple, practical actions should health workers, schools, or households take based on these findings?",
        "What further secondary review or local study do you suggest for future students?",
      ],
      placeholderExample:
        'e.g. "In conclusion, secondary data shows that low dietary diversity remains a major driver of child undernutrition. County nutritionists should strengthen community education on affordable locally available protein and vegetable foods..."',
    };
  }

  // Default fallback
  return {
    mainQuestion: `What are your core points for ${sectionKey}?`,
    subQuestions: [
      "What key facts, definitions, or observations belong in this section?",
      "How does this section support your project objectives?",
    ],
    placeholderExample:
      'Write your draft points in your own words here, then click "Polish & Cite with AI" to refine and add verified citations.',
  };
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

  const isSecondaryResearch = context.workspaceType === "research_secondary";

  const designRules = isSecondaryResearch
    ? `CRITICAL RESEARCH DESIGN RULES (CERTIFICATE / DIPLOMA SECONDARY RESEARCH):
1. Every proposed topic MUST use a **Descriptive Cross-Sectional Research Design relying 100% on Secondary Data**.
2. The student will NOT go to the field to administer questionnaires, conduct interviews, or take new anthropometric measurements (no weighing scales or MUAC tapes).
3. Instead, the student will extract and summarize existing figures from verified secondary sources: Kenya Demographic and Health Survey (KDHS 2022 / 2014), KNBS reports (KIHBS), Ministry of Health (MOH / KHIS) facility summary reports, existing school feeding/attendance records, or published nutrition studies.
4. Data analysis MUST be simple descriptive statistics: frequencies, percentages, averages, and simple comparison tables.`
    : `CRITICAL TECHNICAL DESIGN RULES:
1. Propose practical, realistic food product formulation or nutrition enterprise topics suitable for a TVET student.`;

  const systemPrompt = `You are a practical Academic Research Supervisor for TVET Certificate and Diploma students in Kenya studying ${context.course} (${context.level.toUpperCase()} level).
ALL proposed topics, objectives, and methodologies MUST be STRAIGHTFORWARD, SIMPLE, DIRECT, and REALISTIC for a Certificate student.

${designRules}

STRICT STYLE RULES:
1. DO NOT generate complex master's-level or epidemiological topics.
2. STRICTLY FORBID heavy jargon like: "Longitudinal Trends and Socio-Demographic Determinants", "Retrospective micro-dataset modeling", "multivariate logistic regression", "inferential econometric modeling".
3. Titles MUST be direct, simple, and under 15 words (e.g., "Assessment of Complementary Feeding Practices and Child Stunting in Kitui County").
4. Problem Summary: 1-2 simple sentences in plain language describing the issue.
5. General Aim: 1 simple sentence starting with "To assess...", "To examine...", or "To determine...".
6. Specific Objectives: Exactly 3 simple, numbered steps extracting/reviewing figures from secondary reports.
7. Methodology Hint: Explicitly state "Descriptive cross-sectional study using secondary data from [specific report/register], analyzed using frequencies and percentages."

Return strictly valid JSON with this shape:
{
  "problemAnalysis": "2 short, plain-language sentences explaining why this topic matters and which secondary reports can be used.",
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
      "methodologyHint": "Descriptive cross-sectional design using secondary data from KDHS / KNBS / MOH reports, analyzed with simple percentages and frequency tables."
    }
  ],
  "followUpQuestion": "A friendly, simple question to help the student pick their preferred option"
}`;

  try {
    if (geminiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nStudent Idea: ${query}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(9000),
      });
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) return JSON.parse(jsonText);
      }
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
        signal: AbortSignal.timeout(9000),
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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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

  const { draftText, sectionTitle, guidance, minWords, context, evidence } = params;

  const sourceNotes = evidence.length
    ? evidence
        .map((e) => `- id=${e.source.id} | ${formatInText(e.source)} | finding: ${e.claim.text}`)
        .join("\n")
    : "(none: this section has no verified source notes, so write without any citation)";

  const designNote =
    context.workspaceType === "research_secondary"
      ? "Research design: Straightforward descriptive cross-sectional design relying entirely on secondary data (existing KDHS, KNBS, MOH reports, or institutional records; no primary field questionnaires or lab work)."
      : "";

  const prompt = `You are a supportive academic writing coach for a Kenyan TVET student studying ${context.course} (${context.level} level).
The student has written their own draft for the section "${sectionTitle}". Improve it; do not replace it.
Project title: ${context.title || "Academic Project"}
Problem area: ${context.problemArea || "Public health nutrition"}
${designNote}
Section guidance: ${guidance}
Target length: at least ${minWords} words.

WRITING RULES
1. Keep every fact, place, ingredient, number and idea the student wrote. Fix grammar, flow and structure, and deepen weak points with sound reasoning.
2. Use clear, simple, formal academic English suitable for a ${context.level} student. Avoid heavy jargon.
3. Output ONLY the section text. No preamble, no commentary, no quoting the student's notes.

CITATION RULES (strict)
4. You may support a statement ONLY with the SOURCE NOTES below. Paraphrase the finding in your own words; never copy more than four consecutive words.
5. To cite, write [[cite:ID]] straight after the statement, before the full stop, using an id from the notes. Several sources: [[cite:a]][[cite:b]].
6. Never write an author name, year, title, journal, page number or reference yourself. Never cite anything not in the notes.
7. Do not add statistics or percentages that are not in the student's draft or the notes.
8. Only cite a note when the statement genuinely matches its finding. It is fine to use few or none.

SOURCE NOTES
${sourceNotes}`;

  try {
    if (geminiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${prompt}\n\nCandidate Draft:\n${draftText}` }] }],
          generationConfig: { temperature: 0.4 },
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 50) return text.trim();
      }
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
            { role: "user", content: `Candidate Draft:\n${draftText}` },
          ],
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(12000),
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
  course: string
): TopicNarrowingResult {
  const loc = detectKenyaLocation(query);

  // 1. Food Science / Trade Formulation
  if (type === "trade_fabrication") {
    const { ingA, ingB } = detectFoodIngredients(query);

    return {
      problemAnalysis: `Developing practical value-added food products under ${course} addresses local community nutrition needs and reduces post-harvest wastage in Kenya.`,
      options: [
        {
          id: "tf-1",
          title: `Formulation and Sensory Acceptability of Composite Porridge Flour from ${ingA} and ${ingB}`,
          problemSummary: `Single-cereal porridges lack adequate protein and essential micronutrients, leading to poor growth and nutrient deficiencies among young children.`,
          generalObjective: `To formulate and evaluate the sensory acceptability of a nutrient-dense composite porridge flour from ${ingA} and ${ingB}.`,
          specificObjectives: [
            `1. To clean, dry, and mill raw ${ingA} and ${ingB} into fine flours.`,
            `2. To blend three experimental formulation ratios (70:30, 60:40, and 50:50).`,
            `3. To evaluate consumer sensory acceptability (taste, aroma, color, texture) with a 20-member panel.`,
          ],
          methodologyHint: `Practical formulation trials, standardized cooking, and a 9-point hedonic sensory evaluation panel with local consumers.`,
        },
        {
          id: "tf-2",
          title: `Development and Quality Assessment of Nutrient-Enriched Biscuits Incorporating ${ingA}`,
          problemSummary: `Commercial snacks consumed by school children are high in refined sugars and low in dietary fiber and essential vitamins.`,
          generalObjective: `To formulate and assess the sensory quality of baked biscuits enriched with ${ingA} flour.`,
          specificObjectives: [
            `1. To prepare standardized biscuit dough with varying inclusion levels of ${ingA}.`,
            `2. To bake prototype batches under controlled oven temperature and time.`,
            `3. To assess consumer sensory acceptability and physical texture of the baked biscuits.`,
          ],
          methodologyHint: `Kitchen baking trials, airtight packaging in clean pouches, and consumer acceptability scorecards.`,
        },
        {
          id: "tf-3",
          title: `Processing and Quality Evaluation of Solar-Dried ${ingA} Slices using a Simple Dryer`,
          problemSummary: `Seasonal overproduction of perishable produce leads to heavy post-harvest rotting and economic losses for rural smallholder farmers.`,
          generalObjective: `To evaluate the quality and drying duration of ${ingA} slices dried using a simple solar cabinet dryer.`,
          specificObjectives: [
            `1. To wash, peel, slice, and pretreat raw ${ingA} prior to dehydration.`,
            `2. To compare drying duration and moisture reduction under solar drying versus open-sun drying.`,
            `3. To assess the visual color, crispness, and rehydration properties of the dried slices.`,
          ],
          methodologyHint: `Cabinet solar drying experiment, weight loss recording at regular intervals, and simple sensory evaluation.`,
        },
      ],
      followUpQuestion: `Which practical product do you prefer to develop: composite porridge flour, enriched biscuits, or solar-dried food slices?`,
    };
  }

  // 2. Business Plan Track
  if (type === "business_plan") {
    const enterpriseSubject =
      query.trim().length > 0 && !query.toLowerCase().includes("business plan")
        ? query.trim()
        : "Fortified Composite Flour";

    return {
      problemAnalysis: `Establishing a small-scale food enterprise provides accessible, nutritious foods to local families while generating viable self-employment in Kenya.`,
      options: [
        {
          id: "bp-1",
          title: `Business Plan for Establishing a Small-Scale ${enterpriseSubject} Milling Enterprise in ${loc}`,
          problemSummary: `Local mothers lack access to clean, affordable, and hygienically packaged composite porridge flour within their neighborhood shops.`,
          generalObjective: `To prepare a viable business plan for a micro-scale milling enterprise producing fortified composite flour in ${loc}.`,
          specificObjectives: [
            `1. To conduct a market survey of 30 households and 10 local retail shops to assess customer demand.`,
            `2. To outline the daily production process, raw material sourcing, and basic machinery requirements.`,
            `3. To calculate startup capital, product pricing, and 1-year profit and loss projections.`,
          ],
          methodologyHint: `Local market survey with households and shopkeepers, equipment price quotations, and simple 1-year financial projections.`,
        },
        {
          id: "bp-2",
          title: `Business Plan for a Community Nutrition and Healthy Foods Advisory Service in ${loc}`,
          problemSummary: `Community members managing lifestyle conditions like diabetes and hypertension lack convenient, personalized dietary guidance and healthy meal products.`,
          generalObjective: `To develop a business plan for an accessible community nutrition counseling practice and healthy food supply service.`,
          specificObjectives: [
            `1. To survey local demand for individualized dietary meal plans and healthy snack supplies.`,
            `2. To establish service packages, consultation pricing, and operational workflows.`,
            `3. To compute monthly operating costs, break-even targets, and annual revenue projections.`,
          ],
          methodologyHint: `Client demand interviews, local clinic networking, and simple cash flow and break-even calculations.`,
        },
        {
          id: "bp-3",
          title: `Business Plan for Small-Scale Fresh Fruit Juice Processing and Packaging in ${loc}`,
          problemSummary: `Local markets experience seasonal fruit waste while consumers lack natural, unadulterated fruit juices free from artificial preservatives.`,
          generalObjective: `To prepare a commercial business plan for processing, packaging, and distributing natural fresh fruit juices in ${loc}.`,
          specificObjectives: [
            `1. To determine customer preferences and daily retail demand for natural juices in local commercial centers.`,
            `2. To identify food-grade extraction machinery, packaging bottles, and hygienic cold-storage equipment.`,
            `3. To calculate cost per unit, retail price margins, and projected monthly net returns.`,
          ],
          methodologyHint: `Consumer taste preference surveys, supplier cost quotes, and practical 1-year financial forecasting.`,
        },
      ],
      followUpQuestion: `Which commercial enterprise matches your vision: composite flour milling, community nutrition counseling, or fresh juice processing?`,
    };
  }

  // 3. Nutrition & Dietetics Research (Certificate & Diploma Standard: Descriptive Cross-Sectional Secondary Data Design)
  return generateSecondaryDataTopics(query, loc);
}

function extractTopicEntities(draftText: string, context: WorkspaceContext) {
  const combined = `${draftText} ${context.title || ""} ${context.problemArea || ""}`.toLowerCase();
  const location = detectKenyaLocation(combined);

  // If candidate already has an established project title in the workspace, prioritize it!
  let title = context.title?.trim() || "";

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

function cleanStudentDraft(draftText: string): string[] {
  return draftText
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim().replace(/^(?:[-*•]+|\d+[.)])\s*/, ""))
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

  const paragraphs: string[] = [];

  if (sectionKey === "proposal.title" || sectionKey === "cover.details") {
    paragraphs.push(`### Research Title\n${title}`);
  }

  paragraphs.push(...cleanStudentDraft(draftText));

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
    warnings.push(`Add more detail in your own words to reach ${minWords} words.`);
  }

  return {
    polishedText,
    wordsOriginal: rawWords,
    wordsPolished: polishedWords,
    wordDiff: polishedWords - rawWords,
    targetMet: polishedWords >= minWords,
    improvements: [
      "Your words kept, spelling and punctuation tidied",
      citations.length > 0
        ? `${citations.length} verified source(s) cited in text`
        : "No verified source matched this section",
      `Length now ${polishedWords} words (target ${minWords})`,
    ],
    citations,
    warnings,
  };
}

