export interface SectionDef {
  key: string;
  title: string;
  phase: "proposal" | "project";
  guidance: string;
  rubricMarks?: number;
  levels?: Array<"craft" | "diploma">;
  minWords?: number;
  starterTemplate?: string;
  chapter?: "cover" | "preliminary" | "proposal" | "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "references" | "appendices";
  chapterTitle?: string;
}

export const TRADE_FABRICATION_SECTIONS: SectionDef[] = [
  // ==================== CHAPTER 1: INTRODUCTION ====================
  {
    key: "ch1.background",
    title: "1.1 Background to the Project",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Provide technical and contextual background on the raw materials, nutritional value, and industrial/community relevance in Kenya.",
    minWords: 200,
  },
  {
    key: "ch1.problem",
    title: "1.2 Statement of the Problem",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Formulate the specific technical or nutritional deficiency that necessitates the development of this product.",
    minWords: 150,
  },
  {
    key: "ch1.objectives",
    title: "1.3 Objectives of the Project",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "State the general objective and 3-4 specific operational objectives for formulation, testing, and costing.",
    minWords: 80,
  },
  {
    key: "ch1.questions",
    title: "1.4 Research Questions / Hypotheses",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Formulate questions directly answering each objective regarding acceptability, shelf life, and processing yields.",
    minWords: 80,
  },
  {
    key: "ch1.justification",
    title: "1.5 Justification and Significance",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Highlight socioeconomic, nutritional, or industrial benefits to local communities and processors.",
    minWords: 100,
  },
  {
    key: "ch1.scope",
    title: "1.6 Scope and Delimitations",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Define experimental boundaries, laboratory facilities used, and limitations encountered during fabrication.",
    minWords: 80,
  },
  {
    key: "ch1.terms",
    title: "1.7 Definition of Operational Terms",
    phase: "project",
    chapter: "ch1",
    chapterTitle: "Chapter 1: Introduction",
    guidance:
      "Define technical terms used in the formulation (e.g. proximate composition, hedonic scale, blend ratio, water activity).",
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
      "Introduce literature review themes: raw material chemistry, processing technologies, and quality standards.",
    minWords: 100,
  },
  {
    key: "ch2.background",
    title: "2.2 Theoretical and Nutritional Background",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Review the botanical, physical, and chemical characteristics of your principal ingredients.",
    minWords: 250,
  },
  {
    key: "ch2.processing",
    title: "2.3 Processing Technologies and Preservation",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Review drying, milling, extrusion, fermentation, or preservation technologies applicable to this product.",
    minWords: 200,
  },
  {
    key: "ch2.related",
    title: "2.4 Review of Related Product Formulations",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Critically evaluate past products, published recipes, or formulation attempts by previous researchers.",
    minWords: 250,
  },
  {
    key: "ch2.gap",
    title: "2.5 Knowledge Gaps in Commercial Products",
    phase: "project",
    chapter: "ch2",
    chapterTitle: "Chapter 2: Literature Review",
    guidance:
      "Conclude what is missing in existing commercial products that your prototype specifically resolves.",
    minWords: 100,
  },

  // ==================== CHAPTER 3: METHODOLOGY ====================
  {
    key: "ch3.design",
    title: "3.1 Formulation Design and Recipe Specifications",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "Detail experimental formulation ratios (e.g. 70:30, 60:40 blends) and the food science design rationale.",
    minWords: 150,
  },
  {
    key: "ch3.materials",
    title: "3.2 Raw Materials, Reagents, and Equipment",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "List all ingredients with source locations, alongside technical equipment and testing apparatus used.",
    minWords: 150,
  },
  {
    key: "ch3.procedure",
    title: "3.3 Standard Operating Processing Procedure",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "Provide an explicit, step-by-step procedure from raw sorting, washing, drying, milling, blending to packaging.",
    minWords: 250,
  },
  {
    key: "ch3.safety",
    title: "3.4 Quality Control and Food Safety Protocols (HACCP)",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "Outline hygienic measures, temperature controls, critical control points, and hazard analysis points during processing.",
    minWords: 120,
  },
  {
    key: "ch3.sensory_method",
    title: "3.5 Sensory Evaluation Protocol",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "Detail sensory testing protocol: panelist recruitment, coded sample presentation, 9-point hedonic scale, and testing environment.",
    minWords: 150,
  },
  {
    key: "ch3.lab_method",
    title: "3.6 Proximate Analysis and Laboratory Testing (AOAC)",
    phase: "project",
    chapter: "ch3",
    chapterTitle: "Chapter 3: Formulation Methodology",
    guidance:
      "Specify official standard analytical methods (AOAC) for moisture, crude protein, fat, ash, fiber, and carbohydrate determination.",
    minWords: 150,
  },

  // ==================== CHAPTER 4: RESULTS & DISCUSSION ====================
  {
    key: "ch4.sensory_results",
    title: "4.1 Sensory Evaluation Results",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Present sensory scores (color, aroma, taste, texture, overall acceptability) across experimental blends in formatted tables.",
    minWords: 200,
  },
  {
    key: "ch4.proximate_results",
    title: "4.2 Proximate Composition and Laboratory Findings",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Present proximate nutrient content (moisture %, crude protein %, crude fat %, ash %, fiber %, CHO %, and energy kcal/100g) in clear tables.",
    minWords: 200,
  },
  {
    key: "ch4.discussion",
    title: "4.3 Discussion of Findings",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Discuss why particular blends scored higher, comparing your prototype against Kenya Bureau of Standards (KEBS) and published literature.",
    minWords: 250,
  },
  {
    key: "ch4.cost",
    title: "4.4 Unit Costing and Economic Feasibility",
    phase: "project",
    chapter: "ch4",
    chapterTitle: "Chapter 4: Results and Discussion",
    guidance:
      "Detail direct ingredient costs, processing energy, packaging, labor, and final selling price per retail unit (bill of materials).",
    minWords: 150,
  },

  // ==================== CHAPTER 5: SUMMARY & RECOMMENDATIONS ====================
  {
    key: "ch5.summary",
    title: "5.1 Summary of Findings",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Summarize major proximate, sensory, and economic findings structured directly around each project objective.",
    minWords: 150,
  },
  {
    key: "ch5.conclusions",
    title: "5.2 Conclusions",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Conclude whether the formulated product met the technical specifications and satisfied the core research questions.",
    minWords: 100,
  },
  {
    key: "ch5.recommendations",
    title: "5.3 Recommendations for Commercial Scale-Up",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Offer actionable guidance for institutional kitchens, micro-enterprises, or commercial processors.",
    minWords: 120,
  },
  {
    key: "ch5.further_research",
    title: "5.4 Recommendations for Further Studies",
    phase: "project",
    chapter: "ch5",
    chapterTitle: "Chapter 5: Summary, Conclusions, and Recommendations",
    guidance:
      "Suggest future lines of investigation (e.g. extended real-time shelf life, packaging barriers, clinical efficacy trials).",
    minWords: 80,
  },

  // ==================== PRELIMINARY, REFERENCES & APPENDICES ====================
  {
    key: "prelim.abstract",
    title: "Executive Synopsis / Abstract",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Single-spaced summary (150-250 words) synthesizing: 1) problem context, 2) general and specific objectives, 3) formulation methodology and recipe ratios, 4) key proximate and sensory findings, and 5) primary conclusions.",
    minWords: 150,
  },
  {
    key: "prelim.declaration",
    title: "Declaration and Approval",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Formal KNEC declaration of personal candidate authorship and signed recommendation by institutional supervisor.",
    minWords: 60,
    starterTemplate:
      "DECLARATION BY CANDIDATE\nI declare that this project report is my original work and has not been presented for any examination or award in any other institution.\n\nCandidate Signature: __________________ Date: ______________\n[Candidate Full Name]\n\nAPPROVAL BY SUPERVISOR\nThis project report has been submitted for examination with my approval as the designated institutional supervisor.\n\nSupervisor Signature: _________________ Date: ______________\n[Supervisor Full Name]",
  },
  {
    key: "prelim.dedication",
    title: "Dedication",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance: "Candidate's personal dedication to mentors, family, or inspiring community members.",
    minWords: 30,
    starterTemplate: "This work is dedicated to...",
  },
  {
    key: "prelim.acknowledgements",
    title: "Acknowledgements",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance:
      "Formal appreciation to institution leadership, academic trainers, laboratory technicians, raw material providers, and sensory panelists.",
    minWords: 60,
    starterTemplate:
      "I wish to express sincere gratitude to Almighty God, my supervisor [Name], the Department of Food Science, and the laboratory staff for their guidance and technical support throughout this project.",
  },
  {
    key: "prelim.acronyms",
    title: "Abbreviations and Acronyms",
    phase: "project",
    chapter: "preliminary",
    chapterTitle: "Preliminary Pages & Abstract",
    guidance: "Alphabetical definitions of technical acronyms (e.g. KEBS, HACCP, AOAC, OFSP, RDA).",
    minWords: 40,
  },
  {
    key: "references",
    title: "References (APA 7th Edition)",
    phase: "project",
    chapter: "references",
    chapterTitle: "References & Appendices",
    guidance:
      "Comprehensive list of cited sources formatted strictly according to APA 7th Edition (KEBS standards, peer-reviewed journals, FAO/WHO).",
    minWords: 150,
    starterTemplate:
      "REFERENCES\n\nAOAC. (2019). Official Methods of Analysis of AOAC International (21st ed.). AOAC International.\n\nKenya Bureau of Standards [KEBS]. (2021). Specification for Composite Flour (KS EAS 779:2021). KEBS Nairobi.\n\nMinistry of Health [MOH]. (2020). Kenya National Guidelines for Healthy Diets and Physical Activity. Government of Kenya.",
  },
  {
    key: "app.sensory",
    title: "Appendix I: Sensory Evaluation Score Sheet",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Hedonic 9-point score sheet used by consumer panelists.",
    minWords: 50,
  },
  {
    key: "app.workplan",
    title: "Appendix II: Project Work Plan (Schedule)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Project timeline from topic formulation to final examination report binding.",
    minWords: 40,
  },
  {
    key: "app.budget",
    title: "Appendix III: Project Budget Breakdown (KES)",
    phase: "project",
    chapter: "appendices",
    chapterTitle: "References & Appendices",
    guidance: "Itemized expenditures for raw ingredients, laboratory analysis, stationery, and binding.",
    minWords: 40,
  },
];
