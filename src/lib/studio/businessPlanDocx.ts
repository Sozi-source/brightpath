import PizZip from "pizzip";
import fs from "node:fs";
import path from "node:path";
import { createBusinessPlanBrand } from "./businessPlanBrand";
import { getVerifiedBusinessPlanAbbreviations } from "./businessPlanGlossary";
import { cleanDiagramLines, parseFlowSteps, parseOrgDiagram } from "./businessPlanDiagrams";

export interface BusinessPlanDocxSection {
  title: string;
  content: string;
}

export interface TocComputedEntry {
  title: string;
  level: 0 | 1 | 2;
  bookmarkName: string;
  pageLabel: string;
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
  const rank: Record<string, number> = {
    dedication: 0,
    declaration: 1,
    acknowledgements: 2,
    executive: 4,
    ch1: 5,
    ch2: 6,
    ch3: 7,
    ch4: 8,
    ch5: 9,
    references: 10,
    appendices: 11,
    other: 12,
  };
  return sections
    .map((section, index) => ({ section, index }))
    .sort(
      (a, b) =>
        (rank[sectionGroup(a.section.title)] ?? 12) -
          (rank[sectionGroup(b.section.title)] ?? 12) || a.index - b.index
    )
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

export function toRomanLower(num: number): string {
  const pairs: Array<[number, string]> = [
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let n = Math.max(1, Math.floor(num));
  let out = "";
  for (const [val, sym] of pairs) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
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

function stripMarkdownMarkers(text: string): string {
  return text
    .replace(/<\/?(?:strong|b|em|i|code)>/gi, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

interface RunStyleOptions {
  bold?: boolean;
  italic?: boolean;
  sizeHalfPt?: number;
  color?: string;
  font?: string;
  shadingFill?: string;
}

function run(text: string, opts: RunStyleOptions | boolean = false): string {
  const o: RunStyleOptions = typeof opts === "boolean" ? { bold: opts } : opts;
  const font = o.font || "Times New Roman";
  const sz = o.sizeHalfPt || 24;
  const color = o.color ? `<w:color w:val="${o.color}"/>` : "";
  const shd = o.shadingFill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.shadingFill}"/>` : "";
  return `<w:r><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>${o.bold ? "<w:b/><w:bCs/>" : ""}${o.italic ? "<w:i/><w:iCs/>" : ""}${color}${shd}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

/**
 * Parses inline Markdown (**bold**, *italic*, `code`) and HTML (<strong>, <em>)
 * into styled WordprocessingML <w:r> runs, preserving all label emphasis.
 */
function inlineRuns(
  rawText: string,
  baseOpts: RunStyleOptions = {},
  autoBoldLeadLabel = false
): string {
  let normalized = rawText
    .replace(/<\/?(?:strong|b)>/gi, "**")
    .replace(/<\/?(?:em|i)>/gi, "*");

  if (autoBoldLeadLabel && !normalized.startsWith("**")) {
    const labelMatch = normalized.match(/^([A-Za-z0-9][A-Za-z0-9\s/&(),.\-–]{1,42}):\s+(.+)$/);
    if (labelMatch) {
      normalized = `**${labelMatch[1]}:** ${labelMatch[2]}`;
    }
  }

  const tokenRegex = /(\*\*[^*]+\*\*|(?<!\*)\*[^*\n]+\*|`[^`\n]+`)/g;
  const parts = normalized.split(tokenRegex).filter((p) => p.length > 0);
  if (parts.length === 0) return run("", baseOpts);

  return parts
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return run(part.slice(2, -2), { ...baseOpts, bold: true });
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return run(part.slice(1, -1), { ...baseOpts, italic: true });
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return run(part.slice(1, -1), { ...baseOpts, font: "Courier New" });
      }
      return run(part.replace(/\*\*/g, ""), baseOpts);
    })
    .join("");
}

function wrapBookmark(innerRunsXml: string, bookmarkId?: number, bookmarkName?: string): string {
  if (!bookmarkId || !bookmarkName) return innerRunsXml;
  return `<w:bookmarkStart w:id="${bookmarkId}" w:name="${bookmarkName}"/>${innerRunsXml}<w:bookmarkEnd w:id="${bookmarkId}"/>`;
}

function paragraph(
  text: string,
  style = "Normal",
  extraPPr = "",
  baseOpts: RunStyleOptions = {},
  bookmarkId?: number,
  bookmarkName?: string
): string {
  const isHeading = style !== "Normal";
  const align = isHeading ? "" : '<w:jc w:val="both"/>';
  const spacing =
    style === "Heading1"
      ? '<w:spacing w:before="280" w:after="140" w:line="360" w:lineRule="auto"/>'
      : style === "Heading2"
        ? '<w:spacing w:before="220" w:after="100" w:line="360" w:lineRule="auto"/>'
        : style === "Heading3"
          ? '<w:spacing w:before="160" w:after="80" w:line="360" w:lineRule="auto"/>'
          : '<w:spacing w:after="120" w:line="360" w:lineRule="auto"/>';
  const inner = inlineRuns(text, { ...baseOpts, bold: baseOpts.bold ?? isHeading });
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${align}${spacing}${extraPPr}</w:pPr>${wrapBookmark(
    inner,
    bookmarkId,
    bookmarkName
  )}</w:p>`;
}

function centeredParagraph(
  text: string,
  style = "Normal",
  opts: RunStyleOptions = {},
  spacingXml = '<w:spacing w:after="120" w:line="360" w:lineRule="auto"/>',
  bookmarkId?: number,
  bookmarkName?: string
): string {
  const inner = inlineRuns(text, { ...opts, bold: opts.bold ?? style !== "Normal" });
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/><w:jc w:val="center"/>${spacingXml}</w:pPr>${wrapBookmark(
    inner,
    bookmarkId,
    bookmarkName
  )}</w:p>`;
}

function listItemParagraph(text: string, numId: number): string {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="${numId}"/></w:numPr><w:jc w:val="both"/><w:spacing w:before="40" w:after="80" w:line="340" w:lineRule="auto"/></w:pPr>${inlineRuns(
    text,
    {},
    true
  )}</w:p>`;
}

function sectionBreak(pageFormat?: "lowerRoman" | "decimal", numbered = false): string {
  const pageNumbering = pageFormat
    ? `<w:pgNumType w:fmt="${pageFormat}" w:start="1"/>`
    : "";
  const footer = numbered ? '<w:footerReference w:type="default" r:id="rId3"/>' : "";
  return `<w:p><w:pPr><w:sectPr>${footer}<w:type w:val="nextPage"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1270" w:bottom="1247" w:left="1270"/>${pageNumbering}</w:sectPr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
}

function coverAccentStripe(): string {
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="5616"/><w:gridCol w:w="3744"/></w:tblGrid><w:tr><w:trPr><w:trHeight w:val="120" w:hRule="exact"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="5616" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E40AF"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="3744" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="D97706"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p></w:tc></w:tr></w:tbl>`;
}

function brandMarkCard(initials: string, accent: string, sector?: string | null): string {
  const borderColor = accent.replace(/^#/, "") || "1E40AF";
  return `<w:tbl><w:tblPr><w:tblW w:w="3200" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="18" w:color="${borderColor}"/><w:left w:val="single" w:sz="6" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="6" w:color="CBD5E1"/><w:right w:val="single" w:sz="6" w:color="CBD5E1"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3200"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/><w:tcMar><w:top w:w="180" w:type="dxa"/><w:bottom w:w="180" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40" w:line="360" w:lineRule="auto"/></w:pPr>${run(
    initials,
    { bold: true, sizeHalfPt: 44, color: borderColor }
  )}</w:p>${
    sector
      ? `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>${run(
          sector.toUpperCase(),
          { bold: true, sizeHalfPt: 17, color: "475569" }
        )}</w:p>`
      : ""
  }</w:tc></w:tr></w:tbl>`;
}

function logoImageParagraph(rId: string, cx = 1600200, cy = 900000): string {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="160"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="1" name="ICMHS official logo"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="icmhs-logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

/**
 * Renders the Table of Contents with dot-leader tab stops (........), clickable internal
 * bookmark links, live PAGEREF fields, and pre-computed Roman/Arabic page numbers.
 */
function renderTableOfContentsField(entries: TocComputedEntry[]): string {
  return entries
    .map((entry, index) => {
      const leftIndent = entry.level === 0 ? 0 : entry.level === 1 ? 320 : 640;
      const isTop = entry.level === 0;
      const isSub = entry.level === 2;
      const fontSize = isSub ? 20 : isTop ? 23 : 22;
      const textColor = isTop ? "0F172A" : isSub ? "334155" : "1E293B";

      const tocOpen =
        index === 0
          ? `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o &quot;1-3&quot; \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>`
          : "";
      const tocClose =
        index === entries.length - 1 ? `<w:r><w:fldChar w:fldCharType="end"/></w:r>` : "";

      const titleRun = run(entry.title, {
        bold: isTop,
        sizeHalfPt: fontSize,
        color: textColor,
      });
      const tabRun = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="${fontSize}"/><w:color w:val="64748B"/></w:rPr><w:tab/></w:r>`;
      const pageRefRuns = `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGEREF ${entry.bookmarkName} \\h </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>${run(
        entry.pageLabel,
        {
          bold: isTop,
          sizeHalfPt: fontSize,
          color: textColor,
        }
      )}<w:r><w:fldChar w:fldCharType="end"/></w:r>`;

      return `<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9360"/></w:tabs><w:ind w:left="${leftIndent}"/><w:spacing w:before="${
        isTop ? "100" : "20"
      }" w:after="40" w:line="280" w:lineRule="auto"/></w:pPr>${tocOpen}<w:hyperlink w:anchor="${
        entry.bookmarkName
      }" w:history="1">${titleRun}${tabRun}${pageRefRuns}</w:hyperlink>${tocClose}</w:p>`;
    })
    .join("");
}

function isNumericOrCurrencyCell(value: string): boolean {
  const cleaned = stripMarkdownMarkers(value).trim();
  if (!cleaned) return false;
  return /^(?:KES\s*)?\(?-?\d[\d,.]*(?:\s*%|\s*:\s*1|\s*\/[a-z]+)?\)?$/i.test(cleaned);
}

function isSummaryRow(row: string[]): boolean {
  const first = stripMarkdownMarkers(row[0] || "").trim();
  return /^(?:total|gross profit|net profit|net monthly|net cash|closing balance|closing cash|opening balance|opening cash|operating profit|funding gap)/i.test(
    first
  );
}

function computeColumnWidths(rows: string[][], totalWidth = 9360): number[] {
  const colCount = Math.max(1, ...rows.map((r) => r.length));
  if (colCount === 1) return [totalWidth];
  const weights = Array.from({ length: colCount }, (_, colIdx) => {
    const maxLen = Math.max(
      4,
      ...rows.map((r) => {
        const cellText = stripMarkdownMarkers(r[colIdx] || "")
          .split(/<br\s*\/?>/i)[0]
          .trim();
        return Math.min(48, cellText.length);
      })
    );
    return colIdx === 0 ? Math.max(14, maxLen * 1.15) : Math.max(6, Math.sqrt(maxLen) * 3.8);
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const rawWidths = weights.map((w) => Math.max(540, Math.floor((w / weightSum) * totalWidth)));
  const diff = totalWidth - rawWidths.reduce((a, b) => a + b, 0);
  rawWidths[0] += diff;
  return rawWidths;
}

function cell(
  text: string,
  width: number,
  options: {
    header?: boolean;
    summary?: boolean;
    zebra?: boolean;
    colIndex?: number;
    colCount?: number;
    fontSizeHalfPt?: number;
  } = {}
): string {
  const rawLines = text
    .split(/<br\s*\/?>/gi)
    .map((l) => l.trim())
    .filter(Boolean);
  const lines = rawLines.length > 0 ? rawLines : [""];
  const isNumeric = !options.header && (options.colIndex ?? 0) > 0 && isNumericOrCurrencyCell(text);
  const isShortCenter =
    !options.header &&
    (options.colIndex ?? 0) > 0 &&
    stripMarkdownMarkers(text).trim().length <= 3 &&
    /^(?:X|\d+)$/i.test(stripMarkdownMarkers(text).trim());
  const align = isNumeric ? "right" : isShortCenter ? "center" : "left";

  const fill = options.header
    ? "1E293B"
    : options.summary
      ? "E2E8F0"
      : options.zebra
        ? "F8FAFC"
        : "FFFFFF";
  const textColor = options.header ? "FFFFFF" : "0F172A";
  const sz = options.fontSizeHalfPt || ((options.colCount || 3) >= 6 ? 19 : 21);

  const borderTopBottom = options.summary
    ? '<w:top w:val="single" w:sz="8" w:color="475569"/><w:bottom w:val="double" w:sz="8" w:color="1E293B"/>'
    : "";

  const paragraphs = lines
    .map((line) => {
      const cleanBulletLine = line.replace(/^[-*+]\s+/, "• ");
      return `<w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:before="20" w:after="40" w:line="280" w:lineRule="auto"/></w:pPr>${inlineRuns(
        cleanBulletLine,
        {
          bold: options.header || options.summary,
          sizeHalfPt: sz,
          color: textColor,
        },
        !options.header && cleanBulletLine.startsWith("• ")
      )}</w:p>`;
    })
    .join("");

  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${
    borderTopBottom ? `<w:tcBorders>${borderTopBottom}</w:tcBorders>` : ""
  }<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>${paragraphs}</w:tc>`;
}

function table(rows: string[][]): string {
  const colCount = Math.max(1, ...rows.map((row) => row.length));
  const colWidths = computeColumnWidths(rows, 9360);
  const borders = `<w:tblBorders><w:top w:val="single" w:sz="6" w:color="94A3B8"/><w:left w:val="single" w:sz="6" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="8" w:color="475569"/><w:right w:val="single" w:sz="6" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders>`;
  const grid = colWidths.map((w) => `<w:gridCol w:w="${w}"/>`).join("");
  const body = rows
    .map((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      const summary = !isHeader && isSummaryRow(row);
      const zebra = !isHeader && !summary && rowIndex % 2 === 0;
      const trPr = `<w:trPr><w:cantSplit/>${isHeader ? "<w:tblHeader/>" : ""}</w:trPr>`;
      return `<w:tr>${trPr}${Array.from({ length: colCount }, (_, index) =>
        cell(row[index] || "", colWidths[index], {
          header: isHeader,
          summary,
          zebra,
          colIndex: index,
          colCount,
        })
      ).join("")}</w:tr>`;
    })
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl><w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>`;
}

function renderOrgDiagram(lines: string[], mode = "org"): string {
  const cleaned = cleanDiagramLines(lines);
  const { manager, reports } =
    mode === "channels"
      ? { manager: cleaned[0] || "Enterprise Distribution Hub", reports: cleaned.slice(1) }
      : parseOrgDiagram(lines);
  const branches = (reports.length ? reports : cleaned.slice(1)).slice(0, 4);
  const rootBadge =
    mode === "channels" ? "PRIMARY DISTRIBUTION HUB" : "EXECUTIVE & TECHNICAL LEADERSHIP";

  const rootTable = `<w:tbl><w:tblPr><w:tblW w:w="5600" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="18" w:color="1E40AF"/><w:left w:val="single" w:sz="8" w:color="1E3A8A"/><w:bottom w:val="single" w:sz="8" w:color="1E3A8A"/><w:right w:val="single" w:sz="8" w:color="1E3A8A"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="5600"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="5600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EEF2FF"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="30" w:line="240" w:lineRule="auto"/></w:pPr>${run(
    rootBadge,
    { bold: true, sizeHalfPt: 17, color: "1E40AF" }
  )}</w:p><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="280" w:lineRule="auto"/></w:pPr>${run(
    stripMarkdownMarkers(manager),
    { bold: true, sizeHalfPt: 22, color: "0F172A" }
  )}</w:p></w:tc></w:tr></w:tbl>`;

  if (branches.length === 0) return rootTable;

  const stemParagraph = `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="220" w:lineRule="exact"/></w:pPr>${run(
    "│",
    { bold: true, sizeHalfPt: 22, color: "334155" }
  )}</w:p>`;

  const n = branches.length;
  const spacerWidth = n > 1 ? 280 : 0;
  const cardWidth = Math.floor((9360 - spacerWidth * (n - 1)) / n);
  const colWidths: number[] = [];
  for (let i = 0; i < n; i++) {
    colWidths.push(cardWidth);
    if (i < n - 1) colWidths.push(spacerWidth);
  }
  const grid = colWidths.map((w) => `<w:gridCol w:w="${w}"/>`).join("");

  const connectorCells = colWidths
    .map((w, colIdx) => {
      const isCardCol = colIdx % 2 === 0;
      const topTreeBorder =
        n > 1
          ? '<w:tcBorders><w:top w:val="single" w:sz="10" w:color="334155"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>'
          : "";
      const arrowText = isCardCol ? "▼" : "";
      return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${topTreeBorder}<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="20" w:after="20" w:line="220" w:lineRule="exact"/></w:pPr>${run(
        arrowText,
        { bold: true, sizeHalfPt: 18, color: "2563EB" }
      )}</w:p></w:tc>`;
    })
    .join("");

  const branchCells = colWidths
    .map((w, colIdx) => {
      if (colIdx % 2 === 1) {
        return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p></w:tc>`;
      }
      const branchIdx = colIdx / 2;
      const rawBranch = stripMarkdownMarkers(branches[branchIdx] || "").replace(/^[-*>]+\s*/, "");
      const parts = rawBranch.split(/\s*(?:—|--|:)\s*/);
      const deptTitle =
        parts.length > 1
          ? parts[0]
          : mode === "channels"
            ? `CHANNEL ${branchIdx + 1}`
            : `OPERATIONAL UNIT ${branchIdx + 1}`;
      const roleTitle = parts.length > 1 ? parts.slice(1).join(" — ") : rawBranch;

      return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="14" w:color="2563EB"/><w:left w:val="single" w:sz="6" w:color="475569"/><w:bottom w:val="single" w:sz="6" w:color="475569"/><w:right w:val="single" w:sz="6" w:color="475569"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/><w:tcMar><w:top w:w="110" w:type="dxa"/><w:bottom w:w="110" w:type="dxa"/><w:left w:w="130" w:type="dxa"/><w:right w:w="130" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr>${run(
        deptTitle.toUpperCase(),
        { bold: true, sizeHalfPt: 17, color: "1E40AF" }
      )}</w:p><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="260" w:lineRule="auto"/></w:pPr>${run(
        roleTitle,
        { bold: true, sizeHalfPt: 20, color: "0F172A" }
      )}</w:p></w:tc>`;
    })
    .join("");

  const branchesTable = `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${connectorCells}</w:tr><w:tr><w:trPr><w:cantSplit/></w:trPr>${branchCells}</w:tr></w:tbl><w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>`;

  return `${rootTable}${stemParagraph}${branchesTable}`;
}

function renderLayoutDiagram(lines: string[]): string {
  const labels = cleanDiagramLines(lines);
  if (!labels.length) return "";
  const cardW = 4500;
  const spacerW = 360;
  const rows: string[] = [];

  for (let i = 0; i < labels.length; i += 2) {
    const leftLabel = stripMarkdownMarkers(labels[i] || "").replace(/^[-*>]+\s*/, "");
    const rightLabel = labels[i + 1]
      ? stripMarkdownMarkers(labels[i + 1]).replace(/^[-*>]+\s*/, "")
      : "";

    const makeZoneCell = (zoneNum: number, text: string) =>
      text
        ? `<w:tc><w:tcPr><w:tcW w:w="${cardW}" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="12" w:color="1E40AF"/><w:left w:val="single" w:sz="6" w:color="64748B"/><w:bottom w:val="single" w:sz="6" w:color="64748B"/><w:right w:val="single" w:sz="6" w:color="64748B"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="30" w:line="240" w:lineRule="auto"/></w:pPr>${run(
            `ZONE 0${zoneNum}`,
            { bold: true, sizeHalfPt: 17, color: "1E40AF" }
          )}</w:p><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="260" w:lineRule="auto"/></w:pPr>${run(
            text,
            { bold: true, sizeHalfPt: 20, color: "0F172A" }
          )}</w:p></w:tc>`
        : `<w:tc><w:tcPr><w:tcW w:w="${cardW}" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p></w:tc>`;

    const spacerCell = `<w:tc><w:tcPr><w:tcW w:w="${spacerW}" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p></w:tc>`;

    rows.push(
      `<w:tr><w:trPr><w:cantSplit/></w:trPr>${makeZoneCell(i + 1, leftLabel)}${spacerCell}${makeZoneCell(
        i + 2,
        rightLabel
      )}</w:tr>`
    );
    if (i + 2 < labels.length) {
      rows.push(
        `<w:tr><w:trPr><w:trHeight w:val="120" w:hRule="exact"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="9360" w:type="dxa"/><w:gridSpan w:val="3"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p></w:tc></w:tr>`
      );
    }
  }

  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${cardW}"/><w:gridCol w:w="${spacerW}"/><w:gridCol w:w="${cardW}"/></w:tblGrid>${rows.join(
    ""
  )}</w:tbl><w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>`;
}

function renderFlowDiagram(lines: string[]): string {
  const flowSteps = parseFlowSteps(lines);
  if (!flowSteps.length) return "";
  const badgeW = 1300;
  const bodyW = 6900;
  const totalW = badgeW + bodyW;

  const rows = flowSteps
    .flatMap((step, idx) => {
      const cleanStep = stripMarkdownMarkers(step).replace(/^\d+[.)]\s*/, "");
      const arrowRow =
        idx > 0
          ? [
              `<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="${totalW}" w:type="dxa"/><w:gridSpan w:val="2"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="20" w:after="20" w:line="220" w:lineRule="exact"/></w:pPr>${run(
                "▼",
                { bold: true, sizeHalfPt: 18, color: "2563EB" }
              )}</w:p></w:tc></w:tr>`,
            ]
          : [];
      const stepRow = `<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="${badgeW}" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="6" w:color="1E40AF"/><w:left w:val="single" w:sz="6" w:color="1E40AF"/><w:bottom w:val="single" w:sz="6" w:color="1E40AF"/><w:right w:val="single" w:sz="6" w:color="1E40AF"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="1E40AF"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>${run(
        `STEP 0${idx + 1}`,
        { bold: true, sizeHalfPt: 18, color: "FFFFFF" }
      )}</w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="${bodyW}" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="6" w:color="64748B"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="6" w:color="64748B"/><w:right w:val="single" w:sz="6" w:color="64748B"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="260" w:lineRule="auto"/></w:pPr>${run(
        cleanStep,
        { bold: true, sizeHalfPt: 20, color: "0F172A" }
      )}</w:p></w:tc></w:tr>`;
      return [...arrowRow, stepRow];
    })
    .join("");

  return `<w:tbl><w:tblPr><w:tblW w:w="${totalW}" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${badgeW}"/><w:gridCol w:w="${bodyW}"/></w:tblGrid>${rows}</w:tbl><w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>`;
}

function diagram(lines: string[], mode = "flow"): string {
  const code = lines.join(" ");
  if (mode === "org" || mode === "channels" || /MANAGING DIRECTOR/i.test(code)) {
    return renderOrgDiagram(lines, mode);
  }
  if (mode === "layout") {
    return renderLayoutDiagram(lines);
  }
  return renderFlowDiagram(lines);
}

const PAGE_CAPACITY_DXA = 13600;

interface PageLayoutTracker {
  isMainBody: boolean;
  prelimPage: number;
  mainPage: number;
  usedDxa: number;
  nextBookmarkId: number;
  tocEntries: TocComputedEntry[];
}

function currentLabel(tracker: PageLayoutTracker): string {
  return tracker.isMainBody ? String(tracker.mainPage) : toRomanLower(tracker.prelimPage);
}

function forceNewPage(tracker: PageLayoutTracker): void {
  if (tracker.isMainBody) {
    tracker.mainPage += 1;
  } else {
    tracker.prelimPage += 1;
  }
  tracker.usedDxa = 0;
}

function consumeHeight(tracker: PageLayoutTracker, heightDxa: number, keepWithNext = false): void {
  const threshold = keepWithNext ? PAGE_CAPACITY_DXA - 1200 : PAGE_CAPACITY_DXA;
  if (tracker.usedDxa + heightDxa > threshold && tracker.usedDxa > 0) {
    forceNewPage(tracker);
  }
  tracker.usedDxa += heightDxa;
  while (tracker.usedDxa >= PAGE_CAPACITY_DXA) {
    tracker.usedDxa -= PAGE_CAPACITY_DXA;
    if (tracker.isMainBody) {
      tracker.mainPage += 1;
    } else {
      tracker.prelimPage += 1;
    }
  }
}

function registerHeadingBookmark(
  tracker: PageLayoutTracker,
  title: string,
  level: 0 | 1 | 2,
  estimatedHeadingDxa = 560
): { id: number; name: string } {
  consumeHeight(tracker, estimatedHeadingDxa, true);
  const id = tracker.nextBookmarkId++;
  const name = `_TocBP_${id}`;
  tracker.tocEntries.push({
    title: stripMarkdownMarkers(title).trim(),
    level,
    bookmarkName: name,
    pageLabel: currentLabel(tracker),
  });
  return { id, name };
}

function markdownToWord(
  content: string,
  sectionTitle: string,
  includeSubheadingsInToc: boolean,
  tracker: PageLayoutTracker,
  allocateOrderedListNumId: () => number
): string {
  const lines = content.replace(/\r/g, "").split("\n");
  const output: string[] = [];
  let activeOrderedNumId: number | null = null;
  const titleKey = (value: string) =>
    stripMarkdownMarkers(value).replace(/^\s*\d+(?:\.\d+)*\s*/, "").trim().toLowerCase();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      activeOrderedNumId = null;
      continue;
    }
    if (/^(---+|\*\*\*+)$/.test(line)) {
      activeOrderedNumId = null;
      continue;
    }

    if (line.startsWith("```")) {
      activeOrderedNumId = null;
      const diagramType = line.slice(3).trim().toLowerCase();
      const diagramLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        diagramLines.push(lines[index++]);
      }
      const dHeight =
        diagramType === "org" || diagramType === "channels"
          ? 2400
          : diagramType === "layout"
            ? Math.ceil(diagramLines.length / 2) * 860 + 200
            : diagramLines.length * 620 + 200;
      consumeHeight(tracker, dHeight);
      output.push(diagram(diagramLines, diagramType));
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])
    ) {
      activeOrderedNumId = null;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = lines[index]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((part) => part.trim());
        if (!row.every((part) => /^:?-{3,}:?$/.test(part))) rows.push(row);
        index += 1;
      }
      index -= 1;
      if (rows.length) {
        const tableHeight = rows.reduce((sum, r, rIdx) => {
          if (rIdx === 0) return sum + 480;
          const maxLines = Math.max(
            1,
            ...r.map((cellText) => {
              const subLines = cellText.split(/<br\s*\/?>/i);
              return subLines.reduce(
                (acc, l) => acc + Math.max(1, Math.ceil(stripMarkdownMarkers(l).length / 28)),
                0
              );
            })
          );
          return sum + maxLines * 290 + 180;
        }, 160);
        consumeHeight(tracker, tableHeight);
        output.push(table(rows));
      }
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      activeOrderedNumId = null;
      const level = heading[1].length;
      const style = level <= 2 ? "Heading1" : level === 3 ? "Heading2" : "Heading3";
      const cleanHeadingText = heading[2].replace(/<br\s*\/?>/gi, " ").trim();
      if (includeSubheadingsInToc && titleKey(cleanHeadingText) !== titleKey(sectionTitle)) {
        const bm = registerHeadingBookmark(tracker, cleanHeadingText, 2, 480);
        output.push(paragraph(cleanHeadingText, style, "", {}, bm.id, bm.name));
      } else {
        consumeHeight(tracker, 480, true);
        output.push(paragraph(cleanHeadingText, style));
      }
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      activeOrderedNumId = null;
      for (const part of bullet[1].split(/<br\s*\/?>/gi)) {
        if (part.trim()) {
          const wrappedLines = Math.max(1, Math.ceil(stripMarkdownMarkers(part.trim()).length / 76));
          consumeHeight(tracker, wrappedLines * 340 + 100);
          output.push(listItemParagraph(part.trim(), 1));
        }
      }
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      if (activeOrderedNumId === null) {
        activeOrderedNumId = allocateOrderedListNumId();
      }
      const itemText = numbered[1].replace(/<br\s*\/?>/gi, " ").trim();
      const wrappedLines = Math.max(1, Math.ceil(stripMarkdownMarkers(itemText).length / 76));
      consumeHeight(tracker, wrappedLines * 340 + 100);
      output.push(listItemParagraph(itemText, activeOrderedNumId));
      continue;
    }

