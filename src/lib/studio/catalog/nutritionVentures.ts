/**
 * TVET Hub Master Nutrition & Dietetics Venture Catalog
 * Complete 35-area taxonomy conforming to KNEC / TVET Entrepreneurship syllabus.
 * Contains realistic Kenyan equipment, raw materials, payroll, and statutory fees.
 */

import type { BusinessPlanSpecs, BusinessPlanModel } from "../businessPlanTypes";

export interface NutritionVentureDefinition {
  id: string;
  number: number;
  title: string;
  group: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  groupName: string;
  archetype: BusinessPlanModel;
  capitalTier: "Low" | "Medium" | "High";
  estimatedCapitalKES: { min: number; max: number };
  targetTracks: Array<"clinical" | "food_science" | "community">;
  tagline: string;
  summary: string;
  defaultSpecs: Partial<BusinessPlanSpecs>;
  compliance: Array<{ agency: string; requirement: string; fee: number }>;
}

export const NUTRITION_VENTURES: NutritionVentureDefinition[] = [
  {
    "id": "private_nutrition_practice",
    "number": 1,
    "title": "Private Nutrition Clinic",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 40000,
      "max": 240000
    },
    "targetTracks": [
      "clinical"
    ],
    "tagline": "Evidence-Based Nutrition Therapy for Lifelong Wellness",
    "summary": "Outpatient clinical consultation room providing individualized nutritional assessment, dietary counseling, and customized meal prescriptions.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Private Practice License & Premises Registration",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Professional Services)",
        "fee": 8000
      },
      {
        "agency": "ODPC",
        "requirement": "Data Controller Registration (Patient Records)",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "Afya Bora Nutrition Clinic",
      "tagline": "Evidence-Based Nutrition Therapy for Lifelong Wellness",
      "industrySector": "Clinical Healthcare & Outpatient Nutrition Services",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Individualized Clinical Nutrition Assessment and Meal Plans",
      "productDescription": "Comprehensive anthropometric assessment, clinical dietary history, customized macronutrient meal guides, and bi-weekly progress review.",
      "productPackaging": "45-minute clinical consultation sessions with printed dietary portfolios and digital tracking",
      "unitSellingPrice": 1500,
      "unitCostOfProduction": 250,
      "monthlyProductionUnitsYear1": 100,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.2,
      "targetCustomersDescription": "Patients referred with hypertension, diabetes, and gout; expectant mothers; individuals seeking sustainable weight management.",
      "totalMarketPopulation": "45,000 residents within the municipality catchment",
      "projectedMarketSharePercentage": 2.5,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 1880 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 1200 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Digital weighing scale and telescopic stadiometer",
          "quantity": 1,
          "unitCost": 24000,
          "supplier": "Lab Equipment Kenya Ltd"
        },
        {
          "item": "Adult & pediatric MUAC measurement tapes and skinfold calipers",
          "quantity": 2,
          "unitCost": 4500,
          "supplier": "Medical Supplies Depot"
        },
        {
          "item": "Office laptop and multifunction color printer",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Local Computer Dealer"
        },
        {
          "item": "Consultation desk, examination couch, and client chairs",
          "quantity": 1,
          "unitCost": 32000,
          "supplier": "Local Furniture Mart"
        }
      ],
      "rawMaterials": [
        {
          "material": "Disposable examination couch rolls and sanitizing supplies",
          "monthlyQuantity": "10 rolls",
          "monthlyCost": 2500,
          "supplier": "Chemist Depot"
        },
        {
          "material": "Printed client diet diaries and food portion guides",
          "monthlyQuantity": "100 booklets",
          "monthlyCost": 4500,
          "supplier": "Local Stationer"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 15000,
      "staffing": [
        {
          "position": "Lead Clinical Dietitian / Proprietor",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Clinical assessments, meal plan formulation, consultation delivery",
          "qualifications": "Diploma in Human Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Receptionist & Front Office Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Booking appointments, client reception, fee collection, record keeping",
          "qualifications": "Certificate in Secretarial / Front Office"
        }
      ],
      "preOperationalCosts": 32000,
      "workingCapitalBuffer": 50000,
      "ownerEquityAmount": 132000,
      "loanAmount": 60000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 15000,
        "electricity": 3000,
        "water": 1500,
        "transport": 5000,
        "marketing": 8000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "online_telehealth_nutrition",
    "number": 2,
    "title": "Telehealth Dietetics Practice",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 20000,
      "max": 170000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Expert Nutrition Guidance From the Comfort of Home",
    "summary": "Remote virtual nutrition counseling, habit coaching, and dietary follow-up delivered over encrypted video and WhatsApp for busy urban clients.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Private Telehealth Practice Certificate",
        "fee": 12000
      },
      {
        "agency": "County Government",
        "requirement": "Online / Home Business License",
        "fee": 5000
      },
      {
        "agency": "ODPC",
        "requirement": "Data Controller Registration",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "NutriConnect Telehealth Kenya",
      "tagline": "Expert Nutrition Guidance From the Comfort of Home",
      "industrySector": "Digital Health & Tele-Nutrition Services",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Virtual 1-on-1 Nutrition Counseling & Habit Coaching",
      "productPackaging": "30-day digital coaching cycle including 3 video consultations and weekly WhatsApp progress check-ins",
      "unitSellingPrice": 2800,
      "unitCostOfProduction": 300,
      "monthlyProductionUnitsYear1": 50,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.3,
      "targetCustomersDescription": "Working professionals, corporate desk workers, diaspora Kenyans managing elderly parents' health, and remote post-pregnancy mothers.",
      "totalMarketPopulation": "120,000 addressable smartphone-enabled urban households",
      "projectedMarketSharePercentage": 0.8,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 3500 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 2240 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "High-performance laptop with HD webcam",
          "quantity": 1,
          "unitCost": 55000,
          "supplier": "Tech Point Nairobi"
        },
        {
          "item": "Professional studio microphone and ring light kit",
          "quantity": 1,
          "unitCost": 8500,
          "supplier": "Audio Visual Depot"
        },
        {
          "item": "Ergonomic home office workstation",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Furniture Workshop"
        }
      ],
      "rawMaterials": [
        {
          "material": "Encrypted telehealth platform & appointment software subscription",
          "monthlyQuantity": "Monthly license",
          "monthlyCost": 3500,
          "supplier": "SaaS Provider"
        },
        {
          "material": "High-speed 4G/Fibre internet connectivity bundle",
          "monthlyQuantity": "Monthly bundle",
          "monthlyCost": 4000,
          "supplier": "Safaricom Home Fibre"
        }
      ],
      "workshopSquareMeters": 15,
      "monthlyRent": 8000,
      "staffing": [
        {
          "position": "Principal Virtual Dietitian / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Tele-consultations, customized nutritional prescriptions, content creation",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        }
      ],
      "preOperationalCosts": 22000,
      "workingCapitalBuffer": 30000,
      "ownerEquityAmount": 133500,
      "loanAmount": 0,
      "loanInterestRateAnnual": 0,
      "loanTenureMonths": 12,
      "monthlyOverheads": {
        "rent": 8000,
        "electricity": 2500,
        "water": 500,
        "transport": 2000,
        "marketing": 12000,
        "stationeryMisc": 2000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Remote virtual nutrition counseling, habit coaching, and dietary follow-up delivered over encrypted video and WhatsApp for busy urban clients. Delivered as Virtual 1-on-1 Nutrition Counseling & Habit Coaching packaged in 30-day digital coaching cycle including 3 video consultations and weekly WhatsApp progress check-ins to serve working professionals, corporate desk workers, diaspora Kenyans managing elderly parents' health, and remote post-pregnancy mothers..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "chronic_disease_diet_management",
    "number": 3,
    "title": "Chronic Disease Diet Clinic",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 60000,
      "max": 300000
    },
    "targetTracks": [
      "clinical"
    ],
    "tagline": "Therapeutic Nutrition for Diabetes, Hypertension & Renal Health",
    "summary": "Doctor-referred clinical practice specializing in therapeutic diet formulation, glycemic management, and renal meal regimens to reduce complications.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Clinical Practice License & Inspection",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Medical Services)",
        "fee": 10000
      },
      {
        "agency": "ODPC",
        "requirement": "Health Data Protection Registration",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "MetabolicCare Dietary Clinic",
      "tagline": "Therapeutic Nutrition for Diabetes, Hypertension & Renal Health",
      "industrySector": "Medical Nutrition Therapy & Chronic Care",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Comprehensive Chronic Condition Dietary Protocol",
      "productPackaging": "Initial clinical diagnostic intake, 8-week structured therapeutic diet chart, and bi-weekly glucose/BP tracking",
      "unitSellingPrice": 3500,
      "unitCostOfProduction": 450,
      "monthlyProductionUnitsYear1": 70,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Patients diagnosed with Type 2 Diabetes, Hypertension, Chronic Kidney Disease (Stages 1-3), and Hyperuricemia (Gout).",
      "totalMarketPopulation": "28,000 chronic disease patients in county referral zone",
      "projectedMarketSharePercentage": 3,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 4380 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 2800 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Multi-parameter digital clinical monitor (BP, Glucose, Hemoglobin)",
          "quantity": 2,
          "unitCost": 18000,
          "supplier": "Crown Healthcare Kenya"
        },
        {
          "item": "Medical digital stadiometer and precision body composition scale",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Clinical documentation computer, printer, and patient filing system",
          "quantity": 1,
          "unitCost": 48000,
          "supplier": "Local Dealer"
        },
        {
          "item": "Consultation suite furniture set",
          "quantity": 1,
          "unitCost": 30000,
          "supplier": "Local Craftsmen"
        }
      ],
      "rawMaterials": [
        {
          "material": "Blood glucose test strips, lancets, and medical swabs",
          "monthlyQuantity": "150 strips",
          "monthlyCost": 6500,
          "supplier": "Chemist Wholesale"
        },
        {
          "material": "Printed clinical diet manuals and diabetic food exchange guides",
          "monthlyQuantity": "70 sets",
          "monthlyCost": 4200,
          "supplier": "Stationery Mart"
        }
      ],
      "workshopSquareMeters": 35,
      "monthlyRent": 18000,
      "staffing": [
        {
          "position": "Lead Medical Dietitian / Founder",
          "count": 1,
          "monthlySalary": 50000,
          "duties": "Clinical diagnosis review, diet therapy prescription, physician liaison",
          "qualifications": "Diploma/BSc in Human Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Clinic Nurse / Care Assistant",
          "count": 1,
          "monthlySalary": 25000,
          "duties": "Biometric screening, triage, patient intake, follow-up calls",
          "qualifications": "Certificate in Community Health Nursing / Nutrition"
        }
      ],
      "preOperationalCosts": 35000,
      "workingCapitalBuffer": 55000,
      "ownerEquityAmount": 159000,
      "loanAmount": 80000,
      "loanInterestRateAnnual": 13,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 18000,
        "electricity": 3500,
        "water": 1500,
        "transport": 6000,
        "marketing": 10000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Doctor-referred clinical practice specializing in therapeutic diet formulation, glycemic management, and renal meal regimens to reduce complications. Delivered as Comprehensive Chronic Condition Dietary Protocol packaged in initial clinical diagnostic intake, 8-week structured therapeutic diet chart, and bi-weekly glucose/BP tracking to serve patients diagnosed with Type 2 Diabetes, Hypertension, Chronic Kidney Disease (Stages 1-3), and Hyperuricemia (Gout)..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "maternal_child_nutrition_services",
    "number": 4,
    "title": "Maternal & Child Nutrition",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 35000,
      "max": 170000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Nurturing Healthy Beginnings from First 1000 Days",
    "summary": "Dedicated clinic focusing on antenatal diet balance, breastfeeding coaching, infant weaning milestones, and early child growth monitoring.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Private Practice License",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "Mama & Mtoto Nutrition Haven",
      "tagline": "Nurturing Healthy Beginnings from First 1000 Days",
      "industrySector": "Maternal, Infant & Young Child Nutrition (MIYCN)",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "First 1000 Days Maternal & Complementary Feeding Guidance",
      "productPackaging": "Individualized mother-baby consultation package including growth monitoring chart and recipe booklet",
      "unitSellingPrice": 1800,
      "unitCostOfProduction": 280,
      "monthlyProductionUnitsYear1": 90,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.2,
      "targetCustomersDescription": "First-time pregnant mothers, breastfeeding mothers struggling with milk supply, and parents starting infant complementary feeding at 6 months.",
      "totalMarketPopulation": "32,000 households with under-5 children in local sub-county",
      "projectedMarketSharePercentage": 3.5,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 2250 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 1440 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 7000,
      "machinery": [
        {
          "item": "Infant length board / infantometer (wooden WHO standard)",
          "quantity": 1,
          "unitCost": 14000,
          "supplier": "KNDI Approved Supplies"
        },
        {
          "item": "Digital baby weighing scale with curved tray",
          "quantity": 1,
          "unitCost": 16000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Lactation demonstration anatomical models & breast pump kit",
          "quantity": 1,
          "unitCost": 12000,
          "supplier": "Surgical Depot"
        },
        {
          "item": "Consultation desk, mother-baby feeding armchair, and changing table",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Local Craftsmen"
        }
      ],
      "rawMaterials": [
        {
          "material": "Printed WHO Child Growth Standards booklets and weaning meal planners",
          "monthlyQuantity": "100 booklets",
          "monthlyCost": 4500,
          "supplier": "Color Prints Ltd"
        },
        {
          "material": "Disposable sanitizing wipes and baby-safe disinfectant",
          "monthlyQuantity": "6 packs",
          "monthlyCost": 2000,
          "supplier": "Local Chemist"
        }
      ],
      "workshopSquareMeters": 25,
      "monthlyRent": 14000,
      "staffing": [
        {
          "position": "Lead Pediatric & Maternal Nutritionist",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Lactation consultations, infant growth plotting, weaning diets",
          "qualifications": "Diploma in Human Nutrition & Dietetics, KNDI Registered"
        }
      ],
      "preOperationalCosts": 25000,
      "workingCapitalBuffer": 40000,
      "ownerEquityAmount": 95000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 14000,
        "electricity": 2500,
        "water": 1200,
        "transport": 4000,
        "marketing": 7000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Dedicated clinic focusing on antenatal diet balance, breastfeeding coaching, infant weaning milestones, and early child growth monitoring. Delivered as First 1000 Days Maternal & Complementary Feeding Guidance packaged in individualized mother-baby consultation package including growth monitoring chart and recipe booklet to serve first-time pregnant mothers, breastfeeding mothers struggling with milk supply, and parents starting infant complementary feeding at 6 months..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "home_based_nutrition_care",
    "number": 5,
    "title": "Home-Based Nutrition Care",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 30000,
      "max": 180000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Compassionate Bedside Nutrition for Recovery & Dignity",
    "summary": "Mobile in-home nutrition therapy, enteral tube feeding support, and caregiver training for bedridden, post-stroke, and geriatric patients.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Mobile Clinical Practice Permit",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Professional)",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "CareAtHome Nutrition Services",
      "tagline": "Compassionate Bedside Nutrition for Recovery & Dignity",
      "industrySector": "Domiciliary Healthcare & Geriatric Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Bedside Clinical Nutrition Assessment & Enteral Diet Plan",
      "productPackaging": "90-minute in-home clinical visit with bedside assessment, caregiver coaching, and customized blenderized feeding formula",
      "unitSellingPrice": 3500,
      "unitCostOfProduction": 650,
      "monthlyProductionUnitsYear1": 50,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Bedridden stroke survivors, post-surgery patients discharged with feeding tubes, and elderly individuals suffering from age-related dysphagia and muscle wasting.",
      "totalMarketPopulation": "15,000 households in urban & peri-urban radius",
      "projectedMarketSharePercentage": 4,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 4380 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 2800 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Portable field diagnostic kit (Digital BP, Glucometer, Pulse Oximeter)",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Crown Healthcare"
        },
        {
          "item": "Mobile anthropometric kit (Knee-height caliper, MUAC, portable scale)",
          "quantity": 1,
          "unitCost": 16000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Field clinical laptop and portable battery-powered thermal printer",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Local Tech Dealer"
        }
      ],
      "rawMaterials": [
        {
          "material": "Clinical test strips, sterile gloves, and PPE packs",
          "monthlyQuantity": "50 sets",
          "monthlyCost": 5000,
          "supplier": "Surgicals Ltd"
        },
        {
          "material": "Printed home caregiver feeding charts and dysphagia guidelines",
          "monthlyQuantity": "50 booklets",
          "monthlyCost": 3500,
          "supplier": "Stationery Mart"
        },
        {
          "material": "Fuel and motorcycle transport allowance",
          "monthlyQuantity": "Monthly budget",
          "monthlyCost": 12000,
          "supplier": "Service Stations"
        }
      ],
      "workshopSquareMeters": 15,
      "monthlyRent": 8000,
      "staffing": [
        {
          "position": "Lead Domiciliary Dietitian / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "In-home patient assessment, enteral feeding calculation, family education",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Part-time Logistics Rider & Field Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Dispatching supplies, route coordination, client record transport",
          "qualifications": "Valid Riding License, First Aid Certificate"
        }
      ],
      "preOperationalCosts": 25000,
      "workingCapitalBuffer": 35000,
      "ownerEquityAmount": 99000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 8000,
        "electricity": 2000,
        "water": 800,
        "transport": 12000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Mobile in-home nutrition therapy, enteral tube feeding support, and caregiver training for bedridden, post-stroke, and geriatric patients. Delivered as Bedside Clinical Nutrition Assessment & Enteral Diet Plan packaged in 90-minute in-home clinical visit with bedside assessment, caregiver coaching, and customized blenderized feeding formula to serve bedridden stroke survivors, post-surgery patients discharged with feeding tubes, and elderly individuals suffering from age-related dysphagia and muscle wasting..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "weight_management_coaching",
    "number": 6,
    "title": "Weight Management Studio",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 50000,
      "max": 300000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Sustainable Body Transformation Through Science-Led Nutrition",
    "summary": "Body composition analysis, bioelectrical impedance scanning, and 12-week structured weight transformation programs.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Private Practice License",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Wellness Studio)",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "Sculpt & Nourish Lifestyle Studio",
      "tagline": "Sustainable Body Transformation Through Science-Led Nutrition",
      "industrySector": "Wellness, Lifestyle & Weight Management",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "12-Week Body Composition Transformation Program",
      "productPackaging": "Cohort enrollment including baseline BIA scan, weekly caloric meal guides, and WhatsApp accountability check-ins",
      "unitSellingPrice": 9500,
      "unitCostOfProduction": 1200,
      "monthlyProductionUnitsYear1": 30,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Overweight and obese individuals, postpartum mothers, corporate desk employees with visceral fat buildup, and pre-diabetic clients.",
      "totalMarketPopulation": "60,000 adult residents in town commercial core",
      "projectedMarketSharePercentage": 2,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 11880 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 7600 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Multi-frequency Bioelectrical Impedance (BIA) Body Analyzer",
          "quantity": 1,
          "unitCost": 110000,
          "supplier": "Specialized Fitness Supplies"
        },
        {
          "item": "Digital ultrasonic height stadiometer and waist circumference gauges",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Studio consultation desk, client consultation chairs, and partition screen",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Local Craftsmen"
        }
      ],
      "rawMaterials": [
        {
          "material": "Thermal BIA result report paper and electrode wipes",
          "monthlyQuantity": "150 sheets",
          "monthlyCost": 3500,
          "supplier": "Stationery Depot"
        },
        {
          "material": "Branded client progress journals and dietary measuring tape kits",
          "monthlyQuantity": "30 sets",
          "monthlyCost": 4500,
          "supplier": "Merchandise Mart"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 16000,
      "staffing": [
        {
          "position": "Lead Wellness Nutritionist / Founder",
          "count": 1,
          "monthlySalary": 48000,
          "duties": "BIA interpretation, macronutrient calculation, motivational coaching",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Studio Receptionist & Social Media Admin",
          "count": 1,
          "monthlySalary": 20000,
          "duties": "Client scheduling, community WhatsApp moderation, inquiry response",
          "qualifications": "Certificate in Digital Media / Business"
        }
      ],
      "preOperationalCosts": 30000,
      "workingCapitalBuffer": 45000,
      "ownerEquityAmount": 178000,
      "loanAmount": 60000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 16000,
        "electricity": 3000,
        "water": 1200,
        "transport": 4000,
        "marketing": 12000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Body composition analysis, bioelectrical impedance scanning, and 12-week structured weight transformation programs. Delivered as 12-Week Body Composition Transformation Program packaged in cohort enrollment including baseline BIA scan, weekly caloric meal guides, and WhatsApp accountability check-ins to serve overweight and obese individuals, postpartum mothers, corporate desk employees with visceral fat buildup, and pre-diabetic clients..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "sports_and_fitness_nutrition",
    "number": 7,
    "title": "Sports Nutrition Practice",
    "group": "A",
    "groupName": "Clinical Care",
    "archetype": "clinical",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 45000,
      "max": 240000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Fueling Peak Athletic Performance and Rapid Recovery",
    "summary": "Specialized dietary planning for athletes, sports academies, marathoners, and gym enthusiasts focusing on hydration, nutrient timing, and lean muscle synthesis.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Private Practice License",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "clinical",
      "businessName": "ElitePeak Sports Nutrition Practice",
      "tagline": "Fueling Peak Athletic Performance and Rapid Recovery",
      "industrySector": "Sports Science & Performance Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Athlete Periodized Nutritional & Hydration Plan",
      "productPackaging": "Comprehensive 8-week sports nutrition plan matching training phases (macro-cycles) with pre-, intra-, and post-workout guidelines",
      "unitSellingPrice": 6500,
      "unitCostOfProduction": 900,
      "monthlyProductionUnitsYear1": 35,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Track and field athletes, football academy players, competitive cyclists, bodybuilders, and fitness gym members.",
      "totalMarketPopulation": "12,000 active athletes and gym members in regional hubs",
      "projectedMarketSharePercentage": 3.5,
      "competitors": [
        {
          "name": "Private Hospital Outpatient Nutrition Clinics [Confirm locally]",
          "location": "Major Private Hospitals in Town Center",
          "priceLevel": "KES 8130 per session",
          "strengths": "Established hospital brand, in-house laboratory diagnostics, and direct physician referrals",
          "weaknesses": "Long outpatient waiting queues, high consultation tariffs, and limited post-visit follow-up meal coaching"
        },
        {
          "name": "General Wellness & Unregulated Fitness Coaches [Confirm locally]",
          "location": "Commercial Gyms & Social Media Platforms",
          "priceLevel": "KES 5200 per plan",
          "strengths": "Aggressive social media marketing and bundled gym workout packages",
          "weaknesses": "Lack KNDI clinical accreditation, rely on generic foreign fad diets, and cannot safely manage medical conditions"
        }
      ],
      "marketingPromotionBudgetMonthly": 9000,
      "machinery": [
        {
          "item": "Skinfold caliper and bioelectrical body composition scanner",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Urine specific gravity refractometer (Hydration testing)",
          "quantity": 1,
          "unitCost": 14000,
          "supplier": "Scientific Supplies Ltd"
        },
        {
          "item": "Laptop computer and nutrition prescription software",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Local Dealer"
        },
        {
          "item": "Consultation room furniture",
          "quantity": 1,
          "unitCost": 25000,
          "supplier": "Local Furniture Mart"
        }
      ],
      "rawMaterials": [
        {
          "material": "Hydration test strips and consumable assessment supplies",
          "monthlyQuantity": "50 units",
          "monthlyCost": 3500,
          "supplier": "Surgical Supplies"
        },
        {
          "material": "Printed sports fueling protocols and nutrient timing booklets",
          "monthlyQuantity": "40 booklets",
          "monthlyCost": 3200,
          "supplier": "Local Stationer"
        }
      ],
      "workshopSquareMeters": 25,
      "monthlyRent": 14000,
      "staffing": [
        {
          "position": "Lead Sports Dietitian / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Performance dietary planning, hydration testing, gym seminars",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        }
      ],
      "preOperationalCosts": 26000,
      "workingCapitalBuffer": 35000,
      "ownerEquityAmount": 150000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 14000,
        "electricity": 2500,
        "water": 1000,
        "transport": 5000,
        "marketing": 9000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with clinical practicum experience in medical nutrition therapy and patient counseling.",
      "productDescription": "Specialized dietary planning for athletes, sports academies, marathoners, and gym enthusiasts focusing on hydration, nutrient timing, and lean muscle synthesis. Delivered as Athlete Periodized Nutritional & Hydration Plan packaged in comprehensive 8-week sports nutrition plan matching training phases (macro-cycles) with pre-, intra-, and post-workout guidelines to serve track and field athletes, football academy players, competitive cyclists, bodybuilders, and fitness gym members..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "fortified_flours_and_porridges",
    "number": 8,
    "title": "Fortified Porridge Flours",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "High",
    "estimatedCapitalKES": {
      "min": 450000,
      "max": 1200000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Wholesome Indigenous Grains for Vitality and Growth",
    "summary": "Hygienic processing and blending of sorghum, finger millet, amaranth, and soya flours fortified with essential micronutrients for family porridge.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark (SM) for Fortified Flour",
        "fee": 35000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License & Food Handlers Medical Certs",
        "fee": 12000
      },
      {
        "agency": "NEMA",
        "requirement": "Environmental Impact Assessment Summary Report",
        "fee": 25000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Manufacturing)",
        "fee": 15000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "AfyaBora Nutri-Grain Millers",
      "tagline": "Wholesome Indigenous Grains for Vitality and Growth",
      "industrySector": "Agro-Processing & Cereal Flour Manufacturing",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Fortified Composite Flour (Millet, Sorghum, Soya & Amaranth)",
      "productPackaging": "1kg high-barrier laminated moisture-proof stand-up pouches with zip lock",
      "unitSellingPrice": 180,
      "unitCostOfProduction": 95,
      "monthlyProductionUnitsYear1": 3000,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.2,
      "targetCustomersDescription": "Health-conscious families, mothers preparing infant porridge, elderly consumers requiring easily digestible nutrition, and school feeding programs.",
      "totalMarketPopulation": "55,000 households in county catchment",
      "projectedMarketSharePercentage": 5.5,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 230 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 140 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 18000,
      "machinery": [
        {
          "item": "Stainless steel multi-grain hammer mill (15HP motor)",
          "quantity": 1,
          "unitCost": 260000,
          "supplier": "Ndume Engineering Ltd"
        },
        {
          "item": "Rotary drum dry powder ribbon blender (100kg batch capacity)",
          "quantity": 1,
          "unitCost": 140000,
          "supplier": "General Fabricators Nairobi"
        },
        {
          "item": "Continuous horizontal band sealer with date coding printer",
          "quantity": 1,
          "unitCost": 48000,
          "supplier": "Industrial Packaging Supplies"
        },
        {
          "item": "Grain moisture meter tester and bench scale (300kg)",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Stainless steel grain intake hopper and sorting tables",
          "quantity": 2,
          "unitCost": 30000,
          "supplier": "Local Stainless Fabricators"
        }
      ],
      "rawMaterials": [
        {
          "material": "Graded raw grain (Finger millet, sorghum, amaranth, roasted soya)",
          "monthlyQuantity": "3,200 kg",
          "monthlyCost": 208000,
          "supplier": "Smallholder Farmers Cooperative"
        },
        {
          "material": "Pre-mix mineral and vitamin fortificant (Vitamin A, Zinc, Iron)",
          "monthlyQuantity": "10 kg",
          "monthlyCost": 18000,
          "supplier": "Nutrient Supplements East Africa"
        },
        {
          "material": "Branded 1kg high-barrier laminated packaging pouches",
          "monthlyQuantity": "3,000 pouches",
          "monthlyCost": 36000,
          "supplier": "Packaging Mart Nairobi"
        }
      ],
      "workshopSquareMeters": 80,
      "monthlyRent": 28000,
      "staffing": [
        {
          "position": "Managing Director & Operations Manager",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Overall management, grain procurement, regulatory compliance",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Milling & Blending Machine Operator",
          "count": 1,
          "monthlySalary": 22000,
          "duties": "Machine operation, milling, preventive maintenance",
          "qualifications": "Certificate in Mechanical / Food Processing"
        },
        {
          "position": "Quality Control & Packaging Attendant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Sorting, moisture testing, weighing, sealing, batch labeling",
          "qualifications": "Certificate in Food Safety"
        },
        {
          "position": "Sales & Dispatch Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Retail deliveries, invoice tracking, customer orders",
          "qualifications": "Valid Driving/Riding License"
        }
      ],
      "preOperationalCosts": 75000,
      "workingCapitalBuffer": 150000,
      "ownerEquityAmount": 518000,
      "loanAmount": 250000,
      "loanInterestRateAnnual": 12.5,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 28000,
        "electricity": 14000,
        "water": 3000,
        "transport": 15000,
        "marketing": 18000,
        "stationeryMisc": 6000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Hygienic processing and blending of sorghum, finger millet, amaranth, and soya flours fortified with essential micronutrients for family porridge. Delivered as Fortified Composite Flour (Millet, Sorghum, Soya & Amaranth) packaged in 1kg high-barrier laminated moisture-proof stand-up pouches with zip lock to serve health-conscious families, mothers preparing infant porridge, elderly consumers requiring easily digestible nutrition, and school feeding programs..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "infant_complementary_foods",
    "number": 9,
    "title": "Infant Weaning Foods",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 300000,
      "max": 800000
    },
    "targetTracks": [
      "food_science",
      "clinical"
    ],
    "tagline": "Gentle, Nutritious First Foods for Thriving Babies",
    "summary": "Production of scientifically formulated, aflatoxin-tested baby cereals, ready-to-mix vegetable purees, and toddler finger snacks.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Infant Foods (KS 2290)",
        "fee": 40000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 12000
      },
      {
        "agency": "NEMA",
        "requirement": "Environmental Summary Project Report",
        "fee": 20000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "TotoBora Infant Nutrition Ltd",
      "tagline": "Gentle, Nutritious First Foods for Thriving Babies",
      "industrySector": "Infant Food Manufacturing & Pediatric Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Fortified Pre-Cooked Infant Weaning Cereal (500g)",
      "productPackaging": "500g food-grade aluminum barrier pouch with scoop and airtight zipper",
      "unitSellingPrice": 220,
      "unitCostOfProduction": 98,
      "monthlyProductionUnitsYear1": 2200,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Working mothers, parents transitioning infants from exclusive breastfeeding at 6 months, daycares, and pediatrician clinics.",
      "totalMarketPopulation": "24,000 infants aged 6-24 months in urban catchment",
      "projectedMarketSharePercentage": 9,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 280 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 180 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 15000,
      "machinery": [
        {
          "item": "Stainless steel baby cereal pre-cooking extruder / steam drum",
          "quantity": 1,
          "unitCost": 220000,
          "supplier": "Food Processing Machinery Nairobi"
        },
        {
          "item": "Fine stainless micro-pulverizer mill",
          "quantity": 1,
          "unitCost": 110000,
          "supplier": "Ndume Engineering"
        },
        {
          "item": "Automatic nitrogen-flush pouch sealing machine",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Industrial Packaging Depot"
        },
        {
          "item": "Aflatoxin rapid testing lateral flow reader kit",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Grade 1 certified grains (Amaranth, sprouted ragi, sweet potato flour)",
          "monthlyQuantity": "1,200 kg",
          "monthlyCost": 120000,
          "supplier": "Contracted Smallholders"
        },
        {
          "material": "Pediatric micronutrient fortification premix",
          "monthlyQuantity": "6 kg",
          "monthlyCost": 15000,
          "supplier": "Nutrient Suppliers Kenya"
        },
        {
          "material": "Printed multi-layer aluminum foil stand-up pouches",
          "monthlyQuantity": "2,200 pouches",
          "monthlyCost": 30800,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 60,
      "monthlyRent": 24000,
      "staffing": [
        {
          "position": "Lead Food Technologist / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Formulation, microbial monitoring, regulatory compliance",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Production & Hygiene Operator",
          "count": 1,
          "monthlySalary": 20000,
          "duties": "Cooking, milling, hygiene sanitization",
          "qualifications": "Certificate in Food Handling"
        },
        {
          "position": "Packaging & Dispatch Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Weighing, sealing, date coding, inventory control",
          "qualifications": "Certificate in Secondary Education"
        }
      ],
      "preOperationalCosts": 65000,
      "workingCapitalBuffer": 110000,
      "ownerEquityAmount": 435000,
      "loanAmount": 180000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 24000,
        "electricity": 11000,
        "water": 2500,
        "transport": 12000,
        "marketing": 15000,
        "stationeryMisc": 5000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Production of scientifically formulated, aflatoxin-tested baby cereals, ready-to-mix vegetable purees, and toddler finger snacks. Delivered as Fortified Pre-Cooked Infant Weaning Cereal (500g) packaged in 500g food-grade aluminum barrier pouch with scoop and airtight zipper to serve working mothers, parents transitioning infants from exclusive breastfeeding at 6 months, daycares, and pediatrician clinics..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "healthy_snacks_and_bars",
    "number": 10,
    "title": "Healthy Energy Snack Bars",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 120000,
      "max": 350000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Natural Wholesome Crunch on the Move",
    "summary": "Production and packaging of roasted sesame, peanut, chia seed, and honey energy bars; baked arrowroot and sweet potato chips.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Confectionery/Snacks",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Hygiene License",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "NutriCrunch Energy Foods",
      "tagline": "Natural Wholesome Crunch on the Move",
      "industrySector": "Healthy Snack Manufacturing",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "NutriCrunch Sesame & Peanut Honey Energy Bar (45g)",
      "productPackaging": "Individually wrapped 45g metalized BOPP pouches displayed in 12-bar retail counter display boxes",
      "unitSellingPrice": 60,
      "unitCostOfProduction": 24,
      "monthlyProductionUnitsYear1": 5000,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "School children, college students, gym enthusiasts, corporate staff seeking healthy tea-time snacks, and long-distance travelers.",
      "totalMarketPopulation": "80,000 active urban snack consumers",
      "projectedMarketSharePercentage": 6.2,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 80 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 50 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Commercial double-deck roasting oven (Electric/Gas)",
          "quantity": 1,
          "unitCost": 95000,
          "supplier": "Catering & Bakery Supplies Nairobi"
        },
        {
          "item": "Stainless steel snack bar rolling and cutting table with press",
          "quantity": 1,
          "unitCost": 42000,
          "supplier": "Local Stainless Fabricators"
        },
        {
          "item": "High-speed continuous horizontal flow wrapper machine",
          "quantity": 1,
          "unitCost": 75000,
          "supplier": "Industrial Packaging Supplies"
        },
        {
          "item": "Digital precision bench balance (0.1g accuracy)",
          "quantity": 1,
          "unitCost": 12000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Raw shelled peanuts, sesame seeds, and chia seeds",
          "monthlyQuantity": "220 kg",
          "monthlyCost": 48000,
          "supplier": "Produce Wholesalers"
        },
        {
          "material": "Raw unadulterated honey and cane molasses binder",
          "monthlyQuantity": "60 kg",
          "monthlyCost": 24000,
          "supplier": "Kitui Bee Keepers"
        },
        {
          "material": "Printed metalized film rolls and cardboard display boxes",
          "monthlyQuantity": "5,000 wrappers",
          "monthlyCost": 22000,
          "supplier": "Flexible Packaging Ltd"
        }
      ],
      "workshopSquareMeters": 40,
      "monthlyRent": 18000,
      "staffing": [
        {
          "position": "Production Supervisor & Proprietor",
          "count": 1,
          "monthlySalary": 40000,
          "duties": "Baking, formulation, quality control, wholesale distribution",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Baking & Packaging Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Roasting, bar shaping, machine wrapping, packing",
          "qualifications": "Certificate in Food Production"
        }
      ],
      "preOperationalCosts": 40000,
      "workingCapitalBuffer": 70000,
      "ownerEquityAmount": 254000,
      "loanAmount": 80000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 18000,
        "electricity": 8500,
        "water": 2000,
        "transport": 9000,
        "marketing": 12000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Production and packaging of roasted sesame, peanut, chia seed, and honey energy bars; baked arrowroot and sweet potato chips. Delivered as NutriCrunch Sesame & Peanut Honey Energy Bar (45g) packaged in individually wrapped 45g metalized BOPP pouches displayed in 12-bar retail counter display boxes to serve school children, college students, gym enthusiasts, corporate staff seeking healthy tea-time snacks, and long-distance travelers..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "fruit_vegetable_processing",
    "number": 11,
    "title": "Dried Fruit & Juice Processing",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 150000,
      "max": 400000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Preserving Farm Fresh Nutrition with Zero Waste",
    "summary": "Solar-drying of seasonal mangoes, bananas, and African leafy vegetables; cold-press extraction and bottling of 100% natural vegetable-fruit juices.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Processed Fruit Products",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "SunHarvest Agri-Nutri Processors",
      "tagline": "Preserving Farm Fresh Nutrition with Zero Waste",
      "industrySector": "Horticultural Processing & Food Preservation",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Solar-Dehydrated Chewy Mango & Papaya Strips (100g)",
      "productPackaging": "100g clear kraft stand-up zip pouch with transparent display window",
      "unitSellingPrice": 150,
      "unitCostOfProduction": 62,
      "monthlyProductionUnitsYear1": 2500,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Health-conscious urban consumers, supermarket shoppers, school lunchboxes, and tourists seeking natural dried snacks.",
      "totalMarketPopulation": "50,000 active snack buyers in county market towns",
      "projectedMarketSharePercentage": 5,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 190 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 120 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Hybrid solar tunnel dryer with backup electric heating elements",
          "quantity": 1,
          "unitCost": 145000,
          "supplier": "Agro-Solar Technologies Kenya"
        },
        {
          "item": "Commercial stainless steel fruit slicer and peeler machine",
          "quantity": 1,
          "unitCost": 38000,
          "supplier": "Food Equipment Nairobi"
        },
        {
          "item": "Continuous impulse band sealer with date coder",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Packaging Mart"
        },
        {
          "item": "Stainless steel fruit washing and sanitizing vats",
          "quantity": 2,
          "unitCost": 22000,
          "supplier": "Local Fabricators"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh farmgate mangoes and papayas sourced in season",
          "monthlyQuantity": "2,500 kg fresh fruit",
          "monthlyCost": 85000,
          "supplier": "Makueni / Kilifi Fruit Farmers"
        },
        {
          "material": "Citric acid natural antioxidant and food-grade sanitizer",
          "monthlyQuantity": "5 kg",
          "monthlyCost": 4000,
          "supplier": "Chemical Wholesale"
        },
        {
          "material": "Branded kraft zipper pouches with transparent window",
          "monthlyQuantity": "2,500 pouches",
          "monthlyCost": 25000,
          "supplier": "Industrial Packaging"
        }
      ],
      "workshopSquareMeters": 55,
      "monthlyRent": 20000,
      "staffing": [
        {
          "position": "Production Manager / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Farm procurement, drying cycle monitoring, quality assurance",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Washing, Slicing & Packaging Attendants",
          "count": 2,
          "monthlySalary": 18000,
          "duties": "Fruit sorting, slicing, tray arrangement, pouch sealing",
          "qualifications": "Certificate in Food Hygiene"
        }
      ],
      "preOperationalCosts": 45000,
      "workingCapitalBuffer": 80000,
      "ownerEquityAmount": 297000,
      "loanAmount": 100000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 20,
      "monthlyOverheads": {
        "rent": 20000,
        "electricity": 7000,
        "water": 3000,
        "transport": 12000,
        "marketing": 10000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Solar-drying of seasonal mangoes, bananas, and African leafy vegetables; cold-press extraction and bottling of 100% natural vegetable-fruit juices. Delivered as Solar-Dehydrated Chewy Mango & Papaya Strips (100g) packaged in 100g clear kraft stand-up zip pouch with transparent display window to serve health-conscious urban consumers, supermarket shoppers, school lunchboxes, and tourists seeking natural dried snacks..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "plant_based_dairy_alternatives",
    "number": 12,
    "title": "Plant-Based Milk & Yoghurt",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 200000,
      "max": 600000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Pure Plant Nutrition for Lactose-Free Vitality",
    "summary": "Formulation and pasteurization of fortified soy milk, oat milk, coconut yoghurt, and peanut-milk drinks for lactose-intolerant and vegan consumers.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Plant Protein Beverages",
        "fee": 35000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 12000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "PlantPure Dairy Alternatives",
      "tagline": "Pure Plant Nutrition for Lactose-Free Vitality",
      "industrySector": "Plant-Based Beverages & Food Technology",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Pasteurized Fortified Soy Milk (500ml Glass Bottle)",
      "productPackaging": "500ml returnable / recyclable glass bottles with tamper-evident induction seal cap",
      "unitSellingPrice": 110,
      "unitCostOfProduction": 48,
      "monthlyProductionUnitsYear1": 3500,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Lactose-intolerant adults and children, vegans, health-conscious consumers looking for low-cholesterol milk alternatives, and baristas in specialty coffee shops.",
      "totalMarketPopulation": "75,000 urban milk consumers",
      "projectedMarketSharePercentage": 4.6,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 140 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 90 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 14000,
      "machinery": [
        {
          "item": "Automatic soya milk extractor and separator with cooker",
          "quantity": 1,
          "unitCost": 165000,
          "supplier": "Beverage Tech Supplies"
        },
        {
          "item": "Batch milk pasteurizer vat (100L capacity with cooling jacket)",
          "quantity": 1,
          "unitCost": 135000,
          "supplier": "Stainless Fabricators Nairobi"
        },
        {
          "item": "Semi-automatic bottle filling and capping machine",
          "quantity": 1,
          "unitCost": 55000,
          "supplier": "Packaging Machinery Kenya"
        },
        {
          "item": "Commercial upright cooling display chiller (600L)",
          "quantity": 1,
          "unitCost": 85000,
          "supplier": "Catering Supplies Ltd"
        }
      ],
      "rawMaterials": [
        {
          "material": "Non-GMO dry yellow soybeans and oats",
          "monthlyQuantity": "600 kg",
          "monthlyCost": 66000,
          "supplier": "Grain Wholesale"
        },
        {
          "material": "Calcium carbonate & vitamin B12 fortification premix",
          "monthlyQuantity": "5 kg",
          "monthlyCost": 12000,
          "supplier": "Nutrient Suppliers"
        },
        {
          "material": "500ml glass bottles with crown caps and branded vinyl labels",
          "monthlyQuantity": "3,500 units",
          "monthlyCost": 45000,
          "supplier": "Central Glass Industries"
        }
      ],
      "workshopSquareMeters": 65,
      "monthlyRent": 22000,
      "staffing": [
        {
          "position": "Food Processing Supervisor / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Extraction, formulation, pasteurization monitoring, sanitation",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Production Operator",
          "count": 1,
          "monthlySalary": 20000,
          "duties": "Grain soaking, machine feeding, bottle cleaning, capping",
          "qualifications": "Certificate in Food Technology"
        },
        {
          "position": "Sales & Cafe Route Dispatcher",
          "count": 1,
          "monthlySalary": 20000,
          "duties": "Cafe route deliveries, retail stocking, bottle return logistics",
          "qualifications": "Valid Driving License"
        }
      ],
      "preOperationalCosts": 55000,
      "workingCapitalBuffer": 100000,
      "ownerEquityAmount": 415000,
      "loanAmount": 180000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 22000,
        "electricity": 12000,
        "water": 4000,
        "transport": 14000,
        "marketing": 14000,
        "stationeryMisc": 4500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Formulation and pasteurization of fortified soy milk, oat milk, coconut yoghurt, and peanut-milk drinks for lactose-intolerant and vegan consumers. Delivered as Pasteurized Fortified Soy Milk (500ml Glass Bottle) packaged in 500ml returnable / recyclable glass bottles with tamper-evident induction seal cap to serve lactose-intolerant adults and children, vegans, health-conscious consumers looking for low-cholesterol milk alternatives, and baristas in specialty coffee shops..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "traditional_fermented_foods",
    "number": 13,
    "title": "Probiotic Kefir & Ferments",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 80000,
      "max": 370000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Gut-Health Vitality Through Traditional Fermentation",
    "summary": "Production of standardized, hygienic milk kefir, water kefir, and traditional probiotic fermented porridge using defined starter cultures.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Fermented Beverages",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "BioKefir Probiotic Foods",
      "tagline": "Gut-Health Vitality Through Traditional Fermentation",
      "industrySector": "Functional Probiotic Foods & Beverages",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Probiotic Milk Kefir Drink (500ml Bottle)",
      "productPackaging": "500ml food-grade recyclable HDPE bottles with tamper-evident seal",
      "unitSellingPrice": 120,
      "unitCostOfProduction": 52,
      "monthlyProductionUnitsYear1": 2000,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Individuals suffering from gut dysbiosis, IBS, or antibiotic recovery; health-conscious urban professionals seeking active probiotic cultures.",
      "totalMarketPopulation": "30,000 health-conscious consumers in local town",
      "projectedMarketSharePercentage": 6.6,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 150 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 100 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Food-grade stainless steel fermentation cooling tanks (200L)",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Dairy Craft Fabricators"
        },
        {
          "item": "Commercial milk pasteurizer vat",
          "quantity": 1,
          "unitCost": 55000,
          "supplier": "Catering & Dairy Supplies"
        },
        {
          "item": "Commercial refrigeration storage unit (400L)",
          "quantity": 1,
          "unitCost": 58000,
          "supplier": "Commercial Refrigeration Nairobi"
        },
        {
          "item": "Digital pH meter, milk refractometer and hygiene swab kit",
          "quantity": 1,
          "unitCost": 20000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh whole cow milk from tested disease-free herd",
          "monthlyQuantity": "1,100 Litres",
          "monthlyCost": 60500,
          "supplier": "Local Dairy Cooperative"
        },
        {
          "material": "Active live kefir symbiotic culture (Lactobacillus & yeasts)",
          "monthlyQuantity": "Laboratory culture",
          "monthlyCost": 8000,
          "supplier": "Biotech Supplies Kenya"
        },
        {
          "material": "500ml HDPE bottles, printed sleeves, and induction caps",
          "monthlyQuantity": "2,000 bottles",
          "monthlyCost": 24000,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 35,
      "monthlyRent": 15000,
      "staffing": [
        {
          "position": "Probiotic Processing Lead / Proprietor",
          "count": 1,
          "monthlySalary": 40000,
          "duties": "Inoculation, fermentation monitoring, acidity testing, bottling",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Packaging & Sanitation Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Bottle washing, filling, labeling, clean-in-place sanitization",
          "qualifications": "Certificate in Food Safety"
        }
      ],
      "preOperationalCosts": 35000,
      "workingCapitalBuffer": 60000,
      "ownerEquityAmount": 233000,
      "loanAmount": 60000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 15000,
        "electricity": 8000,
        "water": 2500,
        "transport": 8000,
        "marketing": 10000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Production of standardized, hygienic milk kefir, water kefir, and traditional probiotic fermented porridge using defined starter cultures. Delivered as Probiotic Milk Kefir Drink (500ml Bottle) packaged in 500ml food-grade recyclable HDPE bottles with tamper-evident seal to serve individuals suffering from gut dysbiosis, IBS, or antibiotic recovery; health-conscious urban professionals seeking active probiotic cultures..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "alternative_proteins_cricket_flour",
    "number": 14,
    "title": "High-Protein Insect Flour",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 150000,
      "max": 450000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Eco-Friendly High Protein Power from Nature",
    "summary": "Sustainable rearing, solar drying, and fine milling of crickets (Acheta domesticus) into protein-rich flour for baked goods, porridge, and pasta enrichment.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Edible Insect Products",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Processing License",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "CricketNutri Protein Millers",
      "tagline": "Eco-Friendly High Protein Power from Nature",
      "industrySector": "Alternative Proteins & Insect Agri-Processing",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Cricket Protein Baking Flour Blend (250g Pouch)",
      "productPackaging": "250g nitrogen-flushed stand-up zip pouch with full nutritional profile panel",
      "unitSellingPrice": 350,
      "unitCostOfProduction": 140,
      "monthlyProductionUnitsYear1": 1000,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.3,
      "targetCustomersDescription": "Fitness athletes requiring high digestible protein (65%+), environmentally conscious consumers, and pediatric malnutrition recovery programs.",
      "totalMarketPopulation": "25,000 health and sports nutrition buyers in urban centers",
      "projectedMarketSharePercentage": 4,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 440 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 280 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Cricket rearing mesh pens with egg-laying incubation chambers",
          "quantity": 20,
          "unitCost": 4500,
          "supplier": "Agro-Insect Fabricators"
        },
        {
          "item": "Stainless steel blanching tank and solar tunnel dryer",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Ndume Engineering"
        },
        {
          "item": "Fine stainless micro-milling machine (500 mesh)",
          "quantity": 1,
          "unitCost": 85000,
          "supplier": "Industrial Millers Kenya"
        },
        {
          "item": "Continuous band sealer with nitrogen flushing",
          "quantity": 1,
          "unitCost": 55000,
          "supplier": "Packaging Machinery Depot"
        }
      ],
      "rawMaterials": [
        {
          "material": "Dry vegetable greens, maize germ, and wheat bran insect feed",
          "monthlyQuantity": "350 kg",
          "monthlyCost": 22000,
          "supplier": "Animal Feeds Depot"
        },
        {
          "material": "Laboratory microbial testing swabs and moisture analysis",
          "monthlyQuantity": "Monthly batch tests",
          "monthlyCost": 8000,
          "supplier": "Certified Testing Lab"
        },
        {
          "material": "Branded aluminum barrier pouches (250g)",
          "monthlyQuantity": "1,000 pouches",
          "monthlyCost": 15000,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 50,
      "monthlyRent": 18000,
      "staffing": [
        {
          "position": "Insect Farm & Production Lead / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Colony rearing management, harvesting, blanching, milling",
          "qualifications": "Diploma in Food Science / Agriculture"
        },
        {
          "position": "Farm & Processing Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Feeding, pen cleaning, harvesting, pouch packaging",
          "qualifications": "Certificate in Agriculture / Food Handling"
        }
      ],
      "preOperationalCosts": 45000,
      "workingCapitalBuffer": 65000,
      "ownerEquityAmount": 315000,
      "loanAmount": 90000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 20,
      "monthlyOverheads": {
        "rent": 18000,
        "electricity": 6000,
        "water": 2500,
        "transport": 9000,
        "marketing": 12000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Sustainable rearing, solar drying, and fine milling of crickets (Acheta domesticus) into protein-rich flour for baked goods, porridge, and pasta enrichment. Delivered as Cricket Protein Baking Flour Blend (250g Pouch) packaged in 250g nitrogen-flushed stand-up zip pouch with full nutritional profile panel to serve fitness athletes requiring high digestible protein (65%+), environmentally conscious consumers, and pediatric malnutrition recovery programs..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "healthy_spreads_and_nut_butters",
    "number": 15,
    "title": "Nut Butters & Seed Oils",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 120000,
      "max": 420000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "100% Pure Nut Nutrition with Zero Added Palm Oil",
    "summary": "Production of natural peanut butter, almond butter, and cold-pressed avocado/sunflower oils with zero hydrogenated fats, zero preservatives, and low sodium.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Peanut Butter & Edible Fats",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "PureNut Spread Processors",
      "tagline": "100% Pure Nut Nutrition with Zero Added Palm Oil",
      "industrySector": "Edible Nut Processing & Healthy Spreads",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "100% Pure Creamy Peanut Butter (400g Glass Jar)",
      "productPackaging": "400g hexagonal food-grade glass jar with aluminum induction heat seal and safety tamper band",
      "unitSellingPrice": 240,
      "unitCostOfProduction": 115,
      "monthlyProductionUnitsYear1": 1800,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Health-conscious households, mothers seeking nutritious bread spreads for school lunches, bodybuilders wanting healthy fats, and hotel breakfast buffets.",
      "totalMarketPopulation": "40,000 urban households",
      "projectedMarketSharePercentage": 4.5,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 300 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 190 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Stainless steel commercial colloid mill / peanut butter grinder (3HP)",
          "quantity": 1,
          "unitCost": 110000,
          "supplier": "Ndume Machinery"
        },
        {
          "item": "Electric commercial rotating nut roaster (25kg/batch)",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Bakery Equipment Kenya"
        },
        {
          "item": "Aflatoxin screening UV black-light inspection booth",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Induction heat foil cap sealing machine",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Packaging Solutions Nairobi"
        }
      ],
      "rawMaterials": [
        {
          "material": "Aflatoxin-tested graded raw peanuts",
          "monthlyQuantity": "750 kg",
          "monthlyCost": 97500,
          "supplier": "Homa Bay Peanut Farmers"
        },
        {
          "material": "Natural iodized sea salt and pure raw honey",
          "monthlyQuantity": "25 kg",
          "monthlyCost": 7500,
          "supplier": "Local Wholesale"
        },
        {
          "material": "400g glass jars, tamper-evident seals, and waterproof labels",
          "monthlyQuantity": "1,800 units",
          "monthlyCost": 32400,
          "supplier": "Central Glass"
        }
      ],
      "workshopSquareMeters": 45,
      "monthlyRent": 18000,
      "staffing": [
        {
          "position": "Production & Quality Lead / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Nut roasting, sorting, milling, aflatoxin testing",
          "qualifications": "Diploma in Food Science / Nutrition"
        },
        {
          "position": "Jar Filling & Packaging Attendant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Jar filling, induction sealing, labeling, boxing",
          "qualifications": "Certificate in Food Hygiene"
        }
      ],
      "preOperationalCosts": 40000,
      "workingCapitalBuffer": 75000,
      "ownerEquityAmount": 256000,
      "loanAmount": 80000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 18000,
        "electricity": 9500,
        "water": 2000,
        "transport": 9000,
        "marketing": 10000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Production of natural peanut butter, almond butter, and cold-pressed avocado/sunflower oils with zero hydrogenated fats, zero preservatives, and low sodium. Delivered as 100% Pure Creamy Peanut Butter (400g Glass Jar) packaged in 400g hexagonal food-grade glass jar with aluminum induction heat seal and safety tamper band to serve health-conscious households, mothers seeking nutritious bread spreads for school lunches, bodybuilders wanting healthy fats, and hotel breakfast buffets..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "honey_processing_and_value_addition",
    "number": 16,
    "title": "Honey & Bee Value Addition",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 90000,
      "max": 250000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Unprocessed Pure Forest Honey & Propolis Wellness",
    "summary": "Refractometer moisture testing, settling, hygienic filtration, and bottling of raw multi-flora honey, ginger-infused honey, and propolis tinctures.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Honey (KS 343)",
        "fee": 30000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Handling License",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "AsaliPure Natural Foods",
      "tagline": "Unprocessed Pure Forest Honey & Propolis Wellness",
      "industrySector": "Apiculture Value Addition & Natural Sweeteners",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "100% Pure Raw Traceable Multi-Flora Honey (500g Jar)",
      "productPackaging": "500g food-grade glass jar with wax dip seal and traceable hive origin badge",
      "unitSellingPrice": 450,
      "unitCostOfProduction": 210,
      "monthlyProductionUnitsYear1": 800,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Health-conscious households replacing refined white sugar, herbal tea drinkers, singers/speakers, and consumers treating colds and respiratory symptoms.",
      "totalMarketPopulation": "35,000 households",
      "projectedMarketSharePercentage": 2.3,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 560 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 360 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Stainless steel honey settling and warming tank (150L)",
          "quantity": 1,
          "unitCost": 48000,
          "supplier": "Apiculture Fabricators"
        },
        {
          "item": "Optical honey moisture refractometer and pollen filter sieves",
          "quantity": 1,
          "unitCost": 14000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Manual rotary stainless jar filling valve and capping tool",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Packaging Machinery Depot"
        }
      ],
      "rawMaterials": [
        {
          "material": "Raw unfiltered comb honey direct from vetted beekeepers",
          "monthlyQuantity": "420 kg",
          "monthlyCost": 105000,
          "supplier": "Kitui / Baringo Beekeeping Groups"
        },
        {
          "material": "500g glass jars, tamper seals, and embossed labels",
          "monthlyQuantity": "800 jars",
          "monthlyCost": 20000,
          "supplier": "Central Glass"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 12000,
      "staffing": [
        {
          "position": "Apiculture Technologist / Founder",
          "count": 1,
          "monthlySalary": 38000,
          "duties": "Moisture testing, gravity filtering, quality testing, sales",
          "qualifications": "Diploma in Food Science / Agriculture"
        }
      ],
      "preOperationalCosts": 32000,
      "workingCapitalBuffer": 50000,
      "ownerEquityAmount": 122000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 12000,
        "electricity": 3500,
        "water": 1500,
        "transport": 8000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Refractometer moisture testing, settling, hygienic filtration, and bottling of raw multi-flora honey, ginger-infused honey, and propolis tinctures. Delivered as 100% Pure Raw Traceable Multi-Flora Honey (500g Jar) packaged in 500g food-grade glass jar with wax dip seal and traceable hive origin badge to serve health-conscious households replacing refined white sugar, herbal tea drinkers, singers/speakers, and consumers treating colds and respiratory symptoms..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "herbal_and_functional_beverages",
    "number": 17,
    "title": "Herbal & Functional Drinks",
    "group": "B",
    "groupName": "Food Processing",
    "archetype": "manufacturing",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 60000,
      "max": 180000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Revitalize Your Body with African Botanical Blends",
    "summary": "Drying, blending, and tea-bagging of indigenous functional herbs: Moringa oleifera, Hibiscus sabdariffa, lemongrass, and ginger for daily immunity and detox.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Herbal Infusions",
        "fee": 25000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Handling Certificate",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "AfyaBotanicals Herbal Teas",
      "tagline": "Revitalize Your Body with African Botanical Blends",
      "industrySector": "Herbal Infusions & Functional Beverage Processing",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Immunity Hibiscus & Moringa Herbal Tea (25 Tagged Bags Box)",
      "productPackaging": "Box of 25 unbleached paper tea bags enclosed in sealed foil pouch",
      "unitSellingPrice": 280,
      "unitCostOfProduction": 95,
      "monthlyProductionUnitsYear1": 1200,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Health-conscious urban consumers, individuals managing blood pressure and oxidative stress, tea enthusiasts seeking caffeine-free alternatives.",
      "totalMarketPopulation": "45,000 tea-drinking households",
      "projectedMarketSharePercentage": 2.7,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 350 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 220 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Electric herb dehydrator with adjustable temperature trays",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Agro Processing Equipment"
        },
        {
          "item": "Semi-automatic pedal tea bag sealing and threading machine",
          "quantity": 1,
          "unitCost": 38000,
          "supplier": "Packaging Machinery Depot"
        },
        {
          "item": "Digital precision gram scale and stainless mixing drums",
          "quantity": 1,
          "unitCost": 15000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Clean sun-dried hibiscus calyces, moringa leaves, and dried ginger",
          "monthlyQuantity": "80 kg",
          "monthlyCost": 32000,
          "supplier": "Organic Herb Growers Eastern"
        },
        {
          "material": "Unbleached filter paper bags, cotton thread, and tagged sachets",
          "monthlyQuantity": "30,000 units",
          "monthlyCost": 22000,
          "supplier": "Tea Bag Materials Depot"
        },
        {
          "material": "Branded outer paperboard boxes (25-bag capacity)",
          "monthlyQuantity": "1,200 boxes",
          "monthlyCost": 16800,
          "supplier": "Color Prints Nairobi"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 14000,
      "staffing": [
        {
          "position": "Herbal Formulation Manager / Founder",
          "count": 1,
          "monthlySalary": 38000,
          "duties": "Botanical sourcing, blending, quality assurance, distribution",
          "qualifications": "Diploma in Nutrition / Food Science"
        }
      ],
      "preOperationalCosts": 28000,
      "workingCapitalBuffer": 40000,
      "ownerEquityAmount": 136000,
      "loanAmount": 30000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 14000,
        "electricity": 4500,
        "water": 1200,
        "transport": 6000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Drying, blending, and tea-bagging of indigenous functional herbs: Moringa oleifera, Hibiscus sabdariffa, lemongrass, and ginger for daily immunity and detox. Delivered as Immunity Hibiscus & Moringa Herbal Tea (25 Tagged Bags Box) packaged in box of 25 unbleached paper tea bags enclosed in sealed foil pouch to serve health-conscious urban consumers, individuals managing blood pressure and oxidative stress, tea enthusiasts seeking caffeine-free alternatives..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  },
  {
    "id": "healthy_meal_prep_delivery",
    "number": 18,
    "title": "Healthy Meal Prep Delivery",
    "group": "C",
    "groupName": "Food Service",
    "archetype": "food_service",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 180000,
      "max": 580000
    },
    "targetTracks": [
      "clinical",
      "food_science"
    ],
    "tagline": "Chef-Crafted, Dietitian-Calibrated Meals at Your Doorstep",
    "summary": "Weekly subscription cloud kitchen preparing and delivering portion-controlled, macronutrient-balanced lunches and dinners for weight loss, keto, and diabetics.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Commercial Food Premises License",
        "fee": 15000
      },
      {
        "agency": "County Public Health",
        "requirement": "Medical Examination for Food Handlers (Form A)",
        "fee": 3000
      },
      {
        "agency": "NEMA",
        "requirement": "Kitchen Waste Water & Emission Compliance",
        "fee": 10000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Catering)",
        "fee": 12000
      }
    ],
    "defaultSpecs": {
      "businessModel": "food_service",
      "businessName": "FitBite Meal Prep Kitchen",
      "tagline": "Chef-Crafted, Dietitian-Calibrated Meals at Your Doorstep",
      "industrySector": "Food Service, Cloud Kitchens & Meal Subscription",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Weekly 5-Day Calorie-Controlled Office Lunch Box Subscription",
      "productPackaging": "Microwave-safe, leak-proof, biodegradable sugarcane pulp meal containers labeled with calorie and macro breakdown",
      "unitSellingPrice": 450,
      "unitCostOfProduction": 185,
      "monthlyProductionUnitsYear1": 1500,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Corporate office executives, bankers, IT professionals, weight watchers, and busy postpartum mothers in urban centers.",
      "totalMarketPopulation": "35,000 corporate workers in urban business parks",
      "projectedMarketSharePercentage": 4.3,
      "competitors": [
        {
          "name": "Conventional Commercial Restaurants & Fast-Food Outlets [Confirm locally]",
          "location": "Town CBD & Shopping Centers",
          "priceLevel": "KES 360 per meal",
          "strengths": "Prime street frontage, fast walk-in service, and large seating capacity",
          "weaknesses": "Menus dominated by deep-fried, high-sodium, and refined-carbohydrate dishes with no calorie or therapeutic portion control"
        },
        {
          "name": "General Outside Event & Institutional Caterers [Confirm locally]",
          "location": "Town & Sub-County Catchment",
          "priceLevel": "KES 560 per plate",
          "strengths": "Large catering equipment inventory and established event networks",
          "weaknesses": "Lack qualified dietitians on staff to formulate diabetic, renal, low-sodium, or allergen-safe therapeutic menus"
        }
      ],
      "marketingPromotionBudgetMonthly": 15000,
      "machinery": [
        {
          "item": "Commercial 4-burner gas cooking range and convection oven",
          "quantity": 1,
          "unitCost": 110000,
          "supplier": "Catering Equipment Nairobi"
        },
        {
          "item": "Commercial two-door stainless steel refrigeration chiller",
          "quantity": 1,
          "unitCost": 85000,
          "supplier": "Refrigeration Centre"
        },
        {
          "item": "Stainless steel food prep tables, sinks, and knife sanitizers",
          "quantity": 2,
          "unitCost": 45000,
          "supplier": "Stainless Fabricators"
        },
        {
          "item": "Commercial digital food portioning scales",
          "quantity": 2,
          "unitCost": 14000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh poultry, lean beef, fish fillet, legumes, and eggs",
          "monthlyQuantity": "250 kg",
          "monthlyCost": 112500,
          "supplier": "Quality Butchery & Poultry"
        },
        {
          "material": "Fresh vegetables, complex grains (brown rice, quinoa, sweet potatoes)",
          "monthlyQuantity": "400 kg",
          "monthlyCost": 65000,
          "supplier": "Wakulima Wholesale Market"
        },
        {
          "material": "Biodegradable sugarcane pulp meal containers with clear PET lids",
          "monthlyQuantity": "1,500 units",
          "monthlyCost": 37500,
          "supplier": "EcoPack Supplies"
        }
      ],
      "workshopSquareMeters": 50,
      "monthlyRent": 25000,
      "staffing": [
        {
          "position": "Dietitian & Kitchen Director / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Menu calibration, nutritional calculation, client meal planning",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Head Culinary Chef",
          "count": 1,
          "monthlySalary": 30000,
          "duties": "Bulk recipe execution, portioning, food hygiene",
          "qualifications": "Diploma in Food Production / Culinary Arts"
        },
        {
          "position": "Kitchen Steward & Prep Cook",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Ingredient prep, dish sanitization, kitchen cleaning",
          "qualifications": "Certificate in Food Hygiene"
        },
        {
          "position": "Dedicated Motorcycle Delivery Dispatcher",
          "count": 1,
          "monthlySalary": 22000,
          "duties": "Timely hot lunch delivery across corporate offices",
          "qualifications": "Valid Driving/Riding License"
        }
      ],
      "preOperationalCosts": 55000,
      "workingCapitalBuffer": 95000,
      "ownerEquityAmount": 323000,
      "loanAmount": 140000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 25000,
        "electricity": 9000,
        "water": 4500,
        "transport": 15000,
        "marketing": 15000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC) with practical competency in therapeutic menu engineering, institutional food service management, and County Public Health food safety compliance.",
      "productDescription": "Weekly subscription cloud kitchen preparing and delivering portion-controlled, macronutrient-balanced lunches and dinners for weight loss, keto, and diabetics. Delivered as Weekly 5-Day Calorie-Controlled Office Lunch Box Subscription packaged in microwave-safe, leak-proof, biodegradable sugarcane pulp meal containers labeled with calorie and macro breakdown to serve corporate office executives, bankers, IT professionals, weight watchers, and busy postpartum mothers in urban centers..",
      "streetOrBuilding": "Town Commercial Center, High-Visibility Ground Floor Food Unit",
      "locationRationale": "Located within a busy commercial and institutional catchment with high daytime pedestrian traffic, reliable municipal water and power supply, hygienic waste disposal, and fast rider dispatch routes for meal deliveries."
    }
  },
  {
    "id": "institutional_therapeutic_catering",
    "number": 19,
    "title": "Hospital & School Catering",
    "group": "C",
    "groupName": "Food Service",
    "archetype": "food_service",
    "capitalTier": "High",
    "estimatedCapitalKES": {
      "min": 350000,
      "max": 850000
    },
    "targetTracks": [
      "clinical",
      "food_science"
    ],
    "tagline": "Clinical Dietary Excellence for Recovery Facilities",
    "summary": "Outsourced inpatient therapeutic diet management for private nursing homes, hospices, rehabilitation clinics, and boarding schools.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Institutional Catering License",
        "fee": 18000
      },
      {
        "agency": "County Public Health",
        "requirement": "Food Handlers Medical Certifications",
        "fee": 6000
      }
    ],
    "defaultSpecs": {
      "businessModel": "food_service",
      "businessName": "TheraCare Institutional Caterers",
      "tagline": "Clinical Dietary Excellence for Recovery Facilities",
      "industrySector": "Hospitality, Healthcare Catering & Clinical Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Full-Day Inpatient Therapeutic Diet Service (B/L/D)",
      "productPackaging": "Individually plated insulated thermal trays with labeled patient bed and diet restriction cards",
      "unitSellingPrice": 750,
      "unitCostOfProduction": 310,
      "monthlyProductionUnitsYear1": 1800,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.2,
      "targetCustomersDescription": "Private hospital inpatients, elderly nursing homes, post-operative recovery homes, and specialized boarding schools.",
      "totalMarketPopulation": "12 private medical institutions within 20km radius",
      "projectedMarketSharePercentage": 25,
      "competitors": [
        {
          "name": "Conventional Commercial Restaurants & Fast-Food Outlets [Confirm locally]",
          "location": "Town CBD & Shopping Centers",
          "priceLevel": "KES 600 per meal",
          "strengths": "Prime street frontage, fast walk-in service, and large seating capacity",
          "weaknesses": "Menus dominated by deep-fried, high-sodium, and refined-carbohydrate dishes with no calorie or therapeutic portion control"
        },
        {
          "name": "General Outside Event & Institutional Caterers [Confirm locally]",
          "location": "Town & Sub-County Catchment",
          "priceLevel": "KES 940 per plate",
          "strengths": "Large catering equipment inventory and established event networks",
          "weaknesses": "Lack qualified dietitians on staff to formulate diabetic, renal, low-sodium, or allergen-safe therapeutic menus"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Heavy commercial 6-burner gas stove with dual ovens",
          "quantity": 1,
          "unitCost": 145000,
          "supplier": "Catering Solutions Kenya"
        },
        {
          "item": "Industrial insulated mobile food transport carts (Thermal hot/cold)",
          "quantity": 2,
          "unitCost": 85000,
          "supplier": "Hospital Supplies Depot"
        },
        {
          "item": "Commercial walk-in cold room / dual compressor chiller (800L)",
          "quantity": 1,
          "unitCost": 160000,
          "supplier": "Refrigeration Nairobi"
        },
        {
          "item": "Stainless steam boiling pans and immersion blenders for pureed diets",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Food Equipment Ltd"
        }
      ],
      "rawMaterials": [
        {
          "material": "Therapeutic whole foods (Low sodium broths, lean proteins, high fiber grains)",
          "monthlyQuantity": "1,200 kg",
          "monthlyCost": 280000,
          "supplier": "Institutional Food Wholesalers"
        },
        {
          "material": "Medical nutrition supplements and thickeners for dysphagia",
          "monthlyQuantity": "Monthly supplies",
          "monthlyCost": 45000,
          "supplier": "Chemist Depot"
        }
      ],
      "workshopSquareMeters": 90,
      "monthlyRent": 35000,
      "staffing": [
        {
          "position": "Lead Clinical Dietitian / Founder",
          "count": 1,
          "monthlySalary": 50000,
          "duties": "Patient diet chart review, allergy safety, clinical audits",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Executive Hospital Chef",
          "count": 1,
          "monthlySalary": 35000,
          "duties": "Therapeutic meal cooking, hygiene oversight",
          "qualifications": "Diploma in Culinary Arts"
        },
        {
          "position": "Kitchen Cooks & Plating Assistants",
          "count": 2,
          "monthlySalary": 20000,
          "duties": "Dietary tray prep, portion weighing, sanitization",
          "qualifications": "Certificate in Food Handling"
        }
      ],
      "preOperationalCosts": 70000,
      "workingCapitalBuffer": 160000,
      "ownerEquityAmount": 550000,
      "loanAmount": 220000,
      "loanInterestRateAnnual": 12.5,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 35000,
        "electricity": 16000,
        "water": 6000,
        "transport": 18000,
        "marketing": 12000,
        "stationeryMisc": 5000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC) with practical competency in therapeutic menu engineering, institutional food service management, and County Public Health food safety compliance.",
      "productDescription": "Outsourced inpatient therapeutic diet management for private nursing homes, hospices, rehabilitation clinics, and boarding schools. Delivered as Full-Day Inpatient Therapeutic Diet Service (B/L/D) packaged in individually plated insulated thermal trays with labeled patient bed and diet restriction cards to serve private hospital inpatients, elderly nursing homes, post-operative recovery homes, and specialized boarding schools..",
      "streetOrBuilding": "Town Commercial Center, High-Visibility Ground Floor Food Unit",
      "locationRationale": "Located within a busy commercial and institutional catchment with high daytime pedestrian traffic, reliable municipal water and power supply, hygienic waste disposal, and fast rider dispatch routes for meal deliveries."
    }
  },
  {
    "id": "corporate_event_nutrition_catering",
    "number": 20,
    "title": "Corporate Wellness Catering",
    "group": "C",
    "groupName": "Food Service",
    "archetype": "food_service",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 150000,
      "max": 380000
    },
    "targetTracks": [
      "food_science",
      "community"
    ],
    "tagline": "Energizing Conferences with Mindful, Nutritious Menus",
    "summary": "Catering for boardrooms, wellness retreats, NGO seminars, and conferences with guilt-free, low-glycemic, energizing meals and mocktails.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Outdoor Catering Permit",
        "fee": 12000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "food_service",
      "businessName": "ExecutiveVitality Catering",
      "tagline": "Energizing Conferences with Mindful, Nutritious Menus",
      "industrySector": "Corporate Hospitality & Event Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Full-Day Corporate Wellness Conference Buffet Package",
      "productPackaging": "Elegant buffet chafing stations with allergen, calorie, and macro display plaques beside every dish",
      "unitSellingPrice": 1200,
      "unitCostOfProduction": 490,
      "monthlyProductionUnitsYear1": 600,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Corporate HR departments, banks, insurance companies, NGOs, United Nations agencies, and executive wellness retreat organizers.",
      "totalMarketPopulation": "150 corporate and NGO offices in county hub",
      "projectedMarketSharePercentage": 8,
      "competitors": [
        {
          "name": "Conventional Commercial Restaurants & Fast-Food Outlets [Confirm locally]",
          "location": "Town CBD & Shopping Centers",
          "priceLevel": "KES 960 per meal",
          "strengths": "Prime street frontage, fast walk-in service, and large seating capacity",
          "weaknesses": "Menus dominated by deep-fried, high-sodium, and refined-carbohydrate dishes with no calorie or therapeutic portion control"
        },
        {
          "name": "General Outside Event & Institutional Caterers [Confirm locally]",
          "location": "Town & Sub-County Catchment",
          "priceLevel": "KES 1500 per plate",
          "strengths": "Large catering equipment inventory and established event networks",
          "weaknesses": "Lack qualified dietitians on staff to formulate diabetic, renal, low-sodium, or allergen-safe therapeutic menus"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Stainless steel roll-top buffet chafing dishes",
          "quantity": 8,
          "unitCost": 8500,
          "supplier": "Hotel Supplies Nairobi"
        },
        {
          "item": "Commercial outdoor gas burners and transportable food warmers",
          "quantity": 2,
          "unitCost": 35000,
          "supplier": "Catering Equipment Kenya"
        },
        {
          "item": "Complete corporate cutlery, chinaware, and water goblet set (100 pax)",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Hospitality Mart"
        }
      ],
      "rawMaterials": [
        {
          "material": "Premium fresh vegetables, organic chicken, fresh fish, and fruit",
          "monthlyQuantity": "Per event batches",
          "monthlyCost": 165000,
          "supplier": "Farmers Wholesale"
        },
        {
          "material": "Natural fruit infusions, herbs, and biodegradable napkins",
          "monthlyQuantity": "Event consumables",
          "monthlyCost": 25000,
          "supplier": "EcoPack"
        }
      ],
      "workshopSquareMeters": 45,
      "monthlyRent": 20000,
      "staffing": [
        {
          "position": "Event Director & Dietitian / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Corporate sales, menu formulation, client liaison, event execution",
          "qualifications": "Diploma in Nutrition / Hospitality"
        },
        {
          "position": "Event Head Chef",
          "count": 1,
          "monthlySalary": 30000,
          "duties": "Event cooking, presentation styling, hygiene compliance",
          "qualifications": "Diploma in Culinary Arts"
        },
        {
          "position": "Casual Event Service Staff (On-call)",
          "count": 2,
          "monthlySalary": 15000,
          "duties": "Buffet replenishment, guest service, breakdown",
          "qualifications": "Food Hygiene Certificate"
        }
      ],
      "preOperationalCosts": 45000,
      "workingCapitalBuffer": 85000,
      "ownerEquityAmount": 223000,
      "loanAmount": 110000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 20000,
        "electricity": 6000,
        "water": 2500,
        "transport": 15000,
        "marketing": 12000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC) with practical competency in therapeutic menu engineering, institutional food service management, and County Public Health food safety compliance.",
      "productDescription": "Catering for boardrooms, wellness retreats, NGO seminars, and conferences with guilt-free, low-glycemic, energizing meals and mocktails. Delivered as Full-Day Corporate Wellness Conference Buffet Package packaged in elegant buffet chafing stations with allergen, calorie, and macro display plaques beside every dish to serve corporate HR departments, banks, insurance companies, NGOs, United Nations agencies, and executive wellness retreat organizers..",
      "streetOrBuilding": "Town Commercial Center, High-Visibility Ground Floor Food Unit",
      "locationRationale": "Located within a busy commercial and institutional catchment with high daytime pedestrian traffic, reliable municipal water and power supply, hygienic waste disposal, and fast rider dispatch routes for meal deliveries."
    }
  },
  {
    "id": "healthy_eateries_and_juice_bars",
    "number": 21,
    "title": "Salad & Cold-Pressed Juice Bar",
    "group": "C",
    "groupName": "Food Service",
    "archetype": "food_service",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 250000,
      "max": 750000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Fresh Crisp Greens and Cold-Pressed Energy",
    "summary": "Grab-and-go kiosk inside shopping malls, gym lobbies, or campus centers serving customized toss-your-own salads, green smoothies, and fruit parfaits.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Food Premises License",
        "fee": 12000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Kiosk/Shop)",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "food_service",
      "businessName": "GreenPulse Salad & Juice Bar",
      "tagline": "Fresh Crisp Greens and Cold-Pressed Energy",
      "industrySector": "Quick Service Healthy Restaurants & Juice Bars",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Custom Tossed Protein Salad Bowl & Cold-Pressed Green Juice",
      "productPackaging": "Clear compostable PLA salad bowls with dressing cups and sealed RPET juice bottles",
      "unitSellingPrice": 400,
      "unitCostOfProduction": 165,
      "monthlyProductionUnitsYear1": 2200,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Health-conscious shoppers, gym-goers, university students, medical staff, and working professionals seeking quick, guilt-free lunches.",
      "totalMarketPopulation": "45,000 foot traffic visitors per month in retail center",
      "projectedMarketSharePercentage": 4.8,
      "competitors": [
        {
          "name": "Conventional Commercial Restaurants & Fast-Food Outlets [Confirm locally]",
          "location": "Town CBD & Shopping Centers",
          "priceLevel": "KES 320 per meal",
          "strengths": "Prime street frontage, fast walk-in service, and large seating capacity",
          "weaknesses": "Menus dominated by deep-fried, high-sodium, and refined-carbohydrate dishes with no calorie or therapeutic portion control"
        },
        {
          "name": "General Outside Event & Institutional Caterers [Confirm locally]",
          "location": "Town & Sub-County Catchment",
          "priceLevel": "KES 500 per plate",
          "strengths": "Large catering equipment inventory and established event networks",
          "weaknesses": "Lack qualified dietitians on staff to formulate diabetic, renal, low-sodium, or allergen-safe therapeutic menus"
        }
      ],
      "marketingPromotionBudgetMonthly": 14000,
      "machinery": [
        {
          "item": "Stainless steel refrigerated salad prep counter with GN ingredient pans",
          "quantity": 1,
          "unitCost": 145000,
          "supplier": "Catering Equipment Nairobi"
        },
        {
          "item": "Commercial high-speed blender (OmniBlend / Vitamix) with sound enclosure",
          "quantity": 2,
          "unitCost": 55000,
          "supplier": "Beverage Supplies Kenya"
        },
        {
          "item": "Heavy-duty commercial cold press masticating masticator juicer",
          "quantity": 1,
          "unitCost": 48000,
          "supplier": "Juice Tech Equipment"
        },
        {
          "item": "Under-counter beverage refrigerator and ice maker",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Commercial Refrigeration Depot"
        }
      ],
      "rawMaterials": [
        {
          "material": "Hydroponic lettuce, baby spinach, cherry tomatoes, cucumbers, avocado",
          "monthlyQuantity": "350 kg",
          "monthlyCost": 70000,
          "supplier": "Local Hydroponic Farm"
        },
        {
          "material": "Grilled chicken strips, boiled eggs, chickpeas, feta cheese, and dressings",
          "monthlyQuantity": "180 kg",
          "monthlyCost": 65000,
          "supplier": "Quality Butchery"
        },
        {
          "material": "Compostable PLA salad bowls, wooden forks, and juice cups",
          "monthlyQuantity": "2,200 sets",
          "monthlyCost": 44000,
          "supplier": "EcoPack"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 28000,
      "staffing": [
        {
          "position": "Kiosk Manager & Nutrition Lead / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Inventory control, menu development, cash reconciliation",
          "qualifications": "Diploma in Nutrition / Hospitality"
        },
        {
          "position": "Salad & Smoothie Baristas",
          "count": 2,
          "monthlySalary": 20000,
          "duties": "Customer service, salad assembly, juice extraction, cleaning",
          "qualifications": "Certificate in Food & Beverage"
        }
      ],
      "preOperationalCosts": 50000,
      "workingCapitalBuffer": 90000,
      "ownerEquityAmount": 358000,
      "loanAmount": 150000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 28000,
        "electricity": 11000,
        "water": 3500,
        "transport": 10000,
        "marketing": 14000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC) with practical competency in therapeutic menu engineering, institutional food service management, and County Public Health food safety compliance.",
      "productDescription": "Grab-and-go kiosk inside shopping malls, gym lobbies, or campus centers serving customized toss-your-own salads, green smoothies, and fruit parfaits. Delivered as Custom Tossed Protein Salad Bowl & Cold-Pressed Green Juice packaged in clear compostable PLA salad bowls with dressing cups and sealed RPET juice bottles to serve health-conscious shoppers, gym-goers, university students, medical staff, and working professionals seeking quick, guilt-free lunches..",
      "streetOrBuilding": "Town Commercial Center, High-Visibility Ground Floor Food Unit",
      "locationRationale": "Located within a busy commercial and institutional catchment with high daytime pedestrian traffic, reliable municipal water and power supply, hygienic waste disposal, and fast rider dispatch routes for meal deliveries."
    }
  },
  {
    "id": "nutrition_sensitive_farming_ofsp",
    "number": 22,
    "title": "Biofortified Sweet Potato & Beans",
    "group": "D",
    "groupName": "Agribusiness",
    "archetype": "agribusiness",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 100000,
      "max": 300000
    },
    "targetTracks": [
      "community",
      "food_science"
    ],
    "tagline": "Combating Micronutrient Deficiency from the Soil Up",
    "summary": "Multiplication and commercial farming of Vitamin A-rich Orange-Fleshed Sweet Potato (OFSP) vines and Iron-Rich Nyota beans for seed and tuber supply.",
    "compliance": [
      {
        "agency": "KEPHIS",
        "requirement": "Seed & Vine Certification",
        "fee": 10000
      },
      {
        "agency": "County Agricultural Office",
        "requirement": "Agribusiness Single Business Permit",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "agribusiness",
      "businessName": "BioNutri Farms Ltd",
      "tagline": "Combating Micronutrient Deficiency from the Soil Up",
      "industrySector": "Biofortified Crop Production & Seed Multiplication",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Clean Certified OFSP Vines & Harvested Biofortified Tubers",
      "productPackaging": "Bundles of 100 clean vines and 50kg aerated mesh bags of sorted tubers",
      "unitSellingPrice": 3500,
      "unitCostOfProduction": 1400,
      "monthlyProductionUnitsYear1": 120,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.2,
      "targetCustomersDescription": "Smallholder farmers, flour millers, school feeding initiatives, and county agriculture projects.",
      "totalMarketPopulation": "1,500 local farmers and 10 flour processors in the region",
      "projectedMarketSharePercentage": 8,
      "competitors": [
        {
          "name": "Conventional Open-Air Market Produce Brokers [Confirm locally]",
          "location": "Municipal Wholesale & Retail Markets",
          "priceLevel": "KES 2800 per unit",
          "strengths": "High daily volume availability and established market stalls",
          "weaknesses": "Supply non-biofortified varieties, poor post-harvest handling, high spoilage, and zero traceability or grading"
        },
        {
          "name": "Large Commercial Agribusiness & Seed Suppliers [Confirm locally]",
          "location": "Regional Towns & Supermarket Produce Sections",
          "priceLevel": "KES 4380 per unit",
          "strengths": "Consistent packaging and formal supermarket supply contracts",
          "weaknesses": "High retail markups and lack of community farmer extension support or local home-delivery flexibility"
        }
      ],
      "marketingPromotionBudgetMonthly": 6000,
      "machinery": [
        {
          "item": "Drip irrigation system kit with solar booster pump (1 acre)",
          "quantity": 1,
          "unitCost": 95000,
          "supplier": "Agri-Irrigation Supplies"
        },
        {
          "item": "Net shade nursery greenhouse for clean vine multiplication",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Greenhouse Tech Kenya"
        },
        {
          "item": "Farm tools, knapsack sprayers, and harvesting crates",
          "quantity": 1,
          "unitCost": 18000,
          "supplier": "Local Agrovet"
        }
      ],
      "rawMaterials": [
        {
          "material": "Certified pre-basic OFSP disease-free plantlets (KALRO vetted)",
          "monthlyQuantity": "Initial batch",
          "monthlyCost": 25000,
          "supplier": "KALRO Katumani"
        },
        {
          "material": "Organic compost manure and certified bio-fertilizers",
          "monthlyQuantity": "Monthly inputs",
          "monthlyCost": 15000,
          "supplier": "Local Organic Inputs"
        },
        {
          "material": "50kg aerated mesh sacks and vine tying twine",
          "monthlyQuantity": "150 sacks",
          "monthlyCost": 7500,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 4000,
      "monthlyRent": 12000,
      "staffing": [
        {
          "position": "Agronomist & Enterprise Lead / Founder",
          "count": 1,
          "monthlySalary": 40000,
          "duties": "Crop husbandry, nursery hygiene, farmer training, sales",
          "qualifications": "Diploma in Agriculture / Nutrition"
        },
        {
          "position": "Farm Hands",
          "count": 2,
          "monthlySalary": 15000,
          "duties": "Land prep, weeding, irrigation, harvesting, grading",
          "qualifications": "Practical Farm Experience"
        }
      ],
      "preOperationalCosts": 30000,
      "workingCapitalBuffer": 50000,
      "ownerEquityAmount": 178000,
      "loanAmount": 60000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 12000,
        "electricity": 3000,
        "water": 2500,
        "transport": 8000,
        "marketing": 6000,
        "stationeryMisc": 2000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Nutrition-Sensitive Agriculture (KNEC), experienced in biofortified crop value chains, post-harvest nutrient preservation, and smallholder farmer aggregation.",
      "productDescription": "Multiplication and commercial farming of Vitamin A-rich Orange-Fleshed Sweet Potato (OFSP) vines and Iron-Rich Nyota beans for seed and tuber supply. Delivered as Clean Certified OFSP Vines & Harvested Biofortified Tubers packaged in bundles of 100 clean vines and 50kg aerated mesh bags of sorted tubers to serve smallholder farmers, flour millers, school feeding initiatives, and county agriculture projects..",
      "streetOrBuilding": "Peri-Urban Agricultural Aggregation & Production Plot",
      "locationRationale": "Positioned in a peri-urban agricultural belt with fertile plot space, reliable water access for irrigation and washing, low lease overhead, and direct road connectivity to urban retail markets and institutional buyers."
    }
  },
  {
    "id": "urban_farming_microgreens",
    "number": 23,
    "title": "Microgreens & Urban Farming",
    "group": "D",
    "groupName": "Agribusiness",
    "archetype": "agribusiness",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 45000,
      "max": 200000
    },
    "targetTracks": [
      "community",
      "food_science"
    ],
    "tagline": "Concentrated Superfood Nutrition from Compact Spaces",
    "summary": "Indoor high-density vertical rack production of living microgreens (sunflower, radish, broccoli, peas) delivering 4x–40x higher nutrient density than mature plants.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Fresh Produce Hygiene Clearance",
        "fee": 5000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Urban Farming)",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "agribusiness",
      "businessName": "UrbanSprout Microgreens",
      "tagline": "Concentrated Superfood Nutrition from Compact Spaces",
      "industrySector": "Urban Agriculture & Vertical Horticulture",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Fresh Living Sunflower & Radish Microgreen Punnets (100g)",
      "productPackaging": "100g clear ventilated clamshell punnets with moisture absorption pads",
      "unitSellingPrice": 150,
      "unitCostOfProduction": 38,
      "monthlyProductionUnitsYear1": 1000,
      "annualGrowthRateYear2": 0.35,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "High-end restaurants, boutique salad bars, health-conscious urban households, and consumers fighting chronic inflammation.",
      "totalMarketPopulation": "30 high-end restaurants and 5,000 health shoppers in municipality",
      "projectedMarketSharePercentage": 15,
      "competitors": [
        {
          "name": "Conventional Open-Air Market Produce Brokers [Confirm locally]",
          "location": "Municipal Wholesale & Retail Markets",
          "priceLevel": "KES 120 per unit",
          "strengths": "High daily volume availability and established market stalls",
          "weaknesses": "Supply non-biofortified varieties, poor post-harvest handling, high spoilage, and zero traceability or grading"
        },
        {
          "name": "Large Commercial Agribusiness & Seed Suppliers [Confirm locally]",
          "location": "Regional Towns & Supermarket Produce Sections",
          "priceLevel": "KES 190 per unit",
          "strengths": "Consistent packaging and formal supermarket supply contracts",
          "weaknesses": "High retail markups and lack of community farmer extension support or local home-delivery flexibility"
        }
      ],
      "marketingPromotionBudgetMonthly": 6000,
      "machinery": [
        {
          "item": "5-tier vertical steel growing racks with automated LED grow lights",
          "quantity": 2,
          "unitCost": 42000,
          "supplier": "Hydroponics Kenya"
        },
        {
          "item": "Automated micro-misting irrigation timer and pump",
          "quantity": 1,
          "unitCost": 14000,
          "supplier": "Agri-Tech Supplies"
        },
        {
          "item": "Digital climate hygrometer and precision seed balance",
          "quantity": 1,
          "unitCost": 8000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Certified non-GMO microgreen seeds (Sunflower, radish, pea, amaranth)",
          "monthlyQuantity": "25 kg",
          "monthlyCost": 15000,
          "supplier": "Specialized Seed Imports"
        },
        {
          "material": "Sterile coco-peat growing medium / hemp germination mats",
          "monthlyQuantity": "50 kg",
          "monthlyCost": 6000,
          "supplier": "Horticulture Depot"
        },
        {
          "material": "100g recyclable clear clamshell punnets with labels",
          "monthlyQuantity": "1,000 units",
          "monthlyCost": 9000,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 20,
      "monthlyRent": 8000,
      "staffing": [
        {
          "position": "Urban Farm Lead / Proprietor",
          "count": 1,
          "monthlySalary": 35000,
          "duties": "Seeding, harvest scheduling, restaurant delivery, chef sales",
          "qualifications": "Diploma in Nutrition / Horticulture"
        }
      ],
      "preOperationalCosts": 20000,
      "workingCapitalBuffer": 30000,
      "ownerEquityAmount": 131000,
      "loanAmount": 25000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 12,
      "monthlyOverheads": {
        "rent": 8000,
        "electricity": 4000,
        "water": 1500,
        "transport": 5000,
        "marketing": 6000,
        "stationeryMisc": 2000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Nutrition-Sensitive Agriculture (KNEC), experienced in biofortified crop value chains, post-harvest nutrient preservation, and smallholder farmer aggregation.",
      "productDescription": "Indoor high-density vertical rack production of living microgreens (sunflower, radish, broccoli, peas) delivering 4x–40x higher nutrient density than mature plants. Delivered as Fresh Living Sunflower & Radish Microgreen Punnets (100g) packaged in 100g clear ventilated clamshell punnets with moisture absorption pads to serve high-end restaurants, boutique salad bars, health-conscious urban households, and consumers fighting chronic inflammation..",
      "streetOrBuilding": "Peri-Urban Agricultural Aggregation & Production Plot",
      "locationRationale": "Positioned in a peri-urban agricultural belt with fertile plot space, reliable water access for irrigation and washing, low lease overhead, and direct road connectivity to urban retail markets and institutional buyers."
    }
  },
  {
    "id": "animal_source_omega3_eggs",
    "number": 24,
    "title": "Omega-3 Pastured Eggs",
    "group": "D",
    "groupName": "Agribusiness",
    "archetype": "agribusiness",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 180000,
      "max": 500000
    },
    "targetTracks": [
      "community",
      "food_science"
    ],
    "tagline": "Natural Omega-3 & Lutein Enriched Nutrition from Happy Hens",
    "summary": "Pastured poultry farming using specialized diets supplemented with flaxseed, moringa, and alfalfa to produce verified Omega-3 and Lutein-enriched table eggs.",
    "compliance": [
      {
        "agency": "County Directorate of Veterinary Services",
        "requirement": "Poultry Farm Veterinary Clearance",
        "fee": 5000
      },
      {
        "agency": "County Public Health",
        "requirement": "Premises Sanitation Permit",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "agribusiness",
      "businessName": "NutriEgg Bio-Poultry",
      "tagline": "Natural Omega-3 & Lutein Enriched Nutrition from Happy Hens",
      "industrySector": "Poultry Production & Animal-Source Foods",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Omega-3 Enriched Free-Range Table Eggs (Tray of 30)",
      "productPackaging": "Biodegradable molded paper egg trays of 30 with branded certification seal",
      "unitSellingPrice": 520,
      "unitCostOfProduction": 285,
      "monthlyProductionUnitsYear1": 450,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Parents prioritizing brain development in young children, cardiovascular patients seeking healthy fats, and health-focused bakers.",
      "totalMarketPopulation": "30,000 households",
      "projectedMarketSharePercentage": 3.5,
      "competitors": [
        {
          "name": "Conventional Open-Air Market Produce Brokers [Confirm locally]",
          "location": "Municipal Wholesale & Retail Markets",
          "priceLevel": "KES 420 per unit",
          "strengths": "High daily volume availability and established market stalls",
          "weaknesses": "Supply non-biofortified varieties, poor post-harvest handling, high spoilage, and zero traceability or grading"
        },
        {
          "name": "Large Commercial Agribusiness & Seed Suppliers [Confirm locally]",
          "location": "Regional Towns & Supermarket Produce Sections",
          "priceLevel": "KES 650 per unit",
          "strengths": "Consistent packaging and formal supermarket supply contracts",
          "weaknesses": "High retail markups and lack of community farmer extension support or local home-delivery flexibility"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Pastured mobile poultry coop with predator-proof netting (300 hens)",
          "quantity": 1,
          "unitCost": 85000,
          "supplier": "Poultry Structures Kenya"
        },
        {
          "item": "Automatic bell drinkers, tube feeders, and nest boxes",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Agrovet Wholesale"
        },
        {
          "item": "Digital egg candler and electronic grading balance",
          "quantity": 1,
          "unitCost": 15000,
          "supplier": "Lab Equipment Kenya"
        }
      ],
      "rawMaterials": [
        {
          "material": "Certified layer mash supplemented with flaxseed, moringa, and limestone",
          "monthlyQuantity": "1,100 kg",
          "monthlyCost": 77000,
          "supplier": "Animal Feeds Millers"
        },
        {
          "material": "Veterinary vaccines (Newcastle, Gumboro, Fowl Typhoid) & vitamins",
          "monthlyQuantity": "Monthly doses",
          "monthlyCost": 6500,
          "supplier": "Registered Vet Chemist"
        },
        {
          "material": "Molded paper egg pulp trays (30 eggs) with branded tamper tape",
          "monthlyQuantity": "450 trays",
          "monthlyCost": 9000,
          "supplier": "Packaging Depot"
        }
      ],
      "workshopSquareMeters": 500,
      "monthlyRent": 12000,
      "staffing": [
        {
          "position": "Poultry Manager & Nutritionist / Founder",
          "count": 1,
          "monthlySalary": 38000,
          "duties": "Feed formulation, flock health, egg collection, retail dispatch",
          "qualifications": "Diploma in Agriculture / Nutrition"
        },
        {
          "position": "Poultry Attendant",
          "count": 1,
          "monthlySalary": 16000,
          "duties": "Feeding, egg gathering, coop cleaning, pasture rotation",
          "qualifications": "Poultry Handling Experience"
        }
      ],
      "preOperationalCosts": 35000,
      "workingCapitalBuffer": 65000,
      "ownerEquityAmount": 138000,
      "loanAmount": 90000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 12000,
        "electricity": 3500,
        "water": 2500,
        "transport": 9000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Nutrition-Sensitive Agriculture (KNEC), experienced in biofortified crop value chains, post-harvest nutrient preservation, and smallholder farmer aggregation.",
      "productDescription": "Pastured poultry farming using specialized diets supplemented with flaxseed, moringa, and alfalfa to produce verified Omega-3 and Lutein-enriched table eggs. Delivered as Omega-3 Enriched Free-Range Table Eggs (Tray of 30) packaged in biodegradable molded paper egg trays of 30 with branded certification seal to serve parents prioritizing brain development in young children, cardiovascular patients seeking healthy fats, and health-focused bakers..",
      "streetOrBuilding": "Peri-Urban Agricultural Aggregation & Production Plot",
      "locationRationale": "Positioned in a peri-urban agricultural belt with fertile plot space, reliable water access for irrigation and washing, low lease overhead, and direct road connectivity to urban retail markets and institutional buyers."
    }
  },
  {
    "id": "post_harvest_preservation_solar",
    "number": 25,
    "title": "Solar Dried Indigenous Greens",
    "group": "D",
    "groupName": "Agribusiness",
    "archetype": "agribusiness",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 120000,
      "max": 320000
    },
    "targetTracks": [
      "community",
      "food_science"
    ],
    "tagline": "Bridging the Farm-to-Market Gap by Eliminating Food Spoilage",
    "summary": "Community aggregation, solar drying, and hermetic packaging of indigenous vegetables (managu, terere, saga) to reduce 40% post-harvest farm losses.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Food Handling License",
        "fee": 8000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Agribusiness Hub)",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "agribusiness",
      "businessName": "AgriSave Post-Harvest Solutions",
      "tagline": "Bridging the Farm-to-Market Gap by Eliminating Food Spoilage",
      "industrySector": "Post-Harvest Loss Reduction & Agricultural Preservation",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Dehydrated African Leafy Vegetables (Terere/Managu 100g)",
      "productPackaging": "100g airtight moisture-barrier foil pouches preserving color and nutrients for 12 months",
      "unitSellingPrice": 120,
      "unitCostOfProduction": 48,
      "monthlyProductionUnitsYear1": 1800,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Supermarket chains, urban households wanting traditional greens without tedious sorting, boarding institutions, and export diaspora.",
      "totalMarketPopulation": "30,000 households and 15 supermarkets",
      "projectedMarketSharePercentage": 6,
      "competitors": [
        {
          "name": "Conventional Open-Air Market Produce Brokers [Confirm locally]",
          "location": "Municipal Wholesale & Retail Markets",
          "priceLevel": "KES 100 per unit",
          "strengths": "High daily volume availability and established market stalls",
          "weaknesses": "Supply non-biofortified varieties, poor post-harvest handling, high spoilage, and zero traceability or grading"
        },
        {
          "name": "Large Commercial Agribusiness & Seed Suppliers [Confirm locally]",
          "location": "Regional Towns & Supermarket Produce Sections",
          "priceLevel": "KES 150 per unit",
          "strengths": "Consistent packaging and formal supermarket supply contracts",
          "weaknesses": "High retail markups and lack of community farmer extension support or local home-delivery flexibility"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Walk-in solar hybrid dryer with convection exhaust fans",
          "quantity": 1,
          "unitCost": 110000,
          "supplier": "Renewable Energy Kenya"
        },
        {
          "item": "Stainless steel vegetable washing tanks and water spinner",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Local Fabricators"
        },
        {
          "item": "Vacuum bag heat sealer machine",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Packaging Machinery Depot"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh harvested African leafy vegetables direct from farm gate",
          "monthlyQuantity": "1,500 kg fresh greens",
          "monthlyCost": 45000,
          "supplier": "Women Smallholder Groups"
        },
        {
          "material": "Hermetic barrier foil bags with printed nutrition labels",
          "monthlyQuantity": "1,800 bags",
          "monthlyCost": 18000,
          "supplier": "Packaging Mart"
        }
      ],
      "workshopSquareMeters": 50,
      "monthlyRent": 15000,
      "staffing": [
        {
          "position": "Post-Harvest Technologist / Founder",
          "count": 1,
          "monthlySalary": 38000,
          "duties": "Moisture testing, drying cycles, grower relations, market dispatch",
          "qualifications": "Diploma in Agriculture / Nutrition"
        },
        {
          "position": "Sorting & Washing Attendant",
          "count": 1,
          "monthlySalary": 16000,
          "duties": "Vegetable sorting, washing, tray loading, sealing",
          "qualifications": "Certificate in Food Hygiene"
        }
      ],
      "preOperationalCosts": 32000,
      "workingCapitalBuffer": 55000,
      "ownerEquityAmount": 200000,
      "loanAmount": 60000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 15000,
        "electricity": 4500,
        "water": 2500,
        "transport": 9000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Nutrition-Sensitive Agriculture (KNEC), experienced in biofortified crop value chains, post-harvest nutrient preservation, and smallholder farmer aggregation.",
      "productDescription": "Community aggregation, solar drying, and hermetic packaging of indigenous vegetables (managu, terere, saga) to reduce 40% post-harvest farm losses. Delivered as Dehydrated African Leafy Vegetables (Terere/Managu 100g) packaged in 100g airtight moisture-barrier foil pouches preserving color and nutrients for 12 months to serve supermarket chains, urban households wanting traditional greens without tedious sorting, boarding institutions, and export diaspora..",
      "streetOrBuilding": "Peri-Urban Agricultural Aggregation & Production Plot",
      "locationRationale": "Positioned in a peri-urban agricultural belt with fertile plot space, reliable water access for irrigation and washing, low lease overhead, and direct road connectivity to urban retail markets and institutional buyers."
    }
  },
  {
    "id": "specialty_health_food_store",
    "number": 26,
    "title": "Healthy Food & Nutraceuticals Store",
    "group": "E",
    "groupName": "Specialty Retail",
    "archetype": "retail",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 220000,
      "max": 600000
    },
    "targetTracks": [
      "food_science",
      "community",
      "clinical"
    ],
    "tagline": "Evidence-Based Whole Foods, Certified Nutraceuticals & Nutritionist Guidance",
    "summary": "Specialty health food store and nutraceutical dispensary modeled on Kenyan wellness retailers like Healthy U—stocking KEBS-certified diabetic/gluten-free foods, organic seeds, cold-pressed oils, and PPB-cleared vitamins/supplements with in-store KNDI nutritionist advisory.",
    "compliance": [
      {
        "agency": "County Government (e.g., Nairobi City County)",
        "requirement": "Single Business Permit (Specialty Health Food & Wellness Retail)",
        "fee": 12000
      },
      {
        "agency": "County Department of Public Health",
        "requirement": "Food Premises Inspection & Food Handlers Certificates (Cap 242 / Cap 254)",
        "fee": 8000
      },
      {
        "agency": "Pharmacy and Poisons Board (PPB) & KEBS",
        "requirement": "Verification of PPB-Listed Nutraceuticals & KEBS Standardization Marks on Packaged Stock",
        "fee": 15000
      },
      {
        "agency": "Kenya Nutritionists and Dietitians Institute (KNDI)",
        "requirement": "Annual Practising Licence for In-Store Nutritionist Advisory",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "retail",
      "businessName": "AfyaBora Health Foods & Nutraceuticals Store",
      "tagline": "Evidence-Based Whole Foods, Certified Nutraceuticals & Nutritionist Guidance",
      "industrySector": "Specialty Health Food Retail, Dietary Supplements & Nutraceuticals",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "county": "Nairobi County",
      "townOrMarket": "Westlands / Kilimani Commercial Corridor, Nairobi",
      "primaryProduct": "Curated Therapeutic Health Food & Certified Nutraceutical Wellness Basket",
      "productPackaging": "Tamper-evident manufacturer-sealed nutraceutical bottles and food-grade barrier pouches packed in eco-friendly branded kraft carrier bags with printed dosage & dietary usage guides",
      "unitSellingPrice": 2200,
      "unitCostOfProduction": 1400,
      "monthlyProductionUnitsYear1": 260,
      "annualGrowthRateYear2": 0.25,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Urban working professionals, individuals managing Type 2 diabetes, hypertension, gut health, or gluten/lactose intolerance, expectant and lactating mothers requiring micronutrient support, gym and fitness enthusiasts, and outpatient clinic referrals in Nairobi.",
      "totalMarketPopulation": "45,000+ health-conscious urban households, commuter shoppers, and clinic/gym clients within the target Nairobi catchment [Confirm via local market survey]",
      "projectedMarketSharePercentage": 5.5,
      "competitors": [
        {
          "name": "Healthy U (Healthy U 2000 Ltd) — Flagship & Mall Network [Confirm nearest branch prices]",
          "location": "Sarit Centre (Westlands), Junction Mall, Yaya Centre, Two Rivers, Garden City, Hub Karen & Nairobi CBD",
          "priceLevel": "KES 1,800 – 6,500 per supplement / specialty health food basket [Confirm current branch price list]",
          "strengths": "East Africa's pioneer health-food and supplement retail chain (45+ branches), wide international nutraceutical brands, in-store nutritionists, and e-commerce delivery",
          "weaknesses": "Premium mall positioning and imported brand pricing can be prohibitive for middle-income neighbourhood shoppers seeking affordable local whole-food alternatives"
        },
        {
          "name": "Goodlife Pharmacy & MYDAWA E-Health Platform [Confirm locally]",
          "location": "Major Shopping Malls, High Streets & Online Delivery across Nairobi",
          "priceLevel": "KES 1,500 – 4,800 per imported vitamin or nutraceutical unit [Confirm current shelf prices]",
          "strengths": "Extensive retail pharmacy footprint (150+ stores), strong prescription footfall, and trusted imported supplement lines (Webber Naturals, Jamieson, Natures Aid, Centrum)",
          "weaknesses": "Primarily pharmaceutical-focused; limited assortment of culinary whole foods, gluten-free/diabetic pantry staples, organic seeds, and personalized culinary meal planning"
        },
        {
          "name": "Zucchini Food Market, Kalimoni Greens & Bridges Organic Health [Confirm locally]",
          "location": "Westlands, Kilimani, Karen, Lavington & Nairobi CBD",
          "priceLevel": "KES 1,600 – 3,500 per organic grocery and superfood basket [Confirm locally]",
          "strengths": "Strong reputation for fresh organic produce, clean-eating groceries, cold-pressed juices, and Kenya Organic Agricultural Network (KOAN)-linked farm sourcing",
          "weaknesses": "Focus mainly on fresh groceries or organic dining rather than clinically structured micronutrient supplementation and KNDI dietetic screening"
        }
      ],
      "marketingPromotionBudgetMonthly": 15000,
      "machinery": [
        {
          "item": "Custom Gondola Shelving, Tempered-Glass Nutraceutical Lockable Cabinets & Consultation Counter",
          "quantity": 1,
          "unitCost": 85000,
          "supplier": "Nairobi Commercial Shopfitters & Pharmacy Furniture Suppliers [Quotation required]"
        },
        {
          "item": "Commercial Upright Glass-Door Chiller (2–8°C for Probiotics, Kefir, Cold-Pressed Oils & Nut Milks)",
          "quantity": 1,
          "unitCost": 68000,
          "supplier": "Commercial Refrigeration Suppliers, Nairobi [Quotation required]"
        },
        {
          "item": "Split Air-Conditioning & Thermo-Hygrometer Climate Control System (<25°C Supplement Stability)",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "HVAC & Appliance Distributors, Nairobi [Quotation required]"
        },
        {
          "item": "Barcode POS Terminal, Thermal Receipt Printer, Cash Drawer & KRA eTIMS Integration",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "ETR & Retail POS Systems Vendors, Nairobi [Quotation required]"
        },
        {
          "item": "Multi-Frequency Bioelectrical Impedance Analysis (BIA) Body Composition Scale, Stadiometer & BP Monitor",
          "quantity": 1,
          "unitCost": 32000,
          "supplier": "Medical & Diagnostic Equipment Suppliers, Nairobi [Quotation required]"
        }
      ],
      "rawMaterials": [
        {
          "material": "Wholesale Nutraceutical & Supplement Inventory (PPB-cleared Vitamin D3, Omega-3, Iron-Folic Acid, Magnesium, Probiotics, Herbal Adaptogens & Protein Powders)",
          "monthlyQuantity": "160 assorted supplement & nutraceutical units",
          "monthlyCost": 215000,
          "supplier": "PPB-Licensed Nutraceutical Importers & Pharmaceutical Distributors, Nairobi [Confirm supplier price list]"
        },
        {
          "material": "Specialty Health Foods & Therapeutic Pantry Stock (KEBS-certified Gluten-Free Oats/Flours, Chia/Flax/Pumpkin Seeds, Raw Almonds/Walnuts, Stevia/Erythritol, Cold-Pressed Oils & Herbal Teas)",
          "monthlyQuantity": "260 assorted whole-food & therapeutic grocery packs",
          "monthlyCost": 140000,
          "supplier": "KEBS-Certified Health Food Processors & KOAN Organic Aggregators [Confirm supplier price list]"
        },
        {
          "material": "Eco-Friendly Branded Kraft Carrier Bags, Tamper-Evident Repack Pouches, Thermal POS Rolls & Printed Nutrition/Dosage Advisory Cards",
          "monthlyQuantity": "300 customer sets",
          "monthlyCost": 9000,
          "supplier": "Nairobi Eco-Packaging & Commercial Print Vendors [Quotation required]"
        }
      ],
      "workshopSquareMeters": 40,
      "monthlyRent": 28000,
      "staffing": [
        {
          "position": "Managing Director & Lead Store Nutritionist (Proprietor)",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "In-store nutrition & supplement counselling, body composition screening, PPB/KEBS supplier vetting, FEFO stock audits, and financial management",
          "qualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI"
        },
        {
          "position": "Retail Wellness Advisor & POS Cashier",
          "count": 1,
          "monthlySalary": 20000,
          "duties": "Customer reception, shelf merchandising, barcode POS/M-PESA checkout, WhatsApp order packing, and daily store hygiene",
          "qualifications": "Certificate in Nutrition, Community Health, Pharmaceutical Technology, or Retail Sales"
        }
      ],
      "preOperationalCosts": 55000,
      "workingCapitalBuffer": 140000,
      "ownerEquityAmount": 280000,
      "loanAmount": 180000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 28000,
        "electricity": 7500,
        "water": 1500,
        "transport": 9000,
        "marketing": 15000,
        "stationeryMisc": 4000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), trained in clinical nutraceutical counselling, dietary supplement safety, KEBS/PPB label verification, and specialty retail inventory management.",
      "productDescription": "An integrated specialty health food store and nutraceutical dispensary modeled on established Kenyan wellness retailers such as Healthy U, combining (1) KEBS-certified whole and therapeutic foods (diabetic low-GI flours, gluten-free rolled oats, chia/flax/pumpkin seeds, raw nuts, organic honey, cold-pressed coconut/flaxseed oils, and herbal infusions), (2) Pharmacy and Poisons Board (PPB)-listed dietary supplements and nutraceuticals (Vitamin D3, Omega-3 fish oil, chelated iron-folic acid, magnesium glycinate, probiotics, botanical adaptogens, and clean sports proteins), and (3) point-of-sale KNDI-registered nutritionist guidance and non-invasive body composition screening.",
      "streetOrBuilding": "Ground Floor Retail Unit, Commercial Shopping Arcade [Confirm exact plot/street locally]",
      "locationRationale": "Positioned along a high-footfall urban commercial and residential corridor in Nairobi with convenient matatu and private vehicle access, proximity to outpatient clinics, fitness centres, and middle-income estates, and stable Kenya Power (KPLC) supply for chilled probiotic/beverage displays and climate-controlled nutraceutical shelving [Confirm lease terms and exact shop unit locally].",
      "research": {
        "summary": "Kenyan specialty health food and nutraceutical retail is led by established urban wellness chains and pharmacies—most notably Healthy U (45+ branches across Kenya and Uganda, flagship at Sarit Centre Westlands), Goodlife Pharmacy (150+ stores stocking imported nutraceuticals), MYDAWA (licensed e-pharmacy and wellness retailer), and organic specialty grocers such as Zucchini Food Market, Kalimoni Greens, and Bridges Organic Health in Nairobi.",
        "sources": [
          {
            "title": "Healthy U Kenya — Official Health Food, Vitamins, Supplements & Natural Wellness Retailer (Nairobi & Nationwide Branches)",
            "url": "https://www.healthyu.co.ke/"
          },
          {
            "title": "Goodlife Pharmacy Kenya — Vitamins, Minerals, Herbal Supplements & Wellness Retail Network",
            "url": "https://www.goodlife.co.ke/"
          },
          {
            "title": "MYDAWA Kenya — Licensed Online Pharmacy, Vitamins & Nutritional Supplements Retail Platform",
            "url": "https://mydawa.com/"
          },
          {
            "title": "Zucchini Food Market Nairobi — Fresh Produce, Superfoods, Nuts, Seeds & Health Groceries",
            "url": "https://zucchini.co.ke/"
          },
          {
            "title": "Kalimoni Greens Kenya — Certified Organic Health Foods, Whole Grains & Natural Pantry Retail",
            "url": "https://kalimonigreens.com/"
          },
          {
            "title": "Pharmacy and Poisons Board (PPB) Kenya — Guidelines for Registration and Listing of Health Supplements & Nutraceuticals",
            "url": "https://web.pharmacyboardkenya.org/"
          },
          {
            "title": "Kenya Bureau of Standards (KEBS) — Product Certification & Standardization Mark (SM) Standards",
            "url": "https://www.kebs.org/"
          },
          {
            "title": "Kenya Nutritionists and Dietitians Institute (KNDI) — Professional Registration & Scope of Practice",
            "url": "https://www.kndi.institute/"
          }
        ],
        "searchedAt": "2026-11-14T16:00:00Z"
      }
    }
  },
  {
    "id": "supplements_maternal_baby_retail",
    "number": 27,
    "title": "Maternal & Clinical Nutraceuticals Shop",
    "group": "E",
    "groupName": "Specialty Retail",
    "archetype": "retail",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 250000,
      "max": 650000
    },
    "targetTracks": [
      "clinical",
      "community"
    ],
    "tagline": "Certified Supplements, Functional Foods & Nursing Support for Mother & Family",
    "summary": "Compliant nutraceutical and maternal nutrition retail outlet stocking PPB-listed micronutrient supplements (IFAS, prenatal DHA, calcium, Vitamin D3, pediatric probiotics), KEBS-certified weaning foods, and lactation support tools.",
    "compliance": [
      {
        "agency": "Pharmacy and Poisons Board (PPB)",
        "requirement": "Nutraceutical & Health Supplement Retail Verification (Cap 244)",
        "fee": 20000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit & Public Health Premises License",
        "fee": 15000
      },
      {
        "agency": "Kenya Nutritionists and Dietitians Institute (KNDI)",
        "requirement": "Practising Licence for Maternal & Pediatric Nutrition Counselling",
        "fee": 5000
      }
    ],
    "defaultSpecs": {
      "businessModel": "retail",
      "businessName": "MamaBora Clinical Nutraceuticals & Wellness Store",
      "tagline": "Certified Supplements, Functional Foods & Nursing Support for Mother & Family",
      "industrySector": "Nutraceutical Retail, Maternal Supplements & Specialty Pediatric Nutrition",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "county": "Nairobi County",
      "townOrMarket": "Kilimani / Ngong Road Medical & Commercial Corridor, Nairobi",
      "primaryProduct": "First 1,000 Days Maternal Micronutrient, Prenatal DHA & Complementary Weaning Wellness Kit",
      "productPackaging": "Tamper-evident boxed kit containing PPB-listed IFAS/prenatal multivitamins, Omega-3 DHA, KEBS-certified biofortified weaning flour, and printed KNDI feeding guide",
      "unitSellingPrice": 3200,
      "unitCostOfProduction": 2150,
      "monthlyProductionUnitsYear1": 150,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Expectant mothers, postpartum and lactating women, parents introducing complementary infant feeding (6–24 months), and outpatient antenatal/pediatric clinic clients in Nairobi.",
      "totalMarketPopulation": "22,000+ pregnant mothers, lactating women, and young families within the urban medical corridor catchment [Confirm locally]",
      "projectedMarketSharePercentage": 5,
      "competitors": [
        {
          "name": "Healthy U & Placid Nutrition Centre [Confirm nearest branch prices]",
          "location": "Nairobi Shopping Malls (Sarit Centre, Junction, Yaya Centre) & Commercial Hubs",
          "priceLevel": "KES 2,800 – 5,500 per imported prenatal / pediatric supplement bundle [Confirm locally]",
          "strengths": "Broad range of imported prenatal vitamins, herbal galactagogues, and organic baby food brands with trained wellness advisors",
          "weaknesses": "High imported price points and location restricted mainly to premium shopping malls"
        },
        {
          "name": "Goodlife Pharmacy, MYDAWA & Hospital Outpatient Pharmacies [Confirm locally]",
          "location": "Major Commercial Streets, Mall Branches & E-Pharmacy Delivery across Nairobi",
          "priceLevel": "KES 2,200 – 4,500 per prescription/OTC maternal supplement pack [Confirm locally]",
          "strengths": "Strong clinical trust, direct obstetrician/pediatrician prescription traffic, and wide pharmaceutical distribution",
          "weaknesses": "Fast counter dispensing with limited time for individualized complementary feeding demonstrations, lactation counselling, and whole-food weaning curation"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Locked Tempered-Glass Nutraceutical Display Cabinets, Gondola Shelves & Consultation Counter",
          "quantity": 2,
          "unitCost": 42000,
          "supplier": "Nairobi Pharmacy & Retail Shopfitters [Quotation required]"
        },
        {
          "item": "Split Air-Conditioning & Digital Hygrometer Climate Control Unit (<25°C Supplement Stability)",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "HVAC & Appliance Centre, Nairobi [Quotation required]"
        },
        {
          "item": "Computerized Barcode POS Inventory System, Thermal Printer & KRA eTIMS Integration",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Tech Retail & ETR Systems Kenya [Quotation required]"
        }
      ],
      "rawMaterials": [
        {
          "material": "PPB-Cleared Maternal & Pediatric Nutraceuticals (Chelated Iron-Folic Acid, Prenatal Multivitamins, Omega-3 DHA, Vitamin D3 Drops, Calcium & Pediatric Probiotics)",
          "monthlyQuantity": "Wholesale monthly stock (150+ kit equivalents)",
          "monthlyCost": 260000,
          "supplier": "PPB-Licensed Pharmaceutical & Nutraceutical Distributors, Nairobi [Confirm supplier price list]"
        },
        {
          "material": "KEBS-Certified Complementary Weaning Foods, Lactation Teas, Eco-Friendly Branded Packaging & Printed MOH/KNDI IYCF Feeding Guides",
          "monthlyQuantity": "250 customer sets",
          "monthlyCost": 12000,
          "supplier": "Certified Local Food Processors & Commercial Print Works [Quotation required]"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 20000,
      "staffing": [
        {
          "position": "Lead Maternal & Pediatric Nutritionist / Proprietor",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Maternal/infant supplement counselling, breastfeeding & weaning guidance, PPB/KEBS stock verification, and regulatory compliance",
          "qualifications": "Diploma in Human Nutrition & Dietetics (KNEC), KNDI Registered"
        },
        {
          "position": "Retail Wellness & Stock Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "POS checkout, FEFO batch/expiry tracking, shelf merchandising, and WhatsApp delivery coordination",
          "qualifications": "Certificate in Nutrition, Community Health, or Retail Sales"
        }
      ],
      "preOperationalCosts": 45000,
      "workingCapitalBuffer": 130000,
      "ownerEquityAmount": 189000,
      "loanAmount": 150000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 20000,
        "electricity": 6500,
        "water": 1200,
        "transport": 7000,
        "marketing": 12000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), skilled in maternal and infant nutrition (MIYCN), nutraceutical safety, Breast Milk Substitutes (Regulation and Control) Act compliance, and retail inventory management.",
      "productDescription": "Compliant nutraceutical and maternal nutrition retail outlet stocking PPB-cleared micronutrient supplements (Iron-folic acid, prenatal Omega-3 DHA, calcium, Vitamin D3, pediatric probiotics), KEBS-certified complementary weaning foods, and nursing support tools, paired with KNDI-registered maternal and infant nutrition counselling.",
      "streetOrBuilding": "Ground Floor Commercial Arcade near Maternal & Child Health Clinics [Confirm exact plot/street locally]",
      "locationRationale": "Located along a busy urban medical and commercial corridor near antenatal clinics, maternity hospitals, and residential commuter stages, providing walk-in convenience and reliable power for climate-controlled nutraceutical storage [Confirm site specifics locally].",
      "research": {
        "summary": "Maternal and clinical nutraceutical retail in Kenya operates alongside established benchmarks such as Healthy U, Goodlife Pharmacy, MYDAWA, and Placid Nutrition Centre, under strict oversight from the Pharmacy and Poisons Board (PPB), Kenya Bureau of Standards (KEBS), Kenya Nutritionists and Dietitians Institute (KNDI), and the Breast Milk Substitutes (Regulation and Control) Act (No. 34 of 2012).",
        "sources": [
          {
            "title": "Healthy U Kenya — Maternal, Infant & Family Vitamins, Minerals and Health Food Retail",
            "url": "https://www.healthyu.co.ke/"
          },
          {
            "title": "Goodlife Pharmacy Kenya — Mother & Baby Healthcare, Prenatal Vitamins & Nutraceuticals",
            "url": "https://www.goodlife.co.ke/"
          },
          {
            "title": "MYDAWA Kenya — Licensed E-Pharmacy for Maternal Supplements & Wellness Products",
            "url": "https://mydawa.com/"
          },
          {
            "title": "Pharmacy and Poisons Board (PPB) Kenya — Listing of Health Supplements and Nutraceuticals",
            "url": "https://web.pharmacyboardkenya.org/"
          },
          {
            "title": "Ministry of Health Kenya — National Maternal, Infant and Young Child Nutrition (MIYCN) Policy Guidelines",
            "url": "https://www.health.go.ke/"
          }
        ],
        "searchedAt": "2026-11-14T16:00:00Z"
      }
    }
  },
  {
    "id": "community_nutrition_workshops",
    "number": 28,
    "title": "Community Nutrition Workshops",
    "group": "F",
    "groupName": "Nutrition Education",
    "archetype": "education",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 30000,
      "max": 150000
    },
    "targetTracks": [
      "community"
    ],
    "tagline": "Empowering Communities with Actionable Dietary Knowledge",
    "summary": "Interactive health workshops and seminars for churches, women groups (chamas), SACCOs, and community health promoters (CHPs).",
    "compliance": [
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Education/Training)",
        "fee": 8000
      },
      {
        "agency": "KNDI",
        "requirement": "Trainer / Consultant Registration",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "education",
      "businessName": "JamiiNutri Educational Workshops",
      "tagline": "Empowering Communities with Actionable Dietary Knowledge",
      "industrySector": "Adult Education, Training & Health Promotion",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Full-Day Interactive Nutrition & Wellness Workshop",
      "productPackaging": "Turnkey workshop package including customized workbook, food demo session, and certificate of completion",
      "unitSellingPrice": 25000,
      "unitCostOfProduction": 6500,
      "monthlyProductionUnitsYear1": 8,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Women investment groups (chamas), church welfare committees, SACCOs holding member education days, and local NGOs.",
      "totalMarketPopulation": "300 organized groups and SACCOs in county",
      "projectedMarketSharePercentage": 10,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 31250 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 20000 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Portable multimedia video projector and collapsible projector screen",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Tech Point Kenya"
        },
        {
          "item": "Wireless PA sound system with lapel microphone",
          "quantity": 1,
          "unitCost": 16000,
          "supplier": "Audio Supplies"
        },
        {
          "item": "Food demonstration models and measuring guide kits",
          "quantity": 1,
          "unitCost": 8000,
          "supplier": "Educational Supplies"
        }
      ],
      "rawMaterials": [
        {
          "material": "Printed full-color workshop participant workbooks and certificates",
          "monthlyQuantity": "250 booklets",
          "monthlyCost": 18000,
          "supplier": "Local Stationer"
        },
        {
          "material": "Fresh foods and ingredients for live healthy cooking demos",
          "monthlyQuantity": "Per workshop batches",
          "monthlyCost": 12000,
          "supplier": "Local Market"
        }
      ],
      "workshopSquareMeters": 20,
      "monthlyRent": 10000,
      "staffing": [
        {
          "position": "Lead Community Trainer / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Curriculum development, workshop delivery, client pitching",
          "qualifications": "Diploma in Community Nutrition, KNDI Registered"
        }
      ],
      "preOperationalCosts": 25000,
      "workingCapitalBuffer": 35000,
      "ownerEquityAmount": 89000,
      "loanAmount": 30000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 12,
      "monthlyOverheads": {
        "rent": 10000,
        "electricity": 2500,
        "water": 800,
        "transport": 10000,
        "marketing": 8000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI, with proven competency in community nutrition education, culinary demonstration, and behavior-change communication.",
      "productDescription": "Interactive health workshops and seminars for churches, women groups (chamas), SACCOs, and community health promoters (CHPs). Delivered as Full-Day Interactive Nutrition & Wellness Workshop packaged in turnkey workshop package including customized workbook, food demo session, and certificate of completion to serve women investment groups (chamas), church welfare committees, SACCOs holding member education days, and local NGOs..",
      "streetOrBuilding": "Town Commercial & Training Center, First Floor Suite",
      "locationRationale": "Situated in an accessible town center building served by public transport, offering a quiet, well-ventilated demonstration and training space with reliable power, water, and proximity to target institutions and community groups."
    }
  },
  {
    "id": "healthy_cooking_academy",
    "number": 29,
    "title": "Culinary Nutrition Academy",
    "group": "F",
    "groupName": "Nutrition Education",
    "archetype": "education",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 50000,
      "max": 310000
    },
    "targetTracks": [
      "community",
      "food_science"
    ],
    "tagline": "Mastering Delicious Food that Heals the Body",
    "summary": "Hands-on weekend culinary masterclasses for domestic house managers, newly diagnosed diabetics, and parents wanting healthy meal prep skills.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Cooking Class Hygiene Clearance",
        "fee": 8000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "education",
      "businessName": "TasteOfHealth Cooking Academy",
      "tagline": "Mastering Delicious Food that Heals the Body",
      "industrySector": "Culinary Arts & Practical Dietary Education",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "4-Week Hands-On Culinary Nutrition Course",
      "productPackaging": "4 practical weekend modules with recipe handbook, chef apron, and tasting banquet",
      "unitSellingPrice": 8500,
      "unitCostOfProduction": 2200,
      "monthlyProductionUnitsYear1": 25,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Domestic cooks / house managers whose employers want healthy family cooking, newly diagnosed chronic disease patients, and food lovers.",
      "totalMarketPopulation": "15,000 households employing domestic staff in suburbs",
      "projectedMarketSharePercentage": 5.5,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 10630 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 6800 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Portable induction cooking cooktops and stainless chef cookware set",
          "quantity": 3,
          "unitCost": 35000,
          "supplier": "Catering Supplies"
        },
        {
          "item": "Stainless steel mobile prep station tables",
          "quantity": 2,
          "unitCost": 28000,
          "supplier": "Local Fabricators"
        },
        {
          "item": "Chef demonstration mirror and video recording stand",
          "quantity": 1,
          "unitCost": 12000,
          "supplier": "Tech Depot"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh cooking ingredients, whole grains, herbs, and spices",
          "monthlyQuantity": "Class batches",
          "monthlyCost": 28000,
          "supplier": "Farmers Market"
        },
        {
          "material": "Printed spiral-bound recipe manuals and branded cooking aprons",
          "monthlyQuantity": "25 sets",
          "monthlyCost": 12500,
          "supplier": "Merchandise Mart"
        }
      ],
      "workshopSquareMeters": 40,
      "monthlyRent": 18000,
      "staffing": [
        {
          "position": "Culinary Nutrition Instructor / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Recipe development, live cooking instruction, student grading",
          "qualifications": "Diploma in Nutrition / Culinary Arts"
        }
      ],
      "preOperationalCosts": 30000,
      "workingCapitalBuffer": 45000,
      "ownerEquityAmount": 208000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 18000,
        "electricity": 4500,
        "water": 2000,
        "transport": 6000,
        "marketing": 10000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI, with proven competency in community nutrition education, culinary demonstration, and behavior-change communication.",
      "productDescription": "Hands-on weekend culinary masterclasses for domestic house managers, newly diagnosed diabetics, and parents wanting healthy meal prep skills. Delivered as 4-Week Hands-On Culinary Nutrition Course packaged in 4 practical weekend modules with recipe handbook, chef apron, and tasting banquet to serve domestic cooks / house managers whose employers want healthy family cooking, newly diagnosed chronic disease patients, and food lovers..",
      "streetOrBuilding": "Town Commercial & Training Center, First Floor Suite",
      "locationRationale": "Situated in an accessible town center building served by public transport, offering a quiet, well-ventilated demonstration and training space with reliable power, water, and proximity to target institutions and community groups."
    }
  },
  {
    "id": "school_feeding_menu_nutrition",
    "number": 30,
    "title": "School Feeding & Growth Program",
    "group": "F",
    "groupName": "Nutrition Education",
    "archetype": "education",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 45000,
      "max": 200000
    },
    "targetTracks": [
      "community",
      "clinical"
    ],
    "tagline": "Nurturing Growing Minds Through Balanced School Nutrition",
    "summary": "Termly school feeding menu formulation, kitchen matron hygiene and portion training, and bi-annual child anthropometric growth monitoring for ECDE centers and primary schools.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Community Nutrition Practice Clearance",
        "fee": 12000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Nutrition & Training Services)",
        "fee": 8000
      }
    ],
    "defaultSpecs": {
      "businessModel": "education",
      "businessName": "SmartChild School Nutrition Services",
      "tagline": "Nurturing Growing Minds Through Balanced School Nutrition",
      "industrySector": "School Nutrition, Child Growth Monitoring & Institutional Dietetics",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Termly School Feeding Menu Audit, Kitchen Matron Training & Child Growth Screening Package",
      "productPackaging": "Comprehensive termly school nutrition package including 12-week nutrient-analyzed cycle menus, kitchen staff food-safety training, and parent growth-chart reports",
      "unitSellingPrice": 18000,
      "unitCostOfProduction": 4200,
      "monthlyProductionUnitsYear1": 12,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Private and public ECDE centers, daycares, primary boarding schools, and faith-based child development centers seeking balanced school menus and growth monitoring.",
      "totalMarketPopulation": "180 ECDE centers, daycares, and primary schools within the sub-county catchment",
      "projectedMarketSharePercentage": 6.5,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 22500 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 14400 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Portable pediatric SECA digital weighing scales and collapsible stadiometers",
          "quantity": 2,
          "unitCost": 24000,
          "supplier": "Medical Equipment Kenya"
        },
        {
          "item": "Portable multimedia projector and nutrition education flipchart kit",
          "quantity": 1,
          "unitCost": 32000,
          "supplier": "Educational Supplies Nairobi"
        },
        {
          "item": "Food demonstration portion models and kitchen thermometer kit",
          "quantity": 1,
          "unitCost": 15000,
          "supplier": "Lab & Catering Supplies"
        }
      ],
      "rawMaterials": [
        {
          "material": "Printed child growth monitoring cards, MUAC tapes, and parent feedback forms",
          "monthlyQuantity": "350 child packs",
          "monthlyCost": 10500,
          "supplier": "Stationery Mart"
        },
        {
          "material": "Laminated school kitchen cycle menu charts and food safety SOP posters",
          "monthlyQuantity": "12 school sets",
          "monthlyCost": 7500,
          "supplier": "Local Print Shop"
        }
      ],
      "workshopSquareMeters": 20,
      "monthlyRent": 10000,
      "staffing": [
        {
          "position": "Lead School Nutritionist / Founder",
          "count": 1,
          "monthlySalary": 42000,
          "duties": "Cycle menu nutrient analysis, school kitchen audits, matron training, and parent nutrition seminars",
          "qualifications": "Diploma in Human Nutrition and Dietetics, KNDI Registered"
        },
        {
          "position": "Field Anthropometric & Nutrition Assistant",
          "count": 1,
          "monthlySalary": 18000,
          "duties": "Height/weight measurements, MUAC screening, growth chart recording",
          "qualifications": "Certificate in Community Health & Nutrition"
        }
      ],
      "preOperationalCosts": 25000,
      "workingCapitalBuffer": 40000,
      "ownerEquityAmount": 120000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 10000,
        "electricity": 2000,
        "water": 800,
        "transport": 9000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI, with proven competency in community nutrition education, culinary demonstration, and behavior-change communication.",
      "productDescription": "Termly school feeding menu formulation, kitchen matron hygiene and portion training, and bi-annual child anthropometric growth monitoring for ECDE centers and primary schools. Delivered as Termly School Feeding Menu Audit, Kitchen Matron Training & Child Growth Screening Package packaged in comprehensive termly school nutrition package including 12-week nutrient-analyzed cycle menus, kitchen staff food-safety training, and parent growth-chart reports to serve private and public ECDE centers, daycares, primary boarding schools, and faith-based child development centers seeking balanced school menus and growth monitoring..",
      "streetOrBuilding": "Town Commercial & Training Center, First Floor Suite",
      "locationRationale": "Situated in an accessible town center building served by public transport, offering a quiet, well-ventilated demonstration and training space with reliable power, water, and proximity to target institutions and community groups."
    }
  },
  {
    "id": "maternal_iycf_caregiver_academy",
    "number": 31,
    "title": "Infant Weaning (IYCF) Center",
    "group": "F",
    "groupName": "Nutrition Education",
    "archetype": "education",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 40000,
      "max": 210000
    },
    "targetTracks": [
      "community",
      "clinical"
    ],
    "tagline": "Practical Weaning & First 1,000 Days Nutrition for Healthy Babies",
    "summary": "Practical caregiver training center offering hands-on infant and young child feeding (IYCF) classes, nutrient-dense weaning food demonstrations, and nanny nutrition workshops.",
    "compliance": [
      {
        "agency": "County Public Health",
        "requirement": "Food Demonstration Hygiene Clearance",
        "fee": 8000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Community Nutrition Training)",
        "fee": 7000
      }
    ],
    "defaultSpecs": {
      "businessModel": "education",
      "businessName": "First 1000 Days Maternal & Baby Nutrition Center",
      "tagline": "Practical Weaning & First 1,000 Days Nutrition for Healthy Babies",
      "industrySector": "Maternal & Child Nutrition Education and Caregiver Training",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Practical Infant Weaning & Caregiver Nutrition Workshop Package",
      "productPackaging": "4-session practical workshop for mothers and house managers with live baby-food preparation, texture progression guide, and laminated weaning chart",
      "unitSellingPrice": 4500,
      "unitCostOfProduction": 1100,
      "monthlyProductionUnitsYear1": 40,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "First-time mothers, parents transitioning infants to complementary feeding at 6 months, domestic caregivers/nannies, and pediatric clinic referrals.",
      "totalMarketPopulation": "16,000 households with infants and toddlers under 24 months in the town catchment",
      "projectedMarketSharePercentage": 5,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 5630 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 3600 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Baby food steamers, puree blenders, and induction demonstration cooktops",
          "quantity": 2,
          "unitCost": 26000,
          "supplier": "Catering & Kitchen Supplies"
        },
        {
          "item": "Seca digital baby weighing scale, infantometer length board, and demonstration dolls",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Crown Healthcare"
        },
        {
          "item": "Stainless steel food demonstration table and training seating",
          "quantity": 1,
          "unitCost": 25000,
          "supplier": "Local Fabricators"
        }
      ],
      "rawMaterials": [
        {
          "material": "Fresh biofortified ingredients (orange sweet potato, millet, liver, dark leafy greens, fruits) for live weaning demos",
          "monthlyQuantity": "Monthly class batches",
          "monthlyCost": 16000,
          "supplier": "Local Farmers Market"
        },
        {
          "material": "Printed age-specific Kenyan weaning recipe guides and laminated kitchen feeding schedules",
          "monthlyQuantity": "40 caregiver kits",
          "monthlyCost": 8000,
          "supplier": "Print Shop"
        }
      ],
      "workshopSquareMeters": 30,
      "monthlyRent": 14000,
      "staffing": [
        {
          "position": "Maternal & Child Nutrition Educator / Founder",
          "count": 1,
          "monthlySalary": 40000,
          "duties": "Curriculum facilitation, live weaning demos, infant growth checks, lactation guidance",
          "qualifications": "Diploma in Human Nutrition and Dietetics, KNDI Registered"
        },
        {
          "position": "Kitchen Prep & Training Assistant",
          "count": 1,
          "monthlySalary": 16000,
          "duties": "Ingredient preparation, hygiene sanitation, participant registration",
          "qualifications": "Certificate in Food Hygiene / Nutrition"
        }
      ],
      "preOperationalCosts": 22000,
      "workingCapitalBuffer": 38000,
      "ownerEquityAmount": 115000,
      "loanAmount": 50000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 14000,
        "electricity": 3000,
        "water": 1200,
        "transport": 5000,
        "marketing": 8000,
        "stationeryMisc": 2500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with KNDI, with proven competency in community nutrition education, culinary demonstration, and behavior-change communication.",
      "productDescription": "Practical caregiver training center offering hands-on infant and young child feeding (IYCF) classes, nutrient-dense weaning food demonstrations, and nanny nutrition workshops. Delivered as Practical Infant Weaning & Caregiver Nutrition Workshop Package packaged in 4-session practical workshop for mothers and house managers with live baby-food preparation, texture progression guide, and laminated weaning chart to serve first-time mothers, parents transitioning infants to complementary feeding at 6 months, domestic caregivers/nannies, and pediatric clinic referrals..",
      "streetOrBuilding": "Town Commercial & Training Center, First Floor Suite",
      "locationRationale": "Situated in an accessible town center building served by public transport, offering a quiet, well-ventilated demonstration and training space with reliable power, water, and proximity to target institutions and community groups."
    }
  },
  {
    "id": "workplace_institutional_wellness",
    "number": 32,
    "title": "Workplace Wellness Audits",
    "group": "G",
    "groupName": "Advisory & Audits",
    "archetype": "consultancy",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 40000,
      "max": 370000
    },
    "targetTracks": [
      "community",
      "clinical"
    ],
    "tagline": "Boosting Workplace Productivity Through Proactive Health",
    "summary": "Corporate health screenings (BIA, BP, random blood sugar), staff nutrition wellness days, cafeteria menu audits, and desk-worker ergonomic dietary plans.",
    "compliance": [
      {
        "agency": "KNDI",
        "requirement": "Consulting Practice Certificate",
        "fee": 15000
      },
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Management Consultancy)",
        "fee": 10000
      }
    ],
    "defaultSpecs": {
      "businessModel": "consultancy",
      "businessName": "WorkplaceVitality Health Consultants",
      "tagline": "Boosting Workplace Productivity Through Proactive Health",
      "industrySector": "Occupational Health & Corporate Nutrition Consultancy",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Full Corporate Staff Health Screening & Wellness Day",
      "productPackaging": "Comprehensive on-site screening event for 50 staff with individualized biometric reports and an executive health index summary",
      "unitSellingPrice": 45000,
      "unitCostOfProduction": 9500,
      "monthlyProductionUnitsYear1": 5,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Banks, SACCOs, microfinance institutions, manufacturing plants, schools, and county government departments.",
      "totalMarketPopulation": "120 mid-to-large corporate employers in county",
      "projectedMarketSharePercentage": 12,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 56250 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 36000 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 10000,
      "machinery": [
        {
          "item": "Multi-frequency portable BIA analyzers with rapid thermal printers",
          "quantity": 2,
          "unitCost": 65000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Medical digital sphygmomanometers and clinical glucometers",
          "quantity": 2,
          "unitCost": 18000,
          "supplier": "Crown Healthcare"
        },
        {
          "item": "Professional laptop and corporate presentation projection kit",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Local Tech Dealer"
        }
      ],
      "rawMaterials": [
        {
          "material": "Disposable lancets, glucose test strips, alcohol swabs, and PPE",
          "monthlyQuantity": "250 tests",
          "monthlyCost": 11000,
          "supplier": "Chemist Depot"
        },
        {
          "material": "Printed executive confidential employee health report booklets",
          "monthlyQuantity": "250 booklets",
          "monthlyCost": 8500,
          "supplier": "Color Prints"
        }
      ],
      "workshopSquareMeters": 25,
      "monthlyRent": 15000,
      "staffing": [
        {
          "position": "Lead Wellness Consultant / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Corporate pitching, biometric analysis, keynote wellness talks",
          "qualifications": "Diploma in Nutrition & Dietetics, KNDI Registered"
        },
        {
          "position": "Assistant Screening Nurse / Nutritionist",
          "count": 1,
          "monthlySalary": 22000,
          "duties": "On-site biometric testing, counseling triage",
          "qualifications": "Certificate in Nutrition / Nursing"
        }
      ],
      "preOperationalCosts": 32000,
      "workingCapitalBuffer": 50000,
      "ownerEquityAmount": 243000,
      "loanAmount": 50000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 15000,
        "electricity": 3000,
        "water": 1000,
        "transport": 12000,
        "marketing": 10000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with experience in workplace wellness audits, food safety systems, and public health nutrition.",
      "productDescription": "Corporate health screenings (BIA, BP, random blood sugar), staff nutrition wellness days, cafeteria menu audits, and desk-worker ergonomic dietary plans. Delivered as Full Corporate Staff Health Screening & Wellness Day packaged in comprehensive on-site screening event for 50 staff with individualized biometric reports and an executive health index summary to serve banks, SACCOs, microfinance institutions, manufacturing plants, schools, and county government departments..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "food_safety_regulatory_consultancy",
    "number": 33,
    "title": "Food Safety & KEBS Advisory",
    "group": "G",
    "groupName": "Advisory & Audits",
    "archetype": "consultancy",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 45000,
      "max": 230000
    },
    "targetTracks": [
      "food_science"
    ],
    "tagline": "Guiding Food Enterprises to Flawless Standards and KEBS Approvals",
    "summary": "Consultancy assisting small food processors, cloud kitchens, and restaurants with food hygiene training, HACCP implementation, and KEBS certification.",
    "compliance": [
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Professional Consultancy)",
        "fee": 10000
      },
      {
        "agency": "KNDI",
        "requirement": "Food Technologist Consultant Registration",
        "fee": 12000
      }
    ],
    "defaultSpecs": {
      "businessModel": "consultancy",
      "businessName": "SafeFood Compliance Advisory",
      "tagline": "Guiding Food Enterprises to Flawless Standards and KEBS Approvals",
      "industrySector": "Food Safety, Quality Assurance & Regulatory Consultancy",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "KEBS Standardization Mark Audit & Application Package",
      "productPackaging": "Complete advisory package including factory layout review, SOP documentation, staff hygiene training, and audit accompaniment",
      "unitSellingPrice": 38000,
      "unitCostOfProduction": 6500,
      "monthlyProductionUnitsYear1": 4,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Emerging cottage food millers, bakeries, juice bottlers, restaurants, and school catering managers seeking food hygiene compliance.",
      "totalMarketPopulation": "85 active food processing ventures in county",
      "projectedMarketSharePercentage": 14,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 47500 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 30400 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "ATP surface hygiene swab luminometer (rapid cleanliness verification)",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Digital food core temperature thermometer and infrared surface scanner",
          "quantity": 2,
          "unitCost": 12000,
          "supplier": "Scientific Supplies"
        },
        {
          "item": "Office laptop and multifunction documentation printer",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Local Tech Dealer"
        }
      ],
      "rawMaterials": [
        {
          "material": "ATP swab test cassettes and microbial surface culture plates",
          "monthlyQuantity": "20 tests",
          "monthlyCost": 7500,
          "supplier": "Lab Supplies Depot"
        },
        {
          "material": "Printed standard operating procedure (SOP) manuals and hygiene posters",
          "monthlyQuantity": "Class sets",
          "monthlyCost": 4500,
          "supplier": "Local Stationer"
        }
      ],
      "workshopSquareMeters": 20,
      "monthlyRent": 12000,
      "staffing": [
        {
          "position": "Lead Food Safety Auditor / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Facility audits, SOP formulation, staff training, KEBS liaison",
          "qualifications": "Diploma in Food Science & Technology"
        }
      ],
      "preOperationalCosts": 30000,
      "workingCapitalBuffer": 40000,
      "ownerEquityAmount": 144000,
      "loanAmount": 40000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 12000,
        "electricity": 3000,
        "water": 1000,
        "transport": 10000,
        "marketing": 8000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with experience in workplace wellness audits, food safety systems, and public health nutrition.",
      "productDescription": "Consultancy assisting small food processors, cloud kitchens, and restaurants with food hygiene training, HACCP implementation, and KEBS certification. Delivered as KEBS Standardization Mark Audit & Application Package packaged in complete advisory package including factory layout review, SOP documentation, staff hygiene training, and audit accompaniment to serve emerging cottage food millers, bakeries, juice bottlers, restaurants, and school catering managers seeking food hygiene compliance..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "community_project_nutrition_services",
    "number": 34,
    "title": "Nutrition Survey & M&E Advisory",
    "group": "G",
    "groupName": "Advisory & Audits",
    "archetype": "consultancy",
    "capitalTier": "Low",
    "estimatedCapitalKES": {
      "min": 35000,
      "max": 370000
    },
    "targetTracks": [
      "community"
    ],
    "tagline": "Rigorous Evidence for Impactful Public Health Interventions",
    "summary": "Consultancy delivering baseline surveys, SMART nutrition assessments, project M&E, and grant proposal development for local NGOs and county agencies.",
    "compliance": [
      {
        "agency": "County Government",
        "requirement": "Single Business Permit (Research Consultancy)",
        "fee": 10000
      },
      {
        "agency": "KNDI",
        "requirement": "Public Health Nutritionist Consultant License",
        "fee": 15000
      }
    ],
    "defaultSpecs": {
      "businessModel": "consultancy",
      "businessName": "ImpactNutri Research & Evaluation",
      "tagline": "Rigorous Evidence for Impactful Public Health Interventions",
      "industrySector": "Public Health Consulting, Monitoring & Evaluation",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "Community Nutrition SMART Baseline Survey & Evaluation",
      "productPackaging": "Complete research project execution including digital data collection (ODK/Kobo), statistical analysis, and comprehensive donor report",
      "unitSellingPrice": 75000,
      "unitCostOfProduction": 18000,
      "monthlyProductionUnitsYear1": 2,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Community-based organizations (CBOs), humanitarian NGOs, county departments of health, and philanthropic foundations.",
      "totalMarketPopulation": "40 active development NGOs and county health programs",
      "projectedMarketSharePercentage": 15,
      "competitors": [
        {
          "name": "Private Hospitality Colleges & General Training Firms [Confirm locally]",
          "location": "Major Urban Centers",
          "priceLevel": "KES 93750 per course/package",
          "strengths": "Formal classroom facilities and broad institutional recognition",
          "weaknesses": "High tuition fees, long academic schedules, and focus on commercial hotel cookery rather than therapeutic household and school nutrition"
        },
        {
          "name": "Informal Online Wellness Trainers & Community Facilitators [Confirm locally]",
          "location": "Social Media & Freelance Networks",
          "priceLevel": "KES 60000 per session",
          "strengths": "Low pricing and flexible informal scheduling",
          "weaknesses": "Lack structured Kenyan food composition curricula, practical anthropometric tools, and accredited KNDI professional oversight"
        }
      ],
      "marketingPromotionBudgetMonthly": 8000,
      "machinery": [
        {
          "item": "Field digital survey tablets equipped with GPS and KoboToolbox",
          "quantity": 3,
          "unitCost": 45000,
          "supplier": "Tech Retail Kenya"
        },
        {
          "item": "Standardized anthropometric wooden height boards and SECA scales",
          "quantity": 1,
          "unitCost": 28000,
          "supplier": "Medical Equipment Kenya"
        },
        {
          "item": "Statistical analysis laptop (SPSS, ENA for SMART, R)",
          "quantity": 1,
          "unitCost": 55000,
          "supplier": "Computer Mart"
        }
      ],
      "rawMaterials": [
        {
          "material": "Field enumeration stationery, respondent consent sheets, and badges",
          "monthlyQuantity": "Per project batches",
          "monthlyCost": 6500,
          "supplier": "Stationery Depot"
        },
        {
          "material": "Cloud server storage & secure encrypted data hosting",
          "monthlyQuantity": "Monthly license",
          "monthlyCost": 4000,
          "supplier": "Cloud Provider"
        }
      ],
      "workshopSquareMeters": 20,
      "monthlyRent": 12000,
      "staffing": [
        {
          "position": "Principal M&E Consultant / Founder",
          "count": 1,
          "monthlySalary": 45000,
          "duties": "Study design, data cleaning, statistical modeling, donor report writing",
          "qualifications": "Diploma/BSc in Community Nutrition / Statistics"
        }
      ],
      "preOperationalCosts": 32000,
      "workingCapitalBuffer": 45000,
      "ownerEquityAmount": 205000,
      "loanAmount": 90000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 18,
      "monthlyOverheads": {
        "rent": 12000,
        "electricity": 3000,
        "water": 800,
        "transport": 12000,
        "marketing": 8000,
        "stationeryMisc": 3000
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics (KNEC), registered with the Kenya Nutritionists and Dietitians Institute (KNDI), with experience in workplace wellness audits, food safety systems, and public health nutrition.",
      "productDescription": "Consultancy delivering baseline surveys, SMART nutrition assessments, project M&E, and grant proposal development for local NGOs and county agencies. Delivered as Community Nutrition SMART Baseline Survey & Evaluation packaged in complete research project execution including digital data collection (ODK/Kobo), statistical analysis, and comprehensive donor report to serve community-based organizations (CBOs), humanitarian NGOs, county departments of health, and philanthropic foundations..",
      "streetOrBuilding": "Commercial Medical & Professional Plaza, Ground Floor Suite",
      "locationRationale": "Strategically positioned near outpatient health facilities, diagnostic laboratories, and public transport stages, ensuring convenient client referrals, pedestrian accessibility, reliable utilities, and confidential consultation space."
    }
  },
  {
    "id": "therapeutic_enteral_feeds_unit",
    "number": 35,
    "title": "Therapeutic & Enteral Feeds Unit",
    "group": "H",
    "groupName": "Therapeutic Feeds",
    "archetype": "manufacturing",
    "capitalTier": "Medium",
    "estimatedCapitalKES": {
      "min": 140000,
      "max": 470000
    },
    "targetTracks": [
      "clinical",
      "food_science"
    ],
    "tagline": "Clinical-Grade Therapeutic Feeds for Recovery and Rehabilitation",
    "summary": "Hygienic formulation and packaging of fortified therapeutic porridge blends, high-protein convalescent shakes, and pasteurized blenderized tube feeds for hospitals and home-care patients.",
    "compliance": [
      {
        "agency": "KEBS",
        "requirement": "Standardization Mark for Special Dietary & Therapeutic Foods",
        "fee": 35000
      },
      {
        "agency": "KNDI",
        "requirement": "Clinical Therapeutic Formulation Accreditation",
        "fee": 15000
      },
      {
        "agency": "County Public Health",
        "requirement": "Special Food Premises Hygiene License",
        "fee": 12000
      }
    ],
    "defaultSpecs": {
      "businessModel": "manufacturing",
      "businessName": "NutriHeal Therapeutic Feeds & Formulations",
      "tagline": "Clinical-Grade Therapeutic Feeds for Recovery and Rehabilitation",
      "industrySector": "Therapeutic Food Formulation & Clinical Nutrition Manufacturing",
      "formOfOwnership": "Sole Proprietorship",
      "registrationType": "Business Names Registration Act (Cap 499, Laws of Kenya)",
      "primaryProduct": "High-Energy Protein Therapeutic Convalescent Blend (500g Sealed Tin/Pouch)",
      "productPackaging": "500g medical-grade moisture-barrier foil pouch with scoop, osmolarity/calorie table, and reconstitution instructions",
      "unitSellingPrice": 450,
      "unitCostOfProduction": 210,
      "monthlyProductionUnitsYear1": 850,
      "annualGrowthRateYear2": 0.3,
      "annualGrowthRateYear3": 0.25,
      "targetCustomersDescription": "Hospital nutrition departments, convalescent and post-surgical patients, oncology and renal recovery patients, geriatric care homes, and malnutrition rehabilitation clinics.",
      "totalMarketPopulation": "45 health facilities, nursing homes, and 8,000 convalescent outpatients in the county",
      "projectedMarketSharePercentage": 6.5,
      "competitors": [
        {
          "name": "National Commercial Food & Beverage Brands [Confirm locally]",
          "location": "Supermarket Chains & Wholesale Depots",
          "priceLevel": "KES 560 per unit",
          "strengths": "High brand recognition, wide supermarket shelf distribution, and automated mass production",
          "weaknesses": "Higher retail price point, reliance on synthetic preservatives or refined sugars, and limited personalized customer nutrition education"
        },
        {
          "name": "Informal Unbranded Market Processors & Posho Mills [Confirm locally]",
          "location": "Open-Air Municipal Markets & Estates",
          "priceLevel": "KES 360 per unit",
          "strengths": "Low selling price and proximity to low-income residential estates",
          "weaknesses": "Inconsistent hygiene, lack of KEBS standardization mark, unsealed packaging, and unverified nutrient composition"
        }
      ],
      "marketingPromotionBudgetMonthly": 12000,
      "machinery": [
        {
          "item": "Stainless steel pharmaceutical-grade ribbon powder mixer and homogenizer",
          "quantity": 1,
          "unitCost": 95000,
          "supplier": "FoodTech Engineering Nairobi"
        },
        {
          "item": "Precision digital analytical balance and moisture analyzer",
          "quantity": 1,
          "unitCost": 35000,
          "supplier": "Lab Equipment Kenya"
        },
        {
          "item": "Semi-automatic auger powder filler and medical pouch heat sealer",
          "quantity": 1,
          "unitCost": 65000,
          "supplier": "Packaging Machinery Kenya"
        },
        {
          "item": "UV-C sterilization cabinet and stainless steel cleanroom prep table",
          "quantity": 1,
          "unitCost": 45000,
          "supplier": "Stainless Kitchens Ltd"
        }
      ],
      "rawMaterials": [
        {
          "material": "Whey/soy protein isolate, maltodextrin, and extruded cereal-legume base",
          "monthlyQuantity": "320 kg",
          "monthlyCost": 112000,
          "supplier": "Certified Food Ingredients Distributors"
        },
        {
          "material": "Clinical vitamin-mineral therapeutic premix (Iron, Zinc, Vitamin A, D3, B-complex)",
          "monthlyQuantity": "15 kg",
          "monthlyCost": 28000,
          "supplier": "Nutrient Premix Suppliers"
        },
        {
          "material": "Medical-grade 500g barrier foil pouches, measuring scoops, and batch labels",
          "monthlyQuantity": "850 units",
          "monthlyCost": 25500,
          "supplier": "Printpak Kenya Ltd"
        }
      ],
      "workshopSquareMeters": 45,
      "monthlyRent": 20000,
      "staffing": [
        {
          "position": "Lead Formulation Dietitian & Production Manager / Founder",
          "count": 1,
          "monthlySalary": 48000,
          "duties": "Nutrient formulation, osmolarity & quality testing, hospital liaison, regulatory compliance",
          "qualifications": "Diploma in Human Nutrition and Dietetics, KNDI Registered"
        },
        {
          "position": "Cleanroom Blending & Packaging Technician",
          "count": 1,
          "monthlySalary": 22000,
          "duties": "Ingredient weighing, ribbon blending, aseptic pouch filling, batch coding",
          "qualifications": "Certificate in Food Science & Technology"
        }
      ],
      "preOperationalCosts": 48000,
      "workingCapitalBuffer": 82000,
      "ownerEquityAmount": 250000,
      "loanAmount": 120000,
      "loanInterestRateAnnual": 12,
      "loanTenureMonths": 24,
      "monthlyOverheads": {
        "rent": 20000,
        "electricity": 8500,
        "water": 2500,
        "transport": 10000,
        "marketing": 12000,
        "stationeryMisc": 3500
      },
      "ownerQualifications": "Diploma in Human Nutrition and Dietetics / Food Science and Technology (KNEC), trained in food formulation, Good Manufacturing Practices (GMP), HACCP hygiene standards, and KEBS quality compliance.",
      "productDescription": "Hygienic formulation and packaging of fortified therapeutic porridge blends, high-protein convalescent shakes, and pasteurized blenderized tube feeds for hospitals and home-care patients. Delivered as High-Energy Protein Therapeutic Convalescent Blend (500g Sealed Tin/Pouch) packaged in 500g medical-grade moisture-barrier foil pouch with scoop, osmolarity/calorie table, and reconstitution instructions to serve hospital nutrition departments, convalescent and post-surgical patients, oncology and renal recovery patients, geriatric care homes, and malnutrition rehabilitation clinics..",
      "streetOrBuilding": "Light Industrial & Agro-Processing Commercial Zone, Ground Floor Unit",
      "locationRationale": "Situated in a well-connected commercial zone with reliable three-phase electricity, municipal potable water, all-weather road access for raw material deliveries from agricultural suppliers, and direct distribution routes to wholesale and retail stockists."
    }
  }
];

