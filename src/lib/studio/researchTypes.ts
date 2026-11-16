export type ResearchKind = "proposal" | "full";
export type ResearchLevel = "craft" | "diploma";

export type ResearchIdentity =
  | { mode: "master" }
  | {
      mode: "candidate";
      candidateName: string;
      admissionNumber: string;
      institutionName: string;
      supervisorName: string;
      county?: string;
      townOrMarket?: string;
    };

export type ResearchDomain =
  | "child_malnutrition"
  | "iycf_feeding"
  | "maternal_nutrition"
  | "micronutrients"
  | "food_security"
  | "child_health";

export interface ResearchSpecs {
  topicId?: string;
  title: string;
  level: ResearchLevel;
  course: string;
  domain: ResearchDomain;
  indicatorIds: string[];
  yearFrom: number;
  yearTo: number;
  country: string;
  generalObjective: string;
  specificObjectives: string[];
  researchQuestions: string[];
  problemContext?: string;
  dedicationText?: string;
  acknowledgementsText?: string;
  seed: string;
  identity: ResearchIdentity;
  kind?: ResearchKind;
}

export interface ResearchTopicBlueprint {
  id: string;
  title: string;
  domain: ResearchDomain;
  course: string;
  indicatorIds: string[];
  yearFrom: number;
  yearTo: number;
  generalObjective: string;
  specificObjectives: [string, string, string];
  researchQuestions: [string, string, string];
  problemContext: string;
  keyTerms: Array<{ term: string; definition: string }>;
}
