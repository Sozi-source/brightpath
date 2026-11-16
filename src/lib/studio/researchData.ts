import snapshotJson from "./researchDataSnapshot.json";
import type { ResearchDomain } from "./researchTypes";

export interface DataPoint {
  year: number;
  value: number;
}

export interface ResearchIndicator {
  id: string;
  wbCode: string;
  label: string;
  shortLabel: string;
  unit: string;
  domain: ResearchDomain | string;
  definition: string;
  sourceOrg: string;
  sourceUrl: string;
  apiUrl: string;
  series: DataPoint[];
}

export interface ResearchDataSnapshot {
  country: string;
  countryIso3: string;
  retrievedAt: string;
  provider: string;
  indicators: ResearchIndicator[];
}

export interface IndicatorStats {
  count: number;
  firstYear: number;
  firstValue: number;
  lastYear: number;
  lastValue: number;
  yearSpan: number;
  absoluteChange: number;
  percentChange: number | null;
  avgAnnualChange: number;
  cagrPercent: number | null;
  minYear: number;
  minValue: number;
  maxYear: number;
  maxValue: number;
  mean: number;
  stdDev: number;
  linearSlopePerYear: number;
  direction: "increasing" | "decreasing" | "stable";
}

export const RESEARCH_SNAPSHOT: ResearchDataSnapshot = snapshotJson as ResearchDataSnapshot;

export function getAllResearchIndicators(): ResearchIndicator[] {
  return RESEARCH_SNAPSHOT.indicators;
}

export function getIndicatorById(id: string): ResearchIndicator | undefined {
  return RESEARCH_SNAPSHOT.indicators.find((ind) => ind.id === id);
}

export function getIndicatorsByDomain(domain: string): ResearchIndicator[] {
  return RESEARCH_SNAPSHOT.indicators.filter((ind) => ind.domain === domain);
}

export function filterSeriesByYears(
  series: DataPoint[],
  yearFrom: number,
  yearTo: number
): DataPoint[] {
  const filtered = series.filter((pt) => pt.year >= yearFrom && pt.year <= yearTo);
  return filtered.length >= 3 ? filtered : series;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeIndicatorStats(series: DataPoint[]): IndicatorStats | null {
  if (!series || series.length < 2) return null;
  const sorted = [...series].sort((a, b) => a.year - b.year);
  const count = sorted.length;
  const first = sorted[0];
  const last = sorted[count - 1];
  const yearSpan = Math.max(1, last.year - first.year);

  const absoluteChange = round1(last.value - first.value);
  const percentChange =
    first.value !== 0 ? round1(((last.value - first.value) / Math.abs(first.value)) * 100) : null;
  const avgAnnualChange = round2(absoluteChange / yearSpan);
  const cagrPercent =
    first.value > 0 && last.value > 0 && last.year > first.year
      ? round2((Math.pow(last.value / first.value, 1 / yearSpan) - 1) * 100)
      : null;

  let minPt = sorted[0];
  let maxPt = sorted[0];
  let sum = 0;
  for (const pt of sorted) {
    if (pt.value < minPt.value) minPt = pt;
    if (pt.value > maxPt.value) maxPt = pt;
    sum += pt.value;
  }
  const mean = round2(sum / count);
  const variance = sorted.reduce((acc, pt) => acc + Math.pow(pt.value - mean, 2), 0) / count;
  const stdDev = round2(Math.sqrt(variance));

  // Ordinary least-squares linear slope (value per year)
  const meanYear = sorted.reduce((acc, pt) => acc + pt.year, 0) / count;
  let num = 0;
  let den = 0;
  for (const pt of sorted) {
    const dx = pt.year - meanYear;
    num += dx * (pt.value - mean);
    den += dx * dx;
  }
  const linearSlopePerYear = den > 0 ? round2(num / den) : 0;

  let direction: "increasing" | "decreasing" | "stable" = "stable";
  if (absoluteChange > 0.5) direction = "increasing";
  else if (absoluteChange < -0.5) direction = "decreasing";

  return {
    count,
    firstYear: first.year,
    firstValue: first.value,
    lastYear: last.year,
    lastValue: last.value,
    yearSpan,
    absoluteChange,
    percentChange,
    avgAnnualChange,
    cagrPercent,
    minYear: minPt.year,
    minValue: minPt.value,
    maxYear: maxPt.year,
    maxValue: maxPt.value,
    mean,
    stdDev,
    linearSlopePerYear,
    direction,
  };
}
