import type { BusinessPlanDocxSection } from "./businessPlanDocx";

const VERIFIED_ABBREVIATIONS: Record<string, string> = {
  APA: "American Psychological Association",
  CM: "Contribution margin",
  EBITDA: "Earnings before interest, taxes, depreciation and amortization",
  EBT: "Earnings before tax",
  EBIT: "Earnings before interest and tax",
  EAS: "East African Standard",
  FAO: "Food and Agriculture Organization of the United Nations",
  GMP: "Good Manufacturing Practice",
  HACCP: "Hazard Analysis and Critical Control Points",
  KCB: "Kenya Commercial Bank",
  KES: "Kenya shilling",
  KEBS: "Kenya Bureau of Standards",
  KNBS: "Kenya National Bureau of Statistics",
  KNCCI: "Kenya National Chamber of Commerce and Industry",
  KNDI: "Kenya Nutritionists and Dieticians Institute",
  KNEC: "Kenya National Examinations Council",
  KPLC: "Kenya Power and Lighting Company",
  KRA: "Kenya Revenue Authority",
  KS: "Kenya Standard",
  MSEA: "Micro and Small Enterprises Authority",
  MSE: "Micro and small enterprise",
  NFNSP: "National Food and Nutrition Security Policy",
  NSSF: "National Social Security Fund",
  PAYE: "Pay As You Earn",
  "P&L": "Profit and loss",
  PIN: "Personal Identification Number",
  POS: "Point of sale",
  RRP: "Recommended retail price",
  ROI: "Return on investment",
  ROE: "Return on equity",
  SBP: "Single Business Permit",
  SHA: "Social Health Authority",
  SM: "Standardization Mark",
  SWOT: "Strengths, weaknesses, opportunities and threats",
  TAM: "Total addressable market",
  TVET: "Technical and Vocational Education and Training",
  VAT: "Value Added Tax",
  WHO: "World Health Organization",
  YEDF: "Youth Enterprise Development Fund",
};

export function getVerifiedBusinessPlanAbbreviations(sections: BusinessPlanDocxSection[]): Array<[string, string]> {
  const text = sections.map((section) => `${section.title}\n${section.content}`).join("\n");
  return Object.entries(VERIFIED_ABBREVIATIONS)
    .filter(([key]) => new RegExp(`\\b${key}s?\\b`, "i").test(text))
    .sort(([a], [b]) => a.localeCompare(b));
}
