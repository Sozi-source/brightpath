import PizZip from "pizzip";

export interface BusinessPlanDocxSection {
  title: string;
  content: string;
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

function plainMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/(?<!\*)\*([^*]+)\*/g, "$1");
}

function cell(text: string, width: number, header = false): string {
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${header ? "<w:shd w:fill=\"DCE6F1\"/>" : ""}<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="80" w:line="360" w:lineRule="auto"/></w:pPr>${run(text, header)}</w:p></w:tc>`;
}

function table(rows: string[][]): string {
  const colCount = Math.max(1, ...rows.map((row) => row.length));
  const width = Math.floor(9000 / colCount);
  const borders = `<w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7C9DA"/><w:left w:val="single" w:sz="4" w:color="B7C9DA"/><w:bottom w:val="single" w:sz="4" w:color="B7C9DA"/><w:right w:val="single" w:sz="4" w:color="B7C9DA"/><w:insideH w:val="single" w:sz="4" w:color="B7C9DA"/><w:insideV w:val="single" w:sz="4" w:color="B7C9DA"/></w:tblBorders>`;
  const grid = Array.from({ length: colCount }, () => `<w:gridCol w:w="${width}"/>`).join("");
  const body = rows.map((row, rowIndex) => `<w:tr>${Array.from({ length: colCount }, (_, index) => cell(row[index] || "", width, rowIndex === 0)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
}

function markdownToWord(content: string): string {
  const lines = content.replace(/\r/g, "").split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (/^(---+|\*\*\*+)$/.test(line)) continue;

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
      output.push(paragraph(`•  ${plainMarkdown(bullet[1])}`));
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
  course: string;
  level: string;
  sections: BusinessPlanDocxSection[];
}): Uint8Array {
  const content = [
    paragraph(params.title, "Title"),
    ...(params.candidate ? [paragraph(`Candidate: ${params.candidate}`)] : []),
    ...(params.admissionNumber ? [paragraph(`Admission number: ${params.admissionNumber}`)] : []),
    ...(params.institution ? [paragraph(`Institution: ${params.institution}`)] : []),
    paragraph(`Course: ${params.course} | ${params.level}`),
    `<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr></w:p>`,
    ...params.sections.map((section) => {
      const body = removeDuplicateLeadHeading(section.content, section.title);
      return `${paragraph(section.title, "Heading1")}${markdownToWord(body)}`;
    }),
  ].join("");
  const zip = new PizZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${content}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`);
  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="000000"/></w:rPr></w:style></w:styles>`);
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}
