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
  durationSemesters?: number;
  feePerSemesterKES?: number;
  /** Legacy field retained for older saved drafts. New institutional presets use feePerSemesterKES. */
  proposedAnnualFeeKES?: number;
  directCostPerStudentKES?: number;
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
  if (/retail|store|shop|grocery|supplement|nutraceutical|supermarket|healthy u|wellness store|organic store|vitamin|herbal store/.test(businessDetails)) return "retail";
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
  /** Student-authored preliminary-page content. Optional for older drafts. */
  dedicationText?: string;
  acknowledgementsText?: string;

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

/** Internal ICMHS equipment schedule supplied in OPTOMETRY.xlsx. Amounts use the
 * workbook's VAT-inclusive totals; supplier quotations and zero-cost lines remain
 * open verification items. */
const ICMHS_INTERNAL_EQUIPMENT: BusinessPlanEquipmentItem[] = [
  { item: "Mortuary — Biosafety Cabinet", quantity: 1, unitCost: 1914000, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Centrifuge", quantity: 2, unitCost: 28420, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Incubators", quantity: 2, unitCost: 70412, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Hemocytometers", quantity: 5, unitCost: 8410, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — First Aid Kits", quantity: 3, unitCost: 16240, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Waste Disposal Bin", quantity: 10, unitCost: 3248, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Anaerobic Jars", quantity: 1, unitCost: 139861.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Body Bags", quantity: 5, unitCost: 4408, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Cleaning Brushes and Mops", quantity: 10, unitCost: 2958, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Mortuary Trolley", quantity: 1, unitCost: 14128.8, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Stainless-Steel Dissection Table", quantity: 1, unitCost: 487200, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Autopsy Tools Set", quantity: 1, unitCost: 139327.6, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Embalming Machine", quantity: 1, unitCost: 278400, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Sprayers", quantity: 5, unitCost: 2494, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Waste Disposal Bins", quantity: 5, unitCost: 3248, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Lighting Equipment", quantity: 5, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Measuring Tape", quantity: 10, unitCost: 2900, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Biohazard and Restricted-Area Signage", quantity: 10, unitCost: 2900, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Autopsy Table", quantity: 1, unitCost: 168849.6, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Oscillating Powered Saw", quantity: 1, unitCost: 280128.4, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Measuring Tools", quantity: 10, unitCost: 1160, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Needle and Thread", quantity: 5, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Organ Containers", quantity: 5, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Documentation Forms", quantity: 100, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Digital Camera", quantity: 2, unitCost: 34800, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Body Lifting Device", quantity: 1, unitCost: 541975.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Evidence Kits", quantity: 0, unitCost: 0, supplier: "Internal schedule — quantity and cost required" },
  { item: "Mortuary — Anatomical Models", quantity: 5, unitCost: 116388.6, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Autopsy Saws", quantity: 5, unitCost: 46794.4, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Arterial Embalming Machine", quantity: 1, unitCost: 359194, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Scalpel Handles and Blades", quantity: 10, unitCost: 1044, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Aneurysm Hooks and Needles", quantity: 5, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Arterial Tubes and Cannula", quantity: 5, unitCost: 3190, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Vein Drain Tubes", quantity: 25, unitCost: 0, supplier: "Internal schedule — cost required" },
  { item: "Mortuary — Suture Needles", quantity: 5, unitCost: 8259.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Forceps", quantity: 10, unitCost: 9674.4, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Scissors", quantity: 10, unitCost: 2552, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Sutures", quantity: 10, unitCost: 2459.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Pesticides", quantity: 1, unitCost: 10324, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Sodium Nitrate", quantity: 5, unitCost: 14059.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Plastic Sheeting", quantity: 1, unitCost: 11704.4, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Portable Hand Pump", quantity: 1, unitCost: 5011.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Aspirator", quantity: 1, unitCost: 490680, supplier: "Internal equipment schedule — quotation required" },
  { item: "Mortuary — Waterproof Aprons", quantity: 25, unitCost: 2088, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Manual Phoropter", quantity: 1, unitCost: 468060, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Streak Retinoscope", quantity: 1, unitCost: 130442, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Direct Ophthalmoscope", quantity: 1, unitCost: 121104, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Binocular Indirect Ophthalmoscope", quantity: 1, unitCost: 266800, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Slit Lamp Biomicroscope", quantity: 1, unitCost: 517360, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Manual Keratometer", quantity: 1, unitCost: 495146, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Goldmann Applanation Tonometer", quantity: 1, unitCost: 159998.8, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Non-Contact or Rebound Tonometer", quantity: 1, unitCost: 1563680, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Standard Trial Lens Sets and Frames", quantity: 1, unitCost: 75643.6, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Auto-Refractor / Keratometer", quantity: 1, unitCost: 835200, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Manual Lensmeter", quantity: 1, unitCost: 159024.4, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Digital Lensmeter", quantity: 1, unitCost: 1606600, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Synoptophore", quantity: 1, unitCost: 757248, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Ishihara Colour Vision Plates", quantity: 1, unitCost: 49590, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Farnsworth-Munsell D-15 Test", quantity: 1, unitCost: 100456, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Snellen and LogMAR Visual Acuity Charts", quantity: 1, unitCost: 70528, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Near Vision Test Cards", quantity: 1, unitCost: 40217.2, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Worth 4-Dot Flashing Light System", quantity: 1, unitCost: 38280, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Cover Test Paddles and Muscle Targets", quantity: 1, unitCost: 41296, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Schiötz Tonometer", quantity: 1, unitCost: 41296, supplier: "Internal equipment schedule — quotation required" },
  { item: "Optometry — Pupillary Distance Meters / Rules", quantity: 1, unitCost: 76664.4, supplier: "Internal equipment schedule — quotation required" },
];

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
    streetOrBuilding: "ICMHS Thika Main Campus, approximately 600 metres from Thika Level 5 Hospital; confirm exact plot/street address and room allocations",
    postalAddress: "[Confirm ICMHS postal address]",
    email: "info@icmhs.co.ke",
    phone: "+254 719 223 223",
    locationRationale: "All six proposed programme offerings are planned for the ICMHS Thika Main Campus in Thika Town. The official campus page places the main campus approximately 600 metres from Thika Level 5 Hospital and describes modern lecture halls, science and skills laboratories, digital learning facilities and access to clinical attachments. Exact plot/street and postal details, room capacity and programme-specific approvals must be confirmed before launch.",
    primaryProduct: "Six-offering academic expansion: Mortuary Science Certificate and Diploma, Optometry Diploma, Orthopedic and Trauma Medicine Certificate and Diploma, and Data Science Diploma",
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
      ...ICMHS_INTERNAL_EQUIPMENT,
      { item: "Orthopedic and trauma skills lab: fracture fixation models, traction and splinting sets, orthopedic instruments, casting station and simulation manikins", quantity: 1, unitCost: 3600000, supplier: "Orthopedic simulation suppliers [Quotation required]" },
      { item: "Data Science and health-informatics lab: workstation computers, GPU-capable servers, networking, power backup and secure data environment", quantity: 1, unitCost: 3200000, supplier: "ICT systems integrators [Quotation required]" },
      { item: "Shared skills-lab consumables starter stock: gloves, masks, gowns, syringes, dressings, casts, lenses, disinfectants and simulation disposables", quantity: 1, unitCost: 1250000, supplier: "Medical consumables suppliers [Quotation required]" },
    ],
    rawMaterials: [
      { material: "Mortuary and infection-control consumables", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 65000, supplier: "Licensed medical consumables supplier [Quotation required]" },
      { material: "Optometry practice consumables and disposable diagnostic supplies", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 90000, supplier: "Optometric supplier [Quotation required]" },
      { material: "Orthopedic casting, splinting and trauma simulation consumables", monthlyQuantity: "Planning allowance for practical cohorts", monthlyCost: 110000, supplier: "Orthopedic supplier [Quotation required]" },
      { material: "Data Science lab cloud, software, data-governance and cybersecurity allowance", monthlyQuantity: "Monthly platform and support requirement", monthlyCost: 140000, supplier: "ICT provider [Quotation required]" },
    ],
    workshopSquareMeters: 650,
    monthlyRent: 0,
    staffing: [
      { position: "Programme Director / Academic Lead", count: 1, monthlySalary: 180000, duties: "Own the portfolio business case, academic quality, regulator engagement, launch gates and performance reporting.", qualifications: "Relevant postgraduate qualification and verified experience in health-sciences academic leadership [Confirm]." },
      { position: "Course Coordinators", count: 4, monthlySalary: 110000, duties: "Coordinate curriculum delivery, timetables, assessments, practicum readiness and course-level budgets.", qualifications: "Relevant professional qualification, teaching experience and regulator-recognized credentials [Confirm]." },
      { position: "Skills Laboratory Technologists / Technicians", count: 4, monthlySalary: 65000, duties: "Prepare practical sessions, maintain equipment, manage consumables, enforce safety and record utilization.", qualifications: "Relevant technical qualification and practical laboratory experience [Confirm]." },
      { position: "Admissions, Marketing and Industry Liaison Officers", count: 2, monthlySalary: 55000, duties: "Validate demand, manage enquiries, coordinate employer links and track conversion by course.", qualifications: "Diploma or degree in marketing, admissions, business or related field." },
      { position: "Data Science Lab Systems Administrator", count: 1, monthlySalary: 100000, duties: "Maintain hardware, networks, software access, data governance and learner support for the Data Science programme.", qualifications: "Relevant data science, ICT or systems qualification and systems administration experience [Confirm]." },
    ],
    preOperationalCosts: 1800000,
    workingCapitalBuffer: 4200000,
    ownerEquityAmount: 7500000,
    loanAmount: 4000000,
    loanInterestRateAnnual: 14,
    loanTenureMonths: 36,
    monthlyOverheads: { rent: 0, electricity: 260000, water: 50000, transport: 70000, marketing: 85000, stationeryMisc: 80000 },
    institutionalPlanObjective: "Determine whether ICMHS should introduce the six proposed programme offerings, in what sequence, at the Thika Main Campus, with what approval pathway, investment, staffing, intake and break-even conditions.",
    institutionalBackground: "ICMHS is presented on its official website as a registered private tertiary medical training institution regulated by TVETA. The proposed programmes are planned for the Thika Main Campus in Thika Town, which the official campus page places approximately 600 metres from Thika Level 5 Hospital and describes as having modern lecture halls, science and skills laboratories, digital learning facilities and access to clinical attachments. Exact address, room capacity, approvals and partnership records should be verified in the implementation pack.",
    implementationHorizonMonths: 18,
    institutionalCourses: [
      { courseName: "Mortuary Science — Certificate (Level 5)", rationale: "Assess demand for a Level 5 certificate pathway covering structured mortuary operations, anatomy, embalming, bereavement support, infection prevention and compliant mortuary practice.", proposedLevel: "Certificate — Level 5", deliveryModel: "Skills-lab demonstrations plus supervised field/practicum placement", estimatedYear1Intake: 25, durationSemesters: 5, feePerSemesterKES: 28000, startUpEquipmentBudgetKES: 6481981.4, regulatoryStatus: "Certificate approval pathway, curriculum and practice-site requirements [Confirm locally]" },
      { courseName: "Mortuary Science — Diploma (Level 6)", rationale: "Assess demand for a Level 6 diploma pathway providing advanced mortuary operations, anatomy, embalming, bereavement support, infection prevention and compliant mortuary practice competencies.", proposedLevel: "Diploma — Level 6", deliveryModel: "Skills-lab demonstrations plus supervised field/practicum placement", estimatedYear1Intake: 20, durationSemesters: 8, feePerSemesterKES: 34000, startUpEquipmentBudgetKES: 6481981.4, regulatoryStatus: "Diploma approval pathway, curriculum and practice-site requirements [Confirm locally]" },
      { courseName: "Optometry — Diploma (Level 6)", rationale: "Assess demand for a Level 6 diploma pathway linked to eye-care support, community screening, refraction and supervised clinical practice.", proposedLevel: "Diploma — Level 6", deliveryModel: "Optometry skills laboratory plus supervised clinical placement", estimatedYear1Intake: 25, durationSemesters: 8, feePerSemesterKES: 34000, startUpEquipmentBudgetKES: 7614634.4, regulatoryStatus: "Diploma approval pathway, professional-body requirements and clinical-site capacity [Confirm locally]" },
      { courseName: "Orthopedic and Trauma Medicine — Certificate (Level 5)", rationale: "Assess demand for a Level 5 certificate pathway covering practical orthopedic, fracture-care, trauma-response and rehabilitation-support skills.", proposedLevel: "Certificate — Level 5", deliveryModel: "Simulation-based skills training plus supervised clinical placement", estimatedYear1Intake: 25, durationSemesters: 5, feePerSemesterKES: 30000, startUpEquipmentBudgetKES: 3600000, regulatoryStatus: "Certificate approval pathway, scope of practice and clinical placement requirements [Confirm locally]" },
      { courseName: "Orthopedic and Trauma Medicine — Diploma (Level 6)", rationale: "Assess demand for a Level 6 diploma pathway covering advanced orthopedic, fracture-care, trauma-response and rehabilitation-support competencies.", proposedLevel: "Diploma — Level 6", deliveryModel: "Simulation-based skills training plus supervised clinical placement", estimatedYear1Intake: 20, durationSemesters: 8, feePerSemesterKES: 33000, startUpEquipmentBudgetKES: 3600000, regulatoryStatus: "Diploma approval pathway, scope of practice and clinical placement requirements [Confirm locally]" },
      { courseName: "Artificial Intelligence and Data Science — Diploma (Level 6)", rationale: "Assess demand for applied artificial intelligence, data science, health informatics, analytics, data literacy and responsible technology skills supporting modern healthcare delivery.", proposedLevel: "Diploma — Level 6", deliveryModel: "Computer laboratory, project-based learning and industry-linked delivery", estimatedYear1Intake: 35, durationSemesters: 6, feePerSemesterKES: 30000, startUpEquipmentBudgetKES: 3200000, regulatoryStatus: "Diploma curriculum ownership, certification route, data-protection and laboratory requirements [Confirm locally]" },
    ],
    research: {
      summary: "Initial institutional background taken from the official ICMHS website. Course demand, regulator requirements, competitor fees, staffing credentials, supplier costs, clinical placements and enrolment assumptions remain to be validated.",
      sources: [
        { title: "ICMHS — Mission, Vision and Values", url: "https://icmhs.co.ke/mission-and-values" },
        { title: "ICMHS — Official Home Page and Academic Programmes", url: "https://icmhs.co.ke/" },
        { title: "ICMHS — Faculty and Leadership", url: "https://icmhs.co.ke/faculty-and-leadership" },
        { title: "ICMHS internal equipment schedule — OPTOMETRY.xlsx", url: "Internal workbook supplied for planning; retain with the implementation evidence pack" },
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
  retail: {
    businessModel: "retail",
    businessName: "AfyaBora Health Foods & Nutraceuticals Store",
    tagline: "Evidence-Based Whole Foods, Certified Nutraceuticals & Nutritionist Guidance",
    industrySector: "Specialty Health Food Retail, Dietary Supplements & Nutraceuticals",
    formOfOwnership: "Sole Proprietorship",
    registrationType: "Business Names Registration Act (Cap 499, Laws of Kenya)",
    ownerQualifications:
      "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), trained in clinical nutraceutical counselling, dietary supplement safety, KEBS/PPB label verification, and specialty retail inventory management.",
    county: "Nairobi County",
    townOrMarket: "Westlands / Kilimani Commercial Corridor, Nairobi",
    streetOrBuilding: "Ground Floor Retail Unit, Commercial Shopping Arcade [Confirm exact plot/street locally]",
    postalAddress: "24580-00100",
    email: "care@afyaboranutrition.co.ke",
    phone: "+254 714 550 880",
    locationRationale:
      "Positioned along a high-footfall urban commercial and residential corridor in Nairobi with convenient matatu and private vehicle access, proximity to outpatient clinics, fitness centres, and middle-income estates, and stable Kenya Power (KPLC) supply for chilled probiotic/beverage displays and climate-controlled nutraceutical shelving [Confirm lease terms and exact shop unit locally].",
    primaryProduct:
      "Curated Therapeutic Health Food & Certified Nutraceutical Wellness Basket (Gluten-Free/Diabetic Whole Foods, Cold-Pressed Oils, Seeds & PPB-Cleared Micronutrient Supplements)",
    productDescription:
      "An integrated specialty health food store and nutraceutical dispensary modeled on established Kenyan wellness retailers such as Healthy U, combining (1) KEBS-certified whole and therapeutic foods (diabetic low-GI flours, gluten-free rolled oats, chia/flax/pumpkin seeds, raw nuts, organic honey, cold-pressed coconut/flaxseed oils, and herbal infusions), (2) Pharmacy and Poisons Board (PPB)-listed dietary supplements and nutraceuticals (Vitamin D3, Omega-3 fish oil, chelated iron-folic acid, magnesium glycinate, probiotics, botanical adaptogens, and clean sports proteins), and (3) point-of-sale KNDI-registered nutritionist guidance and non-invasive body composition screening.",
    productPackaging:
      "Tamper-evident manufacturer-sealed nutraceutical bottles and food-grade barrier pouches packed in eco-friendly branded kraft carrier bags with printed dosage & dietary usage guides",
    unitSellingPrice: 2200,
    unitCostOfProduction: 1400,
    monthlyProductionUnitsYear1: 260,
    annualGrowthRateYear2: 0.25,
    annualGrowthRateYear3: 0.25,
    targetCustomersDescription:
      "Urban working professionals, individuals managing Type 2 diabetes, hypertension, gut health, or gluten/lactose intolerance, expectant and lactating mothers requiring micronutrient support, gym and fitness enthusiasts, and outpatient clinic referrals in Nairobi.",
    totalMarketPopulation:
      "45,000+ health-conscious urban households, commuter shoppers, and clinic/gym clients within the target Nairobi catchment [Confirm via local market survey]",
    projectedMarketSharePercentage: 5.5,
    competitors: [
      {
        name: "Healthy U (Healthy U 2000 Ltd) — Flagship & Mall Network [Confirm nearest branch prices]",
        location: "Sarit Centre (Westlands), Junction Mall, Yaya Centre, Two Rivers, Garden City, Hub Karen & Nairobi CBD",
        priceLevel: "KES 1,800 – 6,500 per supplement / specialty health food basket [Confirm current branch price list]",
        strengths:
          "East Africa's pioneer health-food and supplement retail chain (45+ branches), wide international nutraceutical brands, in-store nutritionists, and e-commerce delivery.",
        weaknesses:
          "Premium mall positioning and imported brand pricing can be prohibitive for middle-income neighbourhood shoppers seeking affordable local whole-food alternatives.",
      },
      {
        name: "Goodlife Pharmacy & MYDAWA E-Health Platform [Confirm locally]",
        location: "Major Shopping Malls, High Streets & Online Delivery across Nairobi",
        priceLevel: "KES 1,500 – 4,800 per imported vitamin or nutraceutical unit [Confirm current shelf prices]",
        strengths:
          "Extensive retail pharmacy footprint (150+ stores), strong prescription footfall, and trusted imported supplement lines (Webber Naturals, Jamieson, Natures Aid, Centrum).",
        weaknesses:
          "Primarily pharmaceutical-focused; limited assortment of culinary whole foods, gluten-free/diabetic pantry staples, organic seeds, and personalized culinary meal planning.",
      },
      {
        name: "Zucchini Food Market, Kalimoni Greens & Bridges Organic Health [Confirm locally]",
        location: "Westlands, Kilimani, Karen, Lavington & Nairobi CBD",
        priceLevel: "KES 1,600 – 3,500 per organic grocery and superfood basket [Confirm locally]",
        strengths:
          "Strong reputation for fresh organic produce, clean-eating groceries, cold-pressed juices, and Kenya Organic Agricultural Network (KOAN)-linked farm sourcing.",
        weaknesses:
          "Focus mainly on fresh groceries or organic dining rather than clinically structured micronutrient supplementation and KNDI dietetic screening.",
      },
    ],
    marketingPromotionBudgetMonthly: 15000,
    machinery: [
      {
        item: "Custom Gondola Shelving, Tempered-Glass Nutraceutical Lockable Cabinets & Consultation Counter",
        quantity: 1,
        unitCost: 85000,
        supplier: "Nairobi Commercial Shopfitters & Pharmacy Furniture Suppliers [Quotation required]",
      },
      {
        item: "Commercial Upright Glass-Door Chiller (2–8°C for Probiotics, Kefir, Cold-Pressed Oils & Nut Milks)",
        quantity: 1,
        unitCost: 68000,
        supplier: "Commercial Refrigeration Suppliers, Nairobi [Quotation required]",
      },
      {
        item: "Split Air-Conditioning & Thermo-Hygrometer Climate Control System (<25°C Supplement Stability)",
        quantity: 1,
        unitCost: 45000,
        supplier: "HVAC & Appliance Distributors, Nairobi [Quotation required]",
      },
      {
        item: "Barcode POS Terminal, Thermal Receipt Printer, Cash Drawer & KRA eTIMS Integration",
        quantity: 1,
        unitCost: 35000,
        supplier: "ETR & Retail POS Systems Vendors, Nairobi [Quotation required]",
      },
      {
        item: "Multi-Frequency Bioelectrical Impedance Analysis (BIA) Body Composition Scale, Stadiometer & BP Monitor",
        quantity: 1,
        unitCost: 32000,
        supplier: "Medical & Diagnostic Equipment Suppliers, Nairobi [Quotation required]",
      },
    ],
    rawMaterials: [
      {
        material:
          "Wholesale Nutraceutical & Supplement Inventory (PPB-cleared Vitamin D3, Omega-3, Iron-Folic Acid, Magnesium, Probiotics, Herbal Adaptogens & Protein Powders)",
        monthlyQuantity: "160 assorted supplement & nutraceutical units",
        monthlyCost: 215000,
        supplier: "PPB-Licensed Nutraceutical Importers & Pharmaceutical Distributors, Nairobi [Confirm supplier price list]",
      },
      {
        material:
          "Specialty Health Foods & Therapeutic Pantry Stock (KEBS-certified Gluten-Free Oats/Flours, Chia/Flax/Pumpkin Seeds, Raw Almonds/Walnuts, Stevia/Erythritol, Cold-Pressed Oils & Herbal Teas)",
        monthlyQuantity: "260 assorted whole-food & therapeutic grocery packs",
        monthlyCost: 140000,
        supplier: "KEBS-Certified Health Food Processors & KOAN Organic Aggregators [Confirm supplier price list]",
      },
      {
        material:
          "Eco-Friendly Branded Kraft Carrier Bags, Tamper-Evident Repack Pouches, Thermal POS Rolls & Printed Nutrition/Dosage Advisory Cards",
        monthlyQuantity: "300 customer sets",
        monthlyCost: 9000,
        supplier: "Nairobi Eco-Packaging & Commercial Print Vendors [Quotation required]",
      },
    ],
    workshopSquareMeters: 40,
    monthlyRent: 28000,
    staffing: [
      {
        position: "Managing Director & Lead Store Nutritionist (Proprietor)",
        count: 1,
        monthlySalary: 45000,
        duties:
          "In-store nutrition & supplement counselling, body composition screening, PPB/KEBS supplier vetting, FEFO stock audits, and financial management.",
        qualifications: "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI.",
      },
      {
        position: "Retail Wellness Advisor & POS Cashier",
        count: 1,
        monthlySalary: 20000,
        duties:
          "Customer reception, shelf merchandising, barcode POS/M-PESA checkout, WhatsApp order packing, and daily store hygiene.",
        qualifications: "Certificate in Nutrition, Community Health, Pharmaceutical Technology, or Retail Sales.",
      },
    ],
    preOperationalCosts: 55000,
    workingCapitalBuffer: 140000,
    ownerEquityAmount: 280000,
    loanAmount: 180000,
    loanInterestRateAnnual: 12,
    loanTenureMonths: 24,
    monthlyOverheads: {
      rent: 28000,
      electricity: 7500,
      water: 1500,
      transport: 9000,
      marketing: 15000,
      stationeryMisc: 4000,
    },
    research: {
      summary:
        "Kenyan specialty health food and nutraceutical retail is led by established urban wellness chains and pharmacies—most notably Healthy U (45+ branches across Kenya and Uganda, flagship at Sarit Centre Westlands), Goodlife Pharmacy (150+ stores stocking imported nutraceuticals), MYDAWA (licensed e-pharmacy and wellness retailer), and organic specialty grocers such as Zucchini Food Market, Kalimoni Greens, and Bridges Organic Health in Nairobi. Regulatory compliance requires Business Registration Service (BRS) registration, County Single Business Permit and Public Health inspection, Kenya Bureau of Standards (KEBS) Standardization Marks on packaged health foods, Pharmacy and Poisons Board (PPB) listing/clearance for dietary supplements and nutraceuticals, and Kenya Nutritionists and Dietitians Institute (KNDI) registration for in-store dietetic advisory services.",
      sources: [
        {
          title: "Healthy U Kenya — Official Health Food, Vitamins, Supplements & Natural Wellness Retailer (Nairobi & Nationwide Branches)",
          url: "https://www.healthyu.co.ke/",
        },
        {
          title: "Goodlife Pharmacy Kenya — Vitamins, Minerals, Herbal Supplements & Wellness Retail Network",
          url: "https://www.goodlife.co.ke/",
        },
        {
          title: "MYDAWA Kenya — Licensed Online Pharmacy, Vitamins & Nutritional Supplements Retail Platform",
          url: "https://mydawa.com/",
        },
        {
          title: "Zucchini Food Market Nairobi — Fresh Produce, Superfoods, Nuts, Seeds & Health Groceries",
          url: "https://zucchini.co.ke/",
        },
        {
          title: "Kalimoni Greens Kenya — Certified Organic Health Foods, Whole Grains & Natural Pantry Retail",
          url: "https://kalimonigreens.com/",
        },
        {
          title: "Pharmacy and Poisons Board (PPB) Kenya — Guidelines for Registration and Listing of Health Supplements, Nutraceuticals and Borderline Products",
          url: "https://web.pharmacyboardkenya.org/",
        },
        {
          title: "Kenya Bureau of Standards (KEBS) — Product Certification, Standardization Mark (SM) and Food Safety Standards",
          url: "https://www.kebs.org/",
        },
        {
          title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Professional Registration, Scope of Practice & Accreditation Standards (Act No. 18 of 2007)",
          url: "https://www.kndi.institute/",
        },
      ],
      searchedAt: "2026-11-14T16:00:00Z",
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
          durationSemesters: course?.durationSemesters == null ? undefined : Math.max(1, Math.round(num(course.durationSemesters, 0, 0))),
          feePerSemesterKES: course?.feePerSemesterKES == null ? undefined : num(course.feePerSemesterKES, 0, 0),
          proposedAnnualFeeKES: course?.proposedAnnualFeeKES == null ? undefined : num(course.proposedAnnualFeeKES, 0, 0),
          directCostPerStudentKES: course?.directCostPerStudentKES == null ? undefined : num(course.directCostPerStudentKES, 0, 0),
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
