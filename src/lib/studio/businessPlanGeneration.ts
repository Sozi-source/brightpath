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
  options: { googleSearch?: boolean; json?: boolean; timeoutMs?: number } = {}
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
              maxOutputTokens: options.googleSearch ? 4500 : 7000,
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
  options: { browserSearch?: boolean; json?: boolean; timeoutMs?: number } = {}
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Configure GROQ_API_KEY to use Groq.");

  const model = options.browserSearch
    ? process.env.GROQ_SEARCH_MODEL?.trim() || GROQ_DEFAULT_MODEL
    : process.env.GROQ_TEXT_MODEL?.trim() || GROQ_DEFAULT_MODEL;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: options.browserSearch ? 4500 : 6000,
      ...(options.browserSearch
        ? {
            tool_choice: "required",
            tools: [{ type: "browser_search" }],
            reasoning_effort: "low",
          }
        : options.json
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
    signal: AbortSignal.timeout(options.timeoutMs ?? 55000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message;
    throw new Error(
      `Groq request failed: ${typeof message === "string" ? message.slice(0, 300) : `HTTP ${response.status}`}`
    );
  }
  return response.json();
}

function readGroqText(data: Record<string, unknown>): string {
  const choices = data.choices as Array<{ message?: { content?: unknown } }> | undefined;
  const content = choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

async function generateJson(prompt: string): Promise<Record<string, unknown>> {
  const useGroq = Boolean(process.env.GROQ_API_KEY);
  const response = useGroq
    ? await callGroq(prompt, { json: true })
    : await callGemini(prompt, { json: true, timeoutMs: 55000 });
  const text = useGroq ? readGroqText(response) : readGeminiText(response);
  return parseJsonObject(text);
}

function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI returned an invalid research response. Try again.");
  const value: unknown = JSON.parse(cleaned.slice(start, end + 1));
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
  specs: BusinessPlanSpecs
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

  const useGroq = Boolean(process.env.GROQ_API_KEY);
  const response = useGroq
    ? await callGroq(
        `${prompt}\nReturn sources as a JSON array with the exact page title and full HTTPS URL for each source you used. Keep any browser-search citation markers beside researched claims.`,
        { browserSearch: true, timeoutMs: 60000 }
      )
    : await callGemini(prompt, { googleSearch: true, timeoutMs: 60000 });
  const resultText = useGroq ? readGroqText(response) : readGeminiText(response);
  const parsed = parseJsonObject(resultText);
  const grounding = response.candidates as Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
    };
  }> | undefined;
  const chunks = grounding?.[0]?.groundingMetadata?.groundingChunks || [];
  const sourceCandidates = useGroq
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

  const summary = typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 12_000) : "";
  if (!summary || sources.length === 0) {
    throw new Error("No usable web sources were returned. Try again or add market evidence manually.");
  }

  return { summary, sources, searchedAt: new Date().toISOString() };
}

function safeModelSpecs(specs: BusinessPlanSpecs): Record<string, unknown> {
  const privateFields = new Set([
    "candidateName",
    "admissionNumber",
    "institutionName",
    "supervisorName",
    "email",
    "phone",
    "research",
  ]);
  return Object.fromEntries(
    Object.entries(specs).filter(([key]) => !privateFields.has(key))
  );
}

export async function draftBusinessPlanSections(
  specs: BusinessPlanSpecs,
  definitions: SectionDef[],
  research: BusinessPlanResearch
): Promise<Map<string, string>> {
  const businessSections = definitions.filter(
    (section) => section.phase === "project" && section.key !== "prelim.declaration"
  );
  const fixedNarrative = new Map<string, string>([
    ["prelim.declaration", "### DECLARATION\n\nComplete this section using your institution’s approved declaration. Add your signature and date after reviewing the finished plan."],
    ["prelim.dedication", "### DEDICATION\n\n[Add a personal dedication.]"],
    ["prelim.acknowledgements", "### ACKNOWLEDGEMENTS\n\n[Name people or organizations who contributed to this plan, with their permission.]"],
    ["app.invoices", "### MARKET AND SUPPLIER EVIDENCE\n\nAttach verified supplier quotations, customer interview notes, price checks, and any market survey evidence. Do not report survey findings until the survey has been conducted."],
  ]);
  const generated = new Map<string, string>(fixedNarrative);
  const deterministicFinancialKeys = new Set([
    "ch5.cashflow", "ch5.income", "ch5.balance", "ch5.breakeven", "ch5.ratios",
  ]);
  const aiSections = businessSections.filter(
    (section) =>
      !deterministicFinancialKeys.has(section.key) &&
      section.key !== "references" &&
      !fixedNarrative.has(section.key)
  );
  const groups = new Map<string, SectionDef[]>();
  for (const section of aiSections) {
    const groupKey = section.chapter || section.phase;
    groups.set(groupKey, [...(groups.get(groupKey) || []), section]);
  }

  const sourcesText = research.sources
    .map((source, index) => `[${index + 1}] ${source.title} — ${source.url}`)
    .join("\n");
  const researchContext = `${research.summary}\n\nSources:\n${sourcesText}`;
  const businessContext = JSON.stringify(safeModelSpecs(specs));

  await Promise.all(Array.from(groups.entries()).map(async ([chapter, sections]) => {
    const prompt = `Write the ${chapter} sections of a complete Kenyan TVET business plan using only the supplied business details and research.

BUSINESS DETAILS (user supplied):\n${businessContext}

VERIFIED RESEARCH BRIEF (cite its source numbers inline as [1], [2]):\n${researchContext}

SECTIONS TO WRITE:\n${sections.map((section) => `${section.key} | ${section.title} | ${section.guidance}`).join("\n")}

Return JSON only as {"sections":[{"key":"exact section key","content":"Markdown section content"}]} and include every requested key exactly once. Keep each section useful and specific. Do not invent market sizes, competitors, survey results, quotes, supplier prices, regulatory fees, approvals, or partnerships. Distinguish user assumptions from researched facts. Use [Confirm locally] where evidence is missing. Cite researched claims using the supplied [n] source numbers. Do not claim the business is viable or profitable as a fact; describe projections as estimates. Do not write financial tables or change supplied figures.`;

    const parsed = await generateJson(prompt);
    const rows = Array.isArray(parsed.sections) ? parsed.sections : [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const item = row as { key?: unknown; content?: unknown };
      if (
        typeof item.key === "string" &&
        sections.some((section) => section.key === item.key) &&
        typeof item.content === "string" &&
        item.content.trim()
      ) {
        generated.set(item.key, item.content.trim().slice(0, 30_000));
      }
    }
    const missing = sections.filter((section) => !generated.has(section.key));
    if (missing.length > 0) {
      throw new Error(`AI could not draft ${missing.map((item) => item.title).join(", ")}. Please try again.`);
    }
  }));

  const references = research.sources
    .map((source, index) => `${index + 1}. ${source.title}. Retrieved ${new Date(research.searchedAt).toLocaleDateString("en-KE")}. ${source.url}`)
    .join("\n\n");
  if (definitions.some((section) => section.key === "references")) {
    generated.set("references", `### REFERENCES\n\n${references}`);
  }
  return generated;
}
