#!/usr/bin/env node
/**
 * Fetches verified secondary-data indicators for Kenya from the World Bank
 * Indicators API (v2) and writes src/lib/studio/researchDataSnapshot.json.
 *
 * Run: node scripts/fetch-research-data.mjs
 */
import fs from "node:fs";
import path from "node:path";

const INDICATORS = [
  {
    id: "stunting_u5",
    wbCode: "SH.STA.STNT.ZS",
    label: "Prevalence of stunting, height for age (% of children under 5)",
    shortLabel: "Child Stunting (<5 yrs)",
    unit: "%",
    domain: "child_malnutrition",
    definition:
      "Percentage of children under age 5 whose height-for-age is more than two standard deviations below the median for the WHO Child Growth Standards.",
    sourceOrg: "UNICEF, WHO, World Bank (Joint Child Malnutrition Estimates) via World Bank WDI",
  },
  {
    id: "wasting_u5",
    wbCode: "SH.STA.WAST.ZS",
    label: "Prevalence of wasting, weight for height (% of children under 5)",
    shortLabel: "Child Wasting (<5 yrs)",
    unit: "%",
    domain: "child_malnutrition",
    definition:
      "Percentage of children under age 5 whose weight-for-height is more than two standard deviations below the median for the WHO Child Growth Standards.",
    sourceOrg: "UNICEF, WHO, World Bank (Joint Child Malnutrition Estimates) via World Bank WDI",
  },
  {
    id: "underweight_u5",
    wbCode: "SH.STA.MALN.ZS",
    label: "Prevalence of underweight, weight for age (% of children under 5)",
    shortLabel: "Child Underweight (<5 yrs)",
    unit: "%",
    domain: "child_malnutrition",
    definition:
      "Percentage of children under age 5 whose weight-for-age is more than two standard deviations below the median for the WHO Child Growth Standards.",
    sourceOrg: "UNICEF, WHO, World Bank (Joint Child Malnutrition Estimates) via World Bank WDI",
  },
  {
    id: "overweight_u5",
    wbCode: "SH.STA.OWGH.ZS",
    label: "Prevalence of overweight, weight for height (% of children under 5)",
    shortLabel: "Child Overweight (<5 yrs)",
    unit: "%",
    domain: "child_malnutrition",
    definition:
      "Percentage of children under age 5 whose weight-for-height is more than two standard deviations above the median for the WHO Child Growth Standards.",
    sourceOrg: "UNICEF, WHO, World Bank (Joint Child Malnutrition Estimates) via World Bank WDI",
  },
  {
    id: "exclusive_breastfeeding",
    wbCode: "SH.STA.BFED.ZS",
    label: "Exclusive breastfeeding (% of children under 6 months)",
    shortLabel: "Exclusive Breastfeeding (<6 mos)",
    unit: "%",
    domain: "iycf_feeding",
    definition:
      "Percentage of infants 0-5 months of age who are fed exclusively with breast milk in the 24 hours preceding the survey.",
    sourceOrg: "UNICEF / DHS Program via World Bank WDI",
  },
  {
    id: "anaemia_children",
    wbCode: "SH.ANM.CHLD.ZS",
    label: "Prevalence of anaemia among children (% of children ages 6-59 months)",
    shortLabel: "Child Anaemia (6-59 mos)",
    unit: "%",
    domain: "micronutrients",
    definition:
      "Percentage of children aged 6-59 months whose haemoglobin concentration is less than 110 grams per litre, adjusted for altitude.",
    sourceOrg: "WHO Global Health Observatory via World Bank WDI",
  },
  {
    id: "anaemia_women",
    wbCode: "SH.ANM.ALLW.ZS",
    label: "Prevalence of anaemia among women of reproductive age (% of women ages 15-49)",
    shortLabel: "Maternal/Women Anaemia (15-49 yrs)",
    unit: "%",
    domain: "maternal_nutrition",
    definition:
      "Percentage of women aged 15-49 years with haemoglobin concentration below WHO thresholds (110 g/L for pregnant, 120 g/L for non-pregnant).",
    sourceOrg: "WHO Global Health Observatory via World Bank WDI",
  },
  {
    id: "anaemia_pregnant",
    wbCode: "SH.PRG.ANEM",
    label: "Prevalence of anaemia among pregnant women (%)",
    shortLabel: "Pregnant Women Anaemia",
    unit: "%",
    domain: "maternal_nutrition",
    definition:
      "Percentage of pregnant women whose haemoglobin level is less than 110 grams per litre at sea level.",
    sourceOrg: "WHO Global Health Observatory via World Bank WDI",
  },
  {
    id: "undernourishment",
    wbCode: "SN.ITK.DEFC.ZS",
    label: "Prevalence of undernourishment (% of population)",
    shortLabel: "Population Undernourishment",
    unit: "%",
    domain: "food_security",
    definition:
      "Percentage of the population whose habitual food consumption is insufficient to provide the dietary energy levels required to maintain a normal active and healthy life.",
    sourceOrg: "FAO Food Security Indicators via World Bank WDI",
  },
  {
    id: "food_insecurity_mod_sev",
    wbCode: "SN.ITK.MSFI.ZS",
    label: "Prevalence of moderate or severe food insecurity in the population (%)",
    shortLabel: "Moderate/Severe Food Insecurity",
    unit: "%",
    domain: "food_security",
    definition:
      "Percentage of individuals in the national population who experienced moderate or severe food insecurity based on the Food Insecurity Experience Scale (FIES).",
    sourceOrg: "FAO Voices of the Hungry / FIES via World Bank WDI",
  },
  {
    id: "low_birthweight",
    wbCode: "SH.STA.BRTW.ZS",
    label: "Low-birthweight babies (% of births)",
    shortLabel: "Low Birthweight (<2.5 kg)",
    unit: "%",
    domain: "maternal_nutrition",
    definition:
      "Percentage of newborns weighing less than 2,500 grams (5.5 pounds) at birth.",
    sourceOrg: "UNICEF-WHO Low Birthweight Estimates via World Bank WDI",
  },
  {
    id: "antenatal_care_4plus",
    wbCode: "SH.STA.ANVC.ZS",
    label: "Pregnant women receiving prenatal care (%)",
    shortLabel: "Antenatal Care Coverage",
    unit: "%",
    domain: "maternal_nutrition",
    definition:
      "Percentage of women attended at least once during pregnancy by skilled health personnel for reasons related to pregnancy.",
    sourceOrg: "UNICEF / DHS / MICS via World Bank WDI",
  },
  {
    id: "under5_mortality",
    wbCode: "SH.DYN.MORT",
    label: "Mortality rate, under-5 (per 1,000 live births)",
    shortLabel: "Under-5 Mortality Rate",
    unit: "per 1,000 live births",
    domain: "child_health",
    definition:
      "Probability per 1,000 that a newborn baby will die before reaching age five, if subject to age-specific mortality rates of the specified year.",
    sourceOrg: "UN Inter-agency Group for Child Mortality Estimation (IGME) via World Bank WDI",
  },
  {
    id: "infant_mortality",
    wbCode: "SP.DYN.IMRT.IN",
    label: "Mortality rate, infant (per 1,000 live births)",
    shortLabel: "Infant Mortality Rate",
    unit: "per 1,000 live births",
    domain: "child_health",
    definition:
      "Number of infants dying before reaching one year of age, per 1,000 live births in a given year.",
    sourceOrg: "UN Inter-agency Group for Child Mortality Estimation (IGME) via World Bank WDI",
  },
  {
    id: "immunization_dpt",
    wbCode: "SH.IMM.IDPT",
    label: "Immunization, DPT (% of children ages 12-23 months)",
    shortLabel: "DPT3 Immunization Coverage",
    unit: "%",
    domain: "child_health",
    definition:
      "Percentage of children ages 12-23 months who received three doses of diphtheria, pertussis, and tetanus vaccine.",
    sourceOrg: "WHO and UNICEF Estimates of National Immunization Coverage via World Bank WDI",
  },
  {
    id: "vitamin_a_supp",
    wbCode: "SN.ITK.VITA.ZS",
    label: "Vitamin A supplementation coverage rate (% of children ages 6-59 months)",
    shortLabel: "Vitamin A Supplementation (6-59 mos)",
    unit: "%",
    domain: "micronutrients",
    definition:
      "Percentage of children ages 6-59 months who received two age-appropriate doses of vitamin A in a given calendar year.",
    sourceOrg: "UNICEF Global Databases via World Bank WDI",
  },
];

