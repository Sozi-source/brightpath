import type { SectionDef } from "./trade";

export const BUSINESS_PLAN_SECTIONS: SectionDef[] = [
  // --- Proposal Phase ---
  {
    key: "proposal.title",
    title: "Enterprise Title and Commercial Rationale",
    phase: "proposal",
    guidance:
      "State the registered business name, commercial concept, core products/services, and target regional market.",
    minWords: 30,
  },
  {
    key: "proposal.problem",
    title: "Market Need and Consumer Problem",
    phase: "proposal",
    guidance:
      "Explain the exact consumer pain point, affordability challenge, or supply deficit in the target community that this business solves.",
    minWords: 60,
  },
  {
    key: "proposal.objectives",
    title: "Commercial and Operational Objectives",
    phase: "proposal",
    guidance:
      "List SMART business objectives covering production scale, target market share, first-year revenue targets, and break-even timeline.",
    minWords: 50,
  },
  {
    key: "proposal.rationale",
    title: "Economic Feasibility and Justification",
    phase: "proposal",
    guidance:
      "Explain why this commercial enterprise is financially viable and economically beneficial (job creation, local supplier linkages).",
    minWords: 50,
  },

  // --- Project Phase (Unlocked upon Supervisor Approval) ---
  {
    key: "synopsis",
    title: "Executive Summary / Synopsis",
    phase: "project",
    guidance:
      "Concise executive overview of enterprise vision, market opportunity, management team, operational setup, and 3-year financial forecast.",
    minWords: 150,
  },
  // Chapter 1: Business Description
  {
    key: "ch1.name",
    title: "1.1 Business Name and Logo Concept",
    phase: "project",
    guidance: "State the trade name and explain the brand identity and visual logo rationale.",
    minWords: 80,
  },
  {
    key: "ch1.products",
    title: "1.2 Products and Services Offered",
    phase: "project",
    guidance: "Detail specifications, packaging sizes, nutritional value, and unique selling propositions (USPs).",
    minWords: 150,
  },
  {
    key: "ch1.ownership",
    title: "1.3 Form of Business Ownership",
    phase: "project",
    guidance: "State whether Sole Proprietorship or Partnership with capital contribution breakdown.",
    minWords: 80,
  },
  {
    key: "ch1.location",
    title: "1.4 Business Location and Infrastructure",
    phase: "project",
    guidance: "Describe exact premises, transport access, power, clean water, and supplier proximity.",
    minWords: 100,
  },
  {
    key: "ch1.mission",
    title: "1.5 Vision, Mission, and Core Values",
    phase: "project",
    guidance: "State long-term commercial vision, practical mission statement, and guiding values.",
    minWords: 80,
  },
  {
    key: "ch1.legal",
    title: "1.6 Regulatory Compliance and Licenses",
    phase: "project",
    guidance: "Detail County Single Business Permit, Public Health certificate, KRA PIN, and KEBS standardization.",
    minWords: 100,
  },
  {
    key: "ch1.swot",
    title: "1.7 SWOT Analysis",
    phase: "project",
    guidance: "Provide thorough Strengths, Weaknesses, Opportunities, and Threats assessment with mitigation strategies.",
    minWords: 150,
  },
  // Chapter 2: Marketing Plan
  {
    key: "ch2.research",
    title: "2.1 Market Research and Industry Overview",
    phase: "project",
    guidance: "Summarize primary market findings: customer surveys, pricing tolerance, and demand seasonality.",
    minWords: 150,
  },
  {
    key: "ch2.target",
    title: "2.2 Target Market Segmentation",
    phase: "project",
    guidance: "Define demographic profile, institutional buyers, purchasing power, and geographic coverage.",
    minWords: 120,
  },
  {
    key: "ch2.competitors",
    title: "2.3 Competitor Analysis",
    phase: "project",
    guidance: "Analyze direct and indirect competitors on price, quality, distribution, and competitive advantage.",
    minWords: 150,
  },
  {
    key: "ch2.mix",
    title: "2.4 Marketing Strategy (4 Ps)",
    phase: "project",
    guidance: "Detail Product positioning, Pricing strategy, Place/Distribution channels, and Promotion campaigns.",
    minWords: 200,
  },
  {
    key: "ch2.forecast",
    title: "2.5 Sales Forecast and Revenue Projections",
    phase: "project",
    guidance: "Monthly unit volumes and total revenue projections for Year 1, with annual growth for Years 2 and 3.",
    minWords: 150,
  },
  // Chapter 3: Organization & Management Plan
  {
    key: "ch3.structure",
    title: "3.1 Organizational Structure",
    phase: "project",
    guidance: "Define company hierarchy, roles, responsibilities, and reporting lines.",
    minWords: 100,
  },
  {
    key: "ch3.staffing",
    title: "3.2 Key Personnel and Job Specifications",
    phase: "project",
    guidance: "List job requirements, qualifications, and duties for manager, production, and sales staff.",
    minWords: 150,
  },
  {
    key: "ch3.management",
    title: "3.3 Management Team Background",
    phase: "project",
    guidance: "Highlight candidate's technical skills, academic training, and enterprise leadership experience.",
    minWords: 100,
  },
  {
    key: "ch3.remuneration",
    title: "3.4 Remuneration and Staff Benefits",
    phase: "project",
    guidance: "Detail monthly wage schedules, statutory contributions (NSSF, SHA), and incentive bonuses.",
    minWords: 100,
  },
  {
    key: "ch3.preop",
    title: "3.5 Pre-Operational Activities and Budget",
    phase: "project",
    guidance: "Schedule and cost of legal registration, site fitting, trial production, and licensing.",
    minWords: 100,
  },
  // Chapter 4: Operational & Production Plan
  {
    key: "ch4.workflow",
    title: "4.1 Production Process Workflow",
    phase: "project",
    guidance: "Step-by-step description of manufacturing or service delivery with workflow chart.",
    minWords: 150,
  },
  {
    key: "ch4.layout",
    title: "4.2 Facility Layout and Space Allocation",
    phase: "project",
    guidance: "Detail spatial arrangement: raw storage, processing area, quality desk, finished goods bay.",
    minWords: 100,
  },
  {
    key: "ch4.equipment",
    title: "4.3 Machinery, Tools, and Equipment Sourcing",
    phase: "project",
    guidance: "List all processing machinery with supplier quotes, capacity ratings, and depreciation lifespans.",
    minWords: 150,
  },
  {
    key: "ch4.materials",
    title: "4.4 Raw Material Requirements and Sourcing",
    phase: "project",
    guidance: "Quantify raw materials needed per month, unit purchase prices, and reliable supplier contracts.",
    minWords: 150,
  },
  {
    key: "ch4.quality",
    title: "4.5 Quality Control and Waste Management",
    phase: "project",
    guidance: "Protocols for incoming material inspection, sanitation standards, and environmentally safe disposal.",
    minWords: 120,
  },
  {
    key: "ch4.schedule",
    title: "4.6 Production Capacity and Schedule",
    phase: "project",
    guidance: "Daily and monthly throughput schedules meeting forecasted sales volume.",
    minWords: 100,
  },
  // Chapter 5: Financial Plan
  {
    key: "ch5.startup",
    title: "5.1 Pre-Operational Financing and Start-Up Capital",
    phase: "project",
    guidance: "Total initial capital requirements: equipment, working capital, inventory, and legal fees.",
    minWords: 150,
  },
  {
    key: "ch5.assumptions",
    title: "5.2 Key Financial Assumptions",
    phase: "project",
    guidance: "Document growth rates, inflation, loan interest rates, tax rates, and credit terms used.",
    minWords: 100,
  },
  {
    key: "ch5.income",
    title: "5.3 Pro-Forma Income Statement (P&L)",
    phase: "project",
    guidance: "Detailed 3-year projected profit and loss statement with gross margin and net profit after tax.",
    minWords: 150,
  },
  {
    key: "ch5.cashflow",
    title: "5.4 Pro-Forma Cash Flow Statement",
    phase: "project",
    guidance: "Monthly cash inflows and outflows for Year 1 and quarterly for Years 2 and 3 showing cash balance.",
    minWords: 150,
  },
  {
    key: "ch5.balance",
    title: "5.5 Pro-Forma Balance Sheet",
    phase: "project",
    guidance: "Statement of financial position showing Total Assets = Total Liabilities + Owner's Equity.",
    minWords: 120,
  },
  {
    key: "ch5.breakeven",
    title: "5.6 Break-Even Analysis",
    phase: "project",
    guidance: "Calculation of break-even sales volume in units and KES revenue per month and year.",
    minWords: 120,
  },
  {
    key: "ch5.risks",
    title: "5.7 Risk Management and Contingency Plan",
    phase: "project",
    guidance: "Financial, market, and operational risk factors with emergency cash reserves and insurance cover.",
    minWords: 100,
  },
];
