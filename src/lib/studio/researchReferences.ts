export interface ResearchReference {
  id: string;
  inText: string;
  apa: string;
  supports: string[];
}

export const RESEARCH_REFERENCES: ResearchReference[] = [
  {
    id: "knbs_kdhs_2022",
    inText: "(KNBS, MOH, & ICF, 2023)",
    apa: "Kenya National Bureau of Statistics, Ministry of Health, & ICF. (2023). Kenya Demographic and Health Survey 2022: Key indicators report. KNBS and ICF. https://dhsprogram.com/publications/publication-PR143-Preliminary-Reports.cfm",
    supports: ["kenya", "kdhs", "stunting", "wasting", "overweight", "breastfeeding", "anaemia", "mortality", "antenatal"],
  },
  {
    id: "knbs_kdhs_2014",
    inText: "(KNBS et al., 2015)",
    apa: "Kenya National Bureau of Statistics, Ministry of Health, National AIDS Control Council, Kenya Medical Research Institute, & National Council for Population and Development. (2015). Kenya Demographic and Health Survey 2014. KNBS and ICF International. https://dhsprogram.com/publications/publication-FR308-DHS-Final-Reports.cfm",
    supports: ["kenya", "kdhs", "trend", "stunting", "wasting", "underweight", "mortality"],
  },
  {
    id: "unicef_who_wb_jme_2023",
    inText: "(UNICEF, WHO, & World Bank, 2023)",
    apa: "United Nations Children's Fund, World Health Organization, & The World Bank. (2023). Levels and trends in child malnutrition: UNICEF / WHO / World Bank Group Joint Child Malnutrition Estimates: Key findings of the 2023 edition. World Health Organization. https://www.who.int/publications/i/item/9789240073791",
    supports: ["child_malnutrition", "stunting", "wasting", "overweight", "underweight", "global"],
  },
  {
    id: "who_growth_2006",
    inText: "(WHO, 2006)",
    apa: "World Health Organization. (2006). WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age: Methods and development. World Health Organization. https://www.who.int/publications/i/item/924154693X",
    supports: ["child_malnutrition", "stunting", "wasting", "underweight", "overweight", "anthropometry"],
  },
  {
    id: "unicef_framework_2020",
    inText: "(UNICEF, 2021)",
    apa: "United Nations Children's Fund. (2021). UNICEF conceptual framework on maternal and child nutrition. UNICEF. https://www.unicef.org/documents/conceptual-framework-nutrition",
    supports: ["theoretical", "child_malnutrition", "maternal_nutrition", "iycf_feeding", "food_security", "conceptual"],
  },
  {
    id: "black_lancet_2013",
    inText: "(Black et al., 2013)",
    apa: "Black, R. E., Victora, C. G., Walker, S. P., Bhutta, Z. A., Christian, P., de Onis, M., Ezzati, M., Grantham-McGregor, S., Katz, J., Martorell, R., & Uauy, R. (2013). Maternal and child undernutrition and overweight in low-income and middle-income countries. The Lancet, 382(9890), 427-451. https://doi.org/10.1016/S0140-6736(13)60937-X",
    supports: ["child_malnutrition", "maternal_nutrition", "micronutrients", "stunting", "anaemia", "overweight"],
  },
  {
    id: "fao_sofi_2023",
    inText: "(FAO et al., 2023)",
    apa: "Food and Agriculture Organization, International Fund for Agricultural Development, United Nations Children's Fund, World Food Programme, & World Health Organization. (2023). The state of food security and nutrition in the world 2023: Urbanization, agrifood systems transformation and healthy diets across the rural-urban continuum. FAO. https://doi.org/10.4060/cc3017en",
    supports: ["food_security", "undernourishment", "food_insecurity_mod_sev", "global"],
  },
  {
    id: "moh_kenap_2020",
    inText: "(Ministry of Health [MOH], 2020)",
    apa: "Ministry of Health. (2020). Kenya Nutrition Action Plan (KNAP) 2018-2022. Government of Kenya.",
    supports: ["kenya", "policy", "micronutrients", "iycf_feeding", "maternal_nutrition", "child_malnutrition"],
  },
  {
    id: "who_anaemia_2011",
    inText: "(WHO, 2011)",
    apa: "World Health Organization. (2011). Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity (WHO/NMH/NHD/MNM/11.1). World Health Organization. https://www.who.int/publications/i/item/WHO-NMH-NHD-MNM-11.1",
    supports: ["micronutrients", "maternal_nutrition", "anaemia_children", "anaemia_women", "anaemia_pregnant"],
  },
  {
    id: "who_iycf_2021",
    inText: "(WHO & UNICEF, 2021)",
    apa: "World Health Organization, & United Nations Children's Fund. (2021). Indicators for assessing infant and young child feeding practices: Definitions and measurement methods. World Health Organization and UNICEF. https://www.who.int/publications/i/item/9789240018389",
    supports: ["iycf_feeding", "exclusive_breastfeeding", "child_health"],
  },
  {
    id: "creswell_2014",
    inText: "(Creswell, 2014)",
    apa: "Creswell, J. W. (2014). Research design: Qualitative, quantitative, and mixed methods approaches (4th ed.). SAGE Publications.",
    supports: ["methodology", "design"],
  },
  {
    id: "worldbank_wdi_2026",
    inText: "(World Bank, 2026)",
    apa: "World Bank. (2026). World Development Indicators: Kenya health, nutrition and population statistics [Data set]. World Bank Group. https://data.worldbank.org/country/kenya",
    supports: ["dataset", "kenya", "trend"],
  },
];

export function getReferenceById(id: string): ResearchReference | undefined {
  return RESEARCH_REFERENCES.find((r) => r.id === id);
}

/** Returns only the references actually cited (by id) in sorted APA order. */
export function formatApaReferenceList(citedIds: Iterable<string>): string {
  const unique = new Set(citedIds);
  const refs = RESEARCH_REFERENCES.filter((r) => unique.has(r.id)).sort((a, b) =>
    a.apa.localeCompare(b.apa)
  );
  return refs.map((r) => r.apa).join("\n\n");
}