    activeOrderedNumId = null;
    for (const part of line.split(/<br\s*\/?>/gi)) {
      if (part.trim()) {
        const wrappedLines = Math.max(1, Math.ceil(stripMarkdownMarkers(part.trim()).length / 82));
        consumeHeight(tracker, wrappedLines * 360 + 120);
        output.push(paragraph(part.trim()));
      }
    }
  }
  return output.join("");
}

function removeDuplicateLeadHeading(content: string, sectionTitle: string): string {
  const match = content.match(/^\s*#{1,6}\s+([^\r\n]+)(?:\r?\n)?/);
  if (!match) return content;
  const normalize = (value: string) =>
    stripMarkdownMarkers(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const headingNumber = match[1].match(/^\s*(\d+(?:\.\d+)+)\b/)?.[1];
  const titleNumber = sectionTitle.match(/^\s*(\d+(?:\.\d+)+)\b/)?.[1];
  if (
    normalize(match[1]) === normalize(sectionTitle) ||
    (headingNumber && headingNumber === titleNumber)
  ) {
    return content.slice(match[0].length);
  }
  return content;
}

function buildNumberingXml(maxOrderedNumId: number): string {
  const orderedNums: string[] = [];
  for (let id = 2; id <= maxOrderedNumId; id++) {
    orderedNums.push(
      `<w:num w:numId="${id}"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="540" w:hanging="280"/></w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:hint="default"/><w:b/><w:color w:val="1E40AF"/></w:rPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="540" w:hanging="320"/></w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="0F172A"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>${orderedNums.join(
    ""
  )}</w:numbering>`;
}

export function computeBusinessPlanTocEntries(
  rawSections: BusinessPlanDocxSection[]
): TocComputedEntry[] {
  const sections = orderSections(rawSections);
  const tracker: PageLayoutTracker = {
    isMainBody: false,
    prelimPage: 1,
    mainPage: 1,
    usedDxa: 0,
    nextBookmarkId: 1,
    tocEntries: [],
  };
  let nextOrdered = 1;
  const allocate = () => ++nextOrdered;
  let previousGroup = "";
  let hasAbbreviationsPage = false;
  let hasContentsPage = false;
  let hasMainSection = false;
  let hasStartedPreliminaryContent = false;

  for (const section of sections) {
    const group = sectionGroup(section.title);
    if (group === "executive" && !hasAbbreviationsPage) {
      forceNewPage(tracker);
      registerHeadingBookmark(tracker, "Abbreviations and Acronyms", 0, 600);
      hasAbbreviationsPage = true;
    }
    if (group === "executive" && !hasContentsPage) {
      forceNewPage(tracker);
      registerHeadingBookmark(tracker, "Table of Contents", 0, 600);
      // TOC spans ~2 pages (v - vi)
      tracker.prelimPage += 1;
      hasContentsPage = true;
    }
    if (group === "ch1" && !hasMainSection) {
      tracker.isMainBody = true;
      tracker.mainPage = 1;
      tracker.usedDxa = 0;
      hasMainSection = true;
    } else if (
      (["dedication", "declaration", "acknowledgements"].includes(group) &&
        hasStartedPreliminaryContent) ||
      ["references", "appendices"].includes(group) ||
      (group.startsWith("ch") && group !== previousGroup) ||
      (group === "executive" && previousGroup !== "contents")
    ) {
      forceNewPage(tracker);
    }
    if (group.startsWith("ch") && group !== previousGroup) {
      registerHeadingBookmark(tracker, chapterHeading(group) || section.title.toUpperCase(), 0, 720);
    }
    const level: 0 | 1 = group.startsWith("ch") ? 1 : 0;
    registerHeadingBookmark(tracker, section.title, level, 580);
    markdownToWord(
      removeDuplicateLeadHeading(section.content, section.title),
      section.title,
      group.startsWith("ch"),
      tracker,
      allocate
    );
    if (["dedication", "declaration", "acknowledgements"].includes(group)) {
      hasStartedPreliminaryContent = true;
    }
    previousGroup = group;
  }

  return tracker.tocEntries;
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
  isInstitutional?: boolean;
  course: string;
  level: string;
  sections: BusinessPlanDocxSection[];
}): Uint8Array {
  const sections = orderSections(params.sections);
  const brand = createBusinessPlanBrand({
    name: params.businessName || params.title,
    industry: params.industrySector,
    product: params.primaryProduct,
  });
  const icmhsLogo = params.isInstitutional
    ? fs.readFileSync(path.join(process.cwd(), "public", "branding", "icmhs-logo.png"))
    : null;
  const rawCourse = (params.course || "Human Nutrition and Dietetics").trim();
  const rawLevel = (params.level || "Diploma").trim();
  const awardCourse = /^(?:certificate|diploma|craft|higher\s+diploma)\b/i.test(rawCourse)
    ? rawCourse
    : `${rawLevel} in ${rawCourse}`.trim();

  let nextOrderedNumId = 1;
  const allocateOrderedListNumId = () => {
    nextOrderedNumId += 1;
    return nextOrderedNumId;
  };

  const tracker: PageLayoutTracker = {
    isMainBody: false,
    prelimPage: 1,
    mainPage: 1,
    usedDxa: 0,
    nextBookmarkId: 1,
    tocEntries: [],
  };

  const content: string[] = [
    coverAccentStripe(),
    `<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr></w:p>`,
    ...(icmhsLogo ? [logoImageParagraph("rId5")] : []),
    brandMarkCard(brand.initials, brand.accent, params.industrySector),
    ...(params.tagline
      ? [
          centeredParagraph(
            `“${params.tagline}”`,
            "Normal",
            { italic: true, sizeHalfPt: 23, color: "334155" },
            '<w:spacing w:before="180" w:after="200" w:line="320" w:lineRule="auto"/>'
          ),
        ]
      : []),
    centeredParagraph(
      params.title.toUpperCase(),
      "Title",
      { bold: true, sizeHalfPt: 30, color: "0F172A" },
      '<w:spacing w:before="200" w:after="280" w:line="360" w:lineRule="auto"/>'
    ),
    centeredParagraph(params.isInstitutional ? "INSTITUTIONAL FEASIBILITY AND IMPLEMENTATION BRIEF" : "PRESENTED BY:", "Normal", {
      bold: true,
      sizeHalfPt: 20,
      color: "475569",
    }),
    ...(!params.isInstitutional && params.candidate
      ? [
          centeredParagraph(params.candidate.toUpperCase(), "Normal", {
            bold: true,
            sizeHalfPt: 24,
            color: "0F172A",
          }),
        ]
      : []),
    ...(!params.isInstitutional && params.admissionNumber
      ? [
          centeredParagraph(`Index / Admission Number: ${params.admissionNumber}`, "Normal", {
            bold: true,
            sizeHalfPt: 22,
            color: "1E293B",
          }),
        ]
      : []),
    ...(params.institution
      ? [
          centeredParagraph(params.institution.toUpperCase(), "Normal", {
            bold: true,
            sizeHalfPt: 22,
            color: "1E3A8A",
          }),
        ]
      : []),
    centeredParagraph(
      params.isInstitutional
        ? "Prepared for internal management review. Not a student examination submission or marketplace product."
        : `A Business Plan Submitted to the Kenya National Examinations Council (KNEC) in Partial Fulfilment of the Requirements for the Award of ${awardCourse}.`,
      "Normal",
      { bold: true, sizeHalfPt: 22, color: "0F172A" },
      '<w:spacing w:before="280" w:after="280" w:line="360" w:lineRule="auto"/>'
    ),
    ...(!params.isInstitutional && params.supervisor
      ? [
          centeredParagraph(`Project Supervisor: ${params.supervisor}`, "Normal", {
            bold: true,
            sizeHalfPt: 22,
            color: "1E293B",
          }),
        ]
      : []),
    centeredParagraph(
      new Date()
        .toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })
        .toUpperCase(),
      "Normal",
      { bold: true, sizeHalfPt: 22, color: "0F172A" },
      '<w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/>'
    ),
    sectionBreak(),
  ];

  let tocPlaceholderIndex = -1;
  let previousGroup = "";
  let hasAbbreviationsPage = false;
  let hasContentsPage = false;
  let hasMainSection = false;
  let hasStartedPreliminaryContent = false;

  for (const section of sections) {
    const group = sectionGroup(section.title);
    if (group === "executive" && !hasAbbreviationsPage) {
      forceNewPage(tracker);
      const abbrBm = registerHeadingBookmark(tracker, "Abbreviations and Acronyms", 0, 600);
      const rows = getVerifiedBusinessPlanAbbreviations(sections);
      content.push(
        `<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`,
        centeredParagraph(
          "ABBREVIATIONS AND ACRONYMS",
          "Heading1",
          {},
          '<w:spacing w:after="120" w:line="360" w:lineRule="auto"/>',
          abbrBm.id,
          abbrBm.name
        ),
        rows.length
          ? table([["Abbreviation", "Full Meaning"], ...rows.map(([abbr, meaning]) => [abbr, meaning])])
          : paragraph("No abbreviations or acronyms were identified in the supplied plan.")
      );
      hasAbbreviationsPage = true;
    }
    if (group === "executive" && !hasContentsPage) {
      forceNewPage(tracker);
      const tocBm = registerHeadingBookmark(tracker, "Table of Contents", 0, 600);
      // TOC spans ~2 pages (v - vi)
      tracker.prelimPage += 1;
      content.push(
        `<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`,
        centeredParagraph(
          "TABLE OF CONTENTS",
          "Heading1",
          {},
          '<w:spacing w:after="160" w:line="360" w:lineRule="auto"/>',
          tocBm.id,
          tocBm.name
        )
      );
      tocPlaceholderIndex = content.length;
      content.push("");
      hasContentsPage = true;
    }
    if (group === "ch1" && !hasMainSection) {
      content.push(sectionBreak("lowerRoman", true));
      tracker.isMainBody = true;
      tracker.mainPage = 1;
      tracker.usedDxa = 0;
      hasMainSection = true;
    } else if (
      (["dedication", "declaration", "acknowledgements"].includes(group) &&
        hasStartedPreliminaryContent) ||
      ["references", "appendices"].includes(group) ||
      (group.startsWith("ch") && group !== previousGroup) ||
      (group === "executive" && previousGroup !== "contents")
    ) {
      content.push(`<w:p><w:pPr><w:pageBreakBefore w:val="true"/></w:pPr>${run("")}</w:p>`);
      forceNewPage(tracker);
    }
    if (group.startsWith("ch") && group !== previousGroup) {
      const chapTitle = chapterHeading(group) || section.title.toUpperCase();
      const chapBm = registerHeadingBookmark(tracker, chapTitle, 0, 720);
      content.push(
        centeredParagraph(
          chapTitle,
          "Heading1",
          { bold: true, sizeHalfPt: 26, color: "0F172A" },
          '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="1E40AF"/></w:pBdr><w:spacing w:before="120" w:after="240" w:line="360" w:lineRule="auto"/>',
          chapBm.id,
          chapBm.name
        )
      );
    }
    const titleStyle = group.startsWith("ch") ? "Heading2" : "Heading1";
    const secLevel: 0 | 1 = group.startsWith("ch") ? 1 : 0;
    const secBm = registerHeadingBookmark(tracker, section.title, secLevel, 580);
    const headingParagraph = group.startsWith("ch")
      ? paragraph(section.title, titleStyle, "", {}, secBm.id, secBm.name)
      : centeredParagraph(
          section.title.toUpperCase(),
          titleStyle,
          {},
          '<w:spacing w:after="120" w:line="360" w:lineRule="auto"/>',
          secBm.id,
          secBm.name
        );
    content.push(
      headingParagraph,
      markdownToWord(
        removeDuplicateLeadHeading(section.content, section.title),
        section.title,
        group.startsWith("ch"),
        tracker,
        allocateOrderedListNumId
      )
    );
    if (["dedication", "declaration", "acknowledgements"].includes(group)) {
      hasStartedPreliminaryContent = true;
    }
    previousGroup = group;
  }

  if (tocPlaceholderIndex >= 0) {
    content[tocPlaceholderIndex] = renderTableOfContentsField(tracker.tocEntries);
  }

  const zip = new PizZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>${icmhsLogo ? '<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/icmhs-logo.png"/>' : ""}</Relationships>`
  );
  if (icmhsLogo) zip.file("word/media/icmhs-logo.png", icmhsLogo);
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${content.join(
      ""
    )}<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1270" w:bottom="1247" w:left="1270"/><w:pgNumType w:fmt="decimal" w:start="1"/></w:sectPr></w:body></w:document>`
  );
  zip.file("word/numbering.xml", buildNumberingXml(nextOrderedNumId));
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="0F172A"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:contextualSpacing/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:bCs/><w:sz w:val="30"/><w:szCs w:val="30"/><w:color w:val="0F172A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="0"/><w:spacing w:before="280" w:after="140" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="26"/><w:szCs w:val="26"/><w:color w:val="0F172A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="1"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/></w:pBdr><w:spacing w:before="240" w:after="100" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="1E3A8A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="2"/><w:spacing w:before="180" w:after="80" w:line="360" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="0F172A"/></w:rPr></w:style></w:styles>`
  );
  zip.file(
    "word/settings.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:updateFields w:val="true"/></w:settings>`
  );
  zip.file(
    "word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/><w:color w:val="475569"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`
  );
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}
