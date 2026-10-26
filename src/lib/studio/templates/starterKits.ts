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
  // 1. RESEARCH PROJECT STARTER KITS
  // ==========================================
  {
    id: "knec_std_research",
    title: "KNEC Standard Academic Research Outline",
    track: "research_secondary",
    level: "both",
    badge: "Official KNEC Framework",
    description:
      "Complete 5-chapter KNEC research methodology outline with structured subheadings, standard academic wording, and fill-in guidance for any secondary or primary study.",
    focusArea: "General Applied Research & Policy Analysis",
    sampleTitle:
      "A Longitudinal Study on Secondary Data Indicators Affecting [Field/Sub-Sector] in [Target Region/County], Kenya",
    sampleProblemArea:
      "Statistical trend evaluation of institutional records and national survey indicators to identify service delivery and performance gaps.",
    sectionsContent: {
      "proposal.title": `## Project Title
A Longitudinal Trend Analysis of [Key Indicator/Subject, e.g., Maternal Nutrition / Technical Skill Acquisition] in [Target County/Sub-County, e.g., Nakuru County], Kenya (2018–2024).

### Brief Rationale
This research examines empirical trends in [Field/Sector] utilizing authenticated institutional and secondary survey data. Despite national policy initiatives under Vision 2030, localized data indicates persistent disparities that require rigorous statistical evaluation to inform county-level planning and resource allocation.`,

      "proposal.problem": `## Statement of the Problem
In [Target Geographical Area or Sector], empirical evidence reveals that [state core problem, e.g., child malnutrition rates / youth drop-out in technical training] have remained stubbornly above the national target of [insert target %, e.g., 15%]. While multiple interventions have been deployed, there is a distinct lack of longitudinal, localized empirical analysis documenting how these indicators have shifted over the past 5–7 years. 

Without targeted statistical appraisal of these trends across demographic and socio-economic subgroups, educational and public policy managers lack verifiable data to calibrate interventions, leading to inefficient resource utilization and suboptimal outcomes.`,

      "proposal.objectives": `## Research Objectives

### General Objective
To investigate the longitudinal trends and underlying demographic determinants of [Key Research Topic] in [Target Region] between [Start Year] and [End Year].

### Specific Objectives
1. To determine the annual percentage change in [Primary Indicator, e.g., stunting rates / trade certification pass rates] across the target population over the study period.
2. To assess the statistical influence of socio-economic factors ([e.g., household wealth index / maternal education / training facility workshops]) on the observed performance trends.
3. To formulate evidence-based policy and practical recommendations for institutional managers and county technical planners.`,

      "proposal.rationale": `## Significance & Justification of the Study
This study provides crucial statistical insights directly aligned with the Kenya Vision 2030 Social Pillar and County Integrated Development Plans (CIDP). By isolating specific risk indicators and multi-year trajectory shifts, findings will empower:
1. **County Directorate & Planners:** By providing disaggregated baseline data for targeted budget allocation.
2. **TVET & Academic Institutions:** By generating validated reference literature on localized empirical methodology.
3. **Community Stakeholders:** By highlighting actionable interventions that directly address systemic bottlenecks.`,

      "synopsis": `## Executive Abstract / Synopsis
This study conducted an empirical investigation into longitudinal trends in [Research Topic] within [Target Area], spanning the period [Start Year] to [End Year]. Utilizing secondary records from [Custodial Agency, e.g., KNBS / KDHS / MOH / TVET Authority], the analysis evaluated a total target dataset of [N] observations.

Descriptive statistics, percentage shifts, and comparative cross-tabulations were computed to test key research objectives. Findings revealed that [summarize key outcome, e.g., overall indicator improved by 8.4 percentage points, yet severe rural-urban divergence persisted]. The study concludes that targeted structural investments and decentralized supervisory mechanisms are essential. Specific recommendations are addressed to institutional heads and policy makers.`,

      "ack": `## Declaration
I declare that this research project report is my original candidate work submitted in partial fulfillment of the requirements for the award of [Diploma / Craft Certificate] in [Course Title] examined by the Kenya National Examinations Council (KNEC).

Candidate Name: [Insert Full Name]  
Admission Number: [Insert Admission Number]  
Signature: ______________________  Date: __________________

## Acknowledgements
I express sincere gratitude to my supervisor [Supervisor Name] for dedicated academic guidance and critical critique. Special acknowledgment is extended to [Data Custodian Agency, e.g., KNBS / Ministry of Health] for authorizing academic access to the dataset, and to my institution's faculty for continuous support.`,

      "terms": `## Definition of Operational Terms
- **Longitudinal Trend:** The sustained directional movement or percentage variation of a specific measurable indicator recorded over successive survey rounds.
- **Secondary Data Analysis:** The systematic empirical examination and statistical synthesis of data previously collected by official regulatory or statistical bodies.
- **Z-Score (Standard Deviation Score):** The statistical measure that describes a value's relationship to the mean of a group of values, calibrated to international reference standards.
- **Target Population:** The complete set of individuals, institutional units, or records that share common observable attributes under investigation.`,

      "ch1.background": `## 1.1 Background to the Study

### 1.1.1 Global & Regional Perspective
Globally, monitoring longitudinal trends in [Research Subject Area] has emerged as a cornerstone of sustainable development policy under the United Nations Sustainable Development Goals (SDG 3 & 4). In Sub-Saharan Africa, regional monitoring frameworks indicate that while policy coverage has expanded, significant implementation bottlenecks persist due to uneven resource allocation and infrastructural deficits.

### 1.1.2 Kenyan Institutional Context
In Kenya, national strategies aligned with the Constitution (2010) and Vision 2030 mandate devolved authorities to maintain empirical data repositories to track sector performance. Despite these progressive frameworks, localized tracking in [Target Region/County] reveals erratic progress. This study provides an evidence-based assessment of institutional and survey trends to establish clear baselines for future policy interventions.`,

      "ch1.problem": `## 1.2 Statement of the Problem
[Detail the exact empirical gap in 150-250 words: explain what the expected standard is, what the observed reality shows in the target county/institution, what previous studies missed, and the consequence if this investigation is not conducted.]`,

      "ch1.objectives": `## 1.3 Research Objectives
### 1.3.1 General Objective
[Insert General Objective]

### 1.3.2 Specific Objectives
1. [Insert Specific Objective 1]
2. [Insert Specific Objective 2]
3. [Insert Specific Objective 3]`,

      "ch1.questions": `## 1.4 Research Questions
1. What has been the longitudinal trend in [Primary Indicator] in [Target Area] over the period [Years]?
2. How do socio-demographic and institutional variables influence changes in [Primary Indicator]?
3. What pragmatic interventions can institutional planners implement to optimize outcomes?`,

      "ch1.justification": `## 1.5 Justification of the Study
[Explain economic, institutional, and policy justification for undertaking this research work.]`,

      "ch1.scope": `## 1.6 Scope and Delimitations of the Study
- **Geographical Scope:** The investigation was strictly delimited to [Target County/Sub-County].
- **Temporal Scope:** The analysis spans survey and record datasets from [Start Year] to [End Year].
- **Content Scope:** The study focuses exclusively on measurable variables relating to [Specific Core Indicators].`,
    },
  },
  {
    id: "kdhs_health_research",
    title: "Public Health & Child Nutrition Trend Study (KDHS)",
    track: "research_secondary",
    level: "both",
    badge: "Health & Nutrition Track",
    description:
      "Pre-filled secondary research template tailored for Kenya Demographic and Health Survey (KDHS) child stunting, immunization, or maternal care indicators.",
    focusArea: "Nutrition, Public Health & Epidemiology",
    sampleTitle:
      "Longitudinal Trend Analysis of Child Stunting and Feeding Indicators in Nakuru County: Evidence from KDHS Datasets",
    sampleProblemArea:
      "Child malnutrition and stunting rates remaining above national thresholds despite devolution and decentralized maternal clinics.",
    sectionsContent: {
      "proposal.title": `## Project Title
Longitudinal Trend Analysis of Child Malnutrition and Stunting Indicators in Nakuru County: Comparative Evidence from KDHS Datasets (2008–2022).

### Brief Rationale
Child undernutrition remains an enduring public health challenge in East Africa. Analyzing successive Kenya Demographic and Health Survey (KDHS) cohorts provides verifiable, population-level evidence on whether county healthcare devolution has accelerated stunting reduction across vulnerable agro-pastoralist households.`,

      "proposal.problem": `## Statement of the Problem
According to national survey baselines, child stunting (height-for-age Z-score < -2 SD) affects approximately 18% of children under five in Kenya, with pronounced inter-county variations. In Nakuru County, despite expanded rural health center infrastructure, hospital admissions for malnutrition-related illnesses indicate unaddressed dietary and socioeconomic vulnerabilities.

Current literature lacks disaggregated longitudinal analysis assessing whether stunting prevalence has experienced statistically significant percentage reductions between the 2014 and 2022 KDHS cohorts. Without this longitudinal demographic synthesis, county health directors risk allocating nutritional supplements without targeting the most impacted sub-county wards.`,

      "proposal.objectives": `## Research Objectives
### General Objective
To conduct a comparative secondary trend analysis of child stunting and associated maternal socio-demographic determinants in Nakuru County using official KDHS survey data.

### Specific Objectives
1. To calculate the percentage point changes in height-for-age Z-scores (HAZ) among children aged 0–59 months in Nakuru County across the 2008, 2014, and 2022 KDHS survey waves.
2. To determine the association between maternal educational attainment and household wealth index with child stunting outcomes.
3. To propose targeted county public health interventions for high-burden rural sub-counties.`,

      "proposal.rationale": `## Significance & Justification
Findings from this research will provide Nakuru County Department of Health Services with empirical baselines for its County Nutrition Action Plan (CNAP). Furthermore, it demonstrates the practical application of secondary survey epidemiological methodology for TVET and polytechnic health records and nutrition candidates.`,
    },
  },

  // ==========================================
  // 2. BUSINESS PLAN STARTER KITS
  // ==========================================
  {
    id: "knec_std_business",
    title: "KNEC Standard Enterprise Business Plan",
    track: "business_plan",
    level: "both",
    badge: "Official KNEC Commercial Unit",
    description:
      "Comprehensive 5-chapter KNEC Business Plan template with executive summary, SWOT matrix, 4Ps marketing strategy, production workflow, and 3-year cash flow projections.",
    focusArea: "General Commercial Enterprises & Small Businesses",
    sampleTitle:
      "Business Plan for the Establishment of [Enterprise Name] in [Target Town/Sub-County], Kenya",
    sampleProblemArea:
      "Addressing local consumer supply deficits with affordable, high-quality commercial products and services.",
    sectionsContent: {
      "proposal.title": `## Enterprise Title
Business Plan for the Establishment and Operation of [Enterprise Name, e.g., Apex Quality Bakers] in [Location, e.g., Eldoret Town], Uasin Gishu County.

### Commercial Concept & Core Products
The enterprise is formulated as a commercial value-addition venture specializing in [Core Products/Services, e.g., fortified composite bakery products / solar installation contracting]. The enterprise will serve residential estates, retail kiosks, and corporate institutions seeking reliable, certified local supplies.`,

      "proposal.problem": `## Market Need & Consumer Problem
In [Target Trading Center/Sub-County], local consumers and commercial retailers face chronic challenges:
1. **Unreliable Supply Chains:** Existing distributors are located in major urban centers, causing periodic product stock-outs.
2. **High Retail Prices:** Inefficient transport and middlemen inflate consumer prices by up to 25–30%.
3. **Substandard Quality:** Many informal producers lack formal standardization (KEBS compliance) and hygiene certifications.

[Enterprise Name] addresses these market failures by establishing a modern, localized production and distribution facility offering competitive pricing and verified quality.`,

      "proposal.objectives": `## Commercial & Operational Objectives
1. **Production Capacity:** To attain an initial daily output of [e.g., 500 units / 50 service jobs] within the first 6 months of operation.
2. **Market Penetration:** To secure a verified customer base of at least [e.g., 120 wholesale retail outlets / 50 institutional clients] in Year 1.
3. **Financial Target:** To generate gross sales revenue of KES [e.g., 2,400,000] in Year 1, achieving commercial break-even within 8 months.
4. **Employment & Linkages:** To create direct employment for 5 youth artisans and establish supply contracts with local raw material farmers.`,

      "proposal.rationale": `## Economic Feasibility & Justification
The enterprise demonstrates sound commercial viability supported by growing urbanization, rising disposable income, and sustained demand for certified local products. By sourcing primary inputs directly from regional agricultural producers, the business optimizes profit margins while stimulating local micro-economic multiplier effects.`,

      "synopsis": `## Executive Summary
[Enterprise Name] is a registered sole proprietorship/partnership enterprise located in [Town, County], established to provide high-quality [Product/Service] to consumer and retail clients.

- **Market Opportunity:** The local addressable market within a 15km radius is estimated at KES [e.g., 18,000,000] annually, currently dominated by distant suppliers.
- **Initial Capital Requirement:** Total startup capital of KES [e.g., 850,000] will finance machinery procurement, premises lease, working capital, and licensing.
- **Financial Projections:** The venture projects Year 1 Net Profit of KES [e.g., 420,000], increasing to KES [e.g., 890,000] by Year 3, with an internal rate of return exceeding 32%.`,

      "ch1.name": `## 1.1 Business Name & Logo Concept
- **Business Name:** [Enterprise Name, e.g., Horizon Engineering & Energy Solutions]
- **Visual Identity & Brand Rationale:** The name reflects innovation, technical precision, and reliable customer service. The corporate logo incorporates [describe colors, e.g., deep blue symbolizing reliability, and sunburst gold symbolizing energy].`,

      "ch1.products": `## 1.2 Products & Services Offered
1. **Primary Product/Service:** [Detailed specifications, unit packaging, dimensions, technical characteristics].
2. **Secondary Offerings:** [Complementary products, maintenance services, custom customer orders].
3. **Unique Selling Propositions (USPs):**
   - 10% lower pricing than distant competitors due to localized manufacturing.
   - Guaranteed same-day fulfillment for retail store orders.
   - Full regulatory standardization and warranty coverage.`,

      "ch1.ownership": `## 1.3 Form of Business Ownership
The enterprise is established as a **Sole Proprietorship** (or **Partnership**), registered under the Registration of Business Names Act (Cap 499) of the Laws of Kenya.

- **Proprietor Name:** [Candidate Full Name] (100% Equity)
- **Initial Capital Contribution:** KES [e.g., 500,000] from personal savings and SACCO soft loan.`,

      "ch1.location": `## 1.4 Business Location & Infrastructure
- **Physical Address:** Plot No. [XXXX], [Street/Road], [Trading Center/Town].
- **Infrastructural Suitability:**
  - Reliable 3-phase commercial electricity supply for industrial machinery.
  - Piped municipal water supply supplemented by borehole storage.
  - Direct frontage on an all-weather tarmac road for distribution dispatch.`,

      "ch1.swot": `## 1.7 SWOT Analysis Matrix

| Dimension | Key Observations & Strategic Implications |
|---|---|
| **Strengths** | Technical TVET qualifications of the proprietor; localized production minimizing freight costs; modern efficient machinery. |
| **Weaknesses** | New entrant with limited initial brand recognition; restricted working capital during the first quarter. |
| **Opportunities** | Rapid population expansion in target estates; national government preference for local TVET suppliers; digital marketing via social commerce. |
| **Threats** | Fluctuation in raw material commodity prices; power outages; competition from established national brands. |`,

      "ch2.research": `## 2.1 Market Research & Industry Overview
The consumer demand for [Products/Services] in [County] has grown at an estimated 8.5% annually over the last three years, driven by residential construction and rising retail spending. A localized survey of 40 potential clients revealed that 78% are dissatisfied with delivery delays from current suppliers.`,
    },
  },
  {
    id: "bakery_business_plan",
    title: "Commercial Bakery & Confectionery Enterprise",
    track: "business_plan",
    level: "both",
    badge: "Food & Hospitality Track",
    description:
      "Ready business plan template for establishing a modern bread, pastry, and fortified confectionery production bakery in Kenya.",
    focusArea: "Bakery, Catering & Food Technology",
    sampleTitle:
      "Business Plan for the Establishment of Golden Crust Bakers in Kitale Town, Trans-Nzoia County",
    sampleProblemArea:
      "High price of factory bread and lack of nutritious fortified baked goods in surrounding sub-county schools and retail shops.",
    sectionsContent: {
      "proposal.title": `## Enterprise Title
Business Plan for Golden Crust Bakers: A Commercial Bakery Enterprise in Kitale Town, Trans-Nzoia County.

### Commercial Concept
Establishment of a semi-automated commercial bakery producing fortified composite flour bread, queen cakes, and celebration pastries. Sourcing cassava and sweet potato composite flours from local farmers to reduce wheat import costs.`,

      "proposal.problem": `## Market Need & Consumer Problem
Retail shops and schools in Kitale town and surrounding wards experience irregular morning bread supplies, with standard 400g loaves retailing at inflated prices. Existing bakeries rely exclusively on 100% commercial white wheat flour with negligible nutritional fortification. 

Golden Crust Bakers addresses this by utilizing nutrient-dense orange-fleshed sweet potato composite flours to produce fresher, affordable, and vitamin-A fortified loaves delivered before 6:30 AM daily.`,

      "proposal.objectives": `## Commercial & Operational Objectives
1. Attain daily production of 800 loaves of 400g fortified bread and 300 dozen pastry units by Month 4.
2. Sign supply contracts with 45 local retail supermarkets, 6 boarding secondary schools, and 30 kiosk agents.
3. Reach monthly gross revenue of KES 720,000 by Month 6 with a net margin of 22%.
4. Achieve KEBS standardization certification within 90 days of launch.`,
    },
  },
  {
    id: "solar_business_plan",
    title: "Solar Energy & Electrical Contracting Services",
    track: "business_plan",
    level: "both",
    badge: "Electrical & Energy Track",
    description:
      "Business plan starter template for solar PV installations, backup battery systems, and domestic electrical contracting services.",
    focusArea: "Electrical, Renewable Energy & Engineering",
    sampleTitle:
      "Business Plan for Solatrap Energy Systems in Kilifi County: Solar PV & Backup Power Contracting",
    sampleProblemArea:
      "Frequent national grid load-shedding and high electricity tariffs impacting coastal hospitality enterprises and off-grid agricultural farms.",
    sectionsContent: {
      "proposal.title": `## Enterprise Title
Business Plan for Solatrap Energy Systems: Solar Photovoltaic Installation and Backup Power Contracting in Kilifi County.

### Commercial Concept
Solatrap Energy Systems is an engineering services enterprise providing turnkey solar PV design, solar water pumping for agribusiness, hybrid lithium battery backups, and EPRA-certified domestic electrical installations.`,

      "proposal.problem": `## Market Need & Consumer Problem
Frequent grid power outages and escalating KPLC commercial electricity tariffs severely erode profits for coastal hospitality facilities, clinics, and poultry farms in Kilifi County. Furthermore, off-grid irrigation farmers rely on expensive diesel generators with high maintenance overheads.

There is a severe shortage of certified, responsive EPRA Class C1/T3 solar technicians offering localized after-sales warranties and transparent pricing.`,

      "proposal.objectives": `## Commercial & Operational Objectives
1. Complete 24 domestic residential solar installations (2kW–5kW) and 8 agricultural solar water pumping projects in Year 1.
2. Establish formal supplier partnerships with leading Tier-1 solar equipment importers in Mombasa.
3. Generate Year 1 gross revenue of KES 3,800,000 with break-even achieved by Month 7.
4. Maintain a 100% safety compliance record under EPRA and OSHA standards.`,
    },
  },

  // ==========================================
  // 3. TRADE FABRICATION STARTER KITS
  // ==========================================
  {
    id: "knec_std_trade",
    title: "KNEC Standard Technical Fabrication Project",
    track: "trade_fabrication",
    level: "both",
    badge: "Engineering & Technical Trade",
    description:
      "Standard technical fabrication project outline covering design calculations, material selection, fabrication procedures, testing trials, and unit costing.",
    focusArea: "Mechanical, Agricultural & Civil Engineering",
    sampleTitle:
      "Design, Fabrication, and Performance Evaluation of a [Machine Name, e.g., Multi-Crop Thresher] for Smallholder Farmers in [Location], Kenya",
    sampleProblemArea:
      "High post-harvest labor intensity and grain breakage caused by traditional manual processing methods.",
    sectionsContent: {
      "proposal.title": `## Project Title
Design, Fabrication, and Performance Testing of an Electric-Powered [Machine Name, e.g., Maize Sheller / Feed Mixer] Utilizing Locally Available Materials.

### Product Rationale
Smallholder farmers and small-scale agro-processors in Kenya incur excessive labor costs and post-harvest crop losses due to manual processing. This engineering project designs an affordable, ergonomic, locally-manufacturable machine using standard mild steel stock and a single-phase electric motor.`,

      "proposal.problem": `## Statement of the Problem
Manual [harvesting/threshing/processing] is labor-intensive, time-consuming, and results in grain loss rates exceeding 15% due to damage and incomplete separation. Commercial imported machines retail at prohibitive prices (upwards of KES 90,000) and lack spare parts in rural hardware stores. 

There is an urgent requirement for an indigenous, robust technical prototype fabricated from standard commercial steel sections that can be serviced by local village artisans at a fraction of the cost.`,

      "proposal.objectives": `## Specific Objectives
1. To design the structural frame, shaft transmission, and processing chamber based on engineering load calculations and safety factors.
2. To source standard local materials (mild steel angle lines, sheet plates, pulleys, bearings) and fabricate the machine using manual arc welding and lathe machining.
3. To conduct experimental performance trials measuring processing throughput (kg/hour), grain breakage percentage, and machine power consumption.
4. To compute the comprehensive bill of engineering materials and unit production cost.`,

      "proposal.rationale": `## Justification & Expected Utility
The fabricated machine will reduce post-harvest processing time by 75% while maintaining grain damage below 3%. Fabricating the equipment from locally sourced hardware ensures easy maintenance and offers TVET engineering candidates real-world manufacturing competency aligned with KNEC practical examination rubrics.`,

      "synopsis": `## Executive Project Synopsis
This technical project successfully designed, fabricated, and tested a functional prototype of a [Machine Name]. The machine comprises a structural chassis, hopper, rotary drum with beater pegs, concave screen, belt-drive transmission, and a 2.0 HP single-phase electric motor.

Performance trials demonstrated a processing throughput of [e.g., 280 kg/hour] with a grain cracking rate of only 1.8%, surpassing the design benchmark. Total unit fabrication cost was KES [e.g., 28,500], representing a 65% cost savings compared to imported equivalents.`,

      "ch1.background": `## 1.1 Project Overview & Engineering Background
In Kenya's agricultural and manufacturing sectors, mechanization at the micro-enterprise level remains essential to achieving food security and industrialization under the Vision 2030 economic blueprint. Traditional post-harvest operations remain heavily reliant on manual labor, which is inefficient, costly, and causes significant occupational strain on rural workers.

This project focuses on the engineering development of an optimized [Machine Type] tailored to local operational conditions, utilizing standard mild steel sections readily available in local hardware stockists.`,

      "ch1.problem": `## 1.2 Statement of the Technical Problem
[Articulate the mechanical bottleneck, power requirements, throughput deficits, and why existing workshop designs fail or are too expensive.]`,

      "ch1.objectives": `## 1.3 Technical Objectives
1. **Design:** Complete detailed mechanical component drawings, shaft torsion calculations, and bearing selection.
2. **Fabrication:** Execute precision cutting, arc welding, lathe turning, and surface finishing of all sub-assemblies.
3. **Testing:** Evaluate operational throughput, vibration stability, and safety interlocks during 10 hours of continuous test runs.
4. **Costing:** Formulate a detailed Bill of Engineering Materials and calculate single-unit vs batch manufacturing costs.`,
    },
  },
  {
    id: "solar_inverter_project",
    title: "Domestic Solar Inverter & Battery Storage System",
    track: "trade_fabrication",
    level: "both",
    badge: "Electrical & Electronics Track",
    description:
      "Technical fabrication starter kit for electrical candidates designing and assembling an automated pure sine-wave inverter and battery storage unit.",
    focusArea: "Electrical, Electronics & Power Systems",
    sampleTitle:
      "Design and Construction of a 1.5kVA Pure Sine Wave Solar Inverter with Automatic Mains Transfer for Rural Health Clinics",
    sampleProblemArea:
      "Vaccine spoilage and lighting failure in off-grid dispensaries during frequent power blackouts.",
    sectionsContent: {
      "proposal.title": `## Project Title
Design, Construction, and Performance Evaluation of a 1.5kVA Pure Sine Wave Solar Inverter with Automatic Mains Failure (AMF) Transfer.

### Product Rationale
Rural health clinics and community institutions require uninterrupted power for vaccine refrigerators and lighting. This project designs and constructs a reliable 1.5kVA pure sine wave inverter utilizing a microcontroller-driven H-bridge topology and toroid transformer for maximum efficiency.`,

      "proposal.problem": `## Statement of the Problem
Frequent electricity blackouts lasting 4–12 hours threaten perishable cold-chain pharmaceuticals in decentralized dispensaries. Commercial imported inverters frequently fail due to high ambient temperatures, grid voltage surges, and lack of component-level repair schematics. 

A locally engineered, robust inverter with modular component boards and over-voltage protection provides a sustainable, repairable electrical backup solution.`,

      "proposal.objectives": `## Specific Objectives
1. To design the control oscillator circuit using PWM signal generation for pure sine wave output.
2. To assemble the MOSFET power switching stage and wind the step-up transformer to achieve 240V AC ± 5% regulation.
3. To implement automatic changeover relay switching with transfer time under 15 milliseconds.
4. To test total harmonic distortion (THD < 3%) and thermal stability under 100% resistive and inductive loads.`,
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
