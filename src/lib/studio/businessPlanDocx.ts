import PizZip from "pizzip";
import { createBusinessPlanBrand } from "./businessPlanBrand";
import { getVerifiedBusinessPlanAbbreviations } from "./businessPlanGlossary";
import { cleanDiagramLines, parseFlowSteps, parseOrgDiagram } from "./businessPlanDiagrams";

export interface BusinessPlanDocxSection {
  title: string;
  content: string;
}

function sectionGroup(title: string): string {
  const number = title.match(/^\s*(\d+)\./)?.[1];
  if (number) return `ch${number}`;
  if (/executive summary|synopsis/i.test(title)) return "executive";
  if (/dedication/i.test(title)) return "dedication";
  if (/declaration|approval/i.test(title)) return "declaration";
  if (/acknowledg/i.test(title)) return "acknowledgements";
  if (/reference/i.test(title)) return "references";
  if (/appendix/i.test(title)) return "appendices";
  return "other";
}

function orderSections(sections: BusinessPlanDocxSection[]): BusinessPlanDocxSection[] {
  const rank: Record<string, number> = { dedication: 0, declaration: 1, acknowledgements: 2, executive: 4, ch1: 5, ch2: 6, ch3: 7, ch4: 8, ch5: 9, references: 10, appendices: 11, other: 12 };
  return sections.map((section, index) => ({ section, index }))
    .sort((a, b) => (rank[sectionGroup(a.section.title)] ?? 12) - (rank[sectionGroup(b.section.title)] ?? 12) || a.index - b.index)
    .map(({ section }) => section);
}

function chapterHeading(group: string): string | null {
  const labels: Record<string, string> = {
    ch1: "CHAPTER ONE: BUSINESS DESCRIPTION",
    ch2: "CHAPTER TWO: MARKETING PLAN",
    ch3: "CHAPTER THREE: ORGANIZATION AND MANAGEMENT PLAN",
    ch4: "CHAPTER FOUR: OPERATIONAL AND PRODUCTION PLAN",
    ch5: "CHAPTER FIVE: FINANCIAL PLAN",
  };
  return labels[group] || null;
}

function cachedContentsText(sections: BusinessPlanDocxSection[]): string[] {
  const sectionKey = (value: string) => value.replace(/^\s*\d+(?:\.\d+)*\s*/, "").trim().toLowerCase();
  const sectionHeadings = (section: BusinessPlanDocxSection) => {
    const cleanContent = removeDuplicateLeadHeading(section.content, section.title);
    return Array.from(cleanContent.matchAll(/^#{2,6}\s+(.+)$/gm), (match) => plainMarkdown(match[1].trim()))
      .filter((heading) => sectionKey(heading) !== sectionKey(section.title))
      .map((heading) => `    ${heading}`);
  };
  const entries = [
    ...["dedication", "declaration", "acknowledgements"].flatMap((group) => sections.filter((section) => sectionGroup(section.title) === group).flatMap((section) => [section.title, ...sectionHeadings(section)])),
    "Abbreviations and Acronyms",
    "Table of Contents",
    ...sections.filter((section) => sectionGroup(section.title) === "executive").flatMap((section) => [section.title, ...sectionHeadings(section)]),
  ];
  for (const group of ["ch1", "ch2", "ch3", "ch4", "ch5"]) {
    const chapter = sections.filter((section) => sectionGroup(section.title) === group);
    if (!chapter.length) continue;
    entries.push(chapterHeading(group) || chapter[0].title);
    for (const section of chapter) {
      entries.push(`  ${section.title}`);
      entries.push(...sectionHeadings(section));
    }
  }
  entries.push(...sections.filter((section) => ["references", "appendices"].includes(sectionGroup(section.title))).map((section) => section.title));
  return entries;
}

function tableOfContentsField(sections: BusinessPlanDocxSection[]): string {
  const entries = cachedContentsText(sections);
  const lines = entries.map((entry, index) => `${index ? '<w:r><w:br/></w:r>' : ""}${run(entry)}`).join("");
  return `<w:p><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o &quot;1-3&quot; \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>${lines}<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`;
}

function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function run(text: string, bold = false): string {
  return `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="24"/>${bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

function paragraph(text: string, style = "Normal", extra = ""): string {
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${extra}<w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr>${run(text, style !== "Normal")}</w:p>`;
}

function centeredParagraph(text: string, style = "Normal"): string {
  return paragraph(text, style, '<w:jc w:val="center"/>');
}

function sectionBreak(pageFormat?: "lowerRoman" | "decimal", numbered = false): string {
  const pageNumbering = pageFormat ? `<w:pgNumType w:fmt="${pageFormat}" w:start="1"/>` : "";
  const footer = numbered ? '<w:footerReference w:type="default" r:id="rId3"/>' : "";
  return `<w:p><w:pPr><w:sectPr>${footer}<w:type w:val="nextPage"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1247" w:left="1440"/>${pageNumbering}</w:sectPr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
}

function brandMarkParagraph(initials: string, accent: string): string {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="240" w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="${accent}"/><w:shd w:fill="F1F5F9"/><w:sz w:val="40"/></w:rPr><w:t>${xml(initials)}</w:t></w:r></w:p>`;
}

function plainMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/(?<!\*)\*([^*]+)\*/g, "$1");
}

