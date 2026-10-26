import type { WorkspaceType, WorkspaceLevel } from "@/types/database";

export interface StarterKit {
  id: string;
  title: string;
  track: WorkspaceType;
  level: "craft" | "diploma" | "both";
  badge: string;
  description: string;
  focusArea: string;
  sampleTitle: string;
  sampleProblemArea: string;
  sectionsContent: Record<string, string>;
}

export const STARTER_KITS: StarterKit[] = [
  // ==========================================
  // 1. NUTRITION & DIETETICS RESEARCH KITS
  // ==========================================
  {
    id: "knec_std_research",
    title: "KNEC Standard Research Outline",
    track: "research_secondary",
    level: "both",
    badge: "Official KNEC Framework",
    description:
      "Standard 5-chapter KNEC research methodology outline for Nutrition, Dietetics, and Public Health survey studies.",
    focusArea: "Nutrition, Dietetics, and Public Health",
    sampleTitle:
      "A Longitudinal Study on Secondary Data Indicators Affecting Nutritional Status in Nakuru County, Kenya",
    sampleProblemArea:
      "Statistical trend evaluation of institutional health records and national survey indicators to identify nutritional gaps.",
    sectionsContent: {
      "proposal.title": `## Project Title
A Longitudinal Trend Analysis of Maternal and Child Nutritional Indicators in Nakuru County, Kenya (2018–2024).

### Brief Rationale
This research examines empirical trends in clinical nutrition and community health utilizing authenticated institutional and secondary survey data. Despite national policy initiatives under Vision 2030, localized data indicates persistent nutritional disparities that require rigorous statistical evaluation to inform county-level dietary interventions.`,

      "proposal.problem": `## Statement of the Problem
In the target geographical area, empirical evidence reveals that child malnutrition and micronutrient deficiency rates have remained above the national threshold of 15%. While health facility outreach has expanded, there is a distinct lack of longitudinal, localized empirical analysis documenting how these indicators have shifted over the past 5–7 years. 

Without targeted statistical appraisal of these trends across demographic and socio-economic subgroups, community nutrition coordinators lack verifiable data to calibrate clinical interventions, leading to suboptimal outcomes.`,

      "proposal.objectives": `## Research Objectives

### General Objective
To investigate the longitudinal trends and underlying demographic determinants of child nutritional status in the target area between 2018 and 2024.

### Specific Objectives
1. To determine the annual percentage change in child stunting and wasting rates across the target population over the study period.
2. To assess the statistical influence of maternal education and household wealth index on observed nutritional trends.
3. To formulate evidence-based dietary recommendations for institutional managers and county health planners.`,

      "proposal.rationale": `## Significance and Justification of the Study
This study provides crucial statistical insights directly aligned with the Kenya Vision 2030 Social Pillar and County Integrated Development Plans. By isolating specific risk indicators and multi-year trajectory shifts, findings will empower:
1. **County Nutrition Coordinators:** By providing disaggregated baseline data for targeted nutrition budget allocation.
2. **TVET and Academic Institutions:** By generating validated reference literature on localized empirical methodology.
3. **Community Health Promoters:** By highlighting actionable interventions that directly address infant feeding bottlenecks.`,

      "synopsis": `## Executive Abstract / Synopsis
This study conducted an empirical investigation into longitudinal trends in child undernutrition within Nakuru County, spanning 2018 to 2024. Utilizing secondary records from the Kenya National Bureau of Statistics and Kenya Demographic and Health Survey, the analysis evaluated target dataset cohorts.

Descriptive statistics, percentage shifts, and comparative cross-tabulations were computed to test key research objectives. Findings revealed that overall stunting improved by 4.2 percentage points, yet severe rural-urban divergence persisted. The study concludes that targeted community nutrition counseling and decentralized food security mechanisms are essential.`,

      "ack": `## Declaration
I declare that this research project report is my original candidate work submitted in partial fulfillment of the requirements for the award of Diploma in Human Nutrition and Dietetics examined by the Kenya National Examinations Council (KNEC).

Candidate Name: [Insert Full Name]  
Admission Number: [Insert Admission Number]  
Signature: ______________________  Date: __________________

## Acknowledgements
I express sincere gratitude to my supervisor for dedicated academic guidance and critical critique. Special acknowledgment is extended to the Ministry of Health and county health records staff for authorizing academic access to the dataset.`,

      "terms": `## Definition of Operational Terms
- **Longitudinal Trend:** The sustained directional movement or percentage variation of a specific measurable indicator recorded over successive survey rounds.
- **Secondary Data Analysis:** The systematic empirical examination and statistical synthesis of data previously collected by official regulatory or statistical bodies.
- **Height-for-Age Z-Score (HAZ):** Standard deviation score measuring linear growth retardation (stunting) relative to WHO international reference standards.
- **Dietary Diversity Score (DDS):** The qualitative measure of food consumption that reflects household access to a variety of foods across standard food groups.`,

      "ch1.background": `## 1.1 Background to the Study
Globally, monitoring longitudinal trends in maternal and child nutrition has emerged as a cornerstone of sustainable development policy under Sustainable Development Goal 2 (Zero Hunger) and Goal 3 (Good Health and Well-being). In Sub-Saharan Africa, regional monitoring frameworks indicate that while policy coverage has expanded, significant implementation bottlenecks persist due to uneven food access and micro-economic shocks.

In Kenya, national strategies aligned with the National Food and Nutrition Security Policy mandate devolved authorities to maintain empirical data repositories. This study provides an evidence-based assessment of institutional and survey trends to establish clear baselines for future nutritional programming.`,

      "ch1.problem": `## 1.2 Statement of the Problem
[Detail the exact empirical gap in 150-250 words: explain what the expected nutritional standard is, what the observed survey data shows in the target county, and the consequence if this investigation is not conducted.]`,

      "ch1.objectives": `## 1.3 Research Objectives
### 1.3.1 General Objective
To investigate longitudinal trends and determinants of child nutritional status.

### 1.3.2 Specific Objectives
1. To calculate percentage point changes in height-for-age Z-scores across survey waves.
2. To determine the association between maternal education and household wealth on child stunting.
3. To propose targeted county clinical and community nutrition interventions.`,
    },
  },
  {
    id: "kdhs_health_research",
    title: "Public Health and Child Nutrition Trend Study",
    track: "research_secondary",
    level: "both",
    badge: "Nutrition and Dietetics Track",
    description:
      "Secondary research template focused on KDHS child stunting, infant feeding, and maternal care indicators.",
    focusArea: "Nutrition, Dietetics, and Public Health",
    sampleTitle:
      "Longitudinal Trend Analysis of Child Malnutrition and Stunting Indicators in Nakuru County: Comparative Evidence from KDHS Datasets",
    sampleProblemArea:
      "Child malnutrition and stunting rates remaining above national thresholds despite devolution and decentralized maternal clinics.",
    sectionsContent: {
      "proposal.title": `## Project Title
Longitudinal Trend Analysis of Child Malnutrition and Stunting Indicators in Nakuru County: Comparative Evidence from KDHS Datasets (2008–2022).

### Brief Rationale
Child undernutrition remains an enduring public health challenge in Kenya. Analyzing successive Kenya Demographic and Health Survey cohorts provides verifiable, population-level evidence on whether county healthcare devolution has accelerated stunting reduction across vulnerable agro-pastoralist households.`,

      "proposal.problem": `## Statement of the Problem
According to national survey baselines, child stunting (height-for-age Z-score < -2 SD) affects approximately 18% of children under five in Kenya, with pronounced inter-county variations. In Nakuru County, despite expanded rural health center infrastructure, clinic admissions for malnutrition-related illnesses indicate unaddressed dietary and socioeconomic vulnerabilities.

Current literature lacks disaggregated longitudinal analysis assessing whether stunting prevalence has experienced statistically significant percentage reductions between the 2014 and 2022 KDHS cohorts. Without this longitudinal demographic synthesis, county health directors risk allocating nutritional supplements without targeting the most impacted sub-county wards.`,

      "proposal.objectives": `## Research Objectives
### General Objective
To conduct a comparative secondary trend analysis of child stunting and associated maternal socio-demographic determinants in Nakuru County using official KDHS survey data.

### Specific Objectives
1. To calculate the percentage point changes in height-for-age Z-scores among children aged 0–59 months in Nakuru County across the 2008, 2014, and 2022 KDHS survey waves.
2. To determine the association between maternal educational attainment and household wealth index with child stunting outcomes.
3. To propose targeted county public health interventions for high-burden rural sub-counties.`,

      "proposal.rationale": `## Significance and Justification
Findings from this research will provide the County Department of Health Services with empirical baselines for its County Nutrition Action Plan. Furthermore, it demonstrates the practical application of secondary survey epidemiological methodology for TVET nutrition and dietetics candidates.`,
    },
  },

  // ==========================================
  // 2. FOOD SCIENCE & TECHNOLOGY FORMULATION KITS
  // ==========================================
  {
    id: "knec_std_trade",
    title: "KNEC Standard Food Science Formulation Outline",
    track: "trade_fabrication",
    level: "both",
    badge: "Official KNEC Framework",
    description:
      "Standard technical formulation and product development outline covering recipe formulation, proximate analysis, and sensory evaluation.",
    focusArea: "Food Science, Technology, and Value Addition",
    sampleTitle:
      "Formulation, Proximate Composition, and Sensory Evaluation of Biofortified Orange-Fleshed Sweet Potato Composite Flour",
    sampleProblemArea:
      "Underutilization of locally grown biofortified tubers and high prevalence of micronutrient malnutrition.",
    sectionsContent: {
      "proposal.title": `## Project Title
Formulation, Proximate Composition, and Sensory Evaluation of Biofortified Orange-Fleshed Sweet Potato and Amaranth Composite Flour for Confectionery Products.

### Product Rationale
Smallholder farmers experience substantial post-harvest losses of perishable tubers, while vulnerable children suffer from Vitamin A deficiency. This project formulates a nutrient-dense, shelf-stable composite flour utilizing biofortified sweet potato and amaranth grain to replace refined wheat flour in local bakeries.`,

      "proposal.problem": `## Statement of the Problem
Over-reliance on imported commercial white wheat flour drives up confectionery prices and contributes to dietary monotony lacking essential micronutrients (Beta-carotene, iron, and dietary fiber). At the same time, post-harvest losses of locally grown orange-fleshed sweet potatoes exceed 30% during peak harvest seasons due to limited processing technologies.

There is an urgent requirement for an optimized composite flour formulation combining biofortified tubers and indigenous pseudocereals that satisfies KEBS proximate composition standards while maintaining high sensory acceptability.`,

      "proposal.objectives": `## Specific Objectives
1. To design formulation blend ratios (e.g., 70:30, 60:40) of dried sweet potato flour and popped amaranth flour.
2. To determine the proximate composition (moisture, crude protein, crude fat, total ash, crude fiber, and carbohydrate content) of each blend according to AOAC standard methods.
3. To evaluate sensory acceptability (color, aroma, taste, texture, and overall acceptability) using a 9-point hedonic scale.
4. To establish production unit costing and gross profit margins per 1kg packaged unit.`,

      "proposal.rationale": `## Justification and Utility
The developed composite flour provides a nutritious, cost-effective raw material for bakeries and institutional feeding programs. It reduces wheat import reliance, curbs tuber post-harvest losses, and provides TVET food science candidates with practical competencies aligned with KEBS food standards.`,

      "synopsis": `## Executive Project Synopsis
This technical project developed and evaluated an optimized composite flour blending biofortified Orange-Fleshed Sweet Potato and Amaranth grain. Blend ratios were formulated and subjected to proximate chemical analysis alongside 9-point hedonic sensory evaluation with 30 semi-trained panelists.

Results confirmed that the 70:30 formulation achieved optimal beta-carotene retention (4.8 mg/100g) and crude protein content (11.2%), with sensory scores exceeding 7.5 across all attributes. Unit production cost was KES 95 per kilogram, demonstrating competitive commercial viability.`,
    },
  },
  {
    id: "food_fortification_project",
    title: "Nutrient-Dense Food Formulation Project",
    track: "trade_fabrication",
    level: "both",
    badge: "Food Science and Technology Track",
    description:
      "Technical product formulation starter kit for composite flour blending, proximate analysis, and sensory evaluation.",
    focusArea: "Food Processing, Fortification, and Product Development",
    sampleTitle:
      "Development, Proximate Analysis, and Shelf-Life Evaluation of an Instant Weaning Porridge Flour Fortified with Pumpkin Seed and Amaranth",
    sampleProblemArea:
      "High incidence of protein-energy malnutrition in infants during the weaning period due to nutrient-poor cereal gruels.",
    sectionsContent: {
      "proposal.title": `## Project Title
Development, Proximate Composition, and Sensory Quality of an Instant Weaning Cereal Blend Fortified with Defatted Pumpkin Seed and Amaranth Flour.

### Product Rationale
Traditional complementary feeding porridges in rural Kenya rely primarily on pure maize or cassava starch, resulting in high bulk density and low protein bioavailability. Fortifying indigenous grains with defatted pumpkin seed flour significantly boosts zinc, protein, and essential fatty acids needed for rapid infant growth.`,

      "proposal.problem": `## Statement of the Problem
Infant malnutrition during the transition from exclusive breastfeeding to complementary foods remains high, with stunting peaking between 6 and 23 months of age. Commercial imported infant formulas are priced beyond the reach of low-income rural households, while homemade single-grain porridges fail to meet daily energy density and zinc requirements.

Developing an affordable, nutrient-dense instant cereal flour from locally available agricultural crops is critical to providing accessible complementary nutrition.`,

      "proposal.objectives": `## Specific Objectives
1. To formulate three composite blends incorporating extruded maize, popped amaranth, and defatted pumpkin seed flour.
2. To determine proximate nutritional values (crude protein, crude fat, total ash, moisture, and zinc content) across all sample formulations.
3. To conduct sensory hedonic testing with nursing caregivers to establish taste and texture preferences.
4. To evaluate accelerated microbiological stability over a 60-day storage trial under ambient conditions.`,

      "proposal.rationale": `## Justification and Utility
The instant weaning blend offers an affordable, culturally acceptable complementary food that meets KNEC examination guidelines and KEBS infant food standards. It promotes local agricultural value addition and equips candidates with industrial food processing skills.`,
    },
  },

  // ==========================================
  // 3. NUTRITION & FOOD SCIENCE ENTERPRISE KITS
  // ==========================================
  {
    id: "knec_std_business",
    title: "KNEC Standard Nutrition Enterprise Plan",
    track: "business_plan",
    level: "both",
    badge: "Official KNEC Framework",
    description:
      "Standard 5-chapter KNEC Business Plan outline for nutritional food processing, dietary consulting, and health product distribution.",
    focusArea: "Nutrition, Dietetics, and Food Enterprise",
    sampleTitle:
      "Business Plan for the Establishment of NutriCare Clinical Dietary Consultancy and Therapeutic Foods Enterprise in Nakuru County",
    sampleProblemArea:
      "Lack of accessible clinical nutrition counseling for non-communicable lifestyle diseases and high cost of therapeutic foods.",
    sectionsContent: {
      "proposal.title": `## Enterprise Title
Business Plan for NutriCare Dietary Clinic: An Outpatient Nutritional Counseling and Therapeutic Food Preparation Enterprise in Nakuru Town.

### Commercial Concept
Establishment of a licensed community nutrition clinic offering individualized medical nutrition therapy (diabetes, hypertension, maternal wellness) coupled with retail distribution of freshly prepared therapeutic meal plans and fortified nutritional supplements.`,

      "proposal.problem": `## Market Need and Consumer Problem
The rising burden of lifestyle diseases (Type 2 diabetes, cardiovascular disorders, obesity) has generated urgent demand for accredited nutritionists and dietitians. However, patients discharged from public referral hospitals find limited follow-up dietary counseling and struggle to access standardized therapeutic meal plans.

NutriCare Dietary Clinic bridges this healthcare gap by providing affordable outpatient clinical consultations, body composition analysis, and tailored therapeutic food packages.`,

      "proposal.objectives": `## Commercial and Operational Objectives
1. To provide clinical dietary consultations to at least 150 individual clients per month within the first 6 months.
2. To establish contracted meal delivery partnerships with 3 local private hospitals and corporate wellness programs.
3. To achieve monthly gross revenue of KES 450,000 by Month 6, attaining commercial break-even by Month 8.
4. To maintain 100% compliance with KNDI (Kenya Nutritionists and Dieticians Institute) professional regulations.`,

      "proposal.rationale": `## Economic Feasibility and Justification
The commercial enterprise satisfies growing demand for preventative wellness care and lifestyle disease management. Operating as an integrated clinical and dietary food retail model creates multiple revenue streams while generating meaningful employment for certified TVET nutrition graduates.`,
    },
  },
  {
    id: "nutrition_enterprise_plan",
    title: "Therapeutic Food and Nutrition Enterprise",
    track: "business_plan",
    level: "both",
    badge: "Nutrition Enterprise Track",
    description:
      "Commercial business plan for processing fortified therapeutic weaning foods and dietary wellness products in Kenya.",
    focusArea: "Food Processing and Community Nutrition Enterprise",
    sampleTitle:
      "Business Plan for NutriPro Foods: Commercial Production and Distribution of Fortified Therapeutic Weaning Foods in Nakuru County",
    sampleProblemArea:
      "High price of imported infant formulas and lack of certified, hygienic therapeutic porridge flours in rural retail outlets.",
    sectionsContent: {
      "proposal.title": `## Enterprise Title
Business Plan for NutriPro Foods: Production and Marketing of Biofortified Composite Flour Products in Nakuru County.

### Commercial Concept
Establishment of a standardized, solar-powered agro-processing facility to mill, blend, and package fortified composite flours (sweet potato, amaranth, soy) for retail kiosks, pediatric clinics, and child daycare centers.`,

      "proposal.problem": `## Market Need and Consumer Problem
Caregivers in suburban and rural peri-urban centers face severe shortages of affordable, certified weaning flours with documented nutritional adequacy. Existing informal market grain millers lack quality control, moisture regulation, and standardized food hygiene practices, increasing aflatoxin contamination risks.

NutriPro Foods provides certified, aflatoxin-tested, hermetically packaged composite flours priced 30% below imported cereal brands.`,

      "proposal.objectives": `## Commercial and Operational Objectives
1. To achieve a daily packaging throughput of 500 units of 500g composite flour within the first 4 months.
2. To sign wholesale supply contracts with 60 retail shops and 10 health clinics in Year 1.
3. To achieve gross annual revenue of KES 3,200,000 in Year 1 with net profit margins exceeding 20%.
4. To attain KEBS diamond standardization mark within the first 6 months of operation.`,
    },
  },
];

export function getAvailableStarterKits(track?: WorkspaceType, level?: WorkspaceLevel): StarterKit[] {
  return STARTER_KITS.filter((kit) => {
    if (track && kit.track !== track) return false;
    if (level && kit.level !== "both" && kit.level !== level) return false;
    return true;
  });
}

export function getStarterKitById(id: string): StarterKit | undefined {
  return STARTER_KITS.find((k) => k.id === id);
}
