const DRAWING_CHARACTERS = /[\u2500-\u257F\u00E2\u201D\u20AC\u0090\u02DC\u0152\u0153\u201A\u2020\u2019]/g;

export function cleanDiagramLines(lines: string[]): string[] {
  return lines
    .map((line) =>
      line
        .replace(DRAWING_CHARACTERS, " ")
        .replace(/[|+]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => /[A-Za-z0-9]/.test(line));
}

export function parseOrgDiagram(lines: string[]): { manager: string; reports: string[] } {
  const cleaned = cleanDiagramLines(lines);
  if (cleaned.length === 0) {
    return {
      manager: "Managing Director / Lead Nutritionist",
      reports: [
        "Operations & Quality Execution",
        "Customer Service, Records & Logistics",
      ],
    };
  }

  // Handle legacy ASCII box-drawing organograms if present in old workspaces
  const source = cleaned.join(" | ");
  const isLegacyAscii =
    /OPERATIONS\s*(?:&|AND)\s*QUALITY[\s\S]{0,100}?MACHINE OPERATOR/i.test(source) ||
    cleaned.some((line) => /^\([^)]+\)$/.test(line));

  if (isLegacyAscii) {
    const managerLine = cleaned.find((line) =>
      /MANAGING DIRECTOR|GENERAL MANAGER|PROPRIETOR|DIRECTOR/i.test(line)
    );
    let manager = managerLine?.replace(/\s+/g, " ").trim() || cleaned[0];
    if (managerLine && !/\([^)]*\)/.test(managerLine)) {
      const descriptor = cleaned[cleaned.indexOf(managerLine) + 1]?.match(/^\(([^)]+)\)$/)?.[1];
      if (descriptor) manager = `${manager} (${descriptor})`;
    }
    const legacyReports = [
      /OPERATIONS\s*(?:&|AND)\s*QUALITY[\s\S]{0,100}?MACHINE OPERATOR/i.test(source)
        ? "Operations & Quality — Machine Operator"
        : null,
      /SALES\s*(?:&|AND)\s*ACCOUNTS? CLERK[\s\S]{0,100}?(?:MARKETING\s*(?:&|AND)\s*RECORDS)?/i.test(source)
        ? "Sales & Accounts — Marketing and Records Clerk"
        : null,
    ].filter((report): report is string => Boolean(report));
    if (legacyReports.length > 0) {
      return { manager, reports: legacyReports };
    }
  }

  // Standard structured org block: Line 0 is the Executive / Lead role,
  // and Lines 1..N are the direct-report units/roles.
  const manager = cleaned[0].replace(/^[-*>]+\s*/, "").trim();
  const reports = cleaned
    .slice(1)
    .map((line) => line.replace(/^[-*>]+\s*/, "").trim())
    .filter((line) => Boolean(line) && !/^[\s\-_.]+$/.test(line) && line !== manager);

  return {
    manager,
    reports:
      reports.length > 0
        ? reports
        : [
            "Operations & Quality Assurance Unit",
            "Customer Service, Records & Dispatch Unit",
          ],
  };
}

export function parseFlowSteps(lines: string[]): string[] {
  return cleanDiagramLines(lines)
    .flatMap((line) =>
      line
        .replace(/\[[0-9.\s]*/g, "")
        .replace(/\]/g, "")
        .split(/\s*(?:->|>)\s*/)
    )
    .map((step) => step.trim().replace(/^[-*>]+\s*/, ""))
    .filter(Boolean);
}
