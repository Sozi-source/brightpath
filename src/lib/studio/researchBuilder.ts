/**
 * Deterministic KNEC Secondary-Data Research Project & Proposal Builder.
 * Generates grounded, publication-ready proposals and full 5-chapter reports
 * using verified Kenya secondary indicators from researchDataSnapshot.json.
 */

import type { GeneratedSectionPayload } from "./businessPlanBuilder";
import { fitToPageBudget, countWords } from "./pageBudget";
import {
  computeIndicatorStats,
  filterSeriesByYears,
  getAllResearchIndicators,
  getIndicatorById,
  RESEARCH_SNAPSHOT,
  type DataPoint,
  type IndicatorStats,
  type ResearchIndicator,
} from "./researchData";
import { formatApaReferenceList, getReferenceById } from "./researchReferences";
import { orderBySeed, pickVariant } from "./researchSimilarity";
import { RESEARCH_TOPIC_CATALOGUE } from "./researchTopics";
import type { ResearchKind, ResearchSpecs } from "./researchTypes";

interface ResolvedIdentity {
  candidateName: string;
  admissionNumber: string;
  institutionName: string;
  supervisorName: string;
  townOrMarket: string;
  county: string;
}

interface IndicatorBundle {
  indicator: ResearchIndicator;
  series: DataPoint[];
  stats: IndicatorStats;
}

function resolveIdentity(specs: ResearchSpecs): ResolvedIdentity {
  if (specs.identity.mode === "master") {
    return {
      candidateName: "{{CANDIDATE_NAME}}",
      admissionNumber: "{{ADMISSION_NUMBER}}",
      institutionName: "{{INSTITUTION_NAME}}",
      supervisorName: "{{SUPERVISOR_NAME}}",
      townOrMarket: "{{TARGET_TOWN}}",
      county: "{{TARGET_COUNTY}}",
    };
  }
  return {
    candidateName: specs.identity.candidateName.trim() || "{{CANDIDATE_NAME}}",
    admissionNumber: specs.identity.admissionNumber.trim() || "{{ADMISSION_NUMBER}}",
    institutionName: specs.identity.institutionName.trim() || "{{INSTITUTION_NAME}}",
    supervisorName: specs.identity.supervisorName.trim() || "{{SUPERVISOR_NAME}}",
    townOrMarket: specs.identity.townOrMarket?.trim() || "{{TARGET_TOWN}}",
    county: specs.identity.county?.trim() || "{{TARGET_COUNTY}}",
  };
}

function resolveBundles(specs: ResearchSpecs): IndicatorBundle[] {
  const bundles: IndicatorBundle[] = [];
  for (const id of specs.indicatorIds) {
    const ind = getIndicatorById(id);
    if (!ind || ind.series.length < 3) continue;
    const series = filterSeriesByYears(ind.series, specs.yearFrom, specs.yearTo);
    const stats = computeIndicatorStats(series);
    if (stats) bundles.push({ indicator: ind, series, stats });
  }
  if (bundles.length > 0) return bundles;

  // Fallback to available indicators in the same domain, or first 2 in snapshot
  const pool = getAllResearchIndicators().filter((i) => i.domain === specs.domain && i.series.length >= 3);
  const fallbackPool = pool.length > 0 ? pool : getAllResearchIndicators().filter((i) => i.series.length >= 3);
  for (const ind of fallbackPool.slice(0, 2)) {
    const series = filterSeriesByYears(ind.series, specs.yearFrom, specs.yearTo);
    const stats = computeIndicatorStats(series);
    if (stats) bundles.push({ indicator: ind, series, stats });
  }
  return bundles;
}

function cite(cited: Set<string>, id: string): string {
  const ref = getReferenceById(id);
  if (!ref) return "";
  cited.add(id);
  return ref.inText;
}

function fmtVal(val: number, unit: string): string {
  return unit === "%" ? `${val.toFixed(1)}%` : `${val.toFixed(1)} ${unit}`;
}

function fmtSigned(val: number, unit: string): string {
  const sign = val > 0 ? "+" : "";
  return unit === "%" ? `${sign}${val.toFixed(1)} percentage points` : `${sign}${val.toFixed(1)} ${unit}`;
}

function isEarlyComplementaryTopic(specs: ResearchSpecs): boolean {
  return (
    specs.topicId === "early_complementary_feeding_kenya" ||
    /complementary\s+feeding/i.test(specs.title)
  );
}

function describeTrend(b: IndicatorBundle, specs?: ResearchSpecs): string {
  const { indicator, stats } = b;
  const start = fmtVal(stats.firstValue, indicator.unit);
  const end = fmtVal(stats.lastValue, indicator.unit);
  const chg = fmtSigned(stats.absoluteChange, indicator.unit);
  const pct = stats.percentChange !== null ? ` (${stats.percentChange > 0 ? "+" : ""}${stats.percentChange.toFixed(1)}%)` : "";
  const base = `${indicator.shortLabel} moved from ${start} in ${stats.firstYear} to ${end} in ${stats.lastYear}, a net change of ${chg}${pct}`;
  if (specs && indicator.id === "exclusive_breastfeeding" && isEarlyComplementaryTopic(specs)) {
    const earlyStart = (100 - stats.firstValue).toFixed(1);
    const earlyEnd = (100 - stats.lastValue).toFixed(1);
    return `${base} (corresponding to a shift in estimated early complementary feeding before 6 months from ${earlyStart}% to ${earlyEnd}%)`;
  }
  return base;
}

function makeSection(key: string, title: string, content: string): GeneratedSectionPayload {
  const clean = content.replace(/\n{3,}/g, "\n\n").trim();
  return {
    section_key: key,
    title,
    content: clean,
    wordCount: countWords(clean),
  };
}

function buildPrelims(
  specs: ResearchSpecs,
  id: ResolvedIdentity,
  bundles: IndicatorBundle[],
  cited: Set<string>,
  kind: ResearchKind
): GeneratedSectionPayload[] {
  const seed = specs.seed || specs.title;
  const isDiploma = specs.level === "diploma";
  const levelLabel = isDiploma ? "Diploma" : "Craft Certificate";
  const primary = bundles[0];
  const secondary = bundles[1];

  const declaration = [
    "CANDIDATE'S DECLARATION",
    `I declare that this ${kind === "proposal" ? "research project proposal" : "research project report"} titled \"${specs.title}\" is my original work and that I personally undertook the secondary data compilation and analysis. It has not been presented to any other institution or examination body for any award.`,
    `Name: ${id.candidateName}`,
    `Index / Admission Number: ${id.admissionNumber}`,
    `Course: ${levelLabel} in ${specs.course}`,
    `Institution: ${id.institutionName}`,
    `Location: ${id.townOrMarket}, ${id.county}`,
    "Signature: ______________________________   Date: ______________________________",
    "",
    "SUPERVISOR'S DECLARATION",
    `I confirm that the work reported in this ${kind === "proposal" ? "proposal" : "project report"} is the candidate's original work and that the candidate received appropriate supervision.`,
    `Supervisor Name: ${id.supervisorName}`,
    `Institution: ${id.institutionName} (${id.townOrMarket}, ${id.county})`,
    "Signature: ______________________________   Date: ______________________________",
  ].join("\n\n");

  const dedicationVariants = [
    `This work is dedicated to my family and mentors at ${id.institutionName} (${id.townOrMarket}, ${id.county}) for their steady encouragement throughout my ${levelLabel} studies in ${specs.course}.`,
    `I dedicate this ${kind === "proposal" ? "proposal" : "research report"} to my parents, guardians, and fellow trainees in ${id.county} whose support sustained my academic progress.`,
    `Dedicated to community nutrition practitioners and educators across ${id.county} and Kenya working to improve household health through evidence-based practice.`,
  ];
  const dedication =
    specs.dedicationText?.trim() ||
    pickVariant(`${seed}|dedication`, dedicationVariants);

  const ackVariants = [
    `I express sincere gratitude to my supervisor, ${id.supervisorName}, and the faculty of ${id.institutionName} (${id.townOrMarket}, ${id.county}) for constructive guidance during the development of this ${kind === "proposal" ? "proposal" : "study"}. I also acknowledge the Kenya National Bureau of Statistics, the Ministry of Health, and the World Bank Development Indicators repository for maintaining open public health datasets.`,
    `My heartfelt appreciation goes to ${id.supervisorName} for scholarly mentorship and timely review, and to the administration of ${id.institutionName} in ${id.townOrMarket}, ${id.county} for academic support. Gratitude is also extended to institutional data custodians whose published national indicators made this secondary analysis possible.`,
  ];
  const acknowledgements =
    specs.acknowledgementsText?.trim() ||
    pickVariant(`${seed}|ack`, ackVariants);

  const acronymRows = [
    "| Abbreviation | Full Meaning |",
    "| :--- | :--- |",
    "| APA | American Psychological Association |",
    "| DHS | Demographic and Health Survey |",
    "| FAO | Food and Agriculture Organization |",
    "| KDHS | Kenya Demographic and Health Survey |",
    "| KNBS | Kenya National Bureau of Statistics |",
    "| MOH | Ministry of Health (Kenya) |",
    "| SD | Standard Deviation |",
    "| UNICEF | United Nations Children's Fund |",
    "| WDI | World Development Indicators |",
    "| WHO | World Health Organization |",
  ].join("\n");

  const out: GeneratedSectionPayload[] = [];
  if (kind === "full" && primary) {
    const summarySentence = secondary
      ? `${describeTrend(primary, specs)}, whereas ${describeTrend(secondary, specs)}.`
      : `${describeTrend(primary, specs)}.`;
    const abstractText = [
      `This study examined national trends in ${bundles.map((b) => b.indicator.shortLabel.toLowerCase()).join(" and ")} in ${specs.country} using published secondary data covering ${primary.stats.firstYear} to ${primary.stats.lastYear}.`,
      `${specs.problemContext || ""} The general objective was ${specs.generalObjective.charAt(0).toLowerCase()}${specs.generalObjective.slice(1)}`,
      `A descriptive longitudinal secondary-data design was applied using verified time-series estimates extracted from the World Bank World Development Indicators repository, which compiles harmonized national survey series including Kenya Demographic and Health Surveys and United Nations inter-agency estimates. Data were analysed using descriptive statistics including frequencies, range, arithmetic mean, absolute change, percentage change, and average annual rate of change${isDiploma ? ", supplemented by ordinary least-squares linear trend slopes and period sub-trend comparisons" : ""}.`,
      `Results showed that ${summarySentence} Across the series, ${primary.indicator.shortLabel} recorded a mean of ${fmtVal(primary.stats.mean, primary.indicator.unit)}, peaking at ${fmtVal(primary.stats.maxValue, primary.indicator.unit)} in ${primary.stats.maxYear} and reaching its lowest level of ${fmtVal(primary.stats.minValue, primary.indicator.unit)} in ${primary.stats.minYear}.`,
      `The study concludes that sustained multi-sectoral nutrition and public health interventions remain essential to consolidate gains and address persistent sub-national disparities. It recommends strengthening routine nutrition surveillance, targeting county-level implementation, and conducting primary sub-county follow-up surveys.`,
    ].join("\n\n");
    out.push(makeSection("prelim.abstract", "Executive Synopsis / Abstract", abstractText));
  }

  // Keep references used in abstract? No, KNEC abstract has no references.
  void cited;
  out.push(makeSection("prelim.declaration", "Declaration and Approval", declaration));
  out.push(makeSection("prelim.dedication", "Dedication", dedication));
  out.push(makeSection("prelim.acknowledgements", "Acknowledgements", acknowledgements));
  out.push(makeSection("prelim.acronyms", "Abbreviations and Acronyms", acronymRows));
  return out;
}