function cell(text: string, width: number, header = false): string {
  const lines = text.split(/<br\s*\/?>/gi);
  const paragraphs = lines.map((line) => `<w:p><w:pPr><w:spacing w:after="80" w:line="360" w:lineRule="auto"/></w:pPr>${run(line, header)}</w:p>`).join("");
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${header ? "<w:shd w:fill=\"DCE6F1\"/>" : ""}<w:vAlign w:val="center"/></w:tcPr>${paragraphs}</w:tc>`;
}

function table(rows: string[][]): string {
  const colCount = Math.max(1, ...rows.map((row) => row.length));
  const width = Math.floor(9000 / colCount);
  const borders = `<w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7C9DA"/><w:left w:val="single" w:sz="4" w:color="B7C9DA"/><w:bottom w:val="single" w:sz="4" w:color="B7C9DA"/><w:right w:val="single" w:sz="4" w:color="B7C9DA"/><w:insideH w:val="single" w:sz="4" w:color="B7C9DA"/><w:insideV w:val="single" w:sz="4" w:color="B7C9DA"/></w:tblBorders>`;
  const grid = Array.from({ length: colCount }, () => `<w:gridCol w:w="${width}"/>`).join("");
  const body = rows.map((row, rowIndex) => `<w:tr>${Array.from({ length: colCount }, (_, index) => cell(row[index] || "", width, rowIndex === 0)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
}

function diagramCell(text: string, width: number, options: { fill?: string; span?: number; bold?: boolean } = {}): string {
  const span = options.span && options.span > 1 ? `<w:gridSpan w:val="${options.span}"/>` : "";
  const fill = options.fill ? `<w:shd w:fill="${options.fill}"/>` : "";
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span}${fill}<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr>${run(text, options.bold)}</w:p></w:tc>`;
}

function diagram(lines: string[], mode = "flow"): string {
  const labels = cleanDiagramLines(lines);
  if (!labels.length) return "";
  const code = lines.join(" ");
  const isOrg = mode === "org" || mode === "channels" || /MANAGING DIRECTOR/i.test(code);
  if (isOrg) {
    const { manager, reports } = mode === "channels"
      ? { manager: labels[0] || "Distribution", reports: labels.slice(1) }
      : parseOrgDiagram(lines);
    const branches = reports.length ? reports : labels.filter((label) => label !== manager);
    const columns = Math.max(1, Math.min(3, branches.length || 1));
    const width = Math.floor(9000 / columns);
    const parent = `<w:tr>${diagramCell(manager, 9000, { span: columns, fill: "E0E7FF", bold: true })}</w:tr>`;
    const arrows = `<w:tr>${Array.from({ length: columns }, () => diagramCell(String.fromCharCode(8595), width)).join("")}</w:tr>`;
    const branchRows: string[] = [];
    for (let index = 0; index < branches.length; index += columns) {
      const row = branches.slice(index, index + columns);
      branchRows.push(`<w:tr>${Array.from({ length: columns }, (_, column) => diagramCell(row[column] || "", width, { fill: row[column] ? "F1F5F9" : undefined })).join("")}</w:tr>`);
    }
    const grid = Array.from({ length: columns }, () => `<w:gridCol w:w="${width}"/>`).join("");
    const borders = `<w:tblBorders><w:top w:val="single" w:sz="6" w:color="718096"/><w:left w:val="single" w:sz="6" w:color="718096"/><w:bottom w:val="single" w:sz="6" w:color="718096"/><w:right w:val="single" w:sz="6" w:color="718096"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>`;
    return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${parent}${arrows}${branchRows.join("")}</w:tbl>`;
  }
  if (mode === "layout") {
    const columns = 2;
    const width = 4500;
    const rows: string[] = [];
    for (let index = 0; index < labels.length; index += columns) {
      const cells = labels.slice(index, index + columns).map((label, offset) => diagramCell(`${index + offset + 1}. ${label}`, width, { fill: "F1F5F9" }));
      if (cells.length < columns) cells.push(diagramCell("", width));
      rows.push(`<w:tr>${cells.join("")}</w:tr>`);
    }
    const borders = `<w:tblBorders><w:top w:val="single" w:sz="6" w:color="718096"/><w:left w:val="single" w:sz="6" w:color="718096"/><w:bottom w:val="single" w:sz="6" w:color="718096"/><w:right w:val="single" w:sz="6" w:color="718096"/><w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/></w:tblBorders>`;
    return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid><w:gridCol w:w="4500"/><w:gridCol w:w="4500"/></w:tblGrid>${rows.join("")}</w:tbl>`;
  }
  const flowSteps = parseFlowSteps(lines);
  const rows = flowSteps.flatMap((label, index) => [
    ...(index ? [`<w:tr>${diagramCell(String.fromCharCode(8595), 9000)}</w:tr>`] : []),
    `<w:tr>${diagramCell(label, 9000, { fill: "F1F5F9" })}</w:tr>`,
  ]).join("");
  const borders = `<w:tblBorders><w:top w:val="single" w:sz="6" w:color="718096"/><w:left w:val="single" w:sz="6" w:color="718096"/><w:bottom w:val="single" w:sz="6" w:color="718096"/><w:right w:val="single" w:sz="6" w:color="718096"/><w:insideH w:val="nil"/></w:tblBorders>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid><w:gridCol w:w="9000"/></w:tblGrid>${rows}</w:tbl>`;
}

function markdownToWord(content: string): string {
  const lines = content.replace(/\r/g, "").split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (/^(---+|\*\*\*+)$/.test(line)) continue;

    if (line.startsWith("```")) {
      const diagramType = line.slice(3).trim().toLowerCase();
      const diagramLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) diagramLines.push(lines[index++]);
      output.push(diagram(diagramLines, diagramType));
      continue;
    }

    if (line.startsWith("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = lines[index].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((part) => plainMarkdown(part.trim()));
        if (!row.every((part) => /^:?-{3,}:?$/.test(part))) rows.push(row);
        index += 1;
      }
      index -= 1;
      if (rows.length) output.push(table(rows));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      output.push(paragraph(plainMarkdown(heading[2].replace(/<br\s*\/?>/gi, " ")), heading[1].length <= 2 ? "Heading1" : "Heading2"));
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      for (const part of bullet[1].split(/<br\s*\/?>/gi)) {
        if (part.trim()) output.push(paragraph(`-  ${plainMarkdown(part.trim())}`));
      }
      continue;
    }
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      output.push(paragraph(`${line.match(/^\d+/)?.[0]}.  ${plainMarkdown(numbered[1].replace(/<br\s*\/?>/gi, " "))}`));
      continue;
    }
    for (const part of line.split(/<br\s*\/?>/gi)) {
      if (part.trim()) output.push(paragraph(plainMarkdown(part.trim())));
    }
  }
  return output.join("");
}

