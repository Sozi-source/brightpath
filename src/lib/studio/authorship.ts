import type { WorkspaceSection, SupervisorReview, AiMode } from "@/types/database";

export type IntegrityTier = "high_originality" | "balanced_coaching" | "heavy_ai";

export interface SectionAuthorshipMetric {
  sectionKey: string;
  wordCount: number;
  totalChars: number;
  aiAcceptedChars: number;
  humanRatioPercent: number;
  aiRatioPercent: number;
  tier: IntegrityTier;
}

export interface WorkspaceAuthorshipSummary {
  totalWords: number;
  totalChars: number;
  totalAiChars: number;
  humanRatioPercent: number;
  aiRatioPercent: number;
  tier: IntegrityTier;
  tierLabel: string;
  sectionsCompleted: number;
  sectionsReviewed: number;
  sectionsFinal: number;
  totalSections: number;
  bySection: Map<string, SectionAuthorshipMetric>;
}

export function classifyIntegrityTier(humanRatioPercent: number): {
  tier: IntegrityTier;
  label: string;
} {
  if (humanRatioPercent >= 70) {
    return { tier: "high_originality", label: "High Candidate Originality" };
  }
  if (humanRatioPercent >= 40) {
    return { tier: "balanced_coaching", label: "Balanced AI Coaching" };
  }
  return { tier: "heavy_ai", label: "High AI Assistance" };
}

export function computeSectionAuthorship(section?: WorkspaceSection | null): SectionAuthorshipMetric {
  const rawText = section?.current_text?.trim() || "";
  const wordCount = rawText ? rawText.split(/\s+/).length : 0;
  const totalChars = rawText.length;
  const rawAiChars = Math.max(0, section?.ai_accepted_chars || 0);
  const clampedAiChars = totalChars > 0 ? Math.min(totalChars, rawAiChars) : 0;

  const aiRatioPercent =
    totalChars > 0 ? Math.min(100, Math.max(0, Math.round((clampedAiChars / totalChars) * 100))) : 0;
  const humanRatioPercent = totalChars > 0 ? 100 - aiRatioPercent : 100;
  const { tier } = classifyIntegrityTier(humanRatioPercent);

  return {
    sectionKey: section?.section_key || "",
    wordCount,
    totalChars,
    aiAcceptedChars: clampedAiChars,
    humanRatioPercent,
    aiRatioPercent,
    tier,
  };
}

export function computeWorkspaceAuthorship(
  sections: WorkspaceSection[],
  totalExpectedSections: number
): WorkspaceAuthorshipSummary {
  let totalWords = 0;
  let totalChars = 0;
  let totalAiChars = 0;
  let sectionsCompleted = 0;
  let sectionsReviewed = 0;
  let sectionsFinal = 0;

  const bySection = new Map<string, SectionAuthorshipMetric>();

  for (const s of sections) {
    const metric = computeSectionAuthorship(s);
    bySection.set(s.section_key, metric);
    totalWords += metric.wordCount;
    totalChars += metric.totalChars;
    totalAiChars += metric.aiAcceptedChars;

    if (metric.wordCount >= 20) sectionsCompleted += 1;
    if (s.status === "reviewed" || s.status === "final") sectionsReviewed += 1;
    if (s.status === "final") sectionsFinal += 1;
  }

  const aiRatioPercent =
    totalChars > 0 ? Math.min(100, Math.max(0, Math.round((totalAiChars / totalChars) * 100))) : 0;
  const humanRatioPercent = totalChars > 0 ? 100 - aiRatioPercent : 100;
  const { tier, label: tierLabel } = classifyIntegrityTier(humanRatioPercent);

  return {
    totalWords,
    totalChars,
    totalAiChars,
    humanRatioPercent,
    aiRatioPercent,
    tier,
    tierLabel,
    sectionsCompleted,
    sectionsReviewed,
    sectionsFinal,
    totalSections: Math.max(totalExpectedSections, sections.length),
    bySection,
  };
}

export function formatAiModeLabel(mode?: AiMode | null): {
  mode: AiMode;
  label: string;
  shortDesc: string;
} {
  switch (mode) {
    case "off":
      return {
        mode: "off",
        label: "AI Disabled",
        shortDesc: "Institution policy prohibits generative AI assistance",
      };
    case "feedback_only":
      return {
        mode: "feedback_only",
        label: "Feedback Only",
        shortDesc: "AI provides rubric checks and citation validation without rewriting text",
      };
    default:
      return {
        mode: "feedback_and_polish",
        label: "Coaching & Polish",
        shortDesc: "Guided topic discovery, academic alignment, and verified citations enabled",
      };
  }
}

// ============================================================================
// KNEC Rubric Scorecard Encoding & Decoding (Stored in supervisor_reviews)
// ============================================================================

const RUBRIC_MARKER = "[KNEC_RUBRIC_V1]";

export interface SavedRubricScorecard {
  scores: Record<string, number>;
  totalAwarded: number;
  maxMarks: number;
  examinerSummary: string;
  gradedAt: string;
}

export function encodeRubricReviewComment(payload: {
  scores: Record<string, number>;
  totalAwarded: number;
  maxMarks: number;
  examinerSummary: string;
}): string {
  const jsonPart = JSON.stringify({
    scores: payload.scores,
    totalAwarded: payload.totalAwarded,
    maxMarks: payload.maxMarks,
    examinerSummary: payload.examinerSummary,
  });
  return `${RUBRIC_MARKER}${jsonPart}\n${payload.examinerSummary}`;
}

export function parseRubricReviewComment(
  comment: string,
  createdAt: string
): SavedRubricScorecard | null {
  if (!comment.startsWith(RUBRIC_MARKER)) return null;
  const firstNewline = comment.indexOf("\n");
  const jsonLine =
    firstNewline === -1
      ? comment.slice(RUBRIC_MARKER.length)
      : comment.slice(RUBRIC_MARKER.length, firstNewline);

  try {
    const parsed = JSON.parse(jsonLine) as {
      scores?: Record<string, number>;
      totalAwarded?: number;
      maxMarks?: number;
      examinerSummary?: string;
    };
    if (!parsed || typeof parsed.scores !== "object") return null;
    return {
      scores: parsed.scores || {},
      totalAwarded: Number(parsed.totalAwarded ?? 0),
      maxMarks: Number(parsed.maxMarks ?? 100),
      examinerSummary:
        parsed.examinerSummary ||
        (firstNewline !== -1 ? comment.slice(firstNewline + 1).trim() : "Rubric evaluation recorded."),
      gradedAt: createdAt,
    };
  } catch {
    return null;
  }
}

export function extractLatestRubricScorecard(
  reviews: SupervisorReview[]
): SavedRubricScorecard | null {
  for (const rev of reviews) {
    const parsed = parseRubricReviewComment(rev.comment, rev.created_at);
    if (parsed) return parsed;
  }
  return null;
}

export function cleanDisplayReviewComment(comment: string): string {
  if (!comment.startsWith(RUBRIC_MARKER)) return comment;
  const parsed = parseRubricReviewComment(comment, "");
  if (!parsed) return comment;
  return `KNEC Rubric Score: ${parsed.totalAwarded}/${parsed.maxMarks} — ${parsed.examinerSummary}`;
}
