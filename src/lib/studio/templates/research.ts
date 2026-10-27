import type { SectionDef } from "./trade";

export const RESEARCH_SECONDARY_SECTIONS: SectionDef[] = [
  // ==================== CHAPTER 1: INTRODUCTION ====================
  {
    key: "ch1.background",
    title: "1.1 Background to the Study",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Provide global, regional (Sub-Saharan Africa), national (Kenya), and local context on the nutrition topic using verified reports.",
    minWords: 180,
  },
  {
    key: "ch1.problem",
    title: "1.2 Statement of the Problem",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Explain the nutrition challenge, who is affected, and why a descriptive review of existing secondary data is needed.",
    minWords: 120,
  },
  {
    key: "ch1.objectives",
    title: "1.3 Research Objectives",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "State your general objective and 3 straightforward specific objectives based on secondary data.",
    minWords: 70,
  },
  {
    key: "ch1.questions",
    title: "1.4 Research Questions",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Write 3 direct research questions matching your 3 specific objectives.",
    minWords: 60,
  },
  {
    key: "ch1.justification",
    title: "1.5 Justification of the Study",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Explain who benefits from this study (nutritionists, Ministry of Health, schools, community members) and why secondary data is practical.",
    minWords: 90,
  },
  {
    key: "ch1.scope",
    title: "1.6 Scope and Delimitations",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "State the geographic area, target population, and exact secondary reports or registers (e.g. KDHS 2022, KNBS, MOH registers) covered by the study.",
    minWords: 70,
  },
  {
    key: "ch1.limitations",
    title: "1.7 Limitations and Assumptions",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Note practical limitations of relying on secondary data (e.g. fixed variables already recorded in published reports) and how you addressed them.",
    minWords: 70,
  },
  {
    key: "ch1.terms",
    title: "1.8 Definition of Operational Terms",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Define key nutrition terms used in your study (e.g. stunting, wasting, exclusive breastfeeding, dietary diversity, secondary data).",
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
      "Briefly introduce what chapters, books, and official reports are reviewed in this chapter.",
    minWords: 80,
  },
  {
    key: "ch2.theoretical",
    title: "2.2 Theoretical Framework",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Explain the UNICEF Conceptual Framework of Malnutrition (immediate, underlying, and basic causes) or another simple nutrition model.",
    minWords: 180,
  },
  {
    key: "ch2.conceptual",
    title: "2.3 Conceptual Framework",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Explain how your independent variables (e.g. feeding practices, dietary diversity) relate to the dependent variable (nutritional status).",
    minWords: 120,
  },
  {
    key: "ch2.empirical",
    title: "2.4 Empirical Literature Review",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Review findings from real textbooks, WHO/FAO guidelines, KDHS reports, and published studies organized around your 3 objectives.",
    minWords: 200,
  },
  {
    key: "ch2.gap",
    title: "2.5 Summary and Gaps in Literature",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Summarize the reviewed literature and state the simple local summary gap that your descriptive secondary data study addresses.",
    minWords: 80,
  },

  // ==================== CHAPTER 3: METHODOLOGY ====================
  {
    key: "ch3.design",
    title: "3.1 Research Design",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Describe the descriptive cross-sectional research design relying entirely on secondary data and explain why it fits your objectives.",
    minWords: 120,
  },
  {
    key: "ch3.sources",
    title: "3.2 Secondary Data Sources",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Identify the exact secondary data sources used (e.g. KDHS 2022 report, KNBS KIHBS report, MOH KHIS facility registers, school records, or published studies).",
    minWords: 120,
  },
  {
    key: "ch3.variables",
    title: "3.3 Study Variables and Indicators",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "List and define the specific nutrition indicators and demographic variables extracted from the secondary reports.",
    minWords: 120,
  },
  {
    key: "ch3.verification",
    title: "3.4 Data Extraction and Verification",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Explain how you used a data extraction checklist to record figures from the published tables and cross-checked them for accuracy.",
    minWords: 100,
  },
  {
    key: "ch3.analysis",
    title: "3.5 Data Analysis and Presentation",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Explain how the extracted data was organized and summarized using simple descriptive statistics (frequencies, percentages, averages, and tables).",
    minWords: 100,
  },
  {
    key: "ch3.ethics",
    title: "3.6 Ethical Considerations",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Research Methodology",
    guidance:
      "Explain that only anonymized public secondary reports were used (no human interviews) and all sources were properly cited in APA 7th format.",
    minWords: 80,
  },

  // ==================== CHAPTER 4: RESULTS & DISCUSSION ====================
  {
    key: "ch4.results",
    title: "4.1 Presentation of Descriptive Findings",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Present the frequencies, percentages, and summary tables extracted from your secondary data sources for each specific objective.",
    minWords: 200,
  },
  {
    key: "ch4.subgroup",
    title: "4.2 Comparison of Findings by Group or Area",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Compare the extracted figures across demographic groups (e.g. age groups, rural vs. urban residence, or counties).",
    minWords: 150,
  },
  {
    key: "ch4.discussion",
    title: "4.3 Discussion of Findings",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Discuss what your extracted secondary findings mean and compare them with WHO standards and published studies from Chapter 2.",
    minWords: 200,
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

  // ==================== COVER, PRELIMINARY, REFERENCES & APPENDICES ====================
  {
    key: "prelim.abstract",
    title: "Executive Synopsis / Abstract",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Single-spaced summary (150-250 words) synthesizing: 1) research context and problem statement, 2) general and specific objectives, 3) datasets and analytical methods, 4) primary findings, and 5) core policy recommendations.",
    minWords: 150,
  },
  {
    key: "prelim.declaration",
    title: "Declaration and Approval",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
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
    chapterTitle: "Preliminary Pages & Abstract",
    guidance: "Candidate's personal dedication to parents, mentors, or inspiring individuals.",
    minWords: 30,
    starterTemplate: "This research work is dedicated to...",
  },
  {
    key: "prelim.acknowledgements",
    title: "Acknowledgements",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Formal appreciation to institution leadership, academic trainers, data custodians (KNBS, DHS Program, MOH Kenya), and mentors.",
    minWords: 60,
    starterTemplate:
      "I express my profound gratitude to the Almighty God, my supervisor [Name], and the Kenya National Bureau of Statistics for granting access to public survey archives that made this research possible.",
  },
  {
    key: "prelim.acronyms",
    title: "Abbreviations and Acronyms",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Alphabetical definitions of epidemiological and institutional acronyms (e.g. KDHS, KNBS, WHO, HAZ, WAZ, WHZ, SAM, MAM, IYCF, MDD, UNICEF, MOH).",
    minWords: 40,
  },
  {
    key: "references",
    title: "References (APA 7th Edition)",
    phase: "project",
    chapter: "references",
    chapterTitle: "References & Appendices",
    guidance:
      "Comprehensive list of cited sources formatted strictly according to APA 7th Edition.",
    minWords: 150,
    starterTemplate:
      "REFERENCES\n\nKenya National Bureau of Statistics [KNBS] & ICF. (2023). Kenya Demographic and Health Survey 2022: Key Indicators Report. KNBS and ICF.\n\nMinistry of Health [MOH]. (2020). Kenya National Food and Nutrition Security Policy Implementation Framework. Government of Kenya.\n\nUNICEF & WHO. (2021). Levels and trends in child malnutrition: Key findings of the 2021 edition. World Health Organization.",
  },
  {
    key: "app.datasources",
    title: "Appendix I: Secondary Data Extraction Sheet",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Catalog of official survey reports, indicators extracted, sample sizes, and table numbers accessed.",
    minWords: 50,
  },
  {
    key: "app.workplan",
    title: "Appendix II: Project Work Plan (Schedule)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Research timeline from topic formulation to final report defense.",
    minWords: 40,
  },
  {
    key: "app.budget",
    title: "Appendix III: Research Budget Breakdown (KES)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Itemized expenditures for data packages, printing, binding, and institutional clearances.",
    minWords: 40,
  },
];
