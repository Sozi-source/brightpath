import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const topics = [
  {
    area: "Child Malnutrition",
    title: "Trends in Child Stunting, Wasting, and Underweight in Kenya (KDHS 1998-2022)",
    workspace_type: "research_secondary",
    suggested_indicators: "Stunting (% HAZ < -2), Wasting (% WHZ < -2), Underweight (% WAZ < -2)",
    suggested_sources: "Kenya Demographic and Health Surveys (KDHS 1998, 2003, 2008-09, 2014, 2022), KNBS",
    course_tags: ["Nutrition and Dietetics", "Public Health", "Community Health"],
    active: true,
  },
  {
    area: "Infant and Young Child Feeding",
    title: "Exclusive Breastfeeding and Minimum Acceptable Diet Trends Among Children 0-23 Months",
    workspace_type: "research_secondary",
    suggested_indicators: "Exclusive breastfeeding under 6 months (%), Minimum dietary diversity (%), Minimum meal frequency (%)",
    suggested_sources: "KDHS 2003-2022, Ministry of Health Kenya Nutrition Reports",
    course_tags: ["Nutrition and Dietetics", "Community Health"],
    active: true,
  },
  {
    area: "Maternal Nutrition",
    title: "Iron and Folic Acid Supplementation (IFAS) Uptake Trends Among Pregnant Women in Kenya",
    workspace_type: "research_secondary",
    suggested_indicators: "IFAS compliance for >= 90 days (%), First trimester ANC attendance (%), Maternal anemia prevalence (%)",
    suggested_sources: "KDHS 2014, 2022; Kenya National Micronutrient Survey",
    course_tags: ["Nutrition and Dietetics", "Nursing", "Public Health"],
    active: true,
  },
  {
    area: "Food Processing & Product Development",
    title: "Formulation, Quality Evaluation and Costing of Orange-Fleshed Sweet Potato (OFSP) and Soy Composite Flour for Weaning Porridge",
    workspace_type: "trade_fabrication",
    suggested_indicators: "Moisture content (%), Ash content (%), Sensory overall acceptability (9-point hedonic scale), Production unit cost (KES/kg)",
    suggested_sources: "Kenya Bureau of Standards (KEBS) Composite Flour Standard, FAO Food Composition Tables",
    course_tags: ["Food Science and Processing", "Nutrition and Dietetics", "Food Technology"],
    active: true,
  },
  {
    area: "Food Preservation & Post-Harvest",
    title: "Solar Drying, Microbial Quality Assessment and Packaging of Indigenous Green Leafy Vegetable (African Nightshade) Flakes",
    workspace_type: "trade_fabrication",
    suggested_indicators: "Drying rate (hours to 10% moisture), Vitamin C retention (%), Total plate count (cfu/g), Packaging cost per unit",
    suggested_sources: "KALRO Post-Harvest Guidelines, KEBS Dried Vegetables Standard",
    course_tags: ["Food Technology", "Food Processing", "Agriculture"],
    active: true,
  },
  {
    area: "Agri-Nutrition Enterprise",
    title: "Business Plan for Commercial Processing and Distribution of Fortified Millet-Amaranth Instant Flour in Peri-Urban Centers",
    workspace_type: "business_plan",
    suggested_indicators: "Break-even volume (packs/month), Gross profit margin (%), Initial capital required (KES), Payback period",
    suggested_sources: "Micro and Small Enterprises Authority (MSEA) Kenya, County Market Surveys",
    course_tags: ["Entrepreneurship", "Food Technology", "Agribusiness", "Business Management"],
    active: true,
  },
  {
    area: "Agri-Enterprise & Processing",
    title: "Business Plan for Setting Up an Artisanal Cold-Pressed Seed Oil Extraction and Bottling Micro-Enterprise",
    workspace_type: "business_plan",
    suggested_indicators: "Extraction yield (litres/100kg seed), Equipment payback period (months), Target monthly sales volume",
    suggested_sources: "Kenya National Chamber of Commerce & Industry (KNCCI), Ministry of Industrialization",
    course_tags: ["Entrepreneurship", "Food Science", "Agribusiness"],
    active: true,
  },
];

console.log("Seeding topic_bank in Supabase...");

for (const t of topics) {
  const { data: existing } = await supabase
    .from("topic_bank")
    .select("id")
    .eq("title", t.title)
    .maybeSingle();

  if (existing) {
    console.log(`Topic already exists: ${t.title}`);
  } else {
    const { error } = await supabase.from("topic_bank").insert(t);
    if (error) {
      console.error(`Error inserting ${t.title}:`, error.message);
    } else {
      console.log(`Inserted: ${t.title}`);
    }
  }
}

console.log("Topic bank seeding completed successfully.");
