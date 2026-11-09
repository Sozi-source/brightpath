"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  X,
  Loader2,
  FlaskConical,
  LineChart,
  Briefcase,
  Package,
  Wrench,
  Users,
  Eye,
  HeartPulse,
  Factory,
  Utensils,
  Sprout,
  Store,
  GraduationCap,
  ClipboardCheck,
  PawPrint,
  MoreVertical,
  Folder,
  FileText,
  Calculator,
  Star,
  Award,
  BookOpen,
  HelpCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { NUTRITION_VENTURES, type NutritionVentureDefinition } from "@/lib/studio/catalog/nutritionVentures";
import { createWorkspace } from "@/app/studio/actions";
import { getCanvasPalette } from "@/lib/canvasTheme";

interface ProjectAreaCatalogProps {
  candidateName?: string;
  admissionNumber?: string;
  course?: string;
  level?: "craft" | "diploma";
  currentWorkspacesCount?: number;
  initialTrack?: "business_plan" | "trade_fabrication" | "research_secondary";
}

type GroupFilter = "ALL" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

const GROUP_LABELS: Record<GroupFilter, string> = {
  ALL: "All Areas (35)",
  A: "A: Clinical (7)",
  B: "B: Food Processing (10)",
  C: "C: Food Service (4)",
  D: "D: Agribusiness (4)",
  E: "E: Specialty Retail (2)",
  F: "F: Nutrition Ed (4)",
  G: "G: Advisory & Audits (3)",
  H: "H: Therapeutic Feeds (1)",
};

const GROUP_VISUALS = {
  A: { Icon: HeartPulse, tile: "bg-rose-50 text-rose-700", accent: "border-rose-100" },
  B: { Icon: Factory, tile: "bg-amber-50 text-amber-700", accent: "border-amber-100" },
  C: { Icon: Utensils, tile: "bg-orange-50 text-orange-700", accent: "border-orange-100" },
  D: { Icon: Sprout, tile: "bg-green-50 text-green-700", accent: "border-green-100" },
  E: { Icon: Store, tile: "bg-violet-50 text-violet-700", accent: "border-violet-100" },
  F: { Icon: GraduationCap, tile: "bg-sky-50 text-sky-700", accent: "border-sky-100" },
  G: { Icon: ClipboardCheck, tile: "bg-indigo-50 text-indigo-700", accent: "border-indigo-100" },
  H: { Icon: PawPrint, tile: "bg-teal-50 text-teal-700", accent: "border-teal-100" },
} as const;

