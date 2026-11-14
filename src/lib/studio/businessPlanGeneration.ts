import type { BusinessPlanSpecs } from "./businessPlanTypes";
import { resolveBusinessPlanModel } from "./businessPlanTypes";
import {
  getBusinessModelConflictFindings,
  getBusinessPlanGeographicFindings,
} from "./businessPlanProfiles";
import type { SectionDef } from "./templates";

export interface BusinessPlanResearchSource {
  title: string;
  url: string;
}

export interface BusinessPlanResearch {
  summary: string;
  sources: BusinessPlanResearchSource[];
  searchedAt: string;
}

export interface BusinessPlanDraftSection {
  section_key: string;
  title: string;
  content: string;
  wordCount: number;
}

export type BusinessPlanAIProvider = "gemini" | "groq";

export interface BusinessPlanReviewFinding {
  sectionKey: string;
  severity: "high" | "medium" | "low";
  category: string;
  issue: string;
  recommendation: string;
  sourceRefs: number[];
}

export interface BusinessPlanCorrectionChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BusinessPlanDocumentReview {
  findings: BusinessPlanReviewFinding[];
  chaptersReviewed: number;
  warnings: string[];
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-20b";
const GROQ_TEXT_MODELS = [
  GROQ_DEFAULT_MODEL,
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];
const unavailableGroqModels = new Set<string>();

function normalizeApiKey(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']+|["']+$/g, "").trim();
}

function hasConfiguredApiKey(value: string | undefined): boolean {
  const trimmed = normalizeApiKey(value);
  if (!trimmed || trimmed.length < 12) return false;
  if (/^your_[a-z0-9_]+_here$/i.test(trimmed)) return false;
  if (/^(todo|replace_me|changeme|none|null|undefined)$/i.test(trimmed)) return false;
  return true;
}

export function isBusinessPlanProviderConfigured(provider: BusinessPlanAIProvider): boolean {
  return provider === "gemini"
    ? hasConfiguredApiKey(process.env.GEMINI_API_KEY)
    : hasConfiguredApiKey(process.env.GROQ_API_KEY);
}

export function resolveAvailableBusinessPlanProvider(
  preferred?: BusinessPlanAIProvider | string | null
): { primary: BusinessPlanAIProvider; fallback: BusinessPlanAIProvider | null } {
  const normalized: BusinessPlanAIProvider = preferred === "gemini" ? "gemini" : "groq";
  const alternate: BusinessPlanAIProvider = normalized === "gemini" ? "groq" : "gemini";
  const primaryReady = isBusinessPlanProviderConfigured(normalized);
  const alternateReady = isBusinessPlanProviderConfigured(alternate);

  if (primaryReady) {
    return { primary: normalized, fallback: alternateReady ? alternate : null };
  }
  if (alternateReady) {
    return { primary: alternate, fallback: null };
  }
  throw new Error(
    "No AI provider key is configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env.local and restart the server."
  );
}

function readGeminiText(data: Record<string, unknown>): string {
  const candidates = data.candidates as Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }> | undefined;
  return (candidates?.[0]?.content?.parts || [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function callGemini(
  prompt: string,
  options: { googleSearch?: boolean; json?: boolean; timeoutMs?: number; maxOutputTokens?: number } = {}
): Promise<Record<string, unknown>> {
  const apiKey = normalizeApiKey(process.env.GEMINI_API_KEY);
  if (!hasConfiguredApiKey(apiKey)) {
    throw new Error("Configure GEMINI_API_KEY to use Gemini.");
  }

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const models = configuredModel
    ? [configuredModel, ...GEMINI_MODELS.filter((model) => model !== configuredModel)]
    : GEMINI_MODELS;
  let lastError = "";

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              ...(options.googleSearch ? { tools: [{ google_search: {} }] } : {}),
              generationConfig: {
                temperature: 0.2,
                ...(options.json ? { responseMimeType: "application/json" } : {}),
                maxOutputTokens: options.maxOutputTokens ?? (options.googleSearch ? 4500 : 8192),
              },
            }),
            signal: AbortSignal.timeout(options.timeoutMs ?? 55000),
          }
        );
        if (response.ok) return await response.json();
        const body = await response.json().catch(() => null);
        const message = body?.error?.message;
        lastError = typeof message === "string" ? message : `HTTP ${response.status}`;
        if ((response.status === 429 || response.status === 503) && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Network timeout";
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
      }
    }
  }

  throw new Error(lastError
    ? `Gemini request failed: ${lastError.slice(0, 300)}`
    : "Gemini could not be reached. Check the connection and try again.");
}

