/**
 * Topic proposals for the Research track (certificate and diploma students).
 *
 * Every proposal uses a descriptive cross-sectional design that relies ONLY on
 * secondary data: national survey reports (KDHS, KIHBS, STEPS), Ministry of Health
 * facility reports, existing school or clinic records, or published studies.
 * No questionnaires, interviews or new measurements are proposed.
 */
import type { TopicNarrowingOption, TopicNarrowingResult } from "./aiEngine";

type Objectives = [string, string, string];

function make(
  id: string,
  title: string,
  problem: string,
  general: string,
  objectives: Objectives,
  method: string
): TopicNarrowingOption {
  return {
    id,
    title,
    problemSummary: problem,
    generalObjective: general,
    specificObjectives: objectives.map((o, i) => `${i + 1}. ${o}`),
    methodologyHint: method,
  };
}

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (["and", "of", "in", "the", "for", "on"].includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function placeName(loc: string): string {
  if (loc === "the Study Area") return "Kenya";
  if (loc === "Selected Rural Community") return "Rural Kenya";
  if (loc === "Selected Urban Community") return "Urban Kenya";
  if (loc === "Selected Public Primary Schools") return "a Selected County";
  return loc;
}

const SURVEY = "Descriptive cross-sectional design using secondary data only";
const NEXT_STEP = "Which data can you access easily: survey reports, facility or school records, or published studies?";

function has(q: string, words: string[]): boolean {
  return words.some((w) => q.includes(w));
}

export function generateSecondaryDataTopics(
  query: string,
  loc: string,
  level: string = "certificate"
): TopicNarrowingResult {
  const q = query.toLowerCase();
  const place = placeName(loc);
  const isDiploma = level.toLowerCase() === "diploma";

  const analysisNote = isDiploma
    ? "Diploma Standard (≥ 40 Pages): Using verified secondary data keeps your study rigorous and ethical. Your analysis will combine descriptive statistics (frequencies, percentages, means, standard deviation) and inferential statistics (such as Chi-square tests of association, t-tests, or correlation at p < 0.05)."
    : "Certificate Standard (≥ 15 Pages; min 10 pages): Using existing secondary data keeps your project straightforward and ethical. Your analysis will use simple descriptive statistics (frequencies, percentages, averages, and summary tables).";

  const statSuffix = isDiploma
    ? "analysed using both descriptive statistics (frequencies, percentages, means) and inferential statistics (Chi-square test of association / t-test at p < 0.05) for a 40+ page Diploma report."
    : "summarised in Excel using simple descriptive statistics (frequencies, percentages, averages, and charts) for a 15+ page Certificate report.";

  // A. School feeding and pupils (existing school records and published reports)
  if (has(q, ["school", "pupil", "learner", "attendance", "breakfast", "academic"])) {
    return {
      problemAnalysis: analysisNote,
      options: [
        make(
          "rs-1",
          `Assessment of Pupil Attendance and School Meal Provision in a Selected School in ${place} Using School Records`,
          "Pupils who miss school or go without meals may learn less, yet schools rarely summarise their own attendance and feeding records.",
          "To describe pupil attendance and school meal provision using existing school records.",
          [
            "To calculate the average pupil attendance rate recorded in the school registers for one academic year.",
            "To describe the meals provided to pupils as recorded in school feeding records.",
            isDiploma
              ? "To compare and test the statistical difference in attendance between terms with and without school meals."
              : "To compare attendance between months or terms with and without school meals.",
          ],
          `${SURVEY}. Data from attendance registers and feeding records, used with the head teacher's permission and ${statSuffix}`
        ),
        make(
          "rs-2",
          `Nutritional Status of Primary School Pupils in ${place}: A Review of School Health Records`,
          "Poor growth in school-age children often goes unnoticed because health records are not summarised.",
          "To describe the nutritional status of pupils using existing school health records.",
          [
            "To collect pupils' age, sex, weight and height from existing school health records.",
            "To classify pupils as normal, underweight or stunted using WHO growth standards.",
            isDiploma
              ? "To compare and test the association between pupils' nutritional status, sex, and class level."
              : "To compare nutritional status by sex and class.",
          ],
          `${SURVEY}. Existing school health or clinic records with names removed, ${statSuffix}`
        ),
        make(
          "rs-3",
          "School Feeding and Pupil Learning in Kenya: A Review of Published Studies and Reports",
          "School feeding is widely used in Kenya, but its findings are scattered across many reports.",
          "To summarise published evidence on how school feeding affects attendance and learning.",
          [
            "To identify published studies and agency reports on school feeding in Kenya.",
            "To describe their main findings on attendance and learning.",
            "To identify gaps and give simple recommendations.",
          ],
          `${SURVEY}. Desk review of journal articles and agency reports, ${statSuffix}`
        ),
      ],
      followUpQuestion: NEXT_STEP,
    };
  }

  // B. Maternal nutrition
  if (has(q, ["maternal", "pregnan", "antenatal", "anc", "anaemia", "anemia", "iron", "women"])) {
    return {
      problemAnalysis: analysisNote,
      options: [
        make(
          "rs-1",
          `Antenatal Iron and Folic Acid Supplementation Coverage among Pregnant Women in ${place}: Review of Facility Reports`,
          "Low iron intake in pregnancy raises the risk of anaemia, so supplement coverage needs to be tracked.",
          "To describe iron and folic acid supplementation coverage using Ministry of Health facility reports.",
          [
            "To extract the number of first antenatal visits and women given iron and folic acid for one year.",
            "To calculate supplementation coverage by month or facility.",
            isDiploma
              ? "To compare coverage across facilities and test whether seasonal or facility differences are statistically significant."
              : "To identify the months or facilities with the lowest coverage.",
          ],
          `${SURVEY}. Ministry of Health facility reports (KHIS) or antenatal registers, ${statSuffix}`
        ),
        make(
          "rs-2",
          `Nutritional Status of Women of Reproductive Age in ${place} Using KDHS Data`,
          "Poor maternal nutrition affects the health of mothers and the growth of their babies.",
          "To describe the nutritional status of women using published KDHS results.",
          [
            "To extract women's body mass index categories from KDHS tables.",
            "To record the percentage of women with anaemia where it is reported.",
            isDiploma
              ? "To compare results and assess the relationship between maternal nutritional status, age group, and urban or rural residence."
              : "To compare results by age group and urban or rural residence.",
          ],
          `${SURVEY}. KDHS report and statistical tables, ${statSuffix}`
        ),
        make(
          "rs-3",
          `Antenatal Care Attendance among Women in ${place}: Analysis of KDHS 2022 Data`,
          "Women who attend antenatal care late or rarely miss nutrition advice and supplements.",
          "To describe antenatal care attendance using KDHS 2022 results.",
          [
            "To extract the percentage of women with four or more antenatal visits.",
            "To describe the timing of the first antenatal visit.",
            isDiploma
              ? "To examine and test the association between antenatal care attendance, mother's education level, and residence."
              : "To compare attendance by mother's education level and residence.",
          ],
          `${SURVEY}. KDHS 2022 report tables, ${statSuffix}`
        ),
      ],
      followUpQuestion: NEXT_STEP,
    };
  }

  // C. Child nutrition, breastfeeding and feeding practices
  if (
    has(q, [
      "stunt", "wast", "underweight", "child", "infant", "breastfe", "complementary", "weaning",
      "iycf", "under 5", "under-5", "under five", "vitamin a", "immunis", "immuniz", "malnutrition",
    ])
  ) {
    return {
      problemAnalysis: analysisNote,
      options: [
        make(
          "rs-1",
          `Prevalence of Stunting, Wasting and Underweight among Children Under Five in ${place} Using KDHS 2022`,
          "Child undernutrition harms growth and learning, and local figures are needed to guide action.",
          "To describe the nutritional status of children under five years using KDHS 2022 data.",
          [
            "To extract the percentage of stunted, wasted and underweight children from KDHS 2022.",
            "To compare the results by age group, sex and urban or rural residence.",
            isDiploma
              ? "To evaluate changes between the 2014 and 2022 KDHS and test socio-demographic associations."
              : "To compare the results with the national average and the 2014 KDHS.",
          ],
          `${SURVEY}. KDHS 2022 and 2014 reports and statistical tables, ${statSuffix}`
        ),
        make(
          "rs-2",
          `Exclusive Breastfeeding and Complementary Feeding Practices in ${place}: Analysis of KDHS 2022 Data`,
          "Poor infant feeding in the first two years is a major cause of childhood malnutrition.",
          "To describe infant and young child feeding practices using KDHS 2022 data.",
          [
            "To extract the percentage of infants under six months who were exclusively breastfed.",
            "To extract the percentage of children aged 6 to 23 months who met minimum dietary diversity.",
            isDiploma
              ? "To compare and test the relationship between feeding practices, mother's education, and residence."
              : "To compare these practices by mother's education and residence.",
          ],
          `${SURVEY}. KDHS 2022 report tables, ${statSuffix}`
        ),
        make(
          "rs-3",
          `Vitamin A Supplementation and Immunisation Coverage among Children in ${place}: Review of Facility Reports`,
          "Children who miss supplements and vaccines are more likely to fall ill and become undernourished.",
          "To describe vitamin A supplementation and immunisation coverage using Ministry of Health facility reports.",
          [
            "To extract the number of children reached with vitamin A and vaccines for one year.",
            "To calculate coverage by month or facility.",
            isDiploma
              ? "To compare coverage across facilities and test whether monthly variations are statistically significant."
              : "To identify the months or facilities with the lowest coverage.",
          ],
          `${SURVEY}. Ministry of Health facility reports (KHIS), ${statSuffix}`
        ),
      ],
      followUpQuestion: NEXT_STEP,
    };
  }

  // D. Non-communicable diseases and adult nutrition
  if (has(q, ["hypertens", "diabet", "blood pressure", "salt", "obes", "overweight", "adult", "elderly", "ncd"])) {
    return {
      problemAnalysis: analysisNote,
      options: [
        make(
          "rs-1",
          `Hypertension and Diabetes Cases among Adults at a Selected Health Facility in ${place}: Outpatient Records Review`,
          "Diet-related diseases are rising, but facilities seldom summarise who is affected.",
          "To describe adult hypertension and diabetes cases using existing outpatient records.",
          [
            "To count adult patients diagnosed with hypertension or diabetes in one year.",
            "To describe the cases by age group and sex.",
            isDiploma
              ? "To record documented dietary advice and test the association between patient age group, sex, and diagnosis."
              : "To record the dietary advice documented in patient files.",
          ],
          `${SURVEY}. Outpatient registers and patient files (anonymised), ${statSuffix}`
        ),
        make(
          "rs-2",
          "Dietary Salt Intake and Hypertension in Kenya: A Review of Published Studies",
          "High salt intake is linked to high blood pressure, yet Kenyan evidence is scattered.",
          "To summarise published evidence on salt intake and hypertension in Kenya.",
          [
            "To identify published studies on salt intake and hypertension in Kenya.",
            "To describe their main findings in a table.",
            "To identify gaps and give simple recommendations.",
          ],
          `${SURVEY}. Desk review of journal articles and Ministry of Health reports, ${statSuffix}`
        ),
        make(
          "rs-3",
          "Overweight and Obesity among Adults in Kenya: Review of the Kenya STEPs Survey Report",
          "Overweight raises the risk of diabetes and heart disease, and national figures guide prevention.",
          "To describe overweight and obesity among Kenyan adults using the national STEPs survey report.",
          [
            "To extract the percentage of overweight and obese adults from the report.",
            "To compare results between men and women.",
            isDiploma
              ? "To evaluate differences across age groups and residence using descriptive and inferential comparisons."
              : "To compare the results with other published studies.",
          ],
          `${SURVEY}. Kenya STEPs Survey report and published studies, ${statSuffix}`
        ),
      ],
      followUpQuestion: NEXT_STEP,
    };
  }

  // E. Diet, food consumption and food security
  if (
    has(q, [
      "diet", "diversity", "food security", "insecurity", "hunger", "consumption", "vegetable",
      "fruit", "food", "famine", "drought",
    ])
  ) {
    return {
      problemAnalysis: analysisNote,
      options: [
        make(
          "rs-1",
          `Household Food Consumption Patterns in ${place}: Analysis of KIHBS 2015/16 Data`,
          "What households eat and spend on food shows how well they can meet their nutrition needs.",
          `To describe food consumption and food spending among households in ${place} using KIHBS 2015/16 reports.`,
          [
            "To identify the main food groups consumed by households.",
            "To describe the share of household spending that goes to food.",
            isDiploma
              ? "To compare and test differences in food consumption and dietary diversity between rural and urban households."
              : "To compare food consumption between rural and urban households.",
          ],
          `${SURVEY}. Kenya Integrated Household Budget Survey 2015/16 reports, ${statSuffix}`
        ),
        make(
          "rs-2",
          `Food Security Situation in ${place}: Review of Food Security Assessment Reports`,
          "Droughts and high food prices repeatedly threaten household food security.",
          "To describe the food security situation using existing assessment reports.",
          [
            "To identify food security assessment reports that cover the county.",
            "To record the percentage of households with poor food consumption or using coping strategies.",
            isDiploma
              ? "To analyse seasonal changes and test associations between drought periods and poor food consumption."
              : "To describe changes between seasons or years.",
          ],
          `${SURVEY}. Kenya Food Security Steering Group and county assessment reports, ${statSuffix}`
        ),
        make(
          "rs-3",
          `Fruit and Vegetable Availability and Consumption in ${place}: Review of Published Reports`,
          "Low fruit and vegetable intake contributes to vitamin and mineral deficiencies.",
          "To summarise published data on fruit and vegetable production and consumption.",
          [
            "To identify reports from government agencies, KNBS and published studies.",
            "To record production and consumption figures.",
            "To identify the reasons given for low consumption.",
          ],
          `${SURVEY}. Desk review of reports and published studies, ${statSuffix}`
        ),
      ],
      followUpQuestion: NEXT_STEP,
    };
  }

  // F. General fallback
  const subject = titleCase(
    query
      .replace(/[^\w\s-]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(" ") || "Community Nutrition"
  );

  return {
    problemAnalysis: analysisNote,
    options: [
      make(
        "rs-1",
        `Prevalence of ${subject} in ${place}: Analysis of KDHS and Ministry of Health Data`,
        `Local figures on ${subject.toLowerCase()} are needed to guide nutrition programmes.`,
        `To describe ${subject.toLowerCase()} in ${place} using existing national reports.`,
        [
          `To identify the indicators for ${subject.toLowerCase()} in existing national reports.`,
          "To record the figures by age group, sex and residence.",
          isDiploma
            ? "To compare results with the national average and test demographic associations."
            : "To compare the results with the national average.",
        ],
        `${SURVEY}. KDHS, KNBS and Ministry of Health reports, ${statSuffix}`
      ),
      make(
        "rs-2",
        `Description of ${subject} among Clients at a Selected Health Facility in ${place}: A Records Review`,
        `Health facilities hold useful records on ${subject.toLowerCase()} that are rarely summarised.`,
        `To describe ${subject.toLowerCase()} using existing facility records.`,
        [
          "To extract the relevant cases or indicators from facility records for one year.",
          "To describe them by age group and sex.",
          isDiploma
            ? "To test whether case distribution differs significantly across age groups, sex, or months."
            : "To identify months or groups with the highest burden.",
        ],
        `${SURVEY}. Facility registers and reports (anonymised), ${statSuffix}`
      ),
      make(
        "rs-3",
        `${subject} in Kenya: A Review of Published Studies`,
        `Findings on ${subject.toLowerCase()} are scattered across many studies.`,
        `To summarise published evidence on ${subject.toLowerCase()} in Kenya.`,
        [
          "To identify published studies and reports on the topic in Kenya.",
          "To describe their main findings in a table.",
          "To identify gaps and give simple recommendations.",
        ],
        `${SURVEY}. Desk review of journal articles and government reports, ${statSuffix}`
      ),
    ],
    followUpQuestion: NEXT_STEP,
  };
}
