/**
 * TVET Hub KNEC 25-30 Page Complete Business Plan Builder
 * Generates all 28 sections conforming strictly to the KNEC Entrepreneurship syllabus notes
 * and official template (Business_Plan_Template_KNEC.docx).
 */

import type { BusinessPlanSpecs } from "./businessPlanTypes";
import { normalizeBusinessPlanSpecs, resolveBusinessPlanModel } from "./businessPlanTypes";
import { computeBusinessPlanFinancials } from "./businessPlanMath";
import { getConsultancySectionContent } from "./businessPlanProfiles";
import { getWorkspaceSections } from "./templates";

export interface GeneratedSectionPayload {
  section_key: string;
  title: string;
  content: string;
  wordCount: number;
}

export function buildCompleteBusinessPlan(rawSpecs: Partial<BusinessPlanSpecs>): GeneratedSectionPayload[] {
  const specs = normalizeBusinessPlanSpecs(rawSpecs);
  const fin = computeBusinessPlanFinancials(specs);
  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");
  const resolvedModel = resolveBusinessPlanModel(specs);

  const isConsultancy = resolvedModel === "consultancy" || resolvedModel === "clinical";
  const isFoodService = resolvedModel === "food_service";
  const isAgribusiness = resolvedModel === "agribusiness";
  const isRetail = resolvedModel === "retail";
  const isEducation = resolvedModel === "education";
  const isBeverages = resolvedModel === "beverages";

  const productContext = `${specs.industrySector || ""} ${specs.primaryProduct || ""} ${specs.productDescription || ""}`.toLowerCase();
  const isGrainMilling =
    (resolvedModel === "milling" || resolvedModel === "manufacturing") &&
    /flour|porridge|mill|grain|cereal|weaning|blend|extruded/.test(productContext);

  const safeQualifications =
    specs.ownerQualifications?.trim() ||
    `Diploma in Human Nutrition and Dietetics (${specs.course || "KNEC"}), registered with the Kenya Nutritionists and Dietitians Institute (KNDI)`;
  const safeStreet =
    specs.streetOrBuilding?.trim() ||
    "Commercial Center Ground Floor Premises [Confirm exact plot/street locally]";
  const safeLocationRationale =
    specs.locationRationale?.trim() ||
    `Accessible commercial location within ${specs.townOrMarket}, ${specs.county} with reliable road access, municipal water, electricity, and proximity to target customers [Confirm site specifics locally].`;
  const safeProductDescription =
    specs.productDescription?.trim() ||
    `${specs.primaryProduct} formulated and delivered in ${specs.productPackaging || "standardized hygienic units"} to serve ${specs.targetCustomersDescription || "local households and institutional clients"}.`;
  const safeCompetitors =
    specs.competitors && specs.competitors.length > 0
      ? specs.competitors
      : [
          {
            name: "Established Commercial Providers / Brands [Confirm locally]",
            location: `${specs.townOrMarket} Commercial Center`,
            priceLevel: `KES ${formatKES(Math.round(specs.unitSellingPrice * 1.2))} per unit [Confirm locally]`,
            strengths: "Established market visibility and existing distribution networks",
            weaknesses: "Higher pricing and less personalized nutrition formulation or client support",
          },
          {
            name: "Informal Uncertified Local Vendors [Confirm locally]",
            location: `${specs.townOrMarket} Open-Air / Estate Outlets`,
            priceLevel: `KES ${formatKES(Math.round(specs.unitSellingPrice * 0.8))} per unit [Confirm locally]`,
            strengths: "Low price point and convenient neighborhood proximity",
            weaknesses: "Inconsistent hygiene, unstandardized portions/formulations, and lack of nutritionist oversight",
          },
        ];

  const unitWord = isConsultancy
    ? "consultation sessions"
    : isEducation
      ? "training packages"
      : isFoodService
        ? "meal packages"
        : isRetail
          ? "retail baskets/units"
          : "units";

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

Candidate Name: **${specs.candidateName || "[Enter candidate name]"}**<br>Index Number: **${specs.admissionNumber || "[Enter index number]"}**<br>Institution: **${specs.institutionName || "[Enter institution name]"}**<br>Signature: ______________________________<br>Date: ______________________________

---

### APPROVAL BY SUPERVISOR
I have reviewed this business plan and recommend it for examination.

Supervisor Name: **${specs.supervisorName || "[Enter supervisor name]"}**<br>Designation: **Project Supervisor**<br>Institution: **${specs.institutionName || "[Enter institution name]"}**<br>Signature: ______________________________<br>Date: ______________________________`
  );

  add(
    "prelim.dedication",
    "Dedication",
    `### DEDICATION
This business plan is dedicated to the people whose encouragement, guidance, and practical support contributed to the candidate's education and enterprise development.

The candidate may personalize this dedication to recognize family members, mentors, colleagues, or community members who provided meaningful support.`
  );

  add(
    "prelim.acknowledgements",
    "Acknowledgements",
    `### ACKNOWLEDGEMENTS
I express sincere gratitude to my project supervisor, **${specs.supervisorName || "[Supervisor name]"}**, for the academic guidance, constructive feedback, and technical mentorship provided throughout the preparation of this business plan for **${specs.businessName}**.

I also thank the administration and teaching faculty of **${specs.institutionName || "[Institution name]"}** for imparting practical competencies during my **${specs.course}** training. Finally, I appreciate the local nutrition practitioners, suppliers, and prospective customers in **${specs.townOrMarket}, ${specs.county}** who shared market and operational insights during the preliminary planning phase.`
  );

  add(
    "prelim.executive_summary",
    "Executive Summary / Synopsis",
    `### EXECUTIVE SUMMARY / SYNOPSIS

**${specs.businessName}** is a proposed nutrition enterprise in the **${specs.industrySector}** sector, situated in **${specs.townOrMarket}, ${specs.county}**. The enterprise will operate as a **${specs.formOfOwnership}** founded by **${specs.candidateName || "the promoter"}**, a trained professional holding a **${safeQualifications}**. The firm's mission is to deliver accessible, evidence-based nutritional products and services that address local dietary and health needs while establishing a viable, compliant commercial entity.

The flagship offering is **${specs.primaryProduct}**, delivered in **${specs.productPackaging}** and priced at **KES ${formatKES(specs.unitSellingPrice)}** per unit against an estimated direct cost of **KES ${formatKES(specs.unitCostOfProduction)}**. In ${specs.townOrMarket}, the target market catchment encompasses approximately **${specs.totalMarketPopulation || "[Confirm target catchment population locally]"}**. Market assessment indicates a gap between high-cost commercial alternatives and informal uncertified options that lack qualified nutritionist oversight. The enterprise targets a **${specs.projectedMarketSharePercentage || 5}%** share of the addressable local segment in Year 1.

The venture requires estimated start-up capital of **KES ${formatKES(fin.totalStartupCapital)}**, comprising **KES ${formatKES(fin.totalMachineryCost)}** for equipment and assets, **KES ${formatKES(fin.totalPreOperationalCost)}** for pre-operational setup costs, and **KES ${formatKES(specs.workingCapitalBuffer || 75000)}** for working capital. Candidate-entered funding assumptions are **KES ${formatKES(fin.ownerEquityAmount)}** in owner's equity and **KES ${formatKES(fin.loanAmount)}** in proposed borrowing${fin.loanAmount > 0 ? `, at an assumed annual interest rate of ${Number(specs.loanInterestRateAnnual || 0).toFixed(1)}% over ${Math.max(1, Math.floor(specs.loanTenureMonths || 24))} months` : " (100% equity-financed with zero external debt)"}. ${fin.fundingGap ? `This leaves a projected funding gap of **KES ${formatKES(fin.fundingGap)}**.` : fin.fundingSurplus ? `This leaves **KES ${formatKES(fin.fundingSurplus)}** in unallocated proposed funding.` : "The proposed funding matches the estimated startup requirement."} Any lender and loan terms require confirmation before implementation.

Financial forecasts project first-year gross sales of **KES ${formatKES(fin.annualSalesYear1)}**, gross profit of **KES ${formatKES(fin.annualGrossProfitYear1)}** (**${fin.grossProfitMarginPercent}% gross margin**), and net profit after tax of **KES ${formatKES(fin.netProfitYear1)}** (**${fin.netProfitMarginPercentYear1}% net margin**). Net profit after tax is projected at **KES ${formatKES(fin.netProfitYear2)}** in Year 2 and **KES ${formatKES(fin.netProfitYear3)}** in Year 3, subject to the stated volume, pricing, cost, tax, and financing assumptions. ${fin.breakEvenAchievable ? `Monthly break-even is estimated at **${formatKES(fin.breakEvenUnitsMonthly)} ${unitWord}** (**${fin.breakEvenLevelPercent}%** of planned capacity).` : "Break-even cannot be calculated because the unit contribution margin is not positive."} The projected Year 1 return on investment (ROI) is **${fin.returnOnInvestmentYear1}%** and return on equity (ROE) is **${fin.returnOnEquityYear1}%**.`
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
The business name was formulated to communicate professional nutrition credibility, hygiene, and practical community wellness. The brand visual identity incorporates vibrant green and warm gold accents:
- **Green Vitality Motif**: Represents wholesome nutrition, natural health, freshness, and evidence-based preventive care.
- **Warm Gold Accent**: Signifies quality assurance, nourishment, and socioeconomic value for households and institutions in ${specs.county}.
- **Typography**: Clean, legible sans-serif lettering on labels, signage, and client educational materials to instill trust among consumers, healthcare practitioners, and regulatory inspectors.

#### 1.1.2 Nature of Business and Economic Sector
The enterprise operates within the **${specs.industrySector}** sector. ${
      isFoodService
        ? `It bridges clinical dietetics and culinary hospitality by preparing, portioning, and delivering freshly cooked, nutrient-calibrated meals and refreshments tailored to consumer health goals.`
        : isAgribusiness
          ? `It links nutrition-sensitive agriculture with household food security by producing, aggregating, grading, and preserving micronutrient-rich farm produce for local consumers and institutional buyers.`
          : isRetail
            ? `It operates as a specialized nutrition retail and distribution hub, curating verified therapeutic foods, allergen-free groceries, and certified nutritional supplies supported by professional dietetic guidance.`
            : isEducation
              ? `It operates as a practical nutrition education, culinary demonstration, and community capacity-building enterprise serving households, caregivers, schools, and local institutions.`
              : `It bridges agricultural value addition and public health nutrition by transforming quality raw ingredients through hygienic processing, standardized formulation, and protective packaging into nutrient-dense consumer products.`
    }`
  );

  add(
    "ch1.location",
    "1.2 Business Location and Physical Infrastructure",
    `### 1.2 Business Location and Physical Infrastructure

#### 1.2.1 Physical Site and Address
The proposed business will establish its physical operating premises at:
- **Physical Address**: ${safeStreet}, ${specs.townOrMarket}, ${specs.county}
- **Postal Address**: P.O. Box ${specs.postalAddress || "100-00100"}, ${specs.townOrMarket}, Kenya
- **Electronic Contacts**: Telephone: ${specs.phone || "+254 700 000 000"} | Email: ${specs.email || "info@business.co.ke"}

#### 1.2.2 Rationale for Site Selection
The selection of **${specs.townOrMarket}** in **${specs.county}** is supported by the following operational and market factors (subject to local lease and site verification):
1. **Accessibility to Target Customers**: ${safeLocationRationale}
2. **Proximity to Inputs and Supply Chains**: The location provides convenient road connectivity to ${
      isRetail
        ? "wholesale distributors, certified health-food suppliers, and courier services"
        : isEducation
          ? "schools, community venues, fresh food markets for demonstrations, and printing services"
          : "local agricultural producers, verified ingredient suppliers, and packaging vendors"
    } across ${specs.county}.
3. **Availability of Critical Utilities**: The site is served by potable water supply, reliable electrical power from Kenya Power (KPLC), telecommunications connectivity, and county sanitation services.
4. **Security and Zoning Compliance**: Situated within an active commercial area of ${specs.townOrMarket} with security lighting, premises access control, and suitability for county public health inspection.`
  );

  add(
    "ch1.ownership",
    "1.3 Form of Business Ownership and Promoter Profile",
    `### 1.3 Form of Business Ownership and Promoter Profile

#### 1.3.1 Form of Ownership
The enterprise will be registered as a **${specs.formOfOwnership}** pursuant to the **${specs.registrationType || "Business Names Registration Act (Cap 499, Laws of Kenya)"}**. This legal structure is selected because:
- **Ease of Formation**: Streamlined registration with the Business Registration Service (BRS) on the eCitizen platform with modest initial statutory fees.
- **Direct Operational Accountability**: The proprietor retains direct oversight of quality standards, client service, hygiene protocols, and financial control.
- **Flexibility**: Decisions on product/service adjustments, supplier selection, and customer terms can be executed promptly during the initial growth stage.
- **Future Scalability**: The enterprise may later transition into a Private Limited Company once revenue, staffing, and institutional contracts expand.

#### 1.3.2 Owner / Promoter Background
The enterprise is founded and directed by **${specs.candidateName || "the candidate"}**, who holds the following qualifications: **${safeQualifications}**.

The promoter's training in Human Nutrition and Dietetics provides practical grounding in nutrient analysis, food safety and hygiene standards, dietary management of non-communicable diseases, maternal and child nutrition, and entrepreneurship. Any professional registration or practising licence required for the specific activity will be verified and kept current prior to commercial launch.`
  );

  add(
    "ch1.nature",
    "1.4 Industry Sector Dynamics and Justification",
    `### 1.4 Industry Sector Dynamics and Opportunity Justification

#### 1.4.1 National and County Sector Overview
The enterprise operates within Kenya's expanding nutrition, food systems, and preventive health sector. Reports from the Kenya National Bureau of Statistics (KNBS) and the Ministry of Health highlight the dual burden of malnutrition across Kenyan counties: persistent micronutrient deficiencies and childhood stunting alongside a rising prevalence of diet-related non-communicable diseases (diabetes, hypertension, cardiovascular conditions, and obesity) in urban and peri-urban areas.

National frameworks—including **Kenya Vision 2030**, the **National Food and Nutrition Security Policy**, and the **Kenya National Nutrition Action Plan (KNNAP)**—emphasize preventive dietary interventions, value addition to nutrient-dense foods, and food safety compliance.

#### 1.4.2 Commercial Viability and Market Opportunity
The proposed venture is justified by four practical market factors in **${specs.townOrMarket}, ${specs.county}**:
1. **Unmet Need for Nutritionist-Led Offerings**: Target customers (${specs.targetCustomersDescription}) increasingly seek products and services formulated or guided by qualified nutrition professionals rather than unverified general vendors.
2. **Quality and Hygiene Assurance**: Many informal alternatives in ${specs.townOrMarket} lack standardized portioning, nutrient labeling, or hygienic handling, whereas imported or premium corporate alternatives are priced beyond everyday household budgets.
3. **Viable Unit Economics**: At a selling price of **KES ${formatKES(specs.unitSellingPrice)}** and direct unit cost of **KES ${formatKES(specs.unitCostOfProduction)}**, each unit generates a positive contribution margin of **KES ${formatKES(fin.contributionMarginPerUnit)}** to cover fixed operating costs.
4. **Local Socio-Economic Linkages**: The business supports local suppliers, creates skilled employment for ${specs.staffing.reduce((sum, s) => sum + s.count, 0)} staff members, and promotes healthier household dietary practices.`
  );

  add(
    "ch1.products",
    "1.5 Products and Services Specifications",
    `### 1.5 Products and Services Specifications

The enterprise will deliver standardized nutritional offerings under the brand **${specs.businessName}**.

#### 1.5.1 Flagship Offering Description
- **Core Offering**: **${specs.primaryProduct}**
- **Detailed Specifications**: ${safeProductDescription}
- **Packaging / Delivery Format**: ${specs.productPackaging}
- **Unit Selling Price**: **KES ${formatKES(specs.unitSellingPrice)}** per unit.
- **Estimated Direct Cost per Unit**: **KES ${formatKES(specs.unitCostOfProduction)}** per unit.

#### 1.5.2 Unique Selling Propositions (USPs)
1. **Professional Nutrition Formulation**: Designed and supervised by a trained nutritionist adhering to Kenya Ministry of Health dietary guidelines and Kenya Food Composition Tables.
2. **Hygienic Presentation & Labeling**: Delivered in **${specs.productPackaging}** with clear ingredient disclosure, nutritional guidance, and usage instructions.
3. **Competitive Local Pricing**: Priced at **KES ${formatKES(specs.unitSellingPrice)}** to remain accessible to target households and institutions in ${specs.townOrMarket} while sustaining a **${fin.grossProfitMarginPercent}%** gross margin.
4. **Customer Guidance & After-Sales Support**: Buyers receive practical dietary usage tips and responsive local customer support.`
  );

  add(
    "ch1.mission",
    "1.6 Vision, Mission, and Core Corporate Values",
    `### 1.6 Vision, Mission, and Core Corporate Values

#### 1.6.1 Vision Statement
*"To be a trusted, innovative, and accessible provider of quality nutritional products and dietetic solutions in ${specs.county} and the wider region."*

#### 1.6.2 Mission Statement
*"To formulate, prepare, and deliver safe, affordable, and evidence-based offerings (${specs.primaryProduct}) that improve household and institutional nutrition across ${specs.townOrMarket} while operating sustainably and ethically."*

#### 1.6.3 Core Corporate Values
The daily operations and customer relationships of **${specs.businessName}** are guided by five core values:
1. **Nutritional Quality & Hygiene**: Strict adherence to food safety, public health sanitation, and professional dietetic standards.
2. **Affordability & Access**: Disciplined cost management so quality nutrition remains within reach of local families and institutions.
3. **Customer Respect & Integrity**: Honest product descriptions, transparent pricing, and zero misleading health claims.
4. **Community Partnership**: Ethical sourcing from local producers and active collaboration with community health stakeholders.
5. **Continuous Improvement**: Regular review of customer feedback, quality records, and nutrition science updates.`
  );

  add(
    "ch1.goals",
    "1.7 Business Goals and SMART Objectives",
    `### 1.7 Business Goals and SMART Objectives

The strategic plan for **${specs.businessName}** is structured into measurable short-term (Year 1) and medium-term (Years 2–3) objectives.

#### 1.7.1 Short-Term Objectives (Year 1)
1. **Compliant Commissioning**: Complete premises setup, equipment installation, supplier verification, and required county/regulatory clearances within the first 60 days.
2. **Sales Volume Target**: Ramp up operations from 65% capacity in Month 1 to full planned capacity of **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord} per month** by Month 5, achieving Year 1 gross revenue of **KES ${formatKES(fin.annualSalesYear1)}**.
3. **Customer & Channel Acquisition**: Establish a dependable customer base and distribution network across ${specs.townOrMarket} to capture the projected **${specs.projectedMarketSharePercentage || 5}%** target market share.
4. **Financial Discipline**: Reach monthly break-even at **${formatKES(fin.breakEvenUnitsMonthly)} ${unitWord}** (**${fin.breakEvenLevelPercent}%** capacity utilization) and maintain positive monthly cash flow.
5. **Quality Assurance**: Maintain zero public health non-conformities and achieve high repeat customer retention through consistent quality.

#### 1.7.2 Medium-Term Objectives (Years 2 - 3)
1. **Revenue & Volume Growth**: Expand annual output and revenue by **${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%** in Year 2 (**KES ${formatKES(fin.annualSalesYear2)}**) and **${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%** in Year 3 (**KES ${formatKES(fin.annualSalesYear3)}**).
2. **Offering Diversification**: Introduce complementary product/service sizes and institutional packages informed by Year 1 customer demand.
3. **Balance Sheet Strengthening**: ${fin.loanAmount > 0 ? `Fully service all scheduled loan repayments over ${specs.loanTenureMonths || 24} months` : "Maintain a debt-free balance sheet"} while building retained earnings to finance capacity upgrades.`
  );

  add(
    "ch1.justification",
    "1.8 Justification and Commercial Viability",
    `### 1.8 Justification and Commercial Viability

The establishment of **${specs.businessName}** in **${specs.townOrMarket}, ${specs.county}** is supported by nutritional, economic, and operational considerations:

#### 1.8.1 Public Health and Nutritional Relevance
Households and institutions in ${specs.townOrMarket} face growing demand for practical, nutrient-dense dietary options to address both micronutrient gaps and lifestyle-related health conditions. Providing **${specs.primaryProduct}** under qualified nutritionist supervision directly supports healthier consumption habits in the community.

#### 1.8.2 Commercial and Financial Viability
Based on candidate-supplied pricing (**KES ${formatKES(specs.unitSellingPrice)}**) and unit variable cost (**KES ${formatKES(specs.unitCostOfProduction)}**), the enterprise achieves a gross profit margin of **${fin.grossProfitMarginPercent}%** and a projected Year 1 net profit after tax of **KES ${formatKES(fin.netProfitYear1)}**. With a break-even threshold of **${formatKES(fin.breakEvenUnitsMonthly)} ${unitWord} per month** (${fin.breakEvenLevelPercent}% of planned capacity), the business retains a comfortable margin of safety once full operating capacity is reached.

#### 1.8.3 Local Economic Contribution
The enterprise sources inputs from local suppliers (${specs.rawMaterials.map((r) => r.supplier).filter(Boolean).slice(0, 2).join(", ") || "local vendors"}),remits county permit fees and national taxes, and provides structured employment for **${specs.staffing.reduce((sum, s) => sum + s.count, 0)} staff members**.`
  );

  add(
    "ch1.entry",
    "1.9 Market Entry and Growth Strategies",
    `### 1.9 Market Entry and Growth Strategies

#### 1.9.1 Market Entry Strategy
To enter the **${specs.townOrMarket}** market effectively and build early customer trust, **${specs.businessName}** will implement three practical entry actions:
1. **Product/Service Demonstrations & Nutrition Awareness**: Conduct targeted sampling, educational demonstrations, and introductory sessions for target customers (${specs.targetCustomersDescription}).
2. **Introductory Trade & Institutional Outreach**: Approach local clinics, schools, gyms, wellness groups, and retail stockists in ${specs.townOrMarket} with clear product/service fact sheets and introductory order terms.
3. **Transparent Labeling & Responsive Delivery**: Build word-of-mouth referrals through consistent product quality, clear nutritional information, and convenient M-PESA ordering and local delivery.

#### 1.9.2 Growth Strategy
- **Customer Retention**: Use WhatsApp follow-up lists, subscription/repeat order packages, and seasonal promotions to increase repeat purchases.
- **Institutional Contracts**: Bid for supply or service agreements with local schools, hospitals, corporate offices, and community organizations across ${specs.county}.
- **Capacity Optimization**: Reinvest retained earnings in Year 2 and Year 3 to expand production/service capacity and reach adjacent towns.`
  );

  add(
    "ch1.swot",
    "1.10 Comprehensive SWOT Analysis and Mitigation Matrix",
    `### 1.10 Comprehensive SWOT Analysis and Mitigation Matrix

A structured evaluation of internal capabilities and external market conditions for **${specs.businessName}** is presented below:

| Category | Enterprise Attributes | Strategic Mitigation / Exploitation Action |
| :--- | :--- | :--- |
| **STRENGTHS** | - Qualified promoter with nutrition and dietetics training.<br>- Offering (**${specs.primaryProduct}**) tailored to local dietary needs.<br>- Lean operating structure with controlled fixed overheads.<br>- Direct quality control and personalized customer guidance. | Leverage professional nutrition credentials in customer education and maintain strict quality consistency. |
| **WEAKNESSES** | - New brand entering the ${specs.townOrMarket} market.<br>- Limited initial promotional budget (**KES ${formatKES(specs.marketingPromotionBudgetMonthly)}/month**).<br>- Initial reliance on manual or semi-automated workflows. | Focus marketing on high-conversion community demonstrations, digital catalogs, and institutional referrals. |
| **OPPORTUNITIES** | - Rising public awareness of preventive nutrition and healthy diets.<br>- Growing demand from schools, clinics, and working households in ${specs.county}.<br>- Digital mobile-money (M-PESA) and local rider delivery adoption. | Develop tailored packages for repeat household and institutional buyers and streamline mobile ordering. |
| **THREATS** | - Price competition from informal uncertified vendors or large brands.<br>- Fluctuations in input, utility, and transport costs.<br>- Regulatory inspection delays or changing county fees. | Lock in reliable supplier arrangements, maintain a working capital buffer (**KES ${formatKES(specs.workingCapitalBuffer || 75000)}**), and initiate licensing early. |`
  );

  // =========================================================================
  // CHAPTER TWO: MARKETING PLAN
  // =========================================================================

  add(
    "ch2.customers",
    "2.1 Target Customers and Market Segmentation",
    `### 2.1 Target Customers and Market Segmentation

#### 2.1.1 Target Customer Segments
The primary customer base for **${specs.businessName}** in **${specs.townOrMarket}, ${specs.county}** comprises **${specs.targetCustomersDescription}**. For marketing and operational planning, customers are grouped into three segments:
1. **Primary Household & Individual Buyers**: Residents in ${specs.townOrMarket} seeking reliable, hygienically prepared, and nutritionally balanced **${specs.primaryProduct}** for regular household or personal wellness use.
2. **Health-Conscious & Special-Diet Consumers**: Clients referred or motivated by specific nutritional needs (such as maternal/child growth, metabolic wellness, recovery, or allergen-safe diets) who value nutritionist-verified products and guidance.
3. **Institutional & Trade Buyers**: Local retail outlets, clinics, schools, offices, or community organizations in ${specs.county} procuring in bulk or under recurring supply arrangements.

#### 2.1.2 Customer Purchasing Criteria
Prospective customers evaluate **${specs.primaryProduct}** primarily on:
1. **Nutritional Credibility & Safety**: Assurance of hygienic preparation, clean ingredients, and accurate nutrition labeling.
2. **Affordability & Value**: Fair pricing (**KES ${formatKES(specs.unitSellingPrice)}**) relative to portion size, quality, and competing alternatives.
3. **Convenience & Availability**: Consistent stock availability, practical packaging (**${specs.productPackaging}**), and timely local delivery.`
  );

  const monthlyMarketVolume = Math.max(
    specs.monthlyProductionUnitsYear1 * 10,
    Math.round(specs.monthlyProductionUnitsYear1 / Math.max(0.01, (specs.projectedMarketSharePercentage || 5) / 100))
  );
  const shareTarget = specs.projectedMarketSharePercentage || 5;
  const shareNational = Math.round((100 - shareTarget) * 0.45);
  const shareInformal = Math.round((100 - shareTarget) * 0.40);
  const shareOther = Math.max(1, 100 - shareTarget - shareNational - shareInformal);

  add(
    "ch2.demand",
    "2.2 Market Share and Projected Total Demand",
    `### 2.2 Market Share and Projected Total Demand

#### 2.2.1 Addressable Market Catchment
Within **${specs.townOrMarket}, ${specs.county}**, the target catchment is estimated at **${specs.totalMarketPopulation || "the local town and sub-county population"}** (planning estimate; verify against current KNBS census or county statistical abstracts). Based on the planned Year 1 monthly output of **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}** representing an estimated **${shareTarget}%** share of the active local segment, total monthly demand in the catchment is estimated at approximately **${formatKES(monthlyMarketVolume)} ${unitWord}**.

#### 2.2.2 Estimated Market Share Distribution
The indicative local market share distribution across competing categories is summarized below:

| Market Category | Estimated Monthly Volume (${unitWord}) | Estimated Market Share (%) |
| :--- | ---: | ---: |
| **Established Commercial / Regional Providers** | ${formatKES(Math.round((monthlyMarketVolume * shareNational) / 100))} | ${shareNational}% |
| **Informal / Uncertified Local Alternatives** | ${formatKES(Math.round((monthlyMarketVolume * shareInformal) / 100))} | ${shareInformal}% |
| **Other Small Local Enterprises** | ${formatKES(Math.round((monthlyMarketVolume * shareOther) / 100))} | ${shareOther}% |
| **${specs.businessName} (Year 1 Target)** | **${formatKES(specs.monthlyProductionUnitsYear1)}** | **${shareTarget}%** |
| **Total Addressable Segment Volume** | **${formatKES(monthlyMarketVolume)}** | **100%** |

These figures are planning projections derived from candidate assumptions and should be validated through a dated local customer and retailer survey prior to launch.`
  );

  add(
    "ch2.competitors",
    "2.3 Competitor Analysis and Competitive Advantage",
    `### 2.3 Competitor Analysis and Competitive Advantage

The table below compares **${specs.businessName}** against key competitor categories operating in or serving **${specs.townOrMarket}, ${specs.county}** (confirm specific local business names and current price lists during field verification):

| Competitor / Category | Location | Price Level | Key Strengths | Key Weaknesses |
| :--- | :--- | :--- | :--- | :--- |
${safeCompetitors
  .map(
    (c) =>
      `| **${c.name}** | ${c.location} | ${c.priceLevel} | ${c.strengths} | ${c.weaknesses} |`
  )
  .join("\n")}
| **${specs.businessName}** | ${safeStreet}, ${specs.townOrMarket} | KES ${formatKES(specs.unitSellingPrice)} | Formulated/supervised by a trained nutritionist; standardized ${specs.productPackaging}; responsive local service. | New market entrant building initial brand awareness. |

#### 2.3.1 Competitive Advantage
Unlike general vendors without formal nutrition training or distant national brands with high distribution markups, **${specs.businessName}** combines technical dietetic competence, transparent quality control, and direct local customer engagement in ${specs.townOrMarket}.`
  );

  add(
    "ch2.pricing",
    "2.4 Pricing Strategy and Cost Structure",
    `### 2.4 Pricing Strategy and Cost Structure

The enterprise applies a **Cost-Plus and Competitor-Benchmarked Pricing Strategy**. This ensures that every unit sold covers its direct variable cost (**KES ${formatKES(specs.unitCostOfProduction)}**) and contributes **KES ${formatKES(fin.contributionMarginPerUnit)}** toward monthly fixed overheads and net profit.

#### 2.4.1 Unit Economics Breakdown (${specs.primaryProduct})
- **Primary Inputs / Materials (${Math.round(specs.unitCostOfProduction * 0.75) > 0 ? "75%" : "Direct"})**: KES ${formatKES(Math.round(specs.unitCostOfProduction * 0.75))}
- **Packaging / Presentation & Consumables (15%)**: KES ${formatKES(Math.round(specs.unitCostOfProduction * 0.15))}
- **Direct Utility / Handling Allowance (10%)**: KES ${formatKES(specs.unitCostOfProduction - Math.round(specs.unitCostOfProduction * 0.75) - Math.round(specs.unitCostOfProduction * 0.15))}
- **Total Unit Variable Cost**: **KES ${formatKES(specs.unitCostOfProduction)}**
- **Standard Selling Price**: **KES ${formatKES(specs.unitSellingPrice)}**
- **Unit Contribution Margin**: **KES ${formatKES(fin.contributionMarginPerUnit)} (${fin.grossProfitMarginPercent}% Gross Margin)**

#### 2.4.2 Payment and Credit Policy
- **Direct Walk-In & Individual Orders**: 100% cash or M-PESA Till/Paybill payment upon order fulfillment.
- **Verified Institutional & Trade Accounts**: Up to 7–14 days credit only after a written supply agreement and at least three consecutive on-time cash transactions.
- **Volume Discounts**: A 5% trade discount on bulk institutional or wholesale orders exceeding 50 units paid upfront.`
  );

  add(
    "ch2.promotion",
    "2.5 Advertising and Sales Promotion Strategy",
    `### 2.5 Advertising and Sales Promotion Strategy

To build brand visibility, nutrition credibility, and customer trust across **${specs.townOrMarket}, ${specs.county}**, the enterprise allocates a disciplined monthly marketing budget of **KES ${formatKES(specs.marketingPromotionBudgetMonthly)}**.

#### 2.5.1 Promotional Channels and Activities
1. **Community Nutrition Talks & Sampling**: Monthly educational sessions and product/service demonstrations for local women groups (chamas), workplace teams, clinics, and community gatherings to demonstrate the practical value of **${specs.primaryProduct}**.
2. **Digital & WhatsApp Business Catalog**: A structured WhatsApp Business profile, Google Business listing, and social media page sharing evidence-based nutrition tips, clear pricing (**KES ${formatKES(specs.unitSellingPrice)}**), and direct M-PESA ordering links.
3. **Point-of-Sale & Partner Information Leaflets**: Printed brochures, posters, and nutrition fact sheets placed at partner shops, pharmacies, fitness centers, and community noticeboards in ${specs.townOrMarket}.
4. **Customer Referral & Loyalty Incentives**: Encouraging repeat household purchases and institutional word-of-mouth referrals through bundle packages, introductory trial offers, and attentive customer follow-up.

#### 2.5.2 Promotional Performance Tracking
Marketing expenditure will be reviewed monthly against customer inquiries, conversion rates, repeat order frequency, and actual sales volume relative to the **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}/month** target.`
  );

  add(
    "ch2.distribution",
    "2.6 Distribution Strategy and Logistics",
    `### 2.6 Distribution Strategy and Logistics

The enterprise utilizes a multi-channel distribution model tailored to customers in **${specs.townOrMarket}** and surrounding areas of **${specs.county}**:

\`\`\`channels
${specs.businessName} (${specs.townOrMarket})
50% Direct-to-Consumer Sales (Premises Walk-In & WhatsApp Orders)
30% Local Retail Stockists, Pharmacies & Partner Outlets
20% Institutional Accounts (Schools, Clinics, Workplaces & Groups)
\`\`\`
- **Direct Fulfillment**: Customers can purchase or book directly at **${safeStreet}** or place orders via phone/M-PESA for scheduled local rider dispatch.
- **Trade & Institutional Delivery**: Scheduled weekly deliveries to partner outlets and institutional buyers using a dedicated monthly transport and logistics budget of **KES ${formatKES(specs.monthlyOverheads.transport)}**.
- **Storage & Handling Hygiene**: All finished items and inputs are stored and transported in clean, temperature-appropriate, and pest-protected containers to preserve quality up to the point of customer handover.`
  );

  add(
    "ch2.forecast",
    "2.7 Sales Forecast and Revenue Projections",
    `### 2.7 Sales Forecast and Revenue Projections

Sales projections incorporate a conservative Year 1 operational ramp-up (65% in Months 1–2, 80% in Month 3, 90% in Month 4, and 100% of the planned **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}/month** from Month 5 to Month 12), followed by annual volume growth of **${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%** in Year 2 and **${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%** in Year 3.

| Performance Metric | Year 1 | Year 2 (+${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%) | Year 3 (+${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%) |
| :--- | ---: | ---: | ---: |
| **Planned Annual Volume (${unitWord})** | ${formatKES(Math.round(fin.annualSalesYear1 / Math.max(1, specs.unitSellingPrice)))} | ${formatKES(Math.round(fin.annualSalesYear2 / Math.max(1, specs.unitSellingPrice)))} | ${formatKES(Math.round(fin.annualSalesYear3 / Math.max(1, specs.unitSellingPrice)))} |
| **Unit Selling Price (KES)** | KES ${formatKES(specs.unitSellingPrice)} | KES ${formatKES(specs.unitSellingPrice)} | KES ${formatKES(specs.unitSellingPrice)} |
| **Gross Annual Revenue (KES)** | **KES ${formatKES(fin.annualSalesYear1)}** | **KES ${formatKES(fin.annualSalesYear2)}** | **KES ${formatKES(fin.annualSalesYear3)}** |
| **Direct Variable Cost / COGS (KES)** | KES ${formatKES(fin.annualCogsYear1)} | KES ${formatKES(fin.annualCogsYear2)} | KES ${formatKES(fin.annualCogsYear3)} |
| **Projected Gross Profit (KES)** | **KES ${formatKES(fin.annualGrossProfitYear1)}** | **KES ${formatKES(fin.annualGrossProfitYear2)}** | **KES ${formatKES(fin.annualGrossProfitYear3)}** |`
  );

  // =========================================================================
  // CHAPTER THREE: ORGANIZATION & MANAGEMENT
  // =========================================================================

  const leadRole = specs.staffing[0]?.position || "Managing Director / Lead Nutritionist";
  const secondRole = specs.staffing[1]?.position || "Operations & Quality Assistant";
  const thirdRole = specs.staffing[2]?.position || "Sales, Dispatch & Customer Support";
  const avgDailyUnits = Math.max(1, Math.round((specs.monthlyProductionUnitsYear1 / 24) * 10) / 10);

  add(
    "ch3.structure",
    "3.1 Organizational Structure / Organogram",
    `### 3.1 Organizational Structure / Organogram

**${specs.businessName}** adopts a lean, accountable organizational structure designed to maintain direct professional supervision over nutritional quality, customer service, and cash flow while controlling monthly payroll overheads in **${specs.townOrMarket}**.

\`\`\`org
${leadRole}
Operations & Quality Execution — ${secondRole}
Customer Service, Records & Logistics — ${thirdRole}
\`\`\`
- **Chain of Command**: The **${leadRole}** exercises overall executive, technical, financial, and regulatory authority. Operational, support, and delivery personnel report directly to the founder with clearly defined daily duties, shift schedules, and hygiene/quality accountability.
- **Coordination & Internal Controls**: Daily morning briefings align daily targets (${avgDailyUnits} ${unitWord}/day), while separation of order preparation from cash/M-PESA reconciliation ensures transparent internal control.`
  );

  add(
    "ch3.management",
    "3.2 Management Team Background and Competencies",
    `### 3.2 Management Team Background and Competencies

The enterprise is managed by **${specs.candidateName || "the candidate"}**, who serves as **${leadRole}**.

#### 3.2.1 Qualifications and Technical Competencies
- **Academic & Professional Credentials**: ${safeQualifications}
- **Core Technical Competencies**: Nutritional formulation and assessment, food safety and hygiene management (GMP/HACCP), customer nutrition education, supplier quality verification, and enterprise bookkeeping.

#### 3.2.2 Key Management Responsibilities
1. Supervising daily operational workflows, quality checks, and adherence to standard operating procedures (SOPs).
2. Managing statutory compliance with the County Government of ${specs.county}, Public Health, KNDI/KEBS (as applicable), and KRA.
3. Controlling daily cash and M-PESA reconciliations, supplier payments, inventory records, and monthly financial reviews.
4. Leading institutional sales outreach, customer nutrition guidance, and staff supervision.`
  );

  add(
    "ch3.staffing",
    "3.3 Staffing Requirements and Job Specifications",
    `### 3.3 Staffing Requirements and Job Specifications

The enterprise will operate with a lean, cross-trained team of **${specs.staffing.reduce((sum, s) => sum + s.count, 0)} personnel** whose positions, headcount, operational duties, and minimum academic/professional qualifications are detailed in the table below:

| Position Title | Staff Count | Key Duties and Operational Tasks | Minimum Academic & Professional Qualifications |
| :--- | :---: | :--- | :--- |
${specs.staffing
  .map(
    (s) =>
      `| **${s.position}** | ${s.count} | ${s.duties} | ${s.qualifications} |`
  )
  .join("\n")}

#### 3.3.1 Role Allocation and Accountability
Each staff member receives a written job description prior to onboarding. Technical nutritional formulation, quality sign-off, and statutory compliance remain under the direct authority of the **${leadRole}**, while routine preparation, sanitation, packaging, customer reception, and local dispatch are executed under documented standard operating procedures (SOPs). Cross-training between team members ensures uninterrupted service continuity during peak demand days or scheduled staff leave.`
  );

  add(
    "ch3.remuneration",
    "3.4 Remuneration, Benefits, and Payroll Schedule",
    `### 3.4 Remuneration, Benefits, and Payroll Schedule

Staff remuneration is structured in accordance with Kenyan employment standards and incorporates statutory deductions (NSSF, Social Health Authority [SHA], and applicable PAYE).

| Staff Position | Count | Gross Monthly Pay per Person (KES) | Est. Statutory Deductions (NSSF & SHA) | Est. Net Monthly Pay (KES) | Total Monthly Payroll Cost (KES) |
| :--- | :---: | ---: | ---: | ---: | ---: |
${specs.staffing
  .map((s) => {
    const basic = s.monthlySalary;
    const nssf = 1080;
    const sha = Math.round(basic * 0.0275);
    const net = Math.max(0, basic - nssf - sha);
    return `| **${s.position}** | ${s.count} | ${formatKES(basic)} | ${formatKES(nssf + sha)} | ${formatKES(net)} | ${formatKES(basic * s.count)} |`;
  })
  .join("\n")}
| **Total Monthly Payroll** | **${specs.staffing.reduce((sum, s) => sum + s.count, 0)}** | | | | **KES ${formatKES(specs.staffing.reduce((sum, s) => sum + s.count * s.monthlySalary, 0))}** |

#### 3.4.1 Staff Welfare and Workplace Standards
- **Personal Protective & Hygiene Attire**: Provision of clean work coats/aprons, head covers, and appropriate hygiene gear suited to each staff member's duties.
- **Health & Statutory Compliance**: Enrollment in NSSF and SHA, annual medical examination (Food Handlers Certificate where food is handled), and paid statutory leave in line with the Employment Act.`
  );

  add(
    "ch3.recruitment",
    "3.5 Recruitment, Training, and Staff Development",
    `### 3.5 Recruitment, Training, and Staff Development

#### 3.5.1 Recruitment Procedure
Vacancies will be advertised through local technical training institutions, professional networks, and community noticeboards in **${specs.townOrMarket}**. Candidates will undergo credential verification, practical skill assessment, reference checks, and required medical/hygiene clearance before appointment.

#### 3.5.2 Induction and Continuous Staff Training
1. **Hygiene, Quality & Standard Operating Procedures (SOPs)**: Mandatory induction on personal hygiene, workspace sanitization, cross-contamination prevention, and quality documentation.
2. **Occupational Safety & Emergency Preparedness**: Practical training on safe equipment operation, electrical and fire safety, first aid, and incident reporting.
3. **Customer Service & Record Keeping**: Training on respectful client communication, accurate portioning/measurement, M-PESA transaction recording, and stock tracking.`
  );

  add(
    "ch3.legal",
    "3.6 Regulatory Licenses, Health Permits, and Compliance",
    `### 3.6 Regulatory Licenses, Health Permits, and Compliance

Prior to commencing commercial operations in **${specs.townOrMarket}, ${specs.county}**, the enterprise will verify and obtain the applicable statutory registrations and county permits listed below (fees are provisional planning estimates to be confirmed with the issuing authorities):

| Regulatory Approval / Requirement | Issuing Authority | Legal / Statutory Framework | Provisional Cost / Status |
| :--- | :--- | :--- | :--- |
| **Business Name Registration** | Business Registration Service (eCitizen) | Business Names Registration Act (Cap 499) | KES 1,000 (One-off) |
| **Single Business Permit (SBP)** | County Government of ${specs.county} | County Finance Act | KES 8,000 – 15,000 / year [Confirm locally] |
| **Public Health Premises & Hygiene Clearance** | County Department of Public Health | Public Health Act (Cap 242) | KES 5,000 – 10,000 / year [Confirm locally] |
| **${
      isEducation || isConsultancy
        ? "Professional Accreditation / Practice Clearance"
        : isRetail
          ? "Food Handling & Retail Product Compliance"
          : isAgribusiness
            ? "Agricultural Produce & Food Safety Clearance"
            : "Product Quality / Standardization Mark (SM) & Food Handlers Certificates"
    }** | ${
      isEducation || isConsultancy
        ? "Kenya Nutritionists & Dietitians Institute (KNDI)"
        : isRetail || isFoodService
          ? "County Public Health / Relevant Regulatory Body"
          : "Kenya Bureau of Standards (KEBS) / County Public Health"
    } | ${
      isEducation || isConsultancy
        ? "Nutritionists and Dietitians Act (No. 18 of 2007)"
        : "Standards Act (Cap 496) / Food, Drugs & Chemical Substances Act (Cap 254)"
    } | Confirm applicable fee & schedule |
| **KRA PIN & Tax Compliance** | Kenya Revenue Authority (iTax) | Income Tax Act (Cap 470) | Free registration; monthly/annual filing |
| **NSSF & SHA Employer Registration** | NSSF / Social Health Authority | NSSF Act & Social Health Insurance Act | Statutory monthly remittance |`
  );

  add(
    "ch3.support",
    "3.7 Supporting Professional Services",
    `### 3.7 Supporting Professional Services

To strengthen governance and operational continuity, **${specs.businessName}** will engage the following external support services as needed:
- **Banking & Mobile Payments**: A business account and M-PESA Till/Paybill facility with a licensed commercial bank or SACCO in **${specs.townOrMarket}** for secure collections, supplier payments, and loan servicing.
- **Accounting & Tax Advisory**: Part-time bookkeeping and tax filing support from a qualified accountant (CPA-K) to prepare annual statements and ensure timely KRA, NSSF, and SHA compliance.
- **Legal & Lease Review**: Consultation with a registered advocate when reviewing commercial lease terms, supplier contracts, or institutional service agreements.
- **Technical & Regulatory Bodies**: Professional guidance and standards updates from the Kenya Nutritionists and Dietitians Institute (KNDI), County Department of Health, and ${isGrainMilling || resolvedModel === "manufacturing" || isBeverages ? "Kenya Bureau of Standards (KEBS)" : "Micro and Small Enterprises Authority (MSEA)"}.`
  );

  // =========================================================================
  // CHAPTER FOUR: OPERATIONAL / PRODUCTION PLAN
  // =========================================================================

  const layoutZones = isFoodService
    ? `Raw ingredient receiving, washing, and cold/dry storage
Hot and cold meal preparation and cooking stations
Dietitian portioning, calorie-labeling, and hygienic plating zone
Insulated dispatch staging and takeaway counter
Staff changing, handwashing, and dishwashing sanitation bay`
    : isAgribusiness
      ? `Propagation nursery / production plot and irrigation control
Harvest receiving, washing, and grading shade bay
Solar drying / post-harvest preservation and moisture control zone
Hygienic weighing, hermetic packaging, and labeling area
Tool store, input lockup, and dispatch loading bay`
      : isRetail
        ? `Customer reception and organized retail display shelving
Chilled beverage/dairy display and climate-controlled nutraceutical cabinet
Nutritionist consultation and product guidance counter
POS checkout, M-PESA verification, and parcel packing desk
Back-office stockroom, quarantine shelf, and sanitation station`
        : isEducation
          ? `Participant reception, registration, and resource display desk
Interactive training and multimedia seminar area
Practical culinary demonstration and anthropometric workstation
Printed manual, demonstration kit, and equipment storage room
Administration desk, confidential records lockup, and washrooms`
          : `Raw material receiving, inspection, and dry/cold storage
Primary processing, formulation, and thermal/blending zone
Hygienic filling, sealing, batch coding, and quality testing area
Finished goods palletized storage and dispatch bay
Office, staff changing, and handwashing sanitation station`;

  add(
    "ch4.facilities",
    "4.1 Production Facilities and Space Allocation",
    `### 4.1 Production Facilities and Space Allocation

The enterprise will operate from premises measuring approximately **${specs.workshopSquareMeters} square meters** at **${safeStreet}, ${specs.townOrMarket}**, at a budgeted monthly rent of **KES ${formatKES(specs.monthlyRent)}** (subject to lease confirmation).

#### 4.1.1 Facility Layout and Functional Zoning
The workspace is organized on a unidirectional flow principle to prevent cross-contamination, protect product/service quality, and support smooth daily operations:

\`\`\`layout
${layoutZones}
\`\`\`

Adequate natural and mechanical ventilation, washable floor and wall surfaces, potable handwashing stations, fire extinguishers, and covered waste bins will be maintained across all zones.`
  );

  const workflowContent = isFoodService
    ? `\`\`\`flow
Procure and inspect fresh ingredients against daily menu specifications
Wash, sanitize, and prep vegetables, whole grains, and lean proteins
Cook and prepare meals using nutrient-preserving culinary methods
Portion meals on digital scales according to therapeutic calorie/macro targets
Pack in tamper-evident containers with nutrition and allergen labels
Dispatch promptly to clients or serve at the counter and sanitize kitchen
\`\`\`
1. **Menu Planning & Ingredient Inspection**: Fresh produce, proteins, and pantry inputs are inspected upon morning arrival for freshness, temperature, and hygiene compliance.
2. **Sanitary Prep & Pre-Processing**: Ingredients are washed in potable water and prepped on color-coded cutting boards to prevent allergen and microbial cross-contamination.
3. **Nutrient-Preserving Cooking**: Meals are prepared using controlled steaming, baking, grilling, or light sautéing to preserve micronutrients while avoiding excess sodium or trans fats.
4. **Calibrated Portioning**: The nutritionist verifies portion weights using digital kitchen scales to match stated caloric and macronutrient specifications.
5. **Hygienic Packaging & Labeling**: Portions are sealed in food-grade containers (**${specs.productPackaging}**) labeled with preparation time, macro breakdown, and storage advice.
6. **Dispatch & Kitchen Sanitization**: Orders are dispatched in insulated bags while food-contact surfaces undergo clean-as-you-go sanitization.`
    : isAgribusiness
      ? `\`\`\`flow
Select certified seeds, vines, or farm inputs and prepare production units
Manage crop/stock nutrition, irrigation, and biosecurity protocols
Harvest at peak nutritional maturity and grade produce in shaded bay
Clean, sort, or solar-dry/preserve produce to target moisture/quality standards
Weigh and pack into breathable crates, trays, or barrier pouches
Label batches with harvest date and dispatch to retail or household buyers
\`\`\`
1. **Input Selection & Unit Preparation**: Certified planting material or healthy stock and organic/mineral inputs are sourced from verified suppliers and prepared under hygienic farm protocols.
2. **Production & Husbandry Monitoring**: Daily monitoring of moisture, temperature, pest management, and nutrient feeding schedules to maximize micronutrient density and yield.
3. **Hygienic Harvesting & Grading**: Produce is harvested during cool morning hours and sorted to remove damaged or undersized units.
4. **Post-Harvest Preservation & Conditioning**: Depending on the product line, items undergo washing, cooling, candling, or controlled solar dehydration to lock in nutritional quality and extend shelf life.
5. **Standardized Packaging**: Graded output is weighed and packed into **${specs.productPackaging}** with batch traceability.
6. **Market Dispatch**: Packed units are delivered directly to households, retail grocers, and institutional kitchens.`
      : isRetail
        ? `\`\`\`flow
Vet suppliers and verify KEBS, PPB, or Public Health certifications
Receive wholesale stock, inspect expiry dates, and log into POS inventory
Arrange products on clean, categorized, and climate-appropriate shelves
Guide walk-in and online customers on product selection and dietary usage
Process checkout, M-PESA payment, and pack in branded carrier bags
Conduct daily stock reconciliation and FEFO (First-Expired, First-Out) checks
\`\`\`
1. **Supplier Vetting & Procurement**: Products are ordered exclusively from licensed manufacturers and distributors with valid quality marks and batch documentation.
2. **Receiving & Quality Verification**: Incoming stock is checked for seal integrity, accurate nutrition labeling, and a minimum remaining shelf life of 75% before being entered into the POS system.
3. **Categorized Merchandising**: Items are organized by dietary category (e.g., diabetic-friendly, gluten-free, maternal/infant, functional foods) under appropriate temperature and lighting conditions.
4. **Nutritionist-Guided Customer Service**: The store nutritionist assists buyers in reading food labels and selecting items aligned with their household or clinical diet plans.
5. **Checkout & Order Fulfillment**: Purchases are billed through the POS terminal, packed in **${specs.productPackaging}**, and handed over or dispatched via local courier.`
        : isEducation
          ? `\`\`\`flow
Assess client or institutional learning needs and customize curriculum module
Prepare printed workbooks, visual aids, and fresh demonstration ingredients
Set up training venue, audiovisual projector, and sanitary demo workstation
Facilitate interactive nutrition session and live culinary/anthropometric demo
Conduct participant Q&A, practical competency check, and feedback evaluation
Issue completion guides/certificates and perform post-session follow-up
\`\`\`
1. **Needs Assessment & Curriculum Preparation**: Before each cohort or institutional booking, the lead nutritionist tailors the lesson plan, recipes, and assessment tools to the target group (${specs.targetCustomersDescription}).
2. **Material & Ingredient Staging**: Participant workbooks are printed and fresh local demonstration ingredients and equipment are sanitized and pre-portioned.
3. **Interactive Facilitation & Live Demonstration**: Sessions combine clear Kenyan nutrition science with hands-on food preparation, portion measurement, or growth-monitoring demonstrations.
4. **Participant Practice & Evaluation**: Attendees practice meal formulation or nutrition skills under guidance, complete a short learning check, and receive **${specs.productPackaging}**.
5. **Follow-Up & Documentation**: Attendance, participant feedback, and financial records are logged, and follow-up support is shared with enrolled clients or institutions.`
          : isGrainMilling
            ? `\`\`\`flow
Receive, inspect, and destone raw grains and dried tubers/legumes
Test moisture content (<13.0%) and clean/sort approved batches
Roast or pre-condition ingredients at controlled temperature
Mill and blend ingredients to the calibrated nutritional formulation
Weigh, fill, and heat-seal into moisture-barrier pouches with batch codes
Conduct final seal inspection, pack into master cartons, and dispatch
\`\`\`
1. **Raw Material Intake & Sorting**: Grains, legumes, and dried tubers are inspected upon arrival, mechanically sieved, destoned, and tested to ensure moisture content is below 13.0%.
2. **Thermal Pre-Conditioning / Roasting**: Ingredients undergo controlled roasting to deactivate anti-nutritional factors, improve digestibility, and develop a pleasant aroma.
3. **Milling & Formulation Blending**: Approved batches are milled through food-grade stainless steel screens and blended in exact nutritional ratios.
4. **Hygienic Weighing & Sealing**: The finished product is weighed into **${specs.productPackaging}**, heat-sealed, and stamped with manufacture date, expiry date, and batch number.
5. **Quality Check & Dispatch**: Sealed packs are inspected for leak integrity and stored on clean pallets ready for retail and direct distribution.`
            : `\`\`\`flow
Receive and inspect raw ingredients and food-grade packaging materials
Wash, sanitize, and prepare raw inputs under strict GMP hygiene controls
Execute primary processing, extraction, fermentation, or thermal formulation
Perform in-process quality, pH, temperature, or consistency verification
Fill, seal, and label units in tamper-evident food-grade packaging
Store in clean/chilled holding area and dispatch to customers and stockists
\`\`\`
1. **Ingredient Receiving & Quality Grading**: Raw inputs (${specs.rawMaterials.map((r) => r.material).slice(0, 2).join("; ") || "approved raw materials"}) are inspected for freshness, purity, and compliance with food-safety specifications.
2. **Sanitary Preparation**: Equipment and food-contact surfaces are sanitized, and raw inputs are cleaned, weighed, and prepared according to the batch formulation sheet.
3. **Controlled Processing & Formulation**: Using the installed equipment (${specs.machinery.map((m) => m.item).slice(0, 2).join(", ") || "processing equipment"}), the batch undergoes standardized processing (such as extraction, pasteurization, dehydration, blending, or controlled fermentation) to achieve the target nutritional and sensory profile.
4. **In-Process Quality Verification**: Temperature, timing, hygiene, and batch consistency are monitored and recorded on the batch log.
5. **Aseptic / Tamper-Evident Packaging**: The product is filled into **${specs.productPackaging}**, sealed, and labeled with ingredients, nutritional values, batch code, and expiry date.
6. **Storage & Distribution**: Finished units are held under appropriate storage conditions and dispatched on a First-In, First-Out (FIFO) schedule.`;

  add(
    "ch4.workflow",
    "4.2 Production Process Workflow",
    `### 4.2 Production / Operational Process Workflow

The preparation and delivery of **${specs.primaryProduct}** follows a standardized, traceable workflow designed to safeguard nutritional value, hygiene, and customer satisfaction:

${workflowContent}`
  );

  add(
    "ch4.equipment",
    "4.3 Machinery, Tools, and Equipment Sourcing",
    `### 4.3 Machinery, Tools, and Equipment Sourcing

The operational equipment for **${specs.businessName}** was selected for capacity alignment, hygienic construction, durability, and local maintenance support in Kenya. (Supplier names and unit costs below are planning estimates that require dated pro-forma quotations prior to purchase):

| Equipment / Tool Description | Qty | Unit Cost (KES) | Total Cost (KES) | Proposed Supplier / Quotation Status |
| :--- | :---: | ---: | ---: | :--- |
${specs.machinery
  .map(
    (m) =>
      `| **${m.item}** | ${m.quantity} | ${formatKES(m.unitCost)} | ${formatKES(m.quantity * m.unitCost)} | ${m.supplier || "[Quotation required]"} |`
  )
  .join("\n")}
| **Total Equipment & Asset Investment** | | | **KES ${formatKES(fin.totalMachineryCost)}** | **10% Annual Depreciation: KES ${formatKES(fin.annualDepreciation)}** |`
  );

  add(
    "ch4.materials",
    "4.4 Raw Material Requirements and Sourcing",
    `### 4.4 Raw Material / Operating Input Requirements and Sourcing

Consistent nutritional quality and uninterrupted supply depend on reliable sourcing of verified raw inputs, consumables, and food-grade packaging materials. The table below summarizes the planned monthly operating inputs at full Year 1 capacity (**${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}/month**):

| Input / Packaging Material | Planned Monthly Quantity | Estimated Monthly Cost (KES) | Proposed Supplier / Sourcing Channel |
| :--- | :--- | ---: | :--- |
${specs.rawMaterials
  .map(
    (r) =>
      `| **${r.material}** | ${r.monthlyQuantity} | ${formatKES(r.monthlyCost)} | ${r.supplier || "[Confirm supplier locally]"} |`
  )
  .join("\n")}
| **Total Planned Monthly Input Budget** | | **KES ${formatKES(specs.rawMaterials.reduce((sum, r) => sum + r.monthlyCost, 0))}** | **Confirm dated supplier price lists before launch** |

#### 4.4.1 Procurement and Inventory Control Policy
All inputs will be sourced from vetted suppliers in **${specs.county}** and major wholesale hubs, inspected upon delivery against quality and hygiene specifications, and rotated on a strict First-Expired, First-Out (FEFO) basis.`
  );

  add(
    "ch4.labor",
    "4.5 Labor Requirements and Production Scheduling",
    `### 4.5 Labor Requirements and Operational Scheduling

The enterprise operates on a structured 6-day weekly schedule (Monday to Saturday, 8:00 AM to 5:00 PM; 24 operating days per month).

#### 4.5.1 Daily Operational Schedule
- **Morning Session (8:00 AM – 12:30 PM)**: Workspace sanitization, input inspection, primary batch preparation/processing or client session delivery, and in-process quality checks.
- **Afternoon Session (1:30 PM – 5:00 PM)**: Packaging, labeling, customer order fulfillment, local deliveries, inventory logging, and end-of-day facility cleaning.
- **Planned Throughput**: An average of **${avgDailyUnits} ${unitWord} per operating day**, totaling **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord} per month** at 100% Year 1 planned capacity.
- **Staff Allocation**: Duties are divided across the **${specs.staffing.reduce((sum, s) => sum + s.count, 0)} team members** (${specs.staffing.map((s) => `${s.count}x ${s.position}`).join(", ")}) to prevent bottlenecks and maintain quality supervision.`
  );

  const qualityAndWasteContent = isFoodService
    ? `#### 4.6.1 Quality and Food Safety Assurance
- **Receiving & Cold-Chain Control**: Perishable vegetables, dairy, and meats are inspected upon delivery and stored immediately at safe temperatures (chiller < 5°C; freezer < -18°C).
- **Cooking & Portion Verification**: Internal cooking temperatures and digital portion weights are checked for every batch to guarantee both microbial safety and accurate nutritional macros.
- **Allergen & Hygiene Segregation**: Color-coded utensils, mandatory staff hairnets/gloves, and documented kitchen sanitization logs prevent cross-contamination.

#### 4.6.2 Environmental and Kitchen Waste Management
Organic vegetable trimmings and food peelings are segregated into covered bins for collection by local compost or pig/poultry farmers, while recyclable packaging is separated from general municipal waste. Wash water passes through a grease trap before entering the county drainage system.`
    : isAgribusiness
      ? `#### 4.6.1 Quality and Biosecurity Assurance
- **Input & Plot Hygiene**: Only certified disease-free seeds, vines, or stock and clean irrigation water are used, with strict biosecurity footbaths and tool disinfection at entry points.
- **Harvest & Preservation Standards**: Produce is graded for maturity, cleanliness, and moisture stability before packaging in **${specs.productPackaging}**.
- **Traceability**: Every crate, tray, or pouch carries a harvest/batch date to guarantee freshness for household and retail buyers.

#### 4.6.2 Agricultural Byproduct and Waste Management
Crop residues, culled leaves, and organic farm byproducts are composted on-site into organic manure or supplied as livestock fodder, creating a zero-waste circular production loop.`
      : isRetail
        ? `#### 4.6.1 Retail Quality and Inventory Assurance
- **Supplier & Product Verification**: Only products with valid KEBS Standardization Marks, PPB clearances (where applicable), and intact tamper-evident seals are accepted into stock.
- **FEFO Stock Rotation**: Shelves and display chillers are audited weekly under First-Expired, First-Out (FEFO) rules so no expired or heat-damaged item is ever sold.
- **Accurate Nutrition Guidance**: The store nutritionist ensures product recommendations respect client allergies, medical prescriptions, and age appropriateness.

#### 4.6.2 Packaging and Store Waste Management
Cardboard shipping cartons and plastic wraps are flattened for recycling, while damaged or expired items are quarantined and disposed of in accordance with County Public Health guidelines.`
        : isEducation
          ? `#### 4.6.1 Educational Quality and Demonstration Safety
- **Evidence-Based Curriculum**: All training manuals, recipes, and growth-monitoring charts are cross-checked against Kenya Ministry of Health, KNDI, and WHO nutrition guidelines.
- **Demonstration Hygiene**: Fresh ingredients used in culinary or weaning demonstrations are washed in potable water, prepared on sanitized surfaces, and served hygienically.
- **Participant Feedback & Records**: Attendance registers, pre/post learning checks, and client feedback forms are reviewed after every session to improve delivery.

#### 4.6.2 Waste and Environmental Management
Leftover food from culinary demonstrations is safely packed for participants or composted, and digital handouts are offered alongside printed workbooks to minimize paper waste.`
          : `#### 4.6.1 Quality Control and Hygiene System (GMP / HACCP)
- **Incoming Raw Material Inspection**: Every batch of raw inputs (${specs.rawMaterials.map((r) => r.material).slice(0, 2).join(", ") || "ingredients"}) is checked for visual purity, moisture/freshness, and freedom from spoilage or contamination before acceptance.
- **In-Process Monitoring**: Processing parameters (formulation weights, temperature, time, pH, or particle uniformity) are logged for each batch to ensure compliance with KEBS and Public Health standards.
- **Packaging & Seal Integrity**: Finished units in **${specs.productPackaging}** are inspected for leak-proof sealing, accurate weight/volume, and legible batch/expiry coding.

#### 4.6.2 Byproduct and Environmental Waste Management
Organic processing byproducts (such as fruit pulp, seed cake, or grain bran/husks) are collected hygienically in covered containers for sale or disposal as agricultural compost or livestock feed, while wash water is discharged through screened traps in compliance with County Public Health regulations.`;

  add(
    "ch4.quality",
    "4.6 Quality Control, Hygiene, and Waste Management",
    `### 4.6 Quality Control, Hygiene, and Waste Management

${qualityAndWasteContent}

#### 4.6.3 Regulatory and Traceability Records
Daily sanitation logs, batch/service registers, supplier delivery notes, and customer feedback records will be maintained at **${safeStreet}** for internal quality audits and inspection by County Public Health and relevant regulatory authorities.`
  );

  const maxInstalledMonthlyCapacity = Math.round(specs.monthlyProductionUnitsYear1 * 1.6);
  const year1UtilizationPercent = Math.round((specs.monthlyProductionUnitsYear1 / Math.max(1, maxInstalledMonthlyCapacity)) * 100);

  add(
    "ch4.schedule",
    "4.7 Production Capacity and Maintenance Schedule",
    `### 4.7 Operational Capacity and Equipment Maintenance Schedule

#### 4.7.1 Capacity Utilization Plan
- **Maximum Single-Shift Installed Capacity**: Estimated at **${formatKES(maxInstalledMonthlyCapacity)} ${unitWord} per month** based on the selected equipment (${specs.machinery[0]?.item || "primary equipment"}) and staffing configuration.
- **Year 1 Planned Operating Capacity**: **${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord} per month** (**${year1UtilizationPercent}% utilization**), leaving **${100 - year1UtilizationPercent}%** reserve capacity to accommodate Year 2 (+${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%) and Year 3 (+${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%) growth without immediate major capital replacement.

#### 4.7.2 Preventive Maintenance Schedule
- **Daily**: Cleaning, sanitization, and visual inspection of all operational equipment, scales, and work surfaces at the close of business.
- **Monthly**: Calibration of weighing/measuring instruments, inspection of electrical connections, seals, heating/cooling elements, and moving parts by a qualified technician.`
  );

  // =========================================================================
  // CHAPTER FIVE: FINANCIAL PLAN
  // =========================================================================

  add(
    "ch5.startup",
    "5.1 Pre-Operational Expenses and Startup Capital",
    `### 5.1 Pre-Operational Expenses and Startup Capital

Pre-operational expenses comprise all non-recurring setup outlays incurred prior to the formal commercial opening of **${specs.businessName}**.

${fin.preOperationalTable}

These setup expenses are combined with fixed equipment (**KES ${formatKES(fin.totalMachineryCost)}**) and the initial working capital reserve (**KES ${formatKES(specs.workingCapitalBuffer || 75000)}**) to determine the total startup capital requirement of **KES ${formatKES(fin.totalStartupCapital)}**.`
  );

  const loanTenure = Math.max(1, Math.floor(specs.loanTenureMonths || 24));
  const loanRate = Number(specs.loanInterestRateAnnual || 0);
  const firstMonthLoanInstallment =
    fin.loanAmount > 0
      ? Math.round(fin.loanAmount / loanTenure + (fin.loanAmount * (loanRate / 100)) / 12)
      : 0;

  add(
    "ch5.sources",
    "5.2 Desired Financing and Capitalization Structure",
    `### 5.2 Desired Financing and Capitalization Structure

The total startup capital required to commission **${specs.businessName}** is **KES ${formatKES(fin.totalStartupCapital)}**.

${fin.capitalizationTable}

#### 5.2.1 Terms of Proposed Financing
${
  fin.loanAmount > 0
    ? `- **Proposed Lender Category**: Youth Enterprise Development Fund (YEDF), Women Enterprise Fund, SACCO, or Microfinance Institution [Confirm specific lender and written offer locally]
- **Loan Principal Amount**: **KES ${formatKES(fin.loanAmount)}** (${fin.totalFunding > 0 ? Math.round((fin.loanAmount / fin.totalFunding) * 100) : 0}% of total funding)
- **Owner's Equity Contribution**: **KES ${formatKES(fin.ownerEquityAmount)}** (${fin.totalFunding > 0 ? Math.round((fin.ownerEquityAmount / fin.totalFunding) * 100) : 0}% of total funding)
- **Assumed Interest Rate**: **${loanRate.toFixed(1)}% per annum** on reducing balance
- **Repayment Tenure**: **${loanTenure} months** (initial Month 1 principal + interest installment of **KES ${formatKES(firstMonthLoanInstallment)}**, declining monthly as principal reduces).`
    : `- **Financing Structure**: **100% Owner's Equity (KES ${formatKES(fin.ownerEquityAmount)})** with **KES 0** external debt financing.
- **Rationale**: Funding the venture entirely through personal savings and family equity eliminates monthly loan interest and principal repayment pressure during Year 1.`
}`
  );

  add(
    "ch5.assumptions",
    "5.3 Key Financial and Macroeconomic Assumptions",
    `### 5.3 Key Financial and Macroeconomic Assumptions

The pro-forma financial statements are constructed upon the following transparent operational and financial parameters:
1. **Sales Ramp-up**: Year 1 models 65% of full monthly volume (${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}) in Months 1–2, 80% in Month 3, 90% in Month 4, and 100% from Month 5 through Month 12.
2. **Multi-Year Growth**: Annual sales volume and direct variable costs expand by **${Math.round((specs.annualGrowthRateYear2 || 0.2) * 100)}%** in Year 2 and **${Math.round((specs.annualGrowthRateYear3 || 0.2) * 100)}%** in Year 3 at a constant unit price of **KES ${formatKES(specs.unitSellingPrice)}**.
3. **Depreciation Policy**: Equipment and fixed assets (**KES ${formatKES(fin.totalMachineryCost)}**) are depreciated on a straight-line basis at **10% per annum** (**KES ${formatKES(fin.annualDepreciation)}/year**).
4. **Operating Expense Escalation**: Operating overheads (wages, rent, utilities, transport, marketing, and stationery) are modeled with a conservative 8–10% annual inflation adjustment in Years 2 and 3.
5. **Provisional Income Tax**: The model applies a **30% provisional tax assumption** on positive net profit before tax (EBT), paid in Month 12 of each operating year. Confirm the exact statutory tax rate and turnover/income tax regime applicable to a ${specs.formOfOwnership} with a qualified tax adviser.`
  );

  add(
    "ch5.cashflow",
    "5.4 Pro-Forma Cash Flow Statement (Three Years)",
    `### 5.4 Pro-Forma Cash Flow Statement (Three Years)

The three-year cash flow summary and the 12-month Year 1 schedule track all projected cash inflows and outflows. Opening cash (**KES ${formatKES(Math.max(0, fin.totalFunding - fin.totalMachineryCost - fin.totalPreOperationalCost))}**) represents the working capital cash available on Day 1 after paying for fixed equipment (**KES ${formatKES(fin.totalMachineryCost)}**) and pre-operational setup costs (**KES ${formatKES(fin.totalPreOperationalCost)}**).

${fin.threeYearCashFlowTable}

#### Year 1 Monthly Cash Flow Detail
${fin.monthlyCashFlowTableYear1}

The model projects a Year 1 closing cash balance of **KES ${formatKES(fin.year1ClosingCash)}**, followed by **KES ${formatKES(fin.year2ClosingCash)}** in Year 2 and **KES ${formatKES(fin.year3ClosingCash)}** in Year 3.`
  );

  add(
    "ch5.income",
    "5.5 Pro-Forma Income Statement (Three-Year P&L)",
    `### 5.5 Pro-Forma Income Statement (Three-Year P&L)

The projected statement of profit and loss evaluates enterprise profitability across the three-year planning horizon.

${fin.threeYearIncomeStatementTable}

#### 5.5.1 Profitability Commentary
The projected gross profit margin is **${fin.grossProfitMarginPercent}%**. Projected net profit after tax is **KES ${formatKES(fin.netProfitYear1)}** (**${fin.netProfitMarginPercentYear1}% net margin**) in Year 1, **KES ${formatKES(fin.netProfitYear2)}** in Year 2, and **KES ${formatKES(fin.netProfitYear3)}** in Year 3. These figures are deterministic projections from the stated assumptions and should be reviewed against actual monthly trading records.`
  );

  add(
    "ch5.balance",
    "5.6 Pro-Forma Balance Sheet (Three Years)",
    `### 5.6 Pro-Forma Balance Sheet (Three Years)

The statement of financial position confirms that Total Assets equal Total Liabilities plus Owner's Equity on the Opening Date and at the end of Years 1, 2, and 3.

${fin.threeYearBalanceSheetTable}`
  );

  add(
    "ch5.breakeven",
    "5.7 Break-Even Analysis",
    `### 5.7 Break-Even Analysis

Break-even analysis determines the minimum monthly sales volume and revenue required to cover all monthly fixed operating costs (including straight-line depreciation).

${fin.breakEvenTable}

#### 5.7.1 Interpretation of Break-Even Results
${
  !fin.breakEvenAchievable
    ? "The current selling price does not exceed variable cost per unit, so the contribution margin is zero or negative. Break-even cannot be calculated until the candidate revises and verifies the price or variable-cost assumptions."
    : fin.breakEvenLevelPercent > 100
      ? `Break-even requires **${formatKES(fin.breakEvenUnitsMonthly)} ${unitWord} per month**, or **${fin.breakEvenLevelPercent}%** of the planned capacity. The current capacity assumption is insufficient to reach break-even; review capacity, pricing, variable costs, or fixed costs.`
      : `Break-even requires **${formatKES(fin.breakEvenUnitsMonthly)} ${unitWord} per month** and monthly sales revenue of **KES ${formatKES(fin.breakEvenRevenueMonthly)}**. This represents **${fin.breakEvenLevelPercent}%** of the planned monthly capacity (${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}), leaving a **${100 - fin.breakEvenLevelPercent}%** margin of safety at full capacity.`
}`
  );

  add(
    "ch5.ratios",
    "5.8 Profitability and Financial Health Ratios",
    `### 5.8 Profitability and Financial Health Ratios

The ratios below are computed directly from the projected income statements and balance sheets across the three-year horizon:

${fin.financialRatiosTable}`
  );

  add(
    "ch5.risks",
    "5.9 Comprehensive Risk Management and Contingency Planning",
    `### 5.9 Comprehensive Risk Management and Contingency Planning

| Risk Category | Nature of Commercial Threat | Concrete Mitigation Measure |
| :--- | :--- | :--- |
| **Market & Demand Risk** | Customer uptake in ${specs.townOrMarket} may ramp up slower than the projected ${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}/month. | Maintain lean fixed costs, track weekly sales conversions, and expand institutional/B2B outreach alongside individual retail sales. |
| **Input Cost & Supply Risk** | Seasonal price increases or supply disruptions for key inputs (${specs.rawMaterials[0]?.material || "primary inputs"}). | Maintain at least two verified suppliers per input, obtain dated price quotes, and review selling prices semi-annually if input costs shift >10%. |
| **Quality & Hygiene Risk** | Spoilage, contamination, or non-compliance with Public Health / KEBS / KNDI standards. | Enforce strict daily GMP/HACCP sanitation checklists, proper temperature/moisture storage, and batch traceability coding. |
| **Liquidity & Cash-Flow Risk** | Delayed payments from institutional accounts or unexpected equipment repairs. | Enforce cash/M-PESA terms on retail sales, cap institutional credit at 7–14 days, and retain the **KES ${formatKES(specs.workingCapitalBuffer || 75000)}** working capital reserve. |
| **Regulatory & Licensing Risk** | Delays in securing county permits or sector-specific clearances. | Initiate business registration and County Public Health inspection during Month 1–2 pre-operational setup before commercial launch. |`
  );

  // =========================================================================
  // REFERENCES & APPENDICES
  // =========================================================================

  const defaultReferences = [
    "1. Government of Kenya. (2012). *The Business Names Registration Act (Cap 499, Laws of Kenya)*. National Council for Law Reporting.",
    "2. Government of Kenya. (2012). *The Public Health Act (Cap 242, Laws of Kenya)* & *The Food, Drugs and Chemical Substances Act (Cap 254)*. Government Printer, Nairobi.",
    "3. Kenya Bureau of Standards (KEBS). (2020). *KS EAS 39: Hygiene in the Food and Drink Manufacturing Industry — Code of Practice*. KEBS, Nairobi.",
    "4. Kenya National Bureau of Statistics (KNBS) & Ministry of Health. (2022). *Kenya Demographic and Health Survey (KDHS) 2022 Key Indicators Report*. KNBS.",
    "5. Kenya Nutritionists and Dietitians Institute (KNDI). (2019). *Scope of Practice and Accreditation Standards for Nutrition and Dietetics Professionals in Kenya*. KNDI.",
    "6. Ministry of Health, Republic of Kenya. (2018). *Kenya National Food Composition Tables & National Guidelines for Healthy Diets and Physical Activity*. Ministry of Health, Nairobi.",
  ];

  add(
    "references",
    "References (APA 7th Edition)",
    `### REFERENCES

${
  specs.research?.sources?.length
    ? specs.research.sources.map((source, index) => `${index + 1}. ${source.title}. ${source.url}`).join("\n\n")
    : defaultReferences.join("\n\n")
}`
  );

  add(
    "app.workplan",
    "Appendix I: Business Implementation Schedule (Gantt Chart)",
    `### APPENDIX I: PROPOSED 12-MONTH IMPLEMENTATION SCHEDULE

This schedule outlines the planned pre-operational and first-year operational milestones for **${specs.businessName}** in **${specs.townOrMarket}, ${specs.county}**:

| Milestone Activity | M1 | M2 | M3 | M4 | M5-M6 | M7-M9 | M10-M12 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Finalize business plan, confirm equity/loan funding & lease premises | X | | | | | | |
| Register business name, apply for County SBP & Public Health clearance | X | X | | | | | |
| Obtain supplier quotations, procure & install equipment/fixtures | | X | | | | | |
| Recruit assistant staff, conduct hygiene/SOP induction & trial runs | | X | X | | | | |
| Commence commercial operations & community/institutional marketing | | | X | X | X | | |
| Ramp up to 100% planned monthly capacity (${formatKES(specs.monthlyProductionUnitsYear1)} ${unitWord}/mo) | | | | | X | X | X |
| Quarterly financial reconciliation, quality audit & Year 2 expansion review | | | | X | | X | X |`
  );

  add(
    "app.invoices",
    "Appendix II: Price Quotes and Market Survey Evidence Summary",
    `### APPENDIX II: SUPPLIER QUOTATIONS AND MARKET EVIDENCE REGISTER

Supplier names and unit costs below reflect candidate planning estimates. Attach dated pro-forma invoices and local market survey sheets prior to final examination or loan disbursement.

#### A. Equipment and Asset Quotation Register
| Item Description | Qty | Estimated Unit Cost (KES) | Total Cost (KES) | Proposed Supplier | Verification Status |
| :--- | :---: | ---: | ---: | :--- | :--- |
${specs.machinery.map((item) => `| ${item.item} | ${item.quantity} | ${formatKES(item.unitCost)} | ${formatKES(item.quantity * item.unitCost)} | ${item.supplier || "[Supplier required]"} | [Attach dated quotation] |`).join("\n") || "| [Enter equipment or tools] | 1 | 0 | 0 | [Supplier required] | [Quotation required] |"}

#### B. Monthly Operating Inputs & Materials Register
| Input / Material Description | Monthly Quantity | Estimated Monthly Cost (KES) | Proposed Supplier | Verification Status |
| :--- | :--- | ---: | :--- | :--- |
${specs.rawMaterials.map((item) => `| ${item.material} | ${item.monthlyQuantity} | ${formatKES(item.monthlyCost)} | ${item.supplier || "[Supplier required]"} | [Attach price list] |`).join("\n") || "| [Enter materials or operating inputs] | [Confirm] | 0 | [Supplier required] | [Quotation required] |"}

#### C. Field Market & Competitor Verification Note
Record dated customer interview summaries and observed competitor prices in **${specs.townOrMarket}, ${specs.county}** to substantiate the demand and pricing assumptions in Chapter 2.`
  );

  if (isConsultancy) {
    const definitions = new Map(
      getWorkspaceSections("business_plan", specs.level, resolvedModel).map((definition) => [definition.key, definition])
    );
    return results.map((section) => {
      const definition = definitions.get(section.section_key);
      const title = definition?.title || section.title;
      const content = getConsultancySectionContent(section.section_key, title, {
        ...specs,
        ownerQualifications: safeQualifications,
        streetOrBuilding: safeStreet,
        locationRationale: safeLocationRationale,
        productDescription: safeProductDescription,
        competitors: safeCompetitors,
      });
      if (!content) return section;
      return {
        ...section,
        title,
        content,
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
      };
    });
  }

  return results;
}
