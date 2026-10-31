import PizZip from "pizzip";
import { createBusinessPlanBrand } from "./businessPlanBrand";

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

function abbreviationRows(sections: BusinessPlanDocxSection[]): Array<[string, string]> {
  const rows = new Map<string, string>();
  for (const section of sections) {
    for (const match of section.content.replace(/\*+/g, "").matchAll(/([A-Za-z][A-Za-z &'’,-]{3,80}?)\s+\(([A-Z][A-Z0-9&/-]{1,9})\)/g)) {
      if (!rows.has(match[2])) rows.set(match[2], match[1].trim());
    }
  }
  return [...rows.entries()].sort((a, b) => a[0].localeCompare(b[0]));
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

function diagram(lines: string[]): string {
  const labels = lines.map((line) => line
    .replace(/[\u2500-\u257F\u00E2\u201D\u20AC\u0090\u02DC\u0153]/g, " ")
    .replace(/\s+/g, " ").trim()).filter((line) => /[A-Za-z0-9]/.test(line));
  if (!labels.length) return "";
  const rows = labels.flatMap((label, index) => [
    ...(index ? [`<w:tr>${cell(String.fromCharCode(8595), 9000)}</w:tr>`] : []),
    `<w:tr>${cell(label, 9000).replace("<w:tcPr>", '<w:tcPr><w:shd w:fill="F1F5F9"/>').replace("<w:pPr>", '<w:pPr><w:jc w:val="center"/>')}</w:tr>`,
  ]).join("");
  const borders = `<w:tblBorders><w:top w:val="single" w:sz="6" w:color="718096"/><w:left w:val="single" w:sz="6" w:color="718096"/><w:bottom w:val="single" w:sz="6" w:color="718096"/><w:right w:val="single" w:sz="6" w:color="718096"/><w:insideH w:val="nil"/></w:tblBorders>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid><w:gridCol w:w="9000"/></w:tblGrid>${rows}</w:tbl>`;
}

function markdownToWord(content: string): string {
  const lines = content.replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n").split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (/^(---+|\*\*\*+)$/.test(line)) continue;

    if (line.startsWith("```")) {
      const diagramLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) diagramLines.push(lines[index++]);
      output.push(diagram(diagramLines));
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
      output.push(paragraph(plainMarkdown(heading[2]), heading[1].length <= 2 ? "Heading1" : "Heading2"));
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      output.push(paragraph(`-  ${plainMarkdown(bullet[1])}`));
      continue;
    }
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      output.push(paragraph(`${line.match(/^\d+/)?.[0]}.  ${plainMarkdown(numbered[1])}`));
      continue;
    }
    output.push(paragraph(plainMarkdown(line)));
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
  const content: string[] = [
    brandMarkParagraph(brand.initials, brand.accent),
    ...(params.tagline ? [centeredParagraph(params.tagline)] : []),
    centeredParagraph(params.title.toUpperCase(), "Title"),
    centeredParagraph("Presented by:"),
    ...(params.candidate ? [centeredParagraph(params.candidate)] : []),
    ...(params.admissionNumber ? [centeredParagraph(`Index / Admission Number: ${params.admissionNumber}`)] : []),
    ...(params.institution ? [centeredParagraph(params.institution)] : []),
    centeredParagraph(`Business plan submitted to Kenya National Examinations Council in partial fulfilment for the award of ${params.level} in ${params.course}.`),
    ...(params.supervisor ? [centeredParagraph(`Supervisor: ${params.supervisor}`)] : []),
    centeredParagraph(new Date().toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })),
    `<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`,
  ];

  let previousGroup = "";
  let hasAbbreviationsPage = false;
  let hasContentsPage = false;
  for (const section of sections) {
    const group = sectionGroup(section.title);
    if (group === "executive" && !hasAbbreviationsPage) {
      const rows = abbreviationRows(sections);
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`, centeredParagraph("Abbreviations and Acronyms", "Heading1"), rows.length ? table([["Abbreviation", "Meaning"], ...rows.map(([abbr, meaning]) => [abbr, meaning])]) : paragraph("No abbreviations or acronyms were identified in the supplied plan."));
      hasAbbreviationsPage = true;
    }
    if (group === "executive" && !hasContentsPage) {
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`, centeredParagraph("Table of Contents", "Title"), `<w:p><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o &quot;1-3&quot; \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>${run("Open this document in Word and update the table of contents.")}<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`);
      hasContentsPage = true;
    }
    if (["dedication", "declaration", "acknowledgements", "references", "appendices"].includes(group) || (group.startsWith("ch") && group !== previousGroup) || (group === "executive" && previousGroup !== "contents")) {
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`);
    }
    if (group.startsWith("ch") && group !== previousGroup) {
      content.push(centeredParagraph(chapterHeading(group) || section.title, "Heading1"));
    }
    const titleStyle = group.startsWith("ch") ? "Heading2" : "Heading1";
    content.push(paragraph(section.title, titleStyle), markdownToWord(removeDuplicateLeadHeading(section.content, section.title)));
    previousGroup = group;
  }
  const zip = new PizZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${content.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1247" w:left="1440"/></w:sectPr></w:body></w:document>`);
  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/><w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style></w:styles>`);
  zip.file("word/settings.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:updateFields w:val="true"/></w:settings>`);
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}
