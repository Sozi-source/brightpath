export interface SectionDef {
  key: string;
  title: string;
  phase: "proposal" | "project";
  guidance: string;
  rubricMarks?: number;
  levels?: Array<"craft" | "diploma">;
  minWords?: number;
}

export const TRADE_FABRICATION_SECTIONS: SectionDef[] = [
  // --- Proposal Phase ---
  {
    key: "proposal.title",
    title: "Project Title & Brief Rationale",
    phase: "proposal",
    guidance:
      "State a clear, descriptive, professional title indicating the raw materials, fabrication/formulation method, and target application. Briefly outline the product rationale.",
    minWords: 30,
  },
  {
    key: "proposal.problem",
    title: "Statement of the Problem",
    phase: "proposal",
    guidance:
      "Explain the exact practical or nutritional deficiency, post-harvest challenge, or product gap this project solves. State why existing solutions are inadequate.",
    minWords: 60,
  },
  {
    key: "proposal.objectives",
    title: "Specific Objectives",
    phase: "proposal",
    guidance:
      "List 3 to 4 SMART objectives covering: 1) raw material sourcing & preparation, 2) processing/fabrication trials, 3) quality/sensory testing, and 4) product unit costing.",
    minWords: 50,
  },
  {
    key: "proposal.rationale",
    title: "Justification & Expected Utility",
    phase: "proposal",
    guidance:
      "Explain how the completed fabricated product or food formulation benefits the target community, local agro-processors, or institutional consumers.",
    minWords: 50,
  },

  // --- Project Phase (Unlocked upon Supervisor Approval) ---
  {
    key: "synopsis",
    title: "Executive Synopsis / Abstract",
    phase: "project",
    guidance:
      "Summarize the problem, objectives, processing methods, key sensory/laboratory findings, and primary conclusions in one cohesive page.",
    minWords: 150,
  },
  {
    key: "ack",
    title: "Declaration & Acknowledgements",
    phase: "project",
    guidance:
      "Formal KNEC declaration of personal candidate authorship and appreciation to supervisors, laboratory technicians, and institutions.",
    minWords: 60,
  },
  {
    key: "terms",
    title: "Definition of Operational Terms",
    phase: "project",
    levels: ["diploma"],
    guidance:
      "Define technical parameters and acronyms specific to this project (e.g. OFSP, HACCP, sensory hedonic scale, proximate composition).",
    minWords: 60,
  },
  {
    key: "ch1.background",
    title: "1.1 Background to the Project",
    phase: "project",
    guidance:
      "Provide technical and contextual background on the raw materials, nutritional value, and industrial/community relevance.",
    minWords: 200,
  },
  {
    key: "ch1.problem",
    title: "1.2 Statement of the Problem",
    phase: "project",
    guidance:
      "Formulate the specific technical or nutritional deficiency that necessitates the development of this product.",
    minWords: 150,
  },
  {
    key: "ch1.objectives",
    title: "1.3 Objectives of the Project",
    phase: "project",
    guidance:
      "State the general objective and 3-4 specific operational objectives for fabrication and testing.",
    minWords: 80,
  },
  {
    key: "ch1.questions",
    title: "1.4 Research Questions / Design Hypotheses",
    phase: "project",
    guidance:
      "Formulate questions directly answering each objective regarding acceptability, shelf life, and processing yields.",
    minWords: 80,
  },
  {
    key: "ch1.justification",
    title: "1.5 Justification and Significance",
    phase: "project",
    guidance:
      "Highlight the socioeconomic, nutritional, or industrial benefits to local communities and processors.",
    minWords: 100,
  },
  {
    key: "ch1.scope",
    title: "1.6 Scope and Delimitations",
    phase: "project",
    guidance:
      "Define the experimental boundaries, laboratory facilities used, and limitations encountered during fabrication.",
    minWords: 80,
  },
  {
    key: "ch2.intro",
    title: "2.1 Introduction to Literature Review",
    phase: "project",
    guidance:
      "Introduce the literature review themes: raw material chemistry, processing technologies, and standards.",
    minWords: 100,
  },
  {
    key: "ch2.background",
    title: "2.2 Theoretical & Nutritional Background",
    phase: "project",
    guidance:
      "Review the botanical, physical, and chemical characteristics of your principal ingredients.",
    minWords: 250,
  },
  {
    key: "ch2.related",
    title: "2.3 Review of Related Products and Formulations",
    phase: "project",
    guidance:
      "Critically evaluate past products, published recipes, or fabrication attempts by previous researchers.",
    minWords: 250,
  },
  {
    key: "ch2.gap",
    title: "2.4 Knowledge Gap",
    phase: "project",
    guidance:
      "Conclude what is missing in existing commercial products that your prototype specifically resolves.",
    minWords: 100,
  },
  {
    key: "ch3.design",
    title: "3.1 Formulation Design & Recipe Specifications",
    phase: "project",
    guidance:
      "Detail your formulation ratios (e.g. 70:30, 60:40 blends) and the engineering/food design rationale.",
    minWords: 150,
  },
  {
    key: "ch3.materials",
    title: "3.2 Raw Materials, Reagents & Equipment",
    phase: "project",
    guidance:
      "List all ingredients with source locations, alongside technical equipment and testing apparatus used.",
    minWords: 150,
  },
  {
    key: "ch3.procedure",
    title: "3.3 Standard Operating Fabrication Procedure",
    phase: "project",
    guidance:
      "Provide an explicit, step-by-step procedure from raw sorting, washing, drying, milling, blending to packaging.",
    minWords: 250,
  },
  {
    key: "ch3.safety",
    title: "3.4 Quality Control & Food Safety Protocol",
    phase: "project",
    guidance:
      "Outline hygienic measures, temperature controls, and hazard analysis points during processing.",
    minWords: 120,
  },
  {
    key: "ch3.records",
    title: "3.5 Process Logs & Trial Observations",
    phase: "project",
    guidance:
      "Document observations from trial batches, moisture changes, dough/flour texture, and troubleshooting adjustments.",
    minWords: 150,
  },
  {
    key: "ch4.results",
    title: "4.1 Physical, Sensory & Laboratory Results",
    phase: "project",
    guidance:
      "Present sensory scores (taste, color, aroma, texture, overall acceptability) and proximate results in clear tables.",
    minWords: 200,
  },
  {
    key: "ch4.discussion",
    title: "4.2 Discussion of Findings",
    phase: "project",
    guidance:
      "Discuss why particular blends scored higher, comparing your prototype against KEBS standards and literature.",
    minWords: 250,
  },
  {
    key: "ch4.cost",
    title: "4.3 Unit Costing & Economic Feasibility",
    phase: "project",
    guidance:
      "Detail direct ingredient costs, processing energy, packaging, labor, and final selling price per retail unit.",
    minWords: 150,
  },
  {
    key: "ch4.conclusions",
    title: "4.4 Conclusions",
    phase: "project",
    guidance:
      "Summarize whether the fabricated product met the initial objectives and standards.",
    minWords: 100,
  },
  {
    key: "ch4.recommendations",
    title: "4.5 Recommendations for Commercial Scale-Up",
    phase: "project",
    guidance:
      "Offer actionable guidance for institutional kitchens, micro-enterprises, or future student researchers.",
    minWords: 100,
  },
];
