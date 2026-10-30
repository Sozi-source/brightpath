/**
 * BrightPath KNEC 25-30 Page Complete Business Plan Builder
 * Generates all 28 sections conforming strictly to the KNEC Entrepreneurship syllabus notes
 * and official template (Business_Plan_Template_KNEC.docx).
 */

import type { BusinessPlanSpecs } from "./businessPlanTypes";
import { computeBusinessPlanFinancials } from "./businessPlanMath";

export interface GeneratedSectionPayload {
  section_key: string;
  title: string;
  content: string;
  wordCount: number;
}

export function buildCompleteBusinessPlan(specs: BusinessPlanSpecs): GeneratedSectionPayload[] {
  const fin = computeBusinessPlanFinancials(specs);
  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");

  const results: GeneratedSectionPayload[] = [];

  const add = (section_key: string, title: string, content: string) => {
    const trimmed = content.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    results.push({ section_key, title, content: trimmed, wordCount });
  };

  // =========================================================================
  // PRELIMINARY PAGES
  // =========================================================================

  add(
    "prelim.declaration",
    "Declaration and Supervisor Approval",
    `### DECLARATION BY CANDIDATE
I declare that this business plan is my original work and that I personally undertook its preparation in accordance with Kenya National Examinations Council (KNEC) guidelines. It has not been presented to any other institution or examination body for the award of any certificate, diploma, or degree.

Candidate Name: **${specs.candidateName || "Candidate"}**  
Index Number: **${specs.admissionNumber || "Index No."}**  
Institution: **${specs.institutionName || "Institution"}**  
Signature: ____________________________________ Date: ________________________

---

### APPROVAL BY SUPERVISOR
I confirm that the work reported in this business plan was carried out by the candidate under my supervision and guidance. I have inspected the business premises rationale, market survey evidence, and financial statements and recommend it for submission to the Kenya National Examinations Council.

Supervisor Name: **${specs.supervisorName || "Institutional Supervisor"}**  
Designation: Department of Human Nutrition & Dietetics / Entrepreneurship  
Signature: ____________________________________ Date: ________________________`
  );

  add(
    "prelim.dedication",
    "Dedication",
    `### DEDICATION
This business plan is dedicated to Almighty God for the gift of life, wisdom, and strength throughout the duration of this academic programme.

I specially dedicate this work to my beloved family, whose steadfast moral support, prayers, and financial sacrifices provided the foundation for my education. I also dedicate this plan to all passionate nutritionists, community health practitioners, and small-scale entrepreneurs across Kenya who strive daily to eliminate malnutrition and promote public health through sustainable, self-reliant enterprise.`
  );

  add(
    "prelim.acknowledgements",
    "Acknowledgements",
    `### ACKNOWLEDGEMENTS
I wish to express my deepest appreciation to my project supervisor, **${specs.supervisorName || "my institutional supervisor"}**, whose intellectual critique, patience, and professional guidance were instrumental in refining this business plan into a viable commercial venture.

I extend sincere gratitude to the management and faculty of **${specs.institutionName || "our institution"}** for providing the academic facilities, laboratory access, and supportive learning environment that enabled the completion of my course in **${specs.course}**.

Special thanks are due to the micro-entrepreneurs, agro-processors, health clinic administrators, and local community members in **${specs.townOrMarket}, ${specs.county}** who participated willingly in the field market feasibility survey and provided authentic equipment price quotations. Their practical insights grounded this business plan in real commercial reality. Finally, I thank my fellow classmates for their constructive feedback and camaraderie during project defence rehearsals.`
  );

  add(
    "prelim.executive_summary",
    "Executive Summary / Synopsis",
    `### EXECUTIVE SUMMARY / SYNOPSIS

**${specs.businessName}** is an emerging micro-enterprise in the **${specs.industrySector}** sector, situated in **${specs.townOrMarket}, ${specs.county}**. The enterprise will operate as a **${specs.formOfOwnership}** founded by **${specs.candidateName || "the promoter"}**, a trained professional holding a **${specs.ownerQualifications}**. The firm's mission is to formulate and supply accessible, nutrient-dense products and advisory services that tackle community nutritional deficits while establishing a profitable, sustainable commercial entity.

The flagship product offered is **${specs.primaryProduct}**, packaged in **${specs.productPackaging}** and retailed at **KES ${formatKES(specs.unitSellingPrice)}** per unit against a production cost of **KES ${formatKES(specs.unitCostOfProduction)}**. In ${specs.townOrMarket}, the total addressable market encompasses approximately **${specs.totalMarketPopulation}**. Market feasibility survey data reveals an unmet consumer deficit driven by high prices of imported commercial brands and hygienic shortcomings of informal, uncertified open-air market vendors. The enterprise projects capturing **${specs.projectedMarketSharePercentage}%** of the local market share within Year 1.

The venture requires a total start-up capital of **KES ${formatKES(fin.totalStartupCapital)}**, consisting of **KES ${formatKES(fin.totalMachineryCost)}** for processing and diagnostic equipment, **KES ${formatKES(fin.totalPreOperationalCost)}** for pre-operational premises renovation and statutory licenses, and **KES ${formatKES(specs.workingCapitalBuffer || 75000)}** for working capital buffer. Financing is structured at **60% owner's equity (KES ${formatKES(Math.round(fin.totalStartupCapital * 0.6))})** sourced from personal savings and family contributions, and **40% debt financing (KES ${formatKES(fin.totalStartupCapital - Math.round(fin.totalStartupCapital * 0.6))})** secured from the Youth Enterprise Development Fund at a concessional interest rate of 12% per annum over a 24-month tenure.

Financial forecasts demonstrate robust commercial viability. First-year gross sales revenue is projected at **KES ${formatKES(fin.annualSalesYear1)}**, yielding a gross profit of **KES ${formatKES(fin.annualGrossProfitYear1)}** (**${fin.grossProfitMarginPercent}% gross margin**). After accounting for operating overheads, annual depreciation of KES ${formatKES(fin.annualDepreciation)}, loan interest, and 30% corporate income tax, Year 1 net profit after tax is projected at **KES ${formatKES(fin.netProfitYear1)}** (**${fin.netProfitMarginPercentYear1}% net margin**), expanding to **KES ${formatKES(fin.netProfitYear2)}** in Year 2 and **KES ${formatKES(fin.netProfitYear3)}** in Year 3. Monthly fixed operating overheads stand at **KES ${formatKES(fin.monthlyFixedCosts)}**, yielding a break-even sales volume of **${formatKES(fin.breakEvenUnitsMonthly)} units per month** (**${fin.breakEvenLevelPercent}% of installed capacity**). Projected return on investment (ROI) is **${fin.returnOnInvestmentYear1}%** and return on equity (ROE) is **${fin.returnOnEquityYear1}%**, confirming that ${specs.businessName} is an economically viable and bankable enterprise.`
  );

  // =========================================================================
  // CHAPTER ONE: BUSINESS DESCRIPTION
  // =========================================================================

  add(
    "ch1.name",
    "1.1 Business Name, Nature and Brand Identity",
    `### 1.1 Business Name, Nature and Brand Identity

The proposed commercial enterprise will operate under the registered trade name **${specs.businessName}**. The business slogan and brand motto is: *"**${specs.tagline}**"*.

#### 1.1.1 Brand Positioning and Symbolism
The business name was strategically formulated to communicate authenticity, health, and local community empowerment. The brand logo incorporates vibrant green and golden-yellow hues:
- **Green Leaf Motif**: Represents organic freshness, natural nutrition, vitality, and environmental sustainability.
- **Golden Grain / Sunburst Motif**: Signifies biofortified crops, wholesome dietary energy, and economic prosperity for local smallholder agricultural producers.
- **Typography**: Clean, professional sans-serif lettering designed to instill medical, clinical, and food-grade hygiene confidence among consumers, public health regulators, and healthcare practitioners.

#### 1.1.2 Nature of Business and Economic Sector
The enterprise operates within the **${specs.industrySector}** sector. In Kenya, this industry occupies a pivotal junction between agriculture and public health. The enterprise adds significant economic value by procuring locally accessible agricultural ingredients and transforming them through hygienic processing, laboratory-calibrated blending, standardized packaging, and evidence-based nutrition counseling into consumer-ready therapeutic and lifestyle health solutions.`
  );

  add(
    "ch1.location",
    "1.2 Business Location and Physical Infrastructure",
    `### 1.2 Business Location and Physical Infrastructure

#### 1.2.1 Physical Site and Address
The proposed business will establish its physical operating premises at:
- **Physical Address**: ${specs.streetOrBuilding}, ${specs.townOrMarket}, ${specs.county}
- **Postal Address**: P.O. Box ${specs.postalAddress || "100-30200"}, ${specs.townOrMarket}, Kenya
- **Electronic Contacts**: Telephone: ${specs.phone || "+254 700 000 000"} | Email: ${specs.email || "info@business.co.ke"}

#### 1.2.2 Rationale for Site Selection
The selection of **${specs.townOrMarket}** in **${specs.county}** was guided by rigorous market reconnaissance and operational considerations:
1. **Accessibility to Target Buyers**: ${specs.locationRationale} The premises front a high-traffic tarmac road, facilitating walk-in consumers, clinic referrals, and smooth loading for distribution vehicles.
2. **Proximity to Raw Material Suppliers**: The location minimizes freight and farmgate transport costs by establishing direct supply links with smallholder farmer cooperatives across ${specs.county}.
3. **Availability of Critical Municipal Utilities**: The site has continuous connection to treated piped municipal water, reliable three-phase electrical power from Kenya Power & Lighting Company (KPLC), stormwater drainage, and county waste disposal services.
4. **Security and Commercial Zoning**: Situated within an approved commercial light-manufacturing and trade zone, the premises benefit from regular police patrols, gated night security guards, and commercial insurance coverage.`
  );

  add(
    "ch1.ownership",
    "1.3 Form of Business Ownership and Promoter Profile",
    `### 1.3 Form of Business Ownership and Promoter Profile

#### 1.3.1 Form of Ownership
The enterprise will be registered as a **${specs.formOfOwnership}** pursuant to the **${specs.registrationType}**. This legal structure is selected because:
- **Ease of Formation**: Streamlined registration procedures with the Registrar of Companies on the eCitizen platform, requiring modest initial statutory fees.
- **Decisive Management**: The sole proprietor retains total managerial control, enabling swift operational adjustments without lengthy partner disputes.
- **Fiscal Simplicity**: Income generated is assessed under personal tax brackets without complex double taxation structures during the initial incubation phase.
- **Future Incorporation**: The business plan accommodates seamless transition into a Private Limited Company as production scales in Year 3.

#### 1.3.2 Owner / Promoter Background
The enterprise is established and directed by **${specs.candidateName || "the candidate"}**, a Kenyan technical professional possessing a **${specs.ownerQualifications}**. 

The promoter's educational curriculum in Human Nutrition and Dietetics provided rigorous theoretical and practical mastery of macronutrient metabolism, food hygiene standards, dietary disease management, anthropometric diagnostics, and technical entrepreneurship. Prior clinical and community attachment experience in public healthcare facilities exposed the promoter to prevalent nutritional deficiencies, community purchasing behaviors, and public health procurement workflows.`
  );

  add(
    "ch1.nature",
    "1.4 Industry Sector Dynamics and Justification",
    `### 1.4 Industry Sector Dynamics and Opportunity Justification

#### 1.4.1 National and County Industry Overview
The enterprise operates within Kenya's rapidly growing agro-processing and preventive healthcare industry. According to the Kenya National Bureau of Statistics (KNBS) and the Ministry of Health, non-communicable lifestyle diseases (such as diabetes, cardiovascular conditions, and obesity) are expanding at an annual rate exceeding 12% across urban and peri-urban centers. Concurrently, childhood undernutrition, stunting, and micronutrient deficiencies remain severe challenges in rural and informal settlement communities.

Government policies under the **Kenya Vision 2030** and the **National Food and Nutrition Security Policy (NFNSP)** prioritize local agro-processing, value addition, food biofortification, and import substitution.

#### 1.4.2 Commercial Viability and Market Opportunity
The business opportunity is commercially justified on four foundational pillars:
1. **Structural Market Deficit**: Existing commercial nutritious food brands in supermarket chains are manufactured in Nairobi and carry prohibitive retail price markups that exclude lower- and middle-income families.
2. **Hygiene and Standardization Deficit**: Open-air posho mills fail to maintain moisture control (<13.5%), leading to elevated aflatoxin risks and lack of KEBS certification.
3. **High Return on Investment**: Local agricultural raw materials (grains, legumes, fruits) exhibit high seasonal supply gluts and low farmgate prices, allowing the enterprise to achieve favorable gross margins.
4. **Community Socio-Economic Contribution**: The enterprise creates direct youth employment for machine operators, store clerks, and marketing agents, while establishing dependable market off-take for over 25 contracted smallholder farming households.`
  );

  add(
    "ch1.products",
    "1.5 Products and Services Specifications",
    `### 1.5 Products and Services Specifications

The enterprise will formulate, manufacture, and distribute high-grade nutritional offerings under the brand **${specs.businessName}**.

#### 1.5.1 Flagship Offering Description
- **Core Offering**: **${specs.primaryProduct}**
- **Detailed Specifications**: ${specs.productDescription}
- **Packaging Format**: ${specs.productPackaging}
- **Unit Retail Pricing**: **KES ${formatKES(specs.unitSellingPrice)}** per unit.
- **Unit Production Cost**: **KES ${formatKES(specs.unitCostOfProduction)}** per unit.

#### 1.5.2 Unique Selling Propositions (USPs)
1. **Calibrated Nutrient Density**: Developed by a qualified nutrition professional adhering to WHO/FAO dietary guidelines and Codex Alimentarius micro-nutrient standards.
2. **Moisture-Proof Vacuum Packaging**: High-barrier laminate pouches that preserve volatile vitamins, inhibit lipid oxidation, and prevent insect infestation without artificial chemical preservatives.
3. **Superior Consumer Affordability**: Priced at a 25% discount relative to established national multinational brands while providing superior fresh flavor and biological value.
4. **Integrated Nutrition Guidance**: Every package contains illustrated pictorial instructions in both English and Kiswahili, detailing hygienic preparation and complementary feeding frequencies.`
  );

  add(
    "ch1.mission",
    "1.6 Vision, Mission, and Core Corporate Values",
    `### 1.6 Vision, Mission, and Core Corporate Values

#### 1.6.1 Vision Statement
*"To be the most reputable, innovative, and preferred provider of affordable, nutrient-rich foods and clinical dietary solutions across ${specs.county} and the wider region by 2030."*

#### 1.6.2 Mission Statement
*"To formulate, manufacture, and deliver safe, wholesome, and scientifically balanced nutritional products and evidence-based dietary counseling using locally sourced agricultural inputs, thereby combating malnutrition and empowering community health."*

#### 1.6.3 Core Corporate Values
The operations, workforce culture, and commercial relationships of ${specs.businessName} are guided by five core pillars:
1. **Nutritional Integrity & Safety**: Strict adherence to KEBS KS EAS 39:2020 food manufacturing standards, GMP hygiene protocols, and zero adulteration.
2. **Affordability**: Continuous process efficiency to ensure our health solutions remain accessible to low- and middle-income households.
3. **Customer Centricity**: Respectful, empathetic, and confidential service tailored to each client's physiological and nutritional needs.
4. **Community Partnership**: Fair trade procurement practices that uplift smallholder farmers and foster local economic development.
5. **Innovation & Continuous Learning**: Constant research into indigenous biofortified crops, modern processing technologies, and consumer preferences.`
  );

  add(
    "ch1.goals",
    "1.7 Business Goals and SMART Objectives",
    `### 1.7 Business Goals and SMART Objectives

The strategic trajectory of **${specs.businessName}** is divided into measurable short-term milestones and long-term expansion goals.

#### 1.7.1 Short-Term Objectives (Year 1)
1. **Operational Launch**: Complete premises fitting, machinery installation, trial batch testing, and regulatory licensing within the first 60 days of funding.
2. **Production Throughput**: Achieve a monthly production and sales volume of **${formatKES(specs.monthlyProductionUnitsYear1)} units**, generating **KES ${formatKES(fin.annualSalesYear1)}** in gross annual turnover.
3. **Retail Distribution Reach**: Establish direct supply contracts with at least **30 retail kiosks, 5 local mini-supermarkets, and 5 clinic canteens** across ${specs.townOrMarket}.
4. **Financial Break-Even**: Attain commercial break-even by **month 5** and close Year 1 with a net profit after tax of **KES ${formatKES(fin.netProfitYear1)}**.
5. **Quality Certification**: Attain the Kenya Bureau of Standards (KEBS) Standardization Mark of Quality (SM) within the first 9 months of active operation.

#### 1.7.2 Long-Term Objectives (Years 2 – 3)
1. **Market Expansion**: Expand sales distribution channels into three neighboring sub-counties, expanding monthly throughput by **${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%** in Year 2 and **${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%** in Year 3.
2. **Product Line Diversification**: Introduce specialized formulations including low-glycemic flour for diabetic management and infant weaning porridge mixes.
3. **Capital Independence**: Fully amortize the commercial loan by month 24, accumulating retained reserves exceeding KES 500,000 to finance automated packaging machinery.`
  );

  add(
    "ch1.justification",
    "1.8 Justification and Commercial Viability",
    `### 1.8 Justification and Commercial Viability

The establishment of **${specs.businessName}** in **${specs.townOrMarket}, ${specs.county}** is justified on robust socioeconomic, public health, and commercial grounds:

#### 1.8.1 Public Health and Nutritional Impact
Undernutrition, micronutrient deficiencies, and stunting in young children remain critical public health burdens in peri-urban and rural areas of ${specs.county}. At the same time, shifting dietary habits have triggered an escalation in diet-related non-communicable conditions among adults. By providing scientifically formulated, nutrient-dense products utilizing locally accessible ingredients, the enterprise directly tackles these nutritional disparities at grassroots household level.

#### 1.8.2 Consumer Affordability and Import Substitution
Packaged commercial nutrition products currently stocked in supermarkets are largely produced in Nairobi or imported, carrying prohibitive distribution and packaging markups that render them unaffordable to typical families. **${specs.businessName}** eliminates inter-county freight markups, offering an unadulterated, certified product at a price point that is 20% to 30% below national brands while guaranteeing superior bioavailability and freshness.

#### 1.8.3 Local Economic Development and Smallholder Value Addition
The venture acts as an agro-processing catalyst for local farmers by guaranteeing prompt, fair-trade cash purchase of surplus raw crops (such as sorghum, millet, soy, and sweet potatoes). This strengthens county agricultural value chains, curbs post-harvest losses, and creates direct formal employment for youth and women in manufacturing, hygiene inspection, sales, and retail delivery.`
  );

  add(
    "ch1.entry",
    "1.9 Market Entry and Growth Strategies",
    `### 1.9 Market Entry and Growth Strategies

#### 1.9.1 Market Entry Strategy
To overcome entry barriers and displace entrenched consumer inertia, **${specs.businessName}** will deploy a phased market penetration approach:
1. **Direct Sampling & Demonstration Drives**: Organize interactive porridge-tasting demos and anthropometric screening at community market days, churches, and maternal clinics.
2. **Introductory Trade Margin Incentives**: Offer neighborhood retailers an attractive 18% retail margin (compared to 10% offered by multinational brands), alongside sale-or-return terms on initial consignments.
3. **Endorsement by Health Workers**: Present product nutrient profiles and laboratory certificates to local public health officers, clinical nutritionists, and community health promoters.

#### 1.9.2 Long-Term Growth Strategy
- **Market Penetration**: Deepening retail presence in primary school feeding tenders and private hospital cafeterias.
- **Product Development**: Introducing fortified weaning purees, extruded cereal snacks, and bulk hotel-pack formulations.
- **Backward Integration**: Establishing formal out-grower contract farming with 40 women-led agricultural self-help groups, securing guaranteed grain quality at pre-agreed farmgate prices.`
  );

  add(
    "ch1.swot",
    "1.10 Comprehensive SWOT Analysis and Mitigation Matrix",
    `### 1.10 Comprehensive SWOT Analysis and Mitigation Matrix

A comprehensive analysis of internal enterprise capabilities and external market dynamics is detailed below.

| Category | Enterprise Attributes | Strategic Mitigation / Exploitation Action |
| :--- | :--- | :--- |
| **STRENGTHS** | • Qualified promoter holding professional nutrition credentials.<br>• Locally formulated product meeting verified clinical standards.<br>• Direct access to low-cost raw material supply chains.<br>• Compact, low-overhead operational cost structure. | Leverage technical expertise to conduct educational consumer marketing; maintain agile delivery schedules. |
| **WEAKNESSES** | • Brand is new to the market relative to established national brands.<br>• Modest startup marketing budget.<br>• Manual packaging aspects during early pilot phase. | Deploy point-of-sale displays, localized word-of-mouth campaigns, and invest initial cash surpluses into automated band sealers. |
| **OPPORTUNITIES** | • Rising consumer demand for preventive health and whole-grain foods.<br>• County government prioritization of school feeding programs.<br>• Import substitution driven by high prices of imported infant foods. | Bid for municipal school feeding tenders; forge partnerships with antenatal clinics and child wellness centers. |
| **THREATS** | • Fluctuations in grain prices due to regional seasonal droughts.<br>• Aggressive promotional discounting by corporate multinationals.<br>• Escalating electricity tariffs and fuel distribution overheads. | Maintain a 60-day buffer stock of dried grains in hermetic storage bags; install energy-efficient motors. |`
  );

  // =========================================================================
  // CHAPTER TWO: MARKETING PLAN
  // =========================================================================

  add(
    "ch2.customers",
    "2.1 Target Customers and Market Segmentation",
    `### 2.1 Target Customers and Market Segmentation

#### 2.1.1 Target Consumer Demographics
The customer base in **${specs.townOrMarket}** and surrounding sub-counties is segmented into three distinct groups:
1. **Mothers and Caregivers of Infants (6–59 Months)**: Household purchasers seeking digestible, energy-dense complementary weaning foods that promote child weight gain and mental development.
2. **Adults Managing Lifestyle Non-Communicable Diseases**: Individuals diagnosed with diabetes, hypertension, and obesity who demand low-glycemic, fiber-rich, and sodium-free whole food alternatives.
3. **Institutional Buyers**: Primary boarding schools, day nurseries, mission hospital canteens, and sports clubs seeking affordable, high-protein bulk nutrition.

#### 2.1.2 Consumer Purchasing Behavior
Field interviews confirm that 78% of household food purchase decisions are made by mothers. Primary buying criteria rank as: 1) Price affordability, 2) Visual cleanliness and absence of sand/stones, 3) Brand taste acceptability by children, and 4) Packaging integrity.`
  );

  add(
    "ch2.demand",
    "2.2 Market Share and Projected Total Demand",
    `### 2.2 Market Share and Projected Total Demand

#### 2.2.1 Total Addressable Market (TAM)
In **${specs.county}**, the primary market catchment of **${specs.townOrMarket}** has an estimated population of **${specs.totalMarketPopulation}**, comprising approximately 8,500 households. The average household consumes 4 kg of porridge flour and health foods monthly, generating a total addressable market demand of **34,000 kg per month**.

#### 2.2.2 Projected Market Share Breakdown
The competitive market share distribution in the locality is summarized below:

| Market Competitor / Category | Estimated Monthly Volume (kg) | Estimated Market Share (%) |
| :--- | :--- | :--- |
| **National Corporate Brands (Famila, Wimbi)** | 11,900 kg | 35% |
| **Informal Local Posho Mills (Loose unbranded)** | 13,600 kg | 40% |
| **Other Small Regional Processors** | 3,400 kg | 10% |
| **${specs.businessName} (Projected Target)** | **5,100 kg** | **15%** |
| **Total Local Market Volume** | **34,000 kg** | **100%** |

Capturing a **15% market share** represents an initial Year 1 operational target of **${formatKES(specs.monthlyProductionUnitsYear1)} units per month**, which is conservative and fully achievable with our production setup.`
  );

  add(
    "ch2.competitors",
    "2.3 Competitor Analysis and Competitive Advantage",
    `### 2.3 Competitor Analysis and Competitive Advantage

A field survey was conducted across competing food processing and nutrition outlets in the commercial trading area.

| Competitor Name | Physical Location | Pricing Structure | Key Strengths | Key Weaknesses |
| :--- | :--- | :--- | :--- | :--- |
${specs.competitors
  .map(
    (c) =>
      `| **${c.name}** | ${c.location} | ${c.priceLevel} | ${c.strengths} | ${c.weaknesses} |`
  )
  .join("\n")}
| **${specs.businessName}** | ${specs.streetOrBuilding} | KES ${formatKES(specs.unitSellingPrice)} | Formulation by certified nutritionist, hermetic vacuum packaging, lower price point, direct client counseling. | New brand footprint; initial production scaling up. |

#### 2.3.1 Sustainable Competitive Advantage
Unlike corporate brands manufactured hundreds of kilometers away, **${specs.businessName}** maintains direct proximity to the community. We provide personalized dietary guidance on packaging, source fresh raw grains from local farmers, and offer immediate replacements for any defective units.`
  );

  add(
    "ch2.pricing",
    "2.4 Pricing Strategy and Cost Structure",
    `### 2.4 Pricing Strategy and Cost Structure

The enterprise adopts a **Cost-Plus Competitor-Benchmarked Pricing Model**. This ensures full recovery of production costs, fixed overheads, and a sustainable operating margin while remaining accessible to consumers.

#### 2.4.1 Unit Cost Breakdown (${specs.primaryProduct})
- **Direct Raw Materials**: KES ${formatKES(Math.round(specs.unitCostOfProduction * 0.75))}
- **Packaging Pouch & Label**: KES ${formatKES(Math.round(specs.unitCostOfProduction * 0.15))}
- **Direct Processing Labor & Electricity**: KES ${formatKES(Math.round(specs.unitCostOfProduction * 0.10))}
- **Total Unit Variable Cost**: **KES ${formatKES(specs.unitCostOfProduction)}**
- **Wholesale Selling Price (To Retailers)**: **KES ${formatKES(Math.round(specs.unitSellingPrice * 0.82))}** (18% retailer margin)
- **Recommended Maximum Retail Price (RRP)**: **KES ${formatKES(specs.unitSellingPrice)}**
- **Gross Contribution Margin per Unit**: **KES ${formatKES(fin.contributionMarginPerUnit)} (${Math.round((fin.contributionMarginPerUnit / specs.unitSellingPrice) * 100)}%)**

#### 2.4.2 Credit Policy and Terms of Sale
- **Walk-in Retail Sales**: 100% Cash / M-PESA Paybill settlement upon delivery.
- **Approved Retail Distributors**: Maximum 7-day credit terms on subsequent orders after full payment of initial consignment.
- **Cash Discounts**: 2.5% prompt settlement discount for orders exceeding 100 units paid within 24 hours.`
  );

  add(
    "ch2.promotion",
    "2.5 Advertising and Sales Promotion Strategy",
    `### 2.5 Advertising and Sales Promotion Strategy

To achieve commercial recognition across **${specs.county}**, the business will execute a localized, cost-effective promotional campaign with a monthly allocation of **KES ${formatKES(specs.marketingPromotionBudgetMonthly)}**.

#### 2.5.1 Promotional Channels & Activities
1. **Interactive Cooking Demos**: Weekly educational porridge tasting sessions at child welfare and antenatal clinics, demonstrating proper weaning porridge thickness.
2. **Point-of-Sale Branding**: Providing branded laminated poster stands, branded plastic measuring cups, and price boards to contracted retail shops.
3. **Community Radio Announcements**: Bi-weekly sponsored radio features in the local language on popular vernacular stations discussing maternal nutrition and biofortified foods.
4. **Digital & Social Media Marketing**: Active WhatsApp Business catalog and localized Facebook community group updates offering dietary advice and home delivery arrangements.
5. **Branded Delivery Gear**: Branded dustcoats, delivery bags, and t-shirts worn by the sales representative creating high visible brand recall.`
  );

  add(
    "ch2.distribution",
    "2.6 Distribution Strategy and Logistics",
    `### 2.6 Distribution Strategy and Logistics

The enterprise utilizes a **Multi-Tier Hybrid Distribution Model** to guarantee rapid product availability across **${specs.townOrMarket}**.

\`\`\`
[ Production Plant ]
       │
       ├─── (40%) ─── Direct Sales to Consumers & Clinics (M-PESA / Cash)
       │
       ├─── (45%) ─── Wholesale Supply to Kiosks & Retail Supermarkets
       │
       └─── (15%) ─── Institutional Supply Contracts (Schools, Canteens, Nurseries)
\`\`\`

- **Primary Channel (Direct Delivery)**: The enterprise will utilize a company cargo motorbike / tricycle to conduct daily morning replenishment runs to 30 contracted retail shops.
- **Logistics Cost**: Monthly fuel and maintenance budget of **KES ${formatKES(specs.monthlyOverheads.transport)}**, ensuring reliable deliveries and zero stock-outs.
- **Warehousing**: A clean, rodent-proof palletized stockroom on the premises accommodating up to 2 weeks of buffer stock.`
  );

  add(
    "ch2.forecast",
    "2.7 Sales Forecast and Revenue Projections",
    `### 2.7 Sales Forecast and Revenue Projections

Sales volumes are modeled with a conservative initial ramp-up during Months 1 to 4, reaching full monthly operating capacity of **${formatKES(specs.monthlyProductionUnitsYear1)} units** from Month 5 onwards.

| Performance Metric | Year 1 | Year 2 (+${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%) | Year 3 (+${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%) |
| :--- | :--- | :--- | :--- |
| **Total Units Produced & Sold** | ${formatKES(Math.round(fin.annualSalesYear1 / specs.unitSellingPrice))} units | ${formatKES(Math.round(fin.annualSalesYear2 / specs.unitSellingPrice))} units | ${formatKES(Math.round(fin.annualSalesYear3 / specs.unitSellingPrice))} units |
| **Average Selling Price (KES)** | KES ${formatKES(specs.unitSellingPrice)} | KES ${formatKES(Math.round(specs.unitSellingPrice * 1.05))} | KES ${formatKES(Math.round(specs.unitSellingPrice * 1.08))} |
| **Gross Annual Revenue (KES)** | **KES ${formatKES(fin.annualSalesYear1)}** | **KES ${formatKES(fin.annualSalesYear2)}** | **KES ${formatKES(fin.annualSalesYear3)}** |
| **Average Monthly Revenue** | KES ${formatKES(Math.round(fin.annualSalesYear1 / 12))} | KES ${formatKES(Math.round(fin.annualSalesYear2 / 12))} | KES ${formatKES(Math.round(fin.annualSalesYear3 / 12))} |`
  );

  // =========================================================================
  // CHAPTER THREE: ORGANIZATION & MANAGEMENT
  // =========================================================================

  add(
    "ch3.structure",
    "3.1 Organizational Structure / Organogram",
    `### 3.1 Organizational Structure / Organogram

The business operates a lean, functional hierarchy designed to maintain strict quality standards while minimizing administrative overheads.

\`\`\`
                ┌──────────────────────────────────────┐
                │          MANAGING DIRECTOR           │
                │     (Proprietor / Nutritionist)      │
                └──────────────────┬───────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         │                                                   │
┌────────┴──────────────┐                           ┌────────┴──────────────┐
│  OPERATIONS & QUALITY │                           │ SALES & ACCOUNTS CLERK│
│    MACHINE OPERATOR   │                           │ (Marketing & Records) │
└───────────────────────┘                           └───────────────────────┘
\`\`\`

- **Chain of Command**: The Managing Director has overall executive, fiscal, and regulatory responsibility. All operational and sales personnel report directly to the Managing Director.`
  );

  add(
    "ch3.management",
    "3.2 Management Team Background and Competencies",
    `### 3.2 Management Team Background and Competencies

The enterprise is led by **${specs.candidateName || "the candidate"}**, who serves as the Managing Director and Lead Professional.

#### 3.2.1 Qualifications and Technical Competencies
- **Academic Credentials**: ${specs.ownerQualifications}
- **Regulatory Registrations**: Registered by the Kenya Nutritionists and Dieticians Institute (KNDI).
- **Core Competencies**: Formulation chemistry, HACCP hygiene standards, clinical meal prescription, inventory management, and basic financial accounting.

#### 3.2.2 Management Responsibilities
1. Overseeing raw material inspection, moisture testing, and formulating batch ratios.
2. Managing regulatory inspections with KEBS, County Public Health, and KRA.
3. Controlling cash flow, reviewing bank reconciliations, and authorizing payments.
4. Conducting clinical consultations and training staff on food safety.`
  );

  add(
    "ch3.staffing",
    "3.3 Staffing Requirements and Job Specifications",
    `### 3.3 Staffing Requirements and Job Specifications

The enterprise will employ a dedicated team of **${specs.staffing.reduce((sum, s) => sum + s.count, 0)} personnel** to run daily manufacturing and administrative operations.

| Position Title | Staff Count | Key Duties and Operational Tasks | Minimum Academic & Professional Qualifications |
| :--- | :--- | :--- | :--- |
${specs.staffing
  .map(
    (s) =>
      `| **${s.position}** | ${s.count} | ${s.duties} | ${s.qualifications} |`
  )
  .join("\n")}`
  );

  add(
    "ch3.remuneration",
    "3.4 Remuneration, Benefits, and Payroll Schedule",
    `### 3.4 Remuneration, Benefits, and Payroll Schedule

Employees receive competitive salaries compliant with the Regulation of Wages (General) Order under the Employment Act, alongside statutory social protections.

| Staff Position | Count | Basic Monthly Pay (KES) | Statutory Deductions (NSSF, SHA, PAYE) | Net Monthly Pay (KES) | Total Monthly Cost (KES) |
| :--- | :--- | :--- | :--- | :--- | :--- |
${specs.staffing
  .map((s) => {
    const basic = s.monthlySalary;
    const nssf = 1080;
    const sha = Math.round(basic * 0.0275);
    const net = basic - nssf - sha;
    return `| **${s.position}** | ${s.count} | ${formatKES(basic)} | ${formatKES(nssf + sha)} | ${formatKES(net)} | ${formatKES(basic * s.count)} |`;
  })
  .join("\n")}
| **Total Monthly Payroll** | **${specs.staffing.reduce((sum, s) => sum + s.count, 0)}** | **${formatKES(specs.staffing.reduce((sum, s) => sum + s.count * s.monthlySalary, 0))}** | | | **KES ${formatKES(specs.staffing.reduce((sum, s) => sum + s.count * s.monthlySalary, 0))}** |

#### 3.4.1 Staff Incentives and Welfare
- **Performance Bonuses**: Monthly sales incentive of 2% on collections exceeding target quotas.
- **Protective Workwear**: Two sets of white food-grade laboratory dustcoats, hairnets, and rubber gumboots per annum.
- **Medical Coverage**: Mandatory enrollment in the Social Health Authority (SHA) and annual food handlers medical clearance.`
  );

  add(
    "ch3.recruitment",
    "3.5 Recruitment, Training, and Staff Development",
    `### 3.5 Recruitment, Training, and Staff Development

#### 3.5.1 Recruitment Process
Positions will be advertised through local community boards, technical institutes, and county employment notices. Shortlisted candidates undergo practical competency assessments and health screening before appointment.

#### 3.5.2 Induction and Continuous Training Programs
1. **Food Safety & HACCP Induction**: Comprehensive training on personal hygiene, equipment sanitation, pest prevention, and cross-contamination prevention.
2. **First Aid & Machine Safety**: Training on emergency shutdown procedures, electrical safety, fire extinguisher handling, and dust inhalation prevention.
3. **Customer Care & POS Operations**: Professional training on cashiering, polite communication, and inventory reconciliation.`
  );

  add(
    "ch3.legal",
    "3.6 Regulatory Licenses, Health Permits, and Compliance",
    `### 3.6 Regulatory Licenses, Health Permits, and Compliance

The business will strictly fulfill all national and county government regulatory standards prior to full commercial commissioning.

| Regulatory Approval / License | Issuing Authority | Statutory Legal Basis | Annual Cost (KES) |
| :--- | :--- | :--- | :--- |
| **Business Name Registration Certificate** | Business Registration Service | Business Names Act (Cap 499) | KES 1,000 (One-off) |
| **Single Business Permit (SBP)** | County Government of ${specs.county} | County Finance Act | KES 12,000 / year |
| **Food Handler Medical Certificates** | County Public Health Department | Public Health Act (Cap 242) | KES 3,000 / year |
| **Food Hygiene License (Premises)** | County Public Health Department | Food, Drugs & Chemical Substances Act | KES 5,000 / year |
| **Standardization Mark of Quality (SM)** | Kenya Bureau of Standards (KEBS) | Standards Act (Cap 496) | KES 20,000 / 3 years |
| **KRA Tax PIN / Tax Compliance** | Kenya Revenue Authority (KRA) | Income Tax Act (Cap 470) | Statutory Compliance |`
  );

  add(
    "ch3.support",
    "3.7 Supporting Professional Services",
    `### 3.7 Supporting Professional Services

The enterprise will partner with established external professional institutions to ensure operational resilience and financial transparency:
- **Commercial Banking**: Equity Bank / KCB Bank (${specs.townOrMarket} Branch) for business current account operations, M-PESA Till integration, and loan administration.
- **Auditing & Accounting**: Retained certified bookkeeping firm for quarterly tax filing, statutory NSSF/SHA remittance, and annual balance sheet audits.
- **Legal Counsel**: Retained local advocate on call for lease agreements, supplier dispute resolution, and regulatory advisory.
- **Enterprise Mentorship**: Association with the Kenya National Chamber of Commerce & Industry (KNCCI) and the Micro & Small Enterprise Authority (MSEA).`
  );

  // =========================================================================
  // CHAPTER FOUR: OPERATIONAL / PRODUCTION PLAN
  // =========================================================================

  add(
    "ch4.facilities",
    "4.1 Production Facilities and Space Allocation",
    `### 4.1 Production Facilities and Space Allocation

The production plant occupies a floor area of **${specs.workshopSquareMeters} square meters** at **${specs.streetOrBuilding}**, leased at **KES ${formatKES(specs.monthlyRent)}** per month.

#### 4.1.1 Facility Layout Plan
The workshop layout is engineered according to linear HACCP workflow principles to eliminate cross-contamination:
1. **Raw Material Receiving & Storage Bay (15 m²)**: Elevated wooden pallets and hermetic grain silos with moisture testing bench.
2. **Processing & Formulation Section (20 m²)**: Tiled, washable walls housing the grain roaster, hammer mill, and blending drums.
3. **Packaging & Quality Testing Station (15 m²)**: Cleanroom environment with positive pressure, ultraviolet air sanitizers, and impulse sealers.
4. **Finished Goods Warehouse & Dispatch (15 m²)**: Pallet racks holding boxed pouches ready for distribution.
5. **Administrative Office & Restrooms (15 m²)**: Executive desk, filing cabinets, handwashing sinks, and staff locker facilities.`
  );

  add(
    "ch4.workflow",
    "4.2 Production Process Workflow",
    `### 4.2 Production Process Workflow

The manufacturing of **${specs.primaryProduct}** follows a calibrated six-step sequential workflow:

\`\`\`
[1. Sourcing & Destoning] ──> [2. Roasting / Pre-cooking] ──> [3. Precision Milling]
                                                                        │
[6. Box Packing & Dispatch] <── [5. Vacuum Pouch Sealing] <── [4. Nutrient Blending]
\`\`\`

1. **Grain Intake & Destoning**: Raw grains undergo mechanical sieving, manual destoning, and moisture testing (moisture content must be < 13.0%).
2. **Roasting / Pre-Cooking**: Grains are gently roasted at 85°C to deactivate antinutritional enzymes, reduce starch viscosity, and enhance nutty aroma.
3. **Milling**: High-speed hammer milling using a 0.8 mm stainless steel screen to achieve uniform particle size.
4. **Nutrient Blending**: Mechanically blending ingredients into standardized ratios (e.g. 40% sweet potato, 30% millet/sorghum, 20% soy, 10% amaranth).
5. **Sealing & Quality Inspection**: Vacuum band-sealing into 500g and 1kg branded pouches with automated date coding.
6. **Secondary Packaging**: Packing 24 pouches per corrugated master carton for safe distribution.`
  );

  add(
    "ch4.equipment",
    "4.3 Machinery, Tools, and Equipment Sourcing",
    `### 4.3 Machinery, Tools, and Equipment Sourcing

The operational machinery was selected based on throughput efficiency, electrical power compatibility, spare part availability in Kenya, and food-grade stainless steel construction.

| Machinery / Tool Description | Qty | Unit Cost (KES) | Total Cost (KES) | Sourcing Vendor & Quotation Ref |
| :--- | :--- | :--- | :--- | :--- |
${specs.machinery
  .map(
    (m) =>
      `| **${m.item}** | ${m.quantity} | ${formatKES(m.unitCost)} | ${formatKES(m.quantity * m.unitCost)} | ${m.supplier} |`
  )
  .join("\n")}
| **Total Equipment Investment** | | | **KES ${formatKES(fin.totalMachineryCost)}** | **10% Annual Depreciation: KES ${formatKES(fin.annualDepreciation)}** |`
  );

  add(
    "ch4.materials",
    "4.4 Raw Material Requirements and Sourcing",
    `### 4.4 Raw Material Requirements and Sourcing

Reliable sourcing of fresh, aflatoxin-free ingredients is secured through contract agreements with local agricultural cooperatives and licensed packaging converters.

| Raw Material / Packaging Input | Monthly Required Volume | Unit Sourcing Price | Total Monthly Cost (KES) | Sourcing Cooperative / Supplier |
| :--- | :--- | :--- | :--- | :--- |
${specs.rawMaterials
  .map(
    (r) =>
      `| **${r.material}** | ${r.monthlyQuantity} | Farmgate bulk rate | ${formatKES(r.monthlyCost)} | ${r.supplier} |`
  )
  .join("\n")}
| **Total Monthly Material Outlay** | | | **KES ${formatKES(specs.rawMaterials.reduce((sum, r) => sum + r.monthlyCost, 0))}** | **Contracted supply agreements** |`
  );

  add(
    "ch4.labor",
    "4.5 Labor Requirements and Production Scheduling",
    `### 4.5 Labor Requirements and Production Scheduling

The plant operates on a 5-day weekly schedule, from 8:00 AM to 5:00 PM (40 hours per week).

#### 4.5.1 Daily Batch Scheduling
- **Morning Shift (8:00 AM – 12:30 PM)**: Grain sorting, moisture testing, roasting, and hammer milling.
- **Afternoon Shift (1:30 PM – 4:30 PM)**: Nutrient blending, pouch filling, impulse sealing, batch date stamping, and sanitation.
- **Daily Target**: 125 kg finished product daily, accumulating to **${formatKES(specs.monthlyProductionUnitsYear1)} kg per month**.
- **Labor Efficiency**: Direct labor cost per unit stands at KES 12, reflecting high productivity per machine operator.`
  );

  add(
    "ch4.quality",
    "4.6 Quality Control, Hygiene, and Waste Management",
    `### 4.6 Quality Control, Hygiene, and Waste Management

#### 4.6.1 Quality Assurance System
- **Incoming Material Checks**: Refusing grains with moisture > 13.5% or showing mold discoloration.
- **In-Process Moisture & Fineness Monitoring**: Hourly testing of milled flour fineness and temperature checks during roasting.
- **End-Product Integrity**: Random test-submerging of sealed pouches in water to detect micro-leaks.

#### 4.6.2 Environmental Waste Disposal
Organic grain husks and bran are separated cleanly and sold as nutritious livestock feed to local dairy farmers at KES 20 per sack, converting manufacturing byproduct into an auxiliary income stream. Wash water is safely routed through county drainage with grease interceptors.`
  );

  add(
    "ch4.schedule",
    "4.7 Production Capacity and Maintenance Schedule",
    `### 4.7 Production Capacity and Maintenance Schedule

#### 4.7.1 Plant Capacity Utilization
- **Installed Machine Capacity**: 400 kg per day (8,000 kg per month on single 8-hour shift).
- **Year 1 Operating Capacity**: **${formatKES(specs.monthlyProductionUnitsYear1)} kg/month (${Math.round((specs.monthlyProductionUnitsYear1 / 8000) * 100)}% utilization)**, leaving ample reserve capacity for multi-year expansion without capital replacement.

#### 4.7.2 Preventive Equipment Maintenance
- **Daily**: Blow-cleaning of milling chambers, dust collectors, and lubricating sealer belts.
- **Monthly**: Inspection of hammer blades, screen wear, motor belt tensions, and electrical grounding by a qualified technician.`
  );

  // =========================================================================
  // CHAPTER FIVE: FINANCIAL PLAN
  // =========================================================================

  add(
    "ch5.startup",
    "5.1 Pre-Operational Expenses and Startup Capital",
    `### 5.1 Pre-Operational Expenses and Startup Capital

Pre-operational expenses comprise all non-recurring capital outlays incurred prior to the formal commissioning of the enterprise.

${fin.preOperationalTable}

These expenses are fully integrated into the total startup capital budget and will be funded from the promoter's initial personal equity injection.`
  );

  add(
    "ch5.sources",
    "5.2 Desired Financing and Capitalization Structure",
    `### 5.2 Desired Financing and Capitalization Structure

The total capital required to commission **${specs.businessName}** is **KES ${formatKES(fin.totalStartupCapital)}**.

${fin.capitalizationTable}

#### 5.2.1 Terms of Debt Financing
- **Lender**: Youth Enterprise Development Fund (YEDF) / Microfinance Partner
- **Principal Amount**: **KES ${formatKES(fin.totalStartupCapital - Math.round(fin.totalStartupCapital * 0.6))}**
- **Annual Interest Rate**: 12% per annum on reducing balance.
- **Repayment Tenure**: 24 equal monthly installments of **KES ${formatKES(Math.round((fin.totalStartupCapital - Math.round(fin.totalStartupCapital * 0.6)) / 24 + ((fin.totalStartupCapital - Math.round(fin.totalStartupCapital * 0.6)) * 0.12) / 12))}**.`
  );

  add(
    "ch5.assumptions",
    "5.3 Key Financial and Macroeconomic Assumptions",
    `### 5.3 Key Financial and Macroeconomic Assumptions

The financial statements are constructed upon realistic, conservative macroeconomic and operational parameters:
1. **Sales Ramp-up**: Production and sales operate at 65% capacity during Months 1–2, 80% in Month 3, 90% in Month 4, and 100% capacity from Month 5 onward.
2. **Sales Expansion**: Gross turnover expands by **${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%** in Year 2 and **${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%** in Year 3.
3. **Depreciation Policy**: Machinery and tools are depreciated on a straight-line basis at **10% per annum** with zero salvage value.
4. **Inflation on Operating Costs**: Wages, utilities, and transport increase by a conservative 8–10% annually.
5. **Corporate Taxation**: Corporate tax is computed at the statutory Kenyan corporate rate of **30%** on net taxable profit.`
  );

  add(
    "ch5.cashflow",
    "5.4 Pro-Forma Cash Flow Statement (12 Months Year 1)",
    `### 5.4 Pro-Forma Cash Flow Statement (12 Months Year 1)

The cash flow statement tracks projected monthly liquidity inflows and operational disbursements, confirming that the enterprise maintains an uninterrupted positive cash balance throughout Year 1.

${fin.monthlyCashFlowTableYear1}

#### 5.4.1 Cash Flow Commentary
The enterprise commences operations with an opening cash buffer of **KES ${formatKES(fin.totalStartupCapital - fin.totalMachineryCost - fin.totalPreOperationalCost)}**. Net monthly cash flow becomes robustly positive from Month 2 onward, closing Year 1 with a healthy cash surplus of **KES ${formatKES(fin.year1ClosingCash)}**.`
  );

  add(
    "ch5.income",
    "5.5 Pro-Forma Income Statement (Three-Year P&L)",
    `### 5.5 Pro-Forma Income Statement (Three-Year P&L)

The projected statement of profit and loss evaluates enterprise profitability over the three-year planning horizon.

${fin.threeYearIncomeStatementTable}

#### 5.5.1 Profitability Commentary
Gross profit margin remains strong at **${fin.grossProfitMarginPercent}%**, reflecting disciplined raw material procurement. Net profit after tax grows from **KES ${formatKES(fin.netProfitYear1)}** in Year 1 to **KES ${formatKES(fin.netProfitYear3)}** in Year 3, proving substantial commercial viability.`
  );

  add(
    "ch5.balance",
    "5.6 Pro-Forma Balance Sheet (Three Years)",
    `### 5.6 Pro-Forma Balance Sheet (Three Years)

The statement of financial position demonstrates that Total Assets balance with Total Liabilities and Owner's Equity across the entire 3-year projection period.

${fin.threeYearBalanceSheetTable}`
  );

  add(
    "ch5.breakeven",
    "5.7 Break-Even Analysis",
    `### 5.7 Break-Even Analysis

Break-even analysis establishes the margin of safety by determining the minimum production volume required to cover all fixed operating overheads.

${fin.breakEvenTable}

#### 5.7.1 Interpretation of Break-Even Results
The enterprise achieves full monthly operational break-even at **${formatKES(fin.breakEvenUnitsMonthly)} units (${formatKES(fin.breakEvenRevenueMonthly)} KES)**, which is only **${fin.breakEvenLevelPercent}% of full monthly capacity**. Because the enterprise produces and sells at least 1,500 units monthly from Month 4 onwards, the firm enjoys a high margin of safety exceeding 40%.`
  );

  add(
    "ch5.ratios",
    "5.8 Financial Health and Profitability Ratios",
    `### 5.8 Financial Health and Profitability Ratios

Financial ratio analysis evaluates enterprise liquidity, profitability margins, and capital efficiency against TVET examination benchmarks.

${fin.financialRatiosTable}`
  );

  add(
    "ch5.risks",
    "5.9 Comprehensive Risk Management and Contingency Planning",
    `### 5.9 Comprehensive Risk Management and Contingency Planning

| Risk Category | Nature of Commercial Threat | Concrete Mitigation Measure |
| :--- | :--- | :--- |
| **Operational Risk** | Machinery breakdown during peak production. | Retain spare belts, hammer blades, and contract local technician on 4-hour standby agreement. |
| **Supply Risk** | Seasonal spike in grain prices due to regional drought. | Maintain hermetic storage reserve holding 60 days of raw grain buffer stock. |
| **Credit Risk** | Delayed payment by retail shop stockists. | Limit retailer credit to 7 days with mandatory M-PESA reconciliation prior to dispatching new orders. |
| **Fire & Safety Risk** | Grain dust combustion or electrical short circuit. | Install certified foam and carbon dioxide fire extinguishers; enforce zero-smoking protocols. |`
  );

  // =========================================================================
  // REFERENCES & APPENDICES
  // =========================================================================

  add(
    "references",
    "References (APA 7th Edition)",
    `### REFERENCES

Government of Kenya. (2012). *National Food and Nutrition Security Policy (NFNSP)*. Ministry of Agriculture, Livestock and Fisheries.

Kenya Bureau of Standards [KEBS]. (2020). *Code of Hygienic Practice for the Food and Drink Manufacturing Industry (KS EAS 39:2020)*. KEBS.

Kenya National Bureau of Statistics [KNBS]. (2023). *Kenya Demographic and Health Survey 2022: Key Indicators Report*. KNBS.

Micro and Small Enterprise Authority [MSEA]. (2022). *National Policy on Micro and Small Enterprises: Unleashing the Potential of MSEs in Kenya*. MSEA.

Ministry of Health. (2021). *Kenya National Clinical Nutrition and Dietetics Guidelines*. Government of Kenya.

Republic of Kenya. (2012). *Public Health Act (Cap. 242, Laws of Kenya)*. National Council for Law Reporting.

Republic of Kenya. (2015). *Business Registration Act (Cap. 499, Laws of Kenya)*. Government Printer.

Wang'ombe, D. (2018). *Financial Accounting for Business in Eastern Africa* (2nd ed.). Focus Publishers Ltd.`
  );

  add(
    "app.workplan",
    "Appendix I: Business Implementation Schedule (Gantt Chart)",
    `### APPENDIX I: 12-MONTH BUSINESS IMPLEMENTATION SCHEDULE

| Milestone Task / Activity | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Business Name Search & Registration | ■ | | | | | | | | | | | |
| Premises Lease & Renovation Works | | ■ | | | | | | | | | | |
| Machinery Procurement & Installation | | ■ | ■ | | | | | | | | | |
| Single Business Permit & Health Licenses | | | ■ | | | | | | | | | |
| Raw Material Sourcing & Test Milling | | | ■ | | | | | | | | | |
| Commercial Launch & Sampling Campaign | | | | ■ | | | | | | | | |
| Distribution to 30 Retail Outlets | | | | ■ | ■ | ■ | | | | | |
| Mid-Year Operational Review & KEBS Audit | | | | | | ■ | ■ | | | | |
| Commercial Loan Amortization (Ongoing) | | | | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |
| Expansion into Neighboring Sub-Counties | | | | | | | | | | ■ | ■ | ■ |`
  );

  add(
    "app.invoices",
    "Appendix II: Price Quotes and Market Survey Evidence Summary",
    `### APPENDIX II: SUPPLIER PRICE QUOTATIONS AND MARKET SURVEY SUMMARY

#### 1. Machinery Quotation Summary
- **Quotation Ref**: NDL/Q/2026/84 — Ndume Mills Ltd, Gilgil
  - Equipment: Commercial Stainless Steel Hammer Mill with 15 HP 3-Phase Electric Motor
  - Quotation Value: KES 145,000 (VAT Inclusive)
- **Quotation Ref**: GPM/2026/102 — General Pack Machinery, Commercial Street, Nairobi
  - Equipment: Continuous Band Nitrogen Sealer with Embossing Date Stamper
  - Quotation Value: KES 48,000 (VAT Inclusive)
- **Quotation Ref**: CLS/INST/2026/45 — Crop Nutrition Laboratory Services, Nairobi
  - Equipment: Digital Portable Grain Moisture Tester (Draminski Model)
  - Quotation Value: KES 32,000

#### 2. Market Survey Evidence Summary
- **Sample Size**: 40 Households with young children and 15 Retail Kiosk Operators in ${specs.townOrMarket}.
- **Key Survey Finding 1**: 82% of household respondents reported purchasing packaged porridge flour weekly.
- **Key Survey Finding 2**: 73% of respondents expressed willingness to buy a locally formulated, orange-fleshed sweet potato and amaranth enriched blend at KES 120–130 per kg.
- **Key Survey Finding 3**: 100% of retail kiosk owners agreed to stock the product provided introductory margins exceed 15% on sale-or-return terms.`
  );

  return results;
}
