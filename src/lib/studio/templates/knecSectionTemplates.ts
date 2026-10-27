import type { WorkspaceLevel, WorkspaceType } from "@/types/database";

/**
 * Counts unfilled bracketed placeholders `[like this]` or underscore blanks `____`
 * inside a candidate's section draft. Ignores APA institutional acronyms such as
 * `[KNBS]`, `[MOH]`, `[KEBS]`, `[WHO]`, `[FAO]`, `[UNICEF]`, `[MSEA]`.
 */
const IGNORED_BRACKET_TOKENS = new Set([
  "knbs",
  "moh",
  "kebs",
  "who",
  "fao",
  "unicef",
  "msea",
  "icf",
  "aoac",
  "kdhs",
  "khis",
  "kihbs",
]);

export function extractUnfilledPlaceholders(text: string): string[] {
  if (!text || !text.trim()) return [];
  const matches: string[] = [];

  const bracketRegex = /\[([^[\]\n]{2,120})\]/g;
  let m: RegExpExecArray | null;
  while ((m = bracketRegex.exec(text)) !== null) {
    const inner = m[1].trim();
    if (IGNORED_BRACKET_TOKENS.has(inner.toLowerCase())) continue;
    if (/^cite:/i.test(inner)) continue;
    matches.push(`[${inner}]`);
  }

  const underscoreRegex = /_{4,}/g;
  while ((m = underscoreRegex.exec(text)) !== null) {
    matches.push(m[0]);
  }

  return matches;
}

export function countUnfilledPlaceholders(text: string): number {
  return extractUnfilledPlaceholders(text).length;
}

/**
 * Returns a standardized, structured KNEC fill-in-the-blank template for any section
 * across `research_secondary`, `trade_fabrication`, and `business_plan` tracks.
 * Candidates replace the `[bracketed prompts]` in their own words while preserving
 * official KNEC headings, numbering, and examination formatting.
 */
