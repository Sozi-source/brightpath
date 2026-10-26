import type { SectionDef } from "./trade";

export const RESEARCH_SECONDARY_SECTIONS: SectionDef[] = [
  // --- Proposal Phase ---
  {
    key: "proposal.title",
    title: "Research Title & Rationale",
    phase: "proposal",
    guidance:
      "State a focused research title indicating the target population, geographic scope, secondary survey dataset (e.g. KDHS 1998-2022), and primary indicators. Provide rationale.",
    minWords: 30,
  },
  {
    key: "proposal.problem",
    title: "Statement of the Problem",
    phase: "proposal",
    guidance:
      "Describe the public health, epidemiological, or nutritional trend problem. Identify the policy knowledge gap regarding how these indicators have changed over time.",
    minWords: 60,
  },
  {
    key: "proposal.objectives",
    title: "Research Objectives",
    phase: "proposal",
    guidance:
      "Formulate 3 specific objectives: 1) determine longitudinal trends of the key indicator, 2) compute percentage changes across survey periods, and 3) assess subgroup variations.",
    minWords: 50,
  },
  {
    key: "proposal.rationale",
    title: "Significance & Justification",
    phase: "proposal",
    guidance:
      "Explain how statistical trend analysis on official survey data supports county health planning, national intervention priorities, or clinical guidelines.",
    minWords: 50,
  },

  // --- Project Phase (Unlocked upon Supervisor Approval) ---
  {
    key: "synopsis",
    title: "Executive Synopsis / Abstract",
    phase: "project",
    guidance:
      "Summarize research question, datasets utilized, statistical analytical techniques applied, main percentage point shifts, and core policy takeaways.",
    minWords: 150,
  },
  {
    key: "ack",
    title: "Declaration & Acknowledgements",
    phase: "project",
    guidance:
      "Mandatory KNEC declaration of original candidate analytical work and formal acknowledgement of data custodians (KNBS, DHS, MOH).",
    minWords: 60,
  },
  {
    key: "terms",
    title: "Definition of Operational Terms",
    phase: "project",
    levels: ["diploma"],
    guidance:
      "Define epidemiological and statistical concepts used (e.g. HAZ, WHZ, Z-score, sample standard deviation, percentage point vs percentage change).",
    minWords: 60,
  },
  {
    key: "ch1.background",
    title: "1.1 Background to the Study",
    phase: "project",
    guidance:
      "Provide global, regional, and Kenyan context regarding the nutritional or epidemiological indicator under review.",
    minWords: 200,
  },
  {
    key: "ch1.problem",
    title: "1.2 Statement of the Problem",
    phase: "project",
    guidance:
      "Articulate the persistent burden of the condition and why longitudinal secondary analysis is critical.",
    minWords: 150,
  },
  {
    key: "ch1.objectives",
    title: "1.3 Research Objectives",
    phase: "project",
    guidance:
      "Specify the general research aim and clear, verifiable specific objectives.",
    minWords: 80,
  },
  {
    key: "ch1.questions",
    title: "1.4 Research Questions",
    phase: "project",
    guidance:
      "Provide precise research questions linked directly to your objectives.",
    minWords: 80,
  },
  {
    key: "ch1.justification",
    title: "1.5 Justification of the Study",
    phase: "project",
    guidance:
      "Demonstrate the utility of your findings for health professionals, NGOs, and county planning departments.",
    minWords: 100,
  },
  {
    key: "ch1.scope",
    title: "1.6 Scope and Delimitations",
    phase: "project",
    guidance:
      "State the specific survey years analyzed (e.g. 1998, 2003, 2008, 2014, 2022) and boundary limitations of secondary data.",
    minWords: 80,
  },
  {
    key: "ch2.intro",
    title: "2.1 Introduction to Literature Review",
    phase: "project",
    guidance:
      "Structure the theoretical frameworks and empirical literature review that follows.",
    minWords: 100,
  },
  {
    key: "ch2.background",
    title: "2.2 Theoretical & Conceptual Framework",
    phase: "project",
    guidance:
      "Review UNICEF conceptual framework of malnutrition or relevant health behavior theories.",
    minWords: 250,
  },
  {
    key: "ch2.related",
    title: "2.3 Empirical Literature Review",
    phase: "project",
    guidance:
      "Synthesize previous published studies in Kenya and East Africa regarding trends and determinants.",
    minWords: 250,
  },
  {
    key: "ch2.gap",
    title: "2.4 Critical Gaps in Existing Research",
    phase: "project",
    guidance:
      "Highlight what earlier studies missed regarding longitudinal trajectory or recent KDHS updates.",
    minWords: 100,
  },
  {
    key: "ch3.design",
    title: "3.1 Research Design",
    phase: "project",
    guidance:
      "Detail your descriptive retrospective longitudinal secondary study design.",
    minWords: 150,
  },
  {
    key: "ch3.sources",
    title: "3.2 Data Sources & Official Custodians",
    phase: "project",
    guidance:
      "List every survey report, publisher, publication year, sample size, and public data repository accessed.",
    minWords: 150,
  },
  {
    key: "ch3.variables",
    title: "3.3 Variables & Indicator Definitions",
    phase: "project",
    guidance:
      "Define standard WHO/DHS case definitions for all indicators tracked in the Data Module.",
    minWords: 150,
  },
  {
    key: "ch3.verification",
    title: "3.4 Data Verification & Quality Control",
    phase: "project",
    guidance:
      "Describe cross-checking procedures conducted against original published tables to ensure data integrity.",
    minWords: 120,
  },
  {
    key: "ch3.analysis",
    title: "3.5 Statistical Analysis Methods",
    phase: "project",
    guidance:
      "Specify descriptive statistical methods: mean, median, sample SD, absolute pp change, and average annual change rate.",
    minWords: 150,
  },
  {
    key: "ch3.ethics",
    title: "3.6 Ethical Considerations & Data Attribution",
    phase: "project",
    guidance:
      "State data confidentiality handling, anonymization in secondary archives, and copyright attribution.",
    minWords: 100,
  },
  {
    key: "ch4.results",
    title: "4.1 Descriptive Statistical Results & Trends",
    phase: "project",
    guidance:
      "Present calculated statistical tables and trend charts generated from your verified Data Points module.",
    minWords: 250,
  },
  {
    key: "ch4.discussion",
    title: "4.2 Discussion of Trends & Comparative Analysis",
    phase: "project",
    guidance:
      "Interpret why shifts occurred, linking historical policy milestones (e.g. maternal health programs, devolution) to data trends.",
    minWords: 250,
  },
  {
    key: "ch4.conclusions",
    title: "4.3 Conclusions",
    phase: "project",
    guidance:
      "Draw concise conclusions directly answering each of your original research questions.",
    minWords: 100,
  },
  {
    key: "ch4.recommendations",
    title: "4.4 Policy & Practice Recommendations",
    phase: "project",
    guidance:
      "Provide specific recommendations for Ministry of Health, County Nutrition coordinators, and public health practitioners.",
    minWords: 100,
  },
];
