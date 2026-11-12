/**
 * TVET Hub KNEC Business Plan Specification Types
 * Derived from official KNEC Entrepreneurship syllabus notes and template.
 */

export interface BusinessPlanEquipmentItem {
  item: string;
  quantity: number;
  unitCost: number;
  supplier: string;
}

export interface BusinessPlanStaffItem {
  position: string;
  count: number;
  monthlySalary: number;
  duties: string;
  qualifications: string;
}

export interface BusinessPlanRawMaterialItem {
  material: string;
  monthlyQuantity: string;
  monthlyCost: number;
  supplier: string;
}

export interface BusinessPlanCompetitorItem {
  name: string;
  location: string;
  priceLevel: string;
  strengths: string;
  weaknesses: string;
}

export type BusinessPlanModel =
  | "consultancy"
  | "milling"
  | "beverages"
  | "clinical"
  | "manufacturing"
  | "food_service"
  | "agribusiness"
  | "retail"
  | "education"
  | "custom";

export interface InstitutionalCoursePlan {
  courseName: string;
  rationale: string;
  proposedLevel: string;
  deliveryModel: string;
  estimatedYear1Intake: number;
  proposedAnnualFeeKES: number;
  directCostPerStudentKES: number;
  startUpEquipmentBudgetKES: number;
  regulatoryStatus: string;
}

export function resolveBusinessPlanModel(
  specs: Partial<BusinessPlanSpecs> | null | undefined
): BusinessPlanModel {
  if (specs?.businessModel && specs.businessModel !== "custom") {
    return specs.businessModel;
  }
  const businessDetails = [specs?.industrySector, specs?.primaryProduct, specs?.productDescription]
    .filter(Boolean).join(" ").toLowerCase();
  if (/cater|meal prep|cloud kitchen|restaurant|salad|juice bar/.test(businessDetails)) return "food_service";
  if (/farm|crop|egg|poultry|microgreen|sweet potato|post-harvest/.test(businessDetails)) return "agribusiness";
  if (/retail|store|shop|grocery|supplement|supermarket/.test(businessDetails)) return "retail";
  if (/workshop|training|academy|course|school feeding|caregiver|iycf|demonstration/.test(businessDetails)) return "education";
  if (/consult|clinical nutrition|dietary meal|nutrition therap|patient|clinic|telehealth|domiciliary/.test(businessDetails)) return "consultancy";
  if (/juice|beverage|puree|herbal|tea|infusion/.test(businessDetails)) return "beverages";
  if (/mill|flour|food manufactur|porridge|snack|bar|oil|butter|honey|kefir|dairy|therapeutic feed|enteral/.test(businessDetails)) return "milling";

  if (specs?.businessModel) return specs.businessModel;
  return "custom";
}

export interface BusinessPlanSpecs {
  /** The selected venture model controls business-plan language and labels. */
  businessModel?: BusinessPlanModel;
  /** When true, indicates an institutional/corporate feasibility plan rather than a student examination plan. */
  isInstitutional?: boolean;
  /** Restricts access and selection exclusively to admin users. */
  adminOnly?: boolean;
  /** Institution-level decision brief fields, separate from student venture assumptions. */
  institutionalPlanObjective?: string;
  institutionalBackground?: string;
  institutionalCourses?: InstitutionalCoursePlan[];
  implementationHorizonMonths?: number;
  research?: {
    summary: string;
    sources: Array<{ title: string; url: string }>;
    searchedAt: string;
  };

  // 1. Enterprise Identity
  businessName: string;
  tagline: string;
  industrySector: string;
  formOfOwnership: "Sole Proprietorship" | "Partnership" | "Private Limited Company";
  registrationType: string;

  // 2. Candidate & Institutional Profile
  candidateName: string;
  admissionNumber: string;
  institutionName: string;
  supervisorName: string;
  course: string;
  level: "craft" | "diploma";
  ownerQualifications: string;

  // 3. Location & Physical Infrastructure
  county: string;
  townOrMarket: string;
  streetOrBuilding: string;
  postalAddress: string;
  email: string;
  phone: string;
  locationRationale: string;

  // 4. Products / Services & Pricing
  primaryProduct: string;
  productDescription: string;
  productPackaging: string;
  unitSellingPrice: number;
  unitCostOfProduction: number;
  monthlyProductionUnitsYear1: number;
  annualGrowthRateYear2: number;
  annualGrowthRateYear3: number;

  // 5. Market & Competitors
  targetCustomersDescription: string;
  totalMarketPopulation: string;
  projectedMarketSharePercentage: number;
  competitors: BusinessPlanCompetitorItem[];
  marketingPromotionBudgetMonthly: number;

  // 6. Machinery & Operations
  machinery: BusinessPlanEquipmentItem[];
  rawMaterials: BusinessPlanRawMaterialItem[];
  workshopSquareMeters: number;
  monthlyRent: number;

  // 7. Personnel & Staffing
  staffing: BusinessPlanStaffItem[];

  // 8. Capitalization & Overheads
  preOperationalCosts: number;
  workingCapitalBuffer: number;
  ownerEquityAmount: number;
  loanAmount: number;
  loanInterestRateAnnual: number;
  loanTenureMonths: number;
  monthlyOverheads: {
    rent: number;
    electricity: number;
    water: number;
    transport: number;
    marketing: number;
    stationeryMisc: number;
  };
}