async function callGroq(
  prompt: string,
  options: { browserSearch?: boolean; json?: boolean; timeoutMs?: number; maxCompletionTokens?: number } = {}
): Promise<Record<string, unknown>> {
  const apiKey = normalizeApiKey(process.env.GROQ_API_KEY);
  if (!hasConfiguredApiKey(apiKey)) {
    throw new Error("Configure GROQ_API_KEY to use Groq.");
  }

  const configuredTextModel = process.env.GROQ_TEXT_MODEL?.trim();
  const baseModels = options.browserSearch
    ? [process.env.GROQ_SEARCH_MODEL?.trim() || GROQ_DEFAULT_MODEL]
    : configuredTextModel
    ? [configuredTextModel, ...GROQ_TEXT_MODELS.filter((m) => m !== configuredTextModel)]
    : GROQ_TEXT_MODELS;
  const modelsToTry = baseModels.filter((m) => !unavailableGroqModels.has(m));
  const effectiveModels = modelsToTry.length > 0 ? modelsToTry : [GROQ_DEFAULT_MODEL];

  const safeMaxCompletionTokens = Math.min(
    options.maxCompletionTokens ?? (options.browserSearch ? 3500 : 4500),
    6000
  );

  let lastError = "";
  for (const model of effectiveModels) {
    const isReasoningModel = model.startsWith("openai/gpt-oss");
    const requestBody = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: safeMaxCompletionTokens,
      ...(isReasoningModel ? { reasoning_effort: "low" } : {}),
      ...(options.browserSearch
        ? {
            tool_choice: "required",
            tools: [{ type: "browser_search" }],
          }
        : options.json
        ? { response_format: { type: "json_object" } }
        : {}),
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: requestBody,
          signal: AbortSignal.timeout(options.timeoutMs ?? (options.browserSearch ? 40000 : 22000)),
        });
        if (response.ok) return response.json();

        const body = await response.json().catch(() => null);
        const message = body?.error?.message;
        const code = body?.error?.code;
        const messageText = typeof message === "string" ? message : `HTTP ${response.status}`;
        lastError = messageText;
        if (response.status === 404 || code === "model_not_found" || /does not exist|model_not_found/i.test(messageText)) {
          unavailableGroqModels.add(model);
          break;
        }
        const retryMatch = messageText.match(/try again in\s+(\d+(?:\.\d+)?)\s*s/i);
        const headerRetry = Number(response.headers.get("retry-after"));
        const retrySeconds = retryMatch ? Number(retryMatch[1]) : headerRetry;
        if (
          response.status === 429 && attempt === 0 &&
          Number.isFinite(retrySeconds) && retrySeconds > 0 && retrySeconds <= 2
        ) {
          await new Promise((resolve) => setTimeout(resolve, Math.ceil(retrySeconds * 1000) + 200));
          continue;
        }
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Network timeout";
        break;
      }
    }
  }

  throw new Error(`Groq request failed: ${(lastError || "Rate-limit or network error").slice(0, 300)}`);
}

function readGroqText(data: Record<string, unknown>): string {
  const choices = data.choices as Array<{ message?: { content?: unknown } }> | undefined;
  const content = choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

async function generateJson(
  prompt: string,
  provider: BusinessPlanAIProvider,
  options: { maxTokens?: number } = {}
): Promise<Record<string, unknown>> {
  const { primary, fallback } = resolveAvailableBusinessPlanProvider(provider);
  const invokeProvider = async (target: BusinessPlanAIProvider) => {
    const response = target === "groq"
      ? await callGroq(prompt, { json: true, maxCompletionTokens: options.maxTokens })
      : await callGemini(prompt, { json: true, timeoutMs: 55000, maxOutputTokens: options.maxTokens });
    const text = target === "groq" ? readGroqText(response) : readGeminiText(response);
    return parseJsonObject(text);
  };

  try {
    return await invokeProvider(primary);
  } catch (primaryError) {
    if (!fallback) throw primaryError;
    console.warn(`${primary} call failed in generateJson, falling back to ${fallback}:`, primaryError);
    try {
      return await invokeProvider(fallback);
    } catch (fallbackError) {
      const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : "";
      if (/api key not valid|invalid api key|configure .*_api_key/i.test(fallbackMsg)) {
        throw primaryError;
      }
      throw fallbackError;
    }
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI returned an invalid research response. Try again.");
  const json = cleaned.slice(start, end + 1);
  let inString = false;
  let escaped = false;
  let normalized = "";
  for (const character of json) {
    const code = character.charCodeAt(0);
    if (inString && code < 0x20) {
      normalized += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }
    normalized += character;
    if (!inString) {
      if (character === '"') inString = true;
    } else if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === '"') {
      inString = false;
    }
  }
  const withoutTrailingCommas = normalized.replace(/,\s*([}\]])/g, "$1");

  let value: unknown;
  try {
    value = JSON.parse(withoutTrailingCommas);
  } catch {
    throw new Error("The AI returned an invalid response format. Try again.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The AI returned an invalid research response. Try again.");
  }
  return value as Record<string, unknown>;
}

