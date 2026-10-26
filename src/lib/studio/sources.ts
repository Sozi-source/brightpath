/**
 * BrightPath Verified Source Library & Citation Engine
 *
 * Principle: the AI NEVER invents a citation. It may only cite entries in this library,
 * by id. The in-text citation and the APA 7th reference are generated here from fixed
 * metadata, so authors, years, titles and journals cannot be hallucinated.
 *
 * Every `claim` is a short PARAPHRASE of a finding reported in the source (never a
 * verbatim quote). Page numbers are intentionally not included: students must confirm
 * each statement in the actual source before submitting.
 */

export type TopicTag =
  | "child_nutrition"
  | "stunting"
  | "school"
  | "breakfast"
  | "dietary_diversity"
  | "food_security"
  | "iycf"
  | "breastfeeding"
  | "maternal"
  | "ncd"
  | "dietetics"
  | "food_processing"
  | "drying"
  | "sensory"
  | "proximate"
  | "business"
  | "methods"
  | "methods_diet"
  | "methods_anthro"
  | "kenya"
  | "policy";

export type CitationRole = "context" | "literature" | "methods";

export interface SourceClaim {
  /** Paraphrased finding, written as a clause with no citation and no final full stop. */
  text: string;
  roles: CitationRole[];
  /** Optional: only offer this claim in sections whose key starts with one of these. */
  sections?: string[];
}

export interface SourceEntry {
  id: string;
  kind: "book" | "report" | "journal";
  /** APA author string, e.g. "Kennedy, G., Ballard, T., & Dop, M. C." */
  authors: string;
  /** Author part of the in-text citation, e.g. "Kennedy et al." */
  short: string;
  year: number;
  title: string;
  /** Journal name (journal) or publisher (book/report). */
  container: string;
  /** Journal volume(issue), pages. */
  detail?: string;
  /** Edition, e.g. "2nd ed." */
  edition?: string;
  doi?: string;
  topics: TopicTag[];
  claims: SourceClaim[];
}

export interface EvidenceNote {
  source: SourceEntry;
  claim: SourceClaim;
}

export interface CitationInfo {
  id: string;
  inText: string;
  reference: string;
  supports: string[];
}

