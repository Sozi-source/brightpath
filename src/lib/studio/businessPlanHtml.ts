import { computeBusinessPlanTocEntries, type BusinessPlanDocxSection } from "./businessPlanDocx";
import { businessPlanLogoSvg, createBusinessPlanBrand } from "./businessPlanBrand";
import { getVerifiedBusinessPlanAbbreviations } from "./businessPlanGlossary";
import { cleanDiagramLines, parseFlowSteps, parseOrgDiagram } from "./businessPlanDiagrams";
import { BUSINESS_PLAN_SECTIONS } from "./templates/business";

export interface BusinessPlanDocumentDetails {
  title: string;
  candidate?: string;
  admissionNumber?: string | null;
  institution?: string | null;
  supervisor?: string | null;
  businessName?: string | null;
  tagline?: string | null;
  industrySector?: string | null;
  primaryProduct?: string | null;
  course: string;
  level: string;
  sections: BusinessPlanDocxSection[];
}

const chapterNames: Record<string, string> = {
  ch1: "Business Description",
  ch2: "Marketing Plan",
  ch3: "Organization and Management Plan",
  ch4: "Operational and Production Plan",
  ch5: "Financial Plan",
};

const SECTION_BY_KEY = new Map(BUSINESS_PLAN_SECTIONS.map((s) => [s.key, s]));

export function normalizeBusinessPlanSections(sections: BusinessPlanDocxSection[]): BusinessPlanDocxSection[] {
  return sections.map((section) => {
    const rawTitle = section.title.trim();
    const fromKey = SECTION_BY_KEY.get(rawTitle);
    if (fromKey) {
      return { ...section, title: fromKey.title };
    }
    return section;
  });
}