const GROUP_DEFAULT_RESEARCH: Record<
  NutritionVentureDefinition["group"],
  (venture: NutritionVentureDefinition) => NonNullable<BusinessPlanSpecs["research"]>
> = {
  A: (v) => ({
    summary: `Kenyan clinical nutrition and dietetic practice for ${v.title} (${v.defaultSpecs.primaryProduct}) is regulated by the Kenya Nutritionists and Dietitians Institute (KNDI) under the Nutritionists and Dietitians Act (Cap 253B) alongside County Department of Public Health outpatient premises licensing and Office of the Data Protection Commissioner (ODPC) health-data controls. Demand across Kenyan urban and county referral catchments is driven by rising prevalence of hypertension, Type 2 diabetes, obesity, and maternal-child micronutrient needs documented in the KNBS Kenya Demographic and Health Survey (KDHS) and Ministry of Health Non-Communicable Disease (NCD) clinical guidelines.`,
    sources: [
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Statutory Registration, Private Practice Licensing & Scope of Practice (Cap 253B)",
        url: "https://www.kndi.institute/",
      },
      {
        title: "Ministry of Health (Kenya) — National Clinical Nutrition, Dietetics & Non-Communicable Disease (NCD) Management Guidelines",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Kenya Demographic and Health Survey (KDHS) Nutritional & NCD Indicators",
        url: "https://www.knbs.or.ke/",
      },
      {
        title: "Office of the Data Protection Commissioner (ODPC) Kenya — Health Data Protection & Patient Privacy Compliance (Data Protection Act, 2019)",
        url: "https://www.odpc.go.ke/",
      },
      {
        title: "World Health Organization (WHO) Kenya — Medical Nutrition Therapy & Primary Healthcare Dietetic Frameworks",
        url: "https://www.afro.who.int/countries/kenya",
      },
      {
        title: "Kenya Laws (National Council for Law Reporting) — Public Health Act (Cap 242) & Nutritionists and Dietitians Act (Cap 253B)",
        url: "https://new.kenyalaw.org/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  B: (v) => ({
    summary: `Kenyan value-added nutrition food processing for ${v.title} (${v.defaultSpecs.primaryProduct}) operates under Kenya Bureau of Standards (KEBS) product certification and Standardization Mark (S-Mark) rules, the Food, Drugs and Chemical Substances Act (Cap 254), and County Public Health food-processing hygiene inspections (Cap 242). Urban and peri-urban household demand is supported by the Kenya National Food Fortification Strategy, rising preference for convenient nutrient-dense and preservative-free foods, and KNBS household food expenditure trends.`,
    sources: [
      {
        title: "Kenya Bureau of Standards (KEBS) — Product Certification, Standardization Mark (S-Mark), Food Hygiene (KS EAS 39) & Composite Flour/Food Standards",
        url: "https://www.kebs.org/",
      },
      {
        title: "Ministry of Health (Kenya) — Kenya National Food Fortification Strategic Plan & Micronutrient Guidelines",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Economic Survey & Household Food Consumption Expenditure Reports",
        url: "https://www.knbs.or.ke/",
      },
      {
        title: "Kenya Industrial Research and Development Institute (KIRDI) — Small & Medium Food Processing Technology & GMP Standards",
        url: "https://www.kirdi.go.ke/",
      },
      {
        title: "National Environment Management Authority (NEMA) Kenya — Agro-Processing Effluent, Solid Waste & Packaging Compliance (EMCA, 1999)",
        url: "https://www.nema.go.ke/",
      },
      {
        title: "Food and Agriculture Organization (FAO) Kenya — Nutrition-Sensitive Value Addition & Food Safety Systems",
        url: "https://www.fao.org/kenya/en/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  C: (v) => ({
    summary: `Kenyan therapeutic catering, healthy meal prep, and wellness food service for ${v.title} (${v.defaultSpecs.primaryProduct}) is governed by the Public Health Act (Cap 242), the Food, Drugs and Chemical Substances Act (Cap 254), County Food Hygiene Licences, Medical Examination Certificates (Form P) for food handlers, and KNDI dietetic menu-formulation standards. Market adoption across Kenyan commercial centres, hospitals, corporate offices, and residential estates is propelled by workplace wellness awareness and demand for freshly prepared, portion-calibrated meals.`,
    sources: [
      {
        title: "Ministry of Health (Kenya) — National Guidelines for Healthy Diets, Physical Activity & Institutional Catering Hygiene",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Dietetic Menu Planning, Therapeutic Catering & Food Service Standards",
        url: "https://www.kndi.institute/",
      },
      {
        title: "Kenya Bureau of Standards (KEBS) — KS EAS 39 Hygiene in the Food and Drink Catering Industry & Food Packaging Standards",
        url: "https://www.kebs.org/",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Urban Household Demographics, Workforce Commuter Trends & Food Service Data",
        url: "https://www.knbs.or.ke/",
      },
      {
        title: "National Environment Management Authority (NEMA) Kenya — Organic Kitchen Waste Segregation & Eco-Friendly Food Packaging Regulations",
        url: "https://www.nema.go.ke/",
      },
      {
        title: "Kenya Laws (National Council for Law Reporting) — Public Health Act (Cap 242) & Food, Drugs and Chemical Substances Act (Cap 254)",
        url: "https://new.kenyalaw.org/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  D: (v) => ({
    summary: `Kenyan nutrition-sensitive agribusiness and biofortified/micronutrient-dense production for ${v.title} (${v.defaultSpecs.primaryProduct}) is supported by the Ministry of Agriculture and Livestock Development's National Agri-Nutrition Implementation Strategy (NANIS), Kenya Agricultural and Livestock Research Organization (KALRO) improved varieties/protocols, and Kenya Plant Health Inspectorate Service (KEPHIS) quality certification. Local market demand is driven by school feeding programs, maternal-child nutrition clinics, health-food processors, and urban green-Automated grocers.`,
    sources: [
      {
        title: "Kenya Agricultural and Livestock Research Organization (KALRO) — Biofortified Crops, Indigenous Vegetables & Livestock Nutrition Research",
        url: "https://www.kalro.org/",
      },
      {
        title: "Ministry of Agriculture and Livestock Development (Kenya) — National Agri-Nutrition Implementation Strategy & Post-Harvest Guidelines",
        url: "https://kilimo.go.ke/",
      },
      {
        title: "Kenya Plant Health Inspectorate Service (KEPHIS) — Seed Certification, Phytosanitary Standards & Produce Traceability",
        url: "https://www.kephis.org/",
      },
      {
        title: "Kenya Bureau of Standards (KEBS) — Grading, Dried Produce, Egg Quality & Fresh Produce Handling Standards",
        url: "https://www.kebs.org/",
      },
      {
        title: "Food and Agriculture Organization (FAO) Kenya — Nutrition-Sensitive Agriculture & Post-Harvest Loss Reduction in Kenya",
        url: "https://www.fao.org/kenya/en/",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Agricultural Production, Horticultural Marketing & County Food Security Reports",
        url: "https://www.knbs.or.ke/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  E: (v) => ({
    summary: `Kenyan specialty health food and maternal/nutraceutical retail for ${v.title} (${v.defaultSpecs.primaryProduct}) is governed by Pharmacy and Poisons Board (PPB) supplement listing rules, KEBS Standardization Marks on packaged health foods, Kenya Breast Milk Substitutes (Regulation and Control) Act (No. 34 of 2012) where applicable, and KNDI in-store nutritionist advisory standards.`,
    sources: [
      {
        title: "Pharmacy and Poisons Board (PPB) Kenya — Guidelines for Registration and Listing of Health Supplements & Nutraceuticals",
        url: "https://web.pharmacyboardkenya.org/",
      },
      {
        title: "Kenya Bureau of Standards (KEBS) — Product Certification, S-Mark & Pre-Packaged Food Labelling Standards (KS EAS 38)",
        url: "https://www.kebs.org/",
      },
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Professional Registration & Retail Dietetic Advisory Standards",
        url: "https://www.kndi.institute/",
      },
      {
        title: "Ministry of Health (Kenya) — Maternal, Infant and Young Child Nutrition (MIYCN) & Micronutrient Supplementation Guidelines",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Healthy U Kenya — Specialty Health Food, Vitamins, Supplements & Natural Wellness Retail Benchmark",
        url: "https://www.healthyu.co.ke/",
      },
      {
        title: "Goodlife Pharmacy Kenya — Retail Nutraceutical, Maternal-Child Wellness & Supplement Benchmark",
        url: "https://www.goodlife.co.ke/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  F: (v) => ({
    summary: `Kenyan nutrition education, culinary demonstration, and school/caregiver training for ${v.title} (${v.defaultSpecs.primaryProduct}) aligns with the Ministry of Health Division of Nutrition and Dietetics, the National School Meals and Nutrition Strategy, KNDI professional accreditation, and UNICEF/WHO Maternal, Infant and Young Child Nutrition (MIYCN) caregiver training frameworks.`,
    sources: [
      {
        title: "Ministry of Health (Kenya) — Maternal, Infant and Young Child Nutrition (MIYCN) & Community Nutrition Education Guidelines",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Accreditation of Nutrition Educators, Curricula & Community Training",
        url: "https://www.kndi.institute/",
      },
      {
        title: "Ministry of Education (Kenya) — National School Meals and Nutrition Strategy & Early Childhood Health Guidelines",
        url: "https://www.education.go.ke/",
      },
      {
        title: "UNICEF Kenya — Child Nutrition, Complementary Feeding (IYCF) & Caregiver Capacity-Building Frameworks",
        url: "https://www.unicef.org/kenya/nutrition",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Kenya Demographic and Health Survey (KDHS) Child Feeding & Household Nutrition Data",
        url: "https://www.knbs.or.ke/",
      },
      {
        title: "Technical and Vocational Education and Training Authority (TVETA) Kenya — Short-Course & Community Skills Training Standards",
        url: "https://www.tveta.go.ke/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  G: (v) => ({
    summary: `Kenyan institutional nutrition consultancy, workplace wellness, food safety auditing, and public health project advisory for ${v.title} (${v.defaultSpecs.primaryProduct}) operates under KNDI consulting accreditation, Directorate of Occupational Safety and Health Services (DOSHS / OSHA 2007) workplace wellness standards, KEBS HACCP / ISO 22000 food safety frameworks, and the Kenya Nutrition Action Plan (KNAP).`,
    sources: [
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Consultancy Accreditation, Institutional Dietetics & Professional Ethics",
        url: "https://www.kndi.institute/",
      },
      {
        title: "Ministry of Health (Kenya) — Kenya Nutrition Action Plan (KNAP) & National Workplace Wellness Guidelines",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya Bureau of Standards (KEBS) — KS EAS 39 Food Hygiene, HACCP & ISO 22000 Food Safety Management Systems",
        url: "https://www.kebs.org/",
      },
      {
        title: "Ministry of Labour and Social Protection (DOSHS Kenya) — Occupational Safety and Health Act (OSHA, 2007) Employee Wellness Compliance",
        url: "https://www.labour.go.ke/",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Formal Sector Employment, Institutional Demographics & Health Survey Data",
        url: "https://www.knbs.or.ke/",
      },
      {
        title: "Office of the Data Protection Commissioner (ODPC) Kenya — Corporate Wellness & Survey Data Protection Compliance",
        url: "https://www.odpc.go.ke/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
  H: (v) => ({
    summary: `Kenyan therapeutic and enteral nutrition formulation for ${v.title} (${v.defaultSpecs.primaryProduct}) is governed by Kenya Bureau of Standards (KEBS) special dietary food standards, Pharmacy and Poisons Board (PPB) clinical nutrition product regulations, KNDI clinical dietetics oversight, and Ministry of Health Integrated Management of Acute Malnutrition (IMAM) and hospital enteral feeding guidelines.`,
    sources: [
      {
        title: "Ministry of Health (Kenya) — National Guidelines for Integrated Management of Acute Malnutrition (IMAM) & Clinical Enteral Nutrition",
        url: "https://www.health.go.ke/",
      },
      {
        title: "Kenya Bureau of Standards (KEBS) — Special Dietary Foods, Fortified Therapeutic Blends & Hygienic Manufacturing Standards",
        url: "https://www.kebs.org/",
      },
      {
        title: "Pharmacy and Poisons Board (PPB) Kenya — Regulatory Listing of Clinical Nutrition, Enteral Feeds & Special Medical Foods",
        url: "https://web.pharmacyboardkenya.org/",
      },
      {
        title: "Kenya Nutritionists and Dietitians Institute (KNDI) — Clinical Dietetics, Hospital Therapeutic Feeding & Quality Assurance Standards",
        url: "https://www.kndi.institute/",
      },
      {
        title: "World Health Organization (WHO) & Codex Alimentarius — Standards for Foods for Special Medical Purposes & Therapeutic Feeding",
        url: "https://www.afro.who.int/countries/kenya",
      },
      {
        title: "Kenya National Bureau of Statistics (KNBS) — Hospital Morbidity, Malnutrition Prevalence & Healthcare Facility Statistics",
        url: "https://www.knbs.or.ke/",
      },
    ],
    searchedAt: "2025-02-01T00:00:00.000Z",
  }),
};

for (const venture of NUTRITION_VENTURES) {
  const existingSources = venture.defaultSpecs.research?.sources || [];
  if (existingSources.length < 6) {
    const fallback = GROUP_DEFAULT_RESEARCH[venture.group](venture);
    const mergedSources = [
      ...existingSources,
      ...fallback.sources.filter((s) => !existingSources.some((e) => e.url === s.url)),
    ];
    venture.defaultSpecs.research = {
      summary: venture.defaultSpecs.research?.summary || fallback.summary,
      sources: mergedSources,
      searchedAt: venture.defaultSpecs.research?.searchedAt || fallback.searchedAt,
    };
  }
}

export function getVentureById(id: string): NutritionVentureDefinition | undefined {
  return NUTRITION_VENTURES.find((v) => v.id === id);
}

export function getVenturesByGroup(group: string): NutritionVentureDefinition[] {
  return NUTRITION_VENTURES.filter((v) => v.group === group);
}

export function getVenturesByCapital(tier: "Low" | "Medium" | "High"): NutritionVentureDefinition[] {
  return NUTRITION_VENTURES.filter((v) => v.capitalTier === tier);
}