export const SOURCE_LIBRARY: SourceEntry[] = [
  // ---------------------------------------------------------------- Kenya data
  {
    id: "kdhs2022",
    kind: "report",
    authors: "Kenya National Bureau of Statistics & ICF",
    short: "KNBS & ICF",
    year: 2023,
    title: "Kenya Demographic and Health Survey 2022: Key indicators report",
    container: "KNBS and ICF",
    topics: ["child_nutrition", "stunting", "kenya"],
    claims: [
      {
        text:
          "The 2022 Kenya Demographic and Health Survey estimated that about 18% of children under five years were stunted, 5% were wasted and 10% were underweight",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "kdhs2014",
    kind: "report",
    authors:
      "Kenya National Bureau of Statistics, Ministry of Health, National AIDS Control Council, Kenya Medical Research Institute, National Council for Population and Development, & The DHS Program, ICF International",
    short: "KNBS et al.",
    year: 2015,
    title: "Kenya Demographic and Health Survey 2014",
    container: "KNBS and ICF International",
    topics: ["child_nutrition", "stunting", "kenya"],
    claims: [
      {
        text:
          "The 2014 survey found that roughly one in four Kenyan children under five years (26%) was stunted",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "knap2018",
    kind: "report",
    authors: "Ministry of Health, Republic of Kenya",
    short: "Ministry of Health",
    year: 2018,
    title: "Kenya national nutrition action plan 2018–2022",
    container: "Ministry of Health",
    topics: ["child_nutrition", "maternal", "iycf", "dietary_diversity", "kenya", "policy"],
    claims: [
      {
        text:
          "Kenya's national nutrition action plan sets out multi-sectoral priorities for reducing malnutrition, including better infant and young child feeding and improved dietary quality",
        roles: ["context", "literature"],
      },
    ],
  },
  // ---------------------------------------------------- Food security / diversity
  {
    id: "sofi2023",
    kind: "report",
    authors: "FAO, IFAD, UNICEF, WFP, & WHO",
    short: "FAO et al.",
    year: 2023,
    title:
      "The state of food security and nutrition in the world 2023: Urbanization, agrifood systems transformation and healthy diets across the rural–urban continuum",
    container: "Food and Agriculture Organization of the United Nations",
    doi: "https://doi.org/10.4060/cc3017en",
    topics: ["food_security", "dietary_diversity"],
    claims: [
      {
        text:
          "More than three billion people worldwide could not afford a healthy diet in 2021, which limits dietary quality in low-income settings",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "kennedy2011",
    kind: "report",
    authors: "Kennedy, G., Ballard, T., & Dop, M. C.",
    short: "Kennedy et al.",
    year: 2011,
    title: "Guidelines for measuring household and individual dietary diversity",
    container: "Food and Agriculture Organization of the United Nations",
    topics: ["dietary_diversity", "methods_diet"],
    claims: [
      {
        text:
          "Household dietary diversity is commonly measured by counting the food groups consumed over the previous 24 hours and reflects a household's economic access to a variety of foods",
        roles: ["literature", "methods", "context"],
      },
    ],
  },
  {
    id: "fao2016mddw",
    kind: "report",
    authors: "Food and Agriculture Organization of the United Nations & FHI 360",
    short: "FAO & FHI 360",
    year: 2016,
    title: "Minimum dietary diversity for women: A guide for measurement",
    container: "Food and Agriculture Organization of the United Nations",
    topics: ["dietary_diversity", "maternal", "methods_diet"],
    claims: [
      {
        text:
          "Women aged 15 to 49 years are classed as meeting minimum dietary diversity when they consume at least five of ten defined food groups in the previous day and night",
        roles: ["literature", "methods"],
      },
    ],
  },
  {
    id: "coates2007",
    kind: "report",
    authors: "Coates, J., Swindale, A., & Bilinsky, P.",
    short: "Coates et al.",
    year: 2007,
    title:
      "Household Food Insecurity Access Scale (HFIAS) for measurement of household food access: Indicator guide (Version 3)",
    container: "Food and Nutrition Technical Assistance Project, Academy for Educational Development",
    topics: ["food_security", "methods_diet"],
    claims: [
      {
        text:
          "The Household Food Insecurity Access Scale captures household food access through nine questions about experiences of food insecurity, each followed by a question on how often it occurred",
        roles: ["literature", "methods"],
      },
    ],
  },
  {
    id: "arimond2004",
    kind: "journal",
    authors: "Arimond, M., & Ruel, M. T.",
    short: "Arimond & Ruel",
    year: 2004,
    title: "Dietary diversity is associated with child nutritional status: Evidence from 11 Demographic and Health Surveys",
    container: "The Journal of Nutrition",
    detail: "134(10), 2579–2585",
    doi: "https://doi.org/10.1093/jn/134.10.2579",
    topics: ["dietary_diversity", "child_nutrition", "stunting"],
    claims: [
      {
        text:
          "Analysis of Demographic and Health Surveys from eleven countries found that greater dietary diversity was associated with better child height-for-age in most of the countries studied",
        roles: ["literature", "context"],
      },
    ],
  },
  {
    id: "ruel2003",
    kind: "journal",
    authors: "Ruel, M. T.",
    short: "Ruel",
    year: 2003,
    title: "Operationalizing dietary diversity: A review of measurement issues and research priorities",
    container: "The Journal of Nutrition",
    detail: "133(11), 3911S–3926S",
    doi: "https://doi.org/10.1093/jn/133.11.3911S",
    topics: ["dietary_diversity"],
    claims: [
      {
        text:
          "Dietary diversity is widely regarded as a key element of diet quality and a practical proxy for the adequacy of micronutrient intake",
        roles: ["literature", "context"],
      },
    ],
  },
  // ----------------------------------------------- Child growth, school, feeding
  {
    id: "victora2008",
    kind: "journal",
    authors:
      "Victora, C. G., Adair, L., Fall, C., Hallal, P. C., Martorell, R., Richter, L., & Sachdev, H. S.",
    short: "Victora et al.",
    year: 2008,
    title: "Maternal and child undernutrition: Consequences for adult health and human capital",
    container: "The Lancet",
    detail: "371(9609), 340–357",
    doi: "https://doi.org/10.1016/S0140-6736(07)61692-4",
    topics: ["child_nutrition", "stunting", "school"],
    claims: [
      {
        text:
          "Undernutrition in early life is associated with shorter adult height, lower schooling attainment and reduced economic productivity",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "grantham2007",
    kind: "journal",
    authors:
      "Grantham-McGregor, S., Cheung, Y. B., Cueto, S., Glewwe, P., Richter, L., & Strupp, B.",
    short: "Grantham-McGregor et al.",
    year: 2007,
    title: "Developmental potential in the first 5 years for children in developing countries",
    container: "The Lancet",
    detail: "369(9555), 60–70",
    doi: "https://doi.org/10.1016/S0140-6736(07)60032-4",
    topics: ["child_nutrition", "stunting", "school"],
    claims: [
      {
        text:
          "Stunting and iron deficiency are among the main risk factors that prevent children in developing countries from reaching their developmental potential",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "black2013",
    kind: "journal",
    authors:
      "Black, R. E., Victora, C. G., Walker, S. P., Bhutta, Z. A., Christian, P., de Onis, M., Ezzati, M., Grantham-McGregor, S., Katz, J., Martorell, R., & Uauy, R.",
    short: "Black et al.",
    year: 2013,
    title: "Maternal and child undernutrition and overweight in low-income and middle-income countries",
    container: "The Lancet",
    detail: "382(9890), 427–451",
    doi: "https://doi.org/10.1016/S0140-6736(13)60937-X",
    topics: ["child_nutrition", "stunting", "maternal"],
    claims: [
      {
        text:
          "Undernutrition, including stunting, wasting and micronutrient deficiencies, contributes to a large share of deaths among children under five years",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "adolphus2013",
    kind: "journal",
    authors: "Adolphus, K., Lawton, C. L., & Dye, L.",
    short: "Adolphus et al.",
    year: 2013,
    title: "The effects of breakfast on behavior and academic performance in children and adolescents",
    container: "Frontiers in Human Neuroscience",
    detail: "7, Article 425",
    doi: "https://doi.org/10.3389/fnhum.2013.00425",
    topics: ["school", "breakfast", "child_nutrition"],
    claims: [
      {
        text:
          "Habitual breakfast consumption appears to be positively associated with school performance in children and adolescents, although the quality of the available evidence is limited",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "alderman2012",
    kind: "journal",
    authors: "Alderman, H., & Bundy, D.",
    short: "Alderman & Bundy",
    year: 2012,
    title: "School feeding programs and development: Are we framing the question correctly?",
    container: "The World Bank Research Observer",
    detail: "27(2), 204–221",
    doi: "https://doi.org/10.1093/wbro/lkr005",
    topics: ["school", "food_security", "child_nutrition"],
    claims: [
      {
        text:
          "School feeding programmes can act as a social safety net while also supporting school participation and learning when they are well designed",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "dewey2003",
    kind: "journal",
    authors: "Dewey, K. G., & Brown, K. H.",
    short: "Dewey & Brown",
    year: 2003,
    title:
      "Update on technical issues concerning complementary feeding of young children in developing countries and implications for intervention programs",
    container: "Food and Nutrition Bulletin",
    detail: "24(1), 5–28",
    doi: "https://doi.org/10.1177/156482650302400102",
    topics: ["iycf", "child_nutrition", "stunting"],
    claims: [
      {
        text:
          "Complementary foods in developing countries are often low in energy density and in key micronutrients such as iron and zinc, so food quality and feeding frequency matter for child growth",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "who2021iycf",
    kind: "report",
    authors: "World Health Organization & United Nations Children's Fund",
    short: "WHO & UNICEF",
    year: 2021,
    title: "Indicators for assessing infant and young child feeding practices: Definitions and measurement methods",
    container: "World Health Organization",
    topics: ["iycf", "dietary_diversity", "child_nutrition", "methods_diet"],
    claims: [
      {
        text:
          "Minimum dietary diversity for children aged 6 to 23 months is defined as consuming foods from at least five of eight defined food groups during the previous day",
        roles: ["literature", "methods"],
      },
    ],
  },
  {
    id: "kramer2012",
    kind: "journal",
    authors: "Kramer, M. S., & Kakuma, R.",
    short: "Kramer & Kakuma",
    year: 2012,
    title: "Optimal duration of exclusive breastfeeding",
    container: "Cochrane Database of Systematic Reviews",
    detail: "(8), Article CD003517",
    doi: "https://doi.org/10.1002/14651858.CD003517.pub2",
    topics: ["breastfeeding", "iycf", "child_nutrition"],
    claims: [
      {
        text:
          "Exclusive breastfeeding for six months is associated with a lower risk of gastrointestinal infection in infants than exclusive breastfeeding for three to four months",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "who2006growth",
    kind: "report",
    authors: "WHO Multicentre Growth Reference Study Group",
    short: "WHO Multicentre Growth Reference Study Group",
    year: 2006,
    title:
      "WHO child growth standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age: Methods and development",
    container: "World Health Organization",
    topics: ["stunting", "child_nutrition", "methods_anthro"],
    claims: [
      {
        text:
          "The WHO child growth standards describe how children should grow under optimal conditions and are used internationally to classify stunting, wasting and underweight",
        roles: ["literature", "methods"],
      },
    ],
  },
  // ------------------------------------------------------ Adults / dietetics / NCD
  {
    id: "who2012sodium",
    kind: "report",
    authors: "World Health Organization",
    short: "WHO",
    year: 2012,
    title: "Guideline: Sodium intake for adults and children",
    container: "World Health Organization",
    topics: ["ncd"],
    claims: [
      {
        text:
          "WHO recommends that adults consume less than 2 g of sodium, equivalent to about 5 g of salt, per day",
        roles: ["context", "literature"],
      },
    ],
  },
  {
    id: "mahan2017",
    kind: "book",
    authors: "Mahan, L. K., & Raymond, J. L. (Eds.)",
    short: "Mahan & Raymond",
    year: 2017,
    title: "Krause's food & the nutrition care process",
    edition: "14th ed.",
    container: "Elsevier",
    topics: ["dietetics", "ncd"],
    claims: [
      {
        text:
          "The nutrition care process is a systematic approach in which nutrition assessment, diagnosis, intervention, and monitoring and evaluation guide individual dietary care",
        roles: ["literature", "context"],
      },
    ],
  },
  {
    id: "gibson2005",
    kind: "book",
    authors: "Gibson, R. S.",
    short: "Gibson",
    year: 2005,
    title: "Principles of nutritional assessment",
    edition: "2nd ed.",
    container: "Oxford University Press",
    topics: ["methods_diet", "methods_anthro", "child_nutrition", "dietetics"],
    claims: [
      {
        text:
          "Nutritional status is assessed through anthropometric, biochemical, clinical and dietary methods, which are often combined to give a fuller picture",
        roles: ["literature", "methods"],
      },
    ],
  },
  {
    id: "gibney2009",
    kind: "book",
    authors: "Gibney, M. J., Lanham-New, S. A., Cassidy, A., & Vorster, H. H. (Eds.)",
    short: "Gibney et al.",
    year: 2009,
    title: "Introduction to human nutrition",
    edition: "2nd ed.",
    container: "Wiley-Blackwell",
    topics: ["methods_diet", "dietary_diversity", "dietetics"],
    claims: [
      {
        text:
          "Dietary assessment tools such as the 24-hour recall and the food frequency questionnaire each have strengths and limitations that researchers must weigh when choosing a method",
        roles: ["literature", "methods"],
      },
    ],
  },
  // ---------------------------------------------------------- Food science
  {
    id: "fellows2017",
    kind: "book",
    authors: "Fellows, P. J.",
    short: "Fellows",
    year: 2017,
    title: "Food processing technology: Principles and practice",
    edition: "4th ed.",
    container: "Woodhead Publishing",
    topics: ["food_processing", "drying"],
    claims: [
      {
        text:
          "Drying preserves food by lowering water activity to a level that inhibits microbial growth and slows deteriorative reactions",
        roles: ["context", "literature", "methods"],
      },
    ],
  },
  {
    id: "lawless2010",
    kind: "book",
    authors: "Lawless, H. T., & Heymann, H.",
    short: "Lawless & Heymann",
    year: 2010,
    title: "Sensory evaluation of food: Principles and practices",
    edition: "2nd ed.",
    container: "Springer",
    topics: ["sensory", "food_processing"],
    claims: [
      {
        text:
          "Affective tests with untrained consumers, commonly using the nine-point hedonic scale, are used to measure how acceptable a food product is",
        roles: ["literature", "methods"],
      },
    ],
  },
  {
    id: "aoac2019",
    kind: "book",
    authors: "AOAC International",
    short: "AOAC International",
    year: 2019,
    title: "Official methods of analysis of AOAC International",
    edition: "21st ed.",
    container: "AOAC International",
    topics: ["proximate", "food_processing"],
    claims: [
      {
        text:
          "AOAC official methods provide standardised procedures for determining proximate components such as moisture, protein, fat and ash in foods",
        roles: ["literature", "methods"],
      },
    ],
  },
  // ------------------------------------------------------ Research methods
  {
    id: "mugenda2003",
    kind: "book",
    authors: "Mugenda, O. M., & Mugenda, A. G.",
    short: "Mugenda & Mugenda",
    year: 2003,
    title: "Research methods: Quantitative and qualitative approaches",
    container: "Acts Press",
    topics: ["methods"],
    claims: [
      {
        text:
          "A descriptive research design reports the status of a population or condition as it currently exists without manipulating study variables",
        roles: ["methods"],
        sections: ["ch3.design", "ch3.analysis"],
      },
    ],
  },
  {
    id: "kothari2004",
    kind: "book",
    authors: "Kothari, C. R.",
    short: "Kothari",
    year: 2004,
    title: "Research methodology: Methods and techniques",
    edition: "2nd rev. ed.",
    container: "New Age International",
    topics: ["methods"],
    claims: [
      {
        text:
          "Secondary data refers to information that has already been collected and passed through the statistical process by another agency or researcher, and should be checked for reliability, suitability and adequacy before use",
        roles: ["methods"],
        sections: ["ch3.design", "ch3.sources", "ch3.verification"],
      },
    ],
  },
  {
    id: "creswell2018",
    kind: "book",
    authors: "Creswell, J. W., & Creswell, J. D.",
    short: "Creswell & Creswell",
    year: 2018,
    title: "Research design: Qualitative, quantitative, and mixed methods approaches",
    edition: "5th ed.",
    container: "SAGE Publications",
    topics: ["methods"],
    claims: [
      {
        text:
          "Researchers must uphold ethical integrity by protecting confidentiality, avoiding fabrication of data, and accurately attributing all secondary sources and published works used in a study",
        roles: ["methods"],
        sections: ["ch3.ethics"],
      },
    ],
  },
  // ------------------------------------------------------------- Business
  {
    id: "kotler2018",
    kind: "book",
    authors: "Kotler, P., & Armstrong, G.",
    short: "Kotler & Armstrong",
    year: 2018,
    title: "Principles of marketing",
    edition: "17th ed.",
    container: "Pearson",
    topics: ["business"],
    claims: [
      {
        text:
          "Market segmentation divides a market into groups of buyers with distinct needs so that an offer can be targeted effectively",
        roles: ["context", "literature", "methods"],
      },
    ],
  },
  {
    id: "osterwalder2010",
    kind: "book",
    authors: "Osterwalder, A., & Pigneur, Y.",
    short: "Osterwalder & Pigneur",
    year: 2010,
    title: "Business model generation: A handbook for visionaries, game changers, and challengers",
    container: "John Wiley & Sons",
    topics: ["business"],
    claims: [
      {
        text:
          "A business model describes how an organisation creates, delivers and captures value and can be set out using nine building blocks",
        roles: ["context", "literature", "methods"],
      },
    ],
  },
];

// ------------------------------------------------------------------ formatting

function endWithPeriod(text: string): string {
  return /[.?!]$/.test(text) ? text : `${text}.`;
}

export function formatInText(source: SourceEntry): string {
  return `(${source.short}, ${source.year})`;
}

export function formatReference(source: SourceEntry): string {
  const authors = endWithPeriod(source.authors);
  const title = endWithPeriod(source.title);
  const edition = source.edition ? ` (${source.edition})` : "";
  const doi = source.doi ? ` ${source.doi}` : "";

  if (source.kind === "journal") {
    const detail = source.detail ? `, ${source.detail}` : "";
    return `${authors} (${source.year}). ${title} ${source.container}${detail}.${doi}`;
  }

  const bookTitle = source.title.replace(/[.?!]$/, "");
  const finalTitle = source.title.endsWith("?") ? source.title : bookTitle;
  return `${authors} (${source.year}). ${finalTitle}${edition}. ${source.container}.${doi}`;
}

function sortKey(source: SourceEntry): string {
  return `${source.authors.toLowerCase()}|${source.year}`;
}

export function toCitationInfo(source: SourceEntry, evidence: EvidenceNote[]): CitationInfo {
  return {
    id: source.id,
    inText: formatInText(source),
    reference: formatReference(source),
    supports: evidence.filter((e) => e.source.id === source.id).map((e) => e.claim.text),
  };
}

// ------------------------------------------------------------------- selection

const GENERIC_TOPICS: TopicTag[] = ["kenya", "policy", "methods"];

const TOPIC_KEYWORDS: Partial<Record<TopicTag, string[]>> = {
  child_nutrition: ["child", "infant", "pupil", "under-five", "under five", "under 5", "toddler", "adolescent"],
  stunting: ["stunt", "wasting", "underweight", "growth", "muac", "anthropometr", "malnutrition", "undernutrition"],
  school: ["school", "pupil", "learner", "classroom", "academic", "attendance", "exam"],
  breakfast: ["breakfast"],
  dietary_diversity: ["diversity", "dietary", "food group", "hdds", "food consumption", "diet quality", "balanced diet"],
  food_security: ["food insecurity", "food security", "hunger", "coping", "food access", "skip meal", "food shortage"],
  iycf: ["complementary", "weaning", "iycf", "infant feeding", "young child feeding"],
  breastfeeding: ["breastfeed", "exclusive breast"],
  maternal: ["pregnan", "maternal", "antenatal", "lactating", "mothers", "women"],
  ncd: ["hypertens", "diabet", "blood pressure", "sodium", "salt intake", "obes", "elderly", "non-communicable"],
  dietetics: ["clinical nutrition", "dietitian", "meal plan", "dietary counsel", "nutrition care"],
  food_processing: ["flour", "porridge", "formulat", "dehydrat", "biscuit", "fortif", "blend", "sweet potato", "cassava", "milling", "composite", "extrud"],
  drying: ["drying", "dried", "dehydrat", "solar"],
  sensory: ["sensory", "acceptab", "hedonic", "panel", "taste"],
  proximate: ["proximate", "moisture", "crude protein", "ash content", "fibre", "fiber", "nutrient composition"],
  business: ["business", "enterprise", "customer", "profit", "startup", "capital", "pricing", "market survey"],
};

function detectTopics(text: string): Set<TopicTag> {
  const t = text.toLowerCase();
  const found = new Set<TopicTag>();
  for (const [tag, words] of Object.entries(TOPIC_KEYWORDS) as [TopicTag, string[]][]) {
    if (words.some((w) => t.includes(w))) found.add(tag);
  }
  if (found.has("dietary_diversity") || found.has("food_security")) found.add("methods_diet");
  if (found.has("stunting")) found.add("methods_anthro");
  return found;
}

export function citationRoleFor(sectionKey: string): CitationRole | null {
  const contextKeys = new Set([
    "proposal.title",
    "proposal.problem",
    "proposal.rationale",
    "ch1.background",
    "ch1.problem",
    "ch1.justification",
  ]);
  if (contextKeys.has(sectionKey)) return "context";
  if (sectionKey.startsWith("ch2.") || sectionKey === "ch4.discussion") return "literature";
  if (sectionKey.startsWith("ch3.")) return "methods";

  // Non-research tracks: infer from the key name.
  if (/^(ch\d|proposal|prelim|cover|references|app)/.test(sectionKey)) return null;
  if (/market|background|problem|rationale|justification|overview|industry|customer/.test(sectionKey)) {
    return "context";
  }
  if (/method|design|process|procedure|analysis|sensory|formulat/.test(sectionKey)) return "methods";
  return null;
}

const ROLE_LIMIT: Record<CitationRole, number> = { context: 4, literature: 7, methods: 3 };

export function selectEvidence(params: {
  sectionKey: string;
  text: string;
  title?: string | null;
  problemArea?: string | null;
  workspaceType: string;
}): EvidenceNote[] {
  const role = citationRoleFor(params.sectionKey);
  if (!role) return [];

  const topics = detectTopics(`${params.text} ${params.title ?? ""} ${params.problemArea ?? ""}`);
  if (params.workspaceType === "business_plan") topics.add("business");

  const scored: { note: EvidenceNote; score: number; order: number }[] = [];
  let order = 0;

  for (const source of SOURCE_LIBRARY) {
    const overlap = source.topics.filter((tp) => !GENERIC_TOPICS.includes(tp) && topics.has(tp)).length;
    const isGenericMethods = role === "methods" && source.topics.includes("methods");
    if (overlap === 0 && !isGenericMethods) continue;

    for (const claim of source.claims) {
      order += 1;
      if (!claim.roles.includes(role)) continue;
      if (claim.sections && !claim.sections.some((s) => params.sectionKey.startsWith(s))) continue;
      scored.push({ note: { source, claim }, score: overlap + (isGenericMethods ? 1 : 0), order });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, ROLE_LIMIT[role]).map((s) => s.note);
}

// ----------------------------------------------------------- LLM token handling

const TOKEN_RUN = /(?:\[\[cite:[a-z0-9_]+\]\]\s*)+/gi;

/**
 * Replaces [[cite:id]] tokens with real in-text citations. Unknown ids are stripped,
 * so a hallucinated source can never reach the student's draft.
 */
export function resolveCitationTokens(
  text: string,
  allowedIds: Set<string>
): { text: string; stripped: number } {
  let stripped = 0;
  const byId = new Map(SOURCE_LIBRARY.map((s) => [s.id, s]));

  const resolved = text.replace(TOKEN_RUN, (run) => {
    const ids = Array.from(run.matchAll(/\[\[cite:([a-z0-9_]+)\]\]/gi)).map((m) => m[1].toLowerCase());
    const valid: SourceEntry[] = [];
    for (const id of ids) {
      const src = byId.get(id);
      if (src && allowedIds.has(id) && !valid.includes(src)) valid.push(src);
      else stripped += 1;
    }
    if (valid.length === 0) return "";
    valid.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    return `(${valid.map((s) => `${s.short}, ${s.year}`).join("; ")})`;
  });

  // Tidy spacing left by removed tokens and keep the full stop after the citation.
  const tidy = resolved.replace(/[ \t]+([.,;])/g, "$1").replace(/[ \t]{2,}/g, " ");
  return { text: tidy, stripped };
}

/** Flags percentages in AI output that appear in neither the student's draft nor the source notes. */
export function findUnsupportedFigures(output: string, draft: string, evidence: EvidenceNote[]): string[] {
  const grab = (s: string) => (s.match(/\d+(?:\.\d+)?\s?%/g) ?? []).map((n) => n.replace(/\s/g, ""));
  const allowed = new Set([...grab(draft), ...evidence.flatMap((e) => grab(e.claim.text))]);
  return Array.from(new Set(grab(output))).filter((n) => !allowed.has(n));
}

// ------------------------------------------------------------- audit & references

export function findCitedSources(text: string): SourceEntry[] {
  return SOURCE_LIBRARY.filter((s) => text.includes(`${s.short}, ${s.year}`));
}

/** In-text citations in the text that are not in the verified library (student-written or invented). */
export function auditCitations(text: string): string[] {
  const known = new Set(SOURCE_LIBRARY.map((s) => `${s.short}, ${s.year}`));
  const unknown = new Set<string>();
  const groups = text.matchAll(/\(([^()]*\b(?:19|20)\d{2}[a-z]?[^()]*)\)/g);

  for (const g of groups) {
    for (const rawPart of g[1].split(";")) {
      const part = rawPart.trim().replace(/^(?:e\.g\.,\s*|see\s+)/i, "");
      if (/^[A-Z][\p{L}&.\s'’-]*(?:et al\.)?,\s*(?:19|20)\d{2}[a-z]?$/u.test(part) && !known.has(part)) {
        unknown.add(part);
      }
    }
  }
  return Array.from(unknown);
}

export function compileReferenceList(allTexts: string[]): {
  references: string[];
  unverified: string[];
} {
  const joined = allTexts.join("\n");
  const cited = findCitedSources(joined).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return { references: cited.map(formatReference), unverified: auditCitations(joined) };
}