function removeDuplicateLeadHeading(content: string, sectionTitle: string): string {
  const match = content.match(/^\s*#{1,6}\s+([^\r\n]+)(?:\r?\n)?/);
  if (!match) return content;
  const normalize = (value: string) => plainMarkdown(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const headingNumber = match[1].match(/^\s*(\d+(?:\.\d+)+)\b/)?.[1];
  const titleNumber = sectionTitle.match(/^\s*(\d+(?:\.\d+)+)\b/)?.[1];
  if (normalize(match[1]) === normalize(sectionTitle) || (headingNumber && headingNumber === titleNumber)) {
    return content.slice(match[0].length);
  }
  return content;
}

export function createBusinessPlanDocx(params: {
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
}): Uint8Array {
  const sections = orderSections(params.sections);
  const brand = createBusinessPlanBrand({ name: params.businessName || params.title, industry: params.industrySector, product: params.primaryProduct });
  const awardCourse = /^(?:certificate|diploma|craft|higher\s+diploma)\b/i.test(params.course.trim())
    ? params.course.trim()
    : `${params.level} in ${params.course}`.trim();
  const content: string[] = [
    brandMarkParagraph(brand.initials, brand.accent),
    ...(params.tagline ? [centeredParagraph(params.tagline)] : []),
    centeredParagraph(params.title.toUpperCase(), "Title"),
    centeredParagraph("Presented by:"),
    ...(params.candidate ? [centeredParagraph(params.candidate)] : []),
    ...(params.admissionNumber ? [centeredParagraph(`Index / Admission Number: ${params.admissionNumber}`)] : []),
    ...(params.institution ? [centeredParagraph(params.institution)] : []),
    centeredParagraph(`Business plan submitted to Kenya National Examinations Council in partial fulfilment for the award of ${awardCourse}.`),
    ...(params.supervisor ? [centeredParagraph(`Supervisor: ${params.supervisor}`)] : []),
    centeredParagraph(new Date().toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })),
    sectionBreak(),
  ];

  let previousGroup = "";
  let hasAbbreviationsPage = false;
  let hasContentsPage = false;
  let hasMainSection = false;
  let hasStartedPreliminaryContent = false;
  for (const section of sections) {
    const group = sectionGroup(section.title);
    if (group === "executive" && !hasAbbreviationsPage) {
      const rows = getVerifiedBusinessPlanAbbreviations(sections);
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`, centeredParagraph("Abbreviations and Acronyms", "Heading1"), rows.length ? table([["Abbreviation", "Meaning"], ...rows.map(([abbr, meaning]) => [abbr, meaning])]) : paragraph("No abbreviations or acronyms were identified in the supplied plan."));
      hasAbbreviationsPage = true;
    }
    if (group === "executive" && !hasContentsPage) {
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`, centeredParagraph("Table of Contents", "Title"), tableOfContentsField(sections));
      hasContentsPage = true;
    }
    if (group === "ch1" && !hasMainSection) {
      content.push(sectionBreak("lowerRoman", true));
      hasMainSection = true;
    } else if ((["dedication", "declaration", "acknowledgements"].includes(group) && hasStartedPreliminaryContent) || ["references", "appendices"].includes(group) || (group.startsWith("ch") && group !== previousGroup) || (group === "executive" && previousGroup !== "contents")) {
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`);
    }
    if (group.startsWith("ch") && group !== previousGroup) {
      content.push(centeredParagraph(chapterHeading(group) || section.title, "Heading1"));
    }
    const titleStyle = group.startsWith("ch") ? "Heading2" : "Heading1";
    content.push(paragraph(section.title, titleStyle), markdownToWord(removeDuplicateLeadHeading(section.content, section.title)));
    if (["dedication", "declaration", "acknowledgements"].includes(group)) hasStartedPreliminaryContent = true;
    previousGroup = group;
  }
  const zip = new PizZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${content.join("")}<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1247" w:left="1440"/><w:pgNumType w:fmt="decimal" w:start="1"/></w:sectPr></w:body></w:document>`);
  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/><w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style></w:styles>`);
  zip.file("word/settings.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:updateFields w:val="true"/></w:settings>`);
  zip.file("word/footer1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`);
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}