function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function researchBusinessPlan(
  specs: BusinessPlanSpecs,
  provider: BusinessPlanAIProvider
): Promise<BusinessPlanResearch> {
  const prompt = `Research current, verifiable public information for a business plan in Kenya.
Business: ${specs.businessName}
Sector: ${specs.industrySector}
Product/service: ${specs.primaryProduct}
Location: ${specs.townOrMarket}, ${specs.county}, Kenya
Target customers: ${specs.targetCustomersDescription || "Not supplied"}

Use web search. Prioritize official county, national statistics, regulator, and recognized industry sources. Return JSON only:
{"summary":"A concise research brief with facts, dates, and uncertainty clearly stated.","sourceUrls":["https://..." ]}
Research local context, reachable customer segments, known competitors or alternatives, supplier/transport conditions, and permits relevant to this sector. Do not invent local population figures, business names, prices, survey results, supplier quotes, license fees, or regulations. Say when a detail could not be verified. Keep summary under 900 words.`;

  const { primary, fallback } = resolveAvailableBusinessPlanProvider(provider);
  const invokeResearch = async (target: BusinessPlanAIProvider) => {
    if (target === "groq") {
      const res = await callGroq(
        `${prompt}\nReturn sources as a JSON array with the exact page title and full HTTPS URL for each source you used. Keep any browser-search citation markers beside researched claims.`,
        { browserSearch: true, timeoutMs: 60000 }
      );
      return { response: res, actualProvider: "groq" as const };
    }
    const res = await callGemini(prompt, { googleSearch: true, timeoutMs: 60000 });
    return { response: res, actualProvider: "gemini" as const };
  };

  let response: Record<string, unknown>;
  let actualProvider: BusinessPlanAIProvider;
  try {
    const res = await invokeResearch(primary);
    response = res.response;
    actualProvider = res.actualProvider;
  } catch (primaryError) {
    if (!fallback) throw primaryError;
    console.warn(`${primary} research call failed, falling back to ${fallback}:`, primaryError);
    try {
      const res = await invokeResearch(fallback);
      response = res.response;
      actualProvider = res.actualProvider;
    } catch (fallbackError) {
      const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : "";
      if (/api key not valid|invalid api key|configure .*_api_key/i.test(fallbackMsg)) {
        throw primaryError;
      }
      throw fallbackError;
    }
  }

  const resultText = actualProvider === "groq" ? readGroqText(response) : readGeminiText(response);
  const parsed = parseJsonObject(resultText);
  const grounding = response.candidates as Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
    };
  }> | undefined;
  const chunks = grounding?.[0]?.groundingMetadata?.groundingChunks || [];
  const sourceCandidates = actualProvider === "groq"
    ? (Array.isArray(parsed.sources) ? parsed.sources : [])
    : chunks.map((chunk) => ({ title: chunk.web?.title, url: chunk.web?.uri }));
  const sources = sourceCandidates.reduce<BusinessPlanResearchSource[]>((all, source) => {
    if (!isSafeSourceUrl(source.url) || all.some((item) => item.url === source.url)) return all;
    all.push({
      title: typeof source.title === "string" && source.title.trim()
        ? source.title.trim().slice(0, 200)
        : new URL(source.url).hostname,
      url: source.url,
    });
    return all;
  }, []).slice(0, 12);

  const providerSummary = typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 12_000) : "";
  if (!providerSummary) {
    throw new Error("The research provider returned no usable summary. Try again.");
  }
  // Without verifiable URLs, discard provider claims and continue from the
  // candidate's entered market details instead of presenting unsourced claims.
  const summary = sources.length > 0
    ? providerSummary
    : "Web search returned no verifiable sources. Use only the candidate-supplied market details in this plan. Mark market size, competitor, supplier, price, and permit claims for local verification.";

  return { summary, sources, searchedAt: new Date().toISOString() };
}