const escapeHtml = (value: string) => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function inline(text: string): string {
  return text.split(/<br\s*\/?>/gi).map((line) => escapeHtml(line)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")).join("<br>");
}

function sectionGroup(title: string): string {
  const normalized = title.trim();
  const def = SECTION_BY_KEY.get(normalized);
  const effectiveTitle = def ? def.title : normalized;
  const key = def ? def.key : normalized;

  if (/^(?:ch1\b|1\.)/i.test(key) || /^\s*1\./.test(effectiveTitle)) return "ch1";
  if (/^(?:ch2\b|2\.)/i.test(key) || /^\s*2\./.test(effectiveTitle)) return "ch2";
  if (/^(?:ch3\b|3\.)/i.test(key) || /^\s*3\./.test(effectiveTitle)) return "ch3";
  if (/^(?:ch4\b|4\.)/i.test(key) || /^\s*4\./.test(effectiveTitle)) return "ch4";
  if (/^(?:ch5\b|5\.)/i.test(key) || /^\s*5\./.test(effectiveTitle)) return "ch5";
  if (/executive|synopsis/i.test(key) || /executive|synopsis/i.test(effectiveTitle)) return "executive";
  if (/dedication/i.test(key) || /dedication/i.test(effectiveTitle)) return "dedication";
  if (/declaration|approval/i.test(key) || /declaration|approval/i.test(effectiveTitle)) return "declaration";
  if (/acknowledg/i.test(key) || /acknowledg/i.test(effectiveTitle)) return "acknowledgements";
  if (/reference/i.test(key) || /reference/i.test(effectiveTitle)) return "references";
  if (/appendix|app\./i.test(key) || /appendix/i.test(effectiveTitle)) return "appendices";

  const numbered = effectiveTitle.match(/^\s*(\d+)\./);
  if (numbered) return `ch${numbered[1]}`;
  return "other";
}

export function orderBusinessPlanSections(rawSections: BusinessPlanDocxSection[]): BusinessPlanDocxSection[] {
  const sections = normalizeBusinessPlanSections(rawSections);
  const rank: Record<string, number> = {
    declaration: 0, dedication: 1, acknowledgements: 2, abbreviations: 3,
    contents: 4, executive: 5, ch1: 6, ch2: 7, ch3: 8, ch4: 9, ch5: 10,
    references: 11, appendices: 12, other: 13,
  };
  return sections.map((section, index) => ({ section, index }))
    .sort((a, b) => (rank[sectionGroup(a.section.title)] ?? 13) - (rank[sectionGroup(b.section.title)] ?? 13) || a.index - b.index)
    .map(({ section }) => section);
}

function markdown(content: string): string {
  const lines = content.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^(---+|\*\*\*+)$/.test(line)) { i += 1; continue; }

    if (line.startsWith("```")) {
      const diagramType = line.slice(3).trim().toLowerCase();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i += 1;
      const entries = cleanDiagramLines(code);
      if (diagramType === "org" || diagramType === "channels" || /MANAGING DIRECTOR/i.test(code.join(" "))) {
        const { manager, reports } = diagramType === "channels"
          ? { manager: entries[0] || "Distribution", reports: entries.slice(1) }
          : parseOrgDiagram(code);
        const branches = reports.length ? reports : entries.filter((item) => item !== manager);
        const rootBadge = diagramType === "channels" ? "DISTRIBUTION ORIGIN" : "EXECUTIVE LEADERSHIP";
        const branchMarkup = branches.map((item) => {
          const cleanItem = item.replace(/^[-*>]+\s*/, "");
          const parts = cleanItem.split(/\s*(?:—|--|:)\s*/);
          const nodeHtml = parts.length > 1
            ? `<div class="org-dept">${inline(parts[0])}</div><div class="org-role">${inline(parts.slice(1).join(" — "))}</div>`
            : `<div class="org-role"><strong>${inline(cleanItem)}</strong></div>`;
          return `<div class="org-branch"><span class="org-arrow">&#9660;</span><div class="diagram-node">${nodeHtml}</div></div>`;
        }).join("");
        out.push(`<div class="org-chart"><div class="org-root"><div class="org-badge">${rootBadge}</div><div>${inline(manager)}</div></div><div class="org-connector" aria-hidden="true"></div><div class="org-crossbar" aria-hidden="true"></div><div class="org-branches">${branchMarkup}</div></div>`);
      } else if (diagramType === "layout") {
        out.push(`<div class="layout-grid">${entries.map((item, index) => `<div class="layout-room"><span class="layout-number">${index + 1}</span><strong>${inline(item.replace(/^[-*>]+\s*/, ""))}</strong></div>`).join("")}</div>`);
      } else {
        const flowSteps = parseFlowSteps(code);
        out.push(`<div class="diagram">${flowSteps.map((item, index) => `${index ? '<div class="diagram-arrow" aria-hidden="true">&#8595;</div>' : ""}<div class="diagram-node">${inline(item.replace(/^\[[0-9.\s]*|\]$/g, ""))}</div>`).join("")}</div>`);
      }
      continue;
    }

    if (line.startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i++].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
        if (!row.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(row);
      }
      if (rows.length) {
        const denseClass = rows[0].length >= 6 ? ' class="table-dense"' : '';
        out.push(`<table${denseClass}><thead><tr>${rows[0].map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${rows[0].map((_, n) => `<td>${inline(row[n] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      }
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      out.push(`<h${heading[1].length >= 3 ? 3 : 2}>${inline(heading[2])}</h${heading[1].length >= 3 ? 3 : 2}>`);
      i += 1;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].trim().replace(/^[-*+]\s+/, ""))}</li>`);
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].trim().replace(/^\d+[.)]\s+/, ""))}</li>`);
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*+]\s|\d+[.)]\s|\||```|---+$)/.test(lines[i].trim())) paragraphLines.push(lines[i++].trim());
    out.push(`<p>${paragraphLines.map(inline).join(" ")}</p>`);
  }
  return out.join("\n");
}

function chapterLabel(group: string): string | null {
  const names: Record<string, string> = { ch1: "ONE", ch2: "TWO", ch3: "THREE", ch4: "FOUR", ch5: "FIVE" };
  return names[group] || null;
}

function sectionHtml(section: BusinessPlanDocxSection, index: number, firstInGroup = true, pageClass = "main-page"): string {
  const group = sectionGroup(section.title);
  const chapter = chapterLabel(group);
  const clean = section.content.replace(/^\s*#{1,6}\s+[^\r\n]+\s*(?:\r?\n)?/, "");
  const heading = chapter
    ? `${firstInGroup ? `<div class="chapter-heading"><span>CHAPTER ${chapter}</span><h1>${escapeHtml(chapterNames[group])}</h1></div>` : ""}<h2 class="subsection-heading">${escapeHtml(section.title)}</h2>`
    : `<h1 class="front-heading">${escapeHtml(section.title.replace(/^\d+(?:\.\d+)*\s*/, ""))}</h1>`;
  const isAppendix = group === "appendices" || /^appendix/i.test(section.title);
  const breakClass = (
    ["dedication", "declaration", "acknowledgements", "executive", "references"].includes(group) ||
    isAppendix ||
    (chapter !== null && firstInGroup)
  ) ? "page-start" : "";
  return `<section class="section ${pageClass} ${breakClass}" data-section="${index}">${heading}<div class="section-content">${markdown(clean)}</div></section>`;
}

function renderSections(sections: BusinessPlanDocxSection[], pageClass = "main-page"): string {
  let previousGroup = "";
  return sections.map((section, index) => {
    const group = sectionGroup(section.title);
    const firstInGroup = group !== previousGroup;
    previousGroup = group;
    return sectionHtml(section, index, firstInGroup, pageClass);
  }).join("\n");
}

export function createBusinessPlanHtml(params: BusinessPlanDocumentDetails): string {
  const sections = orderBusinessPlanSections(params.sections);
  const acronymEntries = getVerifiedBusinessPlanAbbreviations(sections);
  const acronymMarkup = acronymEntries.length
    ? `<table><thead><tr><th>Abbreviation</th><th>Meaning</th></tr></thead><tbody>${acronymEntries.map(([term, meaning]) => `<tr><td>${escapeHtml(term)}</td><td>${escapeHtml(meaning)}</td></tr>`).join("")}</tbody></table>`
    : "<p>No abbreviations or acronyms were identified in the supplied plan.</p>";
  const tocEntries = computeBusinessPlanTocEntries(sections);
  const toc = tocEntries
    .map(
      (entry) =>
        `<li class="toc-level-${entry.level}"><span class="toc-title">${escapeHtml(entry.title)}</span><span class="toc-dots" aria-hidden="true"></span><span class="toc-page">${escapeHtml(entry.pageLabel)}</span></li>`
    )
    .join("");
  const frontGroups = ["declaration", "dedication", "acknowledgements"];
  const front = frontGroups.flatMap((group) => sections.filter((s) => sectionGroup(s.title) === group));
  const executive = sections.filter((s) => sectionGroup(s.title) === "executive");
  const body = sections.filter((s) => ![...frontGroups, "executive"].includes(sectionGroup(s.title)));
  const rawCourse = (params.course || "Human Nutrition and Dietetics").trim();
  const rawLevel = (params.level || "Diploma").trim();
  const course = /^(?:certificate|diploma|craft|higher\s+diploma)\b/i.test(rawCourse)
    ? rawCourse
    : `${rawLevel} in ${rawCourse}`.trim();
  const brand = createBusinessPlanBrand({ name: params.businessName || params.title, industry: params.industrySector, product: params.primaryProduct });
  const logo = businessPlanLogoSvg(brand);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(params.title)}</title><style>
@page { size: A4; margin: 25.4mm 25.4mm 22mm 25.4mm; }
* { box-sizing: border-box; }
html { font-family: "Times New Roman", serif; font-size: 12pt; color: #111; }
body { margin: 0; line-height: 1.5; }
h1, h2, h3, p, ul, ol { margin-top: 0; }
p { margin-bottom: 10pt; text-align: justify; }
h1, h2, h3 { font-size: 12pt; line-height: 1.5; margin: 14pt 0 6pt; font-weight: bold; break-after: avoid; }
ul, ol { margin: 0 0 10pt 25pt; padding: 0; }
li { padding-left: 3pt; margin: 0 0 3pt; }
table { width: 100%; border-collapse: collapse; margin: 12pt 0 16pt; font-size: 9.5pt; line-height: 1.35; break-inside: auto; page-break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th, td { border: 1px solid #94a3b8; padding: 4.5pt 6pt; vertical-align: top; word-break: normal; }
th { background: #f1f5f9; text-align: left; font-weight: bold; color: #0f172a; }
tbody tr:nth-child(even) { background: #f8fafc; }
table.table-dense { font-size: 8pt; line-height: 1.2; }
table.table-dense th, table.table-dense td { padding: 3pt 3.5pt; white-space: nowrap; }
table.table-dense th:first-child, table.table-dense td:first-child { white-space: normal; min-width: 80pt; }
strong { font-weight: bold; }
code { font-family: "Courier New", monospace; font-size: 10pt; }
.title-page { box-sizing: border-box; text-align: center; padding: 22mm 0 12mm; page-break-after: always; break-after: page; }
.title-page .business-logo { margin: 0 auto 16pt; }
.title-page .tagline { font-style: italic; font-size: 11pt; color: #334155; margin-bottom: 24pt; }
.title-page .title { max-width: 155mm; margin: 0 auto 26pt; font-size: 15pt; font-weight: bold; text-transform: uppercase; line-height: 1.4; color: #0f172a; }
.title-page .statement { max-width: 145mm; margin: 24pt auto; font-size: 11.5pt; font-weight: bold; line-height: 1.5; color: #1e293b; }
.title-page .details { font-size: 11.5pt; line-height: 1.6; margin: 16pt auto; }
.page-start { page-break-before: always; break-before: page; }
.page-break { page-break-after: always; break-after: page; }
.front-heading { text-align: center; text-transform: uppercase; margin: 0 0 18pt; font-size: 13pt; }
.chapter-heading { text-align: center; break-after: avoid; margin: 0 0 20pt; }
.chapter-heading span { display: block; font-weight: bold; font-size: 12pt; }
.chapter-heading h1 { font-size: 13.5pt; margin: 0; text-transform: uppercase; }
.subsection-heading { font-size: 12pt; font-weight: bold; margin: 14pt 0 6pt; }
.section { break-inside: auto; }
.section-content { orphans: 3; widows: 3; }
.diagram { display: flex; flex-direction: column; align-items: center; margin: 16pt auto 20pt; max-width: 150mm; break-inside: avoid; }
.diagram-node { border: 1px solid #3b4d65; border-radius: 2pt; padding: 7pt 12pt; text-align: center; min-width: 75mm; max-width: 140mm; background: #f4f7fb; }
.diagram-arrow { font-size: 15pt; line-height: 1.2; }
.toc { break-before: page; page-break-before: always; }
.toc h1 { text-align: center; }
.toc ul { list-style: none; margin-left: 0; padding-left: 0; }
.toc li { display: flex; align-items: baseline; gap: 6pt; padding: 2.5pt 0; }
.toc-title { flex: 0 1 auto; }
.toc-dots { flex: 1 1 auto; border-bottom: 1px dotted #94a3b8; min-width: 18pt; transform: translateY(-2pt); }
.toc-page { flex: 0 0 auto; font-weight: bold; min-width: 18pt; text-align: right; }
.toc .toc-level-0 .toc-title { font-weight: bold; color: #0f172a; }
.toc .toc-level-1 { padding-left: 14pt; }
.toc .toc-level-1 .toc-title { font-weight: bold; color: #1e3a8a; }
.toc .toc-level-2 { padding-left: 28pt; font-size: 10.5pt; color: #334155; }
.org-chart { max-width: 165mm; margin: 16pt auto 22pt; text-align: center; break-inside: avoid; }
.org-root { display: inline-block; min-width: 75mm; max-width: 115mm; padding: 8pt 14pt; border: 1.5pt solid #1e3a8a; border-top: 3.5pt solid #1e40af; background: #eef2ff; font-weight: bold; color: #0f172a; }
.org-badge { font-size: 8.5pt; letter-spacing: 0.06em; color: #1e40af; margin-bottom: 2pt; text-transform: uppercase; }
.org-connector { height: 12pt; width: 1.5pt; background: #334155; margin: 0 auto; }
.org-crossbar { height: 1.5pt; width: 72%; background: #334155; margin: 0 auto; }
.org-branches { display: grid; grid-template-columns: repeat(auto-fit, minmax(48mm, 1fr)); gap: 10pt; }
.org-branch { display: flex; flex-direction: column; align-items: center; }
.org-arrow { font-size: 11pt; line-height: 1.1; color: #334155; margin-bottom: 2pt; }
.org-branch .diagram-node { width: 100%; min-width: 0; border: 1pt solid #475569; border-top: 2.5pt solid #2563eb; background: #f8fafc; padding: 7pt 9pt; }
.org-dept { font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-bottom: 2pt; }
.org-role { font-size: 10.5pt; color: #0f172a; }
.layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; margin: 14pt 0; break-inside: avoid; }
.layout-room { position: relative; min-height: 34mm; padding: 10pt 8pt 8pt 28pt; border: 1pt solid #64748b; background: #f8fafc; display: flex; align-items: center; }
.layout-number { position: absolute; left: 8pt; top: 8pt; width: 16pt; height: 16pt; border-radius: 50%; background: #e0e7ff; color: #3730a3; text-align: center; font-weight: bold; }
</style></head><body>
<section class="title-page">
  <div class="business-logo">${logo}</div>
  ${params.tagline ? `<div class="tagline">${escapeHtml(params.tagline)}</div>` : ""}
  <div class="title">${escapeHtml(params.title)}</div>
  ${params.candidate ? `<div class="details">Presented by:<br><strong>${escapeHtml(params.candidate)}</strong>${params.admissionNumber ? `<br>Index / Admission Number: ${escapeHtml(params.admissionNumber)}` : ""}</div>` : ""}
  ${params.institution ? `<div class="details">${escapeHtml(params.institution)}</div>` : ""}
  <div class="statement">Business plan submitted to Kenya National Examinations Council in partial fulfilment for the award of ${escapeHtml(course)}.</div>
  ${params.supervisor ? `<div class="details">Supervisor: ${escapeHtml(params.supervisor)}</div>` : ""}
  <div class="details">${new Date().toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })}</div>
</section>
<div class="page-break" style="page-break-after: always; break-after: page;"></div>
${renderSections(front, "prelim-page")}
<section class="toc prelim-page page-start"><h1 class="front-heading">Table of Contents</h1><ul>${toc}</ul></section>
<section class="section prelim-page page-start"><h1 class="front-heading">Abbreviations and Acronyms</h1>${acronymMarkup}</section>
${renderSections(executive, "prelim-page")}
${renderSections(body, "main-page")}
</body></html>`;
}
