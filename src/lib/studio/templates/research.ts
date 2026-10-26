import type { SectionDef } from "./trade";

export const RESEARCH_SECONDARY_SECTIONS: SectionDef[] = [
  // ==================== COVER & PRELIMINARY PAGES ====================
  {
    key: "cover.details",
    title: "Project Cover Page",
    phase: "project",
    chapter: "cover",
    chapterTitle: "Cover Page",
    guidance:
      "State institutional heading, research project title, candidate full name, KNEC index/admission number, diploma course, institutional department, supervisor name, and examination series.",
    minWords: 40,
    starterTemplate:
      "INSTITUTION: [Name of TVET Institute / College]\nPROJECT TITLE: [Full Research Title]\nCANDIDATE NAME: [Student Full Name]\nADMISSION NUMBER: [Admission / Registration Number]\nKNEC INDEX NUMBER: [Index Number]\nCOURSE: Diploma in Nutrition and Dietetics\nSUPERVISOR: [Supervisor Name]\nSERIES: [Month, Year Examination Series]",
  },
  {
    key: "prelim.declaration",
    title: "Declaration and Approval",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance:
      "Mandatory KNEC declaration of original candidate analytical work and formal supervisor recommendation for submission.",
    minWords: 60,
    starterTemplate:
      "DECLARATION BY CANDIDATE\nI declare that this research project report is my original work and has not been presented for an examination or award in any other institution.\n\nCandidate Signature: __________________ Date: ______________\n[Candidate Full Name]\n\nAPPROVAL BY SUPERVISOR\nThis research project report has been submitted for examination with my approval as the institutional supervisor.\n\nSupervisor Signature: _________________ Date: ______________\n[Supervisor Full Name]",
  },
  {
    key: "prelim.dedication",
    title: "Dedication",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance: "Candidate's personal dedication to parents, mentors, or inspiring individuals.",
    minWords: 30,
    starterTemplate: "This research work is dedicated to...",
  },
  {
    key: "prelim.acknowledgements",
    title: "Acknowledgements",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance:
      "Formal appreciation to institution leadership, academic trainers, data custodians (KNBS, DHS Program, MOH Kenya), and mentors.",
    minWords: 60,
    starterTemplate:
      "I express my profound gratitude to the Almighty God, my supervisor [Name], and the Kenya National Bureau of Statistics for granting access to public survey archives that made this research possible.",
  },
  {
    key: "prelim.abstract",
    title: "Executive Synopsis / Abstract",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance:
      "Single-spaced summary (150-250 words) synthesizing: 1) research context and problem statement, 2) general and specific objectives, 3) datasets and statistical analytical methods, 4) primary percentage point shifts and risk factors, and 5) core policy recommendations.",
    minWords: 150,
  },
  {
    key: "prelim.toc",
    title: "Table of Contents, Tables, and Figures",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance: "Structured listing of chapters, subheadings, tables, and figures with corresponding page numbers.",
    minWords: 40,
  },
  {
    key: "prelim.acronyms",
    title: "Abbreviations and Acronyms",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages",
    guidance:
      "Alphabetical definitions of epidemiological and institutional acronyms (e.g. KDHS, KNBS, WHO, HAZ, WAZ, WHZ, SAM, MAM, IYCF, MDD, UNICEF, MOH).",
    minWords: 40,
  },

  // ==================== PROPOSAL PHASE ====================
  {
    key: "proposal.title",
    title: "Research Title and Rationale",
    phase: "proposal",
    chapter: "proposal",
    chapterTitle: "Proposal Overview",
    guidance:
      "State a focused research title indicating the target population, geographic scope, survey dataset (e.g. KDHS 1998-2022), and primary indicators. Provide rationale.",
    minWords: 30,
  },
  {
    key: "proposal.problem",
    title: "Statement of the Problem",
    phase: "proposal",
    chapter: "proposal",
    chapterTitle: "Proposal Overview",
    guidance:
      "Describe public health, epidemiological, or nutritional trend problem. Identify the policy knowledge gap regarding how indicators changed over time.",
    minWords: 60,
  },
  {
    key: "proposal.objectives",
    title: "Research Objectives",
    phase: "proposal",
    chapter: "proposal",
    chapterTitle: "Proposal Overview",
    guidance:
      "Formulate 3 specific SMART objectives: 1) determine longitudinal trends of key indicator, 2) compute percentage changes across survey periods, and 3) assess socio-demographic variations.",
    minWords: 50,
  },
  {
    key: "proposal.rationale",
    title: "Significance and Justification",
    phase: "proposal",
    chapter: "proposal",
    chapterTitle: "Proposal Overview",
    guidance:
      "Explain how statistical trend analysis on official survey data supports county health planning, national intervention priorities, or clinical nutrition guidelines.",
    minWords: 50,
  },

  // ==================== CHAPTER 1: INTRODUCTION ====================
  {
    key: "ch1.background",
    title: "1.1 Background to the Study",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Provide global, regional (Sub-Saharan Africa), national (Kenya), and county context regarding the nutritional or epidemiological indicator under review.",
    minWords: 200,
  },
  {
    key: "ch1.problem",
    title: "1.2 Statement of the Problem",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Articulate persistent burden of the condition and why longitudinal secondary analysis is critical to guide county health interventions.",
    minWords: 150,
  },
  {
    key: "ch1.objectives",
    title: "1.3 Research Objectives",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Specify general research aim and 3 verifiable specific objectives (demographic baseline, longitudinal indicator shifts, subgroup determinants).",
    minWords: 80,
  },
  {
    key: "ch1.questions",
    title: "1.4 Research Questions / Hypotheses",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Provide precise research questions linked directly to each specific research objective.",
    minWords: 80,
  },
  {
    key: "ch1.justification",
    title: "1.5 Justification of the Study",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Demonstrate utility of findings for health professionals, Ministry of Health, NGOs, and county nutrition planning departments.",
    minWords: 100,
  },
  {
    key: "ch1.scope",
    title: "1.6 Scope and Delimitations",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "State specific survey rounds analyzed (e.g. KDHS 2003, 2008, 2014, 2022) and boundaries of secondary analytical methodology.",
    minWords: 80,
  },
  {
    key: "ch1.limitations",
    title: "1.7 Limitations and Assumptions",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "State inherent limitations of secondary retrospective datasets (e.g. unmeasured confounders, changes in sampling weights) and operational assumptions.",
    minWords: 80,
  },
  {
    key: "ch1.terms",
    title: "1.8 Definition of Operational Terms",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Define standard WHO epidemiological terms: Height-for-Age Z-score (HAZ/stunting), Weight-for-Height Z-score (WHZ/wasting), Weight-for-Age (WAZ), and Dietary Diversity Score (DDS).",
    minWords: 60,
  },

  // ==================== CHAPTER 2: LITERATURE REVIEW ====================
  {
    key: "ch2.intro",
    title: "2.1 Introduction to Literature Review",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Introduce theoretical frameworks, conceptual relationships, and empirical themes that structure this review.",
    minWords: 100,
  },
  {
    key: "ch2.theoretical",
    title: "2.2 Theoretical Framework",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Review the UNICEF Conceptual Framework of Malnutrition (immediate, underlying, and basic causes) or Social-Ecological Model.",
    minWords: 250,
  },
  {
    key: "ch2.conceptual",
    title: "2.3 Conceptual Framework",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Explain the interaction between independent variables (maternal education, wealth quintile, sanitation), intervening variables (health access), and dependent variables (nutritional status).",
    minWords: 150,
  },
  {
    key: "ch2.empirical",
    title: "2.4 Empirical Literature Review",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Synthesize past published studies in Kenya and East Africa regarding trends and determinants, structured by each specific objective.",
    minWords: 250,
  },
  {
    key: "ch2.gap",
    title: "2.5 Critical Gaps in Existing Research",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Highlight what earlier studies missed regarding county-level devolution effects or recent KDHS updates that this project fills.",
    minWords: 100,
  },

  // ==================== CHAPTER 3: METHODOLOGY ====================
  {
    key: "ch3.design",
    title: "3.1 Research Design",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Detail descriptive retrospective longitudinal secondary study design and analytical protocol.",
    minWords: 150,
  },
  {
    key: "ch3.sources",
    title: "3.2 Data Sources and Official Custodians",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "List survey reports, publishers (KNBS, DHS Program), publication years, sample sizes, and official microdata repositories accessed.",
    minWords: 150,
  },
  {
    key: "ch3.variables",
    title: "3.3 Variables and Indicator Definitions",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Define standard WHO/DHS case definitions for all nutritional and socio-demographic indicators tracked.",
    minWords: 150,
  },
  {
    key: "ch3.verification",
    title: "3.4 Data Verification and Quality Control",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Describe cross-checking procedures conducted against published KNBS national tables to ensure data integrity.",
    minWords: 120,
  },
  {
    key: "ch3.analysis",
    title: "3.5 Statistical Analysis Methods",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Specify descriptive statistical methods: weighted percentages, sample standard deviation, percentage point changes, and annual rates of change.",
    minWords: 150,
  },
  {
    key: "ch3.ethics",
    title: "3.6 Ethical Considerations and Data Attribution",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "State secondary data handling protocols, participant anonymization in public archives, and copyright attribution.",
    minWords: 100,
  },

  // ==================== CHAPTER 4: RESULTS & DISCUSSION ====================
  {
    key: "ch4.results",
    title: "4.1 Descriptive Statistical Results and Trends",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Present calculated statistical tables, percentage point shifts, and trend charts generated from verified survey data.",
    minWords: 250,
  },
  {
    key: "ch4.subgroup",
    title: "4.2 Sub-Group Disparities and Determinant Analysis",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Present cross-tabulated findings by maternal education, household wealth quintile, child sex, and place of residence (urban/rural).",
    minWords: 200,
  },
  {
    key: "ch4.discussion",
    title: "4.3 Discussion of Trends and Comparative Analysis",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Interpret why shifts occurred, linking historical policy milestones (e.g. Free Maternity Services, County Devolution) to trends.",
    minWords: 250,
  },

  // ==================== CHAPTER 5: SUMMARY & RECOMMENDATIONS ====================
  {
    key: "ch5.summary",
    title: "5.1 Summary of Key Findings",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Synthesize major findings directly answering each of your specific research objectives.",
    minWords: 150,
  },
  {
    key: "ch5.conclusions",
    title: "5.2 Conclusions",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Draw concise conclusions directly answering each of original research questions.",
    minWords: 100,
  },
  {
    key: "ch5.recommendations",
    title: "5.3 Policy and Practice Recommendations",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Provide specific recommendations for Ministry of Health, County Nutrition Coordinators, and community health units.",
    minWords: 150,
  },
  {
    key: "ch5.further_research",
    title: "5.4 Recommendations for Further Studies",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Identify emerging areas where primary community surveys or clinical trials are warranted.",
    minWords: 80,
  },

  // ==================== REFERENCES & APPENDICES ====================
  {
    key: "references",
    title: "References",
    phase: "project",
    chapter: "references",
    chapterTitle: "References",
    guidance:
      "Comprehensive list of cited sources formatted strictly according to APA 7th Edition.",
    minWords: 150,
    starterTemplate:
      "REFERENCES\n\nKenya National Bureau of Statistics [KNBS] & ICF. (2023). Kenya Demographic and Health Survey 2022: Key Indicators Report. KNBS and ICF.\n\nMinistry of Health [MOH]. (2020). Kenya National Food and Nutrition Security Policy Implementation Framework. Government of Kenya.\n\nUNICEF & WHO. (2021). Levels and trends in child malnutrition: Key findings of the 2021 edition. World Health Organization.",
  },
  {
    key: "app.datasources",
    title: "Appendix I: Secondary Survey Archive Verification Sheet",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "Appendices",
    guidance: "Catalog of official survey reports, sample sizes, and URLs accessed.",
    minWords: 50,
  },
  {
    key: "app.workplan",
    title: "Appendix II: Project Work Plan (Gantt Chart)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "Appendices",
    guidance: "Research timeline from topic formulation to final report defense.",
    minWords: 40,
  },
  {
    key: "app.budget",
    title: "Appendix III: Research Budget Breakdown (KES)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "Appendices",
    guidance: "Itemized expenditures for data packages, printing, binding, and institutional clearances.",
    minWords: 40,
  },
];
