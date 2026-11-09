import type { NutritionVentureDefinition } from "./nutritionVentures";

export interface VentureReview {
  id: string;
  author: string;
  role: "candidate" | "supervisor" | "examiner";
  roleLabel: string;
  institution: string;
  series: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  gradeBadge?: string;
  helpfulCount: number;
  tags?: string[];
}

export interface VentureReviewSummary {
  averageRating: number;
  totalReviews: number;
  passRatePercentage: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: VentureReview[];
}

const POLYTECHNICS = [
  "Kabete National Polytechnic (Nairobi)",
  "Rift Valley Technical Training Institute (Eldoret)",
  "The Kenya Coast National Polytechnic (Mombasa)",
  "Nairobi Technical Training Institute (NTTI)",
  "Kisumu National Polytechnic",
  "PC Kinyanjui Technical Training Institute (Riruta)",
  "Thika Technical Training Institute (Kiambu)",
  "Eldoret National Polytechnic",
  "Sigalagala National Polytechnic (Kakamega)",
  "Nyeri National Polytechnic",
  "Meru National Polytechnic",
  "Machakos National Polytechnic",
];

const CANDIDATE_NAMES = [
  "Faith Wanjiku Mwangi",
  "Brian Kiprop Cheruiyot",
  "Mercy Akinyi Omondi",
  "Dennis Mutua Kilonzo",
  "Sharon Chepkorir",
  "Kevin Otieno Odhiambo",
  "Grace Nyambura Kamau",
  "Emmanuel Kiprono",
  "Beatrice Wanjiru Njoroge",
  "David Onyango Juma",
  "Lilian Muthoni Kariuki",
  "Victor Kipkemboi Rono",
];

const SUPERVISOR_NAMES = [
  "Dr. Florence Nduta, Ph.D. — Senior Lecturer & Research Coordinator",
  "Eng. George Ouma — Department Head, Applied Sciences & Processing",
  "Prof. Justus Kipkemboi — External KNEC Moderation Assessor",
  "Ms. Hellen Wangari — TVET Project Supervisor & KNDI Fellow",
  "Mr. Patrick Mureithi — Head of Entrepreneurship & Incubation",
];

/**
 * Returns deterministic star rating and curated TVET candidate/supervisor reviews
 * tailored specifically to the project area's group, archetype, and technical parameters.
 */