function getVentureProblemAndGap(venture: NutritionVentureDefinition) {
  const group = venture.group;

  let problemSolved = "";
  let justificationGap = "";

  switch (group) {
    case "A": // Clinical
      problemSolved = `Surging prevalence of non-communicable lifestyle conditions—notably hypertension, type-2 diabetes, gout, and maternal/child micro-nutrient deficiencies—compounded by an acute shortage of certified clinical dietary counseling in regional health centers.`;
      justificationGap = `Conventional referral hospitals charge prohibitive consultation tariffs (KES 2,000+) with long outpatient delays, while informal fitness trainers lack statutory KNDI clinical credentials and medical safety. This clinic bridges the gap by providing affordable, evidence-based nutrition assessment and culturally adapted meal plans.`;
      break;

    case "B": // Food Processing
      problemSolved = `High post-harvest perishability of farm produce (up to 35–40% seasonal wastage) alongside severe micronutrient malnutrition (Vitamin A, iron, and zinc deficits) among under-five children, school-age youth, and vulnerable households.`;
      justificationGap = `Mass-market retail foods in Kenya are heavily dominated by refined carbohydrates and artificial additives with minimal bioavailable nutrition. This enterprise bridges the gap by sourcing raw biofortified produce directly from smallholders and utilizing hygienic processing to supply shelf-stable, nutrient-dense foods at prices competitive with basic staples.`;
      break;

    case "C": // Food Service & Catering
      problemSolved = `Lack of wholesome, therapeutic meal options for recovering hospital patients, dietary-restricted workers, and urban commuters who are forced to rely on commercial fast foods characterized by saturated trans-fats, excess sodium, and high glycemic indices.`;
      justificationGap = `Standard institutional cafeterias and caterers treat meal preparation as generic volume food service without professional portion control, nutrient preservation, or clinical meal prescription. This enterprise fills this unmet demand by offering calibrated, dietary-compliant menus prepared under strict HACCP hygiene protocols.`;
      break;

    case "D": // Agribusiness & Urban Farming
      problemSolved = `Land scarcity, escalating fertilizer and animal feed costs, and seasonal climate shocks that create erratic shortages and price spikes of fresh microgreens, biofortified crops, and quality protein in peri-urban markets.`;
      justificationGap = `Conventional rural agriculture suffers from prolonged logistical transit times, high transport shrinkage, and chemical pesticide over-reliance. This intensive urban production model utilizes vertical space, rapid harvesting cycles, and organic management to guarantee premium fresh supply directly to local retail and institutional clients.`;
      break;

    case "E": // Specialty Retail
      problemSolved = `Severe regional scarcity of verified therapeutic supplements, gluten-free formulations, diabetic staples, and clinical infant weaning products outside Nairobi and Tier-1 private pharmacies.`;
      justificationGap = `Mainstream supermarkets stock generic retail foods with ambiguous allergen labeling and untrained attendants unable to guide clients on specific dietary restrictions. This specialty retail shop bridges the gap with verified supply chains, KEBS-compliant products, and informed point-of-sale dietary guidance.`;
      break;

    case "F": // Nutrition Education & School Feeding
      problemSolved = `Widespread dietary misinformation, low adherence to infant and young child feeding (IYCF) guidelines, and uncalibrated school meal programs that trigger stunting and reduced cognitive performance in developing children.`;
      justificationGap = `Public school administrations and community daycare facilities lack in-house nutritionists to formulate balanced nutrient-dense menus within limited per-pupil capitation budgets. This enterprise provides structured menu audits, teacher/cook training, and institutional catering designs aligned with MOH and KNEC guidelines.`;
      break;

    case "G": // Advisory & Auditing
      problemSolved = `Pervasive failure of food processing SMEs and commercial catering facilities to pass mandatory KEBS product standardisation, County public health hygiene audits, and NEMA environmental waste disposal criteria.`;
      justificationGap = `Multinational food consultancy firms charge prohibitive corporate fees inaccessible to local medium-sized enterprises. This consultancy delivers affordable, hands-on compliance auditing, HACCP certification pathways, and proximate food testing facilitation.`;
      break;

    case "H": // Therapeutic Feeds
      problemSolved = `High mortality rates and severe recovery delays among livestock, poultry, and specialty farm animals suffering from digestive disorders and malnutrition due to poor commercial feed formulations.`;
      justificationGap = `Standard commercial millers produce bulk livestock feed with uniform, low-protein grains without therapeutic formulations. This venture bridges the gap with specialized, clinical formulations optimized for recovery and growth.`;
      break;

    default:
      problemSolved = `Unmet community and commercial demand for specialized nutritional solutions, value-added food processing, and accessible health consultation in the local sub-county catchment area.`;
      justificationGap = `Existing regional market options are either overpriced or lack accredited TVET technical standards. This enterprise provides a viable, scalable, and KNEC-compliant business model with audited financial viability.`;
      break;
  }

  return { problemSolved, justificationGap };
}