/** Example starting points. Candidate-specific facts and quotations must be verified. */
export const BUSINESS_PLAN_PRESETS: Record<string, Partial<BusinessPlanSpecs>> = {
  imperial_college_new_courses: {
    businessModel: "education",
    isInstitutional: true,
    adminOnly: true,
    businessName: "Imperial College of Medical and Health Sciences — New Course Expansion Feasibility Plan",
    tagline: "Committed to Professional Excellence",
    industrySector: "Private Medical, Health Sciences and Applied Technology Education",
    formOfOwnership: "Private Limited Company",
    registrationType: "Existing institution; current legal, TVETA and programme-approval records to be verified before launch",
    institutionName: "Imperial College of Medical and Health Sciences (ICMHS)",
    ownerQualifications: "Existing institutional leadership, academic management and qualified programme faculty; individual credentials and regulator approvals to be verified in the implementation pack.",
    county: "Kiambu County",
    townOrMarket: "Thika Town",
    streetOrBuilding: "Thika Main Campus; confirm room allocations and campus-level capacity before implementation",
    postalAddress: "[Confirm ICMHS postal address]",
    email: "info@icmhs.co.ke",
    phone: "+254 719 223 223",
    locationRationale: "The feasibility case builds on ICMHS's existing Thika and Nakuru campus footprint, health-sciences identity, practical-training facilities and stated healthcare-sector partnerships. Campus capacity, room compliance and programme-specific approvals must be confirmed before launch.",
    primaryProduct: "Four-course academic expansion: Mortuary Science, Optometry, Orthopedic and Trauma Medicine, and Artificial Intelligence",
    productDescription: "A staged institutional expansion portfolio designed to test demand, regulatory readiness, staffing, equipment requirements, clinical placement capacity and financial viability before full programme rollout.",
    productPackaging: "Certificate, diploma or other approved delivery level per regulator and curriculum decision; day, evening or blended delivery to be validated course by course",
    unitSellingPrice: 7500,
    unitCostOfProduction: 2800,
    monthlyProductionUnitsYear1: 20,
    annualGrowthRateYear2: 0.2,
    annualGrowthRateYear3: 0.2,
    targetCustomersDescription: "KCSE school leavers, working healthcare assistants seeking progression, practicing health workers requiring specialization, technology-oriented learners, sponsors, employers and county or private health-service partners.",
    totalMarketPopulation: "Market size to be established through a documented enquiry survey, competitor review, employer interviews and regulator-verified programme demand evidence across Kiambu, Nairobi, Nakuru and adjacent counties.",
    projectedMarketSharePercentage: 3,
    competitors: [
      {
        name: "Existing accredited medical training colleges offering comparable programmes [Confirm locally]",
        location: "Thika, Nairobi, Nakuru and other target catchments",
        priceLevel: "[Collect current fee schedules before approval]",
        strengths: "Existing programme approvals, established faculty and clinical placement networks",
        weaknesses: "Potentially higher fees, limited intake flexibility or less integrated health-technology positioning",
      },
      {
        name: "Universities and specialist professional training providers [Confirm locally]",
        location: "Kenya-wide / online and blended options",
        priceLevel: "[Collect current fee schedules before approval]",
        strengths: "Brand recognition, specialist faculty and established qualification pathways",
        weaknesses: "Longer routes, higher entry thresholds or less accessible delivery for working learners",
      },
    ],
    marketingPromotionBudgetMonthly: 85000,
    machinery: [
      { item: "Mortuary science teaching laboratory: cadaveric anatomy models, embalming demonstration station, mortuary trolley, PPE and infection-control fixtures", quantity: 1, unitCost: 2850000, supplier: "Specialist medical-equipment suppliers [Quotation required]" },
      { item: "Optometry skills laboratory: slit lamp, trial lens sets, autorefractor/keratometer, tonometer, retinoscope, visual acuity and refraction equipment", quantity: 1, unitCost: 4200000, supplier: "Optometric equipment suppliers [Quotation required]" },
      { item: "Orthopedic and trauma skills lab: fracture fixation models, traction and splinting sets, orthopedic instruments, casting station and simulation manikins", quantity: 1, unitCost: 3600000, supplier: "Orthopedic simulation suppliers [Quotation required]" },
      { item: "Artificial intelligence and health-informatics lab: workstation computers, GPU-capable servers, networking, power backup and secure data environment", quantity: 1, unitCost: 3200000, supplier: "ICT systems integrators [Quotation required]" },
      { item: "Shared skills-lab consumables starter stock: gloves, masks, gowns, syringes, dressings, casts, lenses, disinfectants and simulation disposables", quantity: 1, unitCost: 1250000, supplier: "Medical consumables suppliers [Quotation required]" },
    ],
    rawMaterials: [
      { material: "Mortuary and infection-control consumables", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 65000, supplier: "Licensed medical consumables supplier [Quotation required]" },
      { material: "Optometry practice consumables and disposable diagnostic supplies", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 90000, supplier: "Optometric supplier [Quotation required]" },
      { material: "Orthopedic casting, splinting and trauma simulation consumables", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 110000, supplier: "Orthopedic supplier [Quotation required]" },
      { material: "AI lab cloud, software, data-governance and cybersecurity allowance", monthlyQuantity: "Monthly platform and support requirement", monthlyCost: 140000, supplier: "ICT provider [Quotation required]" },
    ],
    workshopSquareMeters: 650,
    monthlyRent: 0,
    staffing: [
      { position: "Programme Director / Academic Lead", count: 1, monthlySalary: 180000, duties: "Own the portfolio business case, academic quality, regulator engagement, launch gates and performance reporting.", qualifications: "Relevant postgraduate qualification and verified experience in health-sciences academic leadership [Confirm]." },
      { position: "Course Coordinators", count: 4, monthlySalary: 110000, duties: "Coordinate curriculum delivery, timetables, assessments, practicum readiness and course-level budgets.", qualifications: "Relevant professional qualification, teaching experience and regulator-recognized credentials [Confirm]." },
      { position: "Skills Laboratory Technologists / Technicians", count: 4, monthlySalary: 65000, duties: "Prepare practical sessions, maintain equipment, manage consumables, enforce safety and record utilization.", qualifications: "Relevant technical qualification and practical laboratory experience [Confirm]." },
      { position: "Admissions, Marketing and Industry Liaison Officers", count: 2, monthlySalary: 55000, duties: "Validate demand, manage enquiries, coordinate employer links and track conversion by course.", qualifications: "Diploma or degree in marketing, admissions, business or related field." },
      { position: "AI Lab Systems Administrator", count: 1, monthlySalary: 100000, duties: "Maintain hardware, networks, software access, data governance and learner support for the AI programme.", qualifications: "Relevant ICT/AI qualification and systems administration experience [Confirm]." },
    ],
    preOperationalCosts: 1800000,
    workingCapitalBuffer: 4200000,
    ownerEquityAmount: 7500000,
    loanAmount: 4000000,
    loanInterestRateAnnual: 14,
    loanTenureMonths: 36,
    monthlyOverheads: { rent: 0, electricity: 260000, water: 50000, transport: 70000, marketing: 85000, stationeryMisc: 80000 },
    institutionalPlanObjective: "Determine whether ICMHS should introduce the four proposed courses, in what sequence, at which campus, with what approval pathway, investment, staffing, intake and break-even conditions.",
    institutionalBackground: "ICMHS is presented on its official website as a registered private tertiary medical training institution regulated by TVETA, with Thika and Nakuru campuses, practical health-sciences training, and a stated focus on transformative, relevant medical and health training in Africa. These institutional claims should be supported in the final plan by current certificates, approvals, partnership records and internal management data.",
    implementationHorizonMonths: 18,
    institutionalCourses: [
      { courseName: "Mortuary Science", rationale: "Assess demand for structured mortuary operations, anatomy, embalming, bereavement support, infection prevention and compliant mortuary practice training.", proposedLevel: "Level and curriculum to be confirmed with the relevant regulator", deliveryModel: "Skills-lab demonstrations plus supervised field/practicum placement", estimatedYear1Intake: 25, proposedAnnualFeeKES: 95000, directCostPerStudentKES: 28000, startUpEquipmentBudgetKES: 2850000, regulatoryStatus: "Approval pathway, curriculum and practice-site requirements [Confirm locally]" },
      { courseName: "Optometry", rationale: "Assess demand for eye-care support and optometric training linked to community screening, refraction and supervised clinical practice.", proposedLevel: "Level and curriculum to be confirmed with the relevant regulator", deliveryModel: "Optometry skills laboratory plus supervised clinical placement", estimatedYear1Intake: 25, proposedAnnualFeeKES: 125000, directCostPerStudentKES: 36000, startUpEquipmentBudgetKES: 4200000, regulatoryStatus: "Approval pathway, professional-body requirements and clinical-site capacity [Confirm locally]" },
      { courseName: "Orthopedic and Trauma Medicine", rationale: "Assess demand for practical orthopedic, fracture-care, trauma-response and rehabilitation-support skills across health facilities and emergency-care settings.", proposedLevel: "Level and curriculum to be confirmed with the relevant regulator", deliveryModel: "Simulation-based skills training plus supervised clinical placement", estimatedYear1Intake: 25, proposedAnnualFeeKES: 135000, directCostPerStudentKES: 42000, startUpEquipmentBudgetKES: 3600000, regulatoryStatus: "Approval pathway, scope of practice and clinical placement requirements [Confirm locally]" },
      { courseName: "Artificial Intelligence for Health and Medical Applications", rationale: "Assess demand for applied AI, health informatics, data literacy and responsible automation skills supporting modern healthcare delivery.", proposedLevel: "Level and curriculum to be confirmed with the relevant regulator", deliveryModel: "Computer laboratory, project-based learning and industry-linked delivery", estimatedYear1Intake: 35, proposedAnnualFeeKES: 110000, directCostPerStudentKES: 24000, startUpEquipmentBudgetKES: 3200000, regulatoryStatus: "Curriculum ownership, certification route, data-protection and laboratory requirements [Confirm locally]" },
    ],
    research: {
      summary: "Initial institutional background taken from the official ICMHS website. Course demand, regulator requirements, competitor fees, staffing credentials, supplier costs, clinical placements and enrolment assumptions remain to be validated.",
      sources: [
        { title: "ICMHS — Mission, Vision and Values", url: "https://icmhs.co.ke/mission-and-values" },
        { title: "ICMHS — Official Home Page and Academic Programmes", url: "https://icmhs.co.ke/" },
        { title: "ICMHS — Faculty and Leadership", url: "https://icmhs.co.ke/faculty-and-leadership" },
      ],
      searchedAt: "2026-11-12",
    },
  },
  consultancy: {
    businessModel: "consultancy",
    businessName: "Afya Bora Nutrition & Dietetics Consultancy Practice",
    tagline: "Personalized Nutrition for Vibrant Living",
    industrySector: "Clinical Healthcare & Community Nutrition Services",
    formOfOwnership: "Sole Proprietorship",
    registrationType: "Business Names Registration Act (Cap 499, Laws of Kenya)",
    ownerQualifications: "Enter the candidate's verified nutrition qualification and current professional registration status.",
    locationRationale: "Describe access to intended clients and any nearby health facilities after confirming them locally.",
    primaryProduct: "Individualized Clinical Nutrition Therapy & Dietary Meal Plans",
    productDescription: "Comprehensive nutritional assessment, body composition analysis, diabetic diet management packages, and corporate wellness coaching.",
    productPackaging: "Individual 45-minute clinical consultation sessions with customized digital and printed meal guides",
    unitSellingPrice: 1500,
    unitCostOfProduction: 450,
    monthlyProductionUnitsYear1: 120, // 120 consultations per month
    annualGrowthRateYear2: 0.25,
    annualGrowthRateYear3: 0.2,
    targetCustomersDescription: "Patients referred with diabetes, hypertension, and gout; pregnant and lactating mothers; weight management and fitness clients.",
    totalMarketPopulation: "Enter a source-based estimate for the selected town or service catchment.",
    projectedMarketSharePercentage: 0,
    competitors: [],
    marketingPromotionBudgetMonthly: 12000,
    machinery: [
      { item: "Body composition analyzer (if required)", quantity: 1, unitCost: 65000, supplier: "[Quotation required]" },
      { item: "Digital weighing scale and stadiometer", quantity: 1, unitCost: 28000, supplier: "[Quotation required]" },
      { item: "Infant length board and baby scale (if required)", quantity: 1, unitCost: 22000, supplier: "[Quotation required]" },
      { item: "Laptop, printer, and licensed nutrition software", quantity: 1, unitCost: 55000, supplier: "[Quotation required]" },
      { item: "Consultation desk, chairs, and examination couch", quantity: 1, unitCost: 40000, supplier: "[Quotation required]" },
    ],
    rawMaterials: [
      { material: "Disposable examination sheets and sanitation supplies", monthlyQuantity: "[Confirm monthly usage]", monthlyCost: 3500, supplier: "[Quotation required]" },
      { material: "Printed diet diaries and client education materials", monthlyQuantity: "[Confirm monthly usage]", monthlyCost: 6000, supplier: "[Quotation required]" },
      { material: "Dietary demonstration models and portion measuring cups", monthlyQuantity: "[Confirm requirement]", monthlyCost: 2500, supplier: "[Quotation required]" },
    ],
    workshopSquareMeters: 45,
    monthlyRent: 22000,
    staffing: [
      {
        position: "Managing Director / Lead Nutritionist (Proprietor)",
        count: 1,
        monthlySalary: 40000,
        duties: "Overall business administration, clinical consultations, diet prescription, and financial oversight.",
        qualifications: "Diploma in Human Nutrition and Dietetics, KNDI Registered, Certificate in Entrepreneurship.",
      },
      {
        position: "Clinic Receptionist & Accounts Assistant",
        count: 1,
        monthlySalary: 16000,
        duties: "Patient booking, cashiering, telephone inquiries, social media updates, and records filing.",
        qualifications: "Certificate in Business Management / Secretarial Studies, Computer Proficiency.",
      },
    ],
    preOperationalCosts: 45000,
    workingCapitalBuffer: 65000,
    ownerEquityAmount: 190000,
    loanAmount: 130000,
    loanInterestRateAnnual: 12,
    loanTenureMonths: 24,
    monthlyOverheads: {
      rent: 22000,
      electricity: 3500,
      water: 1500,
      transport: 4000,
      marketing: 12000,
      stationeryMisc: 4000,
    },
  },

  milling: {
    businessModel: "milling",
    businessName: "NutriGrain Biofortified Porridge Mills",
    tagline: "Wholesome Nutrition for Thriving Families",
    industrySector: "Agro-processing & Nutrient-Dense Food Manufacturing",
    formOfOwnership: "Sole Proprietorship",
    registrationType: "Business Names Registration Act (Cap 499, Laws of Kenya)",
    ownerQualifications: "Diploma in Human Nutrition and Dietetics with expertise in food processing, grain fortification, and KEBS standards.",
    locationRationale: "Strategically located at Kitui Commercial Center along the main access road, close to local grain farmers and wholesale shops.",
    primaryProduct: "Fortified Composite Porridge Flour (Sweet Potato, Amaranth, Sorghum, Soybean)",
    productDescription: "Pre-cooked, nutrient-dense composite porridge flour enriched with provitamin A and high protein for weaning infants and family breakfast.",
    productPackaging: "500g and 1kg food-grade moisture-barrier laminated pouches with barcode and KEBS standardization mark",
    unitSellingPrice: 130, // KES per 1kg pouch
    unitCostOfProduction: 82,
    monthlyProductionUnitsYear1: 2500, // 2,500 kg per month
    annualGrowthRateYear2: 0.2,
    annualGrowthRateYear3: 0.2,
    targetCustomersDescription: "Mothers with infants and school children, primary boarding schools, health center convalescent canteens, and retail grocery shops.",
    totalMarketPopulation: "Estimated 60,000 consumers across Kitui Central sub-county.",
    projectedMarketSharePercentage: 15,
    competitors: [
      {
        name: "Unga Limited (Famila Brand)",
        location: "National Distribution via Supermarkets",
        priceLevel: "KES 165 per 1kg",
        strengths: "Well-established national brand, attractive packaging",
        weaknesses: "Expensive for low-income rural households, lacks local amaranth formulation",
      },
      {
        name: "Kitui Town Local Posho Mills",
        location: "Municipal Market",
        priceLevel: "KES 90 per 1kg (Loose)",
        strengths: "Low price point",
        weaknesses: "Unbranded, unhygienic open sacks, high moisture leading to aflatoxin risk",
      },
    ],
    marketingPromotionBudgetMonthly: 15000,
    machinery: [
      { item: "Commercial Stainless Steel Hammer Mill (15 HP Motor)", quantity: 1, unitCost: 145000, supplier: "Ndume Mills Ltd, Gilgil" },
      { item: "Continuous Band Pouch Sealer with Date Coder", quantity: 1, unitCost: 48000, supplier: "General Pack Machinery, Nairobi" },
      { item: "Digital Grain Moisture Meter (Draminski)", quantity: 1, unitCost: 32000, supplier: "Crop Nutrition Laboratory Services" },
      { item: "Precision Electronic Platform Weighing Scale (300kg)", quantity: 1, unitCost: 24000, supplier: "Avery Scales Kenya" },
      { item: "Heavy Duty Roasting Drum & Stainless Steel Tables", quantity: 1, unitCost: 38000, supplier: "Fabricated by local Jua Kali artisan" },
    ],
    rawMaterials: [
      { material: "Orange-Fleshed Sweet Potato dried chips", monthlyQuantity: "800 kg", monthlyCost: 48000, supplier: "Kitui Smallholder Farmers Co-op" },
      { material: "Clean Finger Millet & Sorghum grains", monthlyQuantity: "1,000 kg", monthlyCost: 65000, supplier: "Eastern Grain Traders" },
      { material: "Dehulled Soybeans & Amaranth seed", monthlyQuantity: "700 kg", monthlyCost: 52500, supplier: "Meru Grain Hub" },
      { material: "Printed laminated food-grade packaging bags (1kg)", monthlyQuantity: "2,500 pcs", monthlyCost: 25000, supplier: "Printpak Kenya Ltd" },
    ],
    workshopSquareMeters: 80,
    monthlyRent: 25000,
    staffing: [
      {
        position: "General Manager & Production Supervisor (Proprietor)",
        count: 1,
        monthlySalary: 38000,
        duties: "Formulation quality control, grain procurement, marketing management, and accounts supervision.",
        qualifications: "Diploma in Human Nutrition and Dietetics / Food Science, Certificate in Food Safety.",
      },
      {
        position: "Machine Operator & Miller",
        count: 1,
        monthlySalary: 18000,
        duties: "Roasting, destoning, milling machine operation, preventive maintenance, and cleaning.",
        qualifications: "Artisan Certificate in Mechanical / Electrical or 3 years milling experience.",
      },
      {
        position: "Packaging Attendant & Storekeeper",
        count: 1,
        monthlySalary: 15000,
        duties: "Accurate pouch weighing, vacuum band sealing, batch stamping, and finished goods inventory.",
        qualifications: "KCSE Certificate with Food Handler Medical Certificate.",
      },
    ],
    preOperationalCosts: 55000,
    workingCapitalBuffer: 95000,
    ownerEquityAmount: 240000,
    loanAmount: 180000,
    loanInterestRateAnnual: 12,
    loanTenureMonths: 24,
    monthlyOverheads: {
      rent: 25000,
      electricity: 14000,
      water: 2500,
      transport: 12000,
      marketing: 15000,
      stationeryMisc: 3500,
    },
  },

  beverages: {
    businessModel: "beverages",
    businessName: "NatureFresh Fruit Juices & Purees",
    tagline: "100% Pure Fruit Goodness, No Preservatives",
    industrySector: "Beverage Processing & Agribusiness Value Addition",
    formOfOwnership: "Sole Proprietorship",
    registrationType: "Business Names Registration Act (Cap 499, Laws of Kenya)",
    ownerQualifications: "Diploma in Human Nutrition and Dietetics with expertise in post-harvest handling and beverage hygiene.",
    locationRationale: "Located in Machakos Town, situated between mango/passion fruit farming hubs and high-density commercial consumer centers.",
    primaryProduct: "Cold-Pressed Pasteurized Mango-Passion Fruit Juice",
    productDescription: "100% pure natural juice bottled in 300ml and 500ml tamper-proof bottles, preserved through gentle pasteurization without artificial chemicals.",
    productPackaging: "300ml and 500ml PET food-grade bottles with safety seals and branded labels",
    unitSellingPrice: 70, // KES per 300ml bottle
    unitCostOfProduction: 38,
    monthlyProductionUnitsYear1: 3500, // 3,500 bottles/month
    annualGrowthRateYear2: 0.22,
    annualGrowthRateYear3: 0.2,
    targetCustomersDescription: "School children, college canteens, office workers, hospital cafeteria visitors, and event organizers.",
    totalMarketPopulation: "Approximately 50,000 residents and commuters in Machakos Town.",
    projectedMarketSharePercentage: 12,
    competitors: [
      {
        name: "Del Monte Kenya (Commercial juices)",
        location: "Supermarkets and retail stores",
        priceLevel: "KES 95 per 300ml",
        strengths: "Strong brand presence and long shelf-life",
        weaknesses: "Contains preservatives and high added cane sugar",
      },
      {
        name: "Local Street Fruit Juice Blenders",
        location: "Street corners & market stalls",
        priceLevel: "KES 50 per tumbler",
        strengths: "Freshly squeezed on demand",
        weaknesses: "Lack hygienic packaging, unpasteurized, no standard shelf life",
      },
    ],
    marketingPromotionBudgetMonthly: 14000,
    machinery: [
      { item: "Commercial Fruit Pulper & Juice Extractor", quantity: 1, unitCost: 110000, supplier: "FoodTech Equipment Ltd, Nairobi" },
      { item: "Stainless Steel Steam Pasteurization Tank (100L)", quantity: 1, unitCost: 85000, supplier: "Apex Engineering Works" },
      { item: "Semi-Automatic Bottle Filling & Capping Machine", quantity: 1, unitCost: 45000, supplier: "Packaging Machinery Kenya" },
      { item: "Commercial Display Chest Chiller / Refrigerator", quantity: 1, unitCost: 55000, supplier: "Ramtons Appliances" },
      { item: "Stainless Steel Washing Sinks & Preparation Tables", quantity: 1, unitCost: 35000, supplier: "Stainless Kitchens Ltd" },
    ],
    rawMaterials: [
      { material: "Fresh mangoes and passion fruits", monthlyQuantity: "1,500 kg", monthlyCost: 60000, supplier: "Machakos Fruit Farmers Network" },
      { material: "PET 300ml bottles with tamper-proof caps", monthlyQuantity: "3,500 pcs", monthlyCost: 28000, supplier: "Blowplast Kenya Ltd" },
      { material: "Water-resistant branded self-adhesive labels", monthlyQuantity: "3,500 pcs", monthlyCost: 14000, supplier: "Labels & Tags Kenya" },
    ],
    workshopSquareMeters: 60,
    monthlyRent: 20000,
    staffing: [
      {
        position: "Operations Manager (Proprietor)",
        count: 1,
        monthlySalary: 35000,
        duties: "Production supervision, food hygiene testing, institutional marketing, and bookkeeping.",
        qualifications: "Diploma in Human Nutrition and Dietetics / Food Technology.",
      },
      {
        position: "Juice Processing Assistant",
        count: 1,
        monthlySalary: 16000,
        duties: "Fruit washing, sorting, pulper extraction, pasteurization monitoring, and cleaning.",
        qualifications: "Certificate in Food and Beverage / Food Processing.",
      },
      {
        position: "Sales & Delivery Representative",
        count: 1,
        monthlySalary: 15000,
        duties: "Daily distribution to canteens and retail kiosks, customer relations, and cash returns.",
        qualifications: "KCSE Certificate with motorbike riding license.",
      },
    ],
    preOperationalCosts: 50000,
    workingCapitalBuffer: 80000,
    ownerEquityAmount: 220000,
    loanAmount: 160000,
    loanInterestRateAnnual: 12,
    loanTenureMonths: 24,
    monthlyOverheads: {
      rent: 20000,
      electricity: 8000,
      water: 3000,
      transport: 10000,
      marketing: 14000,
      stationeryMisc: 3000,
    },
  },
};