function reconcileExecutiveSummaryFinancials(content: string, baseline: string): string | null {
  const extractMoney = (value: string) =>
    (value.match(/KES\s*[\d,]+(?:\.\d+)?/g) || []).map((m) => m.replace(/\s+/g, " ").trim());
  const baselineMoney = extractMoney(baseline);
  const contentMoney = extractMoney(content);
  if (JSON.stringify(contentMoney) === JSON.stringify(baselineMoney)) {
    return content;
  }
  const baselineSet = new Set(baselineMoney);
  if (
    contentMoney.length >= baselineSet.size &&
    baselineMoney.every((item) => contentMoney.includes(item)) &&
    contentMoney.every((item) => baselineSet.has(item))
  ) {
    return content;
  }

  // Deterministic financial reconciliation: keep AI's enterprise/market intro
  // paragraphs and splice in the exact deterministic startup & forecast paragraphs from baseline.
  const baselineBlocks = baseline.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const financialBlocks = baselineBlocks.filter((b) =>
    /requires estimated start-up capital|Financial forecasts project first-year gross sales/i.test(b)
  );
  if (financialBlocks.length < 2) return null;

  const contentBlocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const headingBlock = contentBlocks.find((b) => /^#{1,4}\s/.test(b)) || "### EXECUTIVE SUMMARY / SYNOPSIS";
  const narrativeBlocks = contentBlocks.filter(
    (b) =>
      !/^#{1,4}\s/.test(b) &&
      !/start-up capital|owner's equity|gross sales|net profit after tax|return on investment/i.test(b)
  );
  if (narrativeBlocks.length === 0) return null;

  const firstNarrative = narrativeBlocks.slice(0, 2).join("\n\n");
  const reconciled = [headingBlock, firstNarrative, ...financialBlocks].join("\n\n");
  const reconciledMoney = extractMoney(reconciled);
  if (
    baselineMoney.every((item) => reconciledMoney.includes(item)) &&
    reconciledMoney.every((item) => baselineSet.has(item))
  ) {
    return reconciled;
  }
  return null;
}

export async function draftBusinessPlanSections(
  specs: BusinessPlanSpecs,
  definitions: SectionDef[],
  research: BusinessPlanResearch,
  scriptedSections: Map<string, string>,
  provider: BusinessPlanAIProvider
): Promise<Map<string, string>> {
  const protectedKeys = new Set([
    "prelim.declaration", "prelim.dedication", "prelim.acknowledgements",
    "app.invoices", "references",
  ]);
  const reviewable = definitions.filter(
    (section) =>
      !protectedKeys.has(section.key) &&
      !section.key.startsWith("ch5.") &&
      scriptedSections.has(section.key)
  );
  if (reviewable.length === 0) return new Map();

  const candidateEvidence = {
    businessModel: resolveBusinessPlanModel(specs),
    businessAreaMayDifferFromModelLabel: true,
    businessName: specs.businessName,
    candidateName: specs.candidateName,
    course: specs.course,
    qualificationLevel: specs.level,
    sector: specs.industrySector,
    tagline: specs.tagline,
    ownership: specs.formOfOwnership,
    registrationTypeCandidateSupplied: specs.registrationType,
    ownerQualificationsCandidateSupplied: specs.ownerQualifications,
    county: specs.county,
    townOrMarket: specs.townOrMarket,
    proposedAddress: specs.streetOrBuilding,
    locationRationaleCandidateSupplied: specs.locationRationale,
    product: specs.primaryProduct,
    productDescriptionCandidateSupplied: specs.productDescription,
    packagingCandidateSupplied: specs.productPackaging,
    sellingPriceKES: specs.unitSellingPrice,
    unitCostKES: specs.unitCostOfProduction,
    plannedMonthlyVolume: specs.monthlyProductionUnitsYear1,
    targetCustomers: specs.targetCustomersDescription,
    statedMarketSize: specs.totalMarketPopulation,
    projectedMarketSharePercentage: specs.projectedMarketSharePercentage,
    competitors: specs.competitors,
    equipmentCandidateEntries: specs.machinery,
    materialsCandidateEntries: specs.rawMaterials,
    staffCandidateEntries: specs.staffing,
    monthlyRentKES: specs.monthlyRent,
    estimatedPremisesAreaSquareMetres: specs.workshopSquareMeters,
    startupAndWorkingCapitalAssumptionsKES: {
      preOperationalCosts: specs.preOperationalCosts,
      workingCapitalBuffer: specs.workingCapitalBuffer,
      ownerEquityAmount: specs.ownerEquityAmount,
      loanAmount: specs.loanAmount,
    },
    overheadAssumptionsKES: specs.monthlyOverheads,
  };
  const sourceList = research.sources
    .map((source, index) => `[${index + 1}] ${source.title} — ${source.url}`)
    .join("\n") || "No verified web sources are available.";
  const updated = new Map<string, string>();

  const validateCandidateDraft = (
    definition: SectionDef,
    rawContent: string,
    allowSoftWordThreshold: boolean
  ): string | null => {
    const trimmed = rawContent.trim();
    if (!trimmed || trimmed.length > 30_000) return null;
    const minWords = definition.minWords || 80;
    const requiredWords = allowSoftWordThreshold
      ? Math.max(65, Math.floor(minWords * 0.82))
      : minWords;
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    if (words < requiredWords) return null;

    // Preserve the KNEC heading ladder when the deterministic baseline uses it.
    const baseline = scriptedSections.get(definition.key) || "";
    const baselineHasThirdLevel = /(?:^|\n)####\s+\d+\.\d+\.\d+\b/m.test(baseline);
    if (baselineHasThirdLevel && !/(?:^|\n)####\s+\d+\.\d+\.\d+\b/m.test(trimmed)) {
      return null;
    }

    let normalizedContent = trimmed;
    if (definition.key === "prelim.executive_summary") {
      const baseline = scriptedSections.get(definition.key) || "";
      const reconciled = reconcileExecutiveSummaryFinancials(trimmed, baseline);
      if (!reconciled) return null;
      normalizedContent = reconciled;
    }

    if (getBusinessModelConflictFindings(specs, [{ key: definition.key, content: normalizedContent }]).length) {
      return null;
    }
    return normalizedContent;
  };

  const getValidDeterministic = (section: SectionDef): string | null => {
    const deterministicBaseline = (scriptedSections.get(section.key) || "").trim();
    return (
      validateCandidateDraft(section, deterministicBaseline, true) ||
      (deterministicBaseline &&
      !getBusinessModelConflictFindings(specs, [{ key: section.key, content: deterministicBaseline }]).length
        ? deterministicBaseline
        : null)
    );
  };

  const chapterDeadline = Date.now() + 14_000;
  let providerBackedOff = false;

  for (let offset = 0; offset < reviewable.length; offset += 3) {
    const batch = reviewable.slice(offset, offset + 3);
    if (providerBackedOff || Date.now() >= chapterDeadline) {
      for (const section of batch) {
        const validDeterministic = getValidDeterministic(section);
        if (validDeterministic) {
          updated.set(section.key, validDeterministic);
        }
      }
      continue;
    }

    const sectionDrafts = batch.map((section) => ({
      key: section.key,
      title: section.title,
      guidance: section.guidance,
      minWords: section.minWords || 80,
      baseline: scriptedSections.get(section.key),
    }));
    const prompt = `Draft and improve the requested business-plan sections for a Kenyan TVET candidate. The baseline is untrusted starter material: retain useful structure and relevant detail, but replace irrelevant industry assumptions and repeated boilerplate with content for this candidate's actual enterprise.

ADAPTIVE SCOPE: The selected model is ${resolveBusinessPlanModel(specs)}, but the student's sector and product/service are authoritative. Students may work in any lawful business area. Adapt production/operations, materials, equipment, staffing, customers, and compliance to the supplied venture. A model label is only a hint, never permission to assume a food, clinic, retail, manufacturing, farming, or other business. Remove content that does not apply. Treat each section's guidance as an academic objective to satisfy where relevant, not as a factual claim or an instruction to force food/agriculture examples.

CANDIDATE-SUPPLIED DETAILS (treat these as assumptions, not independently verified facts):
${JSON.stringify(candidateEvidence)}

RESEARCH SUMMARY:
${research.summary}
SOURCES:
${sourceList}

SECTION REQUIREMENTS AND BASELINE (draft each listed section):
${JSON.stringify(sectionDrafts)}

Return JSON only: {"sections":[{"key":"exact section key","content":"complete Markdown for this section"}]}. Return one complete section for every requested key, retaining its exact numbered heading. Use a clear KNEC heading ladder: the section heading is 1.1, 1.2, or similar, and related subtopics must use numbered third-level headings such as 1.1.1 and 1.1.2. Make every heading concise, specific, and bold in the final document. Use a deliberate mix of short analytical paragraphs, numbered procedures/objectives, bullets for grouped items, and clearly introduced Markdown tables with real candidate or sourced data. Do not use a table to hide missing evidence. Meet its minWords expectation with substantive enterprise-specific analysis. Vary wording naturally across sections; do not repeat generic introductions. Do not invent market sizes, competitors, survey findings, suppliers, quotations, prices, permits, fees, approvals, registrations, partnerships, or legal requirements. Candidate entries are assumptions, not verified evidence. Phrase missing information as a proposal or mark it [Confirm locally] / [Quotation required]. Cite supported external claims with [n], using only the listed sources. Do not introduce a source number without a matching listed source. Do not create or modify financial statements, ratios, forecasts, or calculations; chapter 5 is excluded. In the executive summary, retain every KES amount and financial percentage exactly as shown in the baseline. Do not claim an activity or facility exists if it is only proposed.

GEOGRAPHIC CONSISTENCY CHECK (required): Compare every named town, county, sub-county, ward, road, and health facility in the draft with the candidate's stated business location and the supplied research. Flag claims that describe a distant or differently located facility as nearby, or place it in the wrong county. Do not guess a replacement facility. If the mismatch is clear from the supplied sources, correct only that claim; if no local facility is verified, use cautious wording such as "health facilities serving [town]" and add [Confirm locally].

If local geography or sector facts are uncertain, use cautious wording and [Confirm locally].`;

    let lastBatchError: unknown = null;
    try {
      const parsed = await generateJson(prompt, provider, { maxTokens: 4500 });
      const drafts = Array.isArray(parsed.sections) ? parsed.sections : [];
      for (const draft of drafts) {
        if (!draft || typeof draft !== "object") continue;
        const item = draft as { key?: unknown; content?: unknown };
        if (typeof item.key !== "string" || typeof item.content !== "string") continue;
        const definition = batch.find((section) => section.key === item.key);
        if (!definition) continue;
        const accepted = validateCandidateDraft(definition, item.content, true);
        if (accepted) {
          updated.set(definition.key, accepted);
        }
      }
    } catch (batchErr) {
      lastBatchError = batchErr;
      providerBackedOff = true;
    }

    // Per AGENTS.md ("Build the bulk draft deterministically. AI may make limited
    // evidence-supported corrections"): if a section already has a valid deterministic
    // baseline, use it immediately when omitted/rejected by the batch call rather than
    // triggering a cascade of slow sequential single-section retries.
    const missingInBatch = batch.filter((section) => !updated.has(section.key));
    for (const section of missingInBatch) {
      const validDeterministic = getValidDeterministic(section);
      if (validDeterministic) {
        updated.set(section.key, validDeterministic);
        continue;
      }

      if (providerBackedOff || Date.now() >= chapterDeadline) {
        if (lastBatchError) throw lastBatchError;
        continue;
      }

      const targetMinWords = section.minWords || 80;
      const singlePrompt = `Draft one complete, enterprise-specific KNEC business-plan section for a Kenyan TVET candidate.
Section key: ${section.key}
Section title: ${section.title}
Minimum word count required: ${targetMinWords} words (write at least ${targetMinWords + 25} words of substantive analysis, procedures, and Markdown tables/lists where appropriate).
Section guidance: ${section.guidance}

ADAPTIVE SCOPE: Selected model is ${resolveBusinessPlanModel(specs)}, sector is "${specs.industrySector}", primary offering is "${specs.primaryProduct}" in ${specs.townOrMarket}, ${specs.county}. Do not use incompatible industry terminology (e.g., for consultancy, do not describe manufacturing factory lines or raw material milling; for manufacturing, focus on production operations).

CANDIDATE-SUPPLIED DETAILS:
${JSON.stringify(candidateEvidence)}

RESEARCH SUMMARY:
${research.summary}
SOURCES:
${sourceList}

BASELINE SECTION TO ADAPT:
${scriptedSections.get(section.key) || ""}

Return JSON only: {"key":${JSON.stringify(section.key)},"content":"complete Markdown starting with ### ${section.title}"}. Use numbered third-level headings such as ${section.title.match(/^\d+\.\d+/)?.[0] || "1.1"}.1 and ${section.title.match(/^\d+\.\d+/)?.[0] || "1.1"}.2 where the section contains multiple related themes. Make headings concise and bold in the final document. Use short paragraphs, numbered steps, bullets, and clearly labelled Markdown tables with real candidate or sourced data.
Do not invent facts, competitors, survey results, permits, or financial figures. Mark unverified local details with [Confirm locally] or [Quotation required]. ${section.key === "prelim.executive_summary" ? "Retain all KES amounts and financial percentages from the baseline executive summary." : ""}`;

      try {
        const singleParsed = await generateJson(singlePrompt, provider, { maxTokens: 3200 });
        const rawSingle =
          typeof singleParsed.content === "string"
            ? singleParsed.content
            : Array.isArray(singleParsed.sections) &&
              singleParsed.sections[0] &&
              typeof (singleParsed.sections[0] as { content?: unknown }).content === "string"
            ? ((singleParsed.sections[0] as { content: string }).content)
            : "";
        const accepted = validateCandidateDraft(section, rawSingle, true);
        if (accepted) {
          updated.set(section.key, accepted);
          continue;
        }
      } catch (singleErr) {
        lastBatchError = singleErr || lastBatchError;
        providerBackedOff = true;
      }

      if (lastBatchError) {
        throw lastBatchError;
      }
    }
  }
  return updated;
}
export async function reviewWholeBusinessPlan(
  specs: BusinessPlanSpecs,
  sections: Array<{ key: string; title: string; guidance: string; content: string }>,
  research: BusinessPlanResearch,
  provider: BusinessPlanAIProvider
): Promise<BusinessPlanDocumentReview> {
  const skipped = new Set(["prelim.declaration", "prelim.dedication", "prelim.acknowledgements"]);
  const reviewable = sections.filter((section) => section.content.trim() && !skipped.has(section.key));
  if (reviewable.length === 0) {
    return { findings: [], chaptersReviewed: 0, warnings: ["No reviewable sections were found."] };
  }

  const extractEvidence = (content: string) => {
    const lines = content.split(/\r?\n/).filter((line) =>
      /^\s*(#{1,4}\s|\|\s|[-*]\s|\d+[.)]\s)/.test(line) ||
      /\b(KES|according to|survey|permit|licen[cs]e|approval|registered|approved|contract|percentage|market share|location|located|near|proximity|county|town|hospital|clinic|health facilit|road|kilomet|within|based in|ward|sub.county|municipal)\b|\d|%/i.test(line)
    );
    return (lines.join(" ") || content).replace(/\s+/g, " ").slice(0, 900);
  };
  const documentContent = reviewable.map((section) => ({
    key: section.key,
    title: section.title,
    requirement: section.guidance,
    evidenceAndStructure: extractEvidence(section.content),
  }));
  const modelConflictFindings = getBusinessModelConflictFindings(specs, reviewable).map((finding) => ({
    sectionKey: finding.sectionKey,
    severity: "high" as const,
    category: "consistency",
    issue: finding.issue,
    recommendation: "Revise this section to match the selected business model. Existing text remains saved until the candidate edits it or explicitly confirms a rebuild.",
    sourceRefs: [] as number[],
  }));
  const geographicFindings = getBusinessPlanGeographicFindings(specs, reviewable).map((finding) => ({
    sectionKey: finding.sectionKey,
    severity: "high" as const,
    category: "consistency",
    issue: finding.issue,
    recommendation: finding.recommendation,
    sourceRefs: [] as number[],
  }));
  const deterministicFindings = [...modelConflictFindings, ...geographicFindings];
  const groupCount = new Set(reviewable.map((section) => section.key.match(/^(ch\d+|prelim|app|references)/)?.[1] || "other")).size;
  const sourceList = research.sources
    .map((source, index) => `[${index + 1}] ${source.title} — ${source.url}`)
    .join("\n").slice(0, 1800) || "No independently verified web sources are attached.";
  const candidateFacts = {
    businessModel: resolveBusinessPlanModel(specs),
    businessName: specs.businessName,
    sector: specs.industrySector,
    location: `${specs.townOrMarket}, ${specs.county}`,
    product: specs.primaryProduct,
    unitPriceKES: specs.unitSellingPrice,
    unitCostKES: specs.unitCostOfProduction,
    statedMarketSize: specs.totalMarketPopulation,
    targetCustomers: specs.targetCustomersDescription,
    competitors: specs.competitors.map(({ name, location, priceLevel }) => ({ name, location, priceLevel })),
  };
  const prompt = `Review this complete business plan across all chapters. Check factual support, cross-section consistency, completeness against requirements, repetition, and whether the extracted content has suitable lists or tables. This is an audit only; do not rewrite or apply edits.

ENTERPRISE FIT (required): The model label is ${resolveBusinessPlanModel(specs)}, but the candidate's stated sector, product or service, and evidence define the actual enterprise. Check every section for incompatible activities, operations, costs, customers, staff, equipment, regulations, and repeated boilerplate. Do not assume the venture is a food business or a consultancy unless its supplied identity says so. Report mismatches as findings; do not rewrite the manuscript.

GEOGRAPHIC CONSISTENCY CHECK (required): Compare every named town, county, sub-county, ward, road, and health facility in the manuscript with the candidate's stated business location and the supplied research. Flag claims that describe a distant or differently located facility as nearby, or place it in the wrong county. Use only the supplied sources for factual conclusions; if they do not resolve the issue, recommend local verification rather than guessing a replacement facility. Include the finding under the section containing the mismatch.

CANDIDATE DETAILS (assumptions, not independent evidence):
${JSON.stringify(candidateFacts)}

RESEARCH SUMMARY:
${research.summary.replace(/\s+/g, " ").slice(0, 1000)}
SOURCES:
${sourceList}

ALL SECTIONS (key, requirement, and selected evidence/structure lines):
${JSON.stringify(documentContent)}

Return JSON only as {"findings":[{"sectionKey":"exact section key","severity":"high|medium|low","category":"accuracy|evidence|consistency|completeness|structure","issue":"specific problem","recommendation":"specific correction or verification needed","sourceRefs":[1]}]}. Include only substantive issues, maximum 10 findings total. Do not invent facts or cite unlisted sources. Treat candidate figures as assumptions and never alter financial calculations. For unsupported claims, recommend local verification. Return an empty list if no issues are found.`;

  const warnings: string[] = [];
  let parsed: Record<string, unknown>;
  try {
    parsed = await generateJson(prompt, provider, { maxTokens: 1200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider error.";
    if (provider === "groq" && process.env.GEMINI_API_KEY && /429|rate.?limit|too many requests|tokens per minute/i.test(message)) {
      try {
        parsed = await generateJson(prompt, "gemini", { maxTokens: 1200 });
        warnings.push("Groq was rate-limited; Gemini completed the whole-document review instead.");
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "Unknown provider error.";
        return {
          findings: deterministicFindings,
          chaptersReviewed: 0,
          warnings: [`Groq and Gemini could not complete the review. ${fallbackMessage.slice(0, 220)}`],
        };
      }
    } else {
      return {
        findings: deterministicFindings,
        chaptersReviewed: 0,
        warnings: [`${message.slice(0, 240)}`],
      };
    }
  }

  const rows = Array.isArray(parsed.findings) ? parsed.findings : [];
  const allowedKeys = new Set(reviewable.map((section) => section.key));
  const findings: BusinessPlanReviewFinding[] = [];
  for (const row of rows.slice(0, 10)) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    if (
      typeof item.sectionKey !== "string" || !allowedKeys.has(item.sectionKey) ||
      !["high", "medium", "low"].includes(String(item.severity)) ||
      typeof item.issue !== "string" || typeof item.recommendation !== "string"
    ) continue;
    const sourceRefs = Array.isArray(item.sourceRefs)
      ? item.sourceRefs.filter((index): index is number =>
          Number.isInteger(index) && Number(index) >= 1 && Number(index) <= research.sources.length
        )
      : [];
    findings.push({
      sectionKey: item.sectionKey,
      severity: item.severity as BusinessPlanReviewFinding["severity"],
      category: typeof item.category === "string" ? item.category.slice(0, 40) : "review",
      issue: item.issue.slice(0, 500),
      recommendation: item.recommendation.slice(0, 700),
      sourceRefs,
    });
  }

  const combinedFindings = [
    ...deterministicFindings,
    ...findings.filter((finding) => !deterministicFindings.some(
      (deterministicFinding) => deterministicFinding.sectionKey === finding.sectionKey && deterministicFinding.category === finding.category
    )),
  ].slice(0, 10);
  return { findings: combinedFindings, chaptersReviewed: groupCount, warnings };
}

export async function respondToBusinessPlanCorrectionChat(args: {
  provider: BusinessPlanAIProvider;
  specs: BusinessPlanSpecs;
  sectionKey: string;
  sectionTitle: string;
  sectionText: string;
  issue: string;
  recommendation: string;
  messages: BusinessPlanCorrectionChatMessage[];
  currentProposal?: string;
}) {
  if (args.sectionKey.startsWith("ch5.")) {
    return {
      reply: "Financial statements and calculated totals are protected from AI edits. Discuss the assumptions with your supervisor and update them through the business-plan financial inputs.",
      proposedText: "",
    };
  }
  const messages = args.messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 2000),
  }));
  const prompt = `You are helping a student and supervisor resolve one specific business-plan review finding. This is a focused correction chat, not permission to rewrite unrelated material.

SECTION: ${args.sectionTitle} (${args.sectionKey})
REVIEW ISSUE: ${args.issue}
RECOMMENDED ACTION: ${args.recommendation}
BUSINESS DETAILS (candidate-supplied; treat as assumptions): ${JSON.stringify({
    model: resolveBusinessPlanModel(args.specs),
    business: args.specs.businessName,
    location: `${args.specs.townOrMarket}, ${args.specs.county}`,
    serviceOrProduct: args.specs.primaryProduct,
  })}
SECTION TEXT:
${args.sectionText.slice(0, 30000)}

CURRENT PROPOSAL:
${(args.currentProposal || "None yet").slice(0, 30000)}

CHAT:
${JSON.stringify(messages)}

Rules: Explain the finding plainly and answer the latest question. If enough information exists, provide a proposed replacement for this section only, preserving unrelated points and structure. Do not invent evidence, local facilities, survey results, permissions, prices, or partnerships. If a fact is missing, use concise [Confirm locally] wording or ask one targeted question and leave proposedText empty. Never change financial calculations or numerical assumptions. Return JSON only as {"reply":"short response","proposedText":"complete proposed section text, or empty string if clarification is needed"}.`;
  const resolved = resolveAvailableBusinessPlanProvider(args.provider);
  let parsed: Record<string, unknown>;
  try {
    parsed = await generateJson(prompt, resolved.primary, { maxTokens: 3500 });
  } catch (err) {
    if (resolved.fallback) {
      parsed = await generateJson(prompt, resolved.fallback, { maxTokens: 3500 });
    } else {
      throw err;
    }
  }
  const reply = typeof parsed.reply === "string" ? parsed.reply.trim().slice(0, 3000) : "I could not prepare a correction. Please clarify what should change.";
  const proposedText = typeof parsed.proposedText === "string" && parsed.proposedText.trim().length <= 30000
    ? parsed.proposedText.trim()
    : "";
  if (proposedText && getBusinessModelConflictFindings(args.specs, [{ key: args.sectionKey, content: proposedText }]).length) {
    return {
      reply: "That suggestion conflicts with the selected business model, so I did not prepare it. Please clarify the correction or revise the business details first.",
      proposedText: "",
    };
  }
  return { reply, proposedText };
}
