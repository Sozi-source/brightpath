import type { ResearchIdentity, ResearchLevel, ResearchSpecs, ResearchTopicBlueprint } from "./researchTypes";

export const RESEARCH_TOPIC_CATALOGUE: ResearchTopicBlueprint[] = [
  {
    id: "stunting_overweight_kenya",
    title: "Trends in Child Stunting and Overweight Among Children Under Five in Kenya (1998-2022): A Secondary Data Analysis",
    domain: "child_malnutrition",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["stunting_u5", "overweight_u5"],
    yearFrom: 1998,
    yearTo: 2022,
    generalObjective:
      "To examine long-term national trends in stunting and overweight among children under five years in Kenya using published secondary survey data from 1998 to 2022.",
    specificObjectives: [
      "To describe the trend in prevalence of stunting among children under five years in Kenya between 1998 and 2022.",
      "To describe the trend in prevalence of overweight among children under five years in Kenya over the same period.",
      "To compare the direction and rate of change between undernutrition (stunting) and overnutrition (overweight) in Kenyan children under five.",
    ],
    researchQuestions: [
      "How has the prevalence of stunting among children under five in Kenya changed between 1998 and 2022?",
      "What trend has been observed in childhood overweight among children under five in Kenya over the study period?",
      "How do the magnitude and pace of change compare between child stunting and child overweight in Kenya?",
    ],
    problemContext:
      "Kenya faces a dual burden of malnutrition in early childhood, where persistent linear growth faltering coexists with emerging childhood overweight. Evaluating multi-decade survey estimates clarifies whether nutrition interventions have reduced undernutrition without accelerating excess weight gain.",
    keyTerms: [
      { term: "Stunting", definition: "Height-for-age z-score more than two standard deviations below the WHO Child Growth Standards median." },
      { term: "Childhood Overweight", definition: "Weight-for-height z-score more than two standard deviations above the WHO Child Growth Standards median." },
      { term: "Double Burden of Malnutrition", definition: "Coexistence of undernutrition alongside overweight and obesity within the same population." },
      { term: "Secondary Data", definition: "Pre-existing statistical estimates compiled from official national surveys and international repositories." },
    ],
  },
  {
    id: "acute_chronic_undernutrition_kenya",
    title: "Comparative Trends in Stunting, Wasting, and Underweight Among Children Under Five in Kenya (1998-2022)",
    domain: "child_malnutrition",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["stunting_u5", "wasting_u5", "underweight_u5"],
    yearFrom: 1998,
    yearTo: 2022,
    generalObjective:
      "To analyze national trends across three anthropometric indicators of child undernutrition (stunting, wasting, and underweight) in Kenya from 1998 to 2022.",
    specificObjectives: [
      "To determine the prevalence trajectory of chronic undernutrition (stunting) among Kenyan children under five.",
      "To assess the prevalence pattern of acute undernutrition (wasting) across published survey years.",
      "To evaluate changes in composite undernutrition (underweight) relative to stunting and wasting.",
    ],
    researchQuestions: [
      "What is the long-term trajectory of child stunting in Kenya across the 1998-2022 survey series?",
      "How has acute malnutrition (wasting) fluctuated across published national estimates in Kenya?",
      "To what extent have reductions in child underweight mirrored changes in stunting and wasting?",
    ],
    problemContext:
      "Distinguishing chronic growth failure from acute wasting and composite underweight is essential for targeting Kenya's nutrition programmes. Multi-year anthropometric series show which forms of undernutrition respond fastest to policy and economic shifts.",
    keyTerms: [
      { term: "Wasting", definition: "Weight-for-height z-score below -2 SD of the WHO reference median, indicating acute undernutrition." },
      { term: "Underweight", definition: "Weight-for-age z-score below -2 SD of the WHO reference median, reflecting both chronic and acute deficits." },
      { term: "Anthropometry", definition: "Systematic measurement of body dimensions such as height and weight to assess nutritional status." },
    ],
  },
  {
    id: "exclusive_breastfeeding_stunting_kenya",
    title: "Exclusive Breastfeeding and Early Childhood Stunting Trends in Kenya: A Descriptive Secondary Analysis",
    domain: "iycf_feeding",
    course: "Community Health and Nutrition",
    indicatorIds: ["exclusive_breastfeeding", "stunting_u5", "underweight_u5"],
    yearFrom: 1998,
    yearTo: 2022,
    generalObjective:
      "To describe national trends in exclusive breastfeeding and early childhood undernutrition indicators in Kenya using published secondary data.",
    specificObjectives: [
      "To establish the trend in exclusive breastfeeding among infants under six months in Kenya.",
      "To trace corresponding national changes in child stunting and underweight over the available survey period.",
      "To compare observed infant feeding gains against shifts in early childhood undernutrition.",
    ],
    researchQuestions: [
      "How has exclusive breastfeeding coverage among infants under six months changed in Kenya across published surveys?",
      "What concurrent changes occurred in child stunting and underweight prevalence over the same period?",
      "How do observed trends in infant feeding compare with reductions in child undernutrition?",
    ],
    problemContext:
      "Optimal breastfeeding during the first six months of life protects infants against infectious morbidity and supports linear growth. Reviewing national feeding and growth indicators together highlights progress toward global nutrition targets.",
    keyTerms: [
      { term: "Exclusive Breastfeeding", definition: "Feeding an infant only breast milk for the first six months of life without any other food or liquid." },
      { term: "IYCF", definition: "Infant and Young Child Feeding practices recommended by WHO and UNICEF." },
      { term: "Stunting", definition: "Impaired linear growth measured by height-for-age below -2 SD." },
    ],
  },
  {
    id: "maternal_anaemia_pregnancy_kenya",
    title: "Trends in Maternal and Pregnant Women Anaemia Prevalence in Kenya (2000-2023): Secondary Data Review",
    domain: "maternal_nutrition",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["anaemia_pregnant", "anaemia_women"],
    yearFrom: 2000,
    yearTo: 2023,
    generalObjective:
      "To assess national trends in anaemia prevalence among pregnant women and women of reproductive age in Kenya from 2000 to 2023.",
    specificObjectives: [
      "To determine the trend in anaemia prevalence among pregnant women in Kenya between 2000 and 2023.",
      "To determine the trend in anaemia prevalence among all women of reproductive age (15-49 years) over the same period.",
      "To compare the severity and rate of change between pregnant and non-pregnant reproductive-age women.",
    ],
    researchQuestions: [
      "How has anaemia prevalence among pregnant women in Kenya evolved between 2000 and 2023?",
      "What trend is observed in anaemia among women of reproductive age (15-49 years) in Kenya?",
      "How does the burden of anaemia differ in level and pace of change between pregnant women and all women aged 15-49?",
    ],
    problemContext:
      "Maternal anaemia increases risks of low birthweight, preterm delivery, and perinatal complications. Tracking two decades of WHO/World Bank modelled estimates reveals whether iron-folate supplementation and antenatal care have lowered the burden.",
    keyTerms: [
      { term: "Maternal Anaemia", definition: "Haemoglobin concentration below 110 g/L in pregnant women or below 120 g/L in non-pregnant women." },
      { term: "Women of Reproductive Age", definition: "Females aged 15 to 49 years." },
      { term: "Micronutrient Deficiency", definition: "Inadequate intake or absorption of essential vitamins and minerals such as iron." },
    ],
  },
  {
    id: "child_maternal_anaemia_kenya",
    title: "Burden and Trends of Anaemia in Children (6-59 Months) and Women of Reproductive Age in Kenya (2000-2023)",
    domain: "micronutrients",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["anaemia_children", "anaemia_women"],
    yearFrom: 2000,
    yearTo: 2023,
    generalObjective:
      "To examine long-term national trends in anaemia among children aged 6-59 months and women aged 15-49 years in Kenya.",
    specificObjectives: [
      "To describe the prevalence trajectory of anaemia among children aged 6-59 months in Kenya.",
      "To describe the prevalence trajectory of anaemia among women of reproductive age in Kenya.",
      "To compare the pace of decline and remaining public health burden across both vulnerable groups.",
    ],
    researchQuestions: [
      "What has been the trend in anaemia prevalence among Kenyan children aged 6-59 months since 2000?",
      "How has anaemia among Kenyan women of reproductive age changed over the same period?",
      "Which group exhibits faster reduction and what gap remains relative to WHO public health thresholds?",
    ],
    problemContext:
      "Iron-deficiency anaemia impairs cognitive development in young children and reduces work capacity and pregnancy outcomes in women. Analysing parallel trends across mother-child pairs informs household micronutrient strategies.",
    keyTerms: [
      { term: "Child Anaemia", definition: "Haemoglobin below 110 g/L among children aged 6 to 59 months." },
      { term: "Public Health Significance", definition: "WHO classification of anaemia prevalence as mild (5-19.9%), moderate (20-39.9%), or severe (>=40%)." },
    ],
  },
  {
    id: "food_insecurity_undernourishment_kenya",
    title: "National Trends in Undernourishment and Food Insecurity in Kenya: A Secondary Analysis of FAO Indicators",
    domain: "food_security",
    course: "Food Science and Nutrition",
    indicatorIds: ["undernourishment", "food_insecurity_mod_sev"],
    yearFrom: 2001,
    yearTo: 2023,
    generalObjective:
      "To evaluate national trends in population undernourishment and moderate-to-severe food insecurity in Kenya using published FAO/World Bank series.",
    specificObjectives: [
      "To determine the trend in prevalence of undernourishment in Kenya's population across available years.",
      "To describe recent levels and changes in moderate or severe food insecurity based on FIES estimates.",
      "To compare caloric inadequacy (undernourishment) with experiential food insecurity indicators.",
    ],
    researchQuestions: [
      "How has the prevalence of undernourishment in Kenya changed across published series?",
      "What levels and changes are recorded for moderate or severe food insecurity in Kenya?",
      "How do national undernourishment trends relate to experiential food insecurity estimates?",
    ],
    problemContext:
      "Climate variability, food price volatility, and household income shocks affect food access in Kenya. Examining both dietary energy adequacy and FIES-based food insecurity clarifies national vulnerability.",
    keyTerms: [
      { term: "Undernourishment", definition: "Condition in which habitual food consumption fails to meet minimum dietary energy requirements." },
      { term: "Food Insecurity (FIES)", definition: "Experience-based measure of constrained physical and economic access to sufficient, nutritious food." },
    ],
  },
  {
    id: "food_security_child_stunting_kenya",
    title: "Population Undernourishment and Child Malnutrition Trends in Kenya (2000-2022): A Secondary Data Review",
    domain: "food_security",
    course: "Community Health and Nutrition",
    indicatorIds: ["undernourishment", "stunting_u5", "wasting_u5"],
    yearFrom: 2000,
    yearTo: 2022,
    generalObjective:
      "To describe national trends in population undernourishment alongside child stunting and wasting in Kenya from 2000 to 2022.",
    specificObjectives: [
      "To trace national undernourishment prevalence in Kenya between 2000 and 2022.",
      "To trace child stunting and wasting prevalence across the same multi-decade window.",
      "To compare the direction of household food availability indicators with child anthropometric outcomes.",
    ],
    researchQuestions: [
      "How has population undernourishment trended in Kenya since 2000?",
      "What shifts occurred in child stunting and wasting over the same period?",
      "Do national undernourishment trends move in the same direction as child anthropometric indicators?",
    ],
    problemContext:
      "Food availability alone does not guarantee child growth if dietary quality, care practices, and sanitation lag behind. Comparing food supply inadequacy against child anthropometry highlights multi-sectoral gaps.",
    keyTerms: [
      { term: "Food Security", definition: "Situation when all people at all times have physical, social, and economic access to sufficient, safe, and nutritious food." },
      { term: "Stunting", definition: "Chronic undernutrition reflected in low height-for-age." },
    ],
  },
  {
    id: "antenatal_low_birthweight_kenya",
    title: "Antenatal Care Coverage, Maternal Anaemia, and Birthweight Outcomes in Kenya: Secondary Data Trends",
    domain: "maternal_nutrition",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["antenatal_care_4plus", "anaemia_pregnant", "low_birthweight"],
    yearFrom: 2000,
    yearTo: 2023,
    generalObjective:
      "To analyze national trends in antenatal care coverage, maternal anaemia, and low birthweight in Kenya using secondary data.",
    specificObjectives: [
      "To describe changes in skilled antenatal care coverage in Kenya across published survey years.",
      "To assess trends in anaemia among pregnant women and low-birthweight prevalence.",
      "To compare maternal service coverage gains against birthweight and anaemia outcomes.",
    ],
    researchQuestions: [
      "How has antenatal care coverage changed in Kenya across available survey years?",
      "What trends are observed in maternal anaemia and low birthweight over the study period?",
      "How do trends in antenatal care coverage compare with changes in low birthweight and maternal anaemia?",
    ],
    problemContext:
      "Antenatal care provides a primary platform for nutrition counselling, iron-folate supplementation, and maternal monitoring. Reviewing service coverage alongside birthweight and anaemia outcomes shows where quality gaps persist.",
    keyTerms: [
      { term: "Low Birthweight", definition: "Live birth weight below 2,500 grams regardless of gestational age." },
      { term: "Antenatal Care", definition: "Healthcare provided by skilled personnel to pregnant women to ensure maternal and foetal health." },
    ],
  },
  {
    id: "child_mortality_nutrition_kenya",
    title: "Trends in Under-Five Mortality, Infant Mortality, and Child Stunting in Kenya (1998-2022)",
    domain: "child_health",
    course: "Community Health and Nutrition",
    indicatorIds: ["under5_mortality", "infant_mortality", "stunting_u5"],
    yearFrom: 1998,
    yearTo: 2022,
    generalObjective:
      "To examine national trends in infant mortality, under-five mortality, and child stunting in Kenya from 1998 to 2022.",
    specificObjectives: [
      "To describe the trajectory of infant and under-five mortality rates in Kenya from 1998 to 2022.",
      "To describe concurrent changes in child stunting prevalence over the same period.",
      "To compare the pace of decline in child mortality against reductions in chronic undernutrition.",
    ],
    researchQuestions: [
      "How have infant and under-five mortality rates changed in Kenya between 1998 and 2022?",
      "What trend occurred in child stunting over the same time span?",
      "How does the rate of mortality reduction compare with the pace of stunting decline?",
    ],
    problemContext:
      "Undernutrition is an underlying contributor to preventable child deaths. Comparing child survival indicators with chronic stunting trends illustrates how health and nutrition gains reinforce one another.",
    keyTerms: [
      { term: "Under-Five Mortality Rate", definition: "Probability of dying between birth and exactly five years of age per 1,000 live births." },
      { term: "Infant Mortality Rate", definition: "Number of deaths of children under one year of age per 1,000 live births." },
    ],
  },
  {
    id: "immunization_vitamin_a_kenya",
    title: "Child Immunization (DPT3) and Vitamin A Supplementation Coverage Trends in Kenya (2000-2023)",
    domain: "micronutrients",
    course: "Community Health and Nutrition",
    indicatorIds: ["immunization_dpt", "vitamin_a_supp"],
    yearFrom: 2000,
    yearTo: 2023,
    generalObjective:
      "To analyze national trends in routine DPT3 immunization and vitamin A supplementation coverage among Kenyan children.",
    specificObjectives: [
      "To determine the trend in DPT3 immunization coverage among children aged 12-23 months in Kenya.",
      "To determine the trend in two-dose vitamin A supplementation coverage among children aged 6-59 months.",
      "To compare stability and coverage gaps between routine immunization and vitamin A delivery.",
    ],
    researchQuestions: [
      "How has DPT3 immunization coverage in Kenya changed from 2000 to 2023?",
      "What trend has been observed in national vitamin A supplementation coverage?",
      "Where do coverage fluctuations or delivery gaps persist between the two preventive interventions?",
    ],
    problemContext:
      "High-dose vitamin A supplementation and routine immunization reduce child morbidity and mortality. Comparing their coverage trajectories reveals how integrated child health platforms perform over time.",
    keyTerms: [
      { term: "Vitamin A Supplementation", definition: "Periodic administration of high-dose vitamin A capsules to children aged 6-59 months." },
      { term: "DPT3 Coverage", definition: "Proportion of children aged 12-23 months receiving three doses of diphtheria-pertussis-tetanus vaccine." },
    ],
  },
  {
    id: "wasting_overweight_double_burden_kenya",
    title: "Coexistence of Acute Wasting and Childhood Overweight in Kenya (1998-2022): A Secondary Analysis",
    domain: "child_malnutrition",
    course: "Food Science and Nutrition",
    indicatorIds: ["wasting_u5", "overweight_u5"],
    yearFrom: 1998,
    yearTo: 2022,
    generalObjective:
      "To assess national trends in acute wasting and childhood overweight among children under five in Kenya from 1998 to 2022.",
    specificObjectives: [
      "To describe the national trajectory of acute wasting among children under five in Kenya.",
      "To describe the national trajectory of childhood overweight over the same period.",
      "To evaluate the implications of simultaneous wasting and overweight trends for Kenyan nutrition policy.",
    ],
    researchQuestions: [
      "How has child wasting prevalence fluctuated in Kenya across survey years from 1998 to 2022?",
      "What trend is observed in childhood overweight among under-fives over the same window?",
      "What policy tensions arise when both wasting and overweight persist in the same child population?",
    ],
    problemContext:
      "Both ends of weight-for-height deviation—acute wasting and childhood overweight—are tracked in Kenya's national surveys. Understanding their simultaneous trajectories prevents one-sided food assistance policies.",
    keyTerms: [
      { term: "Acute Wasting", definition: "Low weight-for-height indicating recent severe weight loss or failure to gain weight." },
      { term: "Overweight", definition: "Excess weight-for-height above +2 SD of WHO Child Growth Standards." },
    ],
  },
  {
    id: "maternal_child_survival_nutrition_kenya",
    title: "Maternal Anaemia, Antenatal Care, and Child Survival Trends in Kenya (2000-2023): Secondary Review",
    domain: "child_health",
    course: "Human Nutrition and Dietetics",
    indicatorIds: ["anaemia_pregnant", "antenatal_care_4plus", "under5_mortality"],
    yearFrom: 2000,
    yearTo: 2023,
    generalObjective:
      "To examine national trends in maternal anaemia, antenatal care coverage, and under-five mortality in Kenya from 2000 to 2023.",
    specificObjectives: [
      "To trace changes in pregnant women's anaemia and antenatal care coverage in Kenya.",
      "To trace the decline in under-five mortality across the same period.",
      "To compare the pace of improvement across maternal nutrition and child survival indicators.",
    ],
    researchQuestions: [
      "How have maternal anaemia and antenatal care coverage changed in Kenya since 2000?",
      "What trajectory has under-five mortality followed over the same years?",
      "How do maternal health indicators compare with child survival gains in Kenya?",
    ],
    problemContext:
      "Maternal health and nutrition strongly shape neonatal and early-childhood survival. Reviewing national indicators across the continuum of care identifies remaining bottlenecks.",
    keyTerms: [
      { term: "Continuum of Care", definition: "Integrated health and nutrition services spanning pregnancy, childbirth, infancy, and early childhood." },
      { term: "Under-Five Mortality", definition: "Deaths occurring before age five per 1,000 live births." },
    ],
  },
];

export function buildResearchSpecsFromBlueprint(
  blueprint: ResearchTopicBlueprint,
  options: {
    level: ResearchLevel;
    seed: string;
    identity: ResearchIdentity;
    kind?: "proposal" | "full";
  }
): ResearchSpecs {
  return {
    topicId: blueprint.id,
    title: blueprint.title,
    level: options.level,
    course: blueprint.course,
    domain: blueprint.domain,
    indicatorIds: blueprint.indicatorIds,
    yearFrom: blueprint.yearFrom,
    yearTo: blueprint.yearTo,
    country: "Kenya",
    generalObjective: blueprint.generalObjective,
    specificObjectives: [...blueprint.specificObjectives],
    researchQuestions: [...blueprint.researchQuestions],
    problemContext: blueprint.problemContext,
    seed: options.seed,
    identity: options.identity,
    kind: options.kind || "full",
  };
}