function buildChapter1(
  specs: ResearchSpecs,
  id: ResolvedIdentity,
  bundles: IndicatorBundle[],
  cited: Set<string>
): GeneratedSectionPayload[] {
  const seed = specs.seed || specs.title;
  const isDiploma = specs.level === "diploma";
  const primary = bundles[0];
  const secondary = bundles[1];

  const cKdhs22 = cite(cited, "knbs_kdhs_2022");
  const cKdhs14 = cite(cited, "knbs_kdhs_2014");
  const cJme = cite(cited, "unicef_who_wb_jme_2023");
  const cBlack = cite(cited, "black_lancet_2013");
  const cMoh = cite(cited, "moh_kenap_2020");
  const cWdi = cite(cited, "worldbank_wdi_2026");

  const bgOpeners = [
    `Nutrition and early-life health indicators remain central determinants of human capital, cognitive development, and economic productivity in low- and middle-income countries ${cBlack}. Globally, international monitoring agencies track child growth, maternal micronutrient status, and survival outcomes to evaluate progress toward Sustainable Development Goal nutrition targets ${cJme}.`,
    `Adequate nutrition during pregnancy, infancy, and early childhood underpins physical growth, immune competence, and long-term educational attainment ${cBlack}. Across Sub-Saharan Africa, national governments and global partners rely on standardized population surveys to monitor shifts in undernutrition, emerging overweight, and maternal health indicators ${cJme}.`,
    `Population-level nutrition surveillance provides essential evidence for public health planning and resource allocation ${cMoh}. Within East Africa, multi-decade demographic and health surveys have documented gradual progress in several child health indicators alongside persistent structural vulnerabilities ${cKdhs14}.`,
  ];

  const bgKenya = primary
    ? pickVariant(`${seed}|bgKenya`, [
        `In Kenya, national household surveys conducted by the Kenya National Bureau of Statistics in collaboration with the Ministry of Health offer standardized benchmarks across survey waves ${cKdhs14}; ${cKdhs22}. Harmonized series compiled in the World Bank World Development Indicators show that ${primary.indicator.shortLabel} stood at ${fmtVal(primary.stats.firstValue, primary.indicator.unit)} in ${primary.stats.firstYear} and reached ${fmtVal(primary.stats.lastValue, primary.indicator.unit)} by ${primary.stats.lastYear} ${cWdi}.${secondary ? ` Over a comparable period, ${secondary.indicator.shortLabel} shifted from ${fmtVal(secondary.stats.firstValue, secondary.indicator.unit)} in ${secondary.stats.firstYear} to ${fmtVal(secondary.stats.lastValue, secondary.indicator.unit)} in ${secondary.stats.lastYear} ${cWdi}.` : ""}`,
        `Within Kenya, official demographic surveys led by KNBS and the Ministry of Health track population health across successive reporting cycles ${cKdhs22}; ${cKdhs14}. According to World Development Indicators records, ${primary.indicator.shortLabel} changed from ${fmtVal(primary.stats.firstValue, primary.indicator.unit)} (${primary.stats.firstYear}) to ${fmtVal(primary.stats.lastValue, primary.indicator.unit)} (${primary.stats.lastYear}) ${cWdi}.${secondary ? ` During the same window, ${secondary.indicator.shortLabel} moved from ${fmtVal(secondary.stats.firstValue, secondary.indicator.unit)} to ${fmtVal(secondary.stats.lastValue, secondary.indicator.unit)} ${cWdi}.` : ""}`,
        `Kenya's national nutrition surveillance relies on periodic KNBS household surveys and inter-agency harmonized datasets ${cKdhs14}; ${cKdhs22}. Longitudinal records indicate that ${primary.indicator.shortLabel} moved from ${fmtVal(primary.stats.firstValue, primary.indicator.unit)} in ${primary.stats.firstYear} to ${fmtVal(primary.stats.lastValue, primary.indicator.unit)} in ${primary.stats.lastYear} ${cWdi}.${secondary ? ` Concurrently, ${secondary.indicator.shortLabel} shifted from ${fmtVal(secondary.stats.firstValue, secondary.indicator.unit)} to ${fmtVal(secondary.stats.lastValue, secondary.indicator.unit)} ${cWdi}.` : ""}`,
      ])
    : `In Kenya, periodic Demographic and Health Surveys and Ministry of Health frameworks guide national nutrition monitoring ${cKdhs22}; ${cMoh}.`;

  const bgLocal = isDiploma
    ? pickVariant(`${seed}|bgLocalD`, [
        `Despite national policy commitments under the Kenya Nutrition Action Plan, indicator trajectories vary across time, demographic cohorts, and geographic contexts including ${id.county} ${cMoh}. Examining the complete longitudinal series rather than isolated survey years clarifies whether observed improvements are sustained, plateauing, or reversing.`,
        `Although policy frameworks such as the Kenya Nutrition Action Plan prioritize equitable progress, sub-national realities in areas like ${id.county} often diverge from headline averages ${cMoh}. Analysing multi-year series rather than single cross-sections reveals whether gains are durable or stalling.`,
        `While national strategies under the Ministry of Health target steady reductions in malnutrition, outcomes across counties including ${id.county} reflect uneven implementation ${cMoh}. Evaluating full time-series trajectories distinguishes sustained progress from temporary fluctuations.`,
      ])
    : pickVariant(`${seed}|bgLocalC`, [
        `Within training and service settings across ${id.county}, practitioners require clear empirical summaries of how key national indicators have shifted over time ${cMoh}.`,
        `For nutrition trainees and community practitioners in ${id.county}, understanding multi-year national trends provides essential context for local service delivery ${cMoh}.`,
        `Health and nutrition personnel operating in ${id.county} benefit from structured evidence showing how national benchmarks have evolved across recent decades ${cMoh}.`,
  ]);

  const bgPolicy = isDiploma
    ? [
        `At the national policy level, Kenya Vision 2030 and the Kenya Nutrition Action Plan (KNAP) identify maternal, infant, and young child nutrition as foundational pillars for human capital development and universal health coverage ${cMoh}. Following the devolution of healthcare delivery to Kenya's 47 county governments, County Nutrition Coordinators rely on standardized national survey baselines to benchmark local progress, allocate preventive nutrition budgets, and monitor alignment with World Health Assembly (WHA) global nutrition targets.`,
        `Within Kenyan training and clinical institutions, Diploma-level nutritionists and community health practitioners are expected to interpret multi-year surveillance data rather than relying on anecdotal facility impressions. Examining multi-decade trajectories across official datasets clarifies whether national investments in antenatal counselling, primary healthcare, and community health promotion have produced durable population-level shifts or whether structural bottlenecks continue to limit progress ${cKdhs14}; ${cKdhs22}.`,
      ].join("\n\n")
    : "";

  const background = [
    pickVariant(`${seed}|bg1`, bgOpeners),
    bgKenya,
    bgPolicy,
    bgLocal,
  ].filter(Boolean).join("\n\n");

  const problemLead = pickVariant(`${seed}|prob1`, [
    `Although Kenya has invested substantially in maternal and child health services, nutritional and survival disparities continue to pose public health challenges ${cMoh}.`,
    `Public health decision-makers require consistent multi-year evidence to judge whether existing nutrition policies are achieving sustained reductions in population risk ${cKdhs22}.`,
    `Despite expanded primary healthcare programmes across Kenya, persistent nutritional vulnerabilities continue to affect mothers and young children ${cKdhs22}; ${cMoh}.`,
  ]);
  const problemData = primary
    ? pickVariant(`${seed}|probData`, [
        `Published national data demonstrate notable shifts alongside unfinished progress: ${describeTrend(primary, specs)}${secondary ? `, while ${describeTrend(secondary, specs)}` : ""} ${cWdi}.`,
        `Verified time-series records show that ${describeTrend(primary, specs)}${secondary ? `; over the same window, ${describeTrend(secondary, specs)}` : ""} ${cWdi}.`,
        `National estimates reveal mixed momentum: ${describeTrend(primary, specs)}${secondary ? `, whereas ${describeTrend(secondary, specs)}` : ""} ${cWdi}.`,
      ])
    : "";
  const problemGap = `${specs.problemContext || ""} ${pickVariant(`${seed}|probGap`, [
    `Without a structured secondary synthesis comparing indicator magnitudes, peak levels, and rates of change across the full time span, trainees and county nutrition planners rely on fragmented single-year figures rather than coherent trend evidence.`,
    `In the absence of a consolidated multi-year analysis summarizing extremes, averages, and rates of shift, practitioners often interpret isolated survey numbers without historical context.`,
    `Because individual survey reports rarely compute standardized multi-decade trend metrics side by side, a focused secondary review is needed to clarify the pace and direction of change.`,
  ])}`;
  const problemDiploma = isDiploma
    ? `In Kenyan clinical and community nutrition practice, delayed or fragmented interpretation of national trend data undermines timely programmatic adjustments. When health managers rely on a single survey year without examining whether an indicator has been improving, plateauing, or deteriorating over multiple decades, resource allocation between preventive counselling, community outreach, and facility-based interventions risks becoming misaligned with actual epidemiological momentum.`
    : "";
  const problem = [problemLead, problemData, problemGap, problemDiploma].filter(Boolean).join("\n\n");

  const objectives = [
    "### 1.3.1 General Objective",
    specs.generalObjective,
    "### 1.3.2 Specific Objectives",
    specs.specificObjectives.map((o, i) => `${i + 1}. ${o.replace(/^\d+\.\s*/, "")}`).join("\n"),
  ].join("\n\n");

  const questions = specs.researchQuestions
    .map((q, i) => `${i + 1}. ${q.replace(/^\d+\.\s*/, "")}`)
    .join("\n");

  const justPoints = orderBySeed(`${seed}|just`, [
    `Policy and programme utility: Findings provide county nutrition coordinators and Ministry of Health planners with a concise multi-year trend reference aligned with the Kenya Nutrition Action Plan ${cMoh}.`,
    `Academic and professional relevance: The study applies quantitative descriptive analysis to authentic national indicators relevant to ${specs.course} practice.`,
    `Cost-effectiveness and feasibility: Relying on verified public secondary repositories eliminates primary field survey expenses while maintaining high data reliability ${cWdi}.`,
    ...(isDiploma
      ? [
          `Methodological contribution: By pairing multi-year descriptive metrics with linear trend slopes and period sub-trend comparisons, the study demonstrates how secondary surveillance archives can be systematically audited for Diploma-level nutrition research.`,
        ]
      : []),
    ...(isDiploma
      ? [
          `At the institutional level, this research equips Diploma nutrition trainees with practical competencies in secondary data appraisal, descriptive trend computation, and policy translation—skills required by the Kenya Nutritionists and Dietitians Institute (KNDI) and county health departments across Kenya.`,
          `In addition, the study provides a cost-effective, replicable analytical template that future candidates and county health teams can adapt to evaluate other nutrition indicators without incurring primary survey expenditure.`,
        ]
      : []),
  ]);
  const justification = [
    pickVariant(`${seed}|justOpen`, [
      `This study is justified by the need for accessible, accurate trend synthesis derived from official national health and nutrition datasets.`,
      `Synthesizing existing national survey indicators delivers practical value for nutrition education, programme evaluation, and policy advocacy.`,
    ]),
    ...justPoints,
  ].join("\n\n");

  const scope = [
    pickVariant(`${seed}|scope1`, [
      `Geographically, the study covers national-level estimates for ${specs.country} as reported in harmonized international and national statistical series ${cWdi}. The temporal scope spans ${specs.yearFrom} to ${specs.yearTo}, restricted to years with verified published observations.`,
      `The geographic boundary of this inquiry is ${specs.country} at national aggregate level, drawing exclusively on validated statistical archives ${cWdi}. Temporally, the review encompasses ${specs.yearFrom} through ${specs.yearTo} based on available survey and modelled points.`,
      `This analysis is delimited to national estimates for ${specs.country} across the ${specs.yearFrom}-${specs.yearTo} window, using only published years present in official datasets ${cWdi}.`,
    ]),
    pickVariant(`${seed}|scope2`, [
      `Substantively, the analysis is delimited to ${bundles.length} core indicators: ${bundles.map((b) => `${b.indicator.shortLabel} (${b.indicator.wbCode})`).join("; ")}. Primary household interviews, clinical measurements, and raw survey microdata re-estimation fall outside the scope of this project.`,
      `Content-wise, the study examines ${bundles.length} selected indicators (${bundles.map((b) => `${b.indicator.shortLabel} [${b.indicator.wbCode}]`).join(", ")}) without conducting primary fieldwork or re-analysing raw microdata.`,
      `Only ${bundles.length} standardized indicators are included—${bundles.map((b) => `${b.indicator.shortLabel} (${b.indicator.wbCode})`).join("; ")}—excluding primary respondent interviews and laboratory sampling.`,
    ]),
    ...(isDiploma
      ? [
          `Methodologically, the scope is restricted to published, quality-assured time-series estimates retrieved from the World Bank World Development Indicators repository, ensuring that every figure cited in the report is traceable to an official dataset and independently verifiable.`,
        ]
      : []),
  ].join("\n\n");

  const limitations = [
    pickVariant(`${seed}|lim1`, [
      `Reliance on secondary data introduces fixed indicator definitions and periodic reporting intervals, meaning intermediate years without national surveys have no direct observations ${cWdi}. This limitation was mitigated by analyzing only verified reported years without interpolating unmeasured values.`,
      `Using published secondary archives constrains the study to pre-defined indicator formulas and intermittent survey years ${cWdi}. Rather than imputing missing intermediate years, the analysis strictly evaluates reported observations.`,
      `Secondary time series depend on the frequency and definitions of original national surveys, leaving gaps between survey waves ${cWdi}. These gaps were addressed by noting unreported years explicitly and computing metrics solely from verified points.`,
    ]),
    pickVariant(`${seed}|lim2`, [
      `National aggregate series do not capture sub-county or facility-level heterogeneity across areas such as ${id.county}. Accordingly, conclusions are framed at the national level and framed as context rather than county-specific prevalence.`,
      `Because harmonized repositories report national averages, localized variations within counties such as ${id.county} are masked. Findings are therefore interpreted as national benchmarks rather than sub-county prevalence estimates.`,
      `Aggregate country-level figures cannot reflect household or ward-level disparities in ${id.county}, so recommendations distinguish national trends from local primary assessment needs.`,
    ]),
    ...(isDiploma
      ? [
          `In addition, the study assumes that World Bank Development Indicators and Kenya Demographic and Health Survey harmonization procedures maintained consistent age-group definitions and weighting across reporting waves. While minor methodological updates can occur between survey decades, relying exclusively on officially harmonized series minimizes comparability bias and preserves analytical transparency.`,
        ]
      : []),
  ].join("\n\n");

  const blueprint = RESEARCH_TOPIC_CATALOGUE.find((t) => t.id === specs.topicId);
  const termsList = blueprint?.keyTerms || [
    { term: "Secondary Data", definition: "Statistical estimates previously compiled and published by official national or international agencies." },
    { term: "Prevalence", definition: "Proportion of a defined population exhibiting a given health or nutritional condition at a specified time." },
    { term: "Trend Analysis", definition: "Systematic comparison of indicator values across multiple time points to identify direction and pace of change." },
  ];
  const terms = termsList.map((t) => `${t.term}: ${t.definition}`).join("\n\n");

  return [
    makeSection("ch1.background", "1.1 Background to the Study", background),
    makeSection("ch1.problem", "1.2 Statement of the Problem", problem),
    makeSection("ch1.objectives", "1.3 Research Objectives", objectives),
    makeSection("ch1.questions", "1.4 Research Questions", questions),
    makeSection("ch1.justification", "1.5 Justification of the Study", justification),
    makeSection("ch1.scope", "1.6 Scope and Delimitations", scope),
    makeSection("ch1.limitations", "1.7 Limitations and Assumptions", limitations),
    makeSection("ch1.terms", "1.8 Definition of Operational Terms", terms),
  ];
}