export function ProjectAreaCatalog({
  admissionNumber = "",
  course = "Diploma in Human Nutrition and Dietetics",
  level = "diploma",
  initialTrack = "business_plan",
}: ProjectAreaCatalogProps) {
  const [activeTrack, setActiveTrack] = useState<"business_plan" | "trade_fabrication" | "research_secondary">(initialTrack);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>("ALL");
  const [selectedCapital, setSelectedCapital] = useState<"ALL" | "Low" | "Medium" | "High">("ALL");
  const [detailVenture, setDetailVenture] = useState<NutritionVentureDefinition | null>(null);
  const [selectedVenture, setSelectedVenture] = useState<NutritionVentureDefinition | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states for the launch modal
  const [formAdmissionNumber, setFormAdmissionNumber] = useState(admissionNumber);
  const [formLevel, setFormLevel] = useState<"craft" | "diploma">(level);
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formTownOrMarket, setFormTownOrMarket] = useState("Juja");
  const [formCounty, setFormCounty] = useState("Kiambu");
  const [formPrivacyConsent, setFormPrivacyConsent] = useState(true);

  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");

  // Filtered ventures
  const filteredVentures = useMemo(() => {
    return NUTRITION_VENTURES.filter((venture) => {
      if (selectedGroup !== "ALL" && venture.group !== selectedGroup) return false;
      if (selectedCapital !== "ALL" && venture.capitalTier !== selectedCapital) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = venture.title.toLowerCase().includes(q);
        const matchesSummary = venture.summary.toLowerCase().includes(q);
        const matchesTagline = venture.tagline.toLowerCase().includes(q);
        const matchesNum = `#${venture.number}`.includes(q) || `${venture.number}` === q;
        const matchesGroup = venture.groupName.toLowerCase().includes(q);
        const matchesProduct = (venture.defaultSpecs.primaryProduct || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesTagline && !matchesNum && !matchesGroup && !matchesProduct) {
          return false;
        }
      }
      return true;
    });
  }, [selectedGroup, selectedCapital, searchQuery]);

  const handleOpenVentureModal = (venture: NutritionVentureDefinition) => {
    setSelectedVenture(venture);
    setFormBusinessName(
      (venture.defaultSpecs.businessName as string) || `${venture.title} Enterprise`
    );
  };

  const handleCloseModal = () => {
    setSelectedVenture(null);
  };

  const handleLaunchVenture = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVenture) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("workspaceType", "business_plan");
      formData.set("ventureId", selectedVenture.id);
      formData.set("level", formLevel);
      formData.set("course", course);
      formData.set("admissionNumber", formAdmissionNumber);
      formData.set("businessName", formBusinessName);
      formData.set("title", formBusinessName);
      formData.set("townOrMarket", formTownOrMarket);
      formData.set("county", formCounty);
      formData.set("privacyConsent", formPrivacyConsent ? "on" : "off");

      await createWorkspace(formData);
    });
  };

  const handleLaunchCustomTrack = (track: "trade_fabrication" | "research_secondary") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("workspaceType", track);
      formData.set("level", formLevel);
      formData.set("course", course);
      formData.set("admissionNumber", formAdmissionNumber);
      formData.set("privacyConsent", "on");

      await createWorkspace(formData);
    });
  };

  const detailPalette = detailVenture ? getCanvasPalette(detailVenture.id || detailVenture.number) : null;
  const detailUnitPrice = detailVenture?.defaultSpecs.unitSellingPrice || 0;
  const detailUnitCost = detailVenture?.defaultSpecs.unitCostOfProduction || 0;
  const detailGrossMargin =
    detailUnitPrice > 0
      ? Math.round(((detailUnitPrice - detailUnitCost) / detailUnitPrice) * 100)
      : 0;
  const DetailCategoryIcon = detailVenture ? GROUP_VISUALS[detailVenture.group].Icon : null;
  const ventureNarrative = detailVenture ? getVentureProblemAndGap(detailVenture) : null;
  const detailBusinessName = detailVenture?.defaultSpecs.businessName || detailVenture?.title || "Enterprise";

  const relatedVentures = useMemo(() => {
    if (!detailVenture) return [];
    const sameGroup = NUTRITION_VENTURES.filter(
      (v) => v.group === detailVenture.group && v.id !== detailVenture.id
    );
    if (sameGroup.length >= 3) return sameGroup.slice(0, 3);
    const otherGroups = NUTRITION_VENTURES.filter(
      (v) => v.group !== detailVenture.group && v.id !== detailVenture.id
    );
    return [...sameGroup, ...otherGroups].slice(0, 3);
  }, [detailVenture]);

  return (
    <div className="space-y-4">
      {/* Track Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTrack("business_plan");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "business_plan"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Nutrition Enterprise (35 Areas)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTrack("trade_fabrication");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "trade_fabrication"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Food Science Formulation</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTrack("research_secondary");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "research_secondary"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Nutrition Research</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium font-mono">
          {activeTrack === "business_plan" &&
            (detailVenture
              ? `Area #${detailVenture.number} of 35`
              : `${filteredVentures.length} of 35 areas`)}
        </div>
      </div>

      {/* Track 1: Nutrition Enterprise (35 Curated Areas) */}
      {activeTrack === "business_plan" && !detailVenture && (
        <div className="space-y-4">
          {/* Controls Strip: Search and Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by venture name, porridge, weaning, clinic, kefir, honey..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Capital Filter Pills */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden sm:inline">Capital:</span>
              {(["ALL", "Low", "Medium", "High"] as const).map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setSelectedCapital(cap)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedCapital === cap
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cap === "ALL" ? "All Tiers" : cap}
                </button>
              ))}
            </div>
          </div>

          {/* Group Tabs Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(Object.keys(GROUP_LABELS) as GroupFilter[]).map((groupKey) => {
              const isActive = selectedGroup === groupKey;
              return (
                <button
                  key={groupKey}
                  type="button"
                  onClick={() => setSelectedGroup(groupKey)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#087f8c] text-white shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {GROUP_LABELS[groupKey]}
                </button>
              );
            })}
          </div>

          {/* Opportunity cards */}
          {filteredVentures.length === 0 ? (
            <div className="bp-card border-dashed p-8 text-center">
              <p className="text-xs font-semibold text-slate-700">No project areas match your search</p>
              <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("ALL");
                  setSelectedCapital("ALL");
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f5f5] px-3 py-1.5 text-xs font-semibold text-[#087f8c] hover:bg-teal-100 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredVentures.map((venture) => {
                const capitalBadgeColor =
                  venture.capitalTier === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : venture.capitalTier === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";
                const visual = GROUP_VISUALS[venture.group];
                const CategoryIcon = visual.Icon;
                const palette = getCanvasPalette(venture.id || venture.number);

                return (
                  <article
                    key={venture.id}
                    className={`group flex min-w-0 flex-col justify-between rounded-lg border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden ${palette.hoverBorder}`}
                  >
                    <div>
                      {/* 1. Canvas Signature Top Cover Banner (Dynamic Color Block) */}
                      <div
                        className={`relative h-32 sm:h-36 w-full bg-gradient-to-br ${palette.bgGradient} p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
                        onClick={() => setDetailVenture(venture)}
                      >
                        {/* Canvas Grid Dot Mesh Watermark */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                        {/* Top Ribbon on Banner: Area Number + Canvas 3-Dots Action Button */}
                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-xs text-[10px] font-bold text-white tracking-wider uppercase border border-white/20">
                            <CategoryIcon className="h-3 w-3" />
                            <span>Area #{venture.number}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailVenture(venture);
                            }}
                            title="View Course Details"
                            className={`h-7 w-7 rounded-full ${palette.circleMenuBg} flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer border border-white/25`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Bottom Tag on Banner */}
                        <div className="relative z-10">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 drop-shadow-xs block">
                            {venture.groupName}
                          </span>
                        </div>
                      </div>

                      {/* 2. Canvas Course Card Body — Minimalist & High-End */}
                      <div className="p-3.5 sm:p-4 space-y-1">
                        {/* Colored Course / Category Code (Canvas Signature) */}
                        <span
                          style={{ color: palette.accentHex }}
                          className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate block"
                        >
                          KNEC {level === "craft" ? "CRAFT" : "DIPLOMA"} · {venture.archetype.replace("_", " ")}
                        </span>

                        {/* Course Title */}
                        <h4
                          onClick={() => setDetailVenture(venture)}
                          className="font-bold text-[13.5px] sm:text-[14.5px] leading-snug text-slate-900 group-hover:text-[#087f8c] transition-colors cursor-pointer line-clamp-2"
                        >
                          {venture.title}
                        </h4>

                        {/* Institution / Curriculum Subtitle (Canvas Signature) */}
                        <p className="text-[11.5px] text-slate-500 truncate pt-0.5">
                          {venture.groupName} · TVET Standard
                        </p>
                      </div>
                    </div>

                    {/* 3. Canvas Bottom Utility Tray (Announcements / Files / Launch) */}
                    <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="KNEC Word (.docx) & PDF Manuscript"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="Financial Schedules, Cashflow & Break-even"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="KNEC Examination Syllabus & Rubric"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <Folder className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1 py-0.5"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenVentureModal(venture)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                          style={{ backgroundColor: palette.accentHex }}
                        >
                          <span>Select</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Venture Details View */}
      {activeTrack === "business_plan" && detailVenture && (
        <div className="space-y-5">
          {/* Top Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <nav className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">TVET Hub</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              <button
                type="button"
                onClick={() => setDetailVenture(null)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Project Studio
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-md">
                {detailBusinessName}
              </span>
            </nav>
            <button
              type="button"
              onClick={() => setDetailVenture(null)}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All 35 project areas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-5">
              {/* Main Product/Studio Card (Mirrors Marketplace Details Page 1:1) */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="h-1 bg-gradient-to-r from-[#087f8c] via-teal-500 to-amber-400" />
                <div className="grid gap-6 p-5 md:grid-cols-[260px_1fr]">
                  {/* Left Column: Aspect [3/4] Dossier Cover + Standard 5-Chapter Dossier to fill hanging space */}
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-teal-500/30 bg-gradient-to-br from-[#0c8ea0] via-[#087f8c] to-[#045963] shrink-0">
                      <div
                        className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${detailPalette?.bgGradient || "from-[#0c8ea0] via-[#087f8c] to-[#045963]"} p-4 text-white flex flex-col justify-between select-none shadow-inner`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/30 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
                        <div className="absolute inset-2 rounded border border-white/25 pointer-events-none" />

                        <div className="relative z-10 text-center pt-1">
                          <span className="inline-block text-[9.5px] font-bold tracking-[0.24em] uppercase !text-amber-300 drop-shadow-xs border-b border-amber-300/40 pb-0.5">
                            BUSINESS PLAN
                          </span>
                        </div>

                        <div className="relative z-10 my-auto text-center px-2 py-1">
                          <p className="text-[13.5px] sm:text-[14px] font-bold tracking-tight !text-white line-clamp-3 leading-snug drop-shadow-sm font-sans">
                            {detailBusinessName}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[8.5px] font-semibold tracking-wider uppercase !text-white border border-white/30 shadow-2xs">
                            {level === "craft" ? "Craft Certificate" : "Diploma"}
                          </span>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-[8px] font-mono !text-teal-100 px-1 border-t border-white/20 pt-1 font-semibold">
                          <span className="tracking-wider uppercase">KNEC Series</span>
                          <span className="tracking-widest uppercase">Area #{detailVenture.number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gap Filler: Standard 5-Chapter Business Plan Dossier */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5 mb-2">
                        <span className="uppercase tracking-wider text-[10px] text-slate-500 font-bold">Standard 5-Chapter Dossier</span>
                        <span className="font-mono text-[10px] text-[#087f8c] font-bold">5 Chapters</span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#087f8c] text-[10px] shrink-0">Ch. 1</span>
                            <span className="font-semibold text-slate-800 leading-tight">Business Description</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug pl-4 mt-0.5">
                            Form of ownership, business name justification, mission, vision, location evaluation, and primary products/services.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#087f8c] text-[10px] shrink-0">Ch. 2</span>
                            <span className="font-semibold text-slate-800 leading-tight">Marketing & Sales Strategy</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug pl-4 mt-0.5">
                            Customer segmentation, market share analysis, competitor strengths & weaknesses, pricing strategy, distribution, and advertising plan.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#087f8c] text-[10px] shrink-0">Ch. 3</span>
                            <span className="font-semibold text-slate-800 leading-tight">Organization & Management</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug pl-4 mt-0.5">
                            Organizational chart, key personnel requirements, duties, staff recruitment, statutory licenses (single business permit, KEBS/public health), and remuneration.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#087f8c] text-[10px] shrink-0">Ch. 4</span>
                            <span className="font-semibold text-slate-800 leading-tight">Operational & Production Plan</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug pl-4 mt-0.5">
                            Production process flow, machinery & equipment schedule, raw materials schedule, facility layout, waste management, and quality control.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#087f8c] text-[10px] shrink-0">Ch. 5</span>
                            <span className="font-semibold text-slate-800 leading-tight">Financial Schedule & 3-Yr Projections</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug pl-4 mt-0.5">
                            Pre-operational expenses, working capital estimation, 3-year cash flow projections, pro-forma income statement, pro-forma balance sheet, and break-even calculation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Un-decorated Academic Metadata & Actions */}
                  <div className="flex min-w-0 flex-col font-sans">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#007185]">
                        KNEC {level === "craft" ? "Craft Certificate" : "Diploma"}
                      </span>
                      <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-[#565959]">
                        {detailVenture.groupName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007600] ml-auto">
                        <CheckCircle2 className="h-3 w-3" /> Area #{detailVenture.number} · Available in Studio
                      </span>
                    </div>

                    <h1 className="mt-3 text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-[#0f1111]">
                      {detailBusinessName}
                    </h1>

                    <p className="mt-1.5 text-xs text-[#565959]">
                      Curricular Standard · <span className="text-[#007185] font-medium">{detailVenture.tagline}</span>
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#565959]">
                      <span className="inline-flex items-center gap-1 text-[#565959]">
                        <FileText className="h-3.5 w-3.5 text-slate-400" /> 5 KNEC Chapters
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#565959]">
                        <Calculator className="h-3.5 w-3.5 text-slate-400" /> 3-Year Financial Schedule
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#565959]">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Word (.docx) & PDF Export
                      </span>
                    </div>

                    {/* Brief description: Plain, un-decorated academic prose */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#565959]">
                        Brief description
                      </h2>
                      <div className="mt-2 whitespace-pre-line text-sm leading-6 text-[#0f1111] space-y-2.5">
                        <p>
                          <strong className="font-semibold text-slate-900">The Problem Solved: </strong>
                          {ventureNarrative?.problemSolved}
                        </p>
                        <p>
                          <strong className="font-semibold text-slate-900">Justification & Market Gap: </strong>
                          {ventureNarrative?.justificationGap}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-[#565959]">
                          Est. Capital Requirement
                        </span>
                        <span className="font-mono text-lg font-bold text-slate-900">
                          KES {formatKES(detailVenture.estimatedCapitalKES.min)} – {formatKES(detailVenture.estimatedCapitalKES.max)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenVentureModal(detailVenture)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                      >
                        <span>Select & Launch Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            {/* Aside Column (Sticky, 320px) */}
            <aside className="space-y-4 xl:sticky xl:top-20 h-fit">
              {/* Card 1: What's Included (Mirrors Marketplace Details Aside 1:1) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900">What’s included</h2>
                </div>
                <dl className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Resource</dt>
                    <dd className="text-right font-medium text-slate-900">Business Plan Studio</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Examination</dt>
                    <dd className="text-right font-medium text-slate-900">
                      KNEC {level === "craft" ? "Craft Certificate" : "Diploma"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">TVET Field</dt>
                    <dd className="text-right font-medium text-slate-900 truncate max-w-[160px]">
                      {detailVenture.groupName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Capital Tier</dt>
                    <dd className="text-right font-medium text-slate-900">{detailVenture.capitalTier}</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Primary Product</dt>
                    <dd className="text-right font-medium text-slate-900 truncate max-w-[160px]">
                      {detailVenture.defaultSpecs.primaryProduct || detailBusinessName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Unit Economics</dt>
                    <dd className="text-right font-medium text-slate-900">
                      KES {formatKES(detailUnitPrice)} (~{detailGrossMargin}%)
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Manuscript</dt>
                    <dd className="text-right font-medium text-slate-900">5 Chapters (Word + PDF)</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Financials</dt>
                    <dd className="text-right font-medium text-slate-900">3-Year Cash Flow</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => handleOpenVentureModal(detailVenture)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#087f8c] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#076c77] shadow-xs cursor-pointer"
                >
                  <span>Select This Area</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailVenture(null)}
                  className="mt-2.5 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  ← Back to all 35 areas
                </button>
              </div>

              {/* Card 2: Related Project Areas (Utilizes hanging sidebar space) */}
              {relatedVentures.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-teal-50 p-2 text-[#087f8c]">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">Related Project Areas</h2>
                        <p className="text-[11px] text-slate-500">{detailVenture.groupName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-slate-400">TVET Series</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {relatedVentures.map((item) => {
                      const itemTitle = item.defaultSpecs.businessName || item.title;
                      const palette = getCanvasPalette(item.id || item.number);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setDetailVenture(item);
                            if (typeof window !== "undefined") {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="w-full text-left py-2.5 group flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50/70 -mx-1 px-1 rounded-md"
                        >
                          <div
                            className={`h-8 w-8 rounded shrink-0 flex items-center justify-center text-white text-[10px] font-mono font-bold bg-gradient-to-br ${palette.bgGradient}`}
                          >
                            #{item.number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#087f8c] line-clamp-1 transition-colors">
                              {itemTitle}
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              Est. KES {formatKES(item.estimatedCapitalKES.min)} · {item.capitalTier}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* Track 2: Food Science Formulation */}
      {activeTrack === "trade_fabrication" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              <FlaskConical className="h-4 w-4" />
              <span>Laboratory Formulation & Proximate Analysis</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Food Science Formulation Track
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conduct recipe optimization, proximate compositional analysis (moisture, ash, crude protein, lipid, fiber, carbohydrate), and 9-point Hedonic sensory evaluation following KNEC trade test procedures.
            </p>
            <div className="pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLaunchCustomTrack("trade_fabrication")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Start Food Science Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track 3: Nutrition Research */}
      {activeTrack === "research_secondary" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              <LineChart className="h-4 w-4" />
              <span>Secondary Epidemiology & Survey Analysis</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Nutrition Research Track
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perform rigorous secondary data analysis utilizing KDHS, KNBS census data, or MOH nutrition surveillance surveys. Includes cross-tabulation, prevalence rates, and public health policy recommendations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLaunchCustomTrack("research_secondary")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Start Nutrition Research Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Launch Modal */}
      {selectedVenture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">
                    Area #{selectedVenture.number}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{selectedVenture.groupName}</span>
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900 tracking-tight">
                  {selectedVenture.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLaunchVenture} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formAdmissionNumber}
                    onChange={(e) => setFormAdmissionNumber(e.target.value)}
                    placeholder="e.g. 24/09123"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification Level <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as "craft" | "diploma")}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="diploma">Diploma</option>
                    <option value="craft">Certificate (Craft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Enterprise Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  placeholder="e.g. Afya Bora Nutri-Flour Enterprises"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Geographic Anchoring */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Town / Market <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTownOrMarket}
                    onChange={(e) => setFormTownOrMarket(e.target.value)}
                    placeholder="e.g. Juja, Thika, Eldoret"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target County <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCounty}
                    onChange={(e) => setFormCounty(e.target.value)}
                    placeholder="e.g. Kiambu, Nairobi, Nakuru"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Academic Single-Line Consent */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formPrivacyConsent}
                    onChange={(e) => setFormPrivacyConsent(e.target.checked)}
                    required
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>I confirm these parameters for KNEC examination compliance.</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Project Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