async function fetchIndicator(meta) {
  const url = `https://api.worldbank.org/v2/country/KEN/indicator/${meta.wbCode}?format=json&per_page=100`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${meta.wbCode}`);
  }
  const json = await res.json();
  if (!Array.isArray(json) || !Array.isArray(json[1])) {
    throw new Error(`Unexpected response for ${meta.wbCode}`);
  }
  const rows = json[1]
    .filter((r) => r && r.value !== null && r.value !== undefined && Number.isFinite(Number(r.value)))
    .map((r) => ({
      year: Number(r.date),
      value: Math.round(Number(r.value) * 10) / 10,
    }))
    .filter((r) => r.year >= 1995)
    .sort((a, b) => a.year - b.year);

  return {
    id: meta.id,
    wbCode: meta.wbCode,
    label: meta.label,
    shortLabel: meta.shortLabel,
    unit: meta.unit,
    domain: meta.domain,
    definition: meta.definition,
    sourceOrg: meta.sourceOrg,
    sourceUrl: `https://data.worldbank.org/indicator/${meta.wbCode}?locations=KE`,
    apiUrl: url,
    series: rows,
  };
}

async function main() {
  const results = [];
  for (const meta of INDICATORS) {
    try {
      const data = await fetchIndicator(meta);
      console.log(`Fetched ${meta.id} (${meta.wbCode}): ${data.series.length} points (${data.series[0]?.year}-${data.series[data.series.length - 1]?.year})`);
      if (data.series.length >= 3) {
        results.push(data);
      } else {
        console.warn(`Skipping ${meta.id}: fewer than 3 data points`);
      }
    } catch (err) {
      console.error(`Failed ${meta.id} (${meta.wbCode}):`, err.message);
    }
  }

  const snapshot = {
    country: "Kenya",
    countryIso3: "KEN",
    retrievedAt: new Date().toISOString(),
    provider: "World Bank Indicators API v2 (https://api.worldbank.org/v2)",
    indicators: results,
  };

  const outPath = path.resolve(process.cwd(), "src/lib/studio/researchDataSnapshot.json");
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${results.length} indicators to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