function buildChapter2(
  specs: ResearchSpecs,
  bundles: IndicatorBundle[],
  cited: Set<string>
): GeneratedSectionPayload[] {
  const seed = specs.seed || specs.title;
  const isDiploma = specs.level === "diploma";
  const cUnicefFw = cite(cited, "unicef_framework_2020");
  const cWhoGrowth = cite(cited, "who_growth_2006");
  const cBlack = cite(cited, "black_lancet_2013");
  const cKdhs22 = cite(cited, "knbs_kdhs_2022");
  const cKdhs14 = cite(cited, "knbs_kdhs_2014");
  const cJme = cite(cited, "unicef_who_wb_jme_2023");
  const cMoh = cite(cited, "moh_kenap_2020");
  const cWdi = cite(cited, "worldbank_wdi_2026");

  let domainExtraCite = "";
  if (specs.domain === "food_security") domainExtraCite = cite(cited, "fao_sofi_2023");
  if (specs.domain === "maternal_nutrition" || specs.domain === "micronutrients") domainExtraCite = cite(cited, "who_anaemia_2011");
  if (specs.domain === "iycf_feeding") domainExtraCite = cite(cited, "who_iycf_2021");

  const intro = [
    pickVariant(`${seed}|ch2intro`, [
      `This chapter reviews the theoretical foundation, conceptual linkages, empirical literature, and knowledge gaps relevant to ${specs.title}. Literature is drawn from World Health Organization technical standards, UNICEF conceptual models, peer-reviewed global health syntheses, and Kenyan national survey reports.`,
      `Chapter Two synthesizes published conceptual frameworks and empirical findings governing ${bundles.map((b) => b.indicator.shortLabel.toLowerCase()).join(" and ")} in Kenya and comparable settings. The review aligns directly with the study's specific objectives to anchor Chapter Four interpretations.`,
    ]),
    ...(isDiploma
      ? [
          `The literature search prioritized authoritative international technical publications, peer-reviewed epidemiological syntheses, and official Kenyan government survey reports published between 2000 and 2024. Organizing the chapter from broad theoretical foundations through conceptual variable linkages to empirical evidence ensures that the descriptive findings presented in Chapter Four are evaluated against established global and Kenyan benchmarks.`,
        ]
      : []),
  ].join("\n\n");

  const theoretical = [
    pickVariant(`${seed}|th1`, [
      `This study is anchored in the UNICEF Conceptual Framework on Maternal and Child Nutrition ${cUnicefFw}. The framework classifies determinants of nutritional status into immediate, underlying, and basic causes operating across the life course.`,
      `The theoretical foundation draws on the UNICEF Conceptual Framework on Maternal and Child Nutrition, which organizes malnutrition drivers across immediate, underlying, and basic tiers ${cUnicefFw}.`,
      `Analytically, this review is guided by the UNICEF Conceptual Framework on Maternal and Child Nutrition, linking biological, household, and structural determinants of nutrition ${cUnicefFw}.`,
    ]),
    pickVariant(`${seed}|th2`, [
      `Immediate determinants comprise dietary intake and health status, which interact bidirectionally: inadequate nutrient intake lowers immunity, while recurrent infections impair nutrient absorption and growth ${cBlack}. Underlying determinants operate at household and community levels through food security, caregiving and feeding practices, and access to safe water, sanitation, and health services ${cUnicefFw}.`,
      `At the immediate level, nutrient adequacy and disease burden reinforce each other continuously ${cBlack}. At the underlying household level, food access, maternal and child care practices, and environmental sanitation shape exposure to nutritional risk ${cUnicefFw}.`,
      `Individual dietary intake and infectious morbidity act as proximate causes, whereas household food security, feeding behaviours, and healthcare access constitute the underlying pathways ${cBlack}; ${cUnicefFw}.`,
    ]),
    isDiploma
      ? pickVariant(`${seed}|th3D`, [
          `Basic determinants reflect broader socio-economic, governance, agricultural, and environmental structures that govern household resources and service delivery ${cUnicefFw}. Within Kenya's devolved governance framework, county health financing, maternal literacy, and food-system stability operate as basic determinants that condition whether households can translate nutrition knowledge into sustained practice. In addition, standardized evaluation follows World Health Organization technical definitions so that comparisons across survey years remain methodologically valid ${cWhoGrowth}.`,
          `Structural and basic determinants encompass national governance, economic conditions, and resource distribution ${cUnicefFw}. Across Kenya, devolved county health budgets, household income stability, and community health infrastructure shape the enabling environment for optimal maternal and child nutrition. Uniform measurement across survey waves is anchored in World Health Organization reference standards ${cWhoGrowth}.`,
        ])
      : pickVariant(`${seed}|th3C`, [
          `Basic determinants encompass national policy, economic stability, and institutional capacity ${cUnicefFw}. Anthropometric indicators in national surveys apply the WHO Child Growth Standards as a uniform reference ${cWhoGrowth}.`,
          `Broader economic and policy systems form the basic determinants ${cUnicefFw}, while the WHO Child Growth Standards provide the uniform measurement benchmark ${cWhoGrowth}.`,
          `At the structural tier, governance and economic resources shape service reach ${cUnicefFw}, and standardized growth evaluation follows the WHO Child Growth Standards ${cWhoGrowth}.`,
        ]),
    isDiploma
      ? `Applying this three-tier theoretical lens to ${bundles.map((b) => b.indicator.shortLabel.toLowerCase()).join(" and ")} ensures that observed numerical trends in Chapter Four are interpreted not merely as isolated statistical shifts, but as reflections of interacting household, health-service, and policy determinants across Kenya ${cUnicefFw}; ${cBlack}.`
      : "",
  ].filter(Boolean).join("\n\n");

  const conceptualMatrix = isDiploma
    ? [
        "Table 2.0: Conceptual Variable Mapping",
        "| Variable Category | Operational Components in Study | Analytical Role |",
        "| :--- | :--- | :--- |",
        "| Temporal Axis | Survey / reporting year across 1998-2023 | Longitudinal comparison dimension |",
        `| Enabling Health Services | National policy cycles and primary healthcare coverage ${cMoh} | Contextual programme environment |`,
        `| Primary Study Outcomes | ${bundles.map((b) => b.indicator.shortLabel).join("; ")} | Dependent population indicators |`,
      ].join("\n")
    : "";

  const conceptual = [
    pickVariant(`${seed}|con1`, [
      `The conceptual framework links macro-level and household-level enabling factors (independent contextual drivers such as health service coverage, dietary quality, and socio-economic stability) to population-level nutrition and survival indicators (dependent outcomes tracked over time) ${cUnicefFw}.`,
      `Conceptually, enabling health, dietary, and socio-economic environments act as contextual drivers influencing national nutrition and survival outcomes measured across successive survey years ${cUnicefFw}.`,
      `In this conceptual model, shifts in public health coverage, household food access, and care practices manifest over time in measurable population-level nutrition indicators ${cUnicefFw}.`,
    ]),
    pickVariant(`${seed}|con2`, [
      `In this descriptive secondary study, time (survey year) serves as the analytical axis along which indicator trajectories are observed. Rather than testing causal regression with primary household covariates, the conceptual model traces how concurrent indicators move across the ${specs.yearFrom}-${specs.yearTo} policy window ${cMoh}.`,
      `Because the study uses aggregate time-series data, reporting year functions as the primary organizing dimension across ${specs.yearFrom}-${specs.yearTo}, allowing structured comparison of co-occurring national indicators without asserting individual-level causality ${cMoh}.`,
      `Tracking indicators across ${specs.yearFrom}-${specs.yearTo} enables descriptive alignment between national policy cycles and observed outcome trajectories ${cMoh}.`,
    ]),
    isDiploma
      ? `Specifically, the framework treats health-system and policy cycles (such as antenatal nutrition counselling, community health promotion, and national action plan implementation) as intervening contextual processes that mediate how household socio-economic conditions translate into the observed prevalence trajectories of ${bundles.map((b) => b.indicator.shortLabel.toLowerCase()).join(" and ")} ${cMoh}.`
      : "",
    conceptualMatrix,
  ].filter(Boolean).join("\n\n");

  const empBlocks = bundles.map((b, idx) => {
    const num = idx + 1;
    const { indicator } = b;
    const isEarlyCompProxy = indicator.id === "exclusive_breastfeeding" && isEarlyComplementaryTopic(specs);
    const sectionLabel = isEarlyCompProxy
      ? `Early Introduction of Complementary Feeding and ${indicator.shortLabel}`
      : indicator.shortLabel;
    const topicLinkSentence = isEarlyCompProxy
      ? `In the context of early complementary feeding, exclusive breastfeeding under six months serves as the direct inverse epidemiological indicator: infants not exclusively breastfed before six months (100% minus exclusive breastfeeding prevalence) are already receiving early solid, semi-solid, or non-breastmilk liquids.`
      : "";
    const baseEmp = [
      `2.4.${num} ${sectionLabel}`,
      `${indicator.definition} ${topicLinkSentence} Global monitoring syntheses emphasize that sustained progress requires coordinated nutrition-specific and nutrition-sensitive interventions ${cJme}; ${cBlack}.`.replace(/\s{2,}/g, " "),
      `In Kenya, national surveys conducted across multiple waves have documented shifting burdens across rural and urban populations ${cKdhs14}; ${cKdhs22}. ${domainExtraCite ? `Technical guidance highlights standardized measurement definitions and public health severity thresholds to ensure comparability across survey rounds ${domainExtraCite}.` : `Consistent survey methodology enables valid cross-year comparison when indicator definitions remain harmonized ${cWdi}.`}`,
    ];
    if (isDiploma) {
      baseEmp.push(
        `From a Sub-Saharan African regional perspective, longitudinal assessments show that improvements in ${indicator.shortLabel.toLowerCase()} are closely tied to maternal education, health-facility delivery, and consistent primary-care counselling, whereas economic shocks and seasonal food-price spikes can slow or reverse earlier gains ${cBlack}; ${cJme}.`,
        `Empirical syntheses across East Africa further indicate that household wealth quintiles, maternal workload, and community health promoter coverage strongly mediate whether national guidelines translate into sustained household adoption. Cross-country comparisons underscore that gains achieved in one decade can plateau unless counselling quality and supply-chain continuity are maintained across rural and peri-urban clinics ${cJme}.`,
        `Within Kenya's national and county context, successive Demographic and Health Surveys demonstrate marked regional disparities between urban centres, high-potential agricultural zones, and arid and semi-arid counties ${cKdhs14}; ${cKdhs22}. Reviewing the multi-year trajectory of ${indicator.shortLabel.toLowerCase()} provides an empirical baseline for evaluating whether national policies under the Kenya Nutrition Action Plan have translated into measurable population-level shifts ${cMoh}.`,
        `Furthermore, Kenyan operational studies emphasize that facility-based nutrition education must be reinforced by community-level follow-up, father and grandmother engagement, and culturally sensitive dietary counselling if national targets are to be met equitably across all 47 counties ${cMoh}; ${cKdhs22}.`
      );
    }
    return baseEmp.join("\n\n");
  });
  const empiricalTable = isDiploma
    ? [
        "Table 2.1: Summary of Core Conceptual and Empirical Reference Frameworks",
        "| Source | Scope | Core Contribution to Present Study |",
        "| :--- | :--- | :--- |",
        `| UNICEF ${cUnicefFw} | Global | Three-tier framework (immediate, underlying, basic determinants) |`,
        `| Black et al. ${cBlack} | LMICs | Evidence on maternal-child nutrition linkages and long-term outcomes |`,
        `| KNBS et al. ${cKdhs14} | Kenya | Historical national baseline survey estimates and regional patterns |`,
        `| KNBS, MOH, & ICF ${cKdhs22} | Kenya | Recent national benchmarks across Kenya's devolved counties |`,
        `| MOH ${cMoh} | Kenya | Kenya Nutrition Action Plan strategic priorities and targets |`,
      ].join("\n")
    : "";

  const empirical = [orderBySeed(`${seed}|emp`, empBlocks).join("\n\n"), empiricalTable].filter(Boolean).join("\n\n");

  const gap = [
    pickVariant(`${seed}|gap1`, [
      `Reviewed literature establishes clear global standards ${cWhoGrowth}; ${cJme} and provides periodic national snapshots through Kenya Demographic and Health Surveys ${cKdhs14}; ${cKdhs22}. However, individual survey reports typically highlight single-period cross-sectional figures rather than systematically computing multi-year rates of change, extreme values, and cross-indicator comparisons across the complete harmonized series.`,
      `While global reference standards ${cWhoGrowth}; ${cJme} and national KDHS reports ${cKdhs14}; ${cKdhs22} document cross-sectional prevalence in individual years, they seldom synthesize multi-decade rates of change, extreme points, and side-by-side indicator trajectories in one concise analysis.`,
      `Existing reports provide authoritative single-year benchmarks ${cKdhs14}; ${cKdhs22}; ${cJme}, yet trainees and planners lack an integrated descriptive summary comparing long-term pace of change across multiple indicators simultaneously.`,
    ]),
    pickVariant(`${seed}|gap2`, [
      `This study addresses that synthesis gap by compiling verified national observations from ${specs.yearFrom} to ${specs.yearTo} and computing standardized descriptive trend metrics across the selected indicators.`,
      `The present project bridges this gap by assembling verified national points between ${specs.yearFrom} and ${specs.yearTo} and applying uniform trend calculations.`,
      `By consolidating published observations from ${specs.yearFrom} to ${specs.yearTo} into standardized descriptive tables, this study fills that practical synthesis gap.`,
    ]),
    ...(isDiploma
      ? [
          `Three specific gaps emerge from the reviewed literature. First, a temporal synthesis gap exists because official survey reports emphasize point-in-time prevalence rather than annualized rates of change, linear trend slopes, and split-period comparisons across two or more decades. Second, a cross-indicator gap arises when maternal service coverage, feeding practices, and child health outcomes are published in separate chapters without side-by-side comparison. Third, an operational translation gap persists for Diploma-level practitioners and county health teams who require concise, verified trend tables to inform annual county nutrition workplans ${cMoh}.`,
          `By addressing these empirical and methodological gaps using verified harmonized datasets, this study provides a reproducible benchmark for Kenyan nutrition education and county programme evaluation.`,
        ]
      : []),
  ].join("\n\n");

  return [
    makeSection("ch2.intro", "2.1 Introduction to Literature Review", intro),
    makeSection("ch2.theoretical", "2.2 Theoretical Framework", theoretical),
    makeSection("ch2.conceptual", "2.3 Conceptual Framework", conceptual),
    makeSection("ch2.empirical", "2.4 Empirical Literature Review", empirical),
    makeSection("ch2.gap", "2.5 Summary and Gaps in Literature", gap),
  ];
}

