import type { BusinessPlanSpecs } from "./businessPlanTypes";
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

export interface BusinessPlanDocumentReview {
  findings: BusinessPlanReviewFinding[];
  chaptersReviewed: number;
  warnings: string[];
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-20b";

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Configure Gemini to research and build a complete business plan.");

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const models = configuredModel
    ? [configuredModel, ...GEMINI_MODELS.filter((model) => model !== configuredModel)]
    : GEMINI_MODELS;
  let lastError = "";

  for (const model of models) {
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
              maxOutputTokens: options.maxOutputTokens ?? (options.googleSearch ? 4500 : 7000),
            },
          }),
          signal: AbortSignal.timeout(options.timeoutMs ?? 55000),
        }
      );
      if (response.ok) return await response.json();
      const body = await response.json().catch(() => null);
      const message = body?.error?.message;
      lastError = typeof message === "string" ? message : `HTTP ${response.status}`;
    } catch {
      // Retry with the next supported Gemini model.
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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Configure GROQ_API_KEY to use Groq.");

  const model = options.browserSearch
    ? process.env.GROQ_SEARCH_MODEL?.trim() || GROQ_DEFAULT_MODEL
    : process.env.GROQ_TEXT_MODEL?.trim() || GROQ_DEFAULT_MODEL;
  const requestBody = JSON.stringify({
    model,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: options.maxCompletionTokens ?? (options.browserSearch ? 4500 : 6000),
    ...(options.browserSearch
      ? {
          tool_choice: "required",
          tools: [{ type: "browser_search" }],
          reasoning_effort: "low",
        }
      : options.json
      ? { response_format: { type: "json_object" } }
      : {}),
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
      signal: AbortSignal.timeout(options.timeoutMs ?? 55000),
    });
    if (response.ok) return response.json();

    const body = await response.json().catch(() => null);
    const message = body?.error?.message;
    const messageText = typeof message === "string" ? message : `HTTP ${response.status}`;
    const retryMatch = messageText.match(/try again in\s+(\d+(?:\.\d+)?)\s*s/i);
    const headerRetry = Number(response.headers.get("retry-after"));
    const retrySeconds = retryMatch ? Number(retryMatch[1]) : headerRetry;
    if (
      response.status === 429 && attempt === 0 &&
      Number.isFinite(retrySeconds) && retrySeconds > 0 && retrySeconds <= 20
    ) {
      await new Promise((resolve) => setTimeout(resolve, Math.ceil(retrySeconds * 1000) + 300));
      continue;
    }

    throw new Error(`Groq request failed: ${messageText.slice(0, 300)}`);
  }

  throw new Error("Groq request failed after a rate-limit retry. Please try again.");
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
  const response = provider === "groq"
    ? await callGroq(prompt, { json: true, maxCompletionTokens: options.maxTokens })
    : await callGemini(prompt, { json: true, timeoutMs: 55000, maxOutputTokens: options.maxTokens });
  const text = provider === "groq" ? readGroqText(response) : readGeminiText(response);
  return parseJsonObject(text);
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

  let value: unknown;
  try {
    value = JSON.parse(normalized);
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

  const response = provider === "groq"
    ? await callGroq(
        `${prompt}\nReturn sources as a JSON array with the exact page title and full HTTPS URL for each source you used. Keep any browser-search citation markers beside researched claims.`,
        { browserSearch: true, timeoutMs: 60000 }
      )
    : await callGemini(prompt, { googleSearch: true, timeoutMs: 60000 });
  const resultText = provider === "groq" ? readGroqText(response) : readGeminiText(response);
  const parsed = parseJsonObject(resultText);
  const grounding = response.candidates as Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
    };
  }> | undefined;
  const chunks = grounding?.[0]?.groundingMetadata?.groundingChunks || [];
  const sourceCandidates = provider === "groq"
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