/**
 * Sanitizes and fills defaults for any partial or legacy BusinessPlanSpecs object
 * so that financial calculations, deterministic drafting, and exports never
 * encounter undefined, NaN, Infinity, or empty array crashes.
 */
export function normalizeBusinessPlanSpecs(
  raw: Partial<BusinessPlanSpecs> | null | undefined
): BusinessPlanSpecs {
  const s = raw || {};
  const str = (val: unknown, fallback: string) =>
    typeof val === "string" && val.trim().length > 0 && val.trim() !== "undefined"
      ? val.trim()
      : fallback;
  const num = (val: unknown, fallback: number, min = 0) => {
    const n = Number(val);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const level: "craft" | "diploma" = s.level === "craft" ? "craft" : "diploma";
  const course = str(
    s.course,
    level === "craft"
      ? "Craft Certificate in Nutrition and Dietetics"
      : "Diploma in Human Nutrition and Dietetics"
  );
  const county = str(s.county, "Kiambu County");
  const townOrMarket = str(s.townOrMarket, "Thika Town");
  const primaryProduct = str(s.primaryProduct, "Fortified Nutritional Products & Dietetic Services");
  const industrySector = str(s.industrySector, "Human Nutrition, Dietetics & Food Processing");
  const businessName = str(s.businessName, "TVET Hub Nutrition & Wellness Enterprise");
  const unitSellingPrice = num(s.unitSellingPrice, 500, 0);
  const unitCostOfProduction = num(s.unitCostOfProduction, Math.round(unitSellingPrice * 0.45), 0);
  const monthlyRent = num(s.monthlyRent ?? s.monthlyOverheads?.rent, 15000, 0);
  const marketingPromotionBudgetMonthly = num(
    s.marketingPromotionBudgetMonthly ?? s.monthlyOverheads?.marketing,
    8000,
    0
  );

  const machinery = Array.isArray(s.machinery) && s.machinery.length > 0
    ? s.machinery.map((m) => ({
        item: str(m?.item, "Operational Equipment & Tools"),
        quantity: Math.max(1, Math.round(num(m?.quantity, 1, 1))),
        unitCost: num(m?.unitCost, 25000, 0),
        supplier: str(m?.supplier, "Verified Local Equipment Supplier [Quotation required]"),
      }))
    : [
        {
          item: "Primary Nutrition Assessment / Processing Equipment",
          quantity: 1,
          unitCost: 85000,
          supplier: "Nairobi Commercial Equipment Suppliers [Quotation required]",
        },
        {
          item: "Digital Weighing Scales, Storage & Hygiene Fixtures",
          quantity: 1,
          unitCost: 35000,
          supplier: "Checked Local Hardware & Lab Suppliers [Quotation required]",
        },
      ];

  const rawMaterials = Array.isArray(s.rawMaterials) && s.rawMaterials.length > 0
    ? s.rawMaterials.map((r) => ({
        material: str(r?.material, "Primary Operating Inputs & Supplies"),
        monthlyQuantity: str(r?.monthlyQuantity, "Monthly batch requirement"),
        monthlyCost: num(r?.monthlyCost, 15000, 0),
        supplier: str(r?.supplier, "Verified Local Supplier [Confirm locally]"),
      }))
    : [
        {
          material: "Certified Nutritional Inputs & Consumables",
          monthlyQuantity: "Monthly operating requirement",
          monthlyCost: 25000,
          supplier: `${townOrMarket} Approved Suppliers [Confirm locally]`,
        },
        {
          material: "Food-Grade Packaging & Client Documentation Materials",
          monthlyQuantity: "500 units",
          monthlyCost: 10000,
          supplier: "Packaging & Print Vendors [Quotation required]",
        },
      ];

  const staffing = Array.isArray(s.staffing) && s.staffing.length > 0
    ? s.staffing.map((st) => ({
        position: str(st?.position, "Operations & Nutrition Lead"),
        count: Math.max(1, Math.round(num(st?.count, 1, 1))),
        monthlySalary: num(st?.monthlySalary, 25000, 0),
        duties: str(st?.duties, "Operations supervision, quality assurance, customer service, and financial records."),
        qualifications: str(st?.qualifications, `${course} or relevant technical qualification.`),
      }))
    : [
        {
          position: "Managing Director / Lead Nutritionist",
          count: 1,
          monthlySalary: 30000,
          duties: "Overall enterprise management, technical quality oversight, client service, and financial control.",
          qualifications: `${course}, registered with KNDI.`,
        },
        {
          position: "Operations & Customer Support Assistant",
          count: 1,
          monthlySalary: 16000,
          duties: "Daily operational preparation, hygiene maintenance, packaging/booking support, and dispatch.",
          qualifications: "Certificate in Nutrition, Food Processing, or Business Administration.",
        },
      ];

  const competitors = Array.isArray(s.competitors) && s.competitors.length > 0
    ? s.competitors.map((c) => ({
        name: str(c?.name, "Established Local Commercial Providers [Confirm locally]"),
        location: str(c?.location, `${townOrMarket} Commercial Center`),
        priceLevel: str(c?.priceLevel, `KES ${Math.round(unitSellingPrice * 1.15).toLocaleString("en-KE")} per unit [Confirm locally]`),
        strengths: str(c?.strengths, "Existing customer visibility and established premises"),
        weaknesses: str(c?.weaknesses, "Higher pricing and less personalized nutritionist oversight"),
      }))
    : [
        {
          name: "Established Commercial Providers / Brands [Confirm locally]",
          location: `${townOrMarket} Commercial Center`,
          priceLevel: `KES ${Math.round(unitSellingPrice * 1.2).toLocaleString("en-KE")} per unit [Confirm locally]`,
          strengths: "Established market visibility and existing distribution networks",
          weaknesses: "Higher pricing and less personalized nutrition formulation or client support",
        },
        {
          name: "Informal Uncertified Local Vendors [Confirm locally]",
          location: `${townOrMarket} Open-Air / Estate Outlets`,
          priceLevel: `KES ${Math.round(unitSellingPrice * 0.8).toLocaleString("en-KE")} per unit [Confirm locally]`,
          strengths: "Low price point and convenient neighborhood proximity",
          weaknesses: "Inconsistent hygiene, unstandardized portions/formulations, and lack of nutritionist oversight",
        },
      ];

  const formOfOwnership: BusinessPlanSpecs["formOfOwnership"] =
    s.formOfOwnership === "Partnership" || s.formOfOwnership === "Private Limited Company"
      ? s.formOfOwnership
      : "Sole Proprietorship";

  return {
    businessModel: resolveBusinessPlanModel(s),
    isInstitutional: s.isInstitutional === true,
    adminOnly: s.adminOnly === true,
    institutionalPlanObjective: s.institutionalPlanObjective,
    institutionalBackground: s.institutionalBackground,
    institutionalCourses: Array.isArray(s.institutionalCourses)
      ? s.institutionalCourses.map((course) => ({
          courseName: str(course?.courseName, "Proposed Course [Name required]"),
          rationale: str(course?.rationale, "Course demand and strategic fit require validation."),
          proposedLevel: str(course?.proposedLevel, "Level and curriculum to be confirmed"),
          deliveryModel: str(course?.deliveryModel, "Blended classroom, skills laboratory and supervised practice"),
          estimatedYear1Intake: Math.max(0, Math.round(num(course?.estimatedYear1Intake, 0, 0))),
          proposedAnnualFeeKES: num(course?.proposedAnnualFeeKES, 0, 0),
          directCostPerStudentKES: num(course?.directCostPerStudentKES, 0, 0),
          startUpEquipmentBudgetKES: num(course?.startUpEquipmentBudgetKES, 0, 0),
          regulatoryStatus: str(course?.regulatoryStatus, "Approval pathway and scope of practice [Confirm locally]"),
        }))
      : undefined,
    implementationHorizonMonths: Math.max(1, Math.round(num(s.implementationHorizonMonths, 12, 1))),
    research: s.research,
    businessName,
    tagline: str(s.tagline, "Evidence-Based Nutrition for Everyday Wellness"),
    industrySector,
    formOfOwnership,
    registrationType: str(s.registrationType, "Business Names Registration Act (Cap 499, Laws of Kenya)"),
    candidateName: str(s.candidateName, "[Candidate Name]"),
    admissionNumber: str(s.admissionNumber, "[Index / Admission Number]"),
    institutionName: str(s.institutionName, "[Institution Name]"),
    supervisorName: str(s.supervisorName, "[Supervisor Name]"),
    course,
    level,
    ownerQualifications: str(
      s.ownerQualifications,
      `${course}, registered with the Kenya Nutritionists and Dietitians Institute (KNDI)`
    ),
    county,
    townOrMarket,
    streetOrBuilding: str(s.streetOrBuilding, "Commercial Center Ground Floor Premises [Confirm exact plot/street locally]"),
    postalAddress: str(s.postalAddress, "100-00100"),
    email: str(s.email, "info@nutritionventure.co.ke"),
    phone: str(s.phone, "+254 700 000 000"),
    locationRationale: str(
      s.locationRationale,
      `Accessible commercial location within ${townOrMarket}, ${county} with reliable road transport, potable water, electricity, and proximity to target customers [Confirm site specifics locally].`
    ),
    primaryProduct,
    productDescription: str(
      s.productDescription,
      `${primaryProduct} formulated and delivered under strict hygiene and nutrition quality standards to serve households and institutions in ${townOrMarket}, ${county}.`
    ),
    productPackaging: str(s.productPackaging, "Standardized food-grade or professional service units with clear nutrition labeling"),
    unitSellingPrice,
    unitCostOfProduction,
    monthlyProductionUnitsYear1: Math.max(1, Math.round(num(s.monthlyProductionUnitsYear1, 300, 1))),
    annualGrowthRateYear2: num(s.annualGrowthRateYear2, 0.2, 0),
    annualGrowthRateYear3: num(s.annualGrowthRateYear3, 0.25, 0),
    targetCustomersDescription: str(
      s.targetCustomersDescription,
      `Health-conscious households, mothers and caregivers, working professionals, and local institutions in ${townOrMarket} and ${county}`
    ),
    totalMarketPopulation: str(s.totalMarketPopulation, "25,000+ target catchment residents and institutional buyers"),
    projectedMarketSharePercentage: num(s.projectedMarketSharePercentage, 6, 0.1),
    competitors,
    marketingPromotionBudgetMonthly,
    machinery,
    rawMaterials,
    workshopSquareMeters: Math.max(6, Math.round(num(s.workshopSquareMeters, 35, 6))),
    monthlyRent,
    staffing,
    preOperationalCosts: num(s.preOperationalCosts, 40000, 0),
    workingCapitalBuffer: num(s.workingCapitalBuffer, 75000, 0),
    ownerEquityAmount: num(s.ownerEquityAmount, 0, 0),
    loanAmount: num(s.loanAmount, 0, 0),
    loanInterestRateAnnual: num(s.loanInterestRateAnnual, 12, 0),
    loanTenureMonths: Math.max(1, Math.round(num(s.loanTenureMonths, 24, 1))),
    monthlyOverheads: {
      rent: monthlyRent,
      electricity: num(s.monthlyOverheads?.electricity, 4000, 0),
      water: num(s.monthlyOverheads?.water, 1500, 0),
      transport: num(s.monthlyOverheads?.transport, 5000, 0),
      marketing: marketingPromotionBudgetMonthly,
      stationeryMisc: num(s.monthlyOverheads?.stationeryMisc, 2500, 0),
    },
  };
}