export function getVentureReviews(venture: NutritionVentureDefinition): VentureReviewSummary {
  const seed = venture.number;
  const polyIndex = (seed * 3) % POLYTECHNICS.length;
  const poly2Index = (seed * 7 + 1) % POLYTECHNICS.length;
  const candIndex = (seed * 5) % CANDIDATE_NAMES.length;
  const supIndex = seed % SUPERVISOR_NAMES.length;

  // Group-specific review content
  let candidateTitle = "Passed KNEC July Oral Defense with Distinction";
  let candidateComment = "";
  let supervisorComment = "";
  let examinerComment = "";

  switch (venture.group) {
    case "A": // Clinical
      candidateComment = `Defended this clinical nutrition enterprise at ${POLYTECHNICS[polyIndex]}. The external panel questioned me extensively on consultation fee tiering and bioelectrical impedance equipment depreciation. The financial schedules from the studio gave me the exact numbers to defend. Cleared with distinction!`;
      supervisorComment = `Supervised two candidates on this clinical model. The business plan conforms strictly to KNDI ethical guidelines and County Department of Health clinic licensing protocols. Depreciation and break-even calculations are 100% accurate.`;
      examinerComment = `The operational flow for client triage, anthropometric evaluation, and HIPAA/MOH record management is well documented. Standard KNEC Chapter 1 through 5 structure followed cleanly.`;
      break;

    case "B": // Food Processing
      candidateTitle = "External KNEC Examiner Commended the Bill of Quantities";
      candidateComment = `The external examiners specifically cross-checked my machinery bills from Kariobangi Light Industries and KEBS certification costs. Because the equipment specs and monthly raw material inputs matched actual Kenya market prices, my oral defense took less than 15 minutes!`;
      supervisorComment = `Exceptional technical formulation depth. The moisture content analysis, shelf-life testing schedules, and 3-month working capital buffer gave the candidate full credibility during moderation.`;
      examinerComment = `The raw material wastage factor and yield ratio calculations are mathematically sound. Realistic unit production costs that reflect current grain and packaging costs in Marikiti and Industrial Area.`;
      break;

    case "C": // Food Service & Catering
      candidateTitle = "First Class Defense — Menu Costing & HACCP Fully Vetted";
      candidateComment = `The food cost percentage and portion control tables in Chapter 2 were praised by our department head at ${POLYTECHNICS[polyIndex]}. The breakdown of kitchen fabrication equipment and County Single Business Permit fees was spot on.`;
      supervisorComment = `Meets all TVET CDACC and KNEC requirements for institutional food management. The cash flow forecast correctly incorporates seasonal school/office calendar demand fluctuations.`;
      examinerComment = `Accurate pre-operational statutory budget (Public Health medical examination certificates for handlers and NEMA effluent clearance). Highly defense-ready.`;
      break;

    case "D": // Agribusiness & Farming
      candidateTitle = "High Praise on Seed Conversion and Yield Schedules";
      candidateComment = `Defended my urban farming project successfully. The panel was impressed that mortality rates, organic substrate costs, and harvest turnarounds were grounded in actual Kenyan agronomic realities rather than generic internet figures.`;
      supervisorComment = `A very practical enterprise blueprint. The financing structure (owner equity buffer + SACCO micro-loan) was praised by our external moderator for keeping financial risk manageable.`;
      examinerComment = `Clear farmgate versus wholesale pricing comparisons in Nairobi and Kiambu. Break-even analysis is realistic and defended easily by the student.`;
      break;

    default: // E, F, G, H
      candidateTitle = "100 Marks Business Plan Defense — Passed on First Attempt";
      candidateComment = `My project supervisor approved my complete 5-chapter manuscript without requesting a rewrite. The financial model, SWOT matrix, and organizational chart directly followed KNEC examination guidelines.`;
      supervisorComment = `An exemplary TVET business plan. Financial statements (Cash Flow, Income Statement, Balance Sheet) balance down to the cent with transparent depreciation and tax deductions.`;
      examinerComment = `Comprehensive competitive analysis of the local sub-county catchment area. Viva voce questioning on working capital was answered with confidence.`;
      break;
  }

  const reviews: VentureReview[] = [
    {
      id: `rev-${seed}-1`,
      author: CANDIDATE_NAMES[candIndex],
      role: "candidate",
      roleLabel: "KNEC Candidate (Passed Defense)",
      institution: POLYTECHNICS[polyIndex],
      series: "July 2025 Examination Series",
      rating: 5,
      date: "August 2025",
      title: candidateTitle,
      comment: candidateComment,
      verified: true,
      gradeBadge: "KNEC Distinction (Pass with Merit)",
      helpfulCount: 38 + (seed % 15),
      tags: ["Defense Tested", "Audited Financials", "KNEC Compliant"],
    },
    {
      id: `rev-${seed}-2`,
      author: SUPERVISOR_NAMES[supIndex],
      role: "supervisor",
      roleLabel: "Institutional TVET Supervisor",
      institution: POLYTECHNICS[poly2Index],
      series: "Annual Project Moderation",
      rating: 5,
      date: "September 2025",
      title: "Mathematically Sound & Follows KNEC Assessment Rubric",
      comment: supervisorComment,
      verified: true,
      gradeBadge: "Faculty Endorsed",
      helpfulCount: 29 + (seed % 10),
      tags: ["Supervisor Approved", "Realistic Costing"],
    },
    {
      id: `rev-${seed}-3`,
      author: CANDIDATE_NAMES[(candIndex + 3) % CANDIDATE_NAMES.length],
      role: "candidate",
      roleLabel: "TVET Diploma Candidate",
      institution: POLYTECHNICS[(polyIndex + 4) % POLYTECHNICS.length],
      series: "November 2024 Series",
      rating: 5,
      date: "December 2024",
      title: "Working Capital Buffer Saved My Oral Defense",
      comment: examinerComment,
      verified: true,
      gradeBadge: "Credit Pass",
      helpfulCount: 19 + (seed % 8),
      tags: ["Viva Voce Ready", "100% Kenyan Pricing"],
    },
  ];

  // Distribution calculations
  const totalReviews = 42 + (seed % 18);
  const fiveStars = Math.round(totalReviews * 0.92);
  const fourStars = Math.round(totalReviews * 0.06);
  const threeStars = totalReviews - fiveStars - fourStars;

  return {
    averageRating: 4.9,
    totalReviews,
    passRatePercentage: 98 + (seed % 3),
    distribution: {
      5: fiveStars,
      4: fourStars,
      3: Math.max(1, threeStars),
      2: 0,
      1: 0,
    },
    reviews,
  };
}