function buildChapter3(
  specs: ResearchSpecs,
  bundles: IndicatorBundle[],
  cited: Set<string>
): GeneratedSectionPayload[] {
  const seed = specs.seed || specs.title;
  const isDiploma = specs.level === "diploma";
  const cCreswell = cite(cited, "creswell_2014");
  const cWdi = cite(cited, "worldbank_wdi_2026");

  const design = [
    pickVariant(`${seed}|design`, [
      `This study adopted a descriptive longitudinal secondary-data research design. Descriptive designs systematically document quantitative characteristics and temporal patterns of a population without manipulating variables ${cCreswell}.`,
      `The study employed a quantitative descriptive longitudinal trend design using pre-existing official time-series records ${cCreswell}. No primary fieldwork, questionnaires, or clinical sampling were conducted.`,
    ]),
    `This design is well suited to the study objectives because it permits objective comparison of standardized national indicators across multiple survey years while avoiding primary data-collection costs and respondent burden.`,
    ...(isDiploma
      ? [
          `A longitudinal secondary-data design offers three distinct analytical advantages: first, it preserves standardized indicator definitions across multi-decade survey waves; second, it enables calculation of both point-to-point changes and linear trend slopes without recall bias; and third, it allows transparent verification against published national and United Nations statistical repositories ${cCreswell}; ${cWdi}.`,
          `Unlike cross-sectional primary surveys restricted to a single facility or sub-location, this national secondary design situates observed changes within Kenya's broader demographic and policy timeline, making it directly applicable to county-level benchmarking and programme planning.`,
        ]
      : []),
  ].join("\n\n");

  const sourceTable = [
    "| Indicator | World Bank Code | Primary Custodian / Source | Years Available |",
    "| :--- | :--- | :--- | :--- |",
    ...bundles.map(
      (b) =>
        `| ${b.indicator.shortLabel} | ${b.indicator.wbCode} | ${b.indicator.sourceOrg} | ${b.stats.firstYear}-${b.stats.lastYear} (${b.stats.count} points) |`
    ),
  ].join("\n");

  const sources = [
    `All quantitative series were obtained from the World Bank World Development Indicators repository (${RESEARCH_SNAPSHOT.provider}), which aggregates harmonized national estimates from KNBS Demographic and Health Surveys, UNICEF/WHO/World Bank Joint Malnutrition Estimates, and UN inter-agency estimation groups ${cWdi}.`,
    sourceTable,
  ].join("\n\n");

  const criteriaTable = isDiploma
    ? [
        "Table 3.2: Secondary Data Inclusion and Exclusion Criteria",
        "| Criterion | Inclusion Standard | Exclusion Standard |",
        "| :--- | :--- | :--- |",
        `| Geographic Scope | National estimates for ${specs.country} | Unverified sub-national or non-Kenyan estimates |`,
        `| Temporal Window | Verified observations within ${specs.yearFrom}-${specs.yearTo} | Unreported or interpolated intermediate years |`,
        "| Data Custodian | Official KNBS, WHO, UNICEF, FAO, or World Bank WDI series | Uncited blogs, news summaries, or secondary re-quotes |",
        "| Series Completeness | Indicators with at least 3 non-null reported years | Single-year snapshots lacking longitudinal continuity |",
      ].join("\n")
    : "";

  const variables = [
    `The primary analytical variables comprise time (survey or reporting year) and the quantitative prevalence or rate values of the selected indicators. Inclusion criteria required indicators to pertain to ${specs.country}, use standardized international definitions, and contain at least three non-missing observations within ${specs.yearFrom}-${specs.yearTo}.`,
    ...bundles.map((b) => `${b.indicator.shortLabel} (${b.indicator.unit}): ${b.indicator.definition}`),
    criteriaTable,
  ].filter(Boolean).join("\n\n");

  const verification = [
    pickVariant(`${seed}|ver1`, [
      `Data extraction followed a structured verification protocol. Each indicator series was retrieved directly from the official World Bank API endpoint for Kenya, retaining only verified non-null numerical observations and recording exact units, indicator codes, and retrieval timestamps.`,
      `A systematic verification procedure governed all data extraction: series were pulled from the World Bank API for Kenya, filtering strictly to non-null published entries with documented units and indicator codes.`,
      `To ensure data integrity, each indicator series was extracted directly from the World Bank repository for Kenya, preserving only verified numerical points alongside their exact measurement units.`,
    ]),
    pickVariant(`${seed}|ver2`, [
      `Years lacking published observations were explicitly treated as unreported rather than estimated or interpolated, ensuring complete fidelity to source tables. Extracted values were cross-checked against original indicator definitions before statistical computation.`,
      `Unreported survey years were left blank rather than interpolated, preserving source accuracy. Every value was checked against its official definition prior to analysis.`,
      `Missing intermediate years were not imputed; all summary metrics were computed exclusively from published observations verified against indicator definitions.`,
    ]),
    ...(isDiploma
      ? [
          `Quality assurance was enforced through a four-step audit checklist: (1) verifying that the World Bank indicator code and unit matched the conceptual definition; (2) sorting observations strictly in ascending chronological order; (3) confirming that no duplicate year entries or rounded approximations altered baseline-to-latest differences; and (4) logging exact source URLs and retrieval dates in Appendix I for independent verification.`,
        ]
      : []),
  ].join("\n\n");

  const diplomaStatsDetail = isDiploma
    ? [
        `Specifically, sample standard deviation quantifies dispersion around the multi-year mean; compound annual growth rate (CAGR) captures geometric annualized shift between baseline and latest positive values; and ordinary least-squares (OLS) linear regression estimates the average annual slope across all reported observations, reducing sensitivity to single-year fluctuations.`,
        `In interpreting these quantitative metrics for Kenyan public health planning, positive and negative slopes are evaluated alongside absolute percentage-point changes and public health severity thresholds. Presenting both tabular year-by-year records and aggregated summary statistics ensures analytical transparency and enables county health teams to replicate the calculations directly in standard spreadsheet software.`,
      ].join("\n\n")
    : "";

  const analysis = [
    pickVariant(`${seed}|ana1`, [
      `Extracted time-series data were organized chronologically and analysed using descriptive statistics: observation count (n), arithmetic mean, minimum and maximum values with corresponding years, absolute change (latest minus earliest value), percentage change, and average annual rate of change.`,
      `The verified series were ordered by year and summarized using quantitative descriptive statistics, including sample count, mean, minimum and maximum bounds, net absolute and percentage shifts, and mean annual change.`,
      `Chronological datasets were processed to yield descriptive metrics: number of reported points, arithmetic mean, peak and trough years, overall absolute and relative change, and annualized shift.`,
    ]),
    isDiploma
      ? pickVariant(`${seed}|ana2D`, [
          `For Diploma-level depth, the analysis additionally computed sample standard deviation, compound annual growth rate (CAGR where positive values permit), ordinary least-squares linear trend slope (change per year), and period sub-trend comparisons across early and recent halves of the time series.`,
          `At Diploma level, standard deviation, compound annual growth rate (for positive series), ordinary least-squares linear slope, and early-versus-late period averages were also calculated.`,
          `To satisfy Diploma analytical rigour, the study further computed dispersion (standard deviation), linear regression slope over time, CAGR where applicable, and split-period mean comparisons.`,
        ])
      : pickVariant(`${seed}|ana2C`, [
          `Results are presented in structured Chapter Four summary tables and interpreted directly against the study's research questions.`,
          `Computed figures are displayed in Chapter Four tables and discussed in direct relation to each research question.`,
          `Findings are organized into Chapter Four descriptive tables and linked to the stated study objectives.`,
        ]),
    diplomaStatsDetail,
  ].filter(Boolean).join("\n\n");

  const ethics = [
    pickVariant(`${seed}|eth1`, [
      `Because this research relied exclusively on publicly available, aggregated, and anonymized national statistical datasets, it posed zero risk to human participants and did not require individual informed consent or clinical ethical clearance.`,
      `Since the study utilized only open, aggregated national statistics with no human subjects or personal identifiers, institutional ethical review for human-participant fieldwork was not applicable.`,
      `Relying solely on public, anonymized national statistical archives ensured zero harm or privacy exposure to individuals, eliminating the need for field consent forms.`,
    ]),
    pickVariant(`${seed}|eth2`, [
      `Academic integrity was maintained by reporting all extracted figures accurately without alteration or fabrication, explicitly noting missing survey years, and citing all data custodians and scholarly works in APA 7th edition format.`,
      `Research ethics were upheld through faithful reporting of published numbers without manipulation, transparent disclosure of unreported years, and full APA 7th edition attribution.`,
      `Ethical rigour was observed by preserving exact published values, acknowledging dataset gaps honestly, and crediting every data source and reference in APA 7th style.`,
    ]),
    ...(isDiploma
      ? [
          `Furthermore, the researcher adhered strictly to institutional anti-plagiarism and academic integrity standards by paraphrasing conceptual and empirical literature accurately, avoiding selective reporting of favourable survey years, and documenting every dataset URL and retrieval date so that supervisors and reviewers can independently audit every reported figure.`,
        ]
      : []),
  ].join("\n\n");

  return [
    makeSection("ch3.design", "3.1 Research Design", design),
    makeSection("ch3.sources", "3.2 Secondary Data Sources", sources),
    makeSection("ch3.variables", "3.3 Study Variables and Indicators", variables),
    makeSection("ch3.verification", "3.4 Data Extraction and Verification", verification),
    makeSection("ch3.analysis", "3.5 Data Analysis and Presentation", analysis),
    makeSection("ch3.ethics", "3.6 Ethical Considerations", ethics),
  ];
}

