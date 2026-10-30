/**
 * BrightPath KNEC Business Plan Specification Types
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

export interface BusinessPlanSpecs {
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

/** Pre-configured templates based on Kenya Nutrition & Food Science sectors */
export const BUSINESS_PLAN_PRESETS: Record<string, Partial<BusinessPlanSpecs>> = {
  consultancy: {
    businessName: "Afya Bora Nutrition & Dietetics Consultancy Practice",
    tagline: "Personalized Nutrition for Vibrant Living",
    industrySector: "Clinical Healthcare & Community Nutrition Services",
    formOfOwnership: "Sole Proprietorship",
    registrationType: "Business Names Registration Act (Cap 499, Laws of Kenya)",
    ownerQualifications: "Diploma in Human Nutrition and Dietetics with 2 years clinical hospital internship and KNDI registration.",
    locationRationale: "Located near Lodwar Sub-County Hospital and private clinics, ensuring direct patient doctor referrals and central accessibility.",
    primaryProduct: "Individualized Clinical Nutrition Therapy & Dietary Meal Plans",
    productDescription: "Comprehensive nutritional assessment, body composition analysis, diabetic diet management packages, and corporate wellness coaching.",
    productPackaging: "Individual 45-minute clinical consultation sessions with customized digital and printed meal guides",
    unitSellingPrice: 1500,
    unitCostOfProduction: 450,
    monthlyProductionUnitsYear1: 120, // 120 consultations per month
    annualGrowthRateYear2: 0.25,
    annualGrowthRateYear3: 0.2,
    targetCustomersDescription: "Patients referred with diabetes, hypertension, and gout; pregnant and lactating mothers; weight management and fitness clients.",
    totalMarketPopulation: "Approximately 35,000 residents within the town center and surrounding residential estates.",
    projectedMarketSharePercentage: 18,
    competitors: [
      {
        name: "Lodwar Sub-County Referral Hospital Outpatient Clinic",
        location: "Hospital Road",
        priceLevel: "KES 500 (Subsidized)",
        strengths: "High foot traffic and government brand recognition",
        weaknesses: "Long patient queues, brief 10-minute consults, no follow-up meal planning",
      },
      {
        name: "Wellness Life Pharmacy Dietary Corner",
        location: "Kenyatta Way",
        priceLevel: "KES 1,200",
        strengths: "Convenient pharmacy location",
        weaknesses: "Lacks specialized diagnostic body composition equipment",
      },
    ],
    marketingPromotionBudgetMonthly: 12000,
    machinery: [
      { item: "Bioimpedance Body Composition Analyzer", quantity: 1, unitCost: 65000, supplier: "Biomedical Scientific Ltd, Nairobi" },
      { item: "Medical Grade Digital Weighing Scale & Stadiometer", quantity: 1, unitCost: 28000, supplier: "Crown Healthcare Ltd" },
      { item: "Infant Length Board & Electronic Baby Scale", quantity: 1, unitCost: 22000, supplier: "UNICEF approved local vendor" },
      { item: "Office Laptop, Color Printer, and Nutrition Software", quantity: 1, unitCost: 55000, supplier: "Computer Land Ltd" },
      { item: "Executive Consultation Desk, Chairs & Examination Couch", quantity: 1, unitCost: 40000, supplier: "Eldoret Furniture Mart" },
    ],
    rawMaterials: [
      { material: "Disposable examination sheets & sanitary wipes", monthlyQuantity: "10 packs", monthlyCost: 3500, supplier: "Lodwar Chemists" },
      { material: "Printed branded diet diaries & educational brochures", monthlyQuantity: "150 booklets", monthlyCost: 6000, supplier: "Highland Printers" },
      { material: "Dietary demo models & portion measuring cups", monthlyQuantity: "1 set", monthlyCost: 2500, supplier: "KNDI supplies" },
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
