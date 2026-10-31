import type { BusinessPlanDocxSection } from "./businessPlanDocx";
import { businessPlanLogoSvg, createBusinessPlanBrand } from "./businessPlanBrand";

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
  const numbered = title.match(/^\s*(\d+)\./);
  if (numbered) return `ch${numbered[1]}`;
  if (/executive summary|synopsis/i.test(title)) return "executive";
  if (/dedication/i.test(title)) return "dedication";
  if (/declaration|approval/i.test(title)) return "declaration";
  if (/acknowledg/i.test(title)) return "acknowledgements";
  if (/reference/i.test(title)) return "references";
  if (/appendix/i.test(title)) return "appendices";
  return "other";
}

export function orderBusinessPlanSections(sections: BusinessPlanDocxSection[]): BusinessPlanDocxSection[] {
  const rank: Record<string, number> = {
    dedication: 0, declaration: 1, acknowledgements: 2, abbreviations: 3,
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

    if (line.startsWith("```") ) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i += 1;
      const entries = code.map((value) => value.trim()).filter((value) => value && !/^[│├└─┌┐└┘â”‚â”œâ””â”€\s]+$/.test(value));
      const flow = entries.map((entry) => entry.replace(/[\u2500-\u257F\u00E2\u201D\u20AC\u0090\u02DC\u0153]/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
      out.push(`<div class="diagram">${flow.map((item, index) => `${index ? '<div class="diagram-arrow">&#8595;</div>' : ""}<div class="diagram-node">${inline(item)}</div>`).join("")}</div>`);
      continue;
    }

    if (line.startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i++].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
        if (!row.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(row);
      }
      if (rows.length) out.push(`<table><thead><tr>${rows[0].map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${rows[0].map((_, n) => `<td>${inline(row[n] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
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

function sectionHtml(section: BusinessPlanDocxSection, index: number, firstInGroup = true): string {
  const group = sectionGroup(section.title);
  const chapter = chapterLabel(group);
  const clean = section.content.replace(/^\s*#{1,6}\s+[^\r\n]+\s*(?:\r?\n)?/, "");
  const heading = chapter
    ? `${firstInGroup ? `<div class="chapter-heading"><span>CHAPTER ${chapter}</span><h1>${escapeHtml(chapterNames[group])}</h1></div>` : ""}<h2 class="subsection-heading">${escapeHtml(section.title)}</h2>`
    : `<h1 class="front-heading">${escapeHtml(section.title.replace(/^\d+(?:\.\d+)*\s*/, ""))}</h1>`;
  const breakClass = (["dedication", "declaration", "acknowledgements", "references", "appendices"].includes(group) || (chapter !== null && firstInGroup)) ? "page-start" : "";
  return `<section class="section ${breakClass}" data-section="${index}">${heading}<div class="section-content">${markdown(clean)}</div></section>`;
}

function renderSections(sections: BusinessPlanDocxSection[]): string {
  let previousGroup = "";
  return sections.map((section, index) => {
    const group = sectionGroup(section.title);
    const firstInGroup = group !== previousGroup;
    previousGroup = group;
    return sectionHtml(section, index, firstInGroup);
  }).join("\n");
}

function abbreviations(sections: BusinessPlanDocxSection[]): Array<[string, string]> {
  const found = new Map<string, string>();
  for (const section of sections) {
    const text = section.content.replace(/\*+/g, "");
    for (const match of text.matchAll(/([A-Za-z][A-Za-z &'’,-]{3,80}?)\s+\(([A-Z][A-Z0-9&/-]{1,9})\)/g)) {
      const term = match[2].trim();
      if (!found.has(term)) found.set(term, match[1].trim());
    }
  }
  return [...found.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function createBusinessPlanHtml(params: BusinessPlanDocumentDetails): string {
  const sections = orderBusinessPlanSections(params.sections);
  const chapterSections = sections.filter((section) => /^\s*[1-5]\./.test(section.title));
  const acronymEntries = abbreviations(sections);
  const acronymMarkup = acronymEntries.length
    ? `<table><thead><tr><th>Abbreviation</th><th>Meaning</th></tr></thead><tbody>${acronymEntries.map(([term, meaning]) => `<tr><td>${escapeHtml(term)}</td><td>${escapeHtml(meaning)}</td></tr>`).join("")}</tbody></table>`
    : "<p>No abbreviations or acronyms were identified in the supplied plan.</p>";
  const toc = [
    ...["dedication", "declaration", "acknowledgements"].flatMap((group) => sections.filter((s) => sectionGroup(s.title) === group)),
    { title: "Abbreviations and Acronyms", content: "" },
    ...sections.filter((s) => sectionGroup(s.title) === "executive"),
    ...chapterSections,
    ...sections.filter((s) => ["references", "appendices"].includes(sectionGroup(s.title))),
  ].map((section) => `<li>${escapeHtml(section.title.replace(/^\d+(?:\.\d+)*\s*/, ""))}</li>`).join("");
  const frontGroups = ["dedication", "declaration", "acknowledgements"];
  const front = frontGroups.flatMap((group) => sections.filter((s) => sectionGroup(s.title) === group));
  const executive = sections.filter((s) => sectionGroup(s.title) === "executive");
  const body = sections.filter((s) => ![...frontGroups, "executive"].includes(sectionGroup(s.title)));
  const course = `${params.level} in ${params.course}`.trim();
  const brand = createBusinessPlanBrand({ name: params.businessName || params.title, industry: params.industrySector, product: params.primaryProduct });
  const logo = businessPlanLogoSvg(brand);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(params.title)}</title><style>
@page{size:A4;margin:25.4mm 25.4mm 22mm;@bottom-center{content:counter(page);font:10pt "Times New Roman",serif}}
*{box-sizing:border-box}html{font-family:"Times New Roman",serif;font-size:12pt;color:#111}body{margin:0;line-height:1.5}h1,h2,h3,p,ul,ol{margin-top:0}p{margin-bottom:10pt;text-align:justify}h1,h2,h3{font-size:12pt;line-height:1.5;margin:14pt 0 6pt;font-weight:bold;break-after:avoid}ul,ol{margin:0 0 10pt 25pt;padding:0}li{padding-left:3pt;margin:0 0 3pt}table{width:100%;border-collapse:collapse;margin:10pt 0 14pt;break-inside:auto;font-size:10pt;line-height:1.25}thead{display:table-header-group}tr{break-inside:avoid}th,td{border:1px solid #777;padding:5pt 6pt;vertical-align:top}th{background:#e9eef5;text-align:left}strong{font-weight:bold}code{font-family:"Courier New",monospace;font-size:10pt}.title-page{height:245mm;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:space-around;break-after:page}.title-page h1{font-size:16pt;margin:0 0 8pt}.title-page .title{max-width:150mm;font-size:16pt;font-weight:bold;text-transform:uppercase}.title-page .statement{max-width:145mm;margin:20pt auto;font-weight:bold;text-transform:none}.title-page .details{line-height:1.7}.page-start{break-before:page}.front-heading{text-align:center;text-transform:uppercase;margin:0 0 18pt}.chapter-heading{text-align:center;break-after:avoid;margin:0 0 20pt}.chapter-heading span{display:block;font-weight:bold}.chapter-heading h1{font-size:14pt;margin:0;text-transform:uppercase}.section{break-inside:auto}.section-content{orphans:3;widows:3}.diagram{display:flex;flex-direction:column;align-items:center;margin:16pt auto 20pt;max-width:150mm;break-inside:avoid}.diagram-node{border:1px solid #3b4d65;border-radius:2pt;padding:7pt 12pt;text-align:center;min-width:75mm;max-width:140mm;background:#f4f7fb}.diagram-arrow{font-size:15pt;line-height:1.2}.toc{break-before:page;break-after:page}.toc h1{text-align:center}.toc ul{list-style:none;margin-left:0}.toc li{border-bottom:1px dotted #aaa;padding:4pt 0}.section-content h2:first-child,.section-content h3:first-child{margin-top:0}
</style><style>table{font-size:12pt;line-height:1.5}.title-page .title{font-size:12pt}.chapter-heading h1{font-size:12pt}</style></head><body>
<section class="title-page"><div class="business-logo">${logo}</div>${params.tagline ? `<div class="tagline">${escapeHtml(params.tagline)}</div>` : ""}<div class="title">${escapeHtml(params.title)}</div>${params.candidate ? `<div class="details">Presented by:<br><strong>${escapeHtml(params.candidate)}</strong>${params.admissionNumber ? `<br>Index / Admission Number: ${escapeHtml(params.admissionNumber)}` : ""}</div>` : ""}${params.institution ? `<div class="details">${escapeHtml(params.institution)}</div>` : ""}<div class="statement">Business plan submitted to Kenya National Examinations Council in partial fulfilment for the award of ${escapeHtml(course)}.</div>${params.supervisor ? `<div class="details">Supervisor: ${escapeHtml(params.supervisor)}</div>` : ""}<div class="details">${new Date().toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })}</div></section>
${renderSections(front)}
<section class="section page-start"><h1 class="front-heading">Abbreviations and Acronyms</h1>${acronymMarkup}</section>
<section class="toc"><h1 class="front-heading">Table of Contents</h1><ul>${toc}</ul></section>
${renderSections(executive)}
${renderSections(body)}
</body></html>`;
}