function buildChapter4(
  specs: ResearchSpecs,
  bundles: IndicatorBundle[],
  cited: Set<string>
): GeneratedSectionPayload[] {
  const isDiploma = specs.level === "diploma";
  const cWdi = cite(cited, "worldbank_wdi_2026");
  const cKdhs14 = cite(cited, "knbs_kdhs_2014");
  const cKdhs22 = cite(cited, "knbs_kdhs_2022");
  const cJme = cite(cited, "unicef_who_wb_jme_2023");
  const cMoh = cite(cited, "moh_kenap_2020");

  // 4.1 Presentation of Descriptive Findings
  const resultsBlocks: string[] = [
    `This chapter presents descriptive findings extracted from verified national secondary data series for ${specs.country} ${cWdi}. Each indicator is tabulated across all reported years alongside computed summary statistics.`,
  ];

  bundles.forEach((b, idx) => {
    const { indicator, series, stats } = b;
    const tableNum = `Table 4.${idx + 1}`;
    resultsBlocks.push(`4.1.${idx + 1} ${indicator.shortLabel}`);
    resultsBlocks.push(`${tableNum}: Reported ${indicator.shortLabel} in Kenya (${stats.firstYear}-${stats.lastYear})`);
    const seriesRows = [
      `| Year | ${indicator.shortLabel} (${indicator.unit}) | Change from Previous Observation |`,
      `| :--- | :--- | :--- |`,
      ...series.map((pt, i) => {
        const diff = i === 0 ? "Baseline" : fmtSigned(Math.round((pt.value - series[i - 1].value) * 10) / 10, indicator.unit);
        return `| ${pt.year} | ${fmtVal(pt.value, indicator.unit)} | ${diff} |`;
      }),
    ].join("\n");
    resultsBlocks.push(seriesRows);

    const summaryStatsText = [
      `Across ${stats.count} reported observations between ${stats.firstYear} and ${stats.lastYear}, ${describeTrend(b, specs)}.`,
      `The series averaged ${fmtVal(stats.mean, indicator.unit)}, ranging from a low of ${fmtVal(stats.minValue, indicator.unit)} in ${stats.minYear} to a peak of ${fmtVal(stats.maxValue, indicator.unit)} in ${stats.maxYear}, with an average annual shift of ${stats.avgAnnualChange > 0 ? "+" : ""}${stats.avgAnnualChange} per year.`,
      indicator.id === "exclusive_breastfeeding" && isEarlyComplementaryTopic(specs)
        ? `Interpreted through the study's complementary feeding lens, the change in exclusive breastfeeding from ${fmtVal(stats.firstValue, indicator.unit)} (${stats.firstYear}) to ${fmtVal(stats.lastValue, indicator.unit)} (${stats.lastYear}) corresponds to a reduction in estimated early introduction of complementary foods or liquids before six months from ${(100 - stats.firstValue).toFixed(1)}% to ${(100 - stats.lastValue).toFixed(1)}%.`
        : "",
      isDiploma
        ? `Linear trend estimation yielded an ordinary least-squares slope of ${stats.linearSlopePerYear > 0 ? "+" : ""}${stats.linearSlopePerYear} per year (SD = ${stats.stdDev})${stats.cagrPercent !== null ? ` and a compound annual rate of ${stats.cagrPercent > 0 ? "+" : ""}${stats.cagrPercent}% per year` : ""}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    resultsBlocks.push(summaryStatsText);
    if (isDiploma) {
      const volatilityNote = stats.stdDev > 0
        ? `Dispersion across the ${stats.count} observations (SD = ${stats.stdDev}) indicates ${stats.stdDev > 5 ? "substantial inter-survey variation" : "moderate temporal stability"} around the long-term mean of ${fmtVal(stats.mean, indicator.unit)}.`
        : "";
      resultsBlocks.push(
        `From a longitudinal surveillance standpoint, ${indicator.shortLabel} recorded an overall ${stats.direction} shift of ${fmtSigned(stats.absoluteChange, indicator.unit)} across the ${stats.yearSpan}-year span between ${stats.firstYear} and ${stats.lastYear}. ${volatilityNote} Monitoring both the point-to-point extremes (${fmtVal(stats.minValue, indicator.unit)} in ${stats.minYear} vs. ${fmtVal(stats.maxValue, indicator.unit)} in ${stats.maxYear}) and the OLS linear slope (${stats.linearSlopePerYear > 0 ? "+" : ""}${stats.linearSlopePerYear} per year) ensures that policy conclusions reflect the underlying trend rather than a single survey year.`
      );
    }
  });

  // 4.2 Comparison of Findings
  const compTableNum = `Table 4.${bundles.length + 1}`;
  const compHeader = isDiploma
    ? "| Indicator | Period | Baseline | Latest | Net Change | Mean (SD) | Linear Slope/Yr | Direction |"
    : "| Indicator | Period | Baseline | Latest | Net Change | Mean | Direction |";
  const compAlign = isDiploma
    ? "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    : "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |";
  const compRows = bundles.map((b) => {
    const s = b.stats;
    const u = b.indicator.unit;
    const net = `${s.absoluteChange > 0 ? "+" : ""}${s.absoluteChange.toFixed(1)}${s.percentChange !== null ? ` (${s.percentChange > 0 ? "+" : ""}${s.percentChange.toFixed(1)}%)` : ""}`;
    return isDiploma
      ? `| ${b.indicator.shortLabel} | ${s.firstYear}-${s.lastYear} | ${fmtVal(s.firstValue, u)} | ${fmtVal(s.lastValue, u)} | ${net} | ${fmtVal(s.mean, u)} (${s.stdDev}) | ${s.linearSlopePerYear > 0 ? "+" : ""}${s.linearSlopePerYear} | ${s.direction} |`
      : `| ${b.indicator.shortLabel} | ${s.firstYear}-${s.lastYear} | ${fmtVal(s.firstValue, u)} | ${fmtVal(s.lastValue, u)} | ${net} | ${fmtVal(s.mean, u)} | ${s.direction} |`;
  });

  const subgroupBlocks: string[] = [
    `Cross-indicator comparison reveals the relative pace and direction of change across the analysed series.`,
    `${compTableNum}: Cross-Indicator Summary Comparison (${specs.country})`,
    [compHeader, compAlign, ...compRows].join("\n"),
  ];

  if (bundles.length >= 2) {
    const first = bundles[0];
    const second = bundles[1];
    subgroupBlocks.push(
      `Comparing ${first.indicator.shortLabel} (${first.stats.direction} by ${fmtSigned(first.stats.absoluteChange, first.indicator.unit)}) with ${second.indicator.shortLabel} (${second.stats.direction} by ${fmtSigned(second.stats.absoluteChange, second.indicator.unit)}) demonstrates ${first.stats.direction === second.stats.direction ? "parallel movement in the same direction" : "divergent trajectories across the two nutrition dimensions"} over the observed period.`
    );
  }

  if (isDiploma) {
    const subTrendRows: string[] = [];
    for (const b of bundles) {
      const mid = Math.floor(b.series.length / 2);
      const earlyMean = Math.round((b.series.slice(0, mid).reduce((a, p) => a + p.value, 0) / Math.max(1, mid)) * 10) / 10;
      const lateCount = Math.max(1, b.series.length - mid);
      const lateMean = Math.round((b.series.slice(mid).reduce((a, p) => a + p.value, 0) / lateCount) * 10) / 10;
      const diff = Math.round((lateMean - earlyMean) * 10) / 10;
      const earlySpan = `${b.series[0].year}-${b.series[mid - 1]?.year ?? b.series[0].year}`;
      const lateSpan = `${b.series[mid].year}-${b.series[b.series.length - 1].year}`;
      subTrendRows.push(`| ${b.indicator.shortLabel} | ${earlySpan} (${fmtVal(earlyMean, b.indicator.unit)}) | ${lateSpan} (${fmtVal(lateMean, b.indicator.unit)}) | ${diff > 0 ? "+" : ""}${diff.toFixed(1)} |`);
      subgroupBlocks.push(
        `Period sub-trend for ${b.indicator.shortLabel}: the earlier half (${earlySpan}) averaged ${fmtVal(earlyMean, b.indicator.unit)}, compared with ${fmtVal(lateMean, b.indicator.unit)} in the more recent half (${lateSpan}), representing a ${diff > 0 ? "+" : ""}${diff.toFixed(1)} shift between periods.`
      );
    }
    subgroupBlocks.push(
      `Table 4.${bundles.length + 2}: Early vs. Recent Period Mean Comparison`,
      "| Indicator | Earlier Period Mean | Recent Period Mean | Inter-Period Shift |",
      "| :--- | :--- | :--- | :--- |",
      ...subTrendRows,
      `Splitting each time series into earlier and recent halves provides an additional robustness check beyond overall baseline-to-latest differences. Where the inter-period shift aligns in sign with the ordinary least-squares linear slope reported in Table 4.${bundles.length + 1}, the observed trajectory reflects a sustained structural shift across survey waves rather than a temporary anomaly in a single reporting year. County nutrition coordinators and Ministry of Health planners can therefore treat these multi-year patterns as reliable programmatic baselines when setting medium-term county nutrition targets.`
    );
  }

  const objectiveDiscussion = isDiploma
    ? specs.specificObjectives.map(
        (obj, idx) =>
          `Objective ${idx + 1} Synthesis (${obj.replace(/^\d+\.\s*/, "")}): The compiled evidence demonstrates that addressing this objective requires viewing national prevalence shifts alongside health-system capacity and household socio-economic resilience in Kenya ${cKdhs22}; ${cMoh}. Rather than treating single-year estimates in isolation, Diploma-level nutritionists must evaluate multi-year momentum when designing county-level advocacy, maternal counselling, and community outreach strategies.`
      )
    : [];

  // 4.3 Discussion of Findings
  const discussionBlocks: string[] = [
    `The observed national trajectories align broadly with Kenya's multi-decade nutrition and child health transition documented in KDHS reports ${cKdhs22} and international malnutrition monitoring ${cJme}.`,
    ...bundles.map((b) => {
      const { indicator, stats } = b;
      const interp =
        stats.direction === "decreasing"
          ? `The downward trajectory in ${indicator.shortLabel} from ${fmtVal(stats.firstValue, indicator.unit)} to ${fmtVal(stats.lastValue, indicator.unit)} reflects cumulative gains from expanded primary healthcare, nutrition counselling, and national policy implementation ${cMoh}.`
          : stats.direction === "increasing"
            ? `The upward movement in ${indicator.shortLabel} from ${fmtVal(stats.firstValue, indicator.unit)} to ${fmtVal(stats.lastValue, indicator.unit)} highlights an expanding challenge or shift in coverage requiring targeted programmatic attention ${cJme}.`
            : `The relative stability of ${indicator.shortLabel} around a mean of ${fmtVal(stats.mean, indicator.unit)} suggests structural persistence that routine interventions have not yet substantially altered ${cMoh}.`;
      const diplomaExt = isDiploma
        ? ` Examining the full observation window (${stats.firstYear}-${stats.lastYear}), the spread between the peak of ${fmtVal(stats.maxValue, indicator.unit)} (${stats.maxYear}) and the lowest recorded level of ${fmtVal(stats.minValue, indicator.unit)} (${stats.minYear}) illustrates how national outcomes respond gradually to multi-year health-system investments, economic cycles, and community outreach intensity ${cKdhs14}; ${cKdhs22}. For Kenyan nutrition practitioners and county health planners, this longitudinal perspective reinforces the importance of sustaining preventive services even after initial progress is recorded, rather than shifting resources away prematurely.`
        : "";
      return `${interp} Consistent with the UNICEF conceptual framework, sustained improvement depends on addressing both immediate dietary/health determinants and underlying household food and care environments ${cite(cited, "unicef_framework_2020")}.${diplomaExt}`;
    }),
    ...(isDiploma
      ? [
          ...objectiveDiscussion,
          `Across all ${bundles.length} analysed indicators, the Kenyan experience demonstrates that technical guidelines alone are insufficient without reliable primary-care delivery, trained nutrition personnel, and consistent community follow-up ${cMoh}. While national averages summarize broad countrywide direction, sub-national implementation across Kenya's 47 counties requires localized monitoring so that vulnerable households in underserved wards receive targeted support.`,
          `In addition, comparing the direction and magnitude of change across ${bundles.map((b) => b.indicator.shortLabel.toLowerCase()).join(", ")} underscores the interconnected nature of maternal health services, infant feeding behaviour, and early childhood nutritional status within the UNICEF conceptual framework. Improvements in one domain—such as skilled antenatal care attendance—create an enabling platform for counselling and preventive care, yet translating service contact into sustained household practice requires addressing socio-economic constraints, maternal time burdens, and cultural beliefs at community level ${cKdhs22}.`,
          `From a Kenyan health-systems perspective, these findings highlight the importance of strengthening Kenya's Community Health Promoters (CHPs) network, integrating nutrition indicators into routine county health management information systems, and ensuring that facility-level staff receive continuous refresher training on standardized WHO and Ministry of Health protocols ${cMoh}.`,
          `Methodologically, these findings corroborate the value of longitudinal secondary-data analysis in Kenyan TVET nutrition research. By comparing multi-decade series side by side, practitioners can distinguish durable structural progress from short-term survey fluctuations and formulate evidence-grounded recommendations for county health departments.`,
          `In Kenya's devolved health system, county nutrition coordinators and sub-county health management teams can apply these longitudinal benchmarks during annual performance reviews and county integrated development planning (CIDP) cycles. Aligning local resource allocation with verified national trend direction helps ensure that preventive maternal and child nutrition programmes receive sustained funding across successive budget years ${cMoh}.`,
          `Additionally, training institutions offering Diploma programmes in Human Nutrition and Dietetics and Community Health can use these verified trend summaries to bridge classroom theory with real-world Kenyan epidemiological evidence, preparing graduates to interpret national datasets accurately in clinical and public health practice.`,
          `Finally, documenting multi-year national trends alongside clear source citations establishes an auditable reference point for future researchers, county nutritionists, and health facility teams seeking to monitor Kenya's progress toward national nutrition and child survival goals ${cKdhs22}.`,
        ]
      : []),
  ];

  return [
    makeSection("ch4.results", "4.1 Presentation of Descriptive Findings", resultsBlocks.join("\n\n")),
    makeSection("ch4.subgroup", "4.2 Comparison of Findings by Period and Indicator", subgroupBlocks.join("\n\n")),
    makeSection("ch4.discussion", "4.3 Discussion of Findings", discussionBlocks.join("\n\n")),
  ];
}

function buildChapter5(
  specs: ResearchSpecs,
  bundles: IndicatorBundle[],
  cited: Set<string>
): GeneratedSectionPayload[] {
  const seed = specs.seed || specs.title;
  const isDiploma = specs.level === "diploma";
  const cMoh = cite(cited, "moh_kenap_2020");
  const cKdhs22 = cite(cited, "knbs_kdhs_2022");

  const summary = [
    pickVariant(`${seed}|sumOpen`, [
      `This study synthesized verified national secondary data for ${specs.country} spanning ${specs.yearFrom} to ${specs.yearTo} across ${bundles.length} core indicators in accordance with the study objectives.`,
      `Using harmonized time-series records for ${specs.country} between ${specs.yearFrom} and ${specs.yearTo}, the analysis evaluated multi-year trajectories across ${bundles.length} nutrition and health indicators.`,
      `Chapter Five consolidates the empirical findings derived from ${bundles.length} national indicator series in ${specs.country} over the ${specs.yearFrom}-${specs.yearTo} review period.`,
    ]),
    ...bundles.map(
      (b, i) =>
        `${i + 1}. ${describeTrend(b, specs)}. Across ${b.stats.count} published observations, the indicator averaged ${fmtVal(b.stats.mean, b.indicator.unit)}, reaching a peak of ${fmtVal(b.stats.maxValue, b.indicator.unit)} in ${b.stats.maxYear} and a minimum of ${fmtVal(b.stats.minValue, b.indicator.unit)} in ${b.stats.minYear} (average annual shift: ${b.stats.avgAnnualChange > 0 ? "+" : ""}${b.stats.avgAnnualChange} per year${isDiploma ? `; linear slope: ${b.stats.linearSlopePerYear > 0 ? "+" : ""}${b.stats.linearSlopePerYear} per year` : ""}).`
    ),
    bundles.length >= 2
      ? `Taken together, cross-indicator comparison confirms that ${bundles[0].indicator.shortLabel} (${bundles[0].stats.direction}) and ${bundles[1].indicator.shortLabel} (${bundles[1].stats.direction}) evolved at distinct rates over the study window, underscoring the need to interpret individual survey snapshots within their broader multi-decade trajectory ${cKdhs22}.`
      : `Overall, the longitudinal series demonstrates measurable structural shifts across the observed survey rounds ${cKdhs22}.`,
  ].join("\n\n");

  const conclusions = [
    ...specs.researchQuestions.map((q, i) => {
      const b = bundles[i] || bundles[0];
      const ans = b
        ? `Based on verified national observations (${b.stats.firstYear}-${b.stats.lastYear}), ${describeTrend(b, specs)}. This confirms a ${b.stats.direction} trajectory around a long-term mean of ${fmtVal(b.stats.mean, b.indicator.unit)}, indicating that sustained policy and service-delivery focus remains essential to consolidate gains.`
        : "Verified national secondary records confirm measurable shifts across the study window that warrant continued surveillance.";
      return `${i + 1}. In response to "${q.replace(/^\d+\.\s*/, "")}": ${ans}`;
    }),
    pickVariant(`${seed}|concClose`, [
      `In conclusion, multi-year secondary analysis provides a reliable, cost-effective evidence base for evaluating national nutrition progress and identifying areas where implementation intensity must be strengthened ${cMoh}.`,
      `Collectively, the evidence demonstrates that while national indicators respond to sustained health and nutrition investments, remaining gaps require targeted county-level follow-through and continuous monitoring ${cMoh}.`,
    ]),
    ...(isDiploma
      ? [
          `At a broader strategic level, achieving Kenya's national nutrition targets requires sustained alignment between national policy frameworks, county-level primary healthcare budgets, and community-level behaviour change communication. Only when multi-year surveillance findings are translated into routine facility practice and county resource allocation can Kenya accelerate progress across every demographic group.`,
        ]
      : []),
  ].join("\n\n");

  const recommendations = orderBySeed(`${seed}|rec`, [
    `National Policy and Programme Alignment: The Ministry of Health and County Nutrition Coordinators should align annual county nutrition workplans with the Kenya Nutrition Action Plan, prioritizing counties and vulnerable households that lag behind national averages ${cMoh}.`,
    `Facility and Community Service Delivery: Primary health facilities and community health promoters should strengthen routine growth monitoring, maternal nutrition counselling, and early identification of at-risk mothers and infants using standardized WHO and Ministry of Health guidelines.`,
    `Surveillance and Data Utilization: County health management teams and TVET training institutions should routinely integrate open national survey series (such as KDHS and World Development Indicators) into programme reviews, resource allocation, and student training.`,
    `Multi-Sectoral Coordination: County departments of health, agriculture, water, and social protection should coordinate nutrition-sensitive interventions—linking household food security, safe water access, and maternal education—to sustain long-term gains.`,
    ...(isDiploma
      ? [
          `Capacity Building and Supervision: Sub-county nutrition officers should conduct quarterly mentorship and data-quality audits at primary health facilities to ensure that counselling messages and anthropometric or feeding records remain accurate and actionable.`,
        ]
      : []),
  ])
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");

  const furtherResearch = orderBySeed(`${seed}|fur`, [
    `Sub-National Primary Surveys: Future researchers should conduct primary cross-sectional or mixed-methods studies at county, sub-county, and facility levels to examine household socio-economic, cultural, and caregiver determinants that national aggregate series cannot disaggregate.`,
    `Service Quality and Longitudinal Follow-Up: Operational research evaluating facility-level counselling quality, caregiver adherence, and seasonal food-security shocks is recommended to complement national prevalence trends.`,
    ...(isDiploma
      ? [
          `Intervention Effectiveness Evaluations: Quasi-experimental or cohort studies assessing the impact of community health promoter home visits and digital nutrition messaging on household practices across Kenya's rural and peri-urban counties are warranted.`,
        ]
      : []),
  ])
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");

  const recMatrix = isDiploma
    ? [
        "Table 5.1: Implementation Matrix for Policy and Practice Recommendations",
        "| Priority Action | Lead Actor | Target Timeline |",
        "| :--- | :--- | :--- |",
        "| Align county nutrition workplans with KNAP priorities | Ministry of Health & County Nutrition Coordinators | Annual planning cycle |",
        "| Strengthen facility counselling & CHP home follow-up | Sub-County Health Teams & Primary Facilities | Immediate / Ongoing |",
        "| Integrate KDHS/WDI trend reviews into training & M&E | TVET Institutions & County M&E Units | Quarterly / Semesterly |",
        "| Coordinate food-security, WASH, and maternal education | County Health, Agriculture & Social Services | Medium-term (1-3 years) |",
      ].join("\n")
    : "";

  return [
    makeSection("ch5.summary", "5.1 Summary of Key Findings", summary),
    makeSection("ch5.conclusions", "5.2 Conclusions", conclusions),
    makeSection("ch5.recommendations", "5.3 Policy and Practice Recommendations", [recommendations, recMatrix].filter(Boolean).join("\n\n")),
    makeSection("ch5.further_research", "5.4 Recommendations for Further Studies", furtherResearch),
  ];
}

function buildAppendices(
  specs: ResearchSpecs,
  bundles: IndicatorBundle[],
  kind: ResearchKind
): GeneratedSectionPayload[] {
  const out: GeneratedSectionPayload[] = [];

  if (kind === "full") {
    const extractionTable = [
      "| Indicator | Code | Years Extracted | Min | Max | Source URL |",
      "| :--- | :--- | :--- | :--- | :--- | :--- |",
      ...bundles.map(
        (b) =>
          `| ${b.indicator.shortLabel} | ${b.indicator.wbCode} | ${b.series.map((p) => p.year).join(", ")} | ${b.stats.minValue} (${b.stats.minYear}) | ${b.stats.maxValue} (${b.stats.maxYear}) | ${b.indicator.sourceUrl} |`
      ),
    ].join("\n");
    out.push(
      makeSection(
        "app.datasources",
        "Appendix I: Secondary Data Extraction Sheet",
        `Data retrieved on ${RESEARCH_SNAPSHOT.retrievedAt.slice(0, 10)} from ${RESEARCH_SNAPSHOT.provider}.\n\n${extractionTable}`
      )
    );
  }

  const workplan = [
    "| Phase | Activity | Timeline |",
    "| :--- | :--- | :--- |",
    "| 1 | Topic formulation and supervisor approval | Weeks 1-2 |",
    "| 2 | Proposal drafting (Chapters 1-3) and moderation | Weeks 3-4 |",
    "| 3 | Secondary data extraction and verification | Weeks 5-6 |",
    "| 4 | Descriptive statistical analysis and Chapter 4-5 drafting | Weeks 7-9 |",
    "| 5 | Final review, proofreading, and project submission | Weeks 10-12 |",
  ].join("\n");
  out.push(makeSection("app.workplan", kind === "full" ? "Appendix II: Project Work Plan" : "Appendix I: Project Work Plan", workplan));

  const budget = [
    "| Item | Estimated Cost (KES) |",
    "| :--- | :--- |",
    "| Internet data bundles for repository access | 1,500 |",
    "| Stationery and printing drafts | 1,200 |",
    "| Final binding and submission copies | 1,000 |",
    "| Contingency | 500 |",
    "| Total | 4,200 |",
  ].join("\n");
  out.push(makeSection("app.budget", kind === "full" ? "Appendix III: Research Budget Breakdown (KES)" : "Appendix II: Research Budget Breakdown (KES)", budget));

  return out;
}

export function buildResearchDocument(
  specs: ResearchSpecs,
  kind: ResearchKind = specs.kind || "full"
): GeneratedSectionPayload[] {
  const identity = resolveIdentity(specs);
  const bundles = resolveBundles(specs);
  const cited = new Set<string>();

  const ch1 = buildChapter1(specs, identity, bundles, cited);
  const ch2 = buildChapter2(specs, bundles, cited);
  const ch3 = buildChapter3(specs, bundles, cited);
  const ch4 = kind === "full" ? buildChapter4(specs, bundles, cited) : [];
  const ch5 = kind === "full" ? buildChapter5(specs, bundles, cited) : [];
  const prelims = buildPrelims(specs, identity, bundles, cited, kind);
  const references = makeSection("references", "References (APA 7th Edition)", formatApaReferenceList(cited));
  const appendices = buildAppendices(specs, bundles, kind);

  const raw = [...prelims, ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, references, ...appendices];
  return fitToPageBudget(raw, specs.level, {
    protectedKeys: [/^prelim\./, "references", /^ch4\./, /^ch5\./],
    optionalKeys: ["app.budget", "app.workplan"],
  }).sections;
}

export function buildCompleteResearchProject(specs: ResearchSpecs): GeneratedSectionPayload[] {
  return buildResearchDocument(specs, "full");
}

export function buildResearchProposal(specs: ResearchSpecs): GeneratedSectionPayload[] {
  return buildResearchDocument(specs, "proposal");
}
