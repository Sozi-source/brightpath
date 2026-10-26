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
      mainQuestion: "Which problem area or nutritional challenge do you wish to conduct your research on?",
      subQuestions: [
        "What specific nutritional condition or indicator are you investigating (e.g. stunting, wasting, micronutrient deficiency, dietary diversity)?",
        "Which geographic location or population group do you plan to study (e.g. children aged 6-59 months in Kilifi County)?",
        "Which secondary survey dataset or hospital archive will you analyze (e.g. KDHS 2014-2022)?",
      ],
      placeholderExample:
        'e.g. "I want to investigate the longitudinal trends and determinants of child stunting among under-5s in Kilifi County using KDHS 2014 and 2022 survey data..."',
    };
  }

  // Problem Statement
  if (sectionKey.includes("problem")) {
    return {
      mainQuestion: "What exact problem or deficit exists, and why is it urgent to solve?",
      subQuestions: [
        "What evidence or data shows that this nutritional issue or market deficit is a burden?",
        "Who is currently suffering or affected if this problem remains unaddressed?",
        "Why have existing commercial products or conventional solutions failed to fix it?",
      ],
      placeholderExample:
        'e.g. "In our county, stunting affects over 28% of children under 5 due to poor complementary feeding practices. Commercial imported baby foods are unaffordable for low-income mothers..."',
    };
  }

  // Objectives
  if (sectionKey.includes("objectives")) {
    return {
      mainQuestion: "What specific steps or investigations will you carry out?",
      subQuestions: [
        "What is the single overarching general objective of this project?",
        "What baseline data or raw material properties will you evaluate first (Objective 1)?",
        "What formulation trials, survey analyses, or experiments will you conduct next (Objective 2)?",
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
      mainQuestion: "Who will benefit from this project and how will it help Kenya?",
      subQuestions: [
        "How will this research or product assist the Ministry of Health, County nutritionists, or local families?",
        "What economic or community advantage does your solution provide (e.g. lower cost, local farmers)?",
      ],
      placeholderExample:
        'e.g. "This study will provide county public health officers with localized dietary risk factors, enabling targeted food supplementation programs and supporting Kenya Vision 2030 nutrition targets..."',
    };
  }

  // Background
  if (sectionKey.includes("background")) {
    return {
      mainQuestion: "What is the background context and history of this challenge?",
      subQuestions: [
        "What national or regional statistics show the prevalence of this condition?",
        "Why is your chosen county or raw material particularly relevant?",
        "What previous interventions have been implemented, and what gap remains?",
      ],
      placeholderExample:
        'e.g. "Child undernutrition remains a persistent challenge in Sub-Saharan Africa. According to KDHS 2022, 18% of children in Kenya are stunted, with arid and coastal counties bearing the heaviest burden..."',
    };
  }

  // Methodology / Procedure / Workflow
  if (
    sectionKey.includes("methodology") ||
    sectionKey.includes("design") ||
    sectionKey.includes("procedure") ||
    sectionKey.includes("workflow")
  ) {
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

  // Results / Findings
  if (sectionKey.includes("results") || sectionKey.includes("findings")) {
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
      mainQuestion: "What final conclusions and recommendations do you draw?",
      subQuestions: [
        "Did the project satisfy your original research questions and objectives?",
        "What concrete actions should health coordinators, commercial millers, or households take?",
        "What should future researchers investigate next?",
      ],
      placeholderExample:
        'e.g. "In conclusion, biofortified sweet potato and amaranth composite flour meets KEBS standards for complementary feeding. We recommend county health centers promote local household formulation..."',
    };
  }

  // Default fallback
  return {
    mainQuestion: `What are your core ideas and findings for ${sectionKey}?`,
    subQuestions: [
      "What key observations or technical specifications belong in this section?",
      "How does this support your overall project objectives?",
    ],
    placeholderExample:
      'Type your draft notes or bullet points here. Then click "Polish with AI" to expand and align with KNEC standards.',
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

  const systemPrompt = `You are a helpful, practical Academic Research Supervisor for TVET Certificate and Diploma students in Kenya studying ${context.course} (${context.level.toUpperCase()} level).
CRITICAL REQUIREMENT - THE CANDIDATE IS A CERTIFICATE/CRAFT LEVEL STUDENT:
All proposed research topics, objectives, and methodologies MUST be DIRECT, SIMPLE, CONCISE, and REALISTIC.
1. DO NOT generate complex epidemiological or master's-level topics.
2. STRICTLY FORBID heavy academic jargon like: "Longitudinal Trends and Socio-Demographic Determinants", "Retrospective secondary analysis of DHS micro-datasets", "multivariate logistic regression", "WHO Anthro Z-score modeling", "epidemiological cohorts".
3. Titles MUST be direct, clear, and under 14 words (e.g., "Assessment of Household Food Insecurity and Academic Performance among Primary School Pupils in Kitui County").
4. Problem Summary: 1-2 simple sentences in plain language describing the real community or school issue.
5. General Aim: 1 simple sentence starting with "To assess...", "To investigate...", or "To determine...".
6. Specific Objectives: Exactly 3 simple, numbered, practical steps a Certificate student can realistically achieve.
7. Methodology: Simple and practical (e.g. "Descriptive survey using a simple structured questionnaire for pupils and teacher attendance checklists, analyzed with basic percentage tables").

Return strictly valid JSON with this shape:
{
  "problemAnalysis": "2 short, plain-language sentences explaining why this practical topic is important in Kenya.",
  "options": [
    {
      "id": "opt-1",
      "title": "Direct and simple title (under 14 words)",
      "problemSummary": "1-2 simple sentences explaining the real-life problem",
      "generalObjective": "Simple general aim",
      "specificObjectives": [
        "1. First simple objective",
        "2. Second simple objective",
        "3. Third simple objective"
      ],
      "methodologyHint": "Simple, practical method (questionnaires, observation, basic percentages)"
    }
  ],
  "followUpQuestion": "A friendly, simple question to help the candidate choose their preferred focus"
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

  const prompt = `You are a supportive academic writing coach for a Kenyan TVET student studying ${context.course} (${context.level} level).
The student has written their own draft for the section "${sectionTitle}". Improve it; do not replace it.
Project title: ${context.title || "Academic Project"}
Problem area: ${context.problemArea || "Public health nutrition"}
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
  const q = query.toLowerCase();

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

  // 3. Nutrition & Dietetics Research (Certificate & Diploma Standard)

  // A. School / Education / Academic Performance / Breakfast Theme
  if (
    q.includes("school") ||
    q.includes("performance") ||
    q.includes("pupil") ||
    q.includes("student") ||
    q.includes("academic") ||
    q.includes("attendance") ||
    q.includes("class") ||
    q.includes("learn") ||
    q.includes("breakfast")
  ) {
    return {
      problemAnalysis: `Household food shortages and skipping meals directly impair pupil alertness, classroom concentration, and school attendance across Kenyan primary schools.`,
      options: [
        {
          id: "rs-1",
          title: `Assessment of Household Food Insecurity and Academic Performance among Primary School Pupils in ${loc}`,
          problemSummary: `Many school-going children experience household food shortages, leading to morning hunger, poor classroom concentration, and lower exam performance.`,
          generalObjective: `To assess how household food insecurity affects the academic performance and school attendance of primary school pupils in ${loc}.`,
          specificObjectives: [
            `1. To determine the level of household food insecurity among pupils' families in ${loc}.`,
            `2. To assess the school attendance and test scores of pupils from food-insecure households.`,
            `3. To identify dietary coping strategies used by parents and guardians to manage food shortages.`,
          ],
          methodologyHint: `Descriptive survey using a simple structured questionnaire for pupils and teacher attendance checklists, summarized with basic percentage tables.`,
        },
        {
          id: "rs-2",
          title: `Investigation of School Feeding Programs and Pupil Classroom Participation in ${loc}`,
          problemSummary: `Lack of consistent midday meals in schools contributes to early fatigue, lower afternoon attendance, and reduced participation during lessons.`,
          generalObjective: `To evaluate how school feeding initiatives support pupil attendance and active participation in class.`,
          specificObjectives: [
            `1. To identify the types and regularity of meals provided to pupils during the school week.`,
            `2. To compare pupil attendance rates on days with school meals versus days without.`,
            `3. To evaluate teachers' assessments of pupil alertness and class participation.`,
          ],
          methodologyHint: `Simple observation checklists and brief interviews with class teachers and school cooks, analyzed with frequency tables.`,
        },
        {
          id: "rs-3",
          title: `A Survey on Breakfast Habits and Morning Class Concentration among Primary School Pupils in ${loc}`,
          problemSummary: `A significant number of pupils attend morning lessons without eating breakfast, leading to lethargy, headaches, and difficulty concentrating on morning schoolwork.`,
          generalObjective: `To examine the relationship between regular breakfast consumption and morning classroom attentiveness among primary pupils.`,
          specificObjectives: [
            `1. To determine the frequency of breakfast consumption among school pupils.`,
            `2. To identify common breakfast foods and beverages consumed by pupils.`,
            `3. To record teachers' observations regarding pupils' morning energy levels and attentiveness.`,
          ],
          methodologyHint: `Questionnaire survey administered to pupils with teacher guidance, summarized using simple frequency counts and percentages.`,
        },
      ],
      followUpQuestion: `Would you prefer your study to focus on overall household food insecurity, midday school feeding programs, or morning breakfast habits?`,
    };
  }

  // B. Dietary Diversity & Household Food Security Theme
  if (
    q.includes("diversity") ||
    q.includes("dietary") ||
    q.includes("food security") ||
    q.includes("insecurity") ||
    q.includes("vegetable") ||
    q.includes("fruit") ||
    q.includes("diet")
  ) {
    return {
      problemAnalysis: `Evaluating household dietary diversity identifies micronutrient deficits and supports community health workers in promoting balanced family diets.`,
      options: [
        {
          id: "rs-1",
          title: `Assessment of Household Dietary Diversity and Food Consumption Patterns in ${loc}`,
          problemSummary: `Many rural families rely primarily on starchy staples with limited intake of vegetables, fruits, and proteins, increasing the risk of nutrient deficiencies.`,
          generalObjective: `To assess household dietary diversity and daily food consumption patterns among families in ${loc}.`,
          specificObjectives: [
            `1. To identify the main food groups commonly consumed by households in the study area.`,
            `2. To determine the household dietary diversity score (HDDS) using a simple 24-hour food recall checklist.`,
            `3. To identify factors such as food cost and market access that influence household food choices.`,
          ],
          methodologyHint: `Cross-sectional descriptive survey using a 24-hour dietary recall questionnaire with 30-50 household heads, analyzed with basic percentage tables.`,
        },
        {
          id: "rs-2",
          title: `Investigation of Household Food Security and Coping Strategies in ${loc}`,
          problemSummary: `Seasonal dry spells and high market prices force families to skip meals or reduce food quantities, leading to household nutritional vulnerability.`,
          generalObjective: `To determine household food security status and the coping mechanisms used during periods of food shortage.`,
          specificObjectives: [
            `1. To assess the number of balanced meals consumed daily by family members.`,
            `2. To identify common coping strategies such as purchasing cheaper foods or borrowing food.`,
            `3. To determine the availability and affordability of basic food commodities in local markets.`,
          ],
          methodologyHint: `Simple household survey using a structured questionnaire administered to caregivers, summarized using frequency tables.`,
        },
        {
          id: "rs-3",
          title: `Assessment of Fruit and Vegetable Consumption Habits among Households in ${loc}`,
          problemSummary: `Low daily consumption of fresh fruits and green leafy vegetables contributes to micronutrient deficiencies such as vitamin A and iron deficiency.`,
          generalObjective: `To assess the intake frequency of fruits and vegetables and barriers to adequate consumption in ${loc}.`,
          specificObjectives: [
            `1. To find out how frequently households consume fresh fruits and vegetables in a week.`,
            `2. To identify commonly available indigenous vegetables grown or purchased in the community.`,
            `3. To determine challenges that limit vegetable intake, including seasonal scarcity and water shortages.`,
          ],
          methodologyHint: `Community-based questionnaire survey with local mothers and market traders, analyzed with basic percentages.`,
        },
      ],
      followUpQuestion: `Would you like your study to focus on overall dietary diversity scores, food security coping strategies, or fruit and vegetable consumption?`,
    };
  }

  // C. Child Malnutrition, Infant & Young Child Feeding (IYCF) Theme
  if (
    q.includes("stunt") ||
    q.includes("waste") ||
    q.includes("child") ||
    q.includes("infant") ||
    q.includes("wean") ||
    q.includes("complementary") ||
    q.includes("iycf") ||
    q.includes("under 5") ||
    q.includes("under-5") ||
    q.includes("growth")
  ) {
    return {
      problemAnalysis: `Investigating infant and young child feeding practices directly addresses child growth and provides actionable evidence for maternal and child health clinics.`,
      options: [
        {
          id: "rs-1",
          title: `Assessment of Complementary Feeding Practices and Growth of Children Under 5 in ${loc}`,
          problemSummary: `Inappropriate weaning foods and late introduction of nutrient-dense meals contribute to poor weight gain and childhood growth faltering.`,
          generalObjective: `To assess complementary feeding practices and basic nutritional status of children under five years in ${loc}.`,
          specificObjectives: [
            `1. To determine the age at which complementary foods are first introduced to infants.`,
            `2. To evaluate the ingredients and nutritional quality of complementary porridge prepared by mothers.`,
            `3. To record mid-upper arm circumference (MUAC) and weight-for-age measurements of attending children.`,
          ],
          methodologyHint: `Clinic-based descriptive survey at the local health facility using MUAC tapes, weighing scales, and short mother questionnaires.`,
        },
        {
          id: "rs-2",
          title: `Investigation of Exclusive Breastfeeding Practices and Maternal Challenges in ${loc}`,
          problemSummary: `Early introduction of water, cow's milk, or thin gruel before six months exposes infants to diarrheal infections and suboptimal growth.`,
          generalObjective: `To examine the practice of exclusive breastfeeding and common challenges experienced by mothers during the first six months.`,
          specificObjectives: [
            `1. To find out the proportion of mothers who practice exclusive breastfeeding up to six months.`,
            `2. To identify reasons given by mothers for introducing other liquids or solid foods early.`,
            `3. To assess maternal awareness regarding the health benefits of exclusive breastfeeding.`,
          ],
          methodologyHint: `Descriptive survey using a structured interview questionnaire with nursing mothers attending child welfare clinics.`,
        },
        {
          id: "rs-3",
          title: `A Survey on Hygiene and Food Safety Practices during Child Meal Preparation in ${loc}`,
          problemSummary: `Poor hygiene and improper food storage during complementary feeding lead to frequent diarrhea and subsequent child weight loss.`,
          generalObjective: `To investigate hygiene practices observed by caregivers when preparing and feeding complementary meals.`,
          specificObjectives: [
            `1. To observe handwashing practices and cleanliness of feeding utensils.`,
            `2. To identify how cooked baby food is stored and reheated before feeding.`,
            `3. To record maternal reports on diarrheal episodes experienced by children in the past two weeks.`,
          ],
          methodologyHint: `Observation checklist and structured questionnaire administered to mothers during household visits.`,
        },
      ],
      followUpQuestion: `Would you prefer to study complementary feeding diets, exclusive breastfeeding practices, or hygiene during food preparation?`,
    };
  }

  // D. Maternal / Antenatal / Pregnancy Nutrition Theme
  if (
    q.includes("maternal") ||
    q.includes("pregnant") ||
    q.includes("pregnancy") ||
    q.includes("anc") ||
    q.includes("antenatal") ||
    q.includes("anemia") ||
    q.includes("iron")
  ) {
    return {
      problemAnalysis: `Adequate maternal nutrition and adherence to antenatal micronutrient supplements safeguard maternal health and reduce low birth weight infants.`,
      options: [
        {
          id: "rs-1",
          title: `Assessment of Maternal Dietary Practices and Iron Supplementation in ${loc}`,
          problemSummary: `Inadequate diet during pregnancy and poor adherence to iron-folic acid supplements contribute to maternal anemia and low birth weight.`,
          generalObjective: `To assess dietary practices and adherence to iron supplements among pregnant women attending antenatal clinics in ${loc}.`,
          specificObjectives: [
            `1. To determine the frequency of balanced meal consumption among expectant mothers.`,
            `2. To evaluate adherence rates to prescribed iron and folic acid supplements (IFAS).`,
            `3. To identify common side effects and misconceptions that prevent regular supplement intake.`,
          ],
          methodologyHint: `Cross-sectional descriptive study using an interview questionnaire with pregnant women attending antenatal clinics.`,
        },
        {
          id: "rs-2",
          title: `Investigation of Cultural Food Taboos and Dietary Intake among Pregnant Women in ${loc}`,
          problemSummary: `Traditional food avoidances that restrict nutritious foods such as eggs and meat during pregnancy can lead to maternal malnutrition.`,
          generalObjective: `To identify cultural food taboos and their effect on the nutritional intake of pregnant women in ${loc}.`,
          specificObjectives: [
            `1. To document cultural food restrictions practiced by expectant mothers in the community.`,
            `2. To assess the alternative foods consumed to replace restricted animal-source foods.`,
            `3. To determine the source of nutrition information received by pregnant women.`,
          ],
          methodologyHint: `Descriptive survey using structured interviews with pregnant women attending local clinics.`,
        },
        {
          id: "rs-3",
          title: `Assessment of Dietary Diversity and Antenatal Weight Monitoring in ${loc}`,
          problemSummary: `Lack of dietary variety and irregular weight monitoring during pregnancy reduce early detection of maternal undernutrition.`,
          generalObjective: `To evaluate dietary diversity and the regularity of weight monitoring among pregnant women in ${loc}.`,
          specificObjectives: [
            `1. To calculate the Minimum Dietary Diversity for Women (MDD-W) score among pregnant women.`,
            `2. To review antenatal clinic cards for regular gestational weight gain recording.`,
            `3. To identify socio-economic barriers affecting maternal access to nutritious foods.`,
          ],
          methodologyHint: `Clinic-based survey combining 24-hour food recall checklists and maternal clinic card reviews.`,
        },
      ],
      followUpQuestion: `Would you like your study to focus on iron supplement adherence, cultural food taboos, or dietary diversity in pregnancy?`,
    };
  }

  // E. Chronic Lifestyle Diseases & Adult Nutrition Theme
  if (
    q.includes("diabetes") ||
    q.includes("hypertens") ||
    q.includes("blood pressure") ||
    q.includes("elderly") ||
    q.includes("salt") ||
    q.includes("sugar") ||
    q.includes("obesity") ||
    q.includes("adult")
  ) {
    return {
      problemAnalysis: `Promoting healthy dietary patterns and lifestyle awareness helps control diet-related non-communicable diseases in Kenyan communities.`,
      options: [
        {
          id: "rs-1",
          title: `Assessment of Dietary Habits and Salt Intake among Hypertensive Patients in ${loc}`,
          problemSummary: `High dietary sodium intake and low intake of fruits and vegetables contribute to poor blood pressure control among hypertensive patients.`,
          generalObjective: `To assess dietary habits, salt intake, and lifestyle practices among hypertensive patients attending local health centers.`,
          specificObjectives: [
            `1. To determine patients' awareness of dietary guidelines for managing high blood pressure.`,
            `2. To assess the frequency of consumption of processed, salty, and fried foods.`,
            `3. To identify challenges patients face in adopting low-salt and high-vegetable diets.`,
          ],
          methodologyHint: `Health center-based survey using structured questionnaires with patients attending chronic disease outpatient clinics.`,
        },
        {
          id: "rs-2",
          title: `Investigation of Dietary Knowledge and Glycemic Management among Diabetic Patients in ${loc}`,
          problemSummary: `Lack of clear dietary guidance leads many diabetic patients to consume high-glycemic meals that cause unstable blood sugar levels.`,
          generalObjective: `To evaluate dietary knowledge and meal planning practices among patients diagnosed with type 2 diabetes.`,
          specificObjectives: [
            `1. To evaluate patients' understanding of carbohydrate portion sizes.`,
            `2. To determine the frequency of fruit, vegetable, and whole-grain consumption among patients.`,
            `3. To identify dietary counseling received by patients during clinic visits.`,
          ],
          methodologyHint: `Descriptive survey using a structured questionnaire administered to diabetic clinic attendees.`,
        },
        {
          id: "rs-3",
          title: `A Survey on Nutritional Status and Dietary Challenges among Elderly Persons in ${loc}`,
          problemSummary: `Poor dentition, reduced appetite, and limited income leave many elderly individuals at risk of inadequate protein and calorie intake.`,
          generalObjective: `To assess the nutritional status and daily dietary challenges faced by elderly individuals in ${loc}.`,
          specificObjectives: [
            `1. To assess the daily meal frequency and common foods consumed by elderly community members.`,
            `2. To measure mid-upper arm circumference (MUAC) and body mass index (BMI) of elderly participants.`,
            `3. To identify physical and financial barriers that limit access to nutritious, easily chewable food.`,
          ],
          methodologyHint: `Community descriptive survey using a simplified questionnaire and anthropometric measurements with elderly persons.`,
        },
      ],
      followUpQuestion: `Would you like to study dietary management of high blood pressure, diabetes meal planning, or elderly nutritional status?`,
    };
  }

  // F. General Fallback for Any Other Nutrition Topic
  const cleanSubject =
    query
      .replace(/[^\w\s-]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(" ") || "Community Nutrition Practices";

  return {
    problemAnalysis: `Practical investigation into ${cleanSubject} in ${loc} establishes essential local findings to help households and community health workers improve nutritional outcomes.`,
    options: [
      {
        id: "rs-1",
        title: `Assessment of ${cleanSubject} and Nutritional Status in ${loc}`,
        problemSummary: `Limited local documentation on ${cleanSubject} makes it difficult to design effective community nutrition interventions.`,
        generalObjective: `To assess the current status and community practices regarding ${cleanSubject} in ${loc}.`,
        specificObjectives: [
          `1. To determine the prevalence and common community practices related to ${cleanSubject}.`,
          `2. To assess the association between ${cleanSubject} and overall dietary adequacy.`,
          `3. To identify key community challenges that hinder optimal nutrition practices.`,
        ],
        methodologyHint: `Cross-sectional descriptive survey using simple structured questionnaires and checklists, analyzed with basic percentage tables.`,
      },
      {
        id: "rs-2",
        title: `Investigation into Factors Influencing ${cleanSubject} in ${loc}`,
        problemSummary: `Socio-economic factors, food access, and cultural beliefs often constrain families from adopting balanced nutrition habits.`,
        generalObjective: `To investigate the socio-economic and environmental factors influencing ${cleanSubject} in ${loc}.`,
        specificObjectives: [
          `1. To assess household income and food expenditure patterns in relation to ${cleanSubject}.`,
          `2. To identify cultural beliefs and knowledge gaps affecting daily food choices.`,
          `3. To recommend realistic, low-cost dietary solutions for local families.`,
        ],
        methodologyHint: `Structured interview questionnaire administered to household caregivers, summarized using frequency tables.`,
      },
      {
        id: "rs-3",
        title: `A Community Survey on Knowledge and Practices Regarding ${cleanSubject} in ${loc}`,
        problemSummary: `Lack of targeted nutrition education leaves community members vulnerable to poor food selection and preparation habits.`,
        generalObjective: `To evaluate community nutrition knowledge, attitudes, and daily practices concerning ${cleanSubject} in ${loc}.`,
        specificObjectives: [
          `1. To evaluate community awareness regarding the nutritional value of local foods.`,
          `2. To document common food preparation and meal planning methods used by caregivers.`,
          `3. To assess the role of community health volunteers in delivering practical nutrition education.`,
        ],
        methodologyHint: `Descriptive survey administered to community members and health volunteers, analyzed using simple percentages.`,
      },
    ],
    followUpQuestion: `Would you like your study to focus on nutritional status assessment, socio-economic factors, or community nutrition knowledge?`,
  };
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

