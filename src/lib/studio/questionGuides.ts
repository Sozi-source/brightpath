import type { WorkspaceContext, SectionQuestionGuide } from "./aiEngine";
import { getAcademicLevelSpec } from "./aiEngine";

/**
 * Comprehensive KNEC Section & Sub-Section Question Guides
 * Covers every section across:
 * 1. Nutrition & Dietetics Secondary Research (research_secondary)
 * 2. Food Science & Product Formulation (trade_fabrication)
 * 3. Nutrition & Food Enterprise Business Plan (business_plan)
 */
export function buildSectionQuestionGuide(
  sectionKey: string,
  context: WorkspaceContext
): SectionQuestionGuide {
  const isBusiness = context.workspaceType === "business_plan";
  const isTrade = context.workspaceType === "trade_fabrication";
  const levelSpec = getAcademicLevelSpec(context.level);

  // =========================================================================
  // BUSINESS PLAN TRACK (Chapters 1 - 5)
  // =========================================================================
  if (isBusiness) {
    switch (sectionKey) {
      case "ch1.name":
        return {
          mainQuestion: "What is your business name, brand identity, and trade slogan?",
          subQuestions: [
            "What is the registered name of your nutrition or food enterprise, and why did you choose it?",
            "What is your business slogan or motto, and what message does it convey to customers?",
            "What are the colors and symbols on your brand logo, and what do they represent?",
          ],
          placeholderExample:
            'e.g. "The enterprise will operate under the registered trade name NutriGrow Foods Enterprises. The brand slogan is \'Nourishing Every Child Naturally.\' The logo features a green leaf and golden grain symbolizing natural biofortified ingredients..."',
        };
      case "ch1.location":
        return {
          mainQuestion: "Where is your business physically located and why is that site ideal?",
          subQuestions: [
            "Which county, town, street, or market center will host your business premises?",
            "How accessible is the location to raw material suppliers, transport roads, and target buyers?",
            "What essential utilities (clean water, 3-phase or reliable electricity, waste disposal, security) are available at the site?",
          ],
          placeholderExample:
            'e.g. "The business will be located in Machakos Town along Syokimau Road, 200 meters from the main municipal market. The site has reliable county water, three-phase KPLC power, and direct tarmac access to local grain suppliers..."',
        };
      case "ch1.ownership":
        return {
          mainQuestion: "What form of legal ownership will your business take and how is capital contributed?",
          subQuestions: [
            "Is the enterprise a Sole Proprietorship, Partnership, or Private Limited Company?",
            "Why did you select this ownership structure for its startup stage?",
            "How much initial capital comes from owner savings, family contribution, or youth/enterprise loans?",
          ],
          placeholderExample:
            'e.g. "NutriGrow Foods will operate as a Sole Proprietorship registered under the Business Names Registration Act. The proprietor will contribute 60% of startup capital from personal savings and 40% from the Youth Enterprise Development Fund..."',
        };
      case "ch1.nature":
        return {
          mainQuestion: "What industry sector does your business belong to and what are its main activities?",
          subQuestions: [
            "Which sector and sub-sector does the enterprise fall under (e.g. Agro-processing, Food Manufacturing, or Clinical Nutrition Services)?",
            "What core value-addition or service activities will the business perform daily?",
            "What current trends in Kenya make this industry sector promising?",
          ],
          placeholderExample:
            'e.g. "The enterprise operates in the agro-processing and nutrient-dense food manufacturing sector, specializing in cleaning, drying, milling, and blending local biofortified crops into fortified flours..."',
        };
      case "ch1.products":
        return {
          mainQuestion: "What specific products or services will you offer and what makes them unique?",
          subQuestions: [
            "What are your main products or services, including their ingredients and nutritional benefits?",
            "In what package sizes (e.g. 500g, 1kg, 2kg moisture-proof pouches) will the products be sold?",
            "What is your Unique Selling Proposition (USP) compared to ordinary products in the market?",
          ],
          placeholderExample:
            'e.g. "Our flagship product is a pre-cooked composite porridge flour packed in 500g and 1kg laminated food-grade pouches, formulated from orange-fleshed sweet potato, amaranth, and extruded soybean..."',
        };
      case "ch1.mission":
        return {
          mainQuestion: "What are the Vision Statement, Mission Statement, and Core Values of your business?",
          subQuestions: [
            "Vision: Where do you see the enterprise in the next 5 to 10 years?",
            "Mission: What daily purpose does your business serve for its customers and community?",
            "Core Values: What 4 to 5 guiding principles (e.g. Food Safety, Integrity, Quality, Affordability) govern your operations?",
          ],
          placeholderExample:
            'e.g. "Vision: To be the leading producer of affordable therapeutic and complementary foods in Eastern Kenya.\nMission: To formulate safe, nutrient-rich foods from local crops.\nCore Values: Hygiene & Safety, Quality Compliance, Customer Care, and Honesty."',
        };
      case "ch1.goals":
        return {
          mainQuestion: "What are your short-term (Year 1) and long-term (Years 2–3) business objectives?",
          subQuestions: [
            "What production volume and sales revenue target will you achieve in Year 1?",
            "When do you expect the business to break even and start making net profit?",
            "What expansion, KEBS certification, or new distribution goals do you target in Years 2 and 3?",
          ],
          placeholderExample:
            'e.g. "Short-term Objectives (Year 1): Achieve monthly production of 2,500 kg, secure KEBS standardization mark, and break even within 8 months.\nLong-term Objectives (Years 2-3): Expand distribution to 3 neighboring counties and increase revenue by 25% annually."',
        };
      case "ch1.justification":
        return {
          mainQuestion: "Why is this business commercially viable and beneficial to the community?",
          subQuestions: [
            "What nutritional gap or market shortage in your target area justifies starting this enterprise?",
            "How will the business create jobs and provide a market for local farmers?",
            "Why will customers buy your product at your proposed price?",
          ],
          placeholderExample:
            'e.g. "High rates of child malnutrition and expensive imported weaning foods create strong demand for affordable local alternatives. The venture will source raw grains from 40 local smallholder farmers and employ 5 youth..."',
        };
      case "ch1.entry":
        return {
          mainQuestion: "How will your business enter the market and grow over the first 3 years?",
          subQuestions: [
            "How will you introduce your product to first-time buyers (e.g. introductory pricing, free tasting/sampling at clinics, retailer discounts)?",
            "How will you build customer loyalty and repeat purchases?",
            "What is your step-by-step growth plan for expanding into new towns or product lines?",
          ],
          placeholderExample:
            'e.g. "Market entry will combine introductory wholesale discounts for local mini-supermarkets, free product demonstrations at Maternal and Child Health (MCH) clinics, and nutritionist referrals..."',
        };
      case "ch1.swot":
        return {
          mainQuestion: "What are the Strengths, Weaknesses, Opportunities, and Threats (SWOT) of your enterprise?",
          subQuestions: [
            "Strengths & Weaknesses: What internal advantages (e.g. qualified food/nutrition training) and limitations (e.g. limited initial capital) do you have?",
            "Opportunities & Threats: What external market opportunities and risks (e.g. seasonal grain price changes, competition) exist?",
            "How will you overcome each weakness and threat?",
          ],
          placeholderExample:
            'e.g. "Strengths: Qualified nutritionist founder and nutrient-tested recipe.\nWeaknesses: New brand in the market.\nOpportunities: Growing demand for healthy weaning flours.\nThreats: Seasonal raw material price fluctuations, mitigated through farmer supply contracts."',
        };
      case "ch2.customers":
        return {
          mainQuestion: "Who are your target customers and how are they segmented?",
          subQuestions: [
            "Who are your individual/household buyers (e.g. mothers with children aged 6–59 months, health-conscious families, elderly)?",
            "Who are your institutional or wholesale buyers (e.g. local supermarkets, pharmacies, ECDE schools, hospitals)?",
            "What are their purchasing habits, income levels, and product preferences?",
          ],
          placeholderExample:
            'e.g. "Primary customers are households with infants and young children (60% of sales), followed by local retail mini-supermarkets and agro-vet/health stores (25%), and ECDE school feeding programs (15%)..."',
        };
      case "ch2.demand":
        return {
          mainQuestion: "What is the estimated total market demand and your realistic market share?",
          subQuestions: [
            "Approximately how many target households or institutional buyers exist in your trading area?",
            "How often do they buy this product each month, and what is the total monthly demand in units/kg?",
            "What realistic percentage of this market (market share) will your business capture in Year 1?",
          ],
          placeholderExample:
            'e.g. "With approximately 15,000 target households consuming an average of 2 kg of porridge flour monthly, total local demand is 30,000 kg/month. NutriGrow targets an initial 8% market share (2,400 kg/month)..."',
        };
      case "ch2.competitors":
        return {
          mainQuestion: "Who are your main competitors and how will you outperform them?",
          subQuestions: [
            "Who are the existing direct and indirect competitors selling similar products in your area?",
            "What are their strengths and weaknesses in price, packaging, nutrient quality, and distribution?",
            "How does your product beat them on value, quality, or customer service?",
          ],
          placeholderExample:
            'e.g. "Main competitors include informal open-air posho millers (low hygiene, uncertified) and large national brands (expensive at KES 280/kg). NutriGrow bridges this gap by offering KEBS-compliant fortified flour at KES 180/kg..."',
        };
      case "ch2.pricing":
        return {
          mainQuestion: "How did you calculate your selling price and profit margin?",
          subQuestions: [
            "What is the total production cost per unit (raw materials + processing + packaging + overheads)?",
            "What pricing method are you using (e.g. cost-plus mark-up pricing alongside competitor benchmarking)?",
            "What are your exact wholesale and retail selling prices in KES per unit?",
          ],
          placeholderExample:
            'e.g. "Unit production cost per 1 kg packet is KES 125. Using a 32% mark-up for wholesale and 44% for retail, our wholesale price is KES 165/kg and retail selling price is KES 180/kg..."',
        };
      case "ch2.promotion":
        return {
          mainQuestion: "How will you advertise and promote your products to attract buyers?",
          subQuestions: [
            "Which promotional methods will you use (e.g. posters, WhatsApp/Facebook pages, clinic nutrition talks, point-of-sale banners)?",
            "What sales promotions will encourage trial and repeat buying?",
            "How much will you spend monthly on marketing and promotion (in KES)?",
          ],
          placeholderExample:
            'e.g. "Promotion will use branded shop posters, WhatsApp Business catalog updates, community nutrition awareness days, and a 5% discount on wholesale orders above 20 packets. Monthly promotion budget is KES 4,500..."',
        };
      case "ch2.distribution":
        return {
          mainQuestion: "How will your products get from your production premises to the final customer?",
          subQuestions: [
            "What distribution channels will you use (direct factory shop sales, wholesale to retailers, delivery to institutions)?",
            "What transport means will you use for deliveries (e.g. branded delivery motorcycle/tuktuk or courier)?",
            "How will you prevent product damage or spoilage during transit and storage?",
          ],
          placeholderExample:
            'e.g. "Distribution will follow a two-tier channel: direct sales from our premises (30%) and wholesale delivery to local shops and pharmacies via hired motorcycle transport twice weekly (70%)..."',
        };
      case "ch2.forecast":
        return {
          mainQuestion: "What are your projected monthly and annual sales volumes and revenues for Years 1, 2, and 3?",
          subQuestions: [
            "How many units/kilograms do you project to sell per month in Year 1 (accounting for low, average, and peak months)?",
            "What is the total projected sales revenue in KES for Year 1?",
            "What are the projected annual sales volumes and KES revenues for Year 2 and Year 3?",
          ],
          placeholderExample:
            'e.g. "Year 1 sales start at 1,500 kg in Month 1 and grow to 2,800 kg by Month 12, totaling 26,400 kg (KES 4,752,000). Year 2 projects 31,680 kg (KES 5,702,400) and Year 3 projects 38,000 kg (KES 6,840,000)..."',
        };
      case "ch3.structure":
        return {
          mainQuestion: "How is your business organized from top management to operational staff?",
          subQuestions: [
            "What are the job positions in your organizational hierarchy (e.g. Manager/Owner, Production Technician, Sales & Accounts Assistant)?",
            "Who reports to whom in the daily workflow?",
            "Why is this lean structure suitable for a growing TVET enterprise?",
          ],
          placeholderExample:
            'e.g. "The enterprise will have a flat organizational structure headed by the General Manager (Founder), overseeing two core units: Production & Quality Control (1 Technician, 1 Assistant) and Marketing & Accounts (1 Sales Representative)..."',
        };
      case "ch3.management":
        return {
          mainQuestion: "What qualifications and experience does the business manager/owner bring?",
          subQuestions: [
            "What are the academic and technical qualifications of the proprietor/manager?",
            "What are the daily duties and responsibilities of the manager?",
            "What monthly salary or drawings will the manager receive?",
          ],
          placeholderExample:
            'e.g. "The General Manager holds a KNEC qualification in Nutrition and Dietetics / Food Science with hands-on industrial attachment experience in food processing and quality assurance..."',
        };
      case "ch3.staffing":
        return {
          mainQuestion: "What other personnel does the business need, and what are their duties and qualifications?",
          subQuestions: [
            "How many staff members will you employ in Production, Quality Control, and Sales?",
            "What specific duties will each employee perform?",
            "What minimum qualification or skill is required for each role?",
          ],
          placeholderExample:
            'e.g. "1. Production Operator (Craft Certificate in Food Processing): Operates dryer, mill, and mixer.\n2. Packaging & Store Assistant (KCSE + Food Handler Certificate): Weighs, seals, and labels packets.\n3. Sales Assistant: Manages shop orders and deliveries."',
        };
      case "ch3.remuneration":
        return {
          mainQuestion: "What is the monthly salary and statutory deduction schedule for all staff?",
          subQuestions: [
            "What is the gross monthly salary (in KES) for each position?",
            "What statutory deductions/contributions apply (NSSF, SHA/SHIF, Housing Levy, PAYE where applicable)?",
            "What non-financial incentives (e.g. protective gear, tea/lunch, performance bonus) will you provide?",
          ],
          placeholderExample:
            'e.g. "Monthly Payroll Schedule:\n- Manager: KES 25,000\n- Production Operator: KES 18,000\n- Packaging Assistant: KES 14,000\n- Sales Rep: KES 15,000\nTotal monthly gross payroll = KES 72,000 plus statutory NSSF and SHA contributions."',
        };
      case "ch3.recruitment":
        return {
          mainQuestion: "How will you recruit, induct, and train your staff?",
          subQuestions: [
            "How will you advertise vacancies and interview candidates?",
            "How will new employees be inducted on food hygiene, HACCP, and equipment safety?",
            "How will you evaluate staff performance and motivate high productivity?",
          ],
          placeholderExample:
            'e.g. "Staff will be recruited through local technical training institute placement boards and vetted via practical interviews. All hires undergo a 3-day induction on personal hygiene, GMP, and safe machine operation..."',
        };
      case "ch3.legal":
        return {
          mainQuestion: "Which licenses, health permits, and regulatory approvals are required to operate legally in Kenya?",
          subQuestions: [
            "What business registration and tax documents are required (Business Name Certificate, KRA PIN)?",
            "What county and public health permits are needed (County Single Business Permit, Public Health Premises Inspection, Food Handler Certificates)?",
            "What product quality certification is required (KEBS Standardization Mark) and what is the total cost of all permits?",
          ],
          placeholderExample:
            'e.g. "Required permits include: Business Name Registration (KES 950), County Single Business Permit (KES 8,500), Public Health Premises & Food Handler Certificates (KES 4,500), and KEBS SME Permit (KES 15,800)..."',
        };
      case "ch3.support":
        return {
          mainQuestion: "Which external support services (banking, accounting, legal, insurance) will your business use?",
          subQuestions: [
            "Which commercial bank and mobile money till (M-Pesa Buy Goods / Paybill) will handle business transactions?",
            "Who will provide bookkeeping/tax filing, insurance cover, and equipment maintenance?",
          ],
          placeholderExample:
            'e.g. "Banking services will be held with KCB Bank alongside an M-Pesa Business Till. Fire and burglary insurance will be provided by CIC Insurance, and annual tax returns will be prepared by a certified local accountant..."',
        };
      case "ch4.facilities":
        return {
          mainQuestion: "How is your production premise laid out and divided into functional work zones?",
          subQuestions: [
            "What is the total floor size (in sq. meters) and monthly rent of the premises?",
            "How is the floor space separated to prevent cross-contamination (Raw Material Store, Washing/Drying Bay, Milling/Blending Room, Packaging Area, Finished Goods Store, Washrooms)?",
          ],
          placeholderExample:
            'e.g. "The 80 sq. meter facility is partitioned into a unidirectional food-safe layout: Raw Material Receiving Store (15 m²), Preparation & Drying Room (20 m²), Milling & Blending Room (20 m²), Packaging Bay (15 m²), and Dispatch Store (10 m²)..."',
        };
      case "ch4.workflow":
        return {
          mainQuestion: "What is your step-by-step production process from raw material receipt to packaged product?",
          subQuestions: [
            "What are the exact stages of production (e.g. Sorting -> Cleaning -> Drying -> Roasting/Extrusion -> Milling -> Blending -> Weighing & Sealing)?",
            "What temperatures, durations, or blend ratios are maintained at each stage?",
            "How do you minimize material wastage during processing?",
          ],
          placeholderExample:
            'e.g. "Step 1: Raw grain sorting and cleaning.\nStep 2: Controlled roasting of soybeans at 130°C for 20 minutes to deactivate anti-nutrients.\nStep 3: Stainless-steel hammer milling (0.5mm sieve).\nStep 4: Ribbon blending in 60:30:10 ratio.\nStep 5: Weighing and heat-sealing into 1 kg pouches."',
        };
      case "ch4.equipment":
        return {
          mainQuestion: "What machinery, tools, and equipment are required, what do they cost, and where will you buy them?",
          subQuestions: [
            "List each piece of equipment (e.g. hammer mill, mixer, dehydrator, digital weighing scale, heat sealer), quantity, and unit cost in KES.",
            "Who are the local equipment suppliers and how will machines be serviced?",
          ],
          placeholderExample:
            'e.g. "1. Stainless Steel Hammer Mill (1 unit @ KES 85,000)\n2. Batch Ribbon Mixer 50kg (1 unit @ KES 55,000)\n3. Electric Cabinet Dryer (1 unit @ KES 65,000)\n4. Digital Platform & Table Scales (2 units @ KES 12,000)\n5. Impulse Heat Sealer (2 units @ KES 9,000)..."',
        };
      case "ch4.materials":
        return {
          mainQuestion: "What raw materials and packaging supplies do you need each month and what do they cost?",
          subQuestions: [
            "List each raw ingredient and packaging item, monthly quantity required, unit purchase price, and total monthly cost in KES.",
            "Who are your primary and backup suppliers, and what quality checks do you perform upon delivery?",
          ],
          placeholderExample:
            'e.g. "Monthly Raw Material Schedule (for 2,400 kg output):\n- Orange-Fleshed Sweet Potato chips: 1,200 kg @ KES 60 = KES 72,000\n- Cleaned Soybean: 720 kg @ KES 95 = KES 68,400\n- Amaranth Grain: 480 kg @ KES 110 = KES 52,800\n- Printed 1kg Pouches: 2,500 pcs @ KES 12 = KES 30,000..."',
        };
      case "ch4.labor":
        return {
          mainQuestion: "How are daily production shifts scheduled and what is the direct labor cost per batch?",
          subQuestions: [
            "What are the daily working hours and days per week (e.g. Monday–Saturday, 8:00 AM–5:00 PM)?",
            "How are tasks divided between direct production workers and indirect support staff?",
          ],
          placeholderExample:
            'e.g. "Production runs 6 days a week (8:00 AM - 5:00 PM). Morning shifts handle raw cleaning, roasting, and milling; afternoon shifts handle blending, packaging, and sanitation..."',
        };
      case "ch4.quality":
        return {
          mainQuestion: "What quality control, food safety (HACCP/KEBS), and waste management measures will you enforce?",
          subQuestions: [
            "How do you check raw material moisture (<12%) and freedom from aflatoxin or foreign matter?",
            "What personal hygiene and sanitation rules apply inside the production room?",
            "How are organic peels, husks, and wastewater safely disposed of or recycled?",
          ],
          placeholderExample:
            'e.g. "Incoming grains are tested with a digital moisture meter to ensure moisture is below 12%. Finished batches are sampled for moisture and seal integrity. Organic hulls are sold to local poultry farmers as feed..."',
        };
      case "ch4.schedule":
        return {
          mainQuestion: "What is your monthly production capacity and output schedule for the year?",
          subQuestions: [
            "What is the maximum daily and monthly capacity of your machines?",
            "How many kilograms/units will you produce each month to match seasonal sales demand?",
          ],
          placeholderExample:
            'e.g. "Installed machine capacity is 150 kg/day (3,600 kg/month). In Year 1, the plant will operate at 65% capacity (average 2,200 kg/month), scaling to 85% capacity in Year 2..."',
        };
      case "ch5.startup":
        return {
          mainQuestion: "What is your itemized Start-Up Capital / Pre-Operational Budget (in KES)?",
          subQuestions: [
            "Fixed Assets (Investment Capital): How much is needed for machinery, furniture, and premise renovation?",
            "Pre-Operating Expenses: How much is needed for business registration, KEBS/health permits, utility deposits, and initial marketing?",
            "Initial Working Capital: How much is needed for 2–3 months of raw materials, packaging, rent, and salaries?",
          ],
          placeholderExample:
            'e.g. "Start-Up Capital Summary:\n1. Machinery & Equipment: KES 226,000\n2. Premise Renovation & Fittings: KES 45,000\n3. Licenses & KEBS Permits: KES 29,750\n4. Initial Raw Materials & Packaging (2 months): KES 280,000\n5. Working Capital Reserve (Rent, Salaries, Utilities): KES 119,250\nTotal Start-Up Capital = KES 700,000."',
        };
      case "ch5.sources":
        return {
          mainQuestion: "Where will you obtain the total startup capital and on what terms?",
          subQuestions: [
            "How much is coming from personal savings and family equity (Amount & %)?",
            "How much is coming from a loan (e.g. Youth Fund, Uwezo Fund, SACCO, or Bank), and what is the interest rate and repayment period?",
          ],
          placeholderExample:
            'e.g. "Proposed Capital Financing (Total KES 700,000):\n- Owner Personal Savings: KES 300,000 (42.9%)\n- Family Contribution (Equity): KES 150,000 (21.4%)\n- Youth Enterprise Development Fund Loan: KES 250,000 (35.7%) repayable over 24 months at 8% p.a."',
        };
      case "ch5.assumptions":
        return {
          mainQuestion: "What realistic financial assumptions underpin your 3-year projections?",
          subQuestions: [
            "By what percentage will sales volume and operating costs grow in Years 2 and 3?",
            "What depreciation rate applies to machinery and equipment (e.g. 12.5% straight-line per year)?",
            "What loan interest rate, tax rate, and credit terms (cash vs. 14-day credit) are assumed?",
          ],
          placeholderExample:
            'e.g. "Key Assumptions:\n1. Sales volume grows by 20% in Year 2 and 20% in Year 3.\n2. Raw material and utility costs adjust by 5% annually for inflation.\n3. Machinery is depreciated at 12.5% per annum straight-line.\n4. 85% of sales are cash/M-Pesa; 15% are 14-day credit to supermarkets."',
        };
      case "ch5.cashflow":
        return {
          mainQuestion: "What are your projected Cash Inflows, Cash Outflows, and Net Cash Balances across Years 1–3?",
          subQuestions: [
            "Cash Inflows: Summarize Opening Capital/Loans and Cash from Sales for Year 1, Year 2, and Year 3.",
            "Cash Outflows: Summarize Equipment Purchases, Raw Materials, Salaries, Rent, Utilities, Marketing, and Loan Repayments.",
            "Net Cash & Closing Balance: Show that the business maintains a positive cash balance each period.",
          ],
          placeholderExample:
            'e.g. "Pro-Forma Cash Flow Summary (KES):\nYear 1: Total Cash Inflows = 5,452,000 | Total Cash Outflows = 4,610,000 | Net Closing Cash = 842,000.\nYear 2: Total Cash Inflows = 5,702,400 | Total Cash Outflows = 4,480,000 | Closing Cash = 2,064,400..."',
        };
      case "ch5.income":
        return {
          mainQuestion: "What is your Projected Income Statement (Profit & Loss) for Years 1, 2, and 3?",
          subQuestions: [
            "What is Annual Sales Revenue minus Cost of Goods Sold (COGS) = Gross Profit?",
            "What are Total Operating Expenses (Salaries, Rent, Electricity, Transport, Marketing, Depreciation, Loan Interest)?",
            "What is Net Profit Before Tax and Net Profit After Tax for Years 1, 2, and 3?",
          ],
          placeholderExample:
            'e.g. "Projected Income Statement (Year 1):\n- Sales Revenue: KES 4,752,000\n- Less Cost of Goods Sold: KES 3,120,000\n- Gross Profit: KES 1,632,000\n- Less Operating Expenses: KES 1,092,000\n- Net Profit Before Tax: KES 540,000..."',
        };
      case "ch5.balance":
        return {
          mainQuestion: "What is your Projected Balance Sheet (Assets, Liabilities, and Equity) for Years 1–3?",
          subQuestions: [
            "Assets: List Current Assets (Cash, Inventory, Debtors) and Fixed Assets (Machinery net of depreciation).",
            "Liabilities & Equity: List Current/Long-term Liabilities (Loan balance, Creditors) and Owner's Equity (Capital + Retained Earnings).",
            "Confirm that Total Assets = Total Liabilities + Owner's Equity.",
          ],
          placeholderExample:
            'e.g. "End of Year 1 Balance Sheet:\nTotal Current Assets (Cash + Stock): KES 980,000 | Net Fixed Assets: KES 237,000 | Total Assets = KES 1,217,000.\nLoan Liability: KES 135,000 | Owner Equity + Retained Profit: KES 1,082,000 | Total Liabilities & Equity = KES 1,217,000."',
        };
      case "ch5.breakeven":
        return {
          mainQuestion: "What is your Break-Even Point in units (kg) and in KES revenue?",
          subQuestions: [
            "What is your Selling Price per unit and Variable Cost per unit (giving Contribution Margin per unit)?",
            "What are your Total Fixed Costs per month and per year?",
            "Calculate Break-Even Units = Fixed Costs / (Selling Price - Variable Cost per unit).",
          ],
          placeholderExample:
            'e.g. "Selling Price = KES 180/kg | Variable Cost = KES 125/kg | Contribution Margin = KES 55/kg.\nMonthly Fixed Costs = KES 91,000.\nMonthly Break-Even Volume = 91,000 / 55 = 1,655 kg/month (KES 297,900/month)."',
        };
      case "ch5.ratios":
        return {
          mainQuestion: "What are your Gross Profit Margin, Net Profit Margin, and Return on Investment (ROI)?",
          subQuestions: [
            "Gross Profit Margin (%) = (Gross Profit / Sales Revenue) x 100",
            "Net Profit Margin (%) = (Net Profit / Sales Revenue) x 100",
            "Return on Investment (ROI %) = (Net Profit / Total Initial Investment) x 100",
          ],
          placeholderExample:
            'e.g. "Year 1 Financial Ratios:\n- Gross Profit Margin = (1,632,000 / 4,752,000) x 100 = 34.3%\n- Net Profit Margin = (540,000 / 4,752,000) x 100 = 11.4%\n- Return on Investment (ROI) = (540,000 / 700,000) x 100 = 77.1%."',
        };
      case "ch5.risks":
        return {
          mainQuestion: "What key business risks could affect your operations and how will you mitigate them?",
          subQuestions: [
            "Supply & Price Risk: How will you handle seasonal raw crop shortages or price spikes?",
            "Operational & Quality Risk: How will you prevent spoilage, contamination, or machine breakdown?",
            "Market & Financial Risk: How will you manage competition and cash flow?",
          ],
          placeholderExample:
            'e.g. "1. Seasonal Grain Shortage: Mitigated by signing fixed-price supply agreements with 2 farmer cooperatives and storing 2 months of dry buffer stock.\n2. Power Outages: Mitigated by scheduling milling during off-peak hours and maintaining a backup generator..."',
        };
    }
  }

  // =========================================================================
  // RESEARCH SECONDARY & FOOD SCIENCE FORMULATION (Chapters 1 - 5)
  // =========================================================================
  switch (sectionKey) {
    case "ch1.background":
      if (isTrade) {
        return {
          mainQuestion: "What is the nutritional and technical background of the raw materials and product you are formulating?",
          subQuestions: [
            "Global & Regional Context: Why are nutrient-dense composite foods or value-added products important in Sub-Saharan Africa?",
            "Kenyan Context: What nutritional deficiencies (e.g. protein-energy malnutrition, vitamin A or iron deficiency) or post-harvest losses exist in Kenya?",
            "Raw Material Potential: Why are your chosen local ingredients (e.g. orange-fleshed sweet potato, sorghum, amaranth, soy) ideal for solving this gap?",
          ],
          placeholderExample:
            'e.g. "Childhood undernutrition and micronutrient deficiencies remain major public health concerns in Kenya (KDHS, 2022). Local crops such as orange-fleshed sweet potato (rich in beta-carotene) and soybean (high-quality protein) offer an affordable raw material base for formulating nutrient-dense complementary foods..."',
        };
      }
      return {
        mainQuestion: "What is the background of this nutrition issue globally, in Sub-Saharan Africa, in Kenya, and in your study area?",
        subQuestions: [
          "Global & Regional Overview: What do WHO and UNICEF reports state about this nutrition indicator globally and in Sub-Saharan Africa?",
          "National Situation (Kenya): What are the national statistics in Kenya according to KDHS 2022 or Ministry of Health reports?",
          "Local Context: What is known about this nutrition issue in your specific county or target population?",
        ],
        placeholderExample:
          'e.g. "Globally, undernutrition contributes to nearly half of deaths among children under five (WHO, 2021). In Kenya, the 2022 Kenya Demographic and Health Survey (KDHS) indicates that 18% of children under five are stunted, with marked disparities between urban and rural counties..."',
      };

    case "ch1.problem":
      if (isTrade) {
        return {
          mainQuestion: "What specific nutritional deficiency, post-harvest loss, or commercial product gap does your formulation solve?",
          subQuestions: [
            "What is wrong with the traditional or currently available foods consumed by your target group (e.g. low protein, high cost, poor shelf life)?",
            "What evidence or Kenyan nutrition statistics show the severity of this problem?",
            "How does formulating and testing your new composite product directly address this gap?",
          ],
          placeholderExample:
            'e.g. "Most low-income households rely on plain maize porridge for infant weaning, which is high in bulk and low in protein and vitamin A. Meanwhile, commercial fortified baby cereals cost over KES 350 per 400g tin, making them unaffordable. There is a clear need to formulate an affordable, nutrient-dense flour using locally grown crops..."',
        };
      }
      return {
        mainQuestion: "What specific nutrition problem exists in your study area, and what gap in local summary knowledge does your study fill?",
        subQuestions: [
          "What do published national/county reports (KDHS 2022, KNBS, MOH) show about the magnitude of this problem?",
          "Who is most affected (e.g. children 6–23 months, pregnant women, adolescents) and what are the health consequences?",
          "Why is extracting and synthesizing secondary data on this topic needed to guide local nutrition action?",
        ],
        placeholderExample:
          'e.g. "According to KDHS 2022, stunting and sub-optimal infant feeding remain persistent challenges in arid and semi-arid counties. Despite the availability of national survey datasets, county health teams and TVET students lack a consolidated descriptive analysis linking dietary diversity indicators to stunting outcomes..."',
      };

    case "ch1.objectives":
      if (isTrade) {
        return {
          mainQuestion: "What are the General Objective and 3–4 Specific Objectives of your formulation project?",
          subQuestions: [
            "General Objective: State the overall aim of developing and evaluating your food product.",
            "Specific Objective 1: Formulate different blend ratios of the product from your raw materials.",
            "Specific Objective 2: Determine the proximate nutrient composition (moisture, protein, fat, ash, fiber, carbohydrate) of the formulated blends.",
            "Specific Objective 3: Evaluate the sensory acceptability (color, aroma, taste, texture, overall acceptability) and unit production cost.",
          ],
          placeholderExample:
            'e.g. "General Objective: To formulate and evaluate the nutritional and sensory quality of an orange-fleshed sweet potato, amaranth, and soybean composite porridge flour.\nSpecific Objectives:\n1. To formulate three composite flour blends at varying ratios (70:20:10, 60:25:15, and 50:30:20).\n2. To determine the proximate nutrient composition of the formulated blends.\n3. To evaluate the sensory acceptability of porridges prepared from the blends using a 9-point hedonic scale."',
        };
      }
      return {
        mainQuestion: "What are the General Objective and 3 Specific Objectives of your secondary research study?",
        subQuestions: [
          "General Objective: State the overall purpose of your study (starting with 'To assess...' or 'To examine...').",
          "Specific Objective 1: Which primary prevalence rate or baseline indicator will you determine from the secondary data?",
          "Specific Objective 2: Which feeding practice, maternal factor, or health service indicator will you examine?",
          levelSpec.isDiploma
            ? "Specific Objective 3: Which demographic comparisons and inferential statistical relationships will you evaluate?"
            : "Specific Objective 3: How will you compare the extracted indicators across demographic groups (e.g. age, sex, or rural vs. urban)?",
        ],
        placeholderExample:
          'e.g. "General Objective: To assess complementary feeding practices and nutritional status among children aged 6-23 months in Kenya using KDHS 2022 secondary data.\nSpecific Objectives:\n1. To determine the prevalence of stunting, wasting, and underweight among children aged 6-23 months.\n2. To establish the proportion of children meeting minimum meal frequency and minimum dietary diversity.\n3. To compare child nutritional status indicators across rural and urban households."',
      };

    case "ch1.questions":
      if (isTrade) {
        return {
          mainQuestion: "What 3–4 research questions (or hypotheses) correspond directly to your specific objectives?",
          subQuestions: [
            "Question 1: How do the different blend ratios affect the physical and processing properties of the product?",
            "Question 2: What is the proximate nutrient content (protein, fat, moisture, ash, energy) of each formulated blend compared to KEBS standards?",
            "Question 3: Which formulated blend achieves the highest sensory acceptability score and most affordable unit cost?",
          ],
          placeholderExample:
            'e.g. "1. What are the appropriate processing parameters for formulating composite flour from sweet potato, amaranth, and soybean?\n2. How does varying the blend ratio affect moisture, crude protein, fat, and ash content?\n3. Which composite blend is most preferred by sensory panelists in terms of taste, color, aroma, and texture?"',
        };
      }
      return {
        mainQuestion: "What 3 direct research questions match your 3 specific objectives word-for-word?",
        subQuestions: [
          "Research Question 1: Turn Specific Objective 1 into a clear question starting with 'What is...'",
          "Research Question 2: Turn Specific Objective 2 into a clear question starting with 'What proportion...' or 'To what extent...'",
          "Research Question 3: Turn Specific Objective 3 into a clear question comparing groups or testing relationships.",
        ],
        placeholderExample:
          'e.g. "1. What is the prevalence of stunting, wasting, and underweight among children aged 6-23 months in the KDHS 2022 report?\n2. What proportion of children aged 6-23 months meet the WHO minimum dietary diversity and meal frequency standards?\n3. How do child nutritional status indicators compare between rural and urban households?"',
      };

    case "ch1.justification":
      return {
        mainQuestion: "Who will benefit from your project findings and why is this study worth conducting now?",
        subQuestions: [
          "How will your findings benefit target households, mothers, or consumers?",
          "How will County Nutritionists, Ministry of Health officers, or agro-processors use your results?",
          "How does this work contribute to future TVET students and the Kenya Vision 2030 health/nutrition agenda?",
        ],
        placeholderExample:
          'e.g. "The findings of this study will provide County Nutrition Coordinators and Community Health Promoters with clear, accessible evidence to target nutrition education. It will also serve as a reference resource for TVET nutrition students..."',
      };

    case "ch1.scope":
      return {
        mainQuestion: "What are the exact boundaries (geographic area, target population, variables, or laboratory trials) of your project?",
        subQuestions: [
          "What geographic region or institution does your project cover?",
          "Which exact population group, dataset years (e.g. KDHS 2022), or raw material blends are included?",
          "What topics or populations are intentionally excluded (delimited) to keep the project focused?",
        ],
        placeholderExample:
          'e.g. "This study is delimited to secondary data extracted from the 2022 Kenya Demographic and Health Survey (KDHS) focusing on children aged 6-59 months and their mothers/caregivers. It focuses specifically on anthropometric and IYCF indicators..."',
      };

    case "ch1.limitations":
      return {
        mainQuestion: "What practical limitations or assumptions apply to your study, and how did you mitigate them?",
        subQuestions: [
          "What methodological or data constraints did you encounter (e.g. relying on pre-collected secondary survey variables, or laboratory equipment constraints)?",
          "How did you ensure your findings remain valid and reliable despite these limitations?",
          "What key assumptions were made during the study?",
        ],
        placeholderExample:
          'e.g. "Because the study relied on published secondary survey records, analysis was limited to variables already captured in the KDHS 2022 dataset. This was mitigated by cross-referencing complementary tables from KNBS and Ministry of Health reports..."',
      };

    case "ch1.terms":
      return {
        mainQuestion: "What are the clear operational definitions of the technical terms used in your project?",
        subQuestions: [
          "List 5 to 8 key technical terms appearing in your project title and objectives.",
          "Define how each term is specifically measured or applied in your study according to WHO, FAO, MOH, or KEBS standards.",
        ],
        placeholderExample:
          'e.g. "- Stunting: Height-for-age Z-score (HAZ) below minus two standard deviations (-2 SD) from the WHO Child Growth Standards median.\n- Minimum Dietary Diversity (MDD): Consumption of foods from at least 5 out of 8 defined food groups during the previous day.\n- Secondary Data: Official statistical data previously collected and published by recognized agencies such as KNBS and MOH."',
      };

    // ==================== CHAPTER 2 ====================
    case "ch2.intro":
      return {
        mainQuestion: "How is your Literature Review organized and what key themes does it cover?",
        subQuestions: [
          "State briefly what sections are covered in Chapter 2 (theoretical/nutritional background, empirical review by objective, conceptual framework, and research gaps).",
          "Mention the types of authoritative sources reviewed (WHO/FAO guidelines, KDHS reports, KEBS standards, textbooks, and peer-reviewed studies).",
        ],
        placeholderExample:
          'e.g. "This chapter reviews published literature relevant to the study objectives. It covers the theoretical and conceptual frameworks, empirical findings organized around each specific objective, and a summary of identified knowledge gaps..."',
      };

    case "ch2.theoretical":
    case "ch2.background":
      if (isTrade) {
        return {
          mainQuestion: "What is the nutritional composition and food science background of each raw material in your formulation?",
          subQuestions: [
            "What are the macronutrient and micronutrient profiles of each ingredient (e.g. protein, beta-carotene, iron, dietary fiber)?",
            "How do these ingredients complement each other nutritionally (e.g. cereal-legume amino acid complementation)?",
            "Are there any anti-nutritional factors (e.g. phytates, trypsin inhibitors) and how does processing reduce them?",
          ],
          placeholderExample:
            'e.g. "Cereal and tuber flours are rich in digestible carbohydrates but low in lysine, whereas legumes such as soybeans are rich in lysine and crude protein (36-40%). Blending orange-fleshed sweet potato with soybean and amaranth achieves a balanced amino acid and micronutrient profile..."',
        };
      }
      return {
        mainQuestion: "Which established nutrition theory or framework explains the variables in your study?",
        subQuestions: [
          "Describe the theoretical model guiding your study (e.g. the UNICEF Conceptual Framework of Malnutrition: immediate, underlying, and basic causes).",
          "How do immediate causes (inadequate dietary intake and disease) and underlying causes (household food insecurity, maternal care, health environment) connect to your study topic?",
        ],
        placeholderExample:
          'e.g. "This study is anchored on the UNICEF Conceptual Framework of Maternal and Child Undernutrition (UNICEF, 2020). The framework classifies the causes of malnutrition into immediate determinants (inadequate dietary intake and infectious disease), underlying determinants (household food security, feeding care practices, and health services), and basic socioeconomic determinants..."',
      };

    case "ch2.processing":
      return {
        mainQuestion: "What processing and preservation technologies are used for your product and how do they affect nutrient retention?",
        subQuestions: [
          "How do sorting, washing, blanching, drying, roasting, or milling affect food quality and shelf life?",
          "What drying or roasting temperatures preserve heat-sensitive vitamins while reducing moisture below 10-12%?",
          "What packaging materials protect the product against moisture uptake and lipid oxidation?",
        ],
        placeholderExample:
          'e.g. "Controlled cabinet drying at 55-60°C preserves beta-carotene retention in orange-fleshed sweet potato slices while lowering moisture content below 10% to inhibit microbial growth. Roasting soybeans deactivates trypsin inhibitors and improves protein digestibility..."',
      };

    case "ch2.conceptual":
      return {
        mainQuestion: "How do your Independent Variables relate to your Dependent Variable in your Conceptual Framework?",
        subQuestions: [
          "Independent Variables: List the 2–3 explanatory factors from your specific objectives (e.g. dietary diversity, meal frequency, maternal education, residence).",
          "Dependent Variable: State the main outcome variable (e.g. child nutritional status / stunting / wasting).",
          "Explain clearly in words how changes in the independent variables influence the dependent variable.",
        ],
        placeholderExample:
          'e.g. "In the conceptual framework for this study, the independent variables are complementary feeding practices (minimum dietary diversity, minimum meal frequency, and continued breastfeeding) and household residence (rural vs. urban). The dependent variable is child nutritional status measured by stunting (HAZ), wasting (WHZ), and underweight (WAZ)..."',
      };

    case "ch2.empirical":
    case "ch2.related":
      return {
        mainQuestion: "What have previous studies, KDHS surveys, and WHO/KEBS reports found regarding each of your specific objectives?",
        subQuestions: [
          "Theme 1 (Objective 1): What statistics and findings do past studies report on your first objective?",
          "Theme 2 (Objective 2): What do published studies and national surveys show regarding your second objective?",
          "Theme 3 (Objective 3): What have researchers found regarding your third objective? Include (Author, Year) citations throughout.",
        ],
        placeholderExample:
          'e.g. "According to KNBS and ICF (2023) in the 2022 KDHS report, national stunting among children under five declined from 26% in 2014 to 18% in 2022, yet rural areas still record 20% compared to 12% in urban areas. Similarly, only 31% of breastfed and non-breastfed children aged 6-23 months receive a minimum acceptable diet..."',
      };

    case "ch2.gap":
      return {
        mainQuestion: "What key conclusions emerge from the reviewed literature, and what specific gap does your project address?",
        subQuestions: [
          "Briefly summarize what the reviewed studies agree on.",
          "Point out what is missing locally (e.g. lack of a simplified county-level synthesis of recent KDHS 2022 figures, or lack of an affordable locally formulated blend).",
          "State how your project bridges that gap.",
        ],
        placeholderExample:
          'e.g. "While extensive national survey data exists in technical reports, there is limited simplified synthesis comparing updated 2022 feeding indicators with child anthropometric outcomes for TVET training and county nutrition education. This study bridges that gap..."',
      };

    // ==================== CHAPTER 3 ====================
    case "ch3.design":
      if (isTrade) {
        return {
          mainQuestion: "What experimental formulation design and blend ratios did you use?",
          subQuestions: [
            "What experimental design was used (e.g. Completely Randomized Design with 3 composite formulations and 1 control sample)?",
            "List the exact percentage ratios of each ingredient in Sample A, Sample B, Sample C, and the Control.",
            "Why were those specific ratios selected to meet nutritional targets?",
          ],
          placeholderExample:
            'e.g. "An experimental formulation design was used comprising three composite flour blends and one control (100% maize flour):\n- Formulation F1: 70% OFSP : 20% Soybean : 10% Amaranth\n- Formulation F2: 60% OFSP : 25% Soybean : 15% Amaranth\n- Formulation F3: 50% OFSP : 30% Soybean : 20% Amaranth..."',
        };
      }
      return {
        mainQuestion: "What research design did you use and why is it appropriate for your study?",
        subQuestions: [
          "State clearly that the study used a descriptive cross-sectional research design based on secondary data.",
          "Explain why a descriptive cross-sectional design fits your objectives.",
          "Explain the advantage of using verified national survey/facility records.",
        ],
        placeholderExample:
          'e.g. "This study adopted a descriptive cross-sectional research design utilizing secondary data. The design is appropriate because it enables the systematic description and comparison of nutrition indicators and feeding practices across population groups at a defined period using nationally representative KDHS 2022 records..."',
      };

    case "ch3.materials":
      return {
        mainQuestion: "Which raw materials, reagents, and processing/testing equipment were used, and where were they sourced?",
        subQuestions: [
          "Where were the raw food ingredients purchased and how were they selected for freshness and quality?",
          "Which processing machines (slicers, dryers, mills, mixers, scales, sealers) and laboratory apparatus were used?",
        ],
        placeholderExample:
          'e.g. "Fresh orange-fleshed sweet potatoes, dry soybeans, and amaranth grains were procured from certified vendors at the municipal market. Food processing was conducted in the institutional food science workshop using a stainless-steel cabinet dehydrator, hammer mill, digital analytical balance, and impulse sealer..."',
      };

    case "ch3.procedure":
      return {
        mainQuestion: "What step-by-step Standard Operating Procedure (SOP) did you follow to prepare and formulate the product?",
        subQuestions: [
          "Detail each unit operation in order: Sorting/Cleaning -> Washing/Peeling -> Blanching/Roasting -> Drying (temperature & time) -> Milling -> Sieving -> Blending -> Packaging.",
          "Include a simple process flow sequence showing inputs and outputs at each step.",
        ],
        placeholderExample:
          'e.g. "1. Sorting & Cleaning: Raw grains and tubers were sorted to remove foreign matter.\n2. Preparation: Sweet potatoes were washed, peeled, sliced (2mm), blanched for 3 min, and dried at 60°C for 8 hours.\n3. Roasting: Soybeans were cleaned, roasted at 130°C for 20 min, and dehulled.\n4. Milling & Blending: Ingredients were milled through a 0.5mm sieve and blended in predetermined ratios..."',
      };

    case "ch3.safety":
      return {
        mainQuestion: "What Quality Control and Food Safety (GMP / HACCP) measures were observed during processing?",
        subQuestions: [
          "What personal hygiene, equipment sanitization, and cross-contamination controls were followed?",
          "What were the Critical Control Points (CCPs) such as roasting temperature, final moisture content (<10%), and airtight packaging?",
        ],
        placeholderExample:
          'e.g. "Good Manufacturing Practices (GMP) and HACCP principles were strictly observed. All food contact surfaces were sanitized with food-grade sanitizer prior to processing. Critical control points included drying to <10% moisture to prevent mold growth and immediate hermetic sealing..."',
      };

    case "ch3.sensory_method":
      return {
        mainQuestion: "How did you conduct the Sensory Evaluation of your formulated samples?",
        subQuestions: [
          "How many panelists participated, and how were the samples coded (e.g. 3-digit random codes) and served?",
          "Which sensory attributes were scored (color/appearance, aroma, taste, texture/mouthfeel, overall acceptability) on the 9-point hedonic scale?",
          "What hygiene practices (e.g. rinsing mouth with clean water between samples) were observed?",
        ],
        placeholderExample:
          'e.g. "Sensory evaluation was conducted using 30 semi-trained panelists from the Department of Food Science and Nutrition. Porridge samples from each formulation were prepared under identical conditions, coded with 3-digit random numbers, and scored on a 9-point Hedonic scale (1 = Dislike Extremely to 9 = Like Extremely)..."',
      };

    case "ch3.lab_method":
      return {
        mainQuestion: "Which standard AOAC analytical methods were used to determine proximate composition?",
        subQuestions: [
          "State how Moisture (oven-drying method), Crude Protein (Kjeldahl method), Crude Fat (Soxhlet extraction), Total Ash (muffle furnace at 550°C), and Crude Fiber were determined.",
          "State how Total Carbohydrates (by difference) and Energy (Atwater factors: 4 kcal/g protein, 9 kcal/g fat, 4 kcal/g carbohydrate) were calculated.",
        ],
        placeholderExample:
          'e.g. "Proximate analysis was performed in triplicate according to Official AOAC (2019) methods: Moisture by oven drying at 105°C to constant weight; Crude Protein by micro-Kjeldahl (N x 6.25); Crude Fat by Soxhlet petroleum ether extraction; Ash by incineration in a muffle furnace at 550°C; and Carbohydrates by difference..."',
      };

    case "ch3.sources":
      return {
        mainQuestion: "Which official secondary reports, registers, or datasets did you extract your data from?",
        subQuestions: [
          "Name the exact published reports used (e.g. Kenya Demographic and Health Survey [KDHS] 2022, KNBS Economic Survey, MOH KHIS reports).",
          "State the publishing institutions (KNBS, Ministry of Health, ICF, WHO/UNICEF) and survey coverage.",
          "Specify which chapters or statistical tables in those reports provided the data for your objectives.",
        ],
        placeholderExample:
          'e.g. "This study utilized secondary data extracted from the 2022 Kenya Demographic and Health Survey (KDHS) Key Indicators and Main Report published by the Kenya National Bureau of Statistics (KNBS) and Ministry of Health (MOH), focusing on the Nutrition of Children and Women chapters..."',
      };

    case "ch3.variables":
      return {
        mainQuestion: "What are the exact dependent and independent variables/indicators extracted for your study?",
        subQuestions: [
          "Dependent Variable(s): How is the main nutrition outcome measured (e.g. Stunting HAZ < -2 SD, Wasting WHZ < -2 SD, Underweight WAZ < -2 SD)?",
          "Independent Variable(s): How are the dietary, demographic, or care indicators measured (e.g. Exclusive Breastfeeding 0-5m, Minimum Dietary Diversity 6-23m, Residence, Maternal Education)?",
        ],
        placeholderExample:
          'e.g. "1. Dependent Variables: Child stunting (% with HAZ < -2 SD), wasting (% with WHZ < -2 SD), and underweight (% with WAZ < -2 SD).\n2. Independent Variables: Minimum dietary diversity (% consuming >=5 of 8 food groups), minimum meal frequency, child age group, and household residence (urban vs. rural)..."',
      };

    case "ch3.verification":
      return {
        mainQuestion: "How did you systematically extract and verify the secondary data to ensure 100% accuracy?",
        subQuestions: [
          "Describe the structured Data Extraction Checklist/Sheet used to record indicator values, sample denominators (N), table numbers, and page numbers.",
          "Explain how you cross-checked every extracted number against the original published report tables to eliminate transcription errors.",
        ],
        placeholderExample:
          'e.g. "A structured Secondary Data Extraction Sheet (Appendix I) was designed aligned with the three specific objectives. Relevant indicator percentages and sample sizes were extracted from published KDHS 2022 tables and verified twice against the official PDF report..."',
      };

    case "ch3.analysis":
      if (levelSpec.isDiploma) {
        return {
          mainQuestion: "How did you organize and analyze the secondary data using descriptive and inferential statistics?",
          subQuestions: [
            "How were the extracted data tables organized in Microsoft Excel / SPSS?",
            "Which descriptive statistics were computed (frequencies, percentages, means, standard deviations)?",
            "Which inferential statistical tests (e.g. Chi-square test of association or t-test at p < 0.05) were used to test subgroup differences?",
          ],
          placeholderExample:
            'e.g. "Extracted secondary data was compiled in Microsoft Excel and analyzed using descriptive statistics (frequencies, percentages, and means) and inferential statistics (Chi-square test of association at a 95% confidence level, p < 0.05). Results are presented in summary tables..."',
        };
      }
      return {
        mainQuestion: "How did you organize and summarize the extracted data using simple descriptive statistics?",
        subQuestions: [
          "How were the extracted figures entered and organized in Microsoft Excel by study objective?",
          "Which descriptive measures were used (frequencies, percentages, percentage-point differences, and averages)?",
          "How are the results presented in Chapter 4 (clear frequency and comparison tables)?",
        ],
        placeholderExample:
          'e.g. "The verified secondary figures were organized by objective in Microsoft Excel and summarized using descriptive statistics (frequencies, percentages, and averages). The findings are presented in clear comparative tables in Chapter 4..."',
      };

    case "ch3.ethics":
      return {
        mainQuestion: "What ethical considerations were observed during this secondary research study?",
        subQuestions: [
          "Confirm that only publicly available, fully anonymized aggregate data was used (no human interviews or confidential patient names).",
          "Confirm that all data custodians (KNBS, MOH, DHS Program, WHO) and authors are truthfully cited in APA 7th format without data fabrication.",
        ],
        placeholderExample:
          'e.g. "This study used publicly accessible, anonymized aggregate data from official government survey reports; no primary human subjects were interviewed. All data custodians (KNBS, MOH, ICF) are duly acknowledged and cited in APA 7th Edition format..."',
      };

    // ==================== CHAPTER 4 ====================
    case "ch4.results":
    case "ch4.sensory_results":
      if (isTrade) {
        return {
          mainQuestion: "What were the sensory evaluation scores across your formulated blends?",
          subQuestions: [
            "Present the mean sensory scores (on the 9-point hedonic scale) for Color, Aroma, Taste, Texture, and Overall Acceptability for each blend (F1, F2, F3, Control).",
            "Which formulation scored highest in overall acceptability, and why did panelists prefer it?",
          ],
          placeholderExample:
            'e.g. "Table 4.1 Summary of Sensory Evaluation Scores (Mean on 9-Point Hedonic Scale):\n- Formulation F1 (70:20:10): Color 7.6 | Aroma 7.2 | Taste 7.4 | Texture 7.5 | Overall Acceptability 7.5\n- Formulation F2 (60:25:15): Color 8.1 | Aroma 7.9 | Taste 8.2 | Texture 8.0 | Overall Acceptability 8.1 (Most Preferred)\n- Formulation F3 (50:30:20): Color 7.1 | Aroma 6.8 | Taste 7.0 | Texture 7.2 | Overall Acceptability 7.0..."',
        };
      }
      return {
        mainQuestion: "What are the main descriptive findings extracted for Objective 1 and Objective 2?",
        subQuestions: [
          "Present the exact percentages, frequencies, and sample sizes (N) extracted from the secondary report for Objective 1.",
          "Present the exact figures extracted for Objective 2 in a clear, structured summary.",
          "Explain clearly in sentences what the highest and lowest figures in your table show.",
        ],
        placeholderExample:
          'e.g. "4.1.1 Nutritional Status Indicators (KDHS 2022):\nAccording to the extracted KDHS 2022 data, among children under five in Kenya, 18.0% are stunted (short for their age), 5.0% are wasted (thin for their height), and 10.0% are underweight. Stunting peaks among children aged 18-23 months (27.0%)..."',
      };

    case "ch4.proximate_results":
      return {
        mainQuestion: "What were the proximate nutrient composition results for each formulated blend?",
        subQuestions: [
          "Report Moisture (%), Crude Protein (%), Crude Fat (%), Total Ash (%), Crude Fiber (%), Carbohydrates (%), and Energy (kcal/100g) for each sample.",
          "How do these nutrient values compare against KEBS composite flour standards (e.g. moisture <12%, protein >=12-14%)?",
        ],
        placeholderExample:
          'e.g. "Table 4.2 Proximate Composition per 100g Dry Weight:\n- Formulation F1: Moisture 8.4% | Protein 13.2% | Fat 5.8% | Ash 2.6% | Fiber 3.1% | Carbohydrates 66.9% | Energy 372.6 kcal\n- Formulation F2: Moisture 8.1% | Protein 15.6% | Fat 6.9% | Ash 2.9% | Fiber 3.4% | Carbohydrates 63.1% | Energy 376.9 kcal (Meets KEBS KS EAS 779 standard)..."',
      };

    case "ch4.subgroup":
      return {
        mainQuestion: "How do the extracted secondary figures compare across demographic groups or geographic areas (Objective 3)?",
        subQuestions: [
          "Compare the indicator percentages across rural vs. urban residence, child sex (male vs. female), age groups, or wealth quintiles.",
          levelSpec.isDiploma
            ? "Report the percentage-point differences and inferential statistical test results (Chi-square or t-test p-values)."
            : "Highlight the percentage-point difference between the highest and lowest groups.",
        ],
        placeholderExample:
          'e.g. "Comparison by Residence and Demographic Subgroup (KDHS 2022):\n- Rural vs. Urban Stunting: Rural children experience 20.0% stunting compared to 12.0% among urban children (an 8.0 percentage-point disparity).\n- Minimum Acceptable Diet (6-23m): 37.0% of urban children meet the minimum acceptable diet compared to 28.0% in rural areas..."',
      };

    case "ch4.discussion":
      return {
        mainQuestion: "How do you interpret your findings and how do they compare with published literature and standards from Chapter 2?",
        subQuestions: [
          "For each objective, explain WHY the observed patterns occurred (nutritional, physiological, or socio-economic reasons).",
          "Compare your results directly with at least 2–3 studies or WHO/KEBS standards cited in Chapter 2—do your findings agree or differ?",
        ],
        placeholderExample:
          'e.g. "The finding that stunting rises sharply between 12 and 23 months (27%) aligns with UNICEF (2021) and KNBS & ICF (2023), reflecting the transition period when breast milk alone is no longer sufficient and children are introduced to low-nutrient cereal porridges..."',
      };

    case "ch4.cost":
      return {
        mainQuestion: "What is the unit production cost of your formulated product and is it affordable for target consumers?",
        subQuestions: [
          "Itemize the cost of raw ingredients, energy/processing, and packaging per batch and per retail unit (e.g. per 500g or 1kg packet).",
          "Compare your unit selling price with commercial brands on the market to demonstrate affordability.",
        ],
        placeholderExample:
          'e.g. "Unit Costing per 1 kg of Formulated Composite Flour (F2):\n- Orange-Fleshed Sweet Potato (600g): KES 45\n- Soybean (250g): KES 30\n- Amaranth (150g): KES 22\n- Milling, Drying & Packaging Pouch: KES 28\nTotal Unit Cost = KES 125/kg (compared to KES 320/kg for commercial brands)..."',
      };

    // ==================== CHAPTER 5 ====================
    case "ch5.summary":
      return {
        mainQuestion: "What is the concise summary of your major findings organized around each specific objective?",
        subQuestions: [
          "Briefly restate the purpose and methodology of your project in 2–3 sentences.",
          "Summarize the key quantitative finding for Objective 1, Objective 2, and Objective 3 without introducing new data.",
        ],
        placeholderExample:
          'e.g. "This study assessed complementary feeding practices and child nutritional status using KDHS 2022 secondary data. Key findings revealed that: (1) national child stunting stands at 18%, peaking at 18-23 months; (2) only 31% of children aged 6-23 months achieve a minimum acceptable diet; and (3) rural households experience higher stunting (20%) than urban households (12%)..."',
      };

    case "ch5.conclusions":
      return {
        mainQuestion: "What direct conclusions do you draw for each of your specific objectives?",
        subQuestions: [
          "Conclusion 1: What do you conclude regarding Specific Objective 1?",
          "Conclusion 2: What do you conclude regarding Specific Objective 2?",
          "Conclusion 3: What do you conclude regarding Specific Objective 3?",
        ],
        placeholderExample:
          'e.g. "Based on the study findings, it is concluded that:\n1. Chronic undernutrition (stunting) remains a significant public health challenge particularly during the second year of life.\n2. Sub-optimal dietary diversity is a primary driver of poor nutritional outcomes among children aged 6-23 months.\n3. Rural households face a disproportionate burden of child undernutrition compared to urban households."',
      };

    case "ch5.recommendations":
      return {
        mainQuestion: "What practical, actionable recommendations do you propose based on your conclusions?",
        subQuestions: [
          "Recommendation 1 (For Community / Households / Processors): What practical action should mothers, caregivers, or food processors take?",
          "Recommendation 2 (For County Health / Nutrition Officers): What targeted nutrition intervention should county teams prioritize?",
          "Recommendation 3 (For Policy / Standards): What policy support is needed?",
        ],
        placeholderExample:
          'e.g. "1. Community Health Promoters and County Nutritionists should intensify practical cooking demonstrations on enriching local maize porridge with affordable legumes (beans/soy) and vitamin-A rich vegetables.\n2. County Governments in rural areas should integrate biofortified crop promotion into Maternal and Child Health (MCH) clinics..."',
      };

    case "ch5.further_research":
      return {
        mainQuestion: "What 2–3 areas do you recommend for future studies by other researchers or TVET candidates?",
        subQuestions: [
          "What related question could not be answered within the scope of your study?",
          "What primary field survey, shelf-life trial, or county-specific assessment should future students conduct?",
        ],
        placeholderExample:
          'e.g. "1. Future researchers should conduct a primary household survey in specific sub-counties to assess seasonal variations in child dietary diversity.\n2. Further studies should evaluate the 6-month shelf-life stability and micronutrient retention of locally formulated composite flours..."',
      };

    // ==================== PRELIMINARY, REFERENCES & APPENDICES ====================
    case "prelim.abstract":
    case "prelim.executive_summary":
      return {
        mainQuestion: "Write a 150–250 word single-paragraph Executive Summary / Abstract of your entire project.",
        subQuestions: [
          "Sentences 1–2: State the background problem and the main objective of the project.",
          "Sentences 3–4: State the methodology (design, data sources, or formulation ratios/business setup).",
          "Sentences 5–7: State the key quantitative results/projections, main conclusion, and top recommendation.",
        ],
        placeholderExample:
          'e.g. "This study assessed complementary feeding practices and child nutritional status in Kenya using secondary data from the 2022 Kenya Demographic and Health Survey (KDHS). A descriptive cross-sectional design was employed to extract and analyze anthropometric and infant feeding indicators..."',
      };

    case "prelim.declaration":
      return {
        mainQuestion: "Complete your official KNEC Candidate Declaration and Supervisor Approval page.",
        subQuestions: [
          "Replace the bracketed placeholders with your Full Name, Admission Number, and Supervisor's Name.",
        ],
        placeholderExample:
          "Fill in your full name, admission number, date, and your supervisor's name in the standard KNEC declaration template.",
      };

    case "prelim.dedication":
      return {
        mainQuestion: "Who do you wish to dedicate this project work to?",
        subQuestions: [
          "Write a brief, sincere 2–3 sentence dedication to your family, parents, guardians, or mentors who supported your studies.",
        ],
        placeholderExample:
          'e.g. "This project report is dedicated to my beloved parents for their unwavering moral and financial support throughout my training."',
      };

    case "prelim.acknowledgements":
      return {
        mainQuestion: "Who do you wish to formally thank for supporting the completion of this project?",
        subQuestions: [
          "Acknowledge your project supervisor by name for academic guidance and moderation.",
          "Thank your department trainers, institution leadership, and data custodians (e.g. KNBS, MOH) or laboratory staff.",
        ],
        placeholderExample:
          'e.g. "I express my sincere gratitude to my supervisor [Supervisor Name] for tireless guidance and constructive feedback throughout this project. I also thank the Department of Nutrition and Dietetics trainers..."',
      };

    case "prelim.acronyms":
      return {
        mainQuestion: "List all technical abbreviations and acronyms used in your report in alphabetical order.",
        subQuestions: [
          "Include every acronym used in your chapters (e.g. AOAC, FAO, HAZ, IYCF, KDHS, KEBS, KNBS,KNEC, MDD, MOH, UNICEF, WAZ, WHO, WHZ).",
        ],
        placeholderExample:
          'e.g. "AOAC - Association of Official Analytical Chemists\nHAZ - Height-for-Age Z-Score\nIYCF - Infant and Young Child Feeding\nKDHS - Kenya Demographic and Health Survey\nKEBS - Kenya Bureau of Standards\nKNBS - Kenya National Bureau of Statistics\nMOH - Ministry of Health\nWHO - World Health Organization"',
      };

    case "references":
      return {
        mainQuestion: "List all sources cited in your chapters in alphabetical order using APA 7th Edition format.",
        subQuestions: [
          "Include every report, textbook, standard, and journal article cited in Chapters 1–4.",
          "Format each entry as: Author/Organization. (Year). Title of report or article. Publisher / Journal.",
          "Tip: Click 'NotebookLM Library' above and use 'Compile APA 7th References' to copy verified citations from your reference notebook.",
        ],
        placeholderExample:
          'e.g. "Kenya National Bureau of Statistics [KNBS] & ICF. (2023). Kenya Demographic and Health Survey 2022: Main Report. KNBS and ICF.\nMinistry of Health [MOH]. (2020). National Maternal, Infant and Young Child Nutrition Policy Guidelines. Government of Kenya.\nWorld Health Organization [WHO]. (2021). Indicators for assessing infant and young child feeding practices. WHO."',
      };

    case "app.datasources":
      return {
        mainQuestion: "Document your Secondary Data Extraction Sheet showing the exact tables and figures extracted.",
        subQuestions: [
          "List each indicator extracted, the source report name & year, the exact table/page number, the national/subgroup value (%), and sample size (N).",
        ],
        placeholderExample:
          'e.g. "1. Stunting (<5 years): Value = 18.0% | Source = KDHS 2022 Main Report, Table 11.1, Page 245.\n2. Wasting (<5 years): Value = 5.0% | Source = KDHS 2022 Main Report, Table 11.1, Page 245.\n3. Minimum Acceptable Diet (6-23m): Value = 31.0% | Source = KDHS 2022, Table 11.8..."',
      };

    case "app.sensory":
      return {
        mainQuestion: "Include the 9-Point Hedonic Sensory Evaluation Score Sheet used by panelists.",
        subQuestions: [
          "Show the instructions given to panelists, the 1–9 rating scale key, and the scoring table for Color, Aroma, Taste, Texture, and Overall Acceptability.",
        ],
        placeholderExample:
          'e.g. "SENSORY EVALUATION SCORE SHEET\nPanelist Code: _______ Date: _______\nScale: 9=Like Extremely, 8=Like Very Much, 7=Like Moderately, 6=Like Slightly, 5=Neither Like nor Dislike, 4=Dislike Slightly, 3=Dislike Moderately, 2=Dislike Very Much, 1=Dislike Extremely.\nSample Codes: [F1] [F2] [F3] [Control] - Rate Color, Aroma, Taste, Texture, Overall Acceptability."',
      };

    case "app.workplan":
      return {
        mainQuestion: "Outline your Project Work Plan / Implementation Schedule across the term.",
        subQuestions: [
          "List each major activity (Topic Approval, Chapter 1, Chapter 2, Chapter 3, Data Extraction/Lab Work & Chapter 4, Chapter 5 & Final Submission) and the weeks/months allocated.",
        ],
        placeholderExample:
          'e.g. "PROJECT WORK PLAN SCHEDULE:\n- Weeks 1-2: Topic Formulation and Supervisor Approval\n- Weeks 3-4: Drafting Chapter 1 (Introduction)\n- Weeks 5-6: Drafting Chapter 2 (Literature Review)\n- Weeks 7-8: Chapter 3 (Methodology) & Data Extraction / Formulation\n- Weeks 9-10: Chapter 4 (Results & Discussion)\n- Weeks 11-12: Chapter 5, Final Review, Printing & Submission"',
      };

    case "app.budget":
    case "app.invoices":
      return {
        mainQuestion: "Itemize the Project Budget / Supplier Quotations (in KES) required to complete this work.",
        subQuestions: [
          "List each item (e.g. internet data bundles for secondary research, raw ingredients/lab reagents, printing draft copies, final hardbound copies), quantity, unit cost, and total cost in KES.",
        ],
        placeholderExample:
          'e.g. "PROJECT BUDGET BREAKDOWN:\n1. Internet Data Bundles (Report Downloads & Literature Search): KES 1,500\n2. Stationery & Notebooks: KES 600\n3. Draft Printing for Supervisor Review (2 copies): KES 800\n4. Final Report Printing & Hardcover Binding (3 copies @ KES 700): KES 2,100\nTotal Budget = KES 5,000."',
      };

    default:
      return {
        mainQuestion: `What are your key points and evidence for ${sectionKey}?`,
        subQuestions: [
          "Write clear, well-structured paragraphs addressing the KNEC examination target shown below.",
          "Support your points with verified Kenyan figures or technical standards where applicable.",
        ],
        placeholderExample:
          "Write your section draft here in clear, concise academic language.",
      };
  }
}