export function getStandardKnecFillInTemplate(params: {
  type: WorkspaceType;
  level: WorkspaceLevel;
  sectionKey: string;
  sectionTitle?: string;
  workspaceTitle?: string | null;
  course?: string | null;
}): string {
  const { type, level, sectionKey, sectionTitle, workspaceTitle, course } = params;
  const isDiploma = level === "diploma";
  const levelName = isDiploma ? "Diploma" : "Craft Certificate";
  const courseName =
    course ||
    (type === "research_secondary"
      ? `${levelName} in Nutrition and Dietetics`
      : `${levelName} in Food Science and Processing Technology`);
  const projectTitlePlaceholder =
    workspaceTitle && workspaceTitle.trim().length > 5
      ? workspaceTitle.trim()
      : "[Enter Full Project Title]";

  // ==========================================================================
  // SHARED PRELIMINARY & COVER TEMPLATES
  // ==========================================================================
  if (sectionKey === "cover.details") {
    if (type === "business_plan") {
      return `INSTITUTION: [Enter Name of TVET Institute / National Polytechnic]
DEPARTMENT: [Enter Department Name, e.g., Applied Sciences / Hospitality & Institutional Management]
BUSINESS NAME: [Enter Registered Enterprise Trade Name]
BUSINESS SLOGAN: "[Enter Short Memorable Brand Slogan]"
BUSINESS ADDRESS: [P.O. Box / Physical Street / Town / County]
CANDIDATE NAME: [Enter Your Full Official Name]
ADMISSION NUMBER: [Enter College Admission Number]
KNEC INDEX NUMBER: [Enter 11-Digit KNEC Index Number]
COURSE: ${courseName}
SUPERVISOR NAME: [Enter Institutional Supervisor Full Name]
EXAMINATION SERIES: [Enter Series, e.g., July / November 2026 Series]

SUBMITTED TO THE KENYA NATIONAL EXAMINATIONS COUNCIL IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE ${courseName.toUpperCase()}.`;
    }

    return `INSTITUTION: [Enter Name of TVET Institute / National Polytechnic]
DEPARTMENT: [Enter Department Name, e.g., Nutrition and Dietetics / Food Science]
PROJECT TITLE: ${projectTitlePlaceholder}
CANDIDATE NAME: [Enter Your Full Official Name]
ADMISSION NUMBER: [Enter College Admission Number]
KNEC INDEX NUMBER: [Enter 11-Digit KNEC Index Number]
COURSE: ${courseName}
SUPERVISOR NAME: [Enter Institutional Supervisor Full Name]
EXAMINATION SERIES: [Enter Series, e.g., July / November 2026 Series]

A PROJECT REPORT SUBMITTED TO THE KENYA NATIONAL EXAMINATIONS COUNCIL IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE ${courseName.toUpperCase()}.`;
  }

  if (sectionKey === "prelim.declaration") {
    return `DECLARATION BY THE CANDIDATE
I hereby declare that this project report titled "${projectTitlePlaceholder}" is my original work and has not been presented for an examination or award in any other university, college, or examination body. All secondary data sources, standards, and published works consulted have been duly acknowledged in accordance with KNEC academic integrity guidelines.

Candidate Name: [Enter Your Full Name]
Admission / Index Number: [Enter Admission / KNEC Index Number]
Signature: ___________________________   Date: [DD/MM/YYYY]

APPROVAL BY INSTITUTIONAL SUPERVISOR
This project report has been submitted for examination with my approval as the appointed institutional supervisor.

Supervisor Name: [Enter Supervisor Full Name]
Department: [Enter Department Name]
Signature: ___________________________   Date: [DD/MM/YYYY]`;
  }

  if (sectionKey === "prelim.dedication") {
    return `DEDICATION

I dedicate this project work to [enter names/relationships, e.g., my beloved parents, guardians, and siblings] for their unwavering moral, spiritual, and financial support throughout my training in ${courseName}, and to [enter any additional mentor or community group] for inspiring my passion for nutrition and food security.`;
  }

  if (sectionKey === "prelim.acknowledgements") {
    return `ACKNOWLEDGEMENTS

First and foremost, I give thanks to the Almighty God for granting me good health and perseverance throughout this study.

I wish to express my sincere appreciation to my institutional supervisor, [Enter Supervisor Name], for providing patient guidance, constructive critiques, and technical supervision from proposal conception to final report compilation.

I also thank the Principal and trainers of [Enter Institution Name], particularly the Department of [Enter Department], for equipping me with practical competencies. Finally, I acknowledge the Kenya National Bureau of Statistics (KNBS), the Ministry of Health (MOH), and the Kenya Bureau of Standards (KEBS) whose published technical reports and reference standards anchored this work.`;
  }

  if (sectionKey === "prelim.toc") {
    return `TABLE OF CONTENTS

PRELIMINARY PAGES
Declaration and Approval ........................................................ ii
Dedication ...................................................................... iii
Acknowledgements ................................................................ iv
Abstract / Executive Synopsis ................................................... v
Table of Contents ............................................................... vi
List of Tables and Figures ...................................................... vii
Abbreviations and Acronyms ...................................................... viii

CHAPTER ONE: [Introduction / Business Description] .............................. 1
CHAPTER TWO: [Literature Review / Marketing Plan] ............................... [Page No]
CHAPTER THREE: [Methodology / Organization & Management Plan] ................... [Page No]
CHAPTER FOUR: [Results & Discussion / Operational & Production Plan] ............ [Page No]
CHAPTER FIVE: [Summary, Conclusions & Recommendations / Financial Plan] ......... [Page No]
REFERENCES ...................................................................... [Page No]
APPENDICES ...................................................................... [Page No]

LIST OF TABLES
Table 3.1: [Enter Title of First Method/Schedule Table] ......................... [Page No]
Table 4.1: [Enter Title of Primary Findings/Production Table] ................... [Page No]
Table 4.2: [Enter Title of Comparative/Costing Table] ........................... [Page No]`;
  }

  if (sectionKey === "prelim.acronyms") {
    if (type === "trade_fabrication") {
      return `ABBREVIATIONS AND ACRONYMS

AOAC    : Association of Official Analytical Chemists
CCP     : Critical Control Point
CHO     : Carbohydrates
FAO     : Food and Agriculture Organization of the United Nations
GMP     : Good Manufacturing Practices
HACCP   : Hazard Analysis and Critical Control Points
KEBS    : Kenya Bureau of Standards
KNEC    : Kenya National Examinations Council
MOH     : Ministry of Health (Kenya)
OFSP    : Orange-Fleshed Sweet Potato
RDA     : Recommended Dietary Allowance
WHO     : World Health Organization
[Add Acronym] : [Enter Full Meaning Relevant to Your Formulation]`;
    }
    return `ABBREVIATIONS AND ACRONYMS

ANC     : Antenatal Care
FAO     : Food and Agriculture Organization of the United Nations
HAZ     : Height-for-Age Z-Score (Stunting Indicator)
IYCF    : Infant and Young Child Feeding
KDHS    : Kenya Demographic and Health Survey
KEBS    : Kenya Bureau of Standards
KHIS    : Kenya Health Information System
KNBS    : Kenya National Bureau of Statistics
KNEC    : Kenya National Examinations Council
MAM     : Moderate Acute Malnutrition
MDD     : Minimum Dietary Diversity
MMF     : Minimum Meal Frequency
MOH     : Ministry of Health (Kenya)
SAM     : Severe Acute Malnutrition
UNICEF  : United Nations Children's Fund
WAZ     : Weight-for-Age Z-Score (Underweight Indicator)
WHO     : World Health Organization
WHZ     : Weight-for-Height Z-Score (Wasting Indicator)`;
  }

  // ==========================================================================
  // TRACK 1: SECONDARY DESK RESEARCH (research_secondary)
  // ==========================================================================
  if (type === "research_secondary") {
    switch (sectionKey) {
      case "prelim.abstract":
        return `### Abstract

**Background:** [State in 1-2 sentences the nutrition issue being studied and the target population/county, e.g., Child undernutrition and suboptimal complementary feeding remain key public health concerns in [Enter County/Study Area]].
**Objective:** The main objective of this study was to assess [enter general objective topic] in [enter County or Target Group] using verified secondary data. Specifically, the study sought to: (1) [enter specific objective 1], (2) [enter specific objective 2], and (3) [enter specific objective 3].
**Methodology:** This study employed a descriptive cross-sectional research design relying wholly on secondary data extracted from [enter exact reports used, e.g., the Kenya Demographic and Health Survey (KDHS) 2022 report published by KNBS & ICF, and Ministry of Health KHIS summary reports]. Extracted variables were verified using a structured checklist and analyzed using ${
          isDiploma
            ? "both descriptive statistics (frequencies, percentages, means) and inferential statistics ([state test, e.g., Chi-square test of association at p < 0.05])"
            : "simple descriptive statistics (frequencies, percentages, and averages) presented in summary tables"
        }.
**Key Findings:** Under Objective 1, findings showed that [enter key percentage/figure for Objective 1, e.g., 18% of children under five were stunted]. Under Objective 2, [enter key percentage/figure for Objective 2, e.g., only 31% of children aged 6-23 months achieved minimum acceptable diet]. Under Objective 3, group comparison revealed that [enter comparison finding${
          isDiploma ? " and p-value result, e.g., rural prevalence (20%) was significantly higher than urban prevalence (12%, p < 0.05)" : ", e.g., rural areas recorded 20% compared to 12% in urban areas"
        }].
**Conclusion and Recommendations:** The study concludes that [enter 1-sentence core conclusion]. It recommends that County Nutrition Coordinators and Community Health Promoters in [enter County] should [enter 1-2 practical recommendations].`;

      case "proposal.title":
        return `### Proposed Research Title
Assessment of [Enter Nutrition Indicator / Feeding Practice] and [Enter Health / Nutritional Outcome] Among [Enter Target Group, e.g., Children Aged 6-23 Months] in [Enter County / Study Area]: A Secondary Data Analysis of [Enter Source, e.g., KDHS 2022 and MOH Reports]

### Study Rationale and Overview
This study focuses on investigating [enter nutrition topic] among [enter target group] in [enter study area/county]. According to recent national nutrition surveillance reports, [describe the core nutritional challenge in 2-3 sentences and cite source, e.g., (KNBS & ICF, 2023)].

To address this gap practically at the ${levelName} level, this project utilizes a descriptive cross-sectional design based entirely on verified secondary data extracted from [state exact reports: e.g., KDHS 2022 tables, KNBS reports, and Ministry of Health KHIS records], enabling a clear, evidence-based summary for local nutrition planning.`;

      case "proposal.problem":
        return `### Statement of the Problem
Optimal nutrition among [enter target population, e.g., children under five years / pregnant women] is critical for preventing morbidity, cognitive impairment, and growth faltering (WHO & UNICEF, 2021). However, published data indicates a persistent burden of [enter specific problem, e.g., stunting, micronutrient deficiency, or low dietary diversity] in Kenya. According to the Kenya Demographic and Health Survey (KDHS) 2022, [enter exact national or county statistic from verified sources, e.g., 18% of children under five are stunted nationally, while only 31% of children aged 6-23 months receive a minimum acceptable diet] (KNBS & ICF, 2023).

In [enter your specific County or Study Area], [describe how this problem manifests locally, e.g., high food prices, reliance on low-nutrient cereal porridges, or limited maternal nutrition awareness exacerbate poor feeding outcomes]. Despite the availability of national datasets from KNBS and the Ministry of Health, these figures remain scattered in technical statistical volumes that are rarely synthesized into a simple local reference for front-line Community Health Promoters, nutrition trainees, and caregivers in [enter Study Area]. If this gap is not addressed through a focused secondary data synthesis, local nutrition education and targeted interventions will remain poorly aligned with documented community needs.`;

      case "proposal.objectives":
        return `### General Objective
To assess [enter main study variables, e.g., complementary feeding practices and nutritional status] among [enter target population] in [enter County / Study Area] using verified secondary data from [enter primary dataset, e.g., KDHS 2022 and MOH routine reports].

### Specific Objectives
1. To determine the prevalence of [enter Indicator 1, e.g., stunting, wasting, and underweight] among [enter target population] in [enter Study Area] as recorded in [enter dataset, e.g., KDHS 2022 tables].
2. To examine the proportion of [enter target population] meeting recommended [enter Indicator 2, e.g., minimum dietary diversity and minimum meal frequency] from published survey records.
3. To compare [enter Indicator 1 and Indicator 2] across [enter comparison groups, e.g., rural versus urban residence and maternal education levels]${
          isDiploma
            ? " and test statistical associations using inferential analysis (Chi-square test at p < 0.05)."
            : " using simple descriptive summary tables."
        }`;

      case "proposal.rationale":
        return `### Significance and Justification of the Study
1. **County Nutritionists and Community Health Promoters (CHPs):** The summarized tables and charts from this study will provide an accessible quick-reference guide for designing targeted nutrition counseling and cooking demonstrations in [enter County / Sub-County].
2. **Mothers, Caregivers, and Households:** By highlighting specific dietary gaps—such as low intake of [enter food groups, e.g., iron-rich animal-source foods, legumes, and vitamin A-rich fruits and vegetables]—the findings will inform practical household feeding improvements.
3. **TVET Trainees and Academic Reference:** Conducting this study using verified secondary datasets (KNBS, MOH, and WHO) demonstrates how official health statistics can be interpreted cost-effectively and ethically to guide community nutrition action.`;

      case "ch1.background":
        return `### 1.1 Background to the Study
#### Global Perspective
Globally, malnutrition in all its forms remains a major public health challenge affecting survival, growth, and socio-economic development. According to global estimates by the World Health Organization and UNICEF, [describe global statistics on your topic, e.g., approximately 148 million children under five years suffer from stunting globally, while over two-thirds of malnutrition-related deaths in early childhood are linked to inappropriate feeding practices during the first two years of life] (WHO & UNICEF, 2021). Optimal dietary intake—including [mention key practices relevant to your topic, e.g., exclusive breastfeeding for the first 6 months and timely, diverse complementary feeding from 6 to 23 months]—is universally recognized as the cornerstone of child survival and maternal health.

#### Regional (Sub-Saharan Africa) Perspective
In Sub-Saharan Africa, the burden of undernutrition and micronutrient deficiencies remains disproportionately high due to recurrent climate shocks, household food insecurity, poverty, and high infectious disease burden (FAO et al., 2022). Across Eastern and Southern Africa, [explain regional trends relevant to your topic, e.g., complementary diets are predominantly based on starchy cereal gruels with low protein and micronutrient density, resulting in fewer than 25% of young children meeting minimum dietary diversity thresholds].

#### National (Kenya) Perspective
In Kenya, the Government has prioritized nutrition security through the Kenya National Nutrition Action Plan (KNNAP) and Maternal, Infant, and Young Child Nutrition (MIYCN) policies (Ministry of Health [MOH], 2020). Recent surveillance from the 2022 Kenya Demographic and Health Survey (KDHS) demonstrates that national child stunting declined from 26% in 2014 to 18% in 2022, while wasting stands at 5% and underweight at 10% (KNBS & ICF, 2023). However, dietary quality indicators remain concerning: only [insert relevant national KDHS figure, e.g., 37% of children aged 6-23 months meet Minimum Dietary Diversity (MDD) and 31% achieve a Minimum Acceptable Diet (MAD)].

#### Local Context ([Enter County / Study Area])
In [Enter County / Study Area], households face specific nutritional vulnerabilities driven by [describe 2-3 local factors, e.g., reliance on rain-fed subsistence farming, high retail prices of nutrient-dense foods in informal settlements, or socio-cultural food taboos]. Reviewing and synthesizing verified secondary indicators for [Enter Study Area] is therefore essential to establish a clear empirical baseline for community nutrition programming.`;

      case "ch1.problem":
        return `### 1.2 Statement of the Problem
Despite sustained policy implementation by the Ministry of Health and development partners, [state the core nutrition problem, e.g., suboptimal infant feeding and childhood undernutrition] continue to compromise health outcomes among [enter target population] in [enter Study Area]. Published statistics from the 2022 KDHS indicate that [insert exact national/regional percentages, e.g., 18% of children under five are stunted, with rural populations experiencing higher stunting (20%) than urban populations (12%), while 69% of children aged 6-23 months fail to achieve a minimum acceptable diet] (KNBS & ICF, 2023).

At the local level in [enter County / Study Area], [describe the specific local consequences, e.g., inadequate intake of diverse food groups contributes to recurrent childhood illness, delayed developmental milestones, and heightened clinic admissions]. While official secondary data exists within KNBS national survey tables and Ministry of Health KHIS facility registers, these figures have not been consolidated into a focused, easy-to-interpret analytical report tailored to [enter Study Area]. Consequently, local health workers, nutrition trainees, and community leaders lack a consolidated empirical summary comparing [enter your study variables]. This study bridges that gap by systematically extracting, verifying, and analyzing secondary data on [enter topic] in [enter Study Area].`;

      case "ch1.objectives":
        return `### 1.3 Research Objectives

#### 1.3.1 General Objective
To assess [enter general study focus, e.g., complementary feeding practices and nutritional status] among [enter target population] in [enter County / Study Area] using verified secondary data.

#### 1.3.2 Specific Objectives
1. To determine [enter Specific Objective 1, e.g., the prevalence of stunting, wasting, and underweight among children under five years in [Study Area] from KDHS 2022 and MOH secondary records].
2. To examine [enter Specific Objective 2, e.g., the proportion of children aged 6-23 months meeting minimum meal frequency, minimum dietary diversity, and minimum acceptable diet].
3. To compare [enter Specific Objective 3, e.g., feeding practices and nutritional status indicators across demographic subgroups (rural vs. urban residence, child age groups, and maternal education)]${
          isDiploma
            ? " and evaluate statistical associations using Chi-square / inferential tests at p < 0.05."
            : " using descriptive comparison tables."
        }`;

      case "ch1.questions":
        return `### 1.4 Research Questions
1. What is the prevalence of [enter Indicator 1 from Objective 1] among [enter target population] in [enter Study Area] according to published secondary reports?
2. What proportion of [enter target population] achieves recommended [enter Indicator 2 from Objective 2] in the reviewed secondary datasets?
3. How do [enter study indicators] compare across [enter demographic subgroups, e.g., rural versus urban households and maternal education levels]${
          isDiploma ? ", and is there a statistically significant association (p < 0.05) between them" : ""
        }?`;

      case "ch1.justification":
        return `### 1.5 Justification of the Study
This study is justified on both practical public health and academic grounds:
1. **Evidence-Based Local Action:** Front-line nutritionists and Community Health Promoters in [enter County / Study Area] require concise, disaggregated summaries of official KDHS and MOH indicators to prioritize high-risk subgroups during health talks and outreach clinics.
2. **Cost-Effectiveness and Data Reliability:** Utilizing nationally representative secondary datasets (KNBS & ICF, 2023; MOH, 2020) provides high statistical reliability derived from standardized WHO anthropometric and dietary protocols without duplicating costly field surveys.
3. **Curriculum and Policy Alignment:** The findings directly support Kenya's Vision 2030 health pillar and county-level Integrated Development Plans (CIDPs) by pinpointing specific dietary indicators that require targeted community nutrition education.`;

      case "ch1.scope":
        return `### 1.6 Scope and Delimitations of the Study
- **Content Scope:** This study is delimited to examining [enter independent variables, e.g., minimum dietary diversity, minimum meal frequency, and breastfeeding indicators] and their relationship with [enter dependent variable, e.g., child anthropometric status (stunting, wasting, underweight)].
- **Population and Geographic Scope:** The review focuses on data representing [enter target group, e.g., children aged 0-59 months / women of reproductive age] in [enter County / Region / Kenya].
- **Methodological and Data Scope:** The study relies 100% on secondary data published between [enter start year, e.g., 2018] and [enter end year, e.g., 2024], specifically drawing from [enter exact reports: e.g., the 2022 Kenya Demographic and Health Survey (KDHS), KNBS economic/nutrition reports, and Ministry of Health KHIS summary tables]. No primary household interviews or clinical blood draws were conducted.`;

      case "ch1.limitations":
        return `### 1.7 Limitations and Assumptions
#### Limitations of the Study
1. **Fixed Variables in Secondary Archives:** Because data was extracted from pre-existing published reports (KDHS 2022 and MOH registers), the researcher could not add new custom questionnaire items. *Mitigation:* The study selected comprehensive official datasets that already capture standard WHO/UNICEF core nutrition indicators.
2. **Aggregation of Sub-County Figures:** Some published national tables report indicators at the national, rural/urban, or county level rather than individual village level. *Mitigation:* County-level and regional tables were triangulated with peer-reviewed studies from comparable Kenyan settings.

#### Basic Assumptions
 It was assumed that the secondary data collected and validated by the Kenya National Bureau of Statistics (KNBS), ICF, and the Ministry of Health accurately reflected the nutritional status of the target population at the time of surveillance.`;

      case "ch1.terms":
        return `### 1.8 Definition of Operational Terms
- **Complementary Feeding:** The process of introducing nutrient-dense solid, semi-solid, or soft foods alongside continued breastfeeding starting at 6 months of age when breast milk alone is no longer sufficient (WHO & UNICEF, 2021).
- **Minimum Dietary Diversity (MDD):** The proportion of children aged 6-23 months who consumed foods and beverages from at least 5 out of 8 defined food groups during the previous 24 hours (WHO & UNICEF, 2021).
- **Minimum Meal Frequency (MMF):** The proportion of breastfed and non-breastfed children aged 6-23 months who receive solid, semi-solid, or soft foods the minimum recommended number of times or more per day.
- **Stunting (Height-for-Age < -2 SD):** Chronic undernutrition reflecting cumulative linear growth retardation caused by long-term inadequate dietary intake and repeated infections (KNBS & ICF, 2023).
- **Wasting (Weight-for-Height < -2 SD):** Acute undernutrition reflecting recent rapid weight loss or failure to gain weight.
- **Secondary Data:** Empirical statistical records, survey tables, and health indicators previously collected, verified, and published by official agencies such as KNBS, MOH, and WHO.`;

      case "ch2.intro":
        return `### 2.1 Introduction to Literature Review
This chapter presents a structured review of published literature relevant to [enter your study topic]. It is organized into four main parts: the Theoretical Framework (Section 2.2), the Conceptual Framework illustrating the relationship between study variables (Section 2.3), the Empirical Literature Review structured around the three specific study objectives (Section 2.4), and a Summary of Literature and Identified Gaps (Section 2.5). All reviewed statistics and conceptual models are drawn from verified institutional reports (WHO, UNICEF, FAO, KNBS, and MOH) and peer-reviewed nutrition studies.`;

      case "ch2.theoretical":
        return `### 2.2 Theoretical Framework
This study is anchored on the **UNICEF Conceptual Framework on the Determinants of Maternal and Child Nutrition** (UNICEF, 2020; WHO & UNICEF, 2021). The framework categorizes the causes of malnutrition into three interconnected hierarchical levels:

1. **Immediate Determinants (Individual Level):** Operating directly at the level of the individual child or mother, the two immediate causes of undernutrition are *inadequate dietary intake* (poor meal frequency, low dietary diversity, and low nutrient density) and *disease* (such as diarrheal infections, acute respiratory infections, and malaria, which impair nutrient absorption and increase metabolic demand).
2. **Underlying Determinants (Household and Community Level):** Inadequate dietary intake and disease are driven by three underlying household factors: (a) *household food insecurity* (limited physical or economic access to diverse, safe foods), (b) *inadequate care and feeding practices* (suboptimal breastfeeding, delayed or premature complementary feeding), and (c) *unhealthy household environment and inadequate health services* (poor WASH facilities and low immunization/clinic coverage).
3. **Basic / Enabling Determinants (Societal Level):** At the macro level, household resources are governed by socio-economic conditions, maternal education, household wealth quintile, cultural norms, and national food and nutrition governance.

**Application to this Study:** In the context of [enter Study Area], the UNICEF framework explains how underlying socio-demographic factors ([enter examples, e.g., rural/urban residence, maternal education, and household wealth]) directly shape immediate feeding practices ([enter variables, e.g., MDD, MMF, andMAD]), which in turn determine anthropometric outcomes ([enter outcome, e.g., stunting, wasting, and underweight]) recorded in KDHS and MOH secondary datasets.`;

      case "ch2.conceptual":
        return `### 2.3 Conceptual Framework
The conceptual framework below illustrates the hypothesized relationship between the independent variables, intervening (modifying) variables, and the dependent variable in this study:

\`\`\`
INDEPENDENT VARIABLES                      DEPENDENT VARIABLE
+-----------------------------------+      +-----------------------------------+
| Dietary & Feeding Indicators      |      | Nutritional Status Outcomes       |
| - [Enter Variable 1, e.g., MDD]   | ---> | - [Enter Outcome 1, e.g. Stunting]|
| - [Enter Variable 2, e.g., MMF]   |      | - [Enter Outcome 2, e.g. Wasting] |
| - [Enter Variable 3, e.g., EBF]   |      | - [Enter Outcome 3, e.g. Weight]  |
+-----------------------------------+      +-----------------------------------+
                  ^                                          ^
                  |          INTERVENING VARIABLES           |
                  +------------------------------------------+
                  | Socio-Demographic & Health Factors       |
                  | - Residence (Rural vs. Urban)            |
                  | - Maternal Education & Wealth Quintile   |
                  | - Child Age Group & Morbidity Status     |
                  +------------------------------------------+
\`\`\`

**Explanation of Variables:**
- **Independent Variables:** Include [explain your independent variables in 1-2 sentences, e.g., dietary diversity, meal frequency, and micronutrient supplementation coverage extracted from survey records].
- **Intervening Variables:** Demographic and socio-economic characteristics such as [enter demographic factors, e.g., maternal education level, household wealth index, and urban/rural residence] modify household food access and caregiving capacity.
- **Dependent Variable:** The primary outcome is [enter dependent variable, e.g., child nutritional status measured via WHO Z-score cut-offs for stunting (HAZ < -2 SD), wasting (WHZ < -2 SD), and underweight (WAZ < -2 SD)].`;

      case "ch2.empirical":
        return `### 2.4 Empirical Literature Review

#### 2.4.1 Literature on Objective 1: [Enter Theme of Specific Objective 1]
Empirical surveillance across Kenya and Sub-Saharan Africa demonstrates significant variations in [enter Objective 1 indicator]. According to the 2022 Kenya Demographic and Health Survey (KDHS), national stunting prevalence among children under five stands at 18%, down from 26% in 2014, while wasting is 5% and underweight is 10% (KNBS & ICF, 2023). In [enter your specific context or comparable study], [summarize findings from 1-2 additional verified sources on Objective 1, citing (Author, Year)].

#### 2.4.2 Literature on Objective 2: [Enter Theme of Specific Objective 2]
Dietary adequacy during the complementary feeding window (6-23 months) is a primary determinant of linear growth and micronutrient status (WHO & UNICEF, 2021). National KDHS 2022 data reveals that while 60% of infants under 6 months are exclusively breastfed, only 37% of children aged 6-23 months meet the Minimum Dietary Diversity (MDD) of 5 or more food groups, 71% meet Minimum Meal Frequency (MMF), and only 31% achieve a Minimum Acceptable Diet (MAD) (KNBS & ICF, 2023). Furthermore, [explain findings from MOH / Kimani-Murage / Kipruto or other verified literature regarding diet quality in your study setting].

#### 2.4.3 Literature on Objective 3: [Enter Theme of Specific Objective 3 / Group Comparisons]
Socio-demographic disparities strongly influence nutrition outcomes. In the 2022 KDHS report, stunting prevalence is markedly higher in rural areas (20%) than in urban areas (12%), and declines sharply with increasing maternal education—from 28% among children whose mothers have no formal education to 9% among those whose mothers have more than secondary education (KNBS & ICF, 2023). Similarly, children in the lowest wealth quintile experience stunting rates of 28% compared to 9% in the highest wealth quintile. [Add 2-3 sentences explaining how age group or local county conditions affect your study indicators].`;

      case "ch2.gap":
        return `### 2.5 Summary of Literature and Research Gaps
The reviewed literature confirms that [summarize key takeaway from Chapter 2 in 1-2 sentences, e.g., inadequate dietary diversity and socio-economic disparities remain the leading drivers of child undernutrition in Kenya]. However, two practical gaps are evident:
1. **Fragmented Presentation of Official Statistics:** While comprehensive figures exist in national KDHS 2022 volumes and MOH registers, they are presented across hundreds of complex statistical tables that are seldom synthesized into a concise, objective-driven report for [enter Study Area].
2. **Need for Local Subgroup Comparison:** Few student-level reference documents directly juxtapose [enter Indicator 1] and [enter Indicator 2] across [enter comparison groups] to guide practical community nutrition education in [enter Study Area]. This study addresses these gaps through a structured secondary data analysis.`;

      case "ch3.design":
        return `### 3.1 Research Design
This study adopted a **descriptive cross-sectional research design relying entirely on secondary data**. A cross-sectional design was selected because it enables the systematic description and comparison of nutrition indicators and demographic variables captured at a defined period of surveillance (KNBS & ICF, 2023). Using verified secondary data is methodologically sound, cost-effective, and appropriate for a ${levelName} nutrition research project because it leverages nationally representative, quality-assured epidemiological surveys without exposing human subjects to redundant field interviews.`;

      case "ch3.sources":
        return `### 3.2 Secondary Data Sources
Data for this study was extracted from official, publicly accessible institutional repositories and nutrition surveillance reports:
1. **Kenya Demographic and Health Survey (KDHS) 2022:** Published jointly by the Kenya National Bureau of Statistics (KNBS), the Ministry of Health (MOH), and The DHS Program (ICF), specifically reviewing [state exact chapters/tables, e.g., Chapter 11: Nutrition of Children and Women, covering anthropometry, breastfeeding, and IYCF indicators].
2. **Ministry of Health (MOH) / KHIS Nutrition Reports:** Routine health facility nutrition surveillance summaries and national policy frameworks [enter specific MOH document or county report].
3. **Global Reference Standards (WHO / UNICEF / FAO):** Standardized anthropometric Z-score thresholds and IYCF indicator definitions used as analytical benchmarks.

| Secondary Source Title | Publishing Agency | Year | Key Indicators Extracted |
| :--- | :--- | :--- | :--- |
| KDHS 2022 Key Indicators / Final Report | KNBS & ICF | 2023 | [Enter indicators, e.g., Stunting, Wasting, MDD, MMF, MAD] |
| [Enter Second Report / MOH Register] | [Enter Agency, e.g., MOH Kenya] | [Year] | [Enter indicators extracted] |
| WHO/UNICEF IYCF Guidelines | WHO & UNICEF | 2021 | Standard definitions and cut-off benchmarks |`;

      case "ch3.variables":
        return `### 3.3 Study Variables and Operational Indicators
The variables extracted from the secondary datasets were operationalized according to standard WHO and KDHS definitions as summarized below:

| Variable Category | Variable Name | Operational Definition & Measurement Cut-Off | Data Source |
| :--- | :--- | :--- | :--- |
| **Dependent Variable** | [e.g., Child Stunting] | [e.g., Height-for-Age Z-score (HAZ) below -2 SD from WHO median] | KDHS 2022 / MOH |
| **Dependent Variable** | [e.g., Child Wasting / Underweight] | [e.g., Weight-for-Height (WHZ) or Weight-for-Age (WAZ) < -2 SD] | KDHS 2022 / MOH |
| **Independent Variable 1** | [e.g., Minimum Dietary Diversity (MDD)] | [e.g., Percentage of children 6-23 months consuming ≥5 of 8 food groups] | KDHS 2022 |
| **Independent Variable 2** | [e.g., Minimum Meal Frequency (MMF)] | [e.g., Percentage of children 6-23 months receiving minimum daily feeds] | KDHS 2022 |
| **Subgroup / Stratifier** | [e.g., Residence, Age, Maternal Education] | [e.g., Urban vs. Rural; Age in months; Education level completed] | KDHS 2022 |`;

      case "ch3.verification":
        return `### 3.4 Data Extraction and Verification Procedure
To ensure data integrity and prevent transcription errors during secondary data compilation, a structured three-step verification protocol was followed:
1. **Structured Data Extraction Checklist:** A standardized extraction template was designed in Microsoft Excel corresponding directly to Specific Objectives 1, 2, and 3.
2. **Source Verification:** Each percentage, sample size ($n$), and subgroup value was extracted directly from the official published KDHS 2022 and MOH statistical tables, recording the exact table number and page reference.
3. **Double-Entry Cross-Checking:** All extracted figures were independently cross-checked twice against the original PDF survey tables to confirm zero rounding or copying discrepancies prior to statistical charting.`;

      case "ch3.analysis":
        return isDiploma
          ? `### 3.5 Data Analysis and Presentation (Diploma Standard)
Extracted secondary data was organized, cleaned, and analyzed using Microsoft Excel / SPSS statistical software in alignment with KNEC Diploma research standards:
1. **Descriptive Statistical Analysis:** Frequencies ($n$), percentages (%), means, and standard deviations (SD) were computed to summarize prevalence rates and feeding indicators across Objectives 1 and 2.
2. **Inferential Statistical Analysis:** To fulfill Diploma-level analytical rigor under Objective 3, inferential statistics—specifically [state test used: e.g., Pearson's Chi-square ($\chi^2$) test of independence / two-sample t-test / Pearson correlation]—were applied at a 95% confidence level ($\alpha = 0.05$) to evaluate whether observed differences across demographic subgroups (such as rural vs. urban residence, maternal education, or wealth quintiles) were statistically significant ($p < 0.05$).
3. **Data Presentation:** Findings are presented in clearly numbered academic tables and comparative summary charts accompanied by narrative interpretation.`
          : `### 3.5 Data Analysis and Presentation (Certificate Standard)
Extracted secondary data was organized and summarized using Microsoft Excel in accordance with KNEC Craft Certificate research guidelines:
1. **Simple Descriptive Statistics:** Data was analyzed using straightforward descriptive statistics, including frequencies ($n$), percentages (%), averages (means), and percentage-point differences across study indicators.
2. **Comparative Tabulation:** Subgroup comparisons (such as rural versus urban residence, child age brackets, and gender) were organized into clear side-by-side comparison tables.
3. **Data Presentation:** All results in Chapter Four are presented using numbered frequency/percentage tables and simple narrative explanations linked directly to each specific objective.`;

      case "ch3.ethics":
        return `### 3.6 Ethical Considerations
1. **Use of Anonymized Public Datasets:** This study relied exclusively on aggregated, fully anonymized secondary reports published in the public domain by KNBS, ICF, and the Ministry of Health. No individual human subjects were contacted, interviewed, or identified by name.
2. **Institutional Clearance:** Approval to conduct the desk research project was obtained from the Department of [Enter Department Name] and the appointed institutional supervisor at [Enter Institution Name].
3. **Intellectual Property and Citation Integrity:** All data custodians, survey authors, and reference institutions are acknowledged and cited in strict adherence to APA 7th Edition referencing conventions.`;

      case "ch4.results":
        return `### 4.1 Presentation of Descriptive Findings

#### 4.1.1 Findings for Objective 1: [Enter Objective 1 Title, e.g., Nutritional Status Prevalence]
Table 4.1 summarizes the extracted secondary data indicators for Objective 1 from [enter source, e.g., KDHS 2022 / MOH Nutrition Surveillance].

**Table 4.1: [Enter Table Title, e.g., Prevalence of Malnutrition Indicators Among Children Under Five]**
| Indicator | National / Benchmark (%) | [Enter County / Study Group] (%) | WHO Public Health Threshold |
| :--- | :--- | :--- | :--- |
| Stunting (HAZ < -2 SD) | 18.0% | [Enter %] | High if ≥20% |
| Wasting (WHZ < -2 SD) | 5.0% | [Enter %] | Medium (5–9%) |
| Underweight (WAZ < -2 SD) | 10.0% | [Enter %] | Medium (10–19%) |
*Source: Extracted from KNBS & ICF (2023) / MOH Records.*

**Interpretation:** As shown in Table 4.1, [explain what the figures in Table 4.1 show in 3-4 clear sentences using your own words].

#### 4.1.2 Findings for Objective 2: [Enter Objective 2 Title, e.g., Complementary Feeding Indicators]
Table 4.2 presents the extracted proportions for [enter Objective 2 indicators].

**Table 4.2: [Enter Table Title, e.g., Infant and Young Child Feeding (IYCF) Indicators (6-23 Months)]**
| Feeding Indicator | Breastfed (%) | Non-Breastfed (%) | Overall Total (%) |
| :--- | :--- | :--- | :--- |
| Minimum Meal Frequency (MMF) | [Enter %, e.g., 71%] | [Enter %] | [Enter %, e.g., 71%] |
| Minimum Dietary Diversity (MDD ≥5 groups) | [Enter %] | [Enter %] | [Enter %, e.g., 37%] |
| Minimum Acceptable Diet (MAD) | [Enter %] | [Enter %] | [Enter %, e.g., 31%] |
*Source: Extracted from KNBS & ICF (2023).*

**Interpretation:** The extracted figures in Table 4.2 demonstrate that [explain the gap between meal frequency and dietary diversity in 3-4 sentences].`;

      case "ch4.subgroup":
        return isDiploma
          ? `### 4.2 Comparison of Findings by Subgroup and Inferential Analysis (Diploma)
To address Objective 3, extracted indicators were compared across key socio-demographic subgroups and evaluated for statistical association at $\alpha = 0.05$.

**Table 4.3: Comparison of Nutritional & Feeding Indicators by Residence, Maternal Education, and Wealth**
| Subgroup Category | Stunting (%) | MDD Achieved (%) | MAD Achieved (%) | Inferential Test ($\chi^2$ / $p$-value) |
| :--- | :--- | :--- | :--- | :--- |
| **Residence:** Urban | 12.0% | [Enter %] | [Enter %] | $\chi^2 = [\text{Value}], p < 0.05$ (Significant) |
| **Residence:** Rural | 20.0% | [Enter %] | [Enter %] | |
| **Maternal Education:** None / Primary | 28.0% | [Enter %] | [Enter %] | $\chi^2 = [\text{Value}], p < 0.05$ (Significant) |
| **Maternal Education:** Secondary+ | 9.0% | [Enter %] | [Enter %] | |
| **Wealth Quintile:** Lowest | 28.0% | [Enter %] | [Enter %] | $\chi^2 = [\text{Value}], p < 0.05$ (Significant) |
| **Wealth Quintile:** Highest | 9.0% | [Enter %] | [Enter %] | |
*Source: Secondary Analysis of KDHS 2022 Tables (KNBS & ICF, 2023).*

**Interpretation of Subgroup & Inferential Results:**
1. **Urban vs. Rural Disparities:** Rural children exhibited an 8-percentage-point higher stunting prevalence (20.0%) than urban children (12.0%). Inferential comparison confirms a statistically significant association between place of residence and child nutritional outcomes ($p < 0.05$).
2. **Maternal Education and Household Wealth:** [Explain in 3-4 sentences how maternal education and household wealth quintiles influence MDD and stunting in Table 4.3].`
          : `### 4.2 Comparison of Findings Across Demographic Subgroups (Certificate)
To fulfill Objective 3, extracted secondary figures were compared across key demographic subgroups using descriptive comparison tables.

**Table 4.3: Comparison of Nutritional and Feeding Indicators Across Subgroups**
| Demographic Subgroup | Stunting Prevalence (%) | Minimum Dietary Diversity (%) | Minimum Acceptable Diet (%) | Percentage Difference |
| :--- | :--- | :--- | :--- | :--- |
| **Residence:** Urban | 12.0% | [Enter %] | [Enter %] | -8.0% lower stunting in urban |
| **Residence:** Rural | 20.0% | [Enter %] | [Enter %] | |
| **Maternal Education:** No Education | 28.0% | [Enter %] | [Enter %] | -19.0% reduction with higher education |
| **Maternal Education:** Secondary+ | 9.0% | [Enter %] | [Enter %] | |
*Source: Extracted from KDHS 2022 Summary Tables (KNBS & ICF, 2023).*

**Interpretation of Subgroup Comparisons:**
1. **Rural versus Urban Comparison:** As shown in Table 4.3, rural areas experience higher stunting (20.0%) compared to urban areas (12.0%). [Explain in 2 sentences why rural households face higher rates].
2. **Effect of Maternal Education:** [Explain in 2-3 sentences how mothers with secondary or higher education achieve better child feeding and lower stunting rates].`;

      case "ch4.discussion":
        return `### 4.3 Discussion of Findings
#### 4.3.1 Discussion on Objective 1 ([Enter Objective 1 Theme])
The findings of this secondary analysis revealed that [restate key percentage from Table 4.1]. When compared against World Health Organization (WHO) public health severity thresholds, a stunting prevalence of [enter %] represents a [moderate / high] public health concern (WHO & UNICEF, 2021). These findings are consistent with [compare with 1-2 studies from Chapter 2, e.g., national trends documented by KNBS & ICF (2023) and empirical studies in Kenyan counties].

#### 4.3.2 Discussion on Objective 2 ([Enter Objective 2 Theme])
Regarding dietary practices, the results showed that while [enter MMF %] of children met minimum meal frequency, only [enter MDD %] met minimum dietary diversity, resulting in an overall minimum acceptable diet of [enter MAD %]. This confirms that households in [enter Study Area] frequently feed children repetitive starch-based porridges (such as plain maize or millet gruel) with limited inclusion of animal-source proteins, pulses, and vitamin A-rich vegetables (MOH, 2020).

#### 4.3.3 Discussion on Objective 3 ([Enter Objective 3 Theme])
The subgroup comparison demonstrated pronounced disparities by [residence / maternal education / wealth quintile]. Mothers with post-primary education and higher household purchasing power are better positioned to purchase diverse food groups and utilize child welfare clinic counseling, corroborating the UNICEF Conceptual Framework on underlying determinants of nutrition.`;

      case "ch5.summary":
        return `### 5.1 Summary of Key Findings
This study assessed [enter study title/topic] in [enter Study Area] using verified secondary data from [enter sources]. The key findings by objective are summarized below:
1. **Summary on Objective 1:** The extracted secondary data showed that [enter key numbers/percentages found for Objective 1].
2. **Summary on Objective 2:** Analysis of dietary indicators revealed that [enter key numbers/percentages found for Objective 2].
3. **Summary on Objective 3:** Subgroup comparisons demonstrated that [enter key comparison findings${isDiploma ? " and statistical significance (p < 0.05)" : ""} for Objective 3].`;

      case "ch5.conclusions":
        return `### 5.2 Conclusions
Based on the empirical secondary findings presented in Chapter Four, the study draws three main conclusions:
1. **Conclusion on Objective 1:** [State a clear 1-2 sentence conclusion answering Research Question 1].
2. **Conclusion on Objective 2:** [State a clear 1-2 sentence conclusion answering Research Question 2, e.g., Poor dietary diversity—rather than meal frequency alone—is the primary bottleneck limiting minimum acceptable diet].
3. **Conclusion on Objective 3:** [State a clear 1-2 sentence conclusion answering Research Question 3 regarding socio-demographic disparities].`;

      case "ch5.recommendations":
        return `### 5.3 Policy and Practice Recommendations
1. **For County Nutrition Coordinators and Community Health Promoters (CHPs):** Intensify practical cooking demonstrations at child welfare clinics in [enter Study Area] focusing on enriching traditional cereal porridges with locally affordable legumes (beans, green grams, groundnuts), small fish (*omena*), eggs, and dark green leafy vegetables.
2. **For the Ministry of Health and County Government of [Enter County]:** Prioritize targeted micronutrient supplementation (Vitamin A, iron-folate, and multiple micronutrient powders) and nutrition education for vulnerable rural and low-income households identified in the subgroup analysis.
3. **For Mothers and Household Caregivers:** Practice active responsive feeding and ensure children aged 6-23 months consume foods from at least 5 of the 8 recommended food groups daily alongside continued breastfeeding.`;

      case "ch5.further_research":
        return `### 5.4 Recommendations for Further Studies
1. Future diploma or degree researchers should conduct a primary community-based 24-hour dietary recall survey in specific wards of [enter County / Study Area] to quantify exact gram intakes and micronutrient adequacy ratios.
2. Further operational research should evaluate the effectiveness of community kitchen garden and biofortified crop interventions (such as Orange-Fleshed Sweet Potato and iron-rich beans) on improving household dietary diversity in [enter Study Area].`;

      case "app.datasources":
        return `### Appendix I: Secondary Survey Archive & Data Extraction Verification Sheet

| Item No. | Official Document / Dataset Title | Issuing Institution | Publication Year | Specific Tables / Pages Extracted | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Kenya Demographic and Health Survey (KDHS) 2022 | KNBS, MOH & ICF | 2023 | Chapter 11 Tables (Child & Maternal Nutrition) | Verified ✓ |
| 2 | Kenya National Nutrition Action Plan (KNNAP) | Ministry of Health | 2020 | National Baseline & Target Indicators | Verified ✓ |
| 3 | Indicators for Assessing Infant and Young Child Feeding | WHO & UNICEF | 2021 | Operational Cut-offs (MDD, MMF, MAD) | Verified ✓ |
| 4 | [Enter Additional Report / Facility Register] | [Enter Agency] | [Year] | [Enter Tables / Pages] | Verified ✓ |`;

      case "app.workplan":
        return `### Appendix II: Project Work Plan (Gantt Schedule)

| Activity / Milestone | Month 1 | Month 2 | Month 3 | Month 4 | Responsible Person |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 1. Topic Selection & Problem Formulation | [X] | | | | Candidate & Supervisor |
| 2. Chapter 1–3 Proposal Drafting & Approval | [X] | [X] | | | Candidate & Supervisor |
| 3. Secondary Data Extraction & Verification | | [X] | [X] | | Candidate |
| 4. Statistical Analysis & Chapter 4–5 Writing | | | [X] | | Candidate |
| 5. Final Review, Binding & KNEC Submission | | | | [X] | Candidate & Supervisor |`;

      case "app.budget":
        return `### Appendix III: Research Project Budget Breakdown (KES)

| Item No. | Budget Item Description | Unit | Quantity | Unit Cost (KES) | Total Cost (KES) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internet Data Bundles (Downloading KDHS/KNBS Reports) | GB | [e.g., 20] | [e.g., 100] | [e.g., 2,000] |
| 2 | Flash Disk (32GB) & Cloud Backup Storage | Pc | 1 | [e.g., 1,200] | [e.g., 1,200] |
| 3 | Draft Printing & Photocopying for Supervision | Pages | [e.g., 150] | [e.g., 10] | [e.g., 1,500] |
| 4 | Final Report Colour Printing & Hardcover Binding (3 Copies) | Copies | 3 | [e.g., 800] | [e.g., 2,400] |
| 5 | Miscellaneous & Local Transport | Lump Sum | 1 | [e.g., 1,000] | [e.g., 1,000] |
| **TOTAL** | **Total Estimated Project Cost** | | | | **KES [e.g., 8,100]** |`;
    }
  }

  // ==========================================================================
  // TRACK 2: PRODUCT FORMULATION & TRADE PROJECT (trade_fabrication)
  // ==========================================================================
  if (type === "trade_fabrication") {
    switch (sectionKey) {
      case "prelim.abstract":
        return `### Executive Synopsis / Abstract
**Background:** Post-harvest losses and micronutrient deficiencies remain major food security challenges in Kenya. Developing nutrient-dense composite food products from locally available crops offers an affordable dietary intervention.
**Objectives:** The general objective of this project was to formulate, process, and evaluate [enter product name, e.g., a nutrient-rich composite flour/snack] using [enter Ingredient A, e.g., orange-fleshed sweet potato], [enter Ingredient B, e.g., soybean], and [enter Ingredient C, e.g., sorghum/amaranth]. Specifically, the study sought to: (1) establish three experimental blend formulations, (2) determine the proximate nutrient composition using standard AOAC methods, (3) evaluate sensory acceptability using a 9-point hedonic scale, and (4) determine unit production cost.
**Methodology:** Raw materials were sorted, washed, blanched/dried at [enter temperature, e.g., 60°C], milled, and blended in three ratios: Control (100:0), Blend F1 ([e.g., 70:30]), Blend F2 ([e.g., 60:40]), and Blend F3 ([e.g., 50:50]). Proximate analysis was conducted following AOAC (2019) procedures and compared against KEBS specification [e.g., KS EAS 779]. Sensory evaluation was carried out with [enter number, e.g., 30] semi-trained panelists.
**Key Findings:** Proximate results showed that incorporating [enter Ingredient B] increased crude protein from [enter Control %] to [enter best blend %] and ash (mineral) content to [enter %], while maintaining moisture below the 10.0% KEBS maximum limit. Sensory evaluation indicated that Blend [e.g., F2 (60:40)] achieved the highest overall acceptability score of [e.g., 7.9 ± 0.6] out of 9.0. Unit costing established a retail price of KES [enter cost] per [e.g., 500g] pack.
**Conclusion:** Blend [e.g., F2] meets KEBS nutritional and safety standards and is recommended for household nutrition and cottage-scale agro-processing.`;

      case "proposal.title":
        return `### Proposed Project Title
Formulation, Proximate Composition, and Sensory Evaluation of [Enter Product Type, e.g., Fortified Composite Porridge Flour / High-Protein Snack Biscuit] Made from [Enter Primary Ingredient A] and [Enter Ingredient B]

### Technical Rationale
This food formulation project focuses on combining [enter Ingredient A, e.g., provitamin-A rich Orange-Fleshed Sweet Potato] with [enter Ingredient B, e.g., protein-dense Soybean / Amaranth] to produce a shelf-stable, nutrient-dense [enter product type] targeted at [enter target consumers, e.g., weaning children / school-going pupils / vulnerable households].`;

      case "proposal.problem":
        return `### Statement of the Problem
Conventional commercial products in Kenyan retail markets—such as unfortified refined maize meal or wheat snacks—are predominantly high in starch but deficient in essential amino acids (such as lysine), provitamin A, iron, and zinc (MOH, 2020). At the same time, nutritious indigenous crops like [enter Ingredient A] suffer high post-harvest spoilage exceeding [enter %, e.g., 30%] during peak harvest seasons due to high moisture content and limited value-addition processing. Developing a standardized, shelf-stable composite formulation using [enter Ingredient A and Ingredient B] solves both the nutritional quality gap and post-harvest wastage while offering an affordable local product compliant with KEBS standards.`;

      case "proposal.objectives":
        return `### General Objective
To formulate, process, and evaluate the nutritional, sensory, and economic viability of [enter product name] developed from [enter raw materials].

### Specific Objectives
1. To develop three experimental composite ratios ([e.g., 70:30, 60:40, and 50:50]) of [enter Ingredient A] and [enter Ingredient B] alongside a 100% control sample.
2. To determine the proximate nutrient composition (moisture, crude protein, crude fat, crude fiber, total ash, and carbohydrates) of the formulated blends using standard AOAC (2019) methods.
3. To evaluate the organoleptic acceptability (color, aroma, taste, texture/mouthfeel, and overall acceptability) of the formulated samples using a 9-point hedonic scale.
4. To compute the unit Bill of Materials (BOM) and retail cost per [enter package weight, e.g., 500g] unit.`;

      case "proposal.rationale":
        return `### Justification and Practical Utility
1. **Nutritional Value Addition:** Combining [enter Ingredient A] and [enter Ingredient B] achieves nutritional complementation, boosting protein quality, dietary fiber, and micronutrient density.
2. **Post-Harvest Loss Reduction:** Dehydration and milling convert perishable raw produce into a low-moisture flour/product with a shelf life of over [e.g., 6 months].
3. **SME & Agro-Processing Potential:** The standardized formulation and unit costing provide a ready-to-adopt blueprint for TVET graduates, women/youth groups, and cottage food processors.`;

      case "ch1.background":
        return `### 1.1 Background to the Project
Food product formulation and value addition play a vital role in achieving Kenya's food and nutrition security goals. Across Sub-Saharan Africa, widespread reliance on single-cereal staples (primarily white maize) contributes to protein-energy malnutrition and hidden hunger (WHO & UNICEF, 2021). Composite flour and food fortification technology—defined as blending cereal, tuber, and legume flours—enables food scientists to balance amino acid profiles and enrich food matrices with natural vitamins and minerals (FAO, 2018).

[Enter Ingredient A] is widely cultivated in Kenya and is rich in [enter nutrients, e.g., beta-carotene (provitamin A), dietary fiber, and digestible carbohydrates], whereas [enter Ingredient B] provides high biological-value plant protein ([e.g., 36–40% crude protein]) and essential lipids. Processing these locally sourced raw materials under hygienic Good Manufacturing Practices (GMP) and Kenya Bureau of Standards (KEBS) specifications creates a high-value food product tailored to Kenyan consumers.`;

      case "ch1.problem":
        return `### 1.2 Statement of the Problem
Despite the high agricultural production of [enter Ingredient A] and [enter Ingredient B] in Kenya, their utilization in convenient, shelf-stable commercial products remains low. Fresh [enter Ingredient A] is highly perishable due to a moisture content above [e.g., 70%], leading to rapid microbial spoilage and post-harvest economic losses for smallholder farmers. Meanwhile, commercially fortified infant and family foods retail at high prices (often exceeding KES [e.g., 350–500] per 500g), placing them out of reach for low- and middle-income households. Furthermore, improper roasting or blending ratios can result in anti-nutritional factors (such as trypsin inhibitors) or poor sensory palatability. There is therefore a clear technical need to optimize the processing parameters and blend ratios of [enter Ingredient A and B] to produce an affordable, KEBS-compliant product.`;

      case "ch1.objectives":
        return `### 1.3 Objectives of the Project
#### 1.3.1 General Objective
To formulate and evaluate the proximate composition, sensory acceptability, and production cost of [enter product name] made from [enter Ingredient A] and [enter Ingredient B].

#### 1.3.2 Specific Objectives
1. To formulate three composite blends ([e.g., F1 = 70:30, F2 = 60:40, F3 = 50:50]) of [enter Ingredient A] and [enter Ingredient B] against a 100% control sample.
2. To determine the proximate composition (moisture, ash, crude protein, crude fat, crude fiber, and total carbohydrates) of the formulated samples using AOAC methods.
3. To assess sensory attributes (appearance/color, aroma, taste, texture, and overall acceptability) using a 9-point hedonic scale.
4. To determine the unit cost of production and economic feasibility per [e.g., 500g] retail pack.`;

      case "ch1.questions":
        return `### 1.4 Research Questions
1. What is the optimal formulation ratio of [enter Ingredient A] and [enter Ingredient B] for producing a uniform, stable product?
2. How does varying the proportion of [enter Ingredient B] affect the moisture, crude protein, fat, ash, fiber, and energy content of the product compared to KEBS standards?
3. Which experimental blend achieves the highest consumer sensory acceptability score on a 9-point hedonic scale?
4. What is the unit production cost and break-even selling price per [e.g., 500g] package?`;

      case "ch1.justification":
        return `### 1.5 Justification and Significance
1. **Target Consumers:** Provides an affordable, nutrient-dense product supplying essential protein, energy, and micronutrients for [enter target group].
2. **Smallholder Farmers & Agro-Processors:** Creates market demand for indigenous tubers, pulses, and grains while reducing post-harvest wastage through dehydration and milling.
3. **Compliance with National Standards:** Demonstrates practical application of AOAC analytical testing, HACCP food safety controls, and KEBS composite flour/product specifications.`;

      case "ch1.scope":
        return `### 1.6 Scope and Delimitations
This project was conducted at the Food Processing Workshop and Food Chemistry Laboratory at [Enter Institution Name]. The scope was delimited to: (a) sourcing raw [enter Ingredient A and B] from [Enter Market/Locality], (b) formulating three experimental blends plus one control, (c) conducting proximate analysis (AOAC, 2019) and 9-point hedonic sensory evaluation ($n = [\text{e.g., } 30]$ panelists), and (d) computing batch and unit production costs.`;

      case "ch1.terms":
        return `### 1.7 Definition of Operational Terms
- **Composite Formulation:** A strategic blend of two or more plant flours (such as tuber, cereal, and legume flours) designed to complement amino acid and micronutrient profiles.
- **Proximate Analysis:** Quantitative chemical determination of six major food components: moisture, crude protein, crude lipid (fat), crude fiber, total ash (minerals), and nitrogen-free extract (digestible carbohydrates) (AOAC, 2019).
- **Hedonic Scale (9-Point):** A standardized organoleptic rating scale ranging from 1 (*Dislike Extremely*) to 9 (*Like Extremely*) used to measure consumer preference.
- **HACCP:** Hazard Analysis and Critical Control Points—a preventive food safety system identifying biological, chemical, and physical hazards during processing.`;

      case "ch2.intro":
        return `### 2.1 Introduction to Literature Review
This chapter reviews technical literature on the botanical and nutritional properties of [enter Ingredient A] and [enter Ingredient B] (Section 2.2), food processing and preservation unit operations (Section 2.3), previous empirical formulation studies (Section 2.4), and technical gaps in existing commercial products (Section 2.5).`;

      case "ch2.background":
        return `### 2.2 Theoretical and Nutritional Background of Raw Materials
1. **[Enter Primary Ingredient A, e.g., Orange-Fleshed Sweet Potato (Ipomoea batatas)]:** [Describe its nutritional composition: e.g., rich in beta-carotene (provitamin A), energy-dense starch, vitamin C, and potassium, with low glycemic index].
2. **[Enter Secondary Ingredient B, e.g., Soybean (Glycine max) / Amaranth]:** [Describe its nutritional value: e.g., contains 36–40% high-quality protein rich in lysine (which is limiting in cereals/tubers), 18–20% polyunsaturated oil, iron, and calcium].
3. **Nutritional Complementation Principle:** Blending [enter Ingredient A] with [enter Ingredient B] creates a synergistic nutrient profile that satisfies FAO/WHO and KEBS dietary quality benchmarks.`;

      case "ch2.processing":
        return `### 2.3 Processing Technologies and Preservation Principles
- **Cleaning, Sorting, and Peeling:** Removes physical foreign matter, soil, and damaged raw material to lower initial microbial load.
- **Blanching / Roasting (Thermal Pre-treatment):** Blanching tubers in hot water or mild citric acid prevents enzymatic browning (polyphenol oxidase activity), while controlled roasting of legumes at [e.g., 110–120°C for 15–20 minutes] inactivates anti-nutritional factors (trypsin inhibitors, phytic acid, and hemagglutinins) and develops desirable nutty aroma compounds via Maillard reactions.
- **Dehydration / Drying:** Reducing moisture content below 10.0% lowers water activity ($a_w < 0.60$), inhibiting bacterial, yeast, and mold growth (including *Aspergillus* aflatoxin production) (KEBS, 2021).`;

      case "ch2.related":
        return `### 2.4 Review of Related Product Formulations
Previous food science studies have demonstrated the feasibility of composite formulations in East Africa. Studies on tuber-legume composite flours show that substituting [20% to 40%] of starchy tuber/cereal flour with roasted legume flour increases crude protein content twofold while maintaining acceptable viscosity and sensory scores [cite verified sources such as KEBS (2021), AOAC (2019), FAO (2018)]. However, excessive legume substitution above 50% can introduce beany off-flavors and darken product color, underscoring the need to evaluate multiple blend ratios (70:30, 60:40, 50:50).`;

      case "ch2.gap":
        return `### 2.5 Knowledge Gaps in Commercial Products
Most commercial products in local retail outlets either rely on 100% unfortified cereal flour or use synthetic premixes without utilizing locally abundant [enter Ingredient A and B]. Furthermore, cottage processors often lack standardized blend ratios verified by both proximate laboratory analysis and hedonic sensory testing. This project establishes an optimized, KEBS-aligned formulation protocol.`;

      case "ch3.design":
        return `### 3.1 Formulation Design and Recipe Specifications
This project utilized a **Completely Randomized Experimental Formulation Design** consisting of four treatments (one 100% Control and three composite experimental blends: F1, F2, and F3) as detailed in Table 3.1.

**Table 3.1: Experimental Formulation Blend Ratios (per 1,000g Batch)**
| Sample Code | Formulation Description | [Ingredient A] (%) | [Ingredient B] (%) | [Ingredient C / Minor] (%) | Total Batch (g) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Sample C0 (Control)** | 100% Baseline Control | 100% (1000g) | 0% (0g) | 0% (0g) | 1,000g |
| **Sample F1** | Blend Ratio 1 (70:30) | 70% (700g) | 30% (300g) | [0%] | 1,000g |
| **Sample F2** | Blend Ratio 2 (60:40) | 60% (600g) | 40% (400g) | [0%] | 1,000g |
| **Sample F3** | Blend Ratio 3 (50:50) | 50% (500g) | 50% (500g) | [0%] | 1,000g |`;

      case "ch3.materials":
        return `### 3.2 Raw Materials, Reagents, and Equipment
1. **Raw Materials:** Fresh, mature [enter Ingredient A] and clean, food-grade [enter Ingredient B] were procured from certified suppliers at [Enter Local Market / Agricultural Depot].
2. **Processing Equipment:** Stainless steel knives, digital weighing balance (0.01g precision), thermostatic cabinet dehydrator / oven, roasting pan, laboratory hammer mill with 0.5mm sieve mesh, and impulse heat sealer.
3. **Laboratory Analytical Apparatus (AOAC):** Moisture drying oven, muffle furnace (550°C), Kjeldahl digestion and distillation unit, Soxhlet fat extractor, and desiccator.`;

      case "ch3.procedure":
        return `### 3.3 Standard Operating Processing Procedure (SOP)
1. **Sorting and Cleaning:** Raw [enter Ingredient A] and [enter Ingredient B] were sorted to remove damaged units, stones, and foreign matter, then washed thoroughly in potable running water.
2. **Pre-Treatment:**
   - *[Ingredient A]:* Peeled, sliced into uniform 2–3mm chips, and blanched at [e.g., 85°C for 3 minutes] to prevent enzymatic browning.
   - *[Ingredient B]:* Soaked/cleaned, drained, and mildly roasted at [e.g., 115°C for 20 minutes] to inactivate trypsin inhibitors and enhance flavor, then dehulled.
3. **Dehydration:** Prepared materials were dried in a cabinet dehydrator at [e.g., 60°C for 6–8 hours] until brittle with moisture content below 10%.
4. **Milling and Sieving:** Dried ingredients were milled separately and passed through a 250–500 micron stainless steel sieve to obtain fine, uniform flour.
5. **Formulation Blending & Packaging:** Flours were weighed according to Table 3.1 (70:30, 60:40, 50:50), homogenized for 10 minutes, and hermetically sealed in food-grade moisture-barrier pouches.`;

      case "ch3.safety":
        return `### 3.4 Quality Control and Food Safety Protocols (HACCP)

| Processing Step | Potential Hazard | Critical Control Point (CCP) Limit | Corrective / Preventive Action |
| :--- | :--- | :--- | :--- |
| 1. Raw Material Reception | Mold / Aflatoxin / Stones | Zero visible mold; clean grade | Reject moldy grains; sort & wash in potable water |
| 2. Thermal Roasting | Survival of anti-nutrients / pathogens | 115–120°C for 15–20 mins | Monitor thermometer & timer continuously |
| 3. Cabinet Drying | High residual moisture (>10%) | Final moisture ≤ 10.0% (KEBS limit) | Extend drying time until target moisture is met |
| 4. Milling & Packaging | Metal fragments / moisture ingress | Intact 0.5mm sieve; airtight seal | Inspect sieve before/after milling; check seal integrity |`;

      case "ch3.sensory_method":
        return `### 3.5 Sensory Evaluation Protocol
Sensory evaluation was conducted in the Food Science Sensory Laboratory using [enter number, e.g., 30] semi-trained panelists comprising trainers and students familiar with composite food products.
- **Sample Preparation & Coding:** Uniform porridge/product samples were prepared from Control (C0), F1, F2, and F3 using identical cooking time and water-to-flour ratios. Samples were served warm in identical white cups blinded with random 3-digit codes (e.g., ` + "`247`, `519`, `834`, `602`" + `).
- **Hedonic Rating:** Panelists rinsed their palates with potable water between samples and rated **Color/Appearance, Aroma, Taste, Texture/Mouthfeel, and Overall Acceptability** on a 9-point Hedonic Scale (9 = *Like Extremely*, 5 = *Neither Like nor Dislike*, 1 = *Dislike Extremely*).`;

      case "ch3.lab_method":
        return `### 3.6 Proximate Analysis and Laboratory Testing (AOAC, 2019)
Proximate nutrient determinations were carried out in triplicate following Official Methods of Analysis (AOAC, 2019):
1. **Moisture Content (AOAC Method 925.10):** Determined by oven-drying 5.0g sample at 105°C to constant weight.
2. **Total Ash (AOAC Method 923.03):** Determined by dry ashing in a muffle furnace at 550°C for 5 hours.
3. **Crude Protein (AOAC Method 960.52):** Determined by Micro-Kjeldahl nitrogen digestion, distillation, and titration ($\text{Crude Protein %} = \%N \times 6.25$).
4. **Crude Fat (AOAC Method 920.39):** Determined by Soxhlet solvent extraction using petroleum ether.
5. **Crude Fiber (AOAC Method 962.09):** Determined by sequential acid ($1.25\%\text{ H}_2\text{SO}_4$) and alkali ($1.25\%\text{ NaOH}$) digestion.
6. **Total Carbohydrates & Energy:** Carbohydrates calculated by difference: $100 - (\text{Moisture} + \text{Protein} + \text{Fat} + \text{Ash} + \text{Fiber})$. Gross energy (kcal/100g) computed using Atwater factors: $(4 \times \text{Protein}) + (9 \times \text{Fat}) + (4 \times \text{Carbohydrate})$.`;

      case "ch4.sensory_results":
        return `### 4.1 Sensory Evaluation Results
Table 4.1 presents the mean sensory scores (on a 9-point hedonic scale) across the four experimental samples ($n = [\text{e.g., } 30]$ panelists).

**Table 4.1: Mean Sensory Evaluation Scores of Formulated Samples (9-Point Hedonic Scale)**
| Sample Code | Color / Appearance | Aroma | Taste | Texture / Mouthfeel | Overall Acceptability |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **C0 (100% Control)** | [e.g., 7.4] | [e.g., 6.8] | [e.g., 6.9] | [e.g., 7.2] | [e.g., 7.0] |
| **F1 (70:30 Blend)** | [e.g., 7.8] | [e.g., 7.5] | [e.g., 7.6] | [e.g., 7.7] | [e.g., 7.6] |
| **F2 (60:40 Blend)** | [e.g., 8.1] | [e.g., 8.0] | [e.g., 8.2] | [e.g., 7.9] | **[e.g., 8.1 (Highest)]** |
| **F3 (50:50 Blend)** | [e.g., 7.1] | [e.g., 7.2] | [e.g., 6.8] | [e.g., 7.0] | [e.g., 7.0] |

**Interpretation of Sensory Findings:**
As shown in Table 4.1, Sample **[e.g., F2 (60:40)]** recorded the highest mean overall acceptability score of **[enter score, e.g., 8.1]** (*Like Very Much*), outperforming both the control and the 50:50 blend. [Explain in 2-3 sentences how aroma, color, and taste varied across the blends].`;

      case "ch4.proximate_results":
        return `### 4.2 Proximate Composition and Laboratory Findings
Table 4.2 summarizes the proximate nutrient composition (per 100g dry weight basis) compared against Kenya Bureau of Standards (KEBS KS EAS 779) composite flour requirements.

**Table 4.2: Proximate Nutrient Composition of Formulated Blends vs. KEBS Standard (per 100g)**
| Parameter | Control (C0) | Blend F1 (70:30) | Blend F2 (60:40) | Blend F3 (50:50) | KEBS Standard (KS EAS 779) |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Moisture (%) | [e.g., 8.4] | [e.g., 8.1] | [e.g., 7.9] | [e.g., 7.6] | Max 10.0% – 12.0% |
| Crude Protein (%) | [e.g., 5.8] | [e.g., 13.4] | [e.g., 16.2] | [e.g., 18.9] | Min 12.0% (Fortified/Comp.) |
| Crude Fat (%) | [e.g., 1.4] | [e.g., 5.2] | [e.g., 6.8] | [e.g., 8.1] | Max 10.0% |
| Total Ash / Minerals (%) | [e.g., 2.1] | [e.g., 2.9] | [e.g., 3.3] | [e.g., 3.6] | Max 4.0% |
| Crude Fiber (%) | [e.g., 2.3] | [e.g., 3.1] | [e.g., 3.4] | [e.g., 3.8] | Max 5.0% |
| Carbohydrates (%) | [e.g., 80.0] | [e.g., 67.3] | [e.g., 62.4] | [e.g., 58.0] | By difference |
| Energy (kcal/100g) | [e.g., 355.8] | [e.g., 369.6] | [e.g., 375.6] | [e.g., 380.5] | Min 350 kcal/100g |

**Interpretation of Proximate Results:**
1. **Moisture and Shelf Stability:** All formulated samples recorded moisture levels between [enter range, e.g., 7.6% and 8.4%], well below the KEBS maximum limit of 10.0%, guaranteeing microbial stability during ambient storage.
2. **Protein and Energy Enrichment:** Increasing [enter Ingredient B] substitution from 0% to 40% (Blend F2) increased crude protein from [e.g., 5.8%] to [e.g., 16.2%] and energy density to [e.g., 375.6 kcal/100g], exceeding KEBS minimum nutritional requirements.`;

      case "ch4.discussion":
        return `### 4.3 Discussion of Findings
The experimental results confirm that blending [enter Ingredient A] with [enter Ingredient B] significantly improves both the nutritional profile and organoleptic quality of the product.
1. **Proximate Nutrient Synergism:** The substantial rise in crude protein ([enter %]) and total ash ([enter %]) in Blend F2 and F3 is directly attributable to the high protein and mineral density of [enter Ingredient B], aligning with composite formulation standards established by KEBS (2021) and FAO (2018).
2. **Sensory Balance in Blend F2 (60:40):** While Blend F3 (50:50) had the highest crude protein, panelists preferred Blend F2 (60:40) because it balanced the natural sweetness and golden color of [enter Ingredient A] with the roasted nutty flavor of [enter Ingredient B] without any residual legume astringency.`;

      case "ch4.cost":
        return `### 4.4 Unit Costing and Economic Feasibility (Bill of Materials)
Table 4.3 details the production cost for a standard batch yielding **10 kg (20 retail packs of 500g each)** of the optimal formulation (Blend F2: 60:40).

**Table 4.3: Bill of Materials and Unit Costing (10 kg Batch = 20 Packs of 500g)**
| Cost Component | Quantity Required | Unit Cost (KES) | Total Batch Cost (KES) |
| :--- | :--- | :--- | :--- |
| 1. Raw [Ingredient A] (including peeling loss) | [e.g., 12 kg fresh] | [e.g., 60 / kg] | [e.g., 720] |
| 2. Raw [Ingredient B] (cleaned food grade) | [e.g., 4.5 kg] | [e.g., 160 / kg] | [e.g., 720] |
| 3. Electricity / Drying & Milling Energy | Batch run | [e.g., 300] | [e.g., 300] |
| 4. Food-Grade Printed Kraft/Laminated Pouches (500g) | 20 pcs | [e.g., 18 / pc] | [e.g., 360] |
| 5. Direct Labor & Hygiene Consumables | Batch | [e.g., 300] | [e.g., 300] |
| **Total Production Cost (20 Packs of 500g)** | | | **KES [e.g., 2,400]** |
| **Unit Production Cost per 500g Pack** | | | **KES [e.g., 120]** |
| **Recommended Retail Price (25% Margin)** | | | **KES [e.g., 150]** |`;

      case "ch5.summary":
        return `### 5.1 Summary of Findings
1. **Formulation:** Three composite blends (70:30, 60:40, 50:50) of [enter Ingredient A] and [enter Ingredient B] were successfully developed using standardized blanching, roasting, cabinet drying (60°C), and fine milling (0.5mm).
2. **Proximate Quality:** Crude protein increased from [enter %] in the control to [enter %] in the 60:40 blend, while moisture remained below [enter %], satisfying KEBS standards.
3. **Sensory Acceptability:** Blend F2 (60:40) ranked highest in overall acceptability ([enter score] / 9.0).
4. **Economic Feasibility:** A 500g retail pack costs KES [enter cost] to produce and retails competitively at KES [enter price].`;

      case "ch5.conclusions":
        return `### 5.2 Conclusions
1. Incorporating 40% [enter Ingredient B] into 60% [enter Ingredient A] (Blend F2) yields a nutritionally superior product that meets KEBS moisture, protein, and energy standards.
2. Controlled thermal roasting and cabinet dehydration produce a highly palatable product with strong consumer acceptance across color, aroma, taste, and texture.`;

      case "ch5.recommendations":
        return `### 5.3 Recommendations for Commercial Scale-Up
1. **Adoption of the 60:40 Formulation:** Local agro-processors, school feeding programs, and household caregivers should adopt the 60:40 blend ratio for optimal nutrition and taste.
2. **KEBS Standardization:** Emerging SMEs commercializing this formulation should apply for the KEBS Standardization Mark (S-Mark) under KS EAS 779 and maintain moisture-proof laminated packaging.`;

      case "ch5.further_research":
        return `### 5.4 Recommendations for Further Studies
1. Conduct a 6-month real-time and accelerated shelf-life stability study monitoring peroxide value (lipid oxidation) and total plate count under different packaging materials.
2. Determine specific micronutrient retention (beta-carotene, iron, and zinc bioavailability) after cooking.`;

      case "app.sensory":
        return `### Appendix I: 9-Point Hedonic Sensory Evaluation Score Sheet

**Panelist Code:** _________   **Date:** ______________
**Instruction:** Please taste each coded sample from left to right, rinse your mouth with water between samples, and score each attribute using the 9-point scale below:
*(9 = Like Extremely, 8 = Like Very Much, 7 = Like Moderately, 6 = Like Slightly, 5 = Neither Like nor Dislike, 4 = Dislike Slightly, 3 = Dislike Moderately, 2 = Dislike Very Much, 1 = Dislike Extremely)*

| Sample Code | Color / Appearance (1–9) | Aroma (1–9) | Taste (1–9) | Texture / Mouthfeel (1–9) | Overall Acceptability (1–9) | Comments |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **247 (C0)** | | | | | | |
| **519 (F1)** | | | | | | |
| **834 (F2)** | | | | | | |
| **602 (F3)** | | | | | | |`;

      case "app.workplan":
        return `### Appendix II: Project Work Plan (Gantt Chart)

| Milestone Activity | Month 1 | Month 2 | Month 3 | Month 4 |
| :--- | :---: | :---: | :---: | :---: |
| 1. Proposal Writing & Recipe Design | [X] | | | |
| 2. Raw Material Sourcing & Pilot Processing | | [X] | | |
| 3. Proximate Lab Analysis (AOAC) & Sensory Evaluation | | [X] | [X] | |
| 4. Data Analysis, Costing & Final Report Binding | | | [X] | [X] |`;

      case "app.budget":
        return `### Appendix III: Project Budget Breakdown (KES)

| Item No. | Item Description | Quantity | Unit Cost (KES) | Total Cost (KES) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Raw Ingredients ([Ingredient A] & [Ingredient B]) | 20 kg | [e.g., 120] | [e.g., 2,400] |
| 2 | Packaging Pouches & Sensory Evaluation Cups | 1 Pack | [e.g., 1,200] | [e.g., 1,200] |
| 3 | Proximate Laboratory Reagents & Testing Fee | 4 Samples | [e.g., 800] | [e.g., 3,200] |
| 4 | Printing, Photocopying & Hardcover Binding (3 Copies) | 3 Copies | [e.g., 800] | [e.g., 2,400] |
| **TOTAL** | **Total Project Expenditure** | | | **KES [e.g., 9,200]** |`;
    }
  }

  // ==========================================================================
  // TRACK 3: ENTERPRISE BUSINESS PLAN (business_plan)
  // ==========================================================================
  if (type === "business_plan") {
    switch (sectionKey) {
      case "prelim.executive_summary":
        return `### Executive Summary
**1. Business Description:** [Enter Enterprise Name] is a [Sole Proprietorship / Partnership] agro-processing enterprise located in [Enter Town, County], specializing in the manufacture and distribution of [enter core products, e.g., KEBS-compliant fortified composite porridge flours and healthy value-added snacks].
**2. Market Opportunity & Marketing Plan:** The enterprise targets households, child welfare clinics, ECDE school feeding programs, and retail mini-supermarkets in [Enter County], addressing a total addressable market of [enter number] customers with a projected Year 1 market share of [e.g., 12%].
**3. Organization & Management:** The business is led by the founder, a trained ${courseName} graduate, supported by a lean team of [e.g., 4] skilled staff operating under full County Public Health, KRA, and KEBS compliance.
**4. Operational & Production Plan:** Utilizing a semi-automated processing line (cabinet dehydrator, stainless steel hammer mill, and digital mixer), the facility has a monthly production capacity of [e.g., 4,000 kg] ([e.g., 8,000 packs of 500g]).
**5. Financial Summary:** The enterprise requires an initial start-up capital of **KES [e.g., 450,000]**, funded through owner equity (KES [e.g., 250,000]) and a Youth/MSEA enterprise loan (KES [e.g., 200,000]). Year 1 projected revenue is **KES [e.g., 2,400,000]** with a net profit after tax of **KES [e.g., 480,000]** and a break-even volume of **[e.g., 1,150] units/month**.`;

      case "proposal.title":
        return `### Enterprise Title and Commercial Concept
**Business Name:** [Enter Registered Business Name, e.g., NutriHarvest Foods Enterprises]
**Proposed Location:** [Enter Market / Town / Sub-County / County]
**Core Products:** [Enter Flagship Food/Nutrition Products and Pack Sizes, e.g., 500g & 1kg Fortified OFSP-Soy-Amaranth Composite Flour]
**Commercial Rationale:** [Explain in 2-3 sentences why this food enterprise is needed in your selected town/county].`;

      case "proposal.problem":
        return `### Market Need and Consumer Problem
Households, schools, and health facilities in [Enter Town / County] face a shortage of affordable, hygienically packaged, nutrient-dense composite foods. Existing supermarket brands retail at KES [e.g., 320–450] per 500g—which is unaffordable for most families—while informal open-air market millers lack moisture control, hygienic packaging, and KEBS quality assurance. [Enter Business Name] bridges this gap by supplying laboratory-tested, hermetically sealed nutritious products at an accessible retail price of KES [e.g., 150] per 500g.`;

      case "proposal.objectives":
        return `### Commercial and Operational Objectives
1. To establish a KEBS-compliant food processing workshop in [Enter Town] with a monthly output of [e.g., 3,000–5,000] packs within the first quarter of operation.
2. To capture a [e.g., 10%–15%] market share among retail shops, clinics, and ECDE schools in [Enter Sub-County] during Year 1.
3. To achieve monthly break-even sales by Month [e.g., 5] and generate gross annual revenue of KES [e.g., 2,400,000] in Year 1.`;

      case "proposal.rationale":
        return `### Economic Feasibility and Socio-Economic Justification
1. **Direct Employment & Farmer Linkages:** Creates [e.g., 4] direct jobs at the processing unit and provides guaranteed farmgate off-take for [e.g., 25+] local smallholder farmers growing sweet potatoes, sorghum, millet, and pulses.
2. **Community Nutrition Impact:** Reduces childhood stunting and micronutrient deficiencies by improving household access to affordable fortified foods.`;

      case "ch1.name":
        return `### 1.1 Business Name and Brand Identity
- **Registered Business Name:** [Enter Business Name]
- **Brand Slogan:** "[Enter Slogan, e.g., Nourishing Generations Naturally]"
- **Postal & Digital Address:** P.O. Box [XXXX]-[Code], [Town]; Tel: [+254 7XX XXX XXX]; Email: [info@business.co.ke]
- **Logo Symbolism:** The brand logo features [describe visual elements, e.g., a golden grain sheaf and green leaf inside a shield], symbolizing agricultural freshness, verified nutritional protection, and Kenyan quality.`;

      case "ch1.location":
        return `### 1.2 Business Location and Physical Infrastructure
[Enter Business Name] will be situated at [Enter Exact Plot / Commercial Centre / Road] in [Enter Town, County]. This location was selected based on four strategic advantages:
1. **Proximity to Raw Material Suppliers:** Located within [e.g., 15 km] of major farm aggregation markets in [Enter Area].
2. **Utilities & Infrastructure:** Connected to reliable 3-phase KPLC electricity, county piped potable water, and tarmacked transport routes.
3. **Access to Target Customers:** Walking distance to [enter local markets, hospitals/clinics, and wholesale distributors].`;

      case "ch1.ownership":
        return `### 1.3 Form of Business Ownership
The enterprise is registered as a **[Sole Proprietorship / Partnership]** under the Registration of Business Names Act (Cap 499, Laws of Kenya) via the eCitizen Business Registration Service (BRS).
- **Principal Proprietor / Managing Director:** [Enter Your Full Name]
- **Capital Contribution Structure:** The proprietor contributes [e.g., 55%] (KES [e.g., 250,000]) from personal/family equity, complemented by [e.g., 45%] (KES [e.g., 200,000]) from [e.g., Youth Enterprise Development Fund / Microfinance].`;

      case "ch1.nature":
        return `### 1.4 Nature of Business and Industry Sector
The business operates within Kenya's **Agro-Processing and Food Manufacturing Sector** (Standard Industrial Classification: Manufacture of Grain Mill and Nutritious Food Products). Value addition of indigenous drought-tolerant crops and biofortified tubers is a priority growth sector under Kenya's Bottom-Up Economic Transformation Agenda (BETA) and Vision 2030.`;

      case "ch1.products":
        return `### 1.5 Products and Services Offered
| Product Line | Pack Size | Key Ingredients & Nutrient Claim | Target Wholesale Price (KES) | Recommended Retail Price (KES) |
| :--- | :--- | :--- | :---: | :---: |
| **1. [Flagship Product, e.g., NutriGrow Porridge Flour]** | 500g & 1kg | OFSP (60%), Roasted Soy (30%), Amaranth (10%) — Rich in Vitamin A & Protein | [130 / 250] | [150 / 290] |
| **2. [Secondary Product, e.g., Family Millets Blend]** | 1kg & 2kg | Finger Millet, Sorghum & Groundnut — High Iron & Calcium | [220 / 420] | [250 / 480] |
| **3. Nutrition Formulation Advisory** | Custom Batch | Institutional bulk blending for schools & clinics | Contract | Contract |`;

      case "ch1.mission":
        return `### 1.6 Vision, Mission, and Core Values
- **Vision Statement:** To be the leading processor of affordable, safe, and nutrient-dense composite foods in [Enter County / Region].
- **Mission Statement:** To formulate, manufacture, and distribute high-quality, KEBS-certified nutritious foods from locally sourced crops while empowering smallholder farmers and improving household nutrition.
- **Core Values:** (1) Food Safety & Hygiene (HACCP), (2) Nutritional Integrity, (3) Affordability, and (4) Customer Trust.`;

      case "ch1.goals":
        return `### 1.7 Business Goals and Objectives
- **Short-Term Goals (Year 1):** Obtain KEBS S-Mark permit, achieve monthly sales of [e.g., 1,600+] packs, break even within [e.g., 5] months, and onboard [e.g., 30] retail stockists.
- **Medium- to Long-Term Goals (Years 2–3):** Expand monthly production capacity by [e.g., 40%], secure institutional supply contracts with [e.g., 10] ECDE/primary schools, and introduce ready-to-eat extruded snacks.`;

      case "ch1.justification":
        return `### 1.8 Justification and Commercial Viability
Rising consumer health consciousness, urbanization, and county school feeding initiatives have created sustained demand for convenient, pre-cooked/fast-cooking fortified flours. Sourcing raw materials directly from local farmers during harvest seasons ensures a healthy gross profit margin of **[e.g., 38%–45%]**.`;

      case "ch1.entry":
        return `### 1.9 Entry and Growth Strategy
1. **Market Penetration Entry:** Launch with competitive introductory pricing (15% below national supermarket brands), free wet-sampling demonstrations outside maternal-child health (MCH) clinics, and attractive 15% retail margins for local shopkeepers.
2. **Phased Expansion:** Scale distribution across neighboring sub-counties in Year 2 using branded boda-boda/van route deliveries.`;

      case "ch1.swot":
        return `### 1.10 SWOT Analysis
| Category | Key Factors Identified | Strategic Action / Mitigation |
| :--- | :--- | :--- |
| **Strengths** | Qualified Food Science/Nutrition founder; KEBS-aligned formulation; lower unit cost than imported brands. | Highlight nutrient composition & hygiene on packaging labels. |
| **Weaknesses** | New brand identity; limited initial working capital for mass advertising. | Use targeted clinic activations, CHPs, and WhatsApp business catalog. |
| **Opportunities** | Growing demand for healthy weaning foods; County ECDE feeding tenders. | Register for County AGPO (Youth/Women) procurement tenders. |
| **Threats** | Seasonal fluctuations in raw crop prices; informal uncertified millers. | Sign forward supply agreements with farmer groups & maintain dry storage. |`;

      case "ch2.customers":
        return `### 2.1 Potential Customers and Market Segments
1. **Household Consumers (60% of Revenue):** Mothers and caregivers with children aged 6–59 months, pregnant/lactating women, and elderly persons in [Enter Town/County].
2. **Retail Stockists & Mini-Supermarkets (25% of Revenue):** Local minimarts, community pharmacies/chemists, and cereal shops stocking 500g and 1kg packs.
3. **Institutional Buyers (15% of Revenue):** ECDE centers, primary schools, and private maternity/nutrition clinics.`;

      case "ch2.demand":
        return `### 2.2 Market Share and Projected Total Demand
In [Enter Sub-County / Town], an estimated [e.g., 15,000] households purchase nutritious porridge and family flours monthly, representing a total addressable market of approximately [e.g., 30,000 kg/month]. [Enter Business Name] targets a realistic initial market share of **[e.g., 5%–8%]** in Year 1 ([e.g., 1,600–2,000 packs/month]), growing to **[e.g., 12%]** by Year 3.`;

      case "ch2.competitors":
        return `### 2.3 Competitor Analysis
| Competitor Category | Strengths | Weaknesses | Our Competitive Advantage |
| :--- | :--- | :--- | :--- |
| **National Supermarket Brands** | Strong brand recognition; wide shelf space | High retail price (KES 300–450/500g) | 40% more affordable (KES 150/500g) with fresh local ingredients |
| **Informal Posho / Open-Air Millers** | Low price; custom mixing on spot | Poor hygiene; high moisture; no KEBS mark or nutrient standardization | Hermetically sealed, lab-tested proximate ratios, KEBS & Public Health certified |`;

      case "ch2.pricing":
        return `### 2.4 Pricing Strategy and Cost Structure
The enterprise applies a **Cost-Plus and Competitive Value Pricing Strategy**:
- **Direct Unit Production Cost (500g Pack):** KES [e.g., 105]
- **Wholesale Distributor Price (24% Markup):** KES [e.g., 130]
- **Recommended Retail Price (RRP):** KES [e.g., 150] (allowing retailers KES 20 profit per pack while remaining highly affordable for consumers).`;

      case "ch2.promotion":
        return `### 2.5 Advertising and Sales Promotion Strategy
1. **Clinic & Market Wet-Sampling:** Bi-weekly porridge tasting booths at market centers and health clinic open days.
2. **Point-of-Sale Branding:** Branded shelf talkers, posters, and clean display racks for partner minimarts.
3. **Digital & Community Referral:** WhatsApp Business ordering line with free local delivery on orders above 1 bale (12 packs).`;

      case "ch2.distribution":
        return `### 2.6 Distribution Strategy and Channels
` + "`[Manufacturing Workshop] -> [Wholesale / Minimarts & Clinics (70%)] + [Direct Factory Shop Sales (30%)] -> [Final Consumers]`" + `
Deliveries to retail stockists within [Enter Town] will be executed twice weekly using a dedicated delivery motorcycle/tuk-tuk to minimize transport overheads.`;

      case "ch2.forecast":
        return `### 2.7 Sales Forecast and 3-Year Revenue Projections

**Table 2.1: Projected Sales Volume and Revenue (Years 1, 2, and 3)**
| Period | Monthly Volume (500g Equiv. Units) | Annual Volume (Units) | Avg. Selling Price (KES) | Total Annual Revenue (KES) |
| :--- | :---: | :---: | :---: | :---: |
| **Year 1** | [e.g., 1,600] | [e.g., 19,200] | [e.g., 140] | **KES [e.g., 2,688,000]** |
| **Year 2 (+20% Growth)** | [e.g., 1,920] | [e.g., 23,040] | [e.g., 145] | **KES [e.g., 3,340,800]** |
| **Year 3 (+25% Growth)** | [e.g., 2,400] | [e.g., 28,800] | [e.g., 150] | **KES [e.g., 4,320,000]** |`;

      case "ch3.structure":
        return `### 3.1 Organizational Structure (Organogram)
\`\`\`
                  +--------------------------------------+
                  |  Managing Director / Lead Nutrition  |
                  |      & Food Technologist (Owner)     |
                  +------------------+-------------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
+------+---------------+    +--------+--------------+    +---------+-------------+
| Production & Quality |    | Sales, Marketing &    |    | Part-Time Accounts &  |
| Technician (1 Staff) |    | Delivery Rep (1 Staff)|    | Store Clerk (1 Staff) |
+----------------------+    +-----------------------+    +-----------------------+
\`\`\``;

      case "ch3.management":
        return `### 3.2 Management Team Background
- **Managing Director & Quality Lead ([Enter Your Name]):** Holds a ${courseName} from [Enter Institution Name], with hands-on training in food formulation, AOAC proximate analysis, HACCP hygiene management, and entrepreneurship. Responsible for quality assurance, formulation supervision, procurement, and overall financial control.`;

      case "ch3.staffing":
        return `### 3.3 Key Personnel, Qualifications, and Duties
| Position | No. | Minimum Qualification | Core Duties & Responsibilities |
| :--- | :---: | :--- | :--- |
| **1. Managing Director / QC Lead** | 1 | ${courseName} | Formulation ratios, quality control, licensing, financial management |
| **2. Production & Mill Operator** | 1 | Craft Certificate in Food Processing / Mechanical | Sorting, drying, roasting, milling, blending, and machine maintenance |
| **3. Packaging & Hygiene Assistant** | 1 | KCSE + Valid Food Handler Certificate | Weighing, pouch sealing, batch coding, and workshop sanitation |
| **4. Sales & Delivery Representative** | 1 | Certificate in Sales & Marketing + Rider License | Retailer onboarding, order delivery, and payment collection |`;

      case "ch3.remuneration":
        return `### 3.4 Remuneration Schedule and Statutory Deductions
**Table 3.1: Monthly Staff Payroll and Statutory Compliance (KES)**
| Role | No. | Gross Monthly Salary (KES) | Statutory (NSSF / SHA / Housing Levy) | Total Annual Cost (KES) |
| :--- | :---: | :---: | :---: | :---: |
| Managing Director (Owner Draw) | 1 | [e.g., 25,000] | Included | [e.g., 300,000] |
| Production & Mill Operator | 1 | [e.g., 18,000] | Compliant | [e.g., 216,000] |
| Packaging & Hygiene Assistant | 1 | [e.g., 14,000] | Compliant | [e.g., 168,000] |
| Sales & Delivery Rep | 1 | [e.g., 15,000] | Compliant | [e.g., 180,000] |
| **TOTAL MONTHLY / ANNUAL PAYROLL** | **4** | **KES [e.g., 72,000]** | | **KES [e.g., 864,000]** |`;

      case "ch3.recruitment":
        return `### 3.5 Staff Recruitment, Training, and Development
All production staff must hold a valid **County Public Health Food Handler's Medical Certificate** renewed semi-annually. Newly recruited staff undergo a 1-week induction covering GMP personal hygiene, HACCP critical control points, accurate digital weighing, and machine safety.`;

      case "ch3.legal":
        return `### 3.6 Regulatory Licenses, Permits, and Statutory Compliance
| Permit / Statutory Requirement | Issuing Authority | Annual Cost (KES) |
| :--- | :--- | :---: |
| 1. Business Name Registration & KRA PIN/Tax Compliance | BRS (eCitizen) & KRA | 1,000 |
| 2. County Single Business Permit (Food Processing SME) | County Government of [Enter County] | [e.g., 8,500] |
| 3. Public Health Premises Inspection & Food Handler Certificates | County Ministry of Health | [e.g., 4,500] |
| 4. KEBS Standardization Mark (S-Mark SME Levy) | Kenya Bureau of Standards (KEBS) | [e.g., 10,000] |
| **Total Annual Licensing & Compliance Cost** | | **KES [e.g., 24,000]** |`;

      case "ch3.support":
        return `### 3.7 Supporting Professional Services
- **Banking & Mobile Money:** Business account and Till Number with [e.g., Equity Bank / KCB Bank & Safaricom M-PESA].
- **Testing & Metrology:** Annual calibration of weighing scales (Weights & Measures Dept) and KEBS laboratory sample verification.
- **Insurance:** Fire, burglary, and workman's compensation (WIBA) cover via [enter insurer].`;

      case "ch4.facilities":
        return `### 4.1 Production Facilities and Workshop Layout
The workshop occupies a **[e.g., 60 sq. meter]** food-grade commercial unit partitioned into a unidirectional hygienic flow to prevent cross-contamination:
1. **Raw Material Receiving & Dry Store (12 sq.m):** Raised wooden pallets for raw tubers and grains.
2. **Wet Preparation & Thermal Room (15 sq.m):** Stainless steel washing sinks, electric cabinet dehydrator, and roaster.
3. **Dry Milling, Blending & Packaging Bay (20 sq.m):** Hammer mill, ribbon mixer, digital scales, and heat sealer.
4. **Finished Goods Dispatch & Office (13 sq.m):** Cool, dry shelving and sales counter.`;

      case "ch4.workflow":
        return `### 4.2 Production Process Workflow
` + "`Raw Material Inspection (Moisture & Purity Check)` -> `Sorting, Washing & Peeling` -> `Thermal Pre-treatment (Blanching / Roasting at 115°C)` -> `Cabinet Dehydration (60°C to <10% Moisture)` -> `Fine Hammer Milling (0.5mm Sieve)` -> `Ratio Blending (60:40)` -> `Weighing, Hermetic Sealing & Batch Date Coding`" + ``;

      case "ch4.equipment":
        return `### 4.3 Machinery, Tools, and Equipment Schedule
| Equipment Item | Capacity / Specification | Qty | Unit Cost (KES) | Total Cost (KES) |
| :--- | :--- | :---: | :---: | :---: |
| 1. Stainless Steel Hammer Mill | 100 kg/hr, 3kW Motor, 0.5mm Sieve | 1 | [e.g., 85,000] | [e.g., 85,000] |
| 2. Electric Food Cabinet Dehydrator | 16-Tray Stainless Steel (40–90°C) | 1 | [e.g., 65,000] | [e.g., 65,000] |
| 3. Drum Roaster & Ribbon Flour Mixer | 50 kg Batch Capacity | 1 | [e.g., 55,000] | [e.g., 55,000] |
| 4. Digital Platform & Bench Scales + Moisture Meter | 0.01g – 150kg Precision | 1 Set | [e.g., 20,000] | [e.g., 20,000] |
| 5. Foot-Operated Impulse Heat Sealer & Stainless Tables | Heavy Duty 400mm | 1 Set | [e.g., 25,000] | [e.g., 25,000] |
| **Total Machinery & Equipment Capital** | | | | **KES [e.g., 250,000]** |`;

      case "ch4.materials":
        return `### 4.4 Monthly Raw Material Requirements and Sourcing
| Raw Material / Input | Monthly Quantity | Source / Supplier | Unit Cost (KES) | Monthly Cost (KES) |
| :--- | :--- | :--- | :---: | :---: |
| 1. Fresh [Ingredient A, e.g., OFSP] | [e.g., 900 kg] | Local Farmer Co-operatives | [e.g., 55/kg] | [e.g., 49,500] |
| 2. Clean [Ingredient B, e.g., Soybean/Amaranth] | [e.g., 350 kg] | Certified Grain Aggregators | [e.g., 140/kg] | [e.g., 49,000] |
| 3. Printed Laminated Pouches & Cartons | [e.g., 1,600 pcs] | Nairobi Packaging Printers | [e.g., 15/pc] | [e.g., 24,000] |
| **Total Monthly Direct Material Cost** | | | | **KES [e.g., 122,500]** |`;

      case "ch4.labor":
        return `### 4.5 Labor Requirements and Daily Shift Schedule
The facility operates 6 days a week (Monday to Saturday, 8:00 AM – 5:00 PM). Morning shifts (8:00 AM – 12:30 PM) handle raw sorting, roasting, and dehydration; afternoon shifts (1:30 PM – 5:00 PM) execute milling, blending, packaging, and workshop sanitation.`;

      case "ch4.quality":
        return `### 4.6 Quality Control, Food Safety, and Waste Management
1. **Incoming Raw Material Inspection:** All grain lots are tested with a digital grain moisture meter (<13% moisture) and visually inspected for zero mold.
2. **Finished Batch Retention:** One reference sample pack from every production batch is retained for 6 months for traceability.
3. **Eco-Friendly Waste Management:** Organic peelings and seed hulls are collected daily and sold/supplied to local poultry and dairy farmers as livestock feed supplement.`;

      case "ch4.schedule":
        return `### 4.7 Monthly Production Capacity and Manufacturing Schedule
Operating 24 working days per month at an average output of [e.g., 35 kg] of finished composite flour per day yields **[e.g., 840 kg/month]** (equivalent to **1,680 packs of 500g**), matching Year 1 sales demand with room to scale to 3,500 packs/month.`;

      case "ch5.startup":
        return `### 5.1 Pre-Operational Financing and Start-Up Capital Budget
**Table 5.1: Start-Up Capital Requirements (KES)**
| Expenditure Category | Item Details | Amount (KES) |
| :--- | :--- | :---: |
| **1. Fixed Capital (Machinery & Equipment)** | Mill, Dehydrator, Roaster/Mixer, Scales, Sealer, Tables | [e.g., 250,000] |
| **2. Premises Renovation & Utility Deposit** | Food-grade washable paint, partitioning, 3 months rent deposit | [e.g., 45,000] |
| **3. Licensing & Regulatory Permits** | Business registration, County permit, Public Health, KEBS S-Mark | [e.g., 24,000] |
| **4. Working Capital (First 1.5 Months)** | Initial raw materials, printed packaging pouches, utility & payroll reserve | [e.g., 131,000] |
| **TOTAL START-UP CAPITAL REQUIRED** | | **KES [e.g., 450,000]** |`;

      case "ch5.sources":
        return `### 5.2 Sources of Enterprise Capital
| Capital Source | Proportion (%) | Amount (KES) | Financing Terms |
| :--- | :---: | :---: | :--- |
| 1. Owner's Personal Savings & Family Equity | 55.6% | [e.g., 250,000] | Permanent Owner Equity (0% interest) |
| 2. Youth Enterprise Fund / Microfinance Loan | 44.4% | [e.g., 200,000] | 3-Year Term Loan at 8%–12% p.a. reducing balance |
| **TOTAL FINANCING** | **100.0%** | **KES [e.g., 450,000]** | |`;

      case "ch5.assumptions":
        return `### 5.3 Key Financial Assumptions
1. **Production & Sales Growth:** Sales volume grows by 20% in Year 2 and 25% in Year 3 as retail distribution expands.
2. **Depreciation:** Processing machinery and equipment are depreciated on a straight-line basis at **10% per annum** (KES 25,000/year).
3. **Working Capital Terms:** 85% of sales are cash/M-PESA on delivery; institutional buyers have 14-day credit terms.
4. **Taxation:** SME Turnover Tax / Corporate Income Tax is provisioned in accordance with Kenya Revenue Authority (KRA) rates.`;

      case "ch5.cashflow":
        return `### 5.4 Pro-Forma Cash Flow Summary (3-Year Projection)
| Cash Flow Item (KES) | Year 1 (KES) | Year 2 (KES) | Year 3 (KES) |
| :--- | :---: | :---: | :---: |
| **Opening Cash Balance** | 0 | [e.g., 416,500] | [e.g., 895,300] |
| **Cash Inflows:** Capital Injection + Loan | [e.g., 450,000] | 0 | 0 |
| **Cash Inflows:** Cash Sales Revenue | [e.g., 2,688,000] | [e.g., 3,340,800] | [e.g., 4,320,000] |
| **Total Cash Available** | **[e.g., 3,138,000]** | **[e.g., 3,757,300]** | **[e.g., 5,215,300]** |
| **Less Cash Outflows:** Fixed Machinery & Setup | [e.g., 295,000] | 0 | [e.g., 40,000] |
| **Less Cash Outflows:** Raw Materials & Packaging | [e.g., 1,470,000] | [e.g., 1,764,000] | [e.g., 2,205,000] |
| **Less Cash Outflows:** Payroll, Rent, Utilities & Permits | [e.g., 876,500] | [e.g., 1,018,000] | [e.g., 1,120,000] |
| **Less Cash Outflows:** Loan Repayment (Principal + Interest) | [e.g., 80,000] | [e.g., 80,000] | [e.g., 80,000] |
| **CLOSING NET CASH BALANCE** | **KES [e.g., 416,500]** | **KES [e.g., 895,300]** | **KES [e.g., 1,770,300]** |`;

      case "ch5.income":
        return `### 5.5 Pro-Forma Income Statement (3-Year Profit & Loss)
| Income Statement Line (KES) | Year 1 (KES) | Year 2 (KES) | Year 3 (KES) |
| :--- | :---: | :---: | :---: |
| **Gross Sales Revenue** | [e.g., 2,688,000] | [e.g., 3,340,800] | [e.g., 4,320,000] |
| Less: Cost of Goods Sold (Raw Materials + Packaging + Direct Energy) | ([e.g., 1,542,000]) | ([e.g., 1,850,400]) | ([e.g., 2,313,000]) |
| **Gross Profit** | **[e.g., 1,146,000]** | **[e.g., 1,490,400]** | **[e.g., 2,007,000]** |
| **Operating Expenses:** | | | |
| - Staff Salaries & Wages | [e.g., 684,000] | [e.g., 720,000] | [e.g., 780,000] |
| - Workshop Rent, Water & Electricity | [e.g., 144,000] | [e.g., 156,000] | [e.g., 168,000] |
| - Licenses, KEBS & Marketing | [e.g., 48,000] | [e.g., 55,000] | [e.g., 65,000] |
| - Depreciation on Machinery (10% p.a.) | [e.g., 25,000] | [e.g., 25,000] | [e.g., 25,000] |
| - Loan Interest Expense | [e.g., 20,000] | [e.g., 14,000] | [e.g., 8,000] |
| **Total Operating Expenses** | **([e.g., 921,000])** | **([e.g., 970,000])** | **([e.g., 1,046,000])** |
| **Net Profit Before Tax (EBT)** | **[e.g., 225,000]** | **[e.g., 520,400]** | **[e.g., 961,000]** |
| Less: Income / Turnover Tax Provision | ([e.g., 40,320]) | ([e.g., 78,060]) | ([e.g., 144,150]) |
| **NET PROFIT AFTER TAX** | **KES [e.g., 184,680]** | **KES [e.g., 442,340]** | **KES [e.g., 816,850]** |`;

      case "ch5.balance":
        return `### 5.6 Pro-Forma Balance Sheet (Statement of Financial Position)
| Balance Sheet Category (KES) | End of Year 1 (KES) | End of Year 2 (KES) | End of Year 3 (KES) |
| :--- | :---: | :---: | :---: |
| **NON-CURRENT ASSETS:** Machinery (Net of Depreciation) | [e.g., 225,000] | [e.g., 200,000] | [e.g., 215,000] |
| **CURRENT ASSETS:** Cash + Raw & Finished Inventory | [e.g., 549,680] | [e.g., 957,020] | [e.g., 1,698,870] |
| **TOTAL ASSETS** | **KES [e.g., 774,680]** | **KES [e.g., 1,157,020]** | **KES [e.g., 1,913,870]** |
| **LIABILITIES:** Long-Term Loan Balance & Payables | [e.g., 140,000] | [e.g., 80,000] | [e.g., 20,000] |
| **OWNER'S EQUITY:** Initial Capital (250,000) + Retained Earnings | [e.g., 634,680] | [e.g., 1,077,020] | [e.g., 1,893,870] |
| **TOTAL LIABILITIES & EQUITY** | **KES [e.g., 774,680]** | **KES [e.g., 1,157,020]** | **KES [e.g., 1,913,870]** |`;

      case "ch5.breakeven":
        return `### 5.7 Break-Even Analysis (Year 1)
- **Average Selling Price per Unit ($P$):** KES [e.g., 140]
- **Variable Cost per Unit ($V$):** KES [e.g., 80] (Raw ingredients, pouch, direct milling energy)
- **Unit Contribution Margin ($P - V$):** $\text{KES } 140 - \text{KES } 80 = \text{KES } 60\text{ per pack}$
- **Total Monthly Fixed Costs ($FC$):** KES [e.g., 76,750] (Payroll, Rent, Depreciation, Licenses, Interest)
- **Monthly Break-Even Volume (Units):** $\frac{\text{Fixed Costs}}{\text{Unit Contribution Margin}} = \frac{76,750}{60} = \mathbf{1,280\text{ packs/month}}$
- **Monthly Break-Even Sales Revenue:** $1,280 \times \text{KES } 140 = \mathbf{KES\ 179,200/month}$`;

      case "ch5.ratios":
        return `### 5.8 Profitability and Financial Health Ratios
1. **Gross Profit Margin (Year 1):** $\frac{\text{Gross Profit}}{\text{Sales}} \times 100 = \frac{1,146,000}{2,688,000} \times 100 = \mathbf{42.6\%}$
2. **Net Profit Margin (Year 1 → Year 3):** Increases from **6.9%** in Year 1 to **18.9%** in Year 3 as fixed overheads are spread over higher production volume.
3. **Return on Initial Investment (ROI):** $\frac{\text{Annual Net Profit}}{\text{Initial Capital (450,000)}} \times 100 = \mathbf{41.0\%}$ in Year 1, rising to **98.3%** in Year 2.`;

      case "ch5.risks":
        return `### 5.9 Risk Management and Contingency Plan
| Identified Risk | Likelihood | Impact | Mitigation Measure |
| :--- | :---: | :---: | :--- |
| 1. Seasonal Spike in Raw Crop Prices | Medium | High | Contract 3 farmer groups across different agro-ecological zones & store 2-month dry buffer stock. |
| 2. Power Outages / Machine Downtime | Medium | Medium | Schedule preventive weekly mill maintenance & maintain 4-day finished inventory buffer. |
| 3. Spoilage / Moisture Ingress | Low | High | Enforce strict <10% moisture drying check and use food-grade laminated barrier pouches. |`;

      case "app.workplan":
        return `### Appendix I: Business Implementation Schedule (Pre-Launch Gantt Chart)
| Implementation Milestone | Month 1 | Month 2 | Month 3 | Month 4 |
| :--- | :---: | :---: | :---: | :---: |
| 1. Business Registration, KRA PIN & Financing | [X] | | | |
| 2. Workshop Lease, Partitioning & Machine Installation | | [X] | | |
| 3. Public Health Inspection & KEBS Sample Submission | | [X] | [X] | |
| 4. Raw Material Procurement, Trial Batch & Commercial Launch | | | [X] | [X] |`;

      case "app.invoices":
        return `### Appendix II: Machinery and Raw Material Supplier Pro-Forma Quotations
| Supplier Name & Location | Item Quoted | Specification | Quoted Price (KES) |
| :--- | :--- | :--- | :---: |
| 1. [e.g., AgroMachinery fabricators Ltd, Nairobi] | Stainless Steel Hammer Mill | 3kW, 100kg/hr, 0.5mm sieve | [e.g., 85,000] |
| 2. [e.g., Kitchen & Food Tech Supplies, Nairobi] | 16-Tray Electric Cabinet Dehydrator | Stainless Steel, 40–90°C | [e.g., 65,000] |
| 3. [e.g., EcoPack Printers Ltd, Industrial Area] | Printed Stand-Up Pouches (500g) | Food-grade laminated kraft | [e.g., 15 / pc] |`;
    }
  }

  // Fallback for any custom section
  return `### ${sectionTitle || sectionKey}

[Complete this section in your own words following KNEC ${levelName} guidelines:
1. State the main point or finding for ${sectionTitle || sectionKey}.
2. Provide supporting data, measurements, or verified citations (Author, Year).
3. Explain how this aligns with your project objectives.]`;
}
