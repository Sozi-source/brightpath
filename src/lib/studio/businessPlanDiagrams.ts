const DRAWING_CHARACTERS = /[\u2500-\u257F\u00E2\u201D\u20AC\u0090\u02DC\u0152\u0153\u201A\u2020\u2019]/g;

export function cleanDiagramLines(lines: string[]): string[] {
  return lines.map((line) => line.replace(DRAWING_CHARACTERS, " ").replace(/[|+]/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => /[A-Za-z0-9]/.test(line));
}

export function parseOrgDiagram(lines: string[]): { manager: string; reports: string[] } {
  const cleaned = cleanDiagramLines(lines);
  const managerLine = cleaned.find((line) => /MANAGING DIRECTOR|GENERAL MANAGER|PROPRIETOR|DIRECTOR/i.test(line));
  let manager = managerLine?.replace(/\s+/g, " ").trim() || "Business Owner / Manager";
  if (managerLine && !/\([^)]*\)/.test(managerLine)) {
    const descriptor = cleaned[cleaned.indexOf(managerLine) + 1]?.match(/^\(([^)]+)\)$/)?.[1];
    if (descriptor) manager = `${manager} (${descriptor})`;
  }
  const source = cleaned.join(" | ");
  const reports = [
    /OPERATIONS\s*(?:&|AND)\s*QUALITY[\s\S]{0,100}?MACHINE OPERATOR/i.test(source) ? "Operations and Quality: Machine Operator" : null,
    /SALES\s*(?:&|AND)\s*ACCOUNTS? CLERK[\s\S]{0,100}?(?:MARKETING\s*(?:&|AND)\s*RECORDS)?/i.test(source) ? "Sales and Accounts Clerk: Marketing and Records" : null,
  ].filter((report): report is string => Boolean(report));
  if (!reports.length) reports.push(...cleaned.filter((line) => /OPERATIONS\s*(?:&|AND)\s*QUALITY|SALES\s*(?:&|AND)\s*ACCOUNTS?/i.test(line)));
  if (reports.length) return { manager, reports };
  const managerIndex = Math.max(0, cleaned.findIndex((line) => line === managerLine));
  return {
    manager,
    reports: cleaned.slice(managerIndex + 1)
      .filter((line) => !/^[\s\-_.]+$/.test(line) && !/^[A-Z\s]+$/.test(line))
      .map((line) => line.replace(/^[-*>]+\s*/, ""))
      .filter(Boolean),
  };
}

export function parseFlowSteps(lines: string[]): string[] {
  return cleanDiagramLines(lines)
    .flatMap((line) => line.replace(/\[[0-9.\s]*/g, "").replace(/\]/g, "").split(/\s*(?:->|>)\s*/))
    .map((step) => step.trim().replace(/^[-*>]+\s*/, ""))
    .filter(Boolean);
}