export async function reviewBusinessPlanFacts(
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
    businessName: specs.businessName,
    sector: specs.industrySector,
    county: specs.county,
    townOrMarket: specs.townOrMarket,
    product: specs.primaryProduct,
    sellingPriceKES: specs.unitSellingPrice,
    unitCostKES: specs.unitCostOfProduction,
    targetCustomers: specs.targetCustomersDescription,
    statedMarketSize: specs.totalMarketPopulation,
    projectedMarketSharePercentage: specs.projectedMarketSharePercentage,
    competitors: specs.competitors,
    suppliers: specs.rawMaterials.map((item) => item.supplier).filter(Boolean),
    registrationType: specs.registrationType,
  };
  const sourceList = research.sources
    .map((source, index) => `[${index + 1}] ${source.title} — ${source.url}`)
    .join("\n") || "No verified web sources are available.";
  const sectionDrafts = reviewable.map((section) => ({
    key: section.key,
    title: section.title,
    text: scriptedSections.get(section.key),
  }));
  const prompt = `Review the scripted business-plan sections for factual accuracy. Return only minimal corrections as exact text replacements.

CANDIDATE-SUPPLIED DETAILS (treat these as assumptions, not independently verified facts):
${JSON.stringify(candidateEvidence)}

RESEARCH SUMMARY:
${research.summary}
SOURCES:
${sourceList}

SCRIPTED SECTIONS:
${JSON.stringify(sectionDrafts)}

Return JSON only: {"edits":[{"key":"section key","find":"exact existing sentence or phrase","replace":"corrected sentence or phrase"}]}. Use only these sections. Do not rewrite style, add unsupported facts, alter candidate-supplied numbers or financial calculations, or claim surveys, contracts, licenses, approvals, or partnerships exist unless supported by supplied evidence. Cite supported claims with [n]. If no source supports a factual claim, replace only that claim with cautious wording and [Confirm locally]. Return an empty edits array when no correction is justified.`;

  const parsed = await generateJson(prompt, provider, { maxTokens: 1800 });
  const edits = Array.isArray(parsed.edits) ? parsed.edits : [];
  const updated = new Map<string, string>();
  for (const edit of edits) {
    if (!edit || typeof edit !== "object") continue;
    const item = edit as { key?: unknown; find?: unknown; replace?: unknown };
    if (
      typeof item.key !== "string" || !reviewable.some((section) => section.key === item.key) ||
      typeof item.find !== "string" || !item.find.trim() || item.find.length > 3_000 ||
      typeof item.replace !== "string" || !item.replace.trim() || item.replace.length > 5_000
    ) continue;
    const original = updated.get(item.key) ?? scriptedSections.get(item.key);
    if (!original?.includes(item.find)) continue;
    updated.set(item.key, original.replace(item.find, item.replace).slice(0, 30_000));
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
      /\b(KES|according to|survey|permit|licen[cs]e|approval|registered|approved|contract|percentage|market share)\b|\d|%/.test(line)
    );
    return (lines.join(" ") || content).replace(/\s+/g, " ").slice(0, 420);
  };
  const documentContent = reviewable.map((section) => ({
    key: section.key,
    title: section.title,
    requirement: section.guidance,
    evidenceAndStructure: extractEvidence(section.content),
  }));
  const groupCount = new Set(reviewable.map((section) => section.key.match(/^(ch\d+|prelim|app|references)/)?.[1] || "other")).size;
  const sourceList = research.sources
    .map((source, index) => `[${index + 1}] ${source.title} — ${source.url}`)
    .join("\n").slice(0, 1800) || "No independently verified web sources are attached.";
  const candidateFacts = {
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
          findings: [],
          chaptersReviewed: 0,
          warnings: [`Groq and Gemini could not complete the review. ${fallbackMessage.slice(0, 220)}`],
        };
      }
    } else {
      return {
        findings: [],
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

  return { findings, chaptersReviewed: groupCount, warnings };
}
